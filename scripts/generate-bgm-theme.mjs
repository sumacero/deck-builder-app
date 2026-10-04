// メインテーマ「三つの旗」（試作 04）の変奏と、それをもとにしたタイトル・通常・エリート・ボスの曲案を
// 合成して assets/music/theme/*.wav に書き出す。
// 実行: npm run bgm:theme
//
// オーナーの好み: 1 つのメインテーマのコードやフレーズが、どの戦闘曲にも入っている構成。
// そこで 04 の 4 つの素材（導入の動機・A メロ・サビ・オルガンの駆け上がり）とコード進行を共有し、
// テンポ・楽器・調・リズムだけを変えて、通常戦闘からボス・タイトル向けまでの変奏を作る。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAMPLE_RATE, seedNoise, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, renderSong, stretchPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
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

// ===== 変奏 =====

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

// ===== メインテーマ案（タイトル・通常・エリート・ボス） =====
// オーナーの方針: タイトルと通常戦闘にはサビを入れず、エリート戦で初めて登場させる。
// 曲の出だしは 4 曲とも別のフレーズにし、共通の旋律は曲の途中にだけ置く。
// - A メロの頭: タイトル（倍の長さ）・通常（前半 4 小節）・エリート（全部）
// - サビ: エリート・ボス（ボスはさらに上へ転調する新しいサビが続く）
// 長さはタイトル ≒ 通常 < エリート < ボス。

/** タイトル（72 BPM・約 40 秒）。笛の新しい旋律で始まり、中ほどで A メロの頭を金管がゆったり歌う。サビなし。 */
const mainTitle = {
  file: 'main-title',
  bpm: 72,
  mix: { reverbLevel: 0.85, tone: 0.45, echoLevel: 0.35 },
  sections: [
    {
      name: 'opening',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      parts: [{ inst: 'flute', vol: 0.4, notes: join4('A5:2 G5:1 F5:1', 'D5:3 F5:1', 'C5:2 F5:1 A5:1', 'G5:4') }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'verse-head',
      chords: bars('Dm', 'Dm', 'C', 'C'),
      parts: [{ inst: 'brassLead', vol: 0.32, notes: stretchPhrase(join4(...VERSE_BARS.slice(0, 2)), 2) }],
      comp: ['strings', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
    },
    {
      name: 'closing',
      chords: bars('Bb', 'Gm', 'A', 'A7'),
      parts: [{ inst: 'flute', vol: 0.38, notes: join4('D5:2 F5:2', 'Bb5:2 A5:1 G5:1', 'A5:3 E5:1', 'C#5:4') }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
  ],
};

/** 通常戦闘（100 BPM・約 38 秒）。02 と 03 の中間。ベルの新しい旋律 → 笛で A メロの前半と新しい後半 → 締め。サビなし。 */
const mainNormal = {
  file: 'main-normal',
  bpm: 100,
  mix: { reverbLevel: 0.75, tone: 0.45, echoLevel: 0.3 },
  sections: [
    {
      name: 'opening',
      chords: bars('Dm', 'Am', 'Bb', 'A'),
      parts: [
        {
          inst: 'bell',
          vol: 0.4,
          notes: join4('D5:0.5 F5:0.5 A5:1 G5:0.5 F5:0.5 E5:1', 'C5:0.5 E5:0.5 A5:1 G5:1 E5:1', 'D5:0.5 F5:0.5 Bb5:1 A5:0.5 G5:0.5 F5:1', 'E5:2 C#5:1 A4:1'),
        },
      ],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'verse',
      chords: bars(...VERSE_CHORDS),
      parts: [
        {
          inst: 'flute',
          vol: 0.4,
          notes: join4(...VERSE_BARS.slice(0, 4), 'Bb4:1 D5:1 G5:1.5 F5:0.5', 'E5:2 C#5:1 A4:1', 'D5:1 F5:0.5 A5:0.5 Bb5:1 G5:1', 'A5:3 -:1'),
        },
      ],
      comp: ['arp8', 'pad'],
      bass: 'walk',
      drums: 'light',
      energy: 0.7,
    },
    {
      name: 'closing',
      chords: bars('Gm', 'Dm', 'Bb', 'A'),
      parts: [
        {
          inst: 'bell',
          vol: 0.38,
          notes: join4('Bb5:1 A5:0.5 G5:0.5 D5:2', 'F5:1 E5:0.5 D5:0.5 A4:2', 'G4:0.5 Bb4:0.5 D5:0.5 F5:0.5 Bb5:1 A5:1', 'A5:2 E5:1 C#5:1'),
        },
      ],
      comp: ['pad', 'arp8'],
      bass: 'walk',
      drums: 'half',
      fill: 'snare',
      energy: 0.6,
    },
  ],
};

/** エリート戦（156 BPM・約 49 秒）。05 のテンポを落とし、サビの前に溜めを入れた。サビはここで初めて登場。 */
const mainElite = {
  file: 'main-elite',
  bpm: 156,
  mix: { drive: 0.5, tone: 0.7 },
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
      name: 'build',
      chords: bars('Gm', 'A', 'Bb', 'A'),
      parts: [{ inst: 'brassLead', vol: 0.36, notes: join4('G5:4', 'A5:4', 'Bb5:4', 'C#6:4') }],
      comp: ['strings'],
      bass: 'sustain',
      drums: 'half',
      fill: 'roll',
    },
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
      fill: 'toms',
    },
  ],
};

/** ボスのサビの後に続く新しいサビ（ホ短調）。付点のリズムはサビと同じで、さらに高く駆け上がる。 */
const SUPER_CHORUS_BARS = [
  'E6:0.75 G6:0.75 B6:0.5 A6:1 G6:1',
  'F#6:0.75 A6:0.75 D7:0.5 C7:1 A6:1',
  'B6:0.75 A6:0.75 F#6:0.5 D6:1 F#6:1',
  'G6:2 B6:1 E7:1',
  'C7:0.75 B6:0.75 A6:0.5 E6:1 C7:1',
  'D7:0.75 C7:0.75 A6:0.5 F#6:0.5 D6:0.5 A6:1',
];
const SUPER_CHORUS = shiftPhrase(
  join4(
    ...SUPER_CHORUS_BARS,
    'B6:1 D#7:1 F#7:1 D#7:1',
    'E7:2 D#7:1 B6:1',
    ...SUPER_CHORUS_BARS,
    'E6:0.5 G6:0.5 C7:1 B6:0.5 G6:0.5 E6:1',
    'C#7:1 A6:1 E6:1 C#6:1',
  ),
  -1,
);
const SUPER_CHORUS_CHORDS = ['C', 'D', 'Bm', 'Em', 'Am', 'D', 'B', 'B', 'C', 'D', 'Bm', 'Em', 'Am', 'D', 'C', 'A'];

/** ボス戦（176 BPM・約 60 秒）。不穏な前奏と新しいリフで始まり、ボス専用の旋律 → 溜め → サビ → さらに盛り上がる新しいサビ。 */
const mainBoss = {
  file: 'main-boss',
  bpm: 176,
  mix: { drive: 0.6, tone: 0.72, reverbLevel: 0.5 },
  sections: [
    {
      name: 'prelude',
      chords: bars('Dm', 'Eb', 'Dm', 'A'),
      parts: [{ inst: 'organ', vol: 0.3, notes: join4('D4:4', 'Eb4:4', 'D4:4', 'C#4:4') }],
      comp: ['strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'riff',
      chords: bars('Dm', 'Dm', 'Eb', 'A'),
      parts: [
        {
          inst: 'guitarLead',
          vol: 0.38,
          double: 1,
          notes: join4(
            'D4:0.5 D4:0.5 D5:0.5 D4:0.5 C5:0.5 D4:0.5 A4:0.5 Bb4:0.5',
            'D4:0.5 D4:0.5 D5:0.5 D4:0.5 F5:0.5 E5:0.5 C5:0.5 A4:0.5',
            'Eb4:0.5 Eb4:0.5 Eb5:0.5 Eb4:0.5 D5:0.5 Eb4:0.5 Bb4:0.5 G4:0.5',
            'A4:0.5 C#5:0.5 E5:0.5 G5:0.5 A5:0.5 G5:0.5 E5:0.5 C#5:0.5',
          ),
        },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'rock',
      fill: 'toms',
    },
    {
      name: 'boss-theme',
      chords: bars('Dm', 'Eb', 'Dm', 'C', 'Bb', 'Gm', 'Eb', 'A'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.4,
          double: -1,
          notes: join4(
            'A5:1.5 D6:0.5 F6:1 E6:1',
            'Eb6:1.5 D6:0.5 Bb5:2',
            'A5:1 D6:1 F6:1 A6:1',
            'G6:1.5 E6:0.5 C6:2',
            'D6:1 F6:1 Bb6:1.5 A6:0.5',
            'G6:1 D6:1 Bb5:1 G5:1',
            'Bb5:0.5 C6:0.5 Eb6:0.5 G6:0.5 F6:1 Eb6:1',
            'E6:2 C#6:1 A5:1',
          ),
        },
      ],
      comp: ['stabs', 'strings'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'build',
      chords: bars('Bb', 'C', 'Gm', 'A'),
      parts: [{ inst: 'brassLead', vol: 0.38, notes: join4('D6:4', 'E6:4', 'D6:2 Bb5:2', 'C#6:4') }],
      comp: ['strings', 'brassHits'],
      bass: 'sustain',
      drums: 'half',
      fill: 'roll',
    },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.4, notes: CHORUS },
        { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(CHORUS, -1) },
      ],
      comp: ['stabs', 'chug'],
      bass: 'drive8',
      drums: 'double',
      fill: 'roll',
    },
    {
      name: 'super-chorus',
      chords: bars(...SUPER_CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.42, double: -1, notes: SUPER_CHORUS },
        { inst: 'guitarLead', vol: 0.18, notes: SUPER_CHORUS },
      ],
      comp: ['stabs', 'strings', 'brassHits', 'chug'],
      bass: 'drive8',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

const SONGS = [theme02, theme05, theme06, theme10, mainTitle, mainNormal, mainElite, mainBoss];

mkdirSync(OUT_DIR, { recursive: true });
for (const song of SONGS) {
  seedNoise(4242);
  const samples = renderSong(song);
  const file = join(OUT_DIR, `${song.file}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
