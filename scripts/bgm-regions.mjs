// 地域ごとの BGM（マップ画面のフィールド曲と、エリート戦の曲）。generate-bgm.mjs が書き出す。
//
// 構成:
// - フィールド曲（12 小節）: 地域の前奏 → 地域の旋律 → メインテーマの導入の動機を地域の調で引用。
// - エリート戦（16 小節）: 新しいリフ → 地域の前奏と旋律をテンポを上げて → 導入の動機の引用。
// 曲の出だしはどれもメインテーマと違うフレーズにし、導入の動機は曲の後半にだけ置く。
import { shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, transposePhrase } from './bgm-song.mjs';
import { introQuote } from './bgm-theme.mjs';

const sec = (name, chords, parts, style = {}) => ({ name, chords: bars(...chords), parts, ...style });
const lead = (inst, vol, notes, extra = {}) => ({ inst, vol, notes, ...extra });

// ===== 地域ごとの素材 =====

/** 草原（ト長調）。風を受けて歩き出すような笛。 */
const GRASSLAND = {
  opening: {
    chords: ['G', 'C', 'D', 'G'],
    notes: join4('D5:1 G5:1 A5:0.5 B5:0.5 A5:1', 'G5:1.5 E5:0.5 C5:2', 'D5:0.5 E5:0.5 F#5:0.5 G5:0.5 A5:1 D6:1', 'B5:3 -:1'),
  },
  theme: {
    chords: ['Em', 'C', 'G', 'D'],
    notes: join4('B5:1 A5:0.5 G5:0.5 E5:2', 'C6:1 B5:0.5 A5:0.5 G5:1 E5:1', 'D5:1 G5:1 B5:1 D6:1', 'C6:1 B5:0.5 A5:0.5 F#5:2'),
  },
  cameo: {
    chords: ['G', 'C D', 'G', 'D G'],
    notes: join4(introQuote({ bars: [0, 1], major: true, semitones: 5 }), 'D6:0.5 -:0.5 D6:0.5 -:0.5 B5:0.5 A5:0.5 G5:0.5 D5:0.5', 'F#5:1 A5:1 G5:2'),
  },
  riff: {
    chords: ['Em', 'C', 'G', 'D'],
    notes: join4('E5:1 -:0.5 E5:0.5 G5:1 B5:1', 'C6:1.5 B5:0.5 A5:1 G5:1', 'B5:1 -:0.5 B5:0.5 D6:1 G5:1', 'A5:2 F#5:1 D5:1'),
  },
  battleCameo: { chords: ['G', 'C D', 'G', 'D'], notes: introQuote({ major: true, semitones: 5 }) },
};

/** 沼湿原（ホ短調・ドリア）。霧の中を手探りで進むような低いベル。 */
const SWAMP = {
  opening: {
    chords: ['Em', 'A', 'Em', 'A'],
    notes: join4('E4:1.5 G4:0.5 B4:1 A4:1', 'C#5:1.5 B4:0.5 A4:2', 'E4:1 G4:1 B4:1 D5:1', 'C#5:3 -:1'),
  },
  theme: {
    chords: ['Em', 'D', 'C', 'B'],
    notes: join4('B5:2 A5:1 G5:1', 'F#5:2 E5:1 D5:1', 'E5:1 G5:1 C6:1.5 B5:0.5', 'B5:2 D#5:2'),
  },
  cameo: {
    chords: ['Em', 'C D', 'Em', 'B'],
    notes: join4(introQuote({ bars: [0, 1], semitones: 2 }), 'G5:1 F#5:1 E5:1 B4:1', 'D#5:2 B4:2'),
  },
  riff: {
    chords: ['Em', 'A', 'Em', 'A'],
    notes: join4(
      'E5:0.5 E5:0.5 G5:0.5 E5:0.5 A5:0.5 E5:0.5 B5:0.5 A5:0.5',
      'C#6:0.5 B5:0.5 A5:0.5 F#5:0.5 E5:1 C#5:1',
      'E5:0.5 E5:0.5 G5:0.5 E5:0.5 B5:0.5 E5:0.5 D6:0.5 B5:0.5',
      'C#6:1 A5:1 F#5:1 C#5:1',
    ),
  },
};

/** 水の古都（嬰へ短調）。水の底に沈んだ都に、しずくのようなベルとハープが反響する。 */
const SUNKEN_CITY = {
  opening: {
    chords: ['F#m', 'D', 'E', 'C#m'],
    notes: join4('C#6:1.5 B5:0.5 A5:1 F#5:1', 'D6:1 F#6:1 E6:2', 'B5:0.5 C#6:0.5 B5:0.5 A5:0.5 G#5:1 E5:1', 'C#6:3 -:1'),
  },
  theme: {
    chords: ['Bm', 'F#m', 'D', 'C#'],
    notes: join4('D6:1 C#6:0.5 B5:0.5 F#5:2', 'A5:1 C#6:1 F#6:2', 'F#6:1 E6:0.5 D6:0.5 A5:1 F#5:1', 'F5:2 G#5:2'),
  },
  cameo: {
    chords: ['F#m', 'D E', 'F#m', 'C#'],
    notes: join4(introQuote({ bars: [0, 1], semitones: 4 }), 'A5:1 G#5:1 F#5:1 C#5:1', 'F5:2 C#5:2'),
  },
  riff: {
    chords: ['F#m', 'D', 'Bm', 'C#'],
    notes: join4(
      'F#5:0.5 C#6:0.5 F#6:0.5 C#6:0.5 E6:0.5 C#6:0.5 A5:0.5 C#6:0.5',
      'D6:0.5 A5:0.5 F#5:0.5 A5:0.5 D6:1 F#6:1',
      'B5:0.5 D6:0.5 F#6:0.5 D6:0.5 B5:1 F#5:1',
      'F5:0.5 G#5:0.5 C#6:0.5 G#5:0.5 F6:1 C#6:1',
    ),
  },
  battleCameo: { chords: ['F#m', 'D E', 'F#m', 'C#'], notes: introQuote({ semitones: 4 }) },
};

/** 砂漠（イ短調・和声的短音階）。陽炎の向こうの笛。 */
const DESERT = {
  opening: {
    chords: ['E', 'F', 'E', 'E'],
    notes: join4('E5:1 F5:0.5 G#5:0.5 A5:1 G#5:1', 'F5:1.5 E5:0.5 D5:1 C5:1', 'B4:0.5 C5:0.5 D5:0.5 E5:0.5 F5:1 E5:1', 'E5:3 -:1'),
  },
  theme: {
    chords: ['Am', 'Dm', 'E', 'Am'],
    notes: join4('A5:1 C6:1 B5:0.5 A5:0.5 G#5:1', 'F5:1 A5:1 D6:2', 'B5:0.5 C6:0.5 B5:0.5 A5:0.5 G#5:1 E5:1', 'A5:3 -:1'),
  },
  cameo: {
    chords: ['Am', 'F E', 'Dm E', 'Am'],
    notes: join4(introQuote({ bars: [0, 1], semitones: 7, remap: { G: 'G#' } }), 'E6:0.5 D6:0.5 C6:0.5 B5:0.5 A5:1 G#5:1', 'A5:3 -:1'),
  },
  riff: {
    chords: ['E', 'F E', 'Am', 'E'],
    notes: transposePhrase(
      join4(
        'A5:0.5 Bb5:0.5 C#6:0.5 D6:0.5 E6:1 D6:0.5 C#6:0.5',
        'Bb5:1 A5:0.5 G5:0.5 A5:2',
        'A5:0.5 Bb5:0.5 C#6:0.5 D6:0.5 F6:1 E6:0.5 D6:0.5',
        'C#6:0.5 D6:0.5 Bb5:0.5 C#6:0.5 A5:2',
      ),
      -5,
    ),
  },
};

/** 氷雪（ロ短調）。凍った空気にきらめくベルとハープ。 */
const SNOWFIELD = {
  opening: {
    chords: ['Bm', 'G', 'D', 'A'],
    notes: join4('F#6:1 D6:1 B5:2', 'G6:1 D6:1 B5:2', 'A6:1 F#6:1 D6:1 A5:1', 'C#6:3 -:1'),
  },
  theme: {
    chords: ['Em', 'F#', 'Bm', 'G A'],
    notes: join4('B5:1.5 E6:0.5 G6:2', 'F#6:1 E6:0.5 C#6:0.5 A#5:2', 'B5:1 D6:1 F#6:1 B6:1', 'B6:1 G6:1 A6:1 E6:1'),
  },
  cameo: { chords: ['Bm', 'G A', 'Bm', 'F#'], notes: introQuote({ semitones: 9 }) },
  riff: {
    chords: ['Bm', 'G', 'A', 'F#'],
    notes: join4(
      'B5:0.5 F#5:0.5 B5:0.5 D6:0.5 C#6:0.5 B5:0.5 A5:0.5 F#5:0.5',
      'G5:0.5 B5:0.5 D6:0.5 G6:0.5 F#6:1 D6:1',
      'A5:0.5 C#6:0.5 E6:0.5 A6:0.5 G6:1 E6:1',
      'F#6:2 C#6:1 A#5:1',
    ),
  },
};

/** 地域の前奏と旋律をつないだ 8 小節（戦闘アレンジの中心）。 */
const themeOf = (region) => ({
  chords: [...region.opening.chords, ...region.theme.chords],
  notes: join4(region.opening.notes, region.theme.notes),
});

// ===== フィールド曲（マップ画面） =====

const fields = [
  {
    file: 'field-grassland',
    bpm: 92,
    mix: { reverbLevel: 0.55, tone: 0.6 },
    sections: [
      sec('opening', GRASSLAND.opening.chords, [lead('flute', 0.4, GRASSLAND.opening.notes)], { comp: ['arp8', 'pad'], bass: 'sustain' }),
      sec('theme', GRASSLAND.theme.chords, [lead('flute', 0.4, GRASSLAND.theme.notes), lead('bell', 0.14, shiftPhrase(GRASSLAND.theme.notes, -1))], { comp: ['arp8', 'pad'], bass: 'walk', drums: 'light', energy: 0.6 }),
      sec('cameo', GRASSLAND.cameo.chords, [lead('flute', 0.4, GRASSLAND.cameo.notes)], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'light', fill: 'snare', energy: 0.6 }),
    ],
  },
  {
    file: 'field-swamp',
    bpm: 78,
    mix: { reverbLevel: 0.8, tone: 0.4, echoLevel: 0.4 },
    sections: [
      sec('opening', SWAMP.opening.chords, [lead('bell', 0.4, SWAMP.opening.notes)], { comp: ['pad'], bass: 'sustain', drums: 'swamp' }),
      sec('theme', SWAMP.theme.chords, [lead('flute', 0.34, SWAMP.theme.notes)], { comp: ['pad', 'arp8'], bass: 'walk', drums: 'swamp' }),
      sec('cameo', SWAMP.cameo.chords, [lead('softKey', 0.4, SWAMP.cameo.notes)], { comp: ['pad'], bass: 'sustain', drums: 'swamp' }),
    ],
  },
  {
    file: 'field-sunken-city',
    bpm: 74,
    mix: { reverbLevel: 0.95, tone: 0.45, echoLevel: 0.5 },
    sections: [
      sec('opening', SUNKEN_CITY.opening.chords, [lead('bell', 0.36, SUNKEN_CITY.opening.notes)], { comp: ['arp16', 'pad'], bass: 'sustain' }),
      sec('theme', SUNKEN_CITY.theme.chords, [lead('flute', 0.34, SUNKEN_CITY.theme.notes), lead('bell', 0.12, shiftPhrase(SUNKEN_CITY.theme.notes, 1))], { comp: ['arp16', 'pad'], bass: 'sustain', drums: 'timp', energy: 0.5 }),
      sec('cameo', SUNKEN_CITY.cameo.chords, [lead('softKey', 0.36, SUNKEN_CITY.cameo.notes), lead('bell', 0.14, SUNKEN_CITY.cameo.notes)], { comp: ['arp16', 'pad'], bass: 'sustain' }),
    ],
  },
  {
    file: 'field-desert',
    bpm: 88,
    mix: { reverbLevel: 0.6, tone: 0.55, echoLevel: 0.35 },
    sections: [
      sec('opening', DESERT.opening.chords, [lead('flute', 0.38, DESERT.opening.notes)], { comp: ['pad'], bass: 'sustain', drums: 'desert' }),
      sec('theme', DESERT.theme.chords, [lead('flute', 0.4, DESERT.theme.notes)], { comp: ['arp8', 'pad'], bass: 'walk', drums: 'desert' }),
      sec('cameo', DESERT.cameo.chords, [lead('flute', 0.38, DESERT.cameo.notes), lead('bell', 0.14, DESERT.cameo.notes)], { comp: ['arp8'], bass: 'walk', drums: 'desert' }),
    ],
  },
  {
    file: 'field-snowfield',
    bpm: 72,
    mix: { reverbLevel: 0.9, tone: 0.5, echoLevel: 0.4 },
    sections: [
      sec('opening', SNOWFIELD.opening.chords, [lead('bell', 0.36, SNOWFIELD.opening.notes)], { comp: ['arp16', 'pad'], bass: 'sustain' }),
      sec('theme', SNOWFIELD.theme.chords, [lead('flute', 0.34, SNOWFIELD.theme.notes)], { comp: ['arp16', 'pad'], bass: 'sustain', drums: 'timp', energy: 0.6 }),
      sec('cameo', SNOWFIELD.cameo.chords, [lead('bell', 0.36, SNOWFIELD.cameo.notes)], { comp: ['arp16', 'pad'], bass: 'sustain' }),
    ],
  },
];

// ===== エリート戦 =====

/** リフ → 地域の旋律 → 導入の動機の引用。考える余裕を残すため、テンポは 108〜124 にとどめる。 */
function battle({ file, bpm, mix, region, riff, theme, cameo }) {
  const main = themeOf(region);
  return {
    file,
    bpm,
    mix,
    sections: [
      sec('riff', region.riff.chords, riff.parts(region.riff.notes), riff.style),
      sec('theme', main.chords, theme.parts(main.notes), theme.style),
      sec('cameo', (region.battleCameo ?? region.cameo).chords, cameo.parts((region.battleCameo ?? region.cameo).notes), cameo.style),
    ],
  };
}

const battles = [
  battle({
    file: 'elite-grassland',
    bpm: 116,
    mix: { reverbLevel: 0.5, tone: 0.6 },
    region: GRASSLAND,
    riff: { parts: (n) => [lead('brassLead', 0.36, n)], style: { comp: ['strings', 'arp8'], bass: 'walk', drums: 'march', fill: 'snare' } },
    theme: { parts: (n) => [lead('flute', 0.42, n)], style: { comp: ['arp8', 'strings'], bass: 'octave', drums: 'rock', energy: 0.75, fill: 'snare' } },
    cameo: { parts: (n) => [lead('brassLead', 0.38, n), lead('flute', 0.18, n)], style: { comp: ['stabs', 'strings'], bass: 'octave', drums: 'rock', fill: 'toms' } },
  }),
  battle({
    file: 'elite-swamp',
    bpm: 108,
    mix: { reverbLevel: 0.65, tone: 0.5, echoLevel: 0.35 },
    region: SWAMP,
    riff: { parts: (n) => [lead('triLead', 0.34, n)], style: { comp: ['pad'], bass: 'octave', drums: 'half', fill: 'snare' } },
    theme: { parts: (n) => [lead('softKey', 0.4, n)], style: { comp: ['pad', 'arp8'], bass: 'walk', drums: 'rock', energy: 0.7 } },
    cameo: { parts: (n) => [lead('brassLead', 0.36, n)], style: { comp: ['stabs', 'pad'], bass: 'octave', drums: 'drive', energy: 0.8, fill: 'toms' } },
  }),
  battle({
    file: 'elite-sunken-city',
    bpm: 114,
    mix: { reverbLevel: 0.8, tone: 0.55, echoLevel: 0.35 },
    region: SUNKEN_CITY,
    riff: { parts: (n) => [lead('triLead', 0.32, n)], style: { comp: ['arp16', 'strings'], bass: 'octave', drums: 'drive', energy: 0.7, fill: 'snare' } },
    theme: { parts: (n) => [lead('flute', 0.4, n), lead('bell', 0.14, shiftPhrase(n, 1))], style: { comp: ['arp16', 'pad'], bass: 'walk', drums: 'rock', energy: 0.7 } },
    cameo: { parts: (n) => [lead('brassLead', 0.36, n), lead('bell', 0.14, n)], style: { comp: ['stabs', 'strings'], bass: 'octave', drums: 'rock', fill: 'toms' } },
  }),
  battle({
    file: 'elite-desert',
    bpm: 124,
    mix: { reverbLevel: 0.5, tone: 0.6, echoLevel: 0.3 },
    region: DESERT,
    riff: { parts: (n) => [lead('squareLead', 0.28, n)], style: { comp: ['pad', 'arp8'], bass: 'gallop', drums: 'desertDrive', fill: 'toms' } },
    theme: { parts: (n) => [lead('flute', 0.42, n)], style: { comp: ['arp8', 'strings'], bass: 'octave', drums: 'desertDrive', energy: 0.8 } },
    cameo: { parts: (n) => [lead('brassLead', 0.36, n), lead('flute', 0.18, n)], style: { comp: ['stabs', 'arp8'], bass: 'octave', drums: 'desertDrive', fill: 'toms' } },
  }),
  battle({
    file: 'elite-snowfield',
    bpm: 120,
    mix: { reverbLevel: 0.7, tone: 0.55 },
    region: SNOWFIELD,
    riff: { parts: (n) => [lead('triLead', 0.32, n)], style: { comp: ['arp16', 'strings'], bass: 'octave', drums: 'drive', energy: 0.7, fill: 'snare' } },
    theme: { parts: (n) => [lead('triLead', 0.34, shiftPhrase(n, -1)), lead('bell', 0.14, n)], style: { comp: ['arp16', 'pad'], bass: 'walk', drums: 'rock', energy: 0.7 } },
    cameo: { parts: (n) => [lead('brassLead', 0.34, shiftPhrase(n, -1))], style: { comp: ['arp16', 'strings'], bass: 'octave', drums: 'rock', fill: 'toms' } },
  }),
];

export const REGION_SONGS = [...fields, ...battles];
