// 各マップのエリート戦の候補。マップごとに 10 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 今のそのマップのエリート戦（地域のボスの勢い）を少し落ち着かせた編成。
// 後半 4 小節で、章ボスのイントロ 2 小節とラスボスのイントロ 2 小節を、ベルか弦でかすかに乗せる。
import { parsePhrase } from './bgm-engine.mjs';
import { bars, join4, remapPhrase, transposePhrase } from './bgm-song.mjs';
import { D_MAJOR, introQuote } from './bgm-theme.mjs';

/** ラスボス戦イントロの頭。付点の「レー・ドー・シ♭」。 */
const FINAL_INTRO_HEAD = ['D6:1.5 C6:1.5 Bb5:1', 'E6:0.75 D6:0.75 C6:0.5 F6:0.75 E6:0.75 D6:0.5'];

const phrase = (lines) => lines.join(' | ');

/** 章ボスのイントロ（導入の動機）2 小節 + ラスボスのイントロ 2 小節。地域の調へ移す。 */
const faintIntro = ({ major = false, semitones = 0 }) => {
  const boss = introQuote({ bars: [0, 1], major, semitones });
  let finalIntro = join4(...FINAL_INTRO_HEAD);
  if (major) finalIntro = remapPhrase(finalIntro, D_MAJOR);
  finalIntro = transposePhrase(finalIntro, semitones);
  return `${boss} | ${finalIntro}`;
};

const REGIONS = {
  grassland: {
    slug: 'grassland',
    bpm: 120,
    mix: { reverbLevel: 0.55, tone: 0.58, echoLevel: 0.18 },
    lead: 'flute',
    leadVol: 0.38,
    quote: 'bell',
    comp: ['arp8', 'pad'],
    bass: 'walk',
    drums: 'march',
    chords: ['G', 'D', 'Em', 'C'],
    later: ['G', 'C', 'D', 'G'],
    quoteKey: { major: true, semitones: 5 },
  },
  volcano: {
    slug: 'volcano',
    bpm: 108,
    mix: { reverbLevel: 0.5, tone: 0.55, echoLevel: 0.16 },
    lead: 'guitarLead',
    leadVol: 0.32,
    quote: 'bell',
    comp: ['strings', 'pad'],
    bass: 'sustain',
    drums: 'tribal',
    chords: ['Cm', 'Ab', 'Bb', 'G'],
    later: ['Cm', 'Eb', 'Ab', 'G'],
    quoteKey: { semitones: -2 },
  },
  sunken: {
    slug: 'sunken',
    bpm: 100,
    mix: { reverbLevel: 0.85, tone: 0.48, echoLevel: 0.32 },
    lead: 'bell',
    leadVol: 0.32,
    quote: 'strings',
    comp: ['arp16', 'pad'],
    bass: 'sustain',
    drums: 'half',
    chords: ['F#m', 'D', 'E', 'C#m'],
    later: ['F#m', 'Bm', 'E', 'C#'],
    quoteKey: { semitones: 4 },
  },
  clockwork: {
    slug: 'clockwork',
    bpm: 108,
    mix: { reverbLevel: 0.58, tone: 0.52, echoLevel: 0.22 },
    lead: 'squareLead',
    leadVol: 0.18,
    quote: 'bell',
    comp: ['organ', 'pad'],
    bass: 'walk',
    drums: 'light',
    chords: ['Gm', 'Eb', 'F', 'D'],
    later: ['Gm', 'Cm', 'Eb', 'D'],
    quoteKey: { semitones: 5 },
  },
};

/** 各曲 8 小節。前半が歌、後半は歌を続けながらイントロをかすかに乗せる。 */
const MELODIES = {
  grassland: [
    ['D5:1 G5:1 A5:0.5 B5:0.5 A5:1', 'G5:1.5 E5:0.5 D5:2', 'C5:1 D5:1 E5:1 G5:1', 'F#5:2 D5:2', 'B5:2 A5:1 G5:1', 'E5:1 G5:1 C6:2', 'A5:1 B5:1 D6:1 B5:1', 'A5:2 G5:2'],
    ['G5:2 E5:1 D5:1', 'B5:1 A5:1 G5:2', 'D5:0.5 E5:0.5 G5:1 A5:1 B5:1', 'A5:2 G5:2', 'C6:1 B5:1 A5:2', 'G5:1.5 E5:0.5 D5:2', 'F#5:1 A5:1 G5:2', 'D5:4'],
    ['D5:0.5 G5:0.5 B5:1 A5:1 G5:1', 'E5:2 D5:2', 'C5:1 E5:1 G5:2', 'A5:1 F#5:1 D5:2', 'B5:1 G5:1 D6:1 B5:1', 'A5:2 G5:1 E5:1', 'D6:1 C6:1 B5:2', 'A5:2 G5:2'],
    ['G5:4', 'A5:2 B5:2', 'G5:1 E5:1 D5:2', 'F#5:4', 'D6:2 B5:2', 'C6:1 A5:1 G5:2', 'E5:1 F#5:1 G5:2', 'D5:4'],
    ['E5:1 G5:1 B5:1 G5:1', 'A5:1 G5:1 E5:2', 'D5:1 G5:1 A5:2', 'F#5:2 D5:2', 'B5:1 A5:0.5 G5:0.5 E5:2', 'C6:2 B5:1 A5:1', 'G5:1 D5:1 B4:2', 'A4:2 G4:2'],
    ['D5:1.5 E5:0.5 G5:2', 'A5:1 B5:1 D6:1 B5:1', 'G5:2 E5:2', 'F#5:1 G5:1 A5:2', 'B5:2 A5:1 G5:1', 'E5:2 C5:1 D5:1', 'G5:1 A5:1 B5:2', 'D5:4'],
    ['G5:0.5 -:0.5 D5:0.5 -:0.5 B5:2', 'A5:1 -:0.5 G5:0.5 E5:2', 'D5:1 G5:1 A5:2', 'F#5:2 -:2', 'B5:1 A5:1 G5:2', 'E5:1 G5:1 D6:2', 'C6:1 B5:1 A5:2', 'G5:4'],
    ['D5:1 F#5:1 A5:1 D6:1', 'B5:1 G5:1 E5:2', 'C5:1 D5:1 E5:1 G5:1', 'A5:2 F#5:2', 'G5:1 B5:1 D6:2', 'C6:1 A5:1 G5:2', 'E5:1 F#5:1 G5:2', 'D5:4'],
    ['G4:1 B4:1 D5:1 G5:1', 'A5:2 G5:1 E5:1', 'D5:2 C5:1 D5:1', 'B4:4', 'D5:1 G5:1 B5:2', 'A5:1 G5:1 E5:2', 'F#5:1 A5:1 G5:2', 'D5:4'],
    ['D5:4', 'G5:2 E5:2', 'A5:2 D5:2', 'B5:2 G5:2', 'D6:4', 'C6:2 B5:2', 'A5:2 G5:2', 'D5:4'],
  ],
  volcano: [
    ['C5:1 G5:1 Ab5:1 G5:1', 'Eb5:1 G5:1 Bb5:2', 'C5:1 G5:1 Ab5:2', 'G5:1 B5:1 D6:2', 'Eb5:2 C5:2', 'Ab5:2 G5:1 Eb5:1', 'F5:1 G5:1 Bb5:2', 'C5:4'],
    ['G5:2 Eb5:2', 'C5:1 Eb5:1 G5:2', 'Ab5:2 G5:1 F5:1', 'Eb5:4', 'C6:2 Bb5:1 G5:1', 'Ab5:1 G5:1 Eb5:2', 'F5:2 D5:2', 'C5:4'],
    ['C5:1 Eb5:1 G5:1 Eb5:1', 'Ab5:2 G5:2', 'F5:1 G5:1 Bb5:2', 'G5:2 Eb5:2', 'C5:2 G4:2', 'Eb5:1 F5:1 G5:2', 'Ab5:1 G5:1 F5:2', 'C5:4'],
    ['C4:4', 'Eb4:2 G4:2', 'Ab4:4', 'G4:2 F4:2', 'C5:2 Eb5:2', 'G5:4', 'Bb5:2 G5:2', 'Eb5:4'],
    ['Eb5:1.5 G5:0.5 Bb5:2', 'Ab5:2 G5:2', 'F5:1 Eb5:1 C5:2', 'G4:4', 'C5:1 G5:1 Eb6:2', 'D6:1 C6:1 Bb5:2', 'G5:2 F5:2', 'Eb5:4'],
    ['C5:0.5 -:0.5 G5:0.5 -:0.5 Eb5:2', 'Ab5:1 -:1 G5:2', 'F5:1 Bb5:1 Ab5:2', 'G5:2 -:2', 'C5:1 Eb5:1 G5:2', 'Bb5:2 Ab5:1 G5:1', 'F5:2 Eb5:2', 'C5:4'],
    ['G5:1 Bb5:1 D6:2', 'C6:1 Bb5:1 Ab5:2', 'G5:2 Eb5:2', 'C5:4', 'Eb5:1 G5:1 Bb5:2', 'Ab5:2 F5:2', 'G5:1 B5:1 D6:2', 'C5:4'],
    ['C5:1.5 Eb5:0.5 G5:2', 'Ab5:1.5 G5:0.5 Eb5:2', 'F5:2 Bb5:1 G5:1', 'C6:2 G5:2', 'Eb5:2 C5:2', 'G5:1 Ab5:1 Bb5:2', 'D6:2 B5:2', 'C5:4'],
    ['C4:2 G4:2', 'Ab4:2 Eb4:2', 'F4:2 G4:2', 'C4:4', 'Eb4:1 G4:1 C5:2', 'Bb4:2 Ab4:2', 'G4:2 F4:2', 'C4:4'],
    ['Eb5:4', 'G5:2 F5:2', 'Ab5:2 G5:2', 'Eb5:4', 'C6:2 G5:2', 'Bb5:2 Ab5:2', 'G5:2 Eb5:2', 'C5:4'],
  ],
  sunken: [
    ['C#5:2 A5:1 F#5:1', 'D6:2 C#6:1 B5:1', 'A5:1 F#5:1 E5:2', 'C#5:4', 'F#5:2 E5:2', 'D5:1 E5:1 F#5:2', 'G#5:2 A5:2', 'F#5:4'],
    ['F#5:1 A5:1 C#6:2', 'B5:2 A5:2', 'G#5:1 A5:1 B5:2', 'C#6:2 A5:2', 'F#5:2 D5:2', 'E5:1 F#5:1 G#5:2', 'A5:2 E5:2', 'C#5:4'],
    ['C#6:4', 'B5:2 A5:2', 'F#5:2 E5:2', 'D5:4', 'C#5:2 F#5:2', 'A5:2 G#5:2', 'F#5:2 E5:2', 'C#5:4'],
    ['C#5:0.5 -:0.5 F#5:0.5 -:0.5 A5:2', 'B5:1 -:1 A5:2', 'G#5:0.5 A5:0.5 B5:1 F#5:2', 'E5:2 -:2', 'C#6:1 A5:1 F#5:2', 'E6:2 C#6:2', 'B5:2 A5:2', 'F#5:4'],
    ['F#4:2 C#5:2', 'E5:2 D5:2', 'C#5:4', 'B4:2 A4:2', 'F#5:1 A5:1 C#6:2', 'B5:2 A5:1 G#5:1', 'F#5:2 E5:2', 'C#5:4'],
    ['A5:1 F#5:1 C#5:2', 'D5:1 E5:1 F#5:2', 'G#5:2 A5:2', 'B5:2 F#5:2', 'C#6:2 B5:1 A5:1', 'G#5:2 E5:2', 'F#5:1 A5:1 C#6:2', 'A5:4'],
    ['F#5:2 A5:2', 'C#6:1 B5:1 A5:2', 'G#5:2 F#5:2', 'E5:4', 'D6:2 C#6:2', 'B5:1 A5:1 F#5:2', 'G#5:2 E5:2', 'C#5:4'],
    ['C#5:4', 'F#5:4', 'A5:2 G#5:2', 'F#5:4', 'C#6:4', 'B5:2 A5:2', 'G#5:4', 'F#5:4'],
    ['E5:1 F#5:1 G#5:1 A5:1', 'B5:2 A5:1 F#5:1', 'G#5:2 E5:2', 'C#5:4', 'F#5:1 A5:1 C#6:1 E6:1', 'D6:2 C#6:2', 'B5:2 A5:2', 'F#5:4'],
    ['A5:2 F#5:2', 'B5:2 A5:1 G#5:1', 'F#5:2 E5:2', 'C#5:4', 'C#6:2 A5:2', 'B5:1 A5:1 F#5:2', 'G#5:2 E5:2', 'F#5:4'],
  ],
  clockwork: [
    ['G4:1 D5:1 G5:2', 'Bb4:1 D5:1 F5:2', 'Eb5:1 G5:1 Bb5:2', 'D5:2 A5:2', 'G5:2 F5:1 D5:1', 'Eb5:2 D5:2', 'C5:1 D5:1 F#5:2', 'G4:4'],
    ['Bb5:2 G5:2', 'A5:1 F5:1 D5:2', 'Eb5:2 D5:2', 'G4:4', 'D5:1 G5:1 Bb5:2', 'A5:2 G5:2', 'F5:1 Eb5:1 D5:2', 'G5:4'],
    ['G5:4', 'F5:2 Eb5:2', 'D5:4', 'Bb4:4', 'G4:2 D5:2', 'Eb5:2 F5:2', 'G5:2 A5:2', 'Bb5:2 G5:2'],
    ['D4:0.5 G4:0.5 Bb4:1 A4:2', 'G4:1 F4:1 D4:2', 'Eb4:2 D4:2', 'G3:4', 'Bb4:1 D5:1 G5:2', 'F5:2 Eb5:2', 'D5:2 C5:2', 'Bb4:4'],
    ['G5:1 Bb5:1 D6:2', 'C6:1 Bb5:1 A5:2', 'G5:2 F5:2', 'D5:4', 'Eb5:1 G5:1 Bb5:2', 'A5:2 F5:2', 'G5:1 A5:1 Bb5:2', 'G5:4'],
    ['G4:2 -:2', 'Bb4:2 A4:2', 'G4:1 D5:1 F5:2', 'Eb5:4', 'D5:2 G5:2', 'F5:1 Eb5:1 D5:2', 'C5:2 A4:2', 'G4:4'],
    ['D5:1 G5:1 A5:0.5 Bb5:0.5 A5:1', 'G5:2 F5:2', 'Eb5:1 D5:1 C5:2', 'Bb4:2 G4:2', 'D6:2 C6:1 Bb5:1', 'A5:2 G5:2', 'F#5:2 D5:2', 'G5:4'],
    ['Bb5:0.5 A5:0.5 G5:1 D5:2', 'Eb5:1 G5:1 Bb5:2', 'A5:2 F5:2', 'D5:4', 'G5:1 Bb5:1 D6:2', 'C6:2 Bb5:2', 'A5:1 G5:1 F5:2', 'D5:4'],
    ['G4:1 Bb4:1 D5:1 G5:1', 'F5:2 Eb5:2', 'D5:1 F5:1 A5:2', 'G5:4', 'Bb5:2 A5:1 G5:1', 'Eb5:2 D5:2', 'F5:1 G5:1 A5:2', 'G4:4'],
    ['D5:4', 'G5:2 Bb5:2', 'A5:4', 'G5:2 F5:2', 'Eb5:4', 'D5:2 C5:2', 'Bb4:2 A4:2', 'G4:4'],
  ],
};

const songOf = (region, index, melody) => {
  const spec = REGIONS[region];
  const quoteVol = spec.quote === 'strings' ? 0.1 : 0.12;
  return {
    file: `sample-elite-${spec.slug}-${String(index + 1).padStart(2, '0')}`,
    bpm: spec.bpm,
    mix: spec.mix,
    sections: [
      {
        name: 'verse',
        chords: bars(...spec.chords),
        parts: [{ inst: spec.lead, vol: spec.leadVol, notes: phrase(melody.slice(0, 4)) }],
        comp: spec.comp,
        bass: spec.bass,
        drums: spec.drums,
        energy: 0.7,
        level: 0.8,
      },
      {
        name: 'hint',
        chords: bars(...spec.later),
        parts: [
          { inst: spec.lead, vol: spec.leadVol * 0.82, notes: phrase(melody.slice(4)) },
          { inst: spec.quote, vol: quoteVol, send: 0.65, notes: faintIntro(spec.quoteKey) },
        ],
        comp: spec.comp,
        bass: spec.bass,
        drums: spec.drums,
        energy: 0.6,
        level: 0.78,
        crash: false,
      },
    ],
  };
};

export const ELITE_SAMPLE_SONGS = Object.keys(MELODIES).flatMap((region) => MELODIES[region].map((melody, index) => songOf(region, index, melody)));

for (const sample of ELITE_SAMPLE_SONGS) {
  for (const section of sample.sections) {
    for (const part of section.parts) {
      const barsText = part.notes.split('|');
      if (barsText.length !== section.chords.length) {
        throw new Error(`${sample.file} ${section.name} ${part.inst}: ${barsText.length} 小節`);
      }
      barsText.forEach((text, index) => {
        const beats = parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);
        if (Math.abs(beats - 4) > 1e-6) {
          throw new Error(`${sample.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍 「${text.trim()}」`);
        }
      });
    }
  }
}
