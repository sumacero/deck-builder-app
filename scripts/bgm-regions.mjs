// 地域ごとの BGM（マップ画面のフィールド曲と、エリート戦の曲）。generate-bgm.mjs が書き出す。
//
// 構成:
// - フィールド曲（12 小節）: 地域の前奏 → 地域の旋律 → メインテーマの導入の動機を地域の調で引用。
// - エリート戦（16 小節）: 新しいリフ → 地域の前奏と旋律をテンポを上げて → 導入の動機の引用。
// 曲の出だしはどれもメインテーマと違うフレーズにし、導入の動機は曲の後半にだけ置く。
import { shiftPhrase } from './bgm-engine.mjs';
import { bars, join4 } from './bgm-song.mjs';
import { introQuote } from './bgm-theme.mjs';

const sec = (name, chords, parts, style = {}) => ({ name, chords: bars(...chords), parts, ...style });
const lead = (inst, vol, notes, extra = {}) => ({ inst, vol, notes, ...extra });

// ===== 地域ごとの素材 =====

/** 火山・火と岩（ハ短調）。地響きのようなタムと低い金管。 */
const VOLCANO = {
  opening: {
    chords: ['Cm', 'Ab', 'Bb', 'G'],
    notes: join4('C5:1.5 Eb5:0.5 G5:2', 'Ab5:1.5 G5:0.5 Eb5:2', 'F5:1 Bb5:1 D6:1 C6:1', 'B5:3 -:1'),
  },
  theme: {
    chords: ['Fm', 'Cm', 'Ab', 'G'],
    notes: join4('F5:1 Ab5:1 C6:1.5 Bb5:0.5', 'G5:2 Eb5:1 C5:1', 'Eb5:1 Ab5:1 C6:1 Eb6:1', 'D6:2 B5:2'),
  },
  cameo: { chords: ['Cm', 'Ab Bb', 'Cm', 'G'], notes: introQuote({ semitones: -2 }) },
  riff: {
    chords: ['Cm', 'Eb', 'Ab', 'G'],
    notes: join4(
      'C5:0.5 C5:0.5 G5:0.5 C5:0.5 Ab5:0.5 C5:0.5 G5:0.5 F5:0.5',
      'Eb5:0.5 F5:0.5 G5:0.5 Ab5:0.5 Bb5:1 G5:1',
      'C5:0.5 C5:0.5 G5:0.5 C5:0.5 Ab5:0.5 C5:0.5 Bb5:0.5 Ab5:0.5',
      'G5:1 B5:1 D6:1 G5:1',
    ),
  },
};

/** 草原・草と風（ト長調）。風を受けて歩き出すような笛。 */
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

/** 水の古都・水と氷（嬰へ短調）。水の底に沈んだ都に、しずくのようなベルとハープが反響する。 */
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

/** 歯車塔・電と機械（ト短調）。歯車のように刻む分散和音と、矩形波の電子音。 */
const CLOCKWORK = {
  opening: {
    chords: ['Gm', 'Eb', 'F', 'D'],
    notes: join4('G5:0.5 D5:0.5 G5:0.5 Bb5:0.5 A5:1 F5:1', 'Eb5:0.5 G5:0.5 Bb5:0.5 Eb6:0.5 D6:2', 'F5:0.5 A5:0.5 C6:0.5 F6:0.5 Eb6:1 C6:1', 'D6:1 A5:1 F#5:2'),
  },
  theme: {
    chords: ['Cm', 'Gm', 'Eb', 'D'],
    notes: join4('Eb6:1.5 D6:0.5 C6:2', 'Bb5:1 D6:1 G6:2', 'G6:1 F6:0.5 Eb6:0.5 Bb5:1 G5:1', 'F#5:2 A5:2'),
  },
  cameo: {
    chords: ['Gm', 'Eb F', 'Gm', 'D'],
    notes: join4(introQuote({ bars: [0, 1], semitones: 5 }), 'Bb5:1 A5:1 G5:1 D5:1', 'F#5:2 D5:2'),
  },
  riff: {
    chords: ['Gm', 'Gm', 'Eb', 'D'],
    notes: join4(
      'G4:0.5 G5:0.5 D5:0.5 G5:0.5 F5:0.5 G5:0.5 D5:0.5 G5:0.5',
      'Bb4:0.5 G5:0.5 D5:0.5 G5:0.5 A5:0.5 G5:0.5 F5:0.5 D5:0.5',
      'Eb5:0.5 G5:0.5 Bb5:0.5 G5:0.5 Eb6:1 D6:1',
      'D5:0.5 F#5:0.5 A5:0.5 D6:0.5 C6:1 A5:1',
    ),
  },
  battleCameo: { chords: ['Gm', 'Eb F', 'Gm', 'D'], notes: introQuote({ semitones: 5 }) },
};

/** 地域の前奏と旋律をつないだ 8 小節（戦闘アレンジの中心）。 */
const themeOf = (region) => ({
  chords: [...region.opening.chords, ...region.theme.chords],
  notes: join4(region.opening.notes, region.theme.notes),
});

// ===== フィールド曲（マップ画面） =====

const fields = [
  {
    file: 'field-volcano',
    bpm: 86,
    mix: { reverbLevel: 0.6, tone: 0.5, drive: 0.15 },
    sections: [
      sec('opening', VOLCANO.opening.chords, [lead('brassLead', 0.32, VOLCANO.opening.notes, { double: -1 })], { comp: ['strings'], bass: 'sustain', drums: 'tribal' }),
      sec('theme', VOLCANO.theme.chords, [lead('strings', 0.36, VOLCANO.theme.notes)], { comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'tribal' }),
      sec('cameo', VOLCANO.cameo.chords, [lead('brassLead', 0.34, VOLCANO.cameo.notes), lead('organ', 0.16, shiftPhrase(VOLCANO.cameo.notes, 1))], { comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'tribal', fill: 'toms' }),
    ],
  },
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
    file: 'field-clockwork',
    bpm: 96,
    mix: { reverbLevel: 0.6, tone: 0.55, echoLevel: 0.35 },
    sections: [
      sec('opening', CLOCKWORK.opening.chords, [lead('bell', 0.34, CLOCKWORK.opening.notes)], { comp: ['arp16', 'pad'], bass: 'sustain', drums: 'light', energy: 0.4 }),
      sec('theme', CLOCKWORK.theme.chords, [lead('squareLead', 0.22, CLOCKWORK.theme.notes), lead('bell', 0.12, shiftPhrase(CLOCKWORK.theme.notes, -1))], { comp: ['arp16', 'pad'], bass: 'walk', drums: 'light', energy: 0.6 }),
      sec('cameo', CLOCKWORK.cameo.chords, [lead('organ', 0.28, CLOCKWORK.cameo.notes), lead('bell', 0.14, CLOCKWORK.cameo.notes)], { comp: ['arp16', 'strings'], bass: 'walk', drums: 'light', fill: 'snare', energy: 0.6 }),
    ],
  },
];

// ===== エリート戦 =====

/** リフ → 地域の旋律 → 導入の動機の引用。考える余裕を残すため、テンポは 114〜132 にとどめる。 */
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
    file: 'elite-volcano',
    bpm: 132,
    mix: { drive: 0.45, tone: 0.65 },
    region: VOLCANO,
    riff: { parts: (n) => [lead('guitarLead', 0.36, n)], style: { comp: ['chug'], bass: 'gallop', drums: 'rock', fill: 'toms' } },
    theme: { parts: (n) => [lead('brassLead', 0.38, n, { double: -1 })], style: { comp: ['chug', 'brassHits'], bass: 'drive8', drums: 'drive', energy: 0.85 } },
    cameo: { parts: (n) => [lead('guitarLead', 0.36, n), lead('organ', 0.2, shiftPhrase(n, 1))], style: { comp: ['chug', 'strings'], bass: 'gallop', drums: 'drive', fill: 'toms' } },
  }),
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
    file: 'elite-sunken-city',
    bpm: 114,
    mix: { reverbLevel: 0.8, tone: 0.55, echoLevel: 0.35 },
    region: SUNKEN_CITY,
    riff: { parts: (n) => [lead('triLead', 0.32, n)], style: { comp: ['arp16', 'strings'], bass: 'octave', drums: 'drive', energy: 0.7, fill: 'snare' } },
    theme: { parts: (n) => [lead('flute', 0.4, n), lead('bell', 0.14, shiftPhrase(n, 1))], style: { comp: ['arp16', 'pad'], bass: 'walk', drums: 'rock', energy: 0.7 } },
    cameo: { parts: (n) => [lead('brassLead', 0.36, n), lead('bell', 0.14, n)], style: { comp: ['stabs', 'strings'], bass: 'octave', drums: 'rock', fill: 'toms' } },
  }),
  battle({
    file: 'elite-clockwork',
    bpm: 122,
    mix: { drive: 0.2, tone: 0.6, reverbLevel: 0.5 },
    region: CLOCKWORK,
    riff: { parts: (n) => [lead('squareLead', 0.28, n)], style: { comp: ['arp16', 'chug'], bass: 'drive8', drums: 'drive', fill: 'snare' } },
    theme: { parts: (n) => [lead('brassLead', 0.36, n)], style: { comp: ['arp16', 'stabs'], bass: 'octave', drums: 'rock', energy: 0.8 } },
    cameo: { parts: (n) => [lead('guitarLead', 0.34, n), lead('bell', 0.14, n)], style: { comp: ['stabs', 'strings'], bass: 'drive8', drums: 'drive', fill: 'toms' } },
  }),
];

export const REGION_SONGS = [...fields, ...battles];
