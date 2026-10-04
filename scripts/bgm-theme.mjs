// メインテーマ「三つの旗」の素材（ニ短調）。generate-bgm.mjs と bgm-regions.mjs で共有する。
import { join4, remapPhrase, transposePhrase } from './bgm-song.mjs';

/** 導入の動機。休符をはさんだ「レ・レ・ファミレラ」。 */
export const INTRO_BARS = [
  'D5:0.5 -:0.5 D5:0.5 -:0.5 F5:0.5 E5:0.5 D5:0.5 A4:0.5',
  'Bb4:1 D5:0.5 F5:0.5 C5:1 E5:0.5 G5:0.5',
  'A5:0.5 -:0.5 A5:0.5 -:0.5 C6:0.5 Bb5:0.5 A5:0.5 F5:0.5',
  'E5:0.5 F5:0.5 G5:0.5 A5:0.5 C#6:2',
];
export const INTRO_CHORDS = ['Dm', 'Bb C', 'Dm', 'A'];

/** A メロ。 */
export const VERSE_BARS = [
  'A4:1 D5:1 E5:0.5 F5:1 G5:0.5',
  'E5:1.5 C5:0.5 G4:1 C5:1',
  'D5:1 F5:1 Bb5:1.5 A5:0.5',
  'A5:2 E5:1 C#5:1',
  'D5:0.5 E5:0.5 F5:0.5 G5:0.5 Bb5:1 D6:1',
  'C#6:1.5 A5:0.5 E5:1 G5:1',
  'F5:1 A5:1 D6:1 Bb5:1',
  'A5:1 G5:0.5 F5:0.5 E5:1 C#5:1',
];
export const VERSE_CHORDS = ['Dm', 'C', 'Bb', 'A', 'Gm', 'A', 'Dm Bb', 'A'];

/** サビ。付点の「レー・ドー・シ♭」で始まる、主題の核。 */
export const CHORUS_BARS = [
  'D6:0.75 C6:0.75 Bb5:0.5 F5:1 D6:1',
  'E6:0.75 D6:0.75 C6:0.5 G5:1 E6:1',
  'C6:0.5 B5:0.5 A5:0.5 E5:0.5 C6:1 E6:1',
  'D6:2 A5:1 F5:1',
  'Bb5:0.75 A5:0.75 G5:0.5 D5:1 Bb5:1',
  'C6:0.75 Bb5:0.75 A5:0.5 G5:0.5 E5:0.5 C6:1',
  'F5:0.5 A5:0.5 C6:0.5 F6:0.5 E6:0.5 C#6:0.5 A5:1',
  'A5:0.5 C#6:0.5 E6:0.5 G6:0.5 A6:2',
];
export const CHORUS_CHORDS = ['Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F A', 'A'];

/** オルガンの駆け上がり。 */
export const RUN_BARS = [
  'D6:0.25 C6:0.25 A5:0.25 F5:0.25 D5:0.5 F5:0.5 A5:0.5 D6:0.5 F6:1',
  'E6:0.25 D6:0.25 C6:0.25 G5:0.25 E5:0.5 G5:0.5 C6:0.5 E6:0.5 G6:1',
  'F6:0.25 D6:0.25 Bb5:0.25 F5:0.25 D5:0.5 F5:0.5 Bb5:0.5 D6:0.5 F6:1',
  'E6:0.5 C#6:0.5 A5:0.5 E5:0.5 C#5:0.5 E5:0.5 A4:1',
];
export const RUN_CHORDS = ['Dm', 'C', 'Bb', 'A'];

export const INTRO = join4(...INTRO_BARS);
export const VERSE = join4(...VERSE_BARS);
export const CHORUS = join4(...CHORUS_BARS);
export const RUN = join4(...RUN_BARS);

/** ニ短調の旋律をニ長調にする。 */
export const D_MAJOR = { F: 'F#', C: 'C#', Bb: 'B', 'A#': 'B' };

/**
 * 導入の動機の一部を、地域の調に移して引用する。
 * bars は使う小節（0〜3）、major で長調に、semitones で移調、remap で音を置き換える（和声的短音階の G → G# など）。
 */
export function introQuote({ bars = [0, 1, 2, 3], major = false, semitones = 0, remap } = {}) {
  let text = join4(...bars.map((index) => INTRO_BARS[index]));
  if (major) text = remapPhrase(text, D_MAJOR);
  text = transposePhrase(text, semitones);
  return remap ? remapPhrase(text, remap) : text;
}
