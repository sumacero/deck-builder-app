// エリート戦の候補。マップごとに 5 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 出だし（リフ）と地域の旋律は、今のエリート戦のセクションをそのまま使う。
// 差し替えるのは最後の共通部分（導入の動機の引用）だけ。そこを、章ボスとラスボスの雰囲気で 5 通りにする。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { INTRO_BARS as FINAL_INTRO_BARS, INTRO_CHORDS as FINAL_INTRO_CHORDS } from './bgm-final.mjs';
import { REGION_SONGS } from './bgm-regions.mjs';
import { bars, join4, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { CHORUS_BARS, CHORUS_CHORDS, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

/** 章ボス B メロ（bgm-final.mjs と同じ音）。本番の曲はここでは書き出さない。 */
const B_MELODY = ['A5:3 F5:1', 'Bb5:2 A5:1 G5:1', 'G5:2 E5:1 C5:1', 'F5:1 A5:2 C6:1', 'D6:2 C6:1 Bb5:1', 'Bb5:2 G5:1 D5:1', 'E5:1 A5:1 C#6:2', 'E6:2 C#6:1 A5:1'];
const RUN_CHORDS = ['Dm', 'Gm', 'C', 'F', 'Bb', 'Gm', 'A', 'A'];

const ELITES = [
  { slug: 'grassland', file: 'elite-grassland', semitones: 5 },
  { slug: 'volcano', file: 'elite-volcano', semitones: -2 },
  { slug: 'sunken', file: 'elite-sunken-city', semitones: 4 },
  { slug: 'clockwork', file: 'elite-clockwork', semitones: 5 },
];

const phrase = (lines) => join4(...lines);
const moved = (lines, semitones) => transposePhrase(phrase(lines), semitones);
const chordsOf = (symbols, semitones) => bars(...transposeSymbols(symbols, semitones));

const cloneSection = (section) => ({
  ...section,
  chords: [...section.chords],
  parts: (section.parts ?? []).map((part) => ({ ...part })),
});

/** 5 通りの差し替え。どれも 8 小節。地域の調へ移す。ラスボスのハモりとツーバスは付けない。 */
const choruses = (semitones) => {
  const chorus = moved(CHORUS_BARS, semitones);
  const verse = moved(VERSE_BARS, semitones);
  const sing = moved(B_MELODY, semitones);
  const rush = moved(FINAL_INTRO_BARS, semitones);
  const chorusChords = chordsOf(CHORUS_CHORDS, semitones);
  const verseChords = chordsOf(VERSE_CHORDS, semitones);
  const singChords = chordsOf(RUN_CHORDS, semitones);
  const rushChords = chordsOf(FINAL_INTRO_CHORDS, semitones);
  return [
    {
      name: 'dotted',
      sections: [
        {
          name: 'chorus',
          chords: chorusChords,
          parts: [
            { inst: 'brassLead', vol: 0.36, notes: chorus },
            { inst: 'guitarLead', vol: 0.18, notes: shiftPhrase(chorus, -1) },
          ],
          comp: ['stabs', 'chug'],
          bass: 'drive8',
          drums: 'drive',
          level: 0.9,
          fill: 'snare',
        },
      ],
    },
    {
      name: 'long',
      sections: [
        {
          name: 'chorus',
          chords: singChords,
          parts: [
            { inst: 'guitarLead', vol: 0.36, notes: sing },
            { inst: 'strings', vol: 0.14, notes: shiftPhrase(sing, -1) },
          ],
          comp: ['organ', 'arp8'],
          bass: 'sustain',
          drums: 'half',
          level: 0.82,
          fill: 'snare',
        },
      ],
    },
    {
      name: 'chug',
      sections: [
        {
          name: 'chorus',
          chords: verseChords,
          parts: [{ inst: 'guitarLead', vol: 0.38, notes: verse }],
          comp: ['chug', 'organ'],
          bass: 'gallop',
          drums: 'drive',
          level: 0.88,
          fill: 'toms',
        },
      ],
    },
    {
      name: 'accel',
      sections: [
        {
          name: 'rush',
          chords: rushChords,
          parts: [{ inst: 'brassLead', vol: 0.34, notes: rush }],
          comp: ['chug', 'strings'],
          bass: 'gallop',
          drums: 'rock',
          level: 0.8,
        },
        {
          name: 'chorus',
          chords: chorusChords.slice(0, 4),
          parts: [
            { inst: 'brassLead', vol: 0.36, notes: moved(CHORUS_BARS.slice(0, 4), semitones) },
            { inst: 'guitarLead', vol: 0.18, notes: shiftPhrase(moved(CHORUS_BARS.slice(0, 4), semitones), -1) },
          ],
          comp: ['stabs', 'chug'],
          bass: 'drive8',
          drums: 'drive',
          level: 0.9,
          fill: 'snare',
        },
      ],
    },
    {
      name: 'hand',
      sections: [
        {
          name: 'brass',
          chords: chorusChords.slice(0, 4),
          parts: [{ inst: 'brassLead', vol: 0.36, notes: moved(CHORUS_BARS.slice(0, 4), semitones) }],
          comp: ['stabs', 'chug'],
          bass: 'drive8',
          drums: 'drive',
          level: 0.88,
        },
        {
          name: 'guitar',
          chords: singChords.slice(0, 4),
          parts: [{ inst: 'guitarLead', vol: 0.36, notes: moved(B_MELODY.slice(0, 4), semitones) }],
          comp: ['organ', 'chug'],
          bass: 'gallop',
          drums: 'half',
          level: 0.84,
          fill: 'snare',
        },
      ],
    },
  ];
};

const eliteByFile = (file) => {
  const song = REGION_SONGS.find((item) => item.file === file);
  if (!song || song.sections[0]?.name !== 'riff' || song.sections[1]?.name !== 'theme') {
    throw new Error(`エリート戦の出だしが見つからない: ${file}`);
  }
  return song;
};

export const ELITE_SAMPLE_SONGS = ELITES.flatMap((elite) => {
  const source = eliteByFile(elite.file);
  return choruses(elite.semitones).map((chorus, index) => ({
    file: `sample-elite-${elite.slug}-${String(index + 1).padStart(2, '0')}`,
    bpm: source.bpm,
    mix: source.mix,
    sections: [cloneSection(source.sections[0]), cloneSection(source.sections[1]), ...chorus.sections],
  }));
});

for (const sample of ELITE_SAMPLE_SONGS) {
  for (const section of sample.sections) {
    for (const part of section.parts ?? []) {
      const barsText = part.notes.split('|');
      if (barsText.length !== section.chords.length) {
        throw new Error(`${sample.file} ${section.name} ${part.inst}: ${barsText.length} 小節`);
      }
      barsText.forEach((text, index) => {
        const beats = parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);
        if (Math.abs(beats - 4) > 1e-6) {
          throw new Error(`${sample.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
        }
      });
    }
  }
}
