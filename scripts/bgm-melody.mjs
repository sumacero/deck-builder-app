// 作曲ルールで旋律を作る仕組み（タイトル曲の候補探しで使う）。
// - 拍の頭はコードの音、裏拍は音階を順に動く（ときどき 1 つ飛ばし）
// - 1 小節目の動機を 3・5 小節目で形を保ったまま繰り返し（ゼクエンツ）、7 小節目で一番高く、最後は主音に着地
import { writeFileSync } from 'node:fs';

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

export const pad2 = (n) => String(n).padStart(2, '0');

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

