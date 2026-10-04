// BGM 合成の共通部品（音名・楽器・打楽器・トラック・ミックス）。bgm-song.mjs と generate-bgm.mjs で使う。
import { normalize } from './wav.mjs';

export const SAMPLE_RATE = 22050;
const PEAK = 0.85;
const TAU = 2 * Math.PI;

// ===== 音名 =====

const PITCH_CLASS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

/** 'A4' → 440 のように音名を周波数にする。 */
export function frequency(name) {
  const match = /^([A-G][#b]?)(\d)$/.exec(name);
  if (!match) throw new Error(`bad note: ${name}`);
  const midi = PITCH_CLASS[match[1]] + (Number(match[2]) + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** 音名を semitones 半音ずらす（-12 で 1 オクターブ下）。 */
export function transpose(name, semitones) {
  const midi = Math.round(69 + 12 * Math.log2(frequency(name) / 440)) + semitones;
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** 旋律の音をすべて octaves オクターブずらす（重ねて厚みを出す用）。 */
export const shiftPhrase = (text, octaves) => text.replace(/(\d):/g, (_, o) => `${Number(o) + octaves}:`);

/** 'D5:1 F5:0.5 -:1' を [[音名|null, 拍数], ...] にする。'|' は小節線で読み飛ばす。 */
export function parsePhrase(text) {
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
/** 曲ごとに呼ぶと、ほかの曲の有無や順番に左右されず同じ音になる。 */
export const seedNoise = (seed) => {
  noiseSeed = seed;
};
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

  /** 主旋律用の金管。息を吹き込むように少し遅れて明るくなる。 */
  brassLead: (f, dur) => {
    const a = oscillator(saw);
    const b = oscillator(saw);
    const lp = lowpass();
    return renderNote(dur + 0.15, (t) => {
      const bright = 0.06 + 0.2 * Math.min(1, t / 0.08) * (0.6 + 0.4 * Math.exp(-t * 3));
      const v = vibrato(t, 5.5, 0.005);
      return lp(a(f * v) * 0.6 + b(f * 1.004 * v) * 0.4, bright) * gate(t, dur, 0.03, 0.15);
    });
  },

  /** ロックオルガン。倍音を足し合わせ、回転スピーカーのような揺れをかける。 */
  organ: (f, dur) =>
    renderNote(dur + 0.05, (t) => {
      const p = f * t;
      const trem = 1 + 0.08 * Math.sin(TAU * 6.5 * t);
      const tone = 0.5 * sine(p * 0.5) + sine(p) + 0.6 * sine(p * 2) + 0.4 * sine(p * 3) + 0.25 * sine(p * 4);
      const click = 0.3 * sine(p * 6) * Math.exp(-t * 20);
      return (gate(t, dur, 0.005, 0.05) * trem * (tone + click)) / 2.5;
    }),

  /** 歪ませたギターのリード。 */
  guitarLead: (f, dur) => {
    const a = oscillator(saw);
    const b = oscillator(saw);
    const pre = lowpass();
    const post = lowpass();
    return renderNote(dur + 0.12, (t) => {
      const v = vibrato(t, 5.5, 0.008);
      const driven = Math.tanh(pre(a(f * v) + b(f * 1.006 * v) * 0.8, 0.35) * 3);
      return post(driven, 0.25) * gate(t, dur, 0.006, 0.12) * 0.6;
    });
  },

  /** 歪んだギターのパワーコード（根音と 5 度）。短く刻む。 */
  powerChord: (f, dur) => {
    const a = oscillator(saw);
    const b = oscillator(saw);
    const lp = lowpass();
    return renderNote(dur + 0.05, (t) =>
      Math.tanh(lp(a(f) + b(f * 1.5) * 0.8, 0.12 + 0.2 * Math.exp(-t * 15)) * 4) * 0.5 * gate(t, dur, 0.003, 0.05),
    );
  },

  /** シンセブラス。3 本のノコギリ波を少しずつずらし、フィルターを開いて閉じる。 */
  synthBrass: (f, dur) => {
    const oscs = [0, 1, 2].map(() => oscillator(saw));
    const lp = lowpass();
    return renderNote(dur + 0.12, (t) => {
      const raw = (oscs[0](f * 0.993) + oscs[1](f) + oscs[2](f * 1.007)) / 3;
      return lp(raw, 0.08 + 0.3 * Math.min(1, t / 0.05) * Math.exp(-t * 4)) * gate(t, dur, 0.012, 0.12);
    });
  },

  /** 指ではじくようなスラップベース。 */
  slapBass: (f, dur) => {
    const osc = oscillator((phase) => (phase % 1 < 0.4 ? 1 : -1));
    const lp = lowpass();
    return renderNote(dur + 0.05, (t) => {
      const body = lp(osc(f), 0.05 + 0.5 * Math.exp(-t * 30)) + 0.3 * sine(2 * f * t) * Math.exp(-t * 20);
      return body * gate(t, dur, 0.002, 0.05) * Math.exp(-t * 2.5);
    });
  },

  /** ハープのような撥弦。分散和音の刻み用。 */
  harp: (f, dur) =>
    renderNote(dur + 1.2, (t) => {
      const env = gate(t, dur + 1, 0.002, 0.3) * Math.exp(-t * 3);
      return env * (sine(f * t) + 0.4 * sine(2 * f * t) * Math.exp(-t * 6) + 0.15 * sine(3 * f * t) * Math.exp(-t * 10));
    }),

  /** 息の音が混じる笛。 */
  flute: (f, dur) => {
    const osc = oscillator(sine);
    const lp = lowpass();
    return renderNote(dur + 0.15, (t) => {
      const breath = lp(noise(), 0.2) * 0.06 * Math.exp(-t * 4);
      return (osc(f * vibrato(t, 5, 0.006)) + 0.12 * sine(2 * f * t) + breath) * gate(t, dur, 0.04, 0.15);
    });
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
  tomHi: () => tom(220),
  tomMid: () => tom(160),
  tomLo: () => tom(110),
  bongoHi: () => renderNote(0.15, (t) => sine(520 * (1 + 0.1 * Math.exp(-t * 60)) * t) * Math.exp(-t * 30)),
  bongoLo: () => renderNote(0.2, (t) => sine(330 * (1 + 0.1 * Math.exp(-t * 60)) * t) * Math.exp(-t * 22)),
  shaker: () => {
    const lp = lowpass();
    return renderNote(0.07, (t) => {
      const n = noise();
      return (n - lp(n, 0.6)) * Math.min(1, t / 0.01) * Math.exp(-t * 60);
    });
  },
  clap: () => {
    const lp = lowpass();
    return renderNote(0.2, (t) => {
      const n = noise();
      const bursts = t < 0.03 ? Math.exp(-((t * 1000) % 10) / 3) : Math.exp(-(t - 0.03) * 25);
      return (n - lp(n, 0.4)) * bursts * 0.8;
    });
  },
};

/** 音程が落ちていくタム。 */
function tom(hz) {
  const osc = oscillator(sine);
  return renderNote(0.4, (t) => osc(hz * (1 + 0.5 * Math.exp(-t * 25))) * Math.exp(-t * 8) + noise() * 0.1 * Math.exp(-t * 60));
}

// ===== トラック（1 曲ぶんのバッファ） =====

export function createTrack({ bpm, bars }) {
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
export function expandChords(bars, startBar = 0) {
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
export function mixdown(track, { echoSeconds, echoFeedback, echoLevel, reverbLevel, tone = 1, drive = 0 }) {
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
