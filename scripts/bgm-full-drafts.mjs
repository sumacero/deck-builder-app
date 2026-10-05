// タイトル曲の候補探し 第 2 弾（2026-10-05）: オーナーが気に入ったサビ（【サビ 1】蒼き約束・【サビ 22】疾風怒濤・【サビ 40】妖精の悪戯）を
// 「三つの旗 −試−」と同じ構成（リフ 4 → A メロ 8 → 駆け上がり 4 → 溜め 4 → サビ 8 小節）で 1 曲に仕立てた試作 10 曲。
// 1〜6 は気に入ったサビをそのまま使い、7〜10 は同じ作り方で新しいサビを作った。音源は full-draft-01〜10.wav。
import { shiftPhrase } from './bgm-engine.mjs';
import { bars, transposeSymbols } from './bgm-song.mjs';
import { SCALES, PROGS, SPECS, composeMelody, harmonyOf, notesIn, pad2, parseChord, phraseOf, writeDraftCatalog } from './bgm-chorus-drafts.mjs';

// ===== サビ以外の部分のコード進行（ハ長調 / イ短調基準） =====

const FORM = {
  major: {
    riff: ['C', 'G', 'Am', 'F G'],
    verse: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'],
    run: ['F', 'G', 'Em', 'Am'],
    build: ['Dm', 'Em', 'F', 'G'],
  },
  minor: {
    riff: ['Am', 'F', 'G', 'E'],
    verse: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'],
    run: ['Am', 'G', 'F', 'E'],
    build: ['F', 'G', 'F', 'E'],
  },
};

/** 駆け上がり: コードの音を 16 分で上り下りする。 */
function arpRun(prog, center) {
  return prog.map((bar) => {
    const symbols = bar.split(' ');
    const per = 16 / symbols.length;
    return symbols.flatMap((symbol) => {
      const tones = notesIn(parseChord(symbol).pcs, center - 5, center + 12);
      const cycle = [...tones, ...tones.slice(1, -1).reverse()];
      return Array.from({ length: per }, (_, i) => ({ midi: cycle[i % cycle.length], dur: 0.25 }));
    });
  });
}

/** 溜め: 全音符でコードの音を 1 段ずつ上がっていく。 */
function buildLine(prog, center) {
  let last = center - 4;
  return prog.map((bar) => {
    const pcs = parseChord(bar.split(' ').pop()).pcs;
    const midi = notesIn(pcs, last + 1, last + 8)[0] ?? last;
    last = midi;
    return [{ midi, dur: 4 }];
  });
}

// ===== 楽器の組み合わせ（−試− のロックが基本） =====

const P = (inst, vol, notes) => ({ inst, vol, notes });

const SETS = {
  rock: {
    mix: { drive: 0.5, tone: 0.7 },
    riff: (p) => ({ parts: [P('guitarLead', 0.38, p), P('organ', 0.2, shiftPhrase(p, 1))], comp: ['chug'], bass: 'gallop', drums: 'rock', fill: 'toms' }),
    verse: (p) => ({ parts: [P('guitarLead', 0.4, p)], comp: ['organ', 'chug'], bass: 'gallop', drums: 'drive', fill: 'snare' }),
    run: (p) => ({ parts: [P('organ', 0.34, p)], comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' }),
    build: (p) => ({ parts: [P('brassLead', 0.36, p)], comp: ['strings'], bass: 'sustain', drums: 'half', fill: 'roll' }),
    chorus: (p, h) => ({
      parts: [P('brassLead', 0.4, p), P('guitarLead', 0.22, shiftPhrase(p, -1)), P('organ', 0.14, h)],
      comp: ['stabs', 'chug', 'brassHits'],
      bass: 'drive8',
      drums: 'double',
      fill: 'toms',
    }),
  },
  synth: {
    mix: { drive: 0.25, tone: 0.75, reverbLevel: 0.5 },
    riff: (p) => ({ parts: [P('squareLead', 0.3, p), P('triLead', 0.2, shiftPhrase(p, -1))], comp: ['stabs'], bass: 'octave', drums: 'drive', fill: 'snare' }),
    verse: (p) => ({ parts: [P('triLead', 0.38, p)], comp: ['pad', 'arp16'], bass: 'octave', drums: 'half', fill: 'snare' }),
    run: (p) => ({ parts: [P('squareLead', 0.3, p)], comp: ['stabs'], bass: 'octave', drums: 'drive', fill: 'toms' }),
    build: (p) => ({ parts: [P('synthBrass', 0.34, p)], comp: ['pad'], bass: 'sustain', drums: 'half', fill: 'roll' }),
    chorus: (p, h) => ({
      parts: [P('synthBrass', 0.4, p), P('triLead', 0.22, h), P('squareLead', 0.12, shiftPhrase(p, 1))],
      comp: ['stabs', 'pad'],
      bass: 'drive8',
      drums: 'double',
      fill: 'toms',
    }),
  },
  fairy: {
    mix: { reverbLevel: 0.6, tone: 0.7, echoLevel: 0.3 },
    riff: (p) => ({ parts: [P('bell', 0.34, p), P('flute', 0.2, p)], comp: ['arp16'], bass: 'octave', drums: 'light', fill: 'snare' }),
    verse: (p) => ({ parts: [P('flute', 0.4, p)], comp: ['arp16', 'pad'], bass: 'octave', drums: 'tropical', fill: 'snare', energy: 0.8 }),
    run: (p) => ({ parts: [P('bell', 0.3, p)], comp: ['strings'], bass: 'octave', drums: 'drive', fill: 'toms' }),
    build: (p) => ({ parts: [P('strings', 0.34, p)], comp: ['pad'], bass: 'sustain', drums: 'half', fill: 'roll' }),
    chorus: (p, h) => ({
      parts: [P('bell', 0.38, p), P('flute', 0.24, h), P('strings', 0.16, shiftPhrase(p, -1))],
      comp: ['arp16', 'strings', 'stabs'],
      bass: 'drive8',
      drums: 'double',
      fill: 'toms',
    }),
  },
  epic: {
    mix: { drive: 0.3, tone: 0.65, reverbLevel: 0.7 },
    riff: (p) => ({ parts: [P('strings', 0.34, p), P('guitarLead', 0.2, shiftPhrase(p, -1))], comp: ['chug', 'arp16'], bass: 'gallop', drums: 'rock', fill: 'toms' }),
    verse: (p) => ({ parts: [P('brassLead', 0.36, p)], comp: ['strings', 'chug'], bass: 'gallop', drums: 'march', fill: 'snare' }),
    run: (p) => ({ parts: [P('strings', 0.32, p)], comp: ['brassHits'], bass: 'gallop', drums: 'double', fill: 'toms' }),
    build: (p) => ({ parts: [P('brassLead', 0.36, p)], comp: ['strings'], bass: 'sustain', drums: 'timp', fill: 'roll' }),
    chorus: (p, h) => ({
      parts: [P('brassLead', 0.4, p), P('strings', 0.24, h), P('guitarLead', 0.18, shiftPhrase(p, -1))],
      comp: ['strings', 'brassHits', 'chug'],
      bass: 'drive8',
      drums: 'double',
      fill: 'toms',
    }),
  },
};

// ===== 10 曲 =====

const chorusSpec = (n) => SPECS.find((s) => s.n === n);

/** 7〜10 の新しいサビ（気に入った 3 曲と同じ作り方で、乱数の種と調を変えた）。 */
const NEW_CHORUS = {
  101: { n: 101, lead: 'synthBrass', r: [10, 4, 7, 3], scale: 'diatonic', prog: 'royal', key: 4 },
  102: { n: 102, lead: 'triLead', r: [7, 7, 13, 17], scale: 'diatonic', prog: 'epicMinor', key: 5 },
  103: { n: 103, lead: 'bell', r: [13, 7, 10, 3], scale: 'penta', prog: 'epicMinor2', key: -2 },
  104: { n: 104, lead: 'synthBrass', r: [10, 7, 13, 9], scale: 'diatonic', prog: 'canon', key: 0 },
};

const SONGS = [
  { no: 1, name: '蒼き約束 −試−', desc: '【サビ 1】を −試− の構成で。ギターとオルガンのロック。', bpm: 152, chorus: chorusSpec(1), set: 'rock' },
  { no: 2, name: '蒼き約束 −翔−', desc: '【サビ 1】を −試− の構成で。シンセと矩形波のアニメ主題歌風。', bpm: 152, chorus: chorusSpec(1), set: 'synth' },
  { no: 3, name: '疾風怒濤 −試−', desc: '【サビ 22】を −試− の構成で。ギターとオルガンのロック。', bpm: 172, chorus: chorusSpec(22), set: 'rock' },
  { no: 4, name: '疾風怒濤 −覇−', desc: '【サビ 22】を −試− の構成で。金管・弦・ギターの壮大な版。', bpm: 172, chorus: chorusSpec(22), set: 'epic' },
  { no: 5, name: '妖精の悪戯 −試−', desc: '【サビ 40】を −試− の構成で。ギターとオルガンのロック。', bpm: 148, chorus: chorusSpec(40), set: 'rock' },
  { no: 6, name: '妖精の悪戯 −舞−', desc: '【サビ 40】を −試− の構成で。ベルと笛、16 分のハープ。', bpm: 148, chorus: chorusSpec(40), set: 'fairy' },
  { no: 7, name: '暁の誓約', desc: '新しいサビ（【サビ 1】と同じ作り方）。シンセのアニメ主題歌風。', bpm: 150, chorus: NEW_CHORUS[101], set: 'synth' },
  { no: 8, name: '紅蓮の疾駆', desc: '新しいサビ（【サビ 22】と同じ作り方、ニ短調）。ロック。', bpm: 170, chorus: NEW_CHORUS[102], set: 'rock' },
  { no: 9, name: '月影の妖精', desc: '新しいサビ（【サビ 40】と同じ作り方）。ベルと笛。', bpm: 146, chorus: NEW_CHORUS[103], set: 'fairy' },
  { no: 10, name: '星灯りの戦旗', desc: '新しいサビ（カノン進行）。金管・弦・ギターの壮大な版。', bpm: 156, chorus: NEW_CHORUS[104], set: 'epic' },
];

const CENTER_OF = { bell: 79, flute: 77, triLead: 77, synthBrass: 76 };

function buildFullSong(song) {
  const spec = song.chorus;
  const scale = SCALES[spec.scale].map((pc) => (pc + spec.key + 12) % 12);
  const chorusProg = transposeSymbols(PROGS[spec.prog], spec.key);
  const isMajor = !/m/.test(PROGS[spec.prog][PROGS[spec.prog].length - 1]);
  const form = FORM[isMajor ? 'major' : 'minor'];
  const prog = (name) => transposeSymbols(form[name], spec.key);
  const center = CENTER_OF[spec.lead] ?? 76;

  const chorus = composeMelody(spec, chorusProg, scale);
  const harmony = harmonyOf(chorus, chorusProg, scale);
  const riff = composeMelody({ n: song.no * 31 + 1, lead: spec.lead, shift: -2, r: [7, 12, 7, 17] }, prog('riff'), scale);
  const verse = composeMelody({ n: song.no * 31 + 2, lead: spec.lead, shift: -4, r: [4, 10, 5, 3] }, prog('verse'), scale);
  const run = arpRun(prog('run'), center - 2);
  const build = buildLine(prog('build'), center);

  const set = SETS[song.set];
  const section = (name, chords, fields) => ({ name, chords: bars(...chords), ...fields });
  return {
    file: `full-draft-${pad2(song.no)}`,
    bpm: song.bpm,
    mix: set.mix,
    sections: [
      section('riff', prog('riff'), set.riff(phraseOf(riff))),
      section('verse', prog('verse'), set.verse(phraseOf(verse))),
      section('run', prog('run'), set.run(phraseOf(run))),
      section('build', prog('build'), set.build(phraseOf(build))),
      section('chorus', chorusProg, set.chorus(phraseOf(chorus), phraseOf(harmony))),
    ],
  };
}

export const FULL_DRAFTS = SONGS.map(buildFullSong);

export const writeFullDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'full',
    label: '構成',
    script: 'scripts/bgm-full-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 2 弾: 気に入ったサビを「三つの旗 −試−」と同じ構成で 1 曲にした試作 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: SONGS.map((s) => ({ no: s.no, name: s.name, desc: s.desc, bpm: s.bpm })),
  });
