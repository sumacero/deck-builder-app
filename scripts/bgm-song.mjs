// 曲をデータ（コード記号・旋律・伴奏 / ベース / ドラムの型）で書いて合成する仕組み。generate-bgm-trial.mjs と generate-bgm-theme.mjs で使う。
import { createTrack, expandChords, mixdown, parsePhrase, shiftPhrase, transpose } from './bgm-engine.mjs';

// ===== コード記号 → 小節の表記 =====

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PITCH = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const QUALITY = { '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], sus4: [0, 5, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11] };
const noteName = (midi) => `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;

/** 'Em' → 'E2: E4 G4 B4'。和音は A3〜G#4 から積み、ベースは A1〜G#2 に置く。 */
function chordSymbol(symbol) {
  const match = /^([A-G][#b]?)(.*)$/.exec(symbol);
  if (!match || !(match[2] in QUALITY)) throw new Error(`bad chord: ${symbol}`);
  const pc = PITCH[match[1]];
  const top = 57 + ((pc - 9 + 12) % 12);
  const bass = 33 + ((pc - 9 + 12) % 12);
  return `${noteName(bass)}: ${QUALITY[match[2]].map((i) => noteName(top + i)).join(' ')}`;
}

/** 1 小節を 'Em' や 'C D'（半分ずつ）で書く。 */
export const bars = (...symbols) => symbols.map((bar) => bar.split(' ').map(chordSymbol).join(' > '));

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);

// ===== 主題の変奏に使う変換 =====

/** コード記号の並び（'Dm', 'F A' など）を semitones 半音ずらす。 */
export const transposeSymbols = (symbols, semitones) =>
  symbols.map((bar) =>
    bar
      .split(' ')
      .map((symbol) => {
        const [, root, quality] = /^([A-G][#b]?)(.*)$/.exec(symbol);
        return `${NOTE_NAMES[(PITCH[root] + semitones + 12) % 12]}${quality}`;
      })
      .join(' '),
  );

/** 旋律の音を semitones 半音ずらす。 */
export const transposePhrase = (text, semitones) =>
  text.replace(/([A-G][#b]?\d):/g, (_, name) => `${transpose(name, semitones)}:`);

/** 旋律の音の長さを factor 倍にする（2 で倍の長さ = 拡大形）。 */
export const stretchPhrase = (text, factor) => text.replace(/:([\d.]+)/g, (_, beats) => `:${Number(beats) * factor}`);

/** 音名ごとに置き換える（短調の旋律を同主長調にするなど）。map は { F: 'F#' } の形。 */
export const remapPhrase = (text, map) =>
  text.replace(/([A-G][#b]?)(\d):/g, (_, pc, octave) => `${map[pc] ?? pc}${octave}:`);

// ===== 伴奏・ベース・ドラムの型 =====

const COMP = {
  pad: (t, c) => t.chord('pad', c.beat, c.tones, c.beats, 0.3, 0.3),
  strings: (t, c) => t.chord('strings', c.beat, c.tones, c.beats, 0.32, 0.3),
  organ: (t, c) => t.chord('organ', c.beat, c.tones, c.beats, 0.28, 0.15),
  /** シンセブラスの裏打ち（P）。 */
  stabs: (t, c) => {
    const at = c.beats >= 4 ? [0, 1.5, 3] : [0, 1];
    at.forEach((o) => t.chord('synthBrass', c.beat + o, c.tones, 0.4, 0.36, 0.15));
  },
  /** 低い金管の和音を打ち込む（A）。 */
  brassHits: (t, c) => {
    const low = c.tones.map((n) => transpose(n, -12));
    [0, 2.5].filter((o) => o < c.beats).forEach((o) => t.chord('brassStab', c.beat + o, low, 0.75, 0.45, 0.2));
  },
  /** パワーコードの 8 分刻み（T）。 */
  chug: (t, c) => {
    for (let s = 0; s < c.beats * 2; s++) t.note('powerChord', c.beat + s / 2, transpose(c.root, 12), 0.4, s % 2 === 0 ? 0.3 : 0.2);
  },
  /** 弦の 16 分の分散和音（A の刻み）。 */
  arp16: (t, c) => {
    const seq = [...c.tones, transpose(c.tones[0], 12), ...c.tones.slice(1).reverse()];
    for (let s = 0; s < c.beats * 4; s++) t.note('harp', c.beat + s / 4, seq[s % seq.length], 0.25, 0.12, 0.3);
  },
  arp8: (t, c) => {
    const seq = [...c.tones, transpose(c.tones[0], 12)];
    for (let s = 0; s < c.beats * 2; s++) t.note('harp', c.beat + s / 2, seq[s % seq.length], 0.5, 0.14, 0.4);
  },
};

const SLAP = [[0, 0], [0.75, 0], [1, 12], [1.5, 0], [2, 0], [2.5, 12], [2.75, 10], [3.5, 7]];

const BASS = {
  drive8: (t, c) => {
    for (let s = 0; s < c.beats * 2; s++) t.note('sawBass', c.beat + s / 2, c.root, 0.4, 0.5);
  },
  octave: (t, c) => {
    for (let s = 0; s < c.beats * 2; s++) t.note('pulseBass', c.beat + s / 2, s % 2 === 0 ? c.root : transpose(c.root, 12), 0.45, 0.45);
  },
  gallop: (t, c) => {
    for (let b = 0; b < c.beats; b++) {
      t.note('sawBass', c.beat + b, c.root, 0.45, 0.55);
      t.note('sawBass', c.beat + b + 0.5, c.root, 0.2, 0.45);
      t.note('sawBass', c.beat + b + 0.75, c.root, 0.2, 0.45);
    }
  },
  slap: (t, c) => {
    SLAP.filter(([o]) => o < c.beats).forEach(([o, st]) => t.note('slapBass', c.beat + o, transpose(c.root, st), 0.3, 0.6));
  },
  walk: (t, c) => {
    [0, 7, 12, 7].slice(0, c.beats).forEach((st, b) => t.note('pulseBass', c.beat + b, transpose(c.root, st), 0.9, 0.45));
  },
  sustain: (t, c) => t.note('subBass', c.beat, c.root, c.beats, 0.5),
};

const hats8 = (v = 0.1) => [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((b) => ['hat', b, b % 1 === 0 ? v : v * 0.6]);
const hats16 = (v = 0.07) => Array.from({ length: 16 }, (_, i) => ['hat', i / 4, i % 2 === 0 ? v : v * 0.5]);

/** 1 小節ぶんの打音 [種類, 拍, 音量]。i は部分の中で何小節目か。 */
const DRUMS = {
  none: () => [],
  light: () => [['kick', 0, 0.35], ...hats8(0.07)],
  timp: () => [['timpani', 0, 0.4], ['timpani', 2.5, 0.25]],
  rock: (i) => [['kick', 0, 0.6], ['kick', 2, 0.55], ['kick', 2.5, 0.4], ['snare', 1, 0.38], ['snare', 3, 0.4], ...hats8(), ...(i % 4 === 3 ? [['kick', 3.5, 0.35]] : [])],
  drive: (i) => [0, 1, 2, 3].map((b) => ['kick', b, 0.6]).concat([['snare', 1, 0.4], ['snare', 3, 0.42], ...hats8(0.11)], i % 2 === 1 ? [['kick', 3.5, 0.4]] : []),
  double: () => [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((b) => ['kick', b, 0.5]).concat([['snare', 1, 0.42], ['snare', 3, 0.42], ...hats16()]),
  half: () => [['kick', 0, 0.6], ['kick', 2.5, 0.45], ['snare', 2, 0.42], ...hats8(0.09)],
  march: (i) => [
    ['kick', 0, 0.5],
    ['kick', 2, 0.45],
    ...[0, 0.5, 0.75, 1, 1.5, 2, 2.5, 2.75, 3, 3.5].map((b) => ['snare', b, b === 1 || b === 3 ? 0.36 : 0.14]),
    ...(i % 2 === 0 ? [['timpani', 0, 0.4]] : []),
  ],
  tropical: () => [
    ...[0, 1, 2, 3].map((b) => ['kick', b, 0.55]),
    ['clap', 1, 0.3],
    ['clap', 3, 0.3],
    ...[0.5, 1.75, 2.5, 3.25].map((b) => ['bongoHi', b, 0.22]),
    ...[0.75, 2, 2.75].map((b) => ['bongoLo', b, 0.22]),
    ...Array.from({ length: 16 }, (_, i) => ['shaker', i / 4, i % 4 === 2 ? 0.1 : 0.05]),
  ],
};

/** 部分の最後の小節に入れるおかず。from 拍目から先は通常のドラムを鳴らさない。 */
const FILLS = {
  snare: { from: 2, hits: () => Array.from({ length: 8 }, (_, i) => ['snare', 2 + i / 4, 0.1 + (0.3 * i) / 7]) },
  toms: {
    from: 2,
    hits: () => Array.from({ length: 8 }, (_, i) => [['tomHi', 'tomHi', 'tomMid', 'tomMid', 'tomLo', 'tomLo', 'tomLo', 'snare'][i], 2 + i / 4, 0.4]),
  },
  roll: { from: 0, hits: () => Array.from({ length: 16 }, (_, i) => ['snare', i / 4, 0.03 + (0.37 * i) / 15]) },
};

const QUIET_DRUMS = new Set(['none', 'light', 'timp']);

// ===== 曲を組み立てる =====

/**
 * section: { name, chords, parts: [{ inst, notes, vol, send?, double? }], comp: [], bass, drums, fill?, energy? }
 * double はその旋律を何オクターブずらして重ねるか（-1 で 1 オクターブ下）。
 */
export function renderSong(song) {
  const totalBars = song.sections.reduce((n, s) => n + s.chords.length, 0);
  const track = createTrack({ bpm: song.bpm, bars: totalBars });
  let bar = 0;
  for (const section of song.sections) {
    const length = section.chords.length;
    const energy = section.energy ?? 1;
    for (const part of section.parts ?? []) {
      const beats = beatsOf(part.notes);
      if (beats !== length * 4) throw new Error(`${song.file} ${section.name} ${part.inst}: ${beats} 拍（${length * 4} 拍のはず）`);
      track.phrase(part.inst, bar * 4, part.notes, part.vol, part.send ?? 0.3);
      if (part.double) track.phrase(part.inst, bar * 4, shiftPhrase(part.notes, part.double), part.vol * 0.5, (part.send ?? 0.3) * 0.5);
    }
    for (const c of expandChords(section.chords, bar)) {
      (section.comp ?? []).forEach((kind) => COMP[kind](track, c));
      if (section.bass) BASS[section.bass](track, c);
    }
    const drums = section.drums ?? 'none';
    for (let i = 0; i < length; i++) {
      const fill = i === length - 1 && section.fill ? FILLS[section.fill] : null;
      const hits = DRUMS[drums](i).filter(([, beat]) => !fill || beat < fill.from);
      for (const [kind, beat, volume] of [...hits, ...(fill ? fill.hits() : [])]) {
        track.drum(kind, (bar + i) * 4 + beat, volume * energy, kind === 'snare' || kind === 'clap' ? 0.25 : 0.1);
      }
    }
    if (!QUIET_DRUMS.has(drums)) track.drum('crash', bar * 4, 0.22 * energy, 0.3);
    bar += length;
  }
  const beat = 60 / song.bpm;
  return mixdown(track, { echoSeconds: beat * 0.75, echoFeedback: 0.25, echoLevel: 0.25, reverbLevel: 0.45, tone: 0.65, ...song.mix });
}

export const join4 = (...barsText) => barsText.join(' | ');

