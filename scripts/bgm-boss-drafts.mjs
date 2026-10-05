// タイトル曲の候補探し 第 3 弾（2026-10-05）: 「三つの旗 −試−」に【構成 10】星灯りの戦旗の雰囲気を入れた試作 10 曲。
// オーナーの希望: 急に始めず小さく静かに入る / サビ前のじらしを長め（溜めを 4 → 8 小節）。
// 旋律は −試− と同じ主題の素材（導入の動機・A メロ・駆け上がり・サビ）。星灯りからは楽器の組み合わせ
// （金管・弦・ギター、弦の 3 度下のハモり、低いギターの重ね）と、曲によってはサビの旋律そのもの（ヘ長調に移して）を借りる。
// 音源は boss-draft-01〜10.wav。図鑑の一覧 src/audio/bossDrafts.ts はこの台本が書き出す。
import { shiftPhrase } from './bgm-engine.mjs';
import { PROGS, SCALES, composeMelody, pad2, phraseOf, writeDraftCatalog } from './bgm-melody.mjs';
import { bars, join4, stretchPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { CHORUS, CHORUS_BARS, CHORUS_CHORDS, INTRO, INTRO_BARS, INTRO_CHORDS, RUN, RUN_CHORDS, VERSE, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

// ===== 素材 =====

/** 星灯りの戦旗のサビ（ハ長調で作られたものを、ニ短調の平行調ヘ長調へ移す）。 */
const STARLIGHT_SPEC = { n: 104, lead: 'synthBrass', r: [10, 7, 13, 9], scale: 'diatonic', prog: 'canon', key: 0 };
const STARLIGHT_BARS = phraseOf(composeMelody(STARLIGHT_SPEC, PROGS.canon, SCALES.diatonic))
  .split(' | ')
  .map((bar) => transposePhrase(bar, 5));
const STARLIGHT_CHORDS = transposeSymbols(PROGS.canon, 5);

/** ニ短調の音階で 3 度下のハモり（音階に無い C# などは長 3 度下）。 */
const D_MINOR = [2, 4, 5, 7, 9, 10, 0];
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PITCH = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
function thirdBelow(phrase) {
  return phrase.replace(/([A-G][#b]?)(\d):/g, (_, pc, octave) => {
    const midi = PITCH[pc] + 12 * (Number(octave) + 1);
    let target = midi - 4;
    if (D_MINOR.includes(PITCH[pc])) {
      let steps = 0;
      target = midi;
      while (steps < 2) {
        target -= 1;
        if (D_MINOR.includes(target % 12)) steps++;
      }
    }
    return `${NAMES[target % 12]}${Math.floor(target / 12) - 1}:`;
  });
}

/** 星灯りの楽器の組み合わせ。heavy なら −試− 寄りにギターを前へ。 */
const P = (inst, vol, notes, extra = {}) => ({ inst, vol, notes, ...extra });
const S = (name, chords, fields) => ({ name, chords: bars(...chords), bass: 'sustain', drums: 'none', ...fields });

function body({ heavy = false } = {}) {
  return [
    S('riff', INTRO_CHORDS, {
      parts: heavy
        ? [P('guitarLead', 0.38, INTRO), P('strings', 0.22, INTRO)]
        : [P('strings', 0.36, INTRO), P('guitarLead', 0.22, shiftPhrase(INTRO, -1))],
      comp: ['chug', 'arp16'],
      bass: 'gallop',
      drums: 'rock',
      fill: 'toms',
    }),
    S('verse', VERSE_CHORDS, {
      parts: [heavy ? P('guitarLead', 0.4, VERSE) : P('brassLead', 0.36, VERSE)],
      comp: ['strings', 'chug'],
      bass: 'gallop',
      drums: heavy ? 'drive' : 'march',
      fill: 'snare',
    }),
    S('run', RUN_CHORDS, { parts: [P('strings', 0.34, RUN), P('organ', 0.14, RUN)], comp: ['brassHits'], bass: 'gallop', drums: 'double', fill: 'toms' }),
  ];
}

function chorus({ semitones = 0, name = 'chorus' } = {}) {
  const melody = transposePhrase(CHORUS, semitones);
  const harmony = semitones === 0 ? thirdBelow(CHORUS) : transposePhrase(thirdBelow(CHORUS), semitones);
  return S(name, transposeSymbols(CHORUS_CHORDS, semitones), {
    parts: [P('brassLead', 0.4, melody), P('strings', 0.24, harmony), P('guitarLead', 0.18, shiftPhrase(melody, -1))],
    comp: ['strings', 'brassHits', 'chug'],
    bass: 'drive8',
    drums: 'double',
    fill: 'toms',
  });
}

/** サビのあと、次の周の静かな出だしへ戻るための 2 小節の余韻。 */
const afterglow = () =>
  S('afterglow', ['Dm', 'Dm'], { parts: [P('bell', 0.18, join4('D5:2 A5:2', 'D6:4'), { send: 0.7 })], comp: ['pad'], drums: 'timp', energy: 0.4 });

// ===== 静かな出だし（10 種） =====

const INTROS = {
  /** 導入の動機を倍の長さで、ベルが小さく。後半は弦が加わってティンパニのロール。 */
  bellMotif: () => [
    S('intro-bell', ['Dm', 'Dm', 'Bb', 'C'], { parts: [P('bell', 0.2, stretchPhrase(join4(...INTRO_BARS.slice(0, 2)), 2), { send: 0.6 })], comp: ['pad'] }),
    S('intro-swell', ['Dm', 'Dm', 'Bb', 'A'], {
      parts: [P('strings', 0.22, stretchPhrase(join4(...INTRO_BARS.slice(2, 4)), 2))],
      comp: ['pad', 'arp8'],
      drums: 'timp',
      fill: 'roll',
      energy: 0.5,
    }),
  ],
  /** 弦の和音だけが 2 小節ずつ大きくなる。 */
  stringSwell: () =>
    [0.1, 0.18, 0.26, 0.34].map((vol, i) =>
      S(`swell-${i}`, [['Dm', 'Dm'], ['Bb', 'Bb'], ['Gm', 'Gm'], ['A', 'A']][i], {
        parts: [P('strings', vol, ['D5:4 | D5:4', 'F5:4 | F5:4', 'G5:4 | Bb5:4', 'A5:4 | C#6:4'][i])],
        comp: ['pad'],
        drums: i === 3 ? 'timp' : 'none',
        fill: i === 3 ? 'roll' : undefined,
        energy: 0.3 + i * 0.2,
      }),
    ),
  /** 星灯りのサビの前半を、ベルとハープでそっと（ヘ長調）。 */
  starlightQuote: () => [
    S('starlight-quote', STARLIGHT_CHORDS.slice(0, 4), { parts: [P('bell', 0.22, join4(...STARLIGHT_BARS.slice(0, 4)), { send: 0.6 })], comp: ['arp8', 'pad'] }),
    S('to-minor', ['Bb', 'Gm', 'A', 'A'], { parts: [P('strings', 0.2, join4('D5:4', 'Bb4:4', 'C#5:4', 'E5:4'))], comp: ['pad'], drums: 'timp', fill: 'roll', energy: 0.5 }),
  ],
  /** サビの頭をオルゴールのようにゆっくり。 */
  musicBox: () => [
    S('music-box', ['Bb', 'Bb', 'C', 'C'], { parts: [P('bell', 0.22, stretchPhrase(join4(CHORUS_BARS[0], CHORUS_BARS[1]), 2))], comp: ['arp8'], bass: undefined }),
    S('music-box-2', ['Am', 'Am', 'Dm', 'A'], {
      parts: [P('bell', 0.22, stretchPhrase(join4(CHORUS_BARS[2], CHORUS_BARS[3]), 2))],
      comp: ['arp8', 'pad'],
      drums: 'timp',
      fill: 'roll',
      energy: 0.4,
    }),
  ],
  /** 鼓動のようなティンパニと、低い弦の長い音。 */
  heartbeat: () => [
    S('heartbeat', ['Dm', 'Bb', 'C', 'A'], { parts: [P('strings', 0.2, join4('D4:4', 'D4:4', 'E4:4', 'C#4:4'))], comp: ['pad'], drums: 'shadow', energy: 1.4 }),
    S('heartbeat-2', ['Dm', 'Bb', 'Gm', 'A'], {
      parts: [P('strings', 0.26, join4('A4:4', 'Bb4:4', 'Bb4:4', 'C#5:4')), P('bell', 0.12, join4('D6:4', 'F6:4', 'G6:4', 'E6:4'), { send: 0.7 })],
      comp: ['pad'],
      drums: 'timp',
      fill: 'roll',
      energy: 0.5,
    }),
  ],
  /** ハープだけ → 笛が A メロの頭をゆっくり。 */
  harpFlute: () => [
    S('harp', ['Dm', 'Bb'], { comp: ['arp8'], bass: undefined }),
    S('flute', ['Dm', 'Dm', 'C', 'C'], { parts: [P('flute', 0.26, stretchPhrase(join4(...VERSE_BARS.slice(0, 2)), 2))], comp: ['arp8', 'pad'] }),
    S('flute-2', ['Bb', 'A'], { parts: [P('flute', 0.24, join4('D5:2 F5:2', 'E5:4'))], comp: ['arp8', 'pad'], drums: 'timp', fill: 'roll', energy: 0.5 }),
  ],
  /** オルガンの聖歌のように、導入の動機を倍の長さで。 */
  organHymn: () => [
    S('hymn', ['Dm', 'Dm', 'Bb', 'C'], { parts: [P('organ', 0.18, stretchPhrase(join4(...INTRO_BARS.slice(0, 2)), 2))], comp: ['pad'] }),
    S('hymn-2', ['Dm', 'Dm', 'Bb', 'A'], {
      parts: [P('organ', 0.22, stretchPhrase(join4(...INTRO_BARS.slice(2, 4)), 2))],
      comp: ['pad', 'organ'],
      drums: 'timp',
      fill: 'roll',
      energy: 0.5,
    }),
  ],
  /** 遠くから近づく行進。スネアと金管が少しずつ大きくなる。 */
  distantMarch: () =>
    [0.2, 0.4, 0.65].map((energy, i) =>
      S(`march-${i}`, [['Dm', 'Bb', 'C', 'A'], ['Dm', 'Bb', 'C', 'A'], ['Gm', 'A', 'Bb', 'A']][i], {
        parts: i === 0 ? [] : [P('brassLead', 0.12 + i * 0.08, i === 1 ? INTRO : join4('G5:4', 'A5:4', 'Bb5:4', 'C#6:4'), { send: 0.7 - i * 0.15 })],
        comp: ['pad'],
        drums: 'march',
        fill: i === 2 ? 'roll' : undefined,
        energy,
      }),
    ),
  /** 星がまたたくような 16 分のハープとベル。 */
  sparkle: () => [
    S('sparkle', ['Dm', 'Bb', 'F', 'C'], { parts: [P('bell', 0.16, join4('A6:2 F6:2', 'D6:4', 'C6:2 F6:2', 'E6:4'), { send: 0.8 })], comp: ['arp16', 'pad'] }),
    S('sparkle-2', ['Dm', 'Bb', 'Gm', 'A'], {
      parts: [P('bell', 0.18, join4(...INTRO_BARS.slice(0, 4)), { send: 0.7 })],
      comp: ['arp16', 'pad'],
      drums: 'timp',
      fill: 'roll',
      energy: 0.5,
    }),
  ],
  /** エレピの分散和音と、遠い笛。 */
  softKeys: () => [
    S('keys', ['Dm', 'Bb', 'F', 'C'], { parts: [P('softKey', 0.24, join4('D5:1 F5:1 A5:1 F5:1', 'D5:1 F5:1 Bb5:1 F5:1', 'C5:1 F5:1 A5:1 F5:1', 'C5:1 E5:1 G5:1 E5:1'))], comp: ['pad'] }),
    S('keys-flute', ['Dm', 'Bb', 'Gm', 'A'], {
      parts: [
        P('softKey', 0.22, join4('D5:1 F5:1 A5:1 F5:1', 'D5:1 F5:1 Bb5:1 F5:1', 'D5:1 G5:1 Bb5:1 G5:1', 'C#5:1 E5:1 A5:1 E5:1')),
        P('flute', 0.18, join4('A5:4', 'Bb5:4', 'G5:4', 'A5:4'), { send: 0.6 }),
      ],
      comp: ['pad'],
      drums: 'timp',
      fill: 'roll',
      energy: 0.5,
    }),
  ],
};

// ===== サビ前の溜め（8 小節。5 種） =====

const BUILDS = {
  /** −試− の溜めを倍の長さに。金管が 2 小節ずつ上がり、最後の 2 小節はスネアのロール。 */
  rising: () => [
    S('build', ['Gm', 'Gm', 'A', 'A'], { parts: [P('brassLead', 0.32, stretchPhrase(join4('G5:4', 'A5:4'), 2))], comp: ['strings'], drums: 'half', energy: 0.6 }),
    S('build-2', ['Bb', 'Bb', 'A', 'A7'], { parts: [P('brassLead', 0.38, stretchPhrase(join4('Bb5:4', 'C#6:4'), 2))], comp: ['strings', 'brassHits'], drums: 'half', fill: 'roll' }),
  ],
  /** 星灯りのサビの前半を弦が歌い（ヘ長調）、そこから金管が上がって短調のサビへ。 */
  starlight: () => [
    S('build-starlight', STARLIGHT_CHORDS.slice(0, 4), { parts: [P('strings', 0.34, join4(...STARLIGHT_BARS.slice(0, 4))), P('guitarLead', 0.14, shiftPhrase(join4(...STARLIGHT_BARS.slice(0, 4)), -1))], comp: ['arp16'], drums: 'half', energy: 0.7 }),
    S('build-rise', ['Bb', 'C', 'Bb', 'A'], { parts: [P('brassLead', 0.38, join4('F5:4', 'G5:4', 'Bb5:4', 'C#6:4'))], comp: ['strings', 'brassHits'], drums: 'half', fill: 'roll' }),
  ],
  /** いったん音を引いて（2 小節はパッドだけ）、6 小節かけて盛り返す。 */
  breakdown: () => [
    S('break', ['Gm', 'Gm'], { parts: [P('bell', 0.16, join4('D6:4', 'Bb5:4'), { send: 0.7 })], comp: ['pad'] }),
    S('build-up', ['A', 'A', 'Bb', 'Bb'], { parts: [P('strings', 0.3, stretchPhrase(join4('A5:4', 'Bb5:4'), 2))], comp: ['strings'], drums: 'half', energy: 0.6 }),
    S('build-top', ['C', 'A7'], { parts: [P('brassLead', 0.38, join4('C6:4', 'C#6:4'))], comp: ['strings', 'brassHits'], drums: 'half', fill: 'roll' }),
  ],
  /** スネアのロールが 2 小節ごとに大きくなる。 */
  stagedRoll: () =>
    [0.3, 0.5, 0.75, 1].map((energy, i) =>
      S(`roll-${i}`, [['Gm', 'Gm'], ['A', 'A'], ['Bb', 'Bb'], ['A', 'A7']][i], {
        parts: [P(i < 2 ? 'strings' : 'brassLead', 0.26 + i * 0.04, ['G5:4 | G5:4', 'A5:4 | A5:4', 'Bb5:4 | Bb5:4', 'A5:4 | C#6:4'][i])],
        comp: i < 2 ? ['strings'] : ['strings', 'brassHits'],
        drums: 'march',
        fill: 'roll',
        energy,
      }),
    ),
  /** 溜めの途中で一段上がり、サビはホ短調で（転調）。 */
  modulate: () => [
    S('build', ['Gm', 'Gm', 'A', 'A'], { parts: [P('brassLead', 0.32, stretchPhrase(join4('G5:4', 'A5:4'), 2))], comp: ['strings'], drums: 'half', energy: 0.6 }),
    S('build-up', ['C', 'C', 'B', 'B7'], { parts: [P('brassLead', 0.38, stretchPhrase(join4('C6:4', 'D#6:4'), 2))], comp: ['strings', 'brassHits'], drums: 'half', fill: 'roll' }),
  ],
};

// ===== 10 曲 =====

const SONGS = [
  { no: 1, name: '星灯りの序', desc: 'ベルが導入の動機を小さく鳴らして始まる。溜めは −試− の倍の 8 小節。', bpm: 156, intro: 'bellMotif', build: 'rising' },
  { no: 2, name: '星灯りの潮騒', desc: '弦の和音が少しずつ満ちて始まる。溜めはスネアのロールが段々大きく。', bpm: 152, intro: 'stringSwell', build: 'stagedRoll' },
  { no: 3, name: '星灯りの誓い', desc: '星灯りのサビをベルでそっと引用して始まり、溜めでも弦が星灯りのサビを歌う。', bpm: 156, intro: 'starlightQuote', build: 'starlight' },
  { no: 4, name: '星灯りのオルゴール', desc: 'サビの頭をオルゴールのように鳴らして始まる。', bpm: 160, intro: 'musicBox', build: 'rising' },
  { no: 5, name: '星灯りの鼓動', desc: '鼓動のようなティンパニで始まる。溜めはいったん音を引いてから盛り返す。ギター強め。', bpm: 150, intro: 'heartbeat', build: 'breakdown', heavy: true },
  { no: 6, name: '星灯りの朝', desc: 'ハープだけで始まり、笛が A メロの頭をゆっくり。溜めはスネアのロールが段々大きく。', bpm: 156, intro: 'harpFlute', build: 'stagedRoll' },
  { no: 7, name: '星灯りの聖堂', desc: 'オルガンの聖歌のように始まる。溜めで一段上がり、サビはホ短調に転調。', bpm: 154, intro: 'organHymn', build: 'modulate', semitones: 2 },
  { no: 8, name: '星灯りの行軍', desc: '遠くから行進が近づいてくる出だし。ギター強め。', bpm: 148, intro: 'distantMarch', build: 'rising', heavy: true },
  { no: 9, name: '星灯りのまたたき', desc: '星がまたたくようなハープとベルで始まる。溜めで星灯りのサビを引用。', bpm: 158, intro: 'sparkle', build: 'starlight' },
  { no: 10, name: '星灯りの凱旋', desc: 'エレピと遠い笛で始まる。溜めは音を引いてから盛り返し、サビは 2 回目で一段上がる。', bpm: 156, intro: 'softKeys', build: 'breakdown', doubleChorus: true },
];

/** sections の音量を from から to へ段々に上げる（静かな出だし・じらす溜め）。 */
const ramp = (sections, from, to) =>
  sections.map((section, i) => ({ ...section, level: sections.length === 1 ? to : from + ((to - from) * i) / (sections.length - 1) }));

function buildBossDraft(song) {
  const choruses = song.doubleChorus
    ? [chorus(), S('lift', ['B', 'B7'], { comp: ['strings', 'brassHits'], drums: 'half', fill: 'roll' }), chorus({ semitones: 2, name: 'chorus-up' })]
    : [chorus({ semitones: song.semitones ?? 0 })];
  return {
    file: `boss-draft-${pad2(song.no)}`,
    bpm: song.bpm,
    mix: { drive: 0.3, tone: 0.65, reverbLevel: 0.7 },
    sections: [
      ...ramp(INTROS[song.intro](), 0.25, 0.55),
      ...body({ heavy: song.heavy }),
      ...ramp(BUILDS[song.build](), 0.7, 0.95),
      ...choruses,
      { ...afterglow(), level: 0.3 },
    ],
  };
}

export const BOSS_DRAFTS = SONGS.map(buildBossDraft);

export const writeBossDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'boss',
    label: '試案',
    script: 'scripts/bgm-boss-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 3 弾: 三つの旗 −試− に星灯りの戦旗の雰囲気を入れた試作 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: SONGS.map((s) => ({ no: s.no, name: s.name, desc: s.desc, bpm: s.bpm })),
  });
