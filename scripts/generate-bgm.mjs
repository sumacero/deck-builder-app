// 戦闘 BGM を波形から合成して assets/music/*.wav に書き出す。
// 実行: npm run bgm
//
// 3 曲ともニ短調で、共通のモチーフ「レ・ファ・ミ・ラ」(D-F-E-A) を含む。曲の長さは A < B < C。
// - battle-normal: ゆっくり静かに、単調な旋律の繰り返し。モチーフをベルで 1 音ずつ置くように。
// - battle-elite : 中くらいのテンポ。イントロ → 本編 → サビ。モチーフを 8 分音符で軽く刻む。
// - battle-boss  : 静かな前奏 → A メロ → B メロ → サビ。速く緊迫し、モチーフを連打のリフや
//                  引き伸ばした形で鳴らす。
// 各曲はループ再生される前提で、曲末の余韻は曲頭に回り込ませてつなぎ目を目立たなくしている。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, toWav } from './wav.mjs';

const SAMPLE_RATE = 22050;
const PEAK = 0.85;
const TAU = 2 * Math.PI;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'music');

// ===== 音名 =====

const PITCH_CLASS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

/** 'A4' → 440 のように音名を周波数にする。 */
function frequency(name) {
  const match = /^([A-G][#b]?)(\d)$/.exec(name);
  if (!match) throw new Error(`bad note: ${name}`);
  const midi = PITCH_CLASS[match[1]] + (Number(match[2]) + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** 音名を semitones 半音ずらす（-12 で 1 オクターブ下）。 */
function transpose(name, semitones) {
  const midi = Math.round(69 + 12 * Math.log2(frequency(name) / 440)) + semitones;
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** 旋律の音をすべて octaves オクターブずらす（重ねて厚みを出す用）。 */
const shiftPhrase = (text, octaves) => text.replace(/(\d):/g, (_, o) => `${Number(o) + octaves}:`);

/** 'D5:1 F5:0.5 -:1' を [[音名|null, 拍数], ...] にする。'|' は小節線で読み飛ばす。 */
function parsePhrase(text) {
  return text
    .split(/\s+/)
    .filter((token) => token && token !== '|')
    .map((token) => {
      const [name, beats] = token.split(':');
      return [name === '-' ? null : name, Number(beats)];
    });
}

/** 'D2: D3 A3 C4 > A1: A2 E3' を [{ root, tones, beats }] にする。'>' で 1 小節を等分する。 */
function parseBar(text) {
  const halves = text.split('>');
  return halves.map((half) => {
    const [root, tones] = half.split(':');
    return { root: root.trim(), tones: tones.trim().split(/\s+/), beats: 4 / halves.length };
  });
}

// ===== 波形の部品 =====

let noiseSeed = 4242;
const noise = () => {
  noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff;
  return noiseSeed / 0x3fffffff - 1;
};

const sine = (phase) => Math.sin(TAU * phase);
const square = (phase) => (phase % 1 < 0.5 ? 1 : -1);
const saw = (phase) => 2 * (phase % 1) - 1;
const triangle = (phase) => 1 - 4 * Math.abs((phase % 1) - 0.5);

const oscillator = (wave) => {
  let phase = 0;
  return (hz) => {
    phase += hz / SAMPLE_RATE;
    return wave(phase);
  };
};

const lowpass = () => {
  let y = 0;
  return (x, alpha) => (y += alpha * (x - y));
};

/** 鳴らしている間は 1、dur を過ぎたら release 秒かけて 0 へ。 */
const gate = (t, dur, attack, release) =>
  Math.min(1, t / attack) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / release));

/** seconds 秒ぶんの音を sample(経過秒) で作る。 */
function renderNote(seconds, sample) {
  const out = new Float32Array(Math.ceil(seconds * SAMPLE_RATE));
  for (let i = 0; i < out.length; i++) out[i] = sample(i / SAMPLE_RATE);
  return out;
}

/** 少し遅れて揺れ始めるビブラート。 */
const vibrato = (t, rate, depth) => 1 + depth * Math.min(1, t / 0.3) * Math.sin(TAU * rate * t);

// ===== 楽器（周波数と長さ[秒]から 1 音を作る） =====

const INSTRUMENTS = {
  /** 静かなベル。倍音が先に消えて柔らかく残る。 */
  bell: (f, dur) =>
    renderNote(dur + 1.6, (t) => {
      const env = gate(t, dur, 0.004, 1.6) * Math.exp(-t * 1.6);
      return env * (sine(f * t) + 0.3 * sine(2 * f * t) * Math.exp(-t * 3) + 0.08 * sine(3.01 * f * t) * Math.exp(-t * 5));
    }),

  /** エレピ風の丸い分散和音用。 */
  softKey: (f, dur) =>
    renderNote(dur + 0.9, (t) => {
      const env = gate(t, dur, 0.006, 0.9) * Math.exp(-t * 2.4);
      return env * (sine(f * t) + 0.15 * sine(2 * f * t) * Math.exp(-t * 4));
    }),

  /** ゆっくり立ち上がる背景の和音。 */
  pad: (f, dur) => {
    const a = oscillator(triangle);
    const b = oscillator(triangle);
    const lp = lowpass();
    return renderNote(dur + 1.2, (t) => lp((a(f * 0.997) + b(f * 1.003)) * gate(t, dur, 0.7, 1.2), 0.08));
  },

  /** 低く柔らかいベース。 */
  subBass: (f, dur) =>
    renderNote(dur + 0.4, (t) => gate(t, dur, 0.03, 0.4) * Math.exp(-t * 0.35) * (sine(f * t) + 0.2 * sine(2 * f * t))),

  /** 三角波のリード。エリート戦の主旋律。 */
  triLead: (f, dur) => {
    const osc = oscillator(triangle);
    return renderNote(dur + 0.2, (t) => {
      const env = gate(t, dur, 0.015, 0.18) * (0.75 + 0.25 * Math.exp(-t * 6));
      return osc(f * vibrato(t, 5, 0.004)) * env;
    });
  },

  /** 短く刻むパルスベース。 */
  pulseBass: (f, dur) => {
    const osc = oscillator((phase) => (phase % 1 < 0.3 ? 1 : -1));
    const lp = lowpass();
    return renderNote(dur + 0.06, (t) => lp(osc(f), 0.12) * gate(t, dur, 0.004, 0.06) * Math.exp(-t * 3));
  },

  /** 矩形波のリード。ボス戦の主旋律。 */
  squareLead: (f, dur) => {
    const osc = oscillator(square);
    const lp = lowpass();
    return renderNote(dur + 0.1, (t) => {
      const env = gate(t, dur, 0.008, 0.08) * (0.8 + 0.2 * Math.exp(-t * 8));
      return lp(osc(f * vibrato(t, 6, 0.006)), 0.3) * env;
    });
  },

  /** フィルターが閉じていくノコギリ波ベース。 */
  sawBass: (f, dur) => {
    const osc = oscillator(saw);
    const lp = lowpass();
    return renderNote(dur + 0.04, (t) => lp(osc(f), 0.06 + 0.3 * Math.exp(-t * 25)) * gate(t, dur, 0.003, 0.04));
  },

  /** 厚みのある弦楽器風の和音。 */
  strings: (f, dur) => {
    const oscs = [0.995, 1, 1.005].map(() => oscillator(saw));
    const lp = lowpass();
    return renderNote(dur + 0.5, (t) => {
      const raw = oscs[0](f * 0.995) + oscs[1](f) + oscs[2](f * 1.005);
      return lp(raw / 3, 0.07) * gate(t, dur, 0.2, 0.5);
    });
  },

  /** 金管風の短い和音のアタック。 */
  brassStab: (f, dur) => {
    const a = oscillator(saw);
    const b = oscillator(square);
    const lp = lowpass();
    return renderNote(dur + 0.15, (t) =>
      lp(a(f) * 0.7 + b(f * 1.002) * 0.3, 0.05 + 0.25 * Math.exp(-t * 10)) * gate(t, dur, 0.01, 0.15) * Math.exp(-t * 2),
    );
  },
};

// ===== 打楽器 =====

const DRUMS = {
  kick: () => {
    const osc = oscillator(sine);
    return renderNote(0.35, (t) => osc(45 + 90 * Math.exp(-t * 30)) * Math.exp(-t * 9));
  },
  snare: () => {
    const lp = lowpass();
    return renderNote(0.25, (t) => {
      const n = noise();
      return (n - lp(n, 0.3)) * 0.8 * Math.exp(-t * 18) + sine(185 * t) * 0.5 * Math.exp(-t * 30);
    });
  },
  hat: () => {
    const lp = lowpass();
    return renderNote(0.08, (t) => {
      const n = noise();
      return (n - lp(n, 0.5)) * Math.exp(-t * 70);
    });
  },
  /** 時計の秒針のような小さな音。 */
  tick: () => {
    const lp = lowpass();
    return renderNote(0.05, (t) => {
      const n = noise();
      return sine(2200 * t) * Math.exp(-t * 90) + (n - lp(n, 0.5)) * 0.3 * Math.exp(-t * 120);
    });
  },
  timpani: () => {
    const lp = lowpass();
    return renderNote(1.5, (t) => {
      const f = frequency('D2') * (1 + 0.04 * Math.exp(-t * 20));
      return (sine(f * t) + 0.5 * sine(1.5 * f * t) * Math.exp(-t * 4)) * Math.exp(-t * 2.5) + lp(noise(), 0.3) * 0.4 * Math.exp(-t * 40);
    });
  },
  crash: () => {
    const lp = lowpass();
    return renderNote(2, (t) => {
      const n = noise();
      return (n - lp(n, 0.6)) * Math.exp(-t * 2.5) * Math.min(1, t / 0.003);
    });
  },
};

// ===== トラック（1 曲ぶんのバッファ） =====

function createTrack({ bpm, bars }) {
  const secondsPerBeat = 60 / bpm;
  const length = Math.round(bars * 4 * secondsPerBeat * SAMPLE_RATE);
  const dry = new Float32Array(length);
  const send = new Float32Array(length);
  const drumCache = new Map();

  /** beat 拍目から samples を重ねる。ループ末尾からはみ出た余韻は先頭に回り込む。 */
  const add = (beat, samples, volume, sendLevel = 0) => {
    const start = Math.round(beat * secondsPerBeat * SAMPLE_RATE);
    for (let i = 0; i < samples.length; i++) {
      const j = (start + i) % length;
      dry[j] += samples[i] * volume;
      send[j] += samples[i] * volume * sendLevel;
    }
  };

  const note = (instrument, beat, name, beats, volume, sendLevel) =>
    add(beat, INSTRUMENTS[instrument](frequency(name), beats * secondsPerBeat), volume, sendLevel);

  return {
    bars,
    length,
    dry,
    send,
    note,
    /** 旋律を startBeat から並べる。 */
    phrase(instrument, startBeat, text, volume, sendLevel = 0) {
      let beat = startBeat;
      for (const [name, beats] of parsePhrase(text)) {
        if (name) note(instrument, beat, name, beats, volume, sendLevel);
        beat += beats;
      }
    },
    chord(instrument, beat, names, beats, volume, sendLevel = 0) {
      names.forEach((name) => note(instrument, beat, name, beats, volume / names.length, sendLevel));
    },
    drum(kind, beat, volume, sendLevel = 0) {
      if (!drumCache.has(kind)) drumCache.set(kind, DRUMS[kind]());
      add(beat, drumCache.get(kind), volume, sendLevel);
    },
  };
}

/** startBar 小節目からのコード表を [{ beat, root, tones, beats }] に展開する。 */
function expandChords(bars, startBar = 0) {
  const out = [];
  bars.forEach((text, barIndex) => {
    let beat = (startBar + barIndex) * 4;
    for (const part of parseBar(text)) {
      out.push({ ...part, beat });
      beat += part.beats;
    }
  });
  return out;
}

// ===== エフェクト（ループの継ぎ目も自然になるよう、すべて循環バッファで処理する） =====

/** フィードバック付きディレイ。余韻がループ 1 周より短い前提で、2 周回して定常状態にする。 */
function comb(input, seconds, feedback) {
  const len = input.length;
  const d = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < len; i++) {
      const j = (i - d + len) % len;
      out[i] = (input[j] + out[j]) * feedback;
    }
  }
  return out;
}

function lowpassLoop(input, alpha) {
  const out = new Float32Array(input.length);
  let y = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < input.length; i++) out[i] = y += alpha * (input[i] - y);
  }
  return out;
}

/** センド成分に、こだま（エコー）と部屋の響き（簡易リバーブ）をかけて戻す。 */
function mixdown(track, { echoSeconds, echoFeedback, echoLevel, reverbLevel, tone = 1, drive = 0 }) {
  const echo = comb(track.send, echoSeconds, echoFeedback);
  const rooms = [0.0297, 0.0371, 0.0411, 0.0437].map((s) => comb(track.send, s, 0.82));
  const reverb = lowpassLoop(
    track.send.map((_, i) => rooms.reduce((sum, room) => sum + room[i], 0) / rooms.length),
    0.25,
  );
  let out = track.dry.map((s, i) => s + echo[i] * echoLevel + reverb[i] * reverbLevel);
  if (tone < 1) out = lowpassLoop(out, tone);
  if (drive > 0) {
    const peak = out.reduce((m, s) => Math.max(m, Math.abs(s)), 0) || 1;
    out = out.map((s) => Math.tanh((s / peak) * (1 + drive)));
  }
  return normalize(out, PEAK);
}

// ===== 曲 =====

/** 3 曲共通のモチーフ「レ・ファ・ミ・ラ」。octave はレの高さ。 */
const motif = (octave, rhythm) =>
  [`D${octave}`, `F${octave}`, `E${octave}`, `A${octave - 1}`].map((name, i) => `${name}:${rhythm[i]}`).join(' ');

/** A: 通常戦闘「静寂の書庫」。76 BPM。分散和音の上にベルがぽつりぽつりと置かれる。 */
function battleNormal() {
  const track = createTrack({ bpm: 76, bars: 16 });
  const chords = expandChords([
    'D2: D3 A3 C4 E4 F4',
    'A#1: A#2 F3 A3 D4',
    'G1: G2 D3 F3 A3 A#3',
    'A1: A2 E3 G3 D4 > A1: A2 E3 G3 C#4',
    'D2: D3 A3 C4 E4 F4',
    'A#1: A#2 F3 A3 D4',
    'G1: G2 D3 F3 A#3',
    'A1: A2 E3 G3 D4 > A1: A2 E3 G3 C#4',
    'F1: F2 C3 E3 A3',
    'E1: E2 G2 C3 E3 G3',
    'D2: D3 A3 C4 F4',
    'A#1: A#2 F3 A3 D4',
    'G1: G2 D3 F3 A#3',
    'E2: E2 A#2 D3 G3',
    'A1: A2 E3 G3 D4',
    'A1: A2 E3 G3 C#4',
  ]);
  for (const { beat, root, tones, beats } of chords) {
    track.note('subBass', beat, root, beats, 0.5);
    track.chord('pad', beat, tones, beats, 0.35);
    // 上って下りる 8 分音符の分散和音。
    const order = [...tones, ...tones.slice(1, -1).reverse()];
    for (let step = 0; step < beats * 2; step++) {
      track.note('softKey', beat + step / 2, order[step % order.length], 0.5, 0.18, 0.4);
    }
  }
  for (let beat = 0; beat < track.bars * 4; beat++) track.drum('tick', beat, beat % 2 === 0 ? 0.05 : 0.03);

  track.phrase(
    'bell',
    0,
    [
      motif(5, [1, 1, 2, 4]),
      'A#4:1 A4:1 G4:1 F4:1 | E4:3 -:1',
      'D5:1 F5:1 E5:2 | F5:1 D5:1 A4:2',
      'A#4:1 D5:1 G5:1.5 F5:0.5 | E5:3 -:1',
      '-:1 A4:1 C5:1 F5:1 | E5:2 G5:2',
      motif(5, [1, 1, 2, 4]),
      'G4:1 A#4:1 D5:1 F5:1 | E5:2 D5:1 A#4:1',
      'D5:2 E5:2 | C#5:3 -:1',
    ].join(' '),
    0.5,
    0.6,
  );
  return mixdown(track, { echoSeconds: (60 / 76) * 0.75, echoFeedback: 0.35, echoLevel: 0.5, reverbLevel: 0.8, tone: 0.35 });
}

/** 8 分音符でオクターブを行き来するベース。 */
function pulseBassLine(track, chords, volume) {
  for (const { beat, root, beats } of chords) {
    for (let step = 0; step < beats * 2; step++) {
      track.note('pulseBass', beat + step / 2, step % 2 === 0 ? root : transpose(root, 12), 0.45, volume);
    }
  }
}

/** 小節 bar の終わりに、だんだん強くなるスネアの連打を入れる（次の部分への助走）。 */
function snareFill(track, bar, fromBeat, step, from, to) {
  const count = Math.round((4 - fromBeat) / step);
  for (let i = 0; i < count; i++) {
    track.drum('snare', bar * 4 + fromBeat + i * step, from + ((to - from) * i) / Math.max(1, count - 1), 0.2);
  }
}

/**
 * B: エリート戦闘「試練の回廊」。104 BPM、28 小節。
 * イントロ（4）で引き伸ばしたモチーフを静かに鳴らし、本編（16）で 8 分のモチーフ、サビ（8）で高い音域に上げて盛り上げる。
 */
function battleElite() {
  const track = createTrack({ bpm: 104, bars: 28 });
  const INTRO = 0;
  const VERSE = 4;
  const CHORUS = 20;

  // ---- イントロ ----
  const intro = expandChords(['D2: D4 F4 A4', 'A#1: D4 F4 A#4', 'C2: C4 E4 G4', 'A1: C#4 E4 A4'], INTRO);
  for (const { beat, root, tones, beats } of intro) {
    track.chord('pad', beat, tones, beats, 0.4, 0.4);
    for (let step = 0; step < beats; step++) track.note('pulseBass', beat + step, root, 0.9, 0.3);
  }
  for (let bar = INTRO; bar < VERSE; bar++) {
    for (let beat = 0; beat < 4; beat++) track.drum('hat', bar * 4 + beat, 0.06);
    if (bar >= INTRO + 2) [0, 2].forEach((beat) => track.drum('kick', bar * 4 + beat, 0.4));
  }
  snareFill(track, VERSE - 1, 2, 0.5, 0.08, 0.3);
  track.phrase('triLead', INTRO * 4, `${motif(5, [2, 2, 4, 4])} -:4`, 0.3, 0.7);

  // ---- 本編 ----
  const verse = expandChords([
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'C2: C4 E4 G4',
    'A1: C#4 E4 A4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'G1: D4 G4 A#4',
    'A1: C#4 E4 G4',
    'A#1: D4 F4 A#4',
    'C2: C4 E4 G4',
    'D2: D4 F4 A4',
    'C2: C4 F4 A4',
    'A#1: D4 F4 A#4',
    'G1: D4 G4 A#4',
    'A1: C#4 E4 A4',
    'A1: C#4 E4 G4',
  ], VERSE);
  for (const { beat, tones, beats } of verse) track.chord('pad', beat, tones, beats, 0.45, 0.3);
  pulseBassLine(track, verse, 0.4);
  for (let bar = VERSE; bar < CHORUS; bar++) {
    const b = bar * 4;
    track.drum('kick', b, 0.55);
    track.drum('kick', b + 2, 0.5);
    if (bar % 4 === 3) track.drum('kick', b + 3.5, 0.35);
    track.drum('snare', b + 1, 0.22, 0.3);
    track.drum('snare', b + 3, 0.25, 0.3);
    for (let step = 0; step < 8; step++) track.drum('hat', b + step / 2, step % 2 === 0 ? 0.12 : 0.07);
  }
  snareFill(track, CHORUS - 1, 3, 0.25, 0.15, 0.35);

  track.phrase(
    'triLead',
    VERSE * 4,
    [
      motif(5, [0.5, 0.5, 1, 2]),
      'A#4:1 D5:1 F5:1 E5:0.5 D5:0.5',
      'E5:1.5 G5:0.5 C5:2',
      'C#5:1 E5:1 A5:2',
      motif(5, [0.5, 0.5, 1, 2]),
      'A#4:0.5 C5:0.5 D5:1 F5:1 A5:1',
      'G5:1.5 F5:0.5 D5:1 A#4:1',
      'A4:1 C#5:1 E5:2',
      'F5:0.5 D5:0.5 A#4:1 D5:1 F5:1',
      'E5:0.5 G5:0.5 C6:1 G5:1 E5:1',
      motif(5, [0.5, 0.5, 1, 2]),
      'F5:1 E5:1 D5:1 C5:1',
      'A#4:1.5 D5:0.5 F5:1 A#5:1',
      'A5:1 G5:1 F5:1 D5:1',
      'E5:2 C#5:1 E5:1',
      'A5:2 G5:0.5 F5:0.5 E5:1',
    ].join(' '),
    0.42,
    0.45,
  );

  // ---- サビ: 音域を上げ、ドラムを詰めて盛り上げる。3 小節目に高いモチーフ ----
  const chorus = expandChords([
    'A#1: D4 F4 A#4',
    'C2: C4 E4 G4',
    'D2: D4 F4 A4',
    'A1: C#4 E4 A4',
    'A#1: D4 F4 A#4',
    'C2: C4 E4 G4',
    'A1: C#4 E4 A4',
    'A1: C#4 E4 G4',
  ], CHORUS);
  for (const { beat, tones, beats } of chorus) {
    track.chord('pad', beat, tones, beats, 0.55, 0.35);
    track.chord('pad', beat, tones.map((n) => transpose(n, 12)), beats, 0.25, 0.35);
  }
  pulseBassLine(track, chorus, 0.5);
  for (let bar = CHORUS; bar < track.bars; bar++) {
    const b = bar * 4;
    for (let beat = 0; beat < 4; beat++) track.drum('kick', b + beat, 0.55);
    track.drum('snare', b + 1, 0.3, 0.3);
    track.drum('snare', b + 3, 0.32, 0.3);
    for (let step = 0; step < 8; step++) track.drum('hat', b + step / 2, step % 2 === 0 ? 0.14 : 0.09);
    if ((bar - CHORUS) % 4 === 0) track.drum('crash', b, 0.2, 0.3);
  }
  snareFill(track, track.bars - 1, 3, 0.25, 0.1, 0.25);
  const chorusMelody = [
    'F5:1.5 A#5:0.5 A5:1 F5:1',
    'G5:1.5 E5:0.5 C6:2',
    motif(6, [1, 1, 2, 4]),
    'F5:1 A#5:1 D6:2',
    'E6:1.5 D6:0.5 C6:1 G5:1',
    'A5:1 C#6:1 E6:2',
    'G5:1 F5:1 E5:1 C#5:1',
  ].join(' ');
  track.phrase('triLead', CHORUS * 4, chorusMelody, 0.4, 0.45);
  track.phrase('triLead', CHORUS * 4, shiftPhrase(chorusMelody, -1), 0.2, 0.2);

  return mixdown(track, { echoSeconds: (60 / 104) * 0.75, echoFeedback: 0.3, echoLevel: 0.35, reverbLevel: 0.5, tone: 0.55 });
}

/** ノコギリ波ベースを 8 分で刻む。steps は根音からの半音（1 小節 8 個）。 */
function sawBassLine(track, chords, steps, volume) {
  for (const { beat, root, beats } of chords) {
    for (let step = 0; step < beats * 2; step++) {
      track.note('sawBass', beat + step / 2, transpose(root, steps[step % steps.length]), 0.4, volume);
    }
  }
}

/**
 * C: ボス戦闘「決戦」。144 BPM、48 小節。
 * 前奏（8）は静かにモチーフを置き、心音のようなキックで不安を募らせる。
 * A メロ（16）はモチーフを連打するリフ、B メロ（8）は 4 倍に引き伸ばしたモチーフで溜め、
 * サビ（16）はモチーフを 1 段ずつ上げて畳みかけ、最後は高音で鳴らし切って前奏へ戻る。
 */
function battleBoss() {
  const track = createTrack({ bpm: 144, bars: 48 });
  const PRELUDE = 0;
  const VERSE_A = 8;
  const VERSE_B = 24;
  const CHORUS = 32;
  const DRIVE = [0, 0, 12, 0, 0, 12, 0, 10];

  // ---- 前奏: 弦の持続音とベルのモチーフ。後半から心音とベースが入る ----
  const prelude = expandChords([
    'D2: D4 F4 A4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'A1: C#4 E4 A4',
    'D2: D4 F4 A4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'A1: C#4 E4 G4',
  ], PRELUDE);
  prelude.forEach(({ beat, root, tones, beats }, i) => {
    track.chord('strings', beat, tones, beats, 0.12, 0.5);
    if (i < 6) track.note('subBass', beat, root, beats, 0.25);
    else sawBassLine(track, [{ beat, root, beats }], [0, 0], 0.2);
  });
  track.drum('timpani', PRELUDE * 4, 0.25, 0.4);
  track.drum('timpani', (PRELUDE + 4) * 4, 0.25, 0.4);
  for (let bar = PRELUDE + 4; bar < VERSE_A; bar++) {
    [0, 2].forEach((beat) => {
      track.drum('kick', bar * 4 + beat, 0.25);
      track.drum('kick', bar * 4 + beat + 0.4, 0.15);
    });
  }
  snareFill(track, VERSE_A - 1, 0, 0.25, 0.03, 0.35);
  track.phrase('bell', PRELUDE * 4, `${motif(5, [2, 2, 4, 8])}`, 0.3, 0.6);
  track.phrase('triLead', (PRELUDE + 4) * 4, `${motif(4, [1, 1, 2, 4])} C#4:4 E4:2 A4:2`, 0.18, 0.4);

  // ---- A メロ: モチーフの連打リフを 2 回。2 回目は低い音を重ねて金管も入る ----
  const riffChords = [
    'D2: D4 F4 A4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'A1: C#4 E4 A4',
    'D2: D4 F4 A4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'A1: C#4 E4 G4',
  ];
  const verseA = expandChords([...riffChords, ...riffChords], VERSE_A);
  verseA.forEach(({ beat, tones, beats }, i) => {
    track.chord('strings', beat, tones, beats, 0.3, 0.25);
    if (i >= 8) track.chord('brassStab', beat, tones.map((n) => transpose(n, -12)), 0.75, 0.45, 0.2);
  });
  sawBassLine(track, verseA, DRIVE, 0.55);
  for (let bar = VERSE_A; bar < VERSE_B; bar++) {
    const b = bar * 4;
    for (let beat = 0; beat < 4; beat++) track.drum('kick', b + beat, 0.6);
    track.drum('snare', b + 1, 0.38, 0.25);
    track.drum('snare', b + 3, 0.38, 0.25);
    for (let step = 0; step < 8; step++) track.drum('hat', b + step / 2, step % 2 === 0 ? 0.1 : 0.06);
    if ((bar - VERSE_A) % 8 === 0) track.drum('crash', b, 0.22, 0.3);
    if (bar % 4 === 3) [3.25, 3.5, 3.75].forEach((s) => track.drum('snare', b + s, 0.22, 0.2));
  }
  const fast = [0.5, 0.5, 0.5, 0.5];
  const riff = [
    `${motif(5, fast)} ${motif(5, fast)}`,
    'D5:0.5 F5:0.5 E5:0.5 C#5:0.5 D5:2',
    `${motif(5, fast)} A#4:1 D5:1`,
    'C#5:1.5 E5:0.5 A5:2',
  ];
  const riffMelody = [...riff, ...riff.slice(0, 3), 'C#5:1 E5:1 G5:1 A#5:1'].join(' ');
  track.phrase('squareLead', VERSE_A * 4, riffMelody, 0.4, 0.2);
  track.phrase('squareLead', (VERSE_A + 8) * 4, riffMelody, 0.4, 0.2);
  track.phrase('triLead', (VERSE_A + 8) * 4, shiftPhrase(riffMelody, -1), 0.22, 0.1);

  // ---- B メロ: 引き伸ばしたモチーフ。ドラムを半分に間引いて溜める ----
  const verseB = expandChords([
    'A#1: D4 F4 A#4',
    'C2: C4 E4 G4',
    'A1: C#4 E4 A4',
    'A1: C#4 E4 G4',
    'G1: D4 G4 A#4',
    'A#1: D4 F4 A#4',
    'D#2: D#4 G4 A#4',
    'A1: C#4 E4 A4',
  ], VERSE_B);
  for (const { beat, tones, beats } of verseB) track.chord('strings', beat, tones, beats, 0.42, 0.3);
  sawBassLine(track, verseB, [0, 0, 0, 0, 0, 0, 0, 0], 0.5);
  for (let bar = VERSE_B; bar < CHORUS; bar++) {
    const b = bar * 4;
    track.drum('kick', b, 0.6);
    track.drum('kick', b + 2.5, 0.5);
    track.drum('snare', b + 2, 0.4, 0.3);
    for (let step = 0; step < 16; step++) track.drum('hat', b + step / 4, step % 4 === 0 ? 0.08 : 0.04);
    track.drum('timpani', b + 3.5, 0.3, 0.2);
  }
  snareFill(track, CHORUS - 1, 0, 0.25, 0.08, 0.45);
  track.phrase(
    'squareLead',
    VERSE_B * 4,
    [
      motif(5, [2, 2, 4, 2]),
      'C#5:1 E5:1',
      'G5:2 F5:1 E5:1',
      'D5:1 G5:1 A#5:1.5 A5:0.5',
      'F5:2 D5:1 F5:1',
      'G5:1.5 F5:0.5 D#5:2',
      'C#5:2 E5:1 A4:1',
    ].join(' '),
    0.4,
    0.25,
  );

  // ---- サビ: モチーフを畳みかけ、後半は高音でモチーフを鳴らし切る ----
  const chorus = expandChords([
    'D2: D4 F4 A4',
    'C2: C4 E4 G4',
    'A#1: D4 F4 A#4',
    'A1: C#4 E4 A4',
    'D2: D4 F4 A4',
    'C2: C4 E4 G4',
    'A#1: D4 F4 A#4',
    'A1: C#4 E4 G4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'G1: D4 G4 A#4',
    'A1: C#4 E4 A4',
    'D2: D4 F4 A4',
    'A#1: D4 F4 A#4',
    'G1: D4 G4 A#4 > A1: C#4 E4 A4',
    'A1: C#4 E4 G4',
  ], CHORUS);
  for (const { beat, tones, beats } of chorus) {
    track.chord('strings', beat, tones, beats, 0.45, 0.25);
    track.chord('brassStab', beat, tones.map((n) => transpose(n, -12)), 0.75, 0.5, 0.2);
    if (beats === 4) track.chord('brassStab', beat + 2.5, tones.map((n) => transpose(n, -12)), 0.5, 0.35, 0.2);
  }
  sawBassLine(track, chorus, DRIVE, 0.6);
  for (let bar = CHORUS; bar < track.bars; bar++) {
    const b = bar * 4;
    for (let beat = 0; beat < 4; beat++) track.drum('kick', b + beat, 0.62);
    track.drum('kick', b + 3.5, 0.4);
    track.drum('snare', b + 1, 0.42, 0.25);
    track.drum('snare', b + 3, 0.42, 0.25);
    for (let step = 0; step < 16; step++) track.drum('hat', b + step / 4, step % 2 === 0 ? 0.1 : 0.05);
    if ((bar - CHORUS) % 8 === 0) track.drum('crash', b, 0.28, 0.3);
    if ((bar - CHORUS) % 2 === 0) track.drum('timpani', b, 0.5, 0.3);
  }
  const chorusMelody = [
    `${motif(5, fast)} ${motif(5, fast)}`,
    'E5:0.5 G5:0.5 F5:0.5 C5:0.5 E5:0.5 G5:0.5 F5:0.5 C5:0.5',
    'F5:0.5 A#5:0.5 A5:0.5 D5:0.5 F5:0.5 A#5:0.5 A5:0.5 D5:0.5',
    'C#5:1 E5:1 A5:2',
    'A5:1 F5:0.5 E5:0.5 D5:2',
    'E5:1 G5:0.5 F5:0.5 E5:2',
    'D5:1 F5:1 A#5:1 A5:1',
    'G5:0.5 F5:0.5 E5:0.5 C#5:0.5 A4:2',
    motif(6, [1, 1, 1, 1]),
    'A#5:1.5 A5:0.5 F5:2',
    'G5:1 A#5:1 D6:1 C6:0.5 A#5:0.5',
    'A5:2 C#6:1 E6:1',
    'F6:1 E6:0.5 D6:0.5 A5:2',
    'A#5:1 D6:1 F6:1 E6:1',
    'D6:1 A#5:1 C#6:1 E6:1',
    'D6:0.5 C#6:0.5 A#5:0.5 G5:0.5 E5:0.5 C#5:0.5 A4:1',
  ].join(' ');
  track.phrase('squareLead', CHORUS * 4, chorusMelody, 0.4, 0.2);
  track.phrase('triLead', CHORUS * 4, shiftPhrase(chorusMelody, -1), 0.25, 0.1);

  return mixdown(track, { echoSeconds: (60 / 144) * 0.5, echoFeedback: 0.25, echoLevel: 0.3, reverbLevel: 0.4, tone: 0.7, drive: 0.6 });
}


// ===== 書き出し =====

const TRACKS = {
  'battle-normal': battleNormal,
  'battle-elite': battleElite,
  'battle-boss': battleBoss,
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, build] of Object.entries(TRACKS)) {
  const samples = build();
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
