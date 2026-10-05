// タイトル曲の候補探し: サビになるフレーズだけを 20 秒以内で 50 曲（2026-10-05）。
// 旋律は曲ごとの「旋法・コード進行・リズムの型・音域・乱数の種」から作曲ルールで作る:
// - 拍の頭はコードの音、裏拍は音階を順に動く（ときどき 1 つ飛ばし）
// - 1 小節目の動機を 3・5 小節目で形を保ったまま繰り返し（ゼクエンツ）、7 小節目で一番高く、最後は主音に着地
// 音源は chorus-draft-01〜50.wav、図鑑の一覧は src/audio/chorusDrafts.ts（この台本が書き出す）。
import { writeFileSync } from 'node:fs';
import { bars, transposeSymbols } from './bgm-song.mjs';

// ===== 音名とコード =====

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const QUALITY = { '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], sus4: [0, 5, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11] };
const nameOf = (midi) => `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;

export function parseChord(symbol) {
  const [, root, quality] = /^([A-G][#b]?)(.*)$/.exec(symbol);
  return { root: PC[root], pcs: QUALITY[quality].map((i) => (PC[root] + i) % 12) };
}

/** 小節のコード（'F G' なら前半 F・後半 G）から、pos 拍目のコード。 */
const chordAt = (barSymbol, pos) => {
  const symbols = barSymbol.split(' ');
  return parseChord(symbols[Math.min(symbols.length - 1, Math.floor((pos / 4) * symbols.length))]);
};

// ===== 音階（ハ長調 / イ短調を基準にした音の集合。key で移調） =====

export const SCALES = {
  diatonic: [0, 2, 4, 5, 7, 9, 11],
  harmonic: [0, 2, 4, 5, 8, 9, 11],
  penta: [0, 2, 4, 7, 9],
  miyako: [9, 10, 2, 4, 5],
};

/** コード進行（ハ長調 / イ短調基準）。最後のコードの根音が主音。 */
export const PROGS = {
  royal: ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'],
  canon: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F G', 'C'],
  heroic: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F G', 'C'],
  epicMinor: ['Am', 'F', 'G', 'C', 'Am', 'F', 'G E', 'Am'],
  epicMinor2: ['Am', 'Dm', 'G', 'C', 'F', 'Dm', 'E', 'Am'],
  sad: ['Am', 'F', 'C', 'G', 'F', 'Em', 'Dm E', 'Am'],
  harmonic: ['Am', 'Dm', 'E', 'Am', 'F', 'Dm', 'E', 'Am'],
  dorian: ['Dm', 'G', 'Dm', 'G', 'Dm', 'C', 'G', 'Dm'],
  mixo: ['G', 'F', 'C', 'G', 'G', 'F', 'C', 'G'],
  phrygian: ['Em', 'F', 'Em', 'F', 'Em', 'Dm', 'F', 'Em'],
  lydian: ['F', 'G', 'F', 'G', 'F', 'G', 'Em', 'F'],
  jazzy: ['Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'Cmaj7'],
  festival: ['C', 'C', 'F', 'C', 'Am', 'F', 'G', 'C'],
  slowMajor: ['C', 'Am', 'F G', 'C'],
  slowMinor: ['Am', 'F', 'G E', 'Am'],
  slowDorian: ['Dm', 'G', 'C Am', 'Dm'],
  slowHarmonic: ['Am', 'Dm', 'E', 'Am'],
  slowMiyako: ['Am', 'Dm', 'F', 'Am'],
};

// ===== リズムの型（1 小節 4 拍。負の数は休符） =====

const RHYTHMS = [
  [4],
  [1, 1, 1, 1],
  [2, 1, 1],
  [1, 1, 2],
  [0.5, 0.5, 1, 1, 1],
  [1.5, 0.5, 1, 1],
  [0.75, 0.25, 0.75, 0.25, 2],
  [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  [1, 0.5, 0.5, 2],
  [3, 1],
  [0.5, 1, 0.5, 1, 1],
  [1.5, 1.5, 1],
  [0.5, 0.5, 0.5, 0.5, 2],
  [0.25, 0.25, 0.25, 0.25, 1, 1, 1],
  [-0.5, 0.5, 0.5, 0.5, 1, 1],
  [0.5, 1, 1, 1.5],
  [1, 1, 0.5, 0.5, 1],
  [2, 2],
  [0.75, 0.75, 0.5, 1, 1],
  [-1, 1, 1, 1],
  [1.5, 0.5, 2],
];

/** 楽器ごとの旋律の中心の高さ（MIDI 番号）。 */
const CENTER = { bell: 79, flute: 77, softKey: 76, triLead: 77, squareLead: 77, synthBrass: 76, brassLead: 75, strings: 76, organ: 74, guitarLead: 74 };

// ===== 乱数（同じ種なら毎回同じ旋律） =====

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===== 作曲 =====

/** その小節で使う音階。コードの音が音階に無ければ、半音隣の音と入れ替える（短調の E のときの G# など）。 */
function barScale(scalePcs, chord) {
  let pcs = [...scalePcs];
  for (const pc of chord.pcs) {
    if (pcs.includes(pc)) continue;
    pcs = pcs.filter((p) => (p - pc + 12) % 12 !== 1 && (pc - p + 12) % 12 !== 1).concat(pc);
  }
  return pcs;
}

export const notesIn = (pcs, lo, hi) => {
  const out = [];
  for (let m = lo; m <= hi; m++) if (pcs.includes(m % 12)) out.push(m);
  return out;
};
const nearestIndex = (list, m) => list.reduce((best, v, i) => (Math.abs(v - m) < Math.abs(list[best] - m) ? i : best), 0);

/** 1 小節の旋律を作る。返り値は [{ midi | null, dur }]。 */
function composeBar(ctx, barSymbol, rhythm, prev, contour, target) {
  const { rng, lo, hi, scale } = ctx;
  const out = [];
  let pos = 0;
  let last = prev;
  const onsets = rhythm.filter((d) => d > 0).length;
  let k = 0;
  for (const raw of rhythm) {
    const dur = Math.abs(raw);
    if (raw < 0) {
      out.push({ midi: null, dur });
      pos += dur;
      continue;
    }
    const chord = chordAt(barSymbol, pos);
    const notes = notesIn(barScale(scale, chord), lo, hi);
    const chordNotes = notes.filter((m) => chord.pcs.includes(m % 12));
    const isLast = k === onsets - 1;
    const goingUp = contour === 'up' || (contour === 'arch' && k < onsets / 2) || (contour === 'valley' && k >= onsets / 2);
    const step = contour === 'flat' ? (rng() < 0.5 ? 1 : -1) : goingUp ? 1 : -1;
    let midi;
    if (isLast && target !== undefined) {
      midi = target;
    } else if (pos % 1 === 0) {
      const desired = last + step * (2 + Math.floor(rng() * 3));
      const fresh = rng() < 0.15 ? chordNotes : chordNotes.filter((m) => m !== last);
      const sorted = [...(fresh.length ? fresh : chordNotes)].sort((a, b) => Math.abs(a - desired) - Math.abs(b - desired));
      midi = sorted[rng() < 0.7 ? 0 : Math.min(1, sorted.length - 1)];
    } else {
      const i = nearestIndex(notes, last);
      const r = rng();
      const move = r < 0.05 ? 0 : r < 0.8 ? step : step * 2;
      midi = notes[Math.max(0, Math.min(notes.length - 1, i + move))];
    }
    if (midi - last > 9) midi -= 12;
    if (last - midi > 9) midi += 12;
    midi = Math.max(lo, Math.min(hi, midi));
    out.push({ midi, dur });
    last = midi;
    pos += dur;
    k++;
  }
  return out;
}

/** 動機の形（音階上の上下）を保ったまま、別のコードの上に置き直す（ゼクエンツ・繰り返し）。 */
function reshape(ctx, motif, barSymbol, startNear) {
  const { lo, hi, scale } = ctx;
  const sounding = motif.filter((n) => n.midi !== null);
  if (sounding.length === 0) return motif;
  const ref = notesIn(scale, lo - 12, hi + 12);
  const base = nearestIndex(ref, sounding[0].midi);
  const offsets = motif.map((n) => (n.midi === null ? null : nearestIndex(ref, n.midi) - base));
  const first = chordAt(barSymbol, 0);
  const chordNotes = notesIn(first.pcs, lo, hi);
  const start = chordNotes[nearestIndex(chordNotes, startNear)];
  const startIndex = nearestIndex(ref, start);
  return motif.map((n, i) => {
    if (offsets[i] === null) return n;
    const midi = ref[Math.max(0, Math.min(ref.length - 1, startIndex + offsets[i]))];
    return { midi: Math.max(lo, Math.min(hi, midi)), dur: n.dur };
  });
}

const firstPitch = (bar) => bar.find((n) => n.midi !== null)?.midi;
const lastPitch = (bar) => [...bar].reverse().find((n) => n.midi !== null)?.midi;
const nearestPc = (pc, around, lo, hi) => notesIn([pc], lo, hi).sort((a, b) => Math.abs(a - around) - Math.abs(b - around))[0];

export function composeMelody(spec, prog, scale) {
  const rng = mulberry32(spec.n * 7919 + 17);
  const center = (CENTER[spec.lead] ?? 74) + (spec.shift ?? 0);
  const ctx = { rng, lo: center - 9, hi: center + 10, scale };
  const [A, B, C, CAD] = spec.r.map((i) => RHYTHMS[i]);
  const tonic = parseChord(prog[prog.length - 1].split(' ').pop()).root;
  const tonicNote = nearestPc(tonic, center, ctx.lo, ctx.hi);
  const contours = ['up', 'arch', 'down', 'valley'];
  const pick = () => contours[Math.floor(rng() * contours.length)];
  const startChord = notesIn(chordAt(prog[0], 0).pcs, ctx.lo, ctx.hi);
  const start = startChord[nearestIndex(startChord, center - 2 + Math.floor(rng() * 5))];

  if (prog.length === 4) {
    const b1 = composeBar(ctx, prog[0], A, start, pick());
    const b2 = composeBar(ctx, prog[1], B, lastPitch(b1), pick());
    const b3 = composeBar(ctx, prog[2], C, lastPitch(b2), 'up');
    const b4 = composeBar(ctx, prog[3], CAD, lastPitch(b3), 'down', tonicNote);
    return [b1, b2, b3, b4];
  }
  const b1 = composeBar(ctx, prog[0], A, start, pick());
  const b2 = composeBar(ctx, prog[1], B, lastPitch(b1), pick());
  const b3 = reshape(ctx, b1, prog[2], firstPitch(b1) + (rng() < 0.6 ? 3 : -3));
  const dominant = parseChord(prog[3].split(' ').pop());
  const half = nearestPc(dominant.pcs[rng() < 0.5 ? 0 : 1], center + 2, ctx.lo, ctx.hi);
  const b4 = composeBar(ctx, prog[3], B, lastPitch(b3), pick(), half);
  const b5 = reshape(ctx, b1, prog[4], firstPitch(b1));
  const b6 = reshape(ctx, b2, prog[5], firstPitch(b2) + 2);
  const climax = nearestPc(parseChord(prog[6].split(' ')[0]).pcs[2], ctx.hi - 2, ctx.lo, ctx.hi);
  const b7 = composeBar(ctx, prog[6], C, lastPitch(b6), 'up', climax);
  const b8 = composeBar(ctx, prog[7], CAD, lastPitch(b7), 'down', tonicNote);
  return [b1, b2, b3, b4, b5, b6, b7, b8];
}

/** 3 度下のハモり（その小節の音階で 2 つ下の音）。 */
export function harmonyOf(melody, prog, scale) {
  return melody.map((bar, i) =>
    bar.map((n) => {
      if (n.midi === null) return n;
      const notes = notesIn(barScale(scale, chordAt(prog[i], 0)), n.midi - 12, n.midi);
      return { midi: notes[Math.max(0, nearestIndex(notes, n.midi) - 2)], dur: n.dur };
    }),
  );
}

export const phraseOf = (barsOfNotes) =>
  barsOfNotes.map((bar) => bar.map((n) => `${n.midi === null ? '-' : nameOf(n.midi)}:${n.dur}`).join(' ')).join(' | ');

// ===== 50 曲 =====

export const SOFT = { reverbLevel: 0.85, tone: 0.45, echoLevel: 0.35 };
export const GRAND = { reverbLevel: 0.9, tone: 0.5, echoLevel: 0.3 };
export const BRIGHT = { reverbLevel: 0.6, tone: 0.65, echoLevel: 0.25 };
export const LOUD = { drive: 0.4, tone: 0.7 };
const DARK = { reverbLevel: 0.95, tone: 0.35, echoLevel: 0.35 };
const CHIP = { drive: 0.15, tone: 0.8, reverbLevel: 0.35 };

/**
 * n: 番号 / key: ハ長調・イ短調からの移調（半音）/ r: リズムの型 [1 小節目, 2 小節目, 7 小節目, 最後] /
 * harm: 3 度下でハモる楽器 / dbl: 旋律をオクターブ重ねる / shift: 旋律の高さの調整（半音）
 */
export const SPECS = [
  { n: 1, name: '蒼き約束', desc: '王道のアニメ主題歌。シンセブラスと三角波のハモり。', bpm: 152, key: 2, scale: 'diatonic', prog: 'royal', r: [10, 4, 7, 3], lead: 'synthBrass', harm: 'triLead', comp: ['stabs', 'pad'], bass: 'octave', drums: 'drive', fill: 'snare', mix: LOUD },
  { n: 2, name: '勇者の凱歌', desc: '金管が高らかに歌う、行進のスネアとティンパニ。', bpm: 132, key: 5, scale: 'diatonic', prog: 'heroic', r: [18, 2, 4, 9], lead: 'brassLead', dbl: -1, comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'march', fill: 'roll', mix: GRAND },
  { n: 3, name: '哀しき姫君', desc: 'ゆっくりした短調の笛。ハープとパッドだけ。', bpm: 72, key: 4, scale: 'diatonic', prog: 'slowMinor', r: [5, 2, 20, 0], lead: 'flute', comp: ['arp8', 'pad'], bass: 'sustain', drums: 'none', mix: SOFT },
  { n: 4, name: '嵐の決戦', desc: 'ト短調の速いロック。ギターとオルガンのハモり。', bpm: 168, key: -2, scale: 'diatonic', prog: 'epicMinor', r: [12, 10, 7, 17], lead: 'guitarLead', harm: 'organ', comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms', mix: LOUD },
  { n: 5, name: '祭囃子', desc: '五音音階の笛とボンゴで、お祭りのにぎわい。', bpm: 138, key: 2, scale: 'penta', prog: 'festival', r: [13, 6, 7, 3], lead: 'flute', comp: ['arp8'], bass: 'walk', drums: 'tropical', mix: BRIGHT },
  { n: 6, name: '都の雅', desc: '都節音階（和風）のベルと笛。しっとりと。', bpm: 84, key: 0, scale: 'miyako', prog: 'slowMiyako', r: [9, 5, 2, 0], lead: 'bell', harm: 'flute', comp: ['arp8'], bass: 'sustain', drums: 'none', mix: SOFT },
  { n: 7, name: '星屑のセレナーデ', desc: 'リディア旋法の浮遊感。ベルとエレピ。', bpm: 104, key: 2, scale: 'diatonic', prog: 'lydian', r: [3, 5, 1, 17], lead: 'bell', harm: 'softKey', comp: ['arp16', 'pad'], bass: 'sustain', drums: 'light', mix: SOFT },
  { n: 8, name: '海賊の宴', desc: 'ドリア旋法で跳ねる笛。陽気な船乗りの踊り。', bpm: 144, key: 2, scale: 'diatonic', prog: 'dorian', r: [6, 13, 7, 20], lead: 'flute', comp: ['arp8'], bass: 'walk', drums: 'tropical', mix: BRIGHT },
  { n: 9, name: '黒騎士', desc: 'フリギア旋法の重い金管とタム。', bpm: 112, key: -2, scale: 'diatonic', prog: 'phrygian', r: [2, 11, 12, 9], lead: 'brassLead', dbl: -1, comp: ['brassHits', 'strings'], bass: 'sustain', drums: 'tribal', mix: DARK },
  { n: 10, name: '砂漠の隊商', desc: '和声的短音階の笛とダラブッカ風の太鼓。', bpm: 108, key: -4, scale: 'harmonic', prog: 'harmonic', r: [6, 15, 13, 20], lead: 'flute', comp: ['arp8'], bass: 'sustain', drums: 'desert', mix: BRIGHT },
  { n: 11, name: '夕暮れの酒場', desc: '7 の和音のジャズ風。エレピとウォーキングベース。', bpm: 100, key: 3, scale: 'diatonic', prog: 'jazzy', r: [14, 10, 15, 0], lead: 'softKey', comp: ['pad'], bass: 'walk', drums: 'light', mix: SOFT },
  { n: 12, name: '天空城', desc: 'ゆったり雄大な弦。16 分のハープとティンパニ。', bpm: 76, key: 7, scale: 'diatonic', prog: 'slowMajor', r: [17, 9, 2, 0], lead: 'strings', dbl: -1, comp: ['pad', 'arp16'], bass: 'sustain', drums: 'timp', mix: GRAND },
  { n: 13, name: '駆け抜ける風', desc: '速い長調の笛とベルのハモり。', bpm: 160, key: 9, scale: 'diatonic', prog: 'canon', r: [7, 13, 12, 3], lead: 'flute', harm: 'bell', comp: ['arp16'], bass: 'octave', drums: 'drive', mix: BRIGHT },
  { n: 14, name: '機械仕掛けの心', desc: 'ピコピコ鳴る矩形波のチップチューン。', bpm: 140, key: 2, scale: 'diatonic', prog: 'epicMinor2', r: [7, 12, 10, 17], lead: 'squareLead', harm: 'triLead', comp: ['arp16'], bass: 'octave', drums: 'drive', mix: CHIP },
  { n: 15, name: '森の子守唄', desc: '五音音階のベル。とても静か。', bpm: 60, key: 5, scale: 'penta', prog: 'slowMajor', r: [3, 2, 5, 0], lead: 'bell', comp: ['arp8', 'pad'], bass: 'sustain', drums: 'none', mix: SOFT },
  { n: 16, name: '炎の闘技場', desc: 'ミクソリディア旋法のギターロック。', bpm: 150, key: -2, scale: 'diatonic', prog: 'mixo', r: [12, 10, 4, 17], lead: 'guitarLead', comp: ['chug', 'organ'], bass: 'gallop', drums: 'rock', fill: 'toms', mix: LOUD },
  { n: 17, name: '氷の女王', desc: '和声的短音階のベルと弦。冷たく妖しい。', bpm: 92, key: -3, scale: 'harmonic', prog: 'slowHarmonic', r: [5, 18, 6, 0], lead: 'bell', harm: 'strings', comp: ['arp16', 'pad'], bass: 'sustain', drums: 'shadow', mix: DARK },
  { n: 18, name: '花畑の約束', desc: '明るいポップス。笛とベル、軽い拍。', bpm: 124, key: 4, scale: 'diatonic', prog: 'royal', r: [15, 3, 10, 3], lead: 'flute', harm: 'bell', comp: ['arp8', 'strings'], bass: 'walk', drums: 'light', mix: BRIGHT },
  { n: 19, name: '誓いの剣', desc: 'ニ短調の勇ましい金管。メインテーマと同じ調。', bpm: 120, key: 5, scale: 'diatonic', prog: 'epicMinor2', r: [18, 5, 4, 9], lead: 'brassLead', dbl: -1, comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'march', fill: 'roll', mix: GRAND },
  { n: 20, name: '夜明けの港', desc: '跳ねるリズムのエレピと笛。穏やかな朝。', bpm: 98, key: -2, scale: 'diatonic', prog: 'heroic', r: [6, 3, 8, 0], lead: 'softKey', harm: 'flute', comp: ['pad'], bass: 'sustain', drums: 'light', mix: SOFT },
  { n: 21, name: '魔王城の鐘', desc: '和声的短音階のオルガン。重々しく。', bpm: 100, key: 5, scale: 'harmonic', prog: 'harmonic', r: [17, 9, 2, 0], lead: 'organ', dbl: -1, comp: ['pad'], bass: 'sustain', drums: 'timp', mix: DARK },
  { n: 22, name: '疾風怒濤', desc: '176 BPM の全力疾走。三角波とシンセブラス。', bpm: 176, key: 0, scale: 'diatonic', prog: 'epicMinor', r: [7, 7, 13, 17], lead: 'triLead', harm: 'synthBrass', comp: ['stabs'], bass: 'drive8', drums: 'double', fill: 'toms', mix: LOUD },
  { n: 23, name: '春風ステップ', desc: '弾むベルとスラップベース。', bpm: 116, key: 7, scale: 'diatonic', prog: 'canon', r: [10, 16, 4, 3], lead: 'bell', comp: ['arp8'], bass: 'slap', drums: 'tropical', mix: BRIGHT },
  { n: 24, name: '遥かなる大地', desc: 'リディア旋法の雄大な金管と弦。', bpm: 108, key: -5, scale: 'diatonic', prog: 'lydian', r: [17, 5, 18, 9], lead: 'brassLead', harm: 'strings', comp: ['strings', 'arp16'], bass: 'sustain', drums: 'timp', mix: GRAND },
  { n: 25, name: '涙の雨', desc: '切ない短調のポップス。エレピと弦のハモり。', bpm: 104, key: 2, scale: 'diatonic', prog: 'sad', r: [5, 3, 15, 0], lead: 'softKey', harm: 'strings', comp: ['pad', 'arp8'], bass: 'sustain', drums: 'light', mix: SOFT },
  { n: 26, name: '剣士の誇り', desc: 'フリギア旋法のスパニッシュ風ギター。', bpm: 132, key: 5, scale: 'diatonic', prog: 'phrygian', r: [13, 10, 7, 17], lead: 'guitarLead', comp: ['arp16'], bass: 'octave', drums: 'desertDrive', mix: LOUD },
  { n: 27, name: '星の巡礼', desc: 'ドリア旋法の聖歌風。弦とオルガン。', bpm: 64, key: 0, scale: 'diatonic', prog: 'slowDorian', r: [17, 9, 17, 0], lead: 'strings', dbl: -1, comp: ['organ'], bass: 'sustain', drums: 'none', mix: GRAND },
  { n: 28, name: 'ゴブリン行進', desc: 'おどけた矩形波の行進曲。', bpm: 120, key: 0, scale: 'diatonic', prog: 'mixo', r: [7, 4, 10, 3], lead: 'squareLead', comp: ['arp8'], bass: 'walk', drums: 'march', mix: BRIGHT },
  { n: 29, name: '翼の歌', desc: 'アニメのバラードのサビ。笛とエレピ。', bpm: 100, key: 1, scale: 'diatonic', prog: 'royal', r: [5, 8, 10, 20], lead: 'flute', harm: 'softKey', comp: ['strings', 'arp8'], bass: 'sustain', drums: 'light', mix: SOFT },
  { n: 30, name: '雷鳴の軍勢', desc: '五音音階の金管と和太鼓風のタム。', bpm: 128, key: -2, scale: 'penta', prog: 'epicMinor', r: [6, 2, 12, 17], lead: 'brassLead', dbl: -1, comp: ['brassHits'], bass: 'sustain', drums: 'tribal', fill: 'toms', mix: GRAND },
  { n: 31, name: '水晶の洞窟', desc: 'リディア旋法のベルの分散和音。', bpm: 110, key: 1, scale: 'diatonic', prog: 'lydian', r: [3, 1, 11, 0], lead: 'bell', harm: 'softKey', comp: ['arp16'], bass: 'sustain', drums: 'none', mix: SOFT },
  { n: 32, name: '闘志のファンファーレ', desc: '跳ねる金管のファンファーレと弦のハモり。', bpm: 140, key: 5, scale: 'diatonic', prog: 'heroic', r: [6, 6, 18, 17], lead: 'brassLead', harm: 'strings', comp: ['brassHits', 'strings'], bass: 'sustain', drums: 'march', fill: 'roll', mix: GRAND },
  { n: 33, name: '影の暗殺者', desc: '裏拍から入る三角波。暗いシンセ。', bpm: 124, key: 3, scale: 'diatonic', prog: 'epicMinor2', r: [14, 10, 12, 9], lead: 'triLead', comp: ['stabs'], bass: 'octave', drums: 'half', mix: { ...DARK, drive: 0.2 } },
  { n: 34, name: '草原のピクニック', desc: '五音音階ののどかな笛。', bpm: 112, key: 2, scale: 'penta', prog: 'canon', r: [1, 3, 5, 17], lead: 'flute', comp: ['arp8'], bass: 'walk', drums: 'light', mix: BRIGHT },
  { n: 35, name: '古の神殿', desc: '和声的短音階の笛。オルガンとティンパニ。', bpm: 70, key: -4, scale: 'harmonic', prog: 'slowHarmonic', r: [9, 2, 5, 0], lead: 'flute', comp: ['pad', 'organ'], bass: 'sustain', drums: 'timp', mix: DARK },
  { n: 36, name: '竜騎士の空', desc: '速い長調の金管とシンセブラス。', bpm: 156, key: -3, scale: 'diatonic', prog: 'royal', r: [18, 4, 7, 9], lead: 'brassLead', harm: 'synthBrass', comp: ['stabs', 'strings'], bass: 'drive8', drums: 'drive', fill: 'toms', mix: LOUD },
  { n: 37, name: '月夜の舞踏会', desc: '跳ねる短調のエレピと弦。', bpm: 108, key: -2, scale: 'diatonic', prog: 'sad', r: [6, 15, 6, 0], lead: 'softKey', harm: 'strings', comp: ['strings'], bass: 'walk', drums: 'light', mix: SOFT },
  { n: 38, name: '仲間との絆', desc: 'あたたかい弦と笛のハモり。', bpm: 100, key: 0, scale: 'diatonic', prog: 'heroic', r: [3, 5, 4, 0], lead: 'strings', harm: 'flute', comp: ['arp8', 'pad'], bass: 'sustain', drums: 'light', mix: GRAND },
  { n: 39, name: '鋼鉄の巨人', desc: 'フリギア旋法の重いギター。', bpm: 100, key: -4, scale: 'diatonic', prog: 'phrygian', r: [17, 11, 2, 17], lead: 'guitarLead', dbl: -1, comp: ['chug'], bass: 'gallop', drums: 'half', mix: LOUD },
  { n: 40, name: '妖精の悪戯', desc: '五音音階で駆け回るベルと笛。', bpm: 148, key: 7, scale: 'penta', prog: 'epicMinor2', r: [13, 7, 10, 3], lead: 'bell', harm: 'flute', comp: ['arp16'], bass: 'octave', drums: 'light', mix: BRIGHT },
  { n: 41, name: '鎮魂の祈り', desc: 'とても遅い短調の弦。', bpm: 52, key: -1, scale: 'diatonic', prog: 'slowMinor', r: [17, 9, 17, 0], lead: 'strings', comp: ['pad'], bass: 'sustain', drums: 'none', mix: DARK },
  { n: 42, name: '勝利の宴', desc: '明るいダンス。シンセブラスと笛、スラップベース。', bpm: 136, key: 2, scale: 'diatonic', prog: 'canon', r: [10, 15, 12, 3], lead: 'synthBrass', harm: 'flute', comp: ['stabs'], bass: 'slap', drums: 'tropical', mix: BRIGHT },
  { n: 43, name: '迷いの森', desc: 'ドリア旋法の不思議な笛。', bpm: 102, key: -3, scale: 'diatonic', prog: 'dorian', r: [5, 11, 3, 0], lead: 'flute', comp: ['arp8', 'pad'], bass: 'sustain', drums: 'swamp', mix: SOFT },
  { n: 44, name: '決意の朝', desc: 'ポップロック。ギターとオルガンのハモり。', bpm: 144, key: -1, scale: 'diatonic', prog: 'royal', r: [12, 4, 10, 17], lead: 'guitarLead', harm: 'organ', comp: ['chug', 'pad'], bass: 'drive8', drums: 'rock', mix: LOUD },
  { n: 45, name: '時計塔の謎', desc: '和声的短音階の矩形波とベル。', bpm: 118, key: -1, scale: 'harmonic', prog: 'harmonic', r: [7, 1, 12, 3], lead: 'squareLead', harm: 'bell', comp: ['arp16'], bass: 'octave', drums: 'half', mix: CHIP },
  { n: 46, name: '白銀の騎士団', desc: '短調の行進。金管と弦。', bpm: 112, key: 7, scale: 'diatonic', prog: 'epicMinor', r: [6, 8, 6, 17], lead: 'brassLead', dbl: -1, comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'march', fill: 'roll', mix: GRAND },
  { n: 47, name: '雲の上の散歩', desc: 'リディア旋法のエレピとベル。ふわふわ。', bpm: 100, key: 4, scale: 'diatonic', prog: 'lydian', r: [2, 5, 3, 0], lead: 'softKey', harm: 'bell', comp: ['arp8', 'pad'], bass: 'sustain', drums: 'light', mix: SOFT },
  { n: 48, name: '獣の咆哮', desc: '五音音階の金管とタムの連打。', bpm: 126, key: -4, scale: 'penta', prog: 'epicMinor', r: [12, 6, 13, 17], lead: 'brassLead', comp: ['brassHits'], bass: 'gallop', drums: 'tribal', mix: LOUD },
  { n: 49, name: '旅立ちの鐘', desc: 'ベルと弦のハモり、ティンパニ。', bpm: 106, key: -5, scale: 'diatonic', prog: 'canon', r: [2, 18, 1, 9], lead: 'bell', harm: 'strings', comp: ['arp16', 'strings'], bass: 'sustain', drums: 'timp', mix: GRAND },
  { n: 50, name: '星灯りの巡礼', desc: 'ゲーム名の曲。ニ短調の壮大な金管と弦。', bpm: 120, key: 5, scale: 'diatonic', prog: 'epicMinor2', r: [18, 6, 4, 9], lead: 'brassLead', harm: 'strings', dbl: -1, comp: ['strings', 'brassHits', 'arp16'], bass: 'sustain', drums: 'march', fill: 'roll', mix: GRAND },
];

export const pad2 = (n) => String(n).padStart(2, '0');

function buildSong(spec) {
  const prog = transposeSymbols(PROGS[spec.prog], spec.key);
  const scale = SCALES[spec.scale].map((pc) => (pc + spec.key + 12) % 12);
  const melody = composeMelody(spec, prog, scale);
  const harmony = spec.harm ? harmonyOf(melody, prog, scale) : null;
  const halves = prog.length === 8 ? [[0, 4], [4, 8]] : [[0, 4]];
  return {
    file: `chorus-draft-${pad2(spec.n)}`,
    bpm: spec.bpm,
    mix: spec.mix,
    sections: halves.map(([from, to], i) => ({
      name: `half-${i + 1}`,
      chords: bars(...prog.slice(from, to)),
      parts: [
        { inst: spec.lead, vol: 0.4, notes: phraseOf(melody.slice(from, to)), ...(spec.dbl ? { double: spec.dbl } : {}) },
        ...(harmony ? [{ inst: spec.harm, vol: 0.2, notes: phraseOf(harmony.slice(from, to)) }] : []),
      ],
      comp: spec.comp,
      bass: spec.bass,
      drums: spec.drums,
      fill: to === prog.length ? undefined : spec.fill,
      energy: i === 0 && halves.length === 2 ? 0.85 : 1,
    })),
  };
}

export const CHORUS_DRAFTS = SPECS.map(buildSong);

/**
 * 図鑑で聞く試作の一覧（TypeScript）を書き出す。
 * entries: [{ no, name, desc, bpm }]、kind: 'chorus' なら id は chorusDraft:01、音源は chorus-draft-01.wav。
 */
export function writeDraftCatalog(path, { kind, label, script, doc, entries }) {
  const Kind = kind[0].toUpperCase() + kind.slice(1);
  const KIND = kind.toUpperCase();
  const rows = entries.map(
    (e) =>
      `  { id: '${kind}Draft:${pad2(e.no)}', title: '【${label} ${e.no}】${e.name}', description: '${e.desc}（${e.bpm} BPM）', source: require('../../assets/music/${kind}-draft-${pad2(e.no)}.wav') },`,
  );
  const text = `// ${script} が書き出すファイル。手で直さない（npm run bgm -- ${kind}-draft）。
import type { AudioSource } from 'expo-audio';

type ${Kind}DraftTrack = {
  id: \`${kind}Draft:\${string}\`;
  title: string;
  description: string;
  source: AudioSource;
};

/** ${doc} */
export const ${KIND}_DRAFT_TRACKS = [
${rows.join('\n')}
] as const satisfies readonly ${Kind}DraftTrack[];

export type ${Kind}DraftId = (typeof ${KIND}_DRAFT_TRACKS)[number]['id'];
`;
  writeFileSync(path, text);
}

/** 図鑑の一覧（src/audio/chorusDrafts.ts）を書き出す。 */
export const writeChorusDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'chorus',
    label: 'サビ',
    script: 'scripts/bgm-chorus-drafts.mjs',
    doc: 'タイトル曲の候補探し: サビになるフレーズだけの短い試作 50 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: SPECS.map((s) => ({ no: s.n, name: s.name, desc: s.desc, bpm: s.bpm })),
  });
