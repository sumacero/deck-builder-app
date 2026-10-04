// メインテーマ「三つの旗」（試作 04）の変奏 10 曲を合成して assets/music/theme/*.wav に書き出す。
// 実行: npm run bgm:theme
//
// オーナーの好み: 1 つのメインテーマのコードやフレーズが、どの戦闘曲にも入っている構成。
// そこで 04 の 4 つの素材（導入の動機・A メロ・サビ・オルガンの駆け上がり）とコード進行を共有し、
// テンポ・楽器・調・リズムだけを変えて、通常戦闘からボス・タイトル向けまでの変奏を作る。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAMPLE_RATE, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, remapPhrase, renderSong, stretchPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { toWav } from './wav.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'music', 'theme');

// ===== 主題の素材（ニ短調） =====

/** 導入の動機。休符をはさんだ「レ・レ・ファミレラ」。 */
const INTRO_BARS = [
  'D5:0.5 -:0.5 D5:0.5 -:0.5 F5:0.5 E5:0.5 D5:0.5 A4:0.5',
  'Bb4:1 D5:0.5 F5:0.5 C5:1 E5:0.5 G5:0.5',
  'A5:0.5 -:0.5 A5:0.5 -:0.5 C6:0.5 Bb5:0.5 A5:0.5 F5:0.5',
  'E5:0.5 F5:0.5 G5:0.5 A5:0.5 C#6:2',
];
const INTRO_CHORDS = ['Dm', 'Bb C', 'Dm', 'A'];

/** A メロ。 */
const VERSE_BARS = [
  'A4:1 D5:1 E5:0.5 F5:1 G5:0.5',
  'E5:1.5 C5:0.5 G4:1 C5:1',
  'D5:1 F5:1 Bb5:1.5 A5:0.5',
  'A5:2 E5:1 C#5:1',
  'D5:0.5 E5:0.5 F5:0.5 G5:0.5 Bb5:1 D6:1',
  'C#6:1.5 A5:0.5 E5:1 G5:1',
  'F5:1 A5:1 D6:1 Bb5:1',
  'A5:1 G5:0.5 F5:0.5 E5:1 C#5:1',
];
const VERSE_CHORDS = ['Dm', 'C', 'Bb', 'A', 'Gm', 'A', 'Dm Bb', 'A'];

/** サビ。付点の「レー・ドー・シ♭」で始まる、主題の核。 */
const CHORUS_BARS = [
  'D6:0.75 C6:0.75 Bb5:0.5 F5:1 D6:1',
  'E6:0.75 D6:0.75 C6:0.5 G5:1 E6:1',
  'C6:0.5 B5:0.5 A5:0.5 E5:0.5 C6:1 E6:1',
  'D6:2 A5:1 F5:1',
  'Bb5:0.75 A5:0.75 G5:0.5 D5:1 Bb5:1',
  'C6:0.75 Bb5:0.75 A5:0.5 G5:0.5 E5:0.5 C6:1',
  'F5:0.5 A5:0.5 C6:0.5 F6:0.5 E6:0.5 C#6:0.5 A5:1',
  'A5:0.5 C#6:0.5 E6:0.5 G6:0.5 A6:2',
];
const CHORUS_CHORDS = ['Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F A', 'A'];

/** オルガンの駆け上がり。 */
const RUN_BARS = [
  'D6:0.25 C6:0.25 A5:0.25 F5:0.25 D5:0.5 F5:0.5 A5:0.5 D6:0.5 F6:1',
  'E6:0.25 D6:0.25 C6:0.25 G5:0.25 E5:0.5 G5:0.5 C6:0.5 E6:0.5 G6:1',
  'F6:0.25 D6:0.25 Bb5:0.25 F5:0.25 D5:0.5 F5:0.5 Bb5:0.5 D6:0.5 F6:1',
  'E6:0.5 C#6:0.5 A5:0.5 E5:0.5 C#5:0.5 E5:0.5 A4:1',
];
const RUN_CHORDS = ['Dm', 'C', 'Bb', 'A'];

const INTRO = join4(...INTRO_BARS);
const VERSE = join4(...VERSE_BARS);
const CHORUS = join4(...CHORUS_BARS);
const RUN = join4(...RUN_BARS);

/** 旋律を 2 倍に引き伸ばしたときのコード。半分ずつの小節は 1 小節ずつに、1 つの小節は 2 小節にする。 */
const stretchChords = (symbols) => symbols.flatMap((bar) => (bar.includes(' ') ? bar.split(' ') : [bar, bar]));

/** ニ短調の旋律をニ長調にする。 */
const D_MAJOR = { F: 'F#', C: 'C#', Bb: 'B', 'A#': 'B' };

// ===== 変奏 =====

/** 01 完全版（160 BPM）。04 をもとに、最後にサビをもう一度、全楽器で鳴らす。 */
const theme01 = {
  file: 'theme-01',
  bpm: 160,
  mix: { drive: 0.3 },
  sections: [
    { name: 'intro', chords: bars(...INTRO_CHORDS), parts: [{ inst: 'brassLead', vol: 0.42, double: -1, notes: INTRO }], comp: ['brassHits'], bass: 'octave', drums: 'timp', fill: 'roll' },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'guitarLead', vol: 0.38, notes: VERSE }], comp: ['stabs', 'strings'], bass: 'octave', drums: 'rock', fill: 'snare' },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.4, notes: CHORUS },
        { inst: 'guitarLead', vol: 0.2, notes: shiftPhrase(CHORUS, -1) },
      ],
      comp: ['stabs', 'chug'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'snare',
    },
    { name: 'run', chords: bars(...RUN_CHORDS), parts: [{ inst: 'organ', vol: 0.36, notes: RUN }], comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' },
    {
      name: 'finale',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.42, double: -1, notes: CHORUS },
        { inst: 'organ', vol: 0.16, notes: shiftPhrase(CHORUS, -1) },
      ],
      comp: ['stabs', 'strings', 'brassHits'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'roll',
    },
  ],
};

/** 02 静（108 BPM・通常戦闘向け）。笛と分散和音で、考える時間を邪魔しない落ち着いた編曲。 */
const theme02 = {
  file: 'theme-02',
  bpm: 108,
  mix: { reverbLevel: 0.7, tone: 0.5 },
  sections: [
    { name: 'intro', chords: bars(...INTRO_CHORDS), parts: [{ inst: 'bell', vol: 0.36, notes: INTRO }], comp: ['arp8'], bass: 'sustain', drums: 'none' },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'flute', vol: 0.4, notes: VERSE }], comp: ['arp8', 'pad'], bass: 'walk', drums: 'light', energy: 0.8 },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [{ inst: 'brassLead', vol: 0.32, notes: CHORUS }],
      comp: ['strings', 'arp8'],
      bass: 'walk',
      drums: 'half',
      fill: 'snare',
      energy: 0.7,
    },
  ],
};

/** 03 思索（92 BPM・通常戦闘向け）。ベルと笛だけで、ほぼ打楽器なし。いちばん静か。 */
const theme03 = {
  file: 'theme-03',
  bpm: 92,
  mix: { reverbLevel: 0.8, tone: 0.4, echoLevel: 0.4 },
  sections: [
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'bell', vol: 0.42, notes: VERSE }], comp: ['arp8', 'pad'], bass: 'sustain', drums: 'none' },
    { name: 'chorus', chords: bars(...CHORUS_CHORDS), parts: [{ inst: 'flute', vol: 0.36, notes: CHORUS }], comp: ['pad', 'arp8'], bass: 'sustain', drums: 'light', energy: 0.5 },
  ],
};

/** 04 行軍（138 BPM・エリート向け）。金管と弦の刻み、行進のスネア。 */
const theme04 = {
  file: 'theme-04',
  bpm: 138,
  mix: { reverbLevel: 0.65, tone: 0.6 },
  sections: [
    { name: 'intro', chords: bars(...INTRO_CHORDS), parts: [{ inst: 'brassLead', vol: 0.42, double: -1, notes: INTRO }], comp: ['brassHits', 'strings'], bass: 'sustain', drums: 'timp', fill: 'roll' },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'brassLead', vol: 0.4, notes: VERSE }], comp: ['strings', 'arp16'], bass: 'walk', drums: 'march', fill: 'snare' },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [{ inst: 'brassLead', vol: 0.42, double: -1, notes: CHORUS }],
      comp: ['strings', 'brassHits', 'arp16'],
      bass: 'walk',
      drums: 'march',
      fill: 'roll',
    },
  ],
};

/** 05 激闘（176 BPM・ボス向け）。導入の動機をギターとオルガンのリフにし、駆けるベースで畳みかける。 */
const theme05 = {
  file: 'theme-05',
  bpm: 176,
  mix: { drive: 0.6, tone: 0.7 },
  sections: [
    {
      name: 'riff',
      chords: bars(...INTRO_CHORDS),
      parts: [
        { inst: 'guitarLead', vol: 0.38, notes: INTRO },
        { inst: 'organ', vol: 0.2, notes: shiftPhrase(INTRO, 1) },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'rock',
      fill: 'toms',
    },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'guitarLead', vol: 0.4, notes: VERSE }], comp: ['organ', 'chug'], bass: 'gallop', drums: 'drive', fill: 'snare' },
    { name: 'run', chords: bars(...RUN_CHORDS), parts: [{ inst: 'organ', vol: 0.36, notes: RUN }], comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.4, notes: CHORUS },
        { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(CHORUS, -1) },
      ],
      comp: ['stabs', 'chug', 'brassHits'],
      bass: 'drive8',
      drums: 'double',
      fill: 'snare',
    },
    {
      name: 'run2',
      chords: bars(...RUN_CHORDS),
      parts: [
        { inst: 'organ', vol: 0.36, notes: RUN },
        { inst: 'guitarLead', vol: 0.2, notes: shiftPhrase(RUN, -1) },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

/** 06 決戦（160 BPM・最終ボス向け）。導入の動機を倍の長さでオルガンが奏でる前奏 → 最後はサビを 1 音上げて（ホ短調）鳴らし切る。 */
const theme06 = {
  file: 'theme-06',
  bpm: 160,
  mix: { drive: 0.4, reverbLevel: 0.55 },
  sections: [
    {
      name: 'prelude',
      chords: bars(...stretchChords(INTRO_CHORDS)),
      parts: [{ inst: 'organ', vol: 0.34, notes: stretchPhrase(INTRO, 2) }],
      comp: ['strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'guitarLead', vol: 0.38, notes: VERSE }], comp: ['stabs', 'strings'], bass: 'octave', drums: 'rock', fill: 'snare' },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.4, notes: CHORUS },
        { inst: 'guitarLead', vol: 0.2, notes: shiftPhrase(CHORUS, -1) },
      ],
      comp: ['stabs', 'chug'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'roll',
    },
    {
      name: 'chorus-up',
      chords: bars(...transposeSymbols(CHORUS_CHORDS, 2)),
      parts: [
        { inst: 'brassLead', vol: 0.42, double: -1, notes: transposePhrase(CHORUS, 2) },
        { inst: 'organ', vol: 0.16, notes: shiftPhrase(transposePhrase(CHORUS, 2), -1) },
      ],
      comp: ['stabs', 'strings', 'brassHits'],
      bass: 'drive8',
      drums: 'double',
      fill: 'roll',
    },
  ],
};

/** 07 凱歌（132 BPM・ニ長調）。同じ旋律を長調にして、勝ち進む明るさに。エリート勝利後やマップ向けの候補。 */
const theme07 = {
  file: 'theme-07',
  bpm: 132,
  mix: { reverbLevel: 0.6, tone: 0.65 },
  sections: [
    { name: 'intro', chords: bars('D', 'Bm A', 'D', 'A'), parts: [{ inst: 'brassLead', vol: 0.42, double: -1, notes: remapPhrase(INTRO, D_MAJOR) }], comp: ['brassHits', 'strings'], bass: 'sustain', drums: 'timp', fill: 'roll' },
    {
      name: 'verse',
      chords: bars('D', 'A7', 'Bm', 'A', 'G', 'A7', 'D G', 'A7'),
      parts: [{ inst: 'flute', vol: 0.4, notes: remapPhrase(VERSE, D_MAJOR) }],
      comp: ['strings', 'arp16'],
      bass: 'walk',
      drums: 'march',
      fill: 'snare',
      energy: 0.8,
    },
    {
      name: 'chorus',
      chords: bars('Bm', 'A7', 'F#m', 'D', 'G', 'A7', 'F#m A', 'A7'),
      parts: [
        { inst: 'brassLead', vol: 0.42, double: -1, notes: remapPhrase(CHORUS, D_MAJOR) },
        { inst: 'bell', vol: 0.12, notes: shiftPhrase(remapPhrase(CHORUS, D_MAJOR), 1) },
      ],
      comp: ['strings', 'brassHits', 'arp16'],
      bass: 'walk',
      drums: 'march',
      fill: 'roll',
    },
  ],
};

/** 08 南風（172 BPM・ポケモン風）。シンセブラスの裏打ち、スラップベース、南国の打楽器。 */
const theme08 = {
  file: 'theme-08',
  bpm: 172,
  mix: { tone: 0.75, reverbLevel: 0.35 },
  sections: [
    { name: 'intro', chords: bars(...INTRO_CHORDS), parts: [{ inst: 'synthBrass', vol: 0.42, double: -1, notes: INTRO }], bass: 'slap', drums: 'tropical', fill: 'toms' },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'synthBrass', vol: 0.4, notes: VERSE }], comp: ['stabs'], bass: 'slap', drums: 'tropical', fill: 'snare' },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'synthBrass', vol: 0.4, double: -1, notes: CHORUS },
        { inst: 'bell', vol: 0.14, notes: shiftPhrase(CHORUS, 1) },
      ],
      comp: ['stabs', 'strings'],
      bass: 'slap',
      drums: 'drive',
      fill: 'snare',
    },
    { name: 'call', chords: bars(...RUN_CHORDS), parts: [{ inst: 'bell', vol: 0.36, notes: RUN }], bass: 'slap', drums: 'tropical', fill: 'toms', energy: 0.85 },
  ],
};

/** 09 剣閃（168 BPM・テイルズ風）。オルガンと歪みギターのロック。 */
const theme09 = {
  file: 'theme-09',
  bpm: 168,
  mix: { drive: 0.5 },
  sections: [
    {
      name: 'intro',
      chords: bars(...INTRO_CHORDS),
      parts: [
        { inst: 'guitarLead', vol: 0.36, notes: INTRO },
        { inst: 'organ', vol: 0.2, notes: shiftPhrase(INTRO, 1) },
      ],
      comp: ['chug'],
      bass: 'drive8',
      drums: 'rock',
      fill: 'toms',
    },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'guitarLead', vol: 0.4, notes: VERSE }], comp: ['organ', 'chug'], bass: 'drive8', drums: 'rock', fill: 'snare' },
    { name: 'chorus', chords: bars(...CHORUS_CHORDS), parts: [{ inst: 'organ', vol: 0.36, double: -1, notes: CHORUS }], comp: ['chug', 'pad'], bass: 'drive8', drums: 'drive', fill: 'snare' },
    { name: 'run', chords: bars(...RUN_CHORDS), parts: [{ inst: 'organ', vol: 0.36, notes: RUN }], comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' },
  ],
};

/** 10 夜明け（84 BPM・タイトル / マップ向け）。サビを倍の長さに引き伸ばし、笛 → 金管で歌い上げる。 */
const theme10 = {
  file: 'theme-10',
  bpm: 84,
  mix: { reverbLevel: 0.8, tone: 0.5 },
  sections: [
    {
      name: 'flute',
      chords: bars(...stretchChords(CHORUS_CHORDS.slice(0, 4))),
      parts: [{ inst: 'flute', vol: 0.4, notes: stretchPhrase(join4(...CHORUS_BARS.slice(0, 4)), 2) }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'brass',
      chords: bars(...stretchChords(CHORUS_CHORDS.slice(4))),
      parts: [{ inst: 'brassLead', vol: 0.36, notes: stretchPhrase(join4(...CHORUS_BARS.slice(4)), 2) }],
      comp: ['strings', 'arp8'],
      bass: 'walk',
      drums: 'light',
      energy: 0.6,
    },
  ],
};

const SONGS = [theme01, theme02, theme03, theme04, theme05, theme06, theme07, theme08, theme09, theme10];

mkdirSync(OUT_DIR, { recursive: true });
for (const song of SONGS) {
  const samples = renderSong(song);
  const file = join(OUT_DIR, `${song.file}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
