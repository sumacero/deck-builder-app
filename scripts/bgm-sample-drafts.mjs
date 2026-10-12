// BGM のサンプル 100 曲（2026-10-08、オーナーの要望「ラスボスの曲の色んなパートの部分だけをさりげなく使用した曲を 100 曲。
// マップ、タイトル、戦闘とかで、良いものがあれば採用するかも」）。図鑑の BGM で聞くだけで、ゲーム中には流れない。
// 実行: node scripts/bgm-sample-drafts.mjs（assets/music/sample-draft-NN.wav と src/audio/sampleDrafts.ts を書き出す）
//
// 1 曲の作り: 新しく作曲した旋律（bgm-melody.mjs の composeMelody）で始まり、途中の 4 小節だけ
// ラスボス戦「三つの旗 −試− 改」（bgm-final.mjs）のどこかのパートを、目立たない形（倍の長さ・低い弦・遠いベルなど）で引用する。
// 同じ番号なら毎回同じ曲になる（乱数の種は番号）。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAMPLE_RATE, seedNoise, shiftPhrase } from './bgm-engine.mjs';
import { buildCalm, buildRise, HARMONY_BARS, INTRO_BARS, INTRO_CHORDS, RESOLVED_BAR, run } from './bgm-final.mjs';
import { composeMelody, notesIn, parseChord, phraseOf, PROGS, SCALES, writeDraftCatalog } from './bgm-melody.mjs';
import { bars, join4, remapPhrase, renderSong, stretchPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { CHORUS_BARS, CHORUS_CHORDS, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';
import { toWav } from './wav.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'assets', 'music');
const CATALOG = join(ROOT, 'src', 'audio', 'sampleDrafts.ts');
const COUNT = 100;

// ===== ラスボス戦から引用するパート（ニ短調・4 小節ずつ） =====

const barsOf = (notes) => notes.split('|').map((text) => text.trim());
const runBars = barsOf(run.parts[0].notes);

const FRAGMENTS = [
  { name: 'サビの頭（レー・ドー・シ♭）', bars: CHORUS_BARS.slice(0, 4), chords: CHORUS_CHORDS.slice(0, 4) },
  { name: 'サビ後半の駆け上がり', bars: CHORUS_BARS.slice(4, 8), chords: CHORUS_CHORDS.slice(4, 8) },
  { name: '締めのレへの解決', bars: [...CHORUS_BARS.slice(4, 7), RESOLVED_BAR], chords: [...CHORUS_CHORDS.slice(4, 7), 'A Dm'] },
  { name: 'サビの 3 度下のハモり', bars: HARMONY_BARS.slice(0, 4), chords: CHORUS_CHORDS.slice(0, 4) },
  { name: 'A メロの前半', bars: VERSE_BARS.slice(0, 4), chords: VERSE_CHORDS.slice(0, 4) },
  { name: 'A メロの後半', bars: VERSE_BARS.slice(4, 8), chords: VERSE_CHORDS.slice(4, 8) },
  { name: 'B メロの五度圏（前半）', bars: runBars.slice(0, 4), chords: ['Dm', 'Gm', 'C', 'F'] },
  { name: 'B メロの五度圏（後半）', bars: runBars.slice(4, 8), chords: ['Bb', 'Gm', 'A', 'A'] },
  { name: 'ためのギターの歌', bars: barsOf(buildCalm.parts[0].notes), chords: ['Gm', 'A', 'Bb', 'A'] },
  { name: 'ための上り坂（レ→ミ→ファ）', bars: barsOf(buildRise.parts[0].notes), chords: ['Gm', 'A', 'Bb', 'C A'] },
  { name: '加速するイントロ', bars: INTRO_BARS, chords: INTRO_CHORDS },
];

/** 長調の曲では、ニ短調の引用を平行調のヘ長調に寄せる（ド♯ → ド、A → Am）。 */
const MAJOR_MELODY = { 'C#': 'C', 'G#': 'G' };
const majorChord = (bar) =>
  bar
    .split(' ')
    .map((symbol) => (symbol === 'A' ? 'Am' : symbol === 'E' ? 'Em' : symbol))
    .join(' ');

// ===== 乱数 =====

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
const pickFrom = (rng, list) => list[Math.floor(rng() * list.length)];
const between = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

// ===== 用途ごとの曲調 =====

const INST_LABEL = {
  flute: '笛',
  strings: '弦',
  brassLead: '金管',
  bell: 'ベル',
  softKey: '鍵盤',
  triLead: '三角波の電子音',
  squareLead: '矩形波の電子音',
  organ: 'オルガン',
  guitarLead: 'ギター',
  synthBrass: 'シンセブラス',
};

/**
 * 用途: bars は 12（新しい旋律 4 / 引用 4 / 新しい旋律 4）か 16（戦闘: 刻みの導入 4 を足す）。
 * rhythms は composeMelody のリズムの型の番号。
 */
const MOODS = {
  title: {
    label: 'タイトル向け',
    count: 25,
    bpm: [66, 84],
    major: 0.4,
    leads: ['flute', 'strings', 'brassLead', 'bell', 'softKey'],
    comps: [['arp8', 'pad'], ['strings', 'arp8'], ['pad'], ['arp16', 'pad'], ['strings']],
    basses: ['sustain'],
    drums: ['none', 'timp', 'none'],
    rhythms: [0, 2, 3, 5, 9, 13, 15, 17],
    mix: { reverbLevel: 0.85, tone: 0.45, echoLevel: 0.35 },
  },
  map: {
    label: 'マップ向け',
    count: 25,
    bpm: [84, 112],
    major: 0.5,
    leads: ['flute', 'triLead', 'bell', 'softKey', 'organ', 'strings'],
    comps: [['arp8', 'pad'], ['arp8'], ['arp16'], ['strings', 'arp8'], ['organ', 'arp8']],
    basses: ['sustain', 'walk'],
    drums: ['light', 'swamp', 'desert', 'tropical', 'shadow', 'tribal'],
    rhythms: [1, 2, 3, 4, 5, 8, 10, 12, 14, 18],
    mix: { reverbLevel: 0.6, tone: 0.5, echoLevel: 0.25 },
  },
  battle: {
    label: '戦闘向け',
    count: 30,
    bpm: [120, 164],
    major: 0.15,
    leads: ['guitarLead', 'brassLead', 'synthBrass', 'squareLead', 'organ', 'strings'],
    comps: [['chug'], ['stabs', 'chug'], ['organ', 'chug'], ['strings', 'brassHits'], ['arp16', 'stabs'], ['chug', 'strings']],
    basses: ['gallop', 'drive8', 'octave', 'slap'],
    drums: ['rock', 'drive', 'half', 'march', 'double'],
    rhythms: [1, 4, 6, 7, 10, 11, 13, 16, 18],
    mix: { drive: 0.4, tone: 0.7 },
    riff: true,
  },
  rest: {
    label: '休憩所向け',
    count: 5,
    bpm: [60, 72],
    major: 1,
    leads: ['softKey', 'flute', 'bell'],
    comps: [['pad', 'arp8'], ['pad']],
    basses: ['sustain'],
    drums: ['none'],
    rhythms: [0, 2, 9, 15, 17],
    mix: { reverbLevel: 0.9, tone: 0.4, echoLevel: 0.4 },
  },
  event: {
    label: 'イベント向け',
    count: 5,
    bpm: [88, 100],
    major: 0,
    leads: ['bell', 'flute', 'triLead'],
    comps: [['arp8', 'pad'], ['arp16']],
    basses: ['sustain'],
    drums: ['shadow', 'swamp'],
    rhythms: [2, 3, 5, 8, 12],
    mix: { reverbLevel: 0.7, tone: 0.45, echoLevel: 0.35 },
  },
  shop: {
    label: 'ショップ向け',
    count: 5,
    bpm: [116, 128],
    major: 1,
    leads: ['flute', 'bell', 'organ'],
    comps: [['arp8'], ['arp8', 'pad']],
    basses: ['walk'],
    drums: ['tropical', 'light'],
    rhythms: [1, 4, 5, 10, 14],
    mix: { reverbLevel: 0.45, tone: 0.65 },
  },
  victory: {
    label: '勝利・宝箱向け',
    count: 5,
    bpm: [108, 120],
    major: 1,
    leads: ['brassLead', 'synthBrass', 'flute'],
    comps: [['strings', 'stabs'], ['brassHits', 'strings']],
    basses: ['walk', 'drive8'],
    drums: ['march'],
    rhythms: [1, 4, 6, 11, 18],
    mix: { reverbLevel: 0.55, tone: 0.6 },
  },
};

const MINOR_PROGS = ['epicMinor', 'epicMinor2', 'sad', 'harmonic'];
const MAJOR_PROGS = ['royal', 'canon', 'heroic', 'festival'];

/** 引用の仕方。weight の割合で選ぶ。 */
const TREATMENTS = [
  { kind: 'aug', weight: 3 },
  { kind: 'inner', weight: 3 },
  { kind: 'echo', weight: 3 },
  { kind: 'lead', weight: 1 },
];
const pickTreatment = (rng) => {
  const total = TREATMENTS.reduce((sum, t) => sum + t.weight, 0);
  let r = rng() * total;
  return TREATMENTS.find((t) => (r -= t.weight) < 0).kind;
};

const KEY_NAMES = ['ハ', '嬰ハ', 'ニ', '変ホ', 'ホ', 'ヘ', '嬰ヘ', 'ト', '変イ', 'イ', '変ロ', 'ロ'];

// ===== 部品 =====

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nameOf = (midi) => `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;

/** コードの音を、前の音に一番近いところでつなぐ長い音の線（引用の上で鳴らす、目立たない旋律）。 */
function holdLine(chordBars, center) {
  let last = center;
  return chordBars.map((bar) => {
    const symbols = bar.split(' ');
    return symbols
      .map((symbol) => {
        const candidates = notesIn(parseChord(symbol).pcs, center - 6, center + 6);
        last = candidates.sort((a, b) => Math.abs(a - last) - Math.abs(b - last))[0];
        return `${nameOf(last)}:${4 / symbols.length}`;
      })
      .join(' ');
  });
}

/** 2 小節を倍の長さにして 4 小節にする（コードも 1 小節を 2 小節に）。 */
function augment(fragment) {
  const notes = barsOf(stretchPhrase(join4(...fragment.bars.slice(0, 2)), 2));
  const chords = fragment.chords.slice(0, 2).flatMap((bar) => {
    const symbols = bar.split(' ');
    return symbols.length === 1 ? [bar, bar] : symbols;
  });
  return { bars: notes, chords };
}

/** 新しい旋律（8 小節）。ハ長調 / イ短調で作って、ヘ長調 / ニ短調に移す。 */
function composeNew(n, mood, major, lead, rng) {
  const progName = pickFrom(rng, major ? MAJOR_PROGS : MINOR_PROGS);
  const prog = PROGS[progName];
  const scale = !major && progName === 'harmonic' ? SCALES.harmonic : SCALES.diatonic;
  const r = [0, 1, 2, 3].map(() => pickFrom(rng, mood.rhythms));
  const melody = composeMelody({ n: n * 31 + 7, lead, r, shift: -5 }, prog, scale);
  return {
    bars: barsOf(transposePhrase(phraseOf(melody), 5)),
    chords: transposeSymbols(prog, 5),
  };
}

// ===== 1 曲 =====

function makeSample(n, moodKey) {
  const mood = MOODS[moodKey];
  const rng = mulberry32(n * 9973 + 11);
  const major = rng() < mood.major;
  const lead = pickFrom(rng, mood.leads);
  const bpm = between(rng, ...mood.bpm);
  const style = {
    comp: pickFrom(rng, mood.comps),
    bass: pickFrom(rng, mood.basses),
    drums: pickFrom(rng, mood.drums),
  };
  const offset = pickFrom(rng, [-3, -2, -1, 0, 0, 1, 2, 3]);
  const fragmentIndex = Math.floor(rng() * FRAGMENTS.length);
  const treatment = pickTreatment(rng);

  const fresh = composeNew(n, mood, major, lead, rng);
  const base = FRAGMENTS[fragmentIndex];
  const shaped = treatment === 'aug' ? augment(base) : base;
  const quote = major
    ? { bars: shaped.bars.map((text) => remapPhrase(text, MAJOR_MELODY)), chords: shaped.chords.map(majorChord) }
    : shaped;

  const leadVol = moodKey === 'battle' || moodKey === 'victory' ? 0.38 : 0.36;
  const quoteParts = {
    aug: () => {
      const inst = pickFrom(rng, ['strings', 'flute', 'organ', 'bell'].filter((i) => i !== lead));
      return {
        parts: [{ inst, vol: 0.22, send: 0.45, notes: join4(...quote.bars) }],
        text: `${INST_LABEL[inst]}が${base.name}を倍の長さでゆったりなぞる`,
      };
    },
    inner: () => {
      const upper = lead === 'strings' ? 'flute' : lead;
      return {
        parts: [
          { inst: 'strings', vol: 0.18, send: 0.4, notes: shiftPhrase(join4(...quote.bars), -1) },
          { inst: upper, vol: leadVol * 0.55, notes: join4(...holdLine(quote.chords, 81)) },
        ],
        text: `低い弦が${base.name}を和音の奥でなぞる（上では${INST_LABEL[upper]}が長い音を伸ばす）`,
      };
    },
    echo: () => ({
      parts: [
        { inst: 'bell', vol: 0.14, send: 0.55, notes: join4(...quote.bars) },
        { inst: lead, vol: leadVol * 0.5, notes: shiftPhrase(join4(...holdLine(quote.chords, 81)), -1) },
      ],
      text: `遠くの小さなベルが${base.name}を鳴らす`,
    }),
    lead: () => ({
      parts: [{ inst: lead, vol: leadVol * 0.9, notes: join4(...quote.bars) }],
      text: `${INST_LABEL[lead]}が${base.name}を${major ? '長調に変えて' : 'そのまま'}歌う`,
    }),
  }[treatment]();

  const section = (name, chords, parts, extra = {}) => ({ name, chords, parts, ...style, ...extra });
  const first = section('fresh-a', fresh.chords.slice(0, 4), [{ inst: lead, vol: leadVol, notes: join4(...fresh.bars.slice(0, 4)) }]);
  const quoteSection = section('quote', quote.chords, quoteParts.parts, { energy: 0.8 });
  const last = section('fresh-b', fresh.chords.slice(4, 8), [{ inst: lead, vol: leadVol, notes: join4(...fresh.bars.slice(4, 8)) }], {
    fill: mood.riff ? 'toms' : style.drums === 'none' ? undefined : 'snare',
  });
  const riff = mood.riff
    ? [
        section('riff', fresh.chords.slice(0, 4), [{ inst: 'guitarLead', vol: 0.3, notes: shiftPhrase(join4(...fresh.bars.slice(4, 8)), -1) }], {
          level: 0.85,
        }),
      ]
    : [];
  const sections = [...riff, first, quoteSection, last].map((s) => ({
    ...s,
    chords: bars(...transposeSymbols(s.chords, offset)),
    parts: s.parts.map((part) => ({ ...part, notes: transposePhrase(part.notes, offset) })),
  }));

  const tonic = ((major ? 5 : 2) + offset + 12) % 12;
  const key = `${KEY_NAMES[tonic]}${major ? '長調' : '短調'}`;
  const opening = mood.riff ? `ギターの刻みの導入から、${INST_LABEL[lead]}の新しい旋律` : `${INST_LABEL[lead]}の新しい旋律で始まり`;
  return {
    song: { file: `sample-draft-${String(n).padStart(2, '0')}`, bpm, mix: mood.mix, sections },
    entry: {
      no: n,
      name: `${mood.label}・${base.name}`,
      desc: `${mood.label}、${key}。${opening}、中ほどで${quoteParts.text}。`,
      bpm,
    },
  };
}

// ===== 書き出し =====

const plan = Object.entries(MOODS).flatMap(([key, mood]) => Array.from({ length: mood.count }, () => key));
if (plan.length !== COUNT) throw new Error(`サンプルは ${COUNT} 曲のはず（${plan.length} 曲）`);

mkdirSync(OUT_DIR, { recursive: true });
const entries = plan.map((moodKey, i) => {
  const { song, entry } = makeSample(i + 1, moodKey);
  seedNoise(4242);
  const samples = renderSong(song);
  writeFileSync(join(OUT_DIR, `${song.file}.wav`), toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${song.file}.wav (${(samples.length / SAMPLE_RATE).toFixed(1)}s) ${entry.name}`);
  return entry;
});

writeDraftCatalog(CATALOG, {
  kind: 'sample',
  label: 'サンプル',
  script: 'scripts/bgm-sample-drafts.mjs',
  doc: 'ラスボス戦の曲のパートをさりげなく引用したサンプル 100 曲。図鑑で聞くだけで、ゲーム中には流れない。',
  entries,
});
writeFileSync(CATALOG, readFileSync(CATALOG, 'utf8').replace('npm run bgm -- sample-draft', 'node scripts/bgm-sample-drafts.mjs'));
console.log(`wrote ${CATALOG}`);
