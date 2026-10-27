// エリート戦の候補。マップごとに 3 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 出だし（リフ）と地域の旋律は、今のエリート戦のセクションをそのまま使う。
// 最後の共通部分には、ラスボスの A メロを地域の調で入れる。
// 伴奏・ドラム・歌っている楽器は地域の旋律のまま続け、入りのシンバルは鳴らさない。
// 前の候補はここで楽器もドラムも替えていたので、2 曲を貼り合わせたように聞こえていた。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { REGION_SONGS } from './bgm-regions.mjs';
import { bars, join4, remapPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { D_MAJOR, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

const ELITES = [
  { slug: 'grassland', file: 'elite-grassland', semitones: 5, major: true },
  { slug: 'volcano', file: 'elite-volcano', semitones: -2, major: false },
  { slug: 'sunken', file: 'elite-sunken-city', semitones: 4, major: false },
  { slug: 'clockwork', file: 'elite-clockwork', semitones: 5, major: false },
];

/** 短調の A メロを同主長調にしたときのコード。旋律の F・C・B♭ を上げた音に合わせてある。 */
const MAJOR_VERSE_CHORDS = ['D', 'A7', 'Bm', 'A', 'G', 'A7', 'D Bm', 'A7'];

/** 属音を 2 小節伸ばし、A メロの最初の音へ降りる。地域の旋律の最後の和音と同じ機能。 */
const BRIDGE_BARS = ['E5:4', 'C#5:2 A4:2'];
const BRIDGE_CHORDS = ['A', 'A'];

const phrase = (lines) => join4(...lines);

/** ラスボスの A メロ（必要なら長調にして）を、その地域の調へ移す。 */
const inKey = (lines, elite) =>
  lines.map((line) => transposePhrase(elite.major ? remapPhrase(line, D_MAJOR) : line, elite.semitones));

const chordsOf = (symbols, elite) => bars(...transposeSymbols(symbols, elite.semitones));

const cloneSection = (section) => ({
  ...section,
  chords: [...section.chords],
  parts: (section.parts ?? []).map((part) => ({ ...part })),
});

/** 地域の旋律と同じ楽器で歌う。2 本目は水の古都のベル（1 オクターブ上）だけ。 */
const sing = (theme, notes) =>
  (theme.parts ?? []).map((part, index) => ({
    inst: part.inst,
    vol: part.vol,
    ...(part.double != null ? { double: part.double } : {}),
    ...(part.send != null ? { send: part.send } : {}),
    notes: index === 0 ? notes : shiftPhrase(notes, 1),
  }));

/** 地域の旋律の伴奏を、シンバルなしで続ける。 */
const groove = (theme, extra) => ({
  comp: theme.comp,
  bass: theme.bass,
  drums: theme.drums,
  ...(theme.energy != null ? { energy: theme.energy } : {}),
  crash: false,
  ...extra,
});

const verseChords = (elite) => chordsOf(elite.major ? MAJOR_VERSE_CHORDS : VERSE_CHORDS, elite);

/** 3 通りのつなぎ。どれも歌と伴奏は地域の旋律の続き。 */
const endings = (theme, elite, button) => {
  const verse = inKey(VERSE_BARS, elite);
  const chords = verseChords(elite);
  const low = phrase(verse.slice(0, 4).map((line) => shiftPhrase(line, -1)));
  const high = phrase(verse.slice(4));
  const whole = phrase(verse);
  return [
    {
      name: 'same',
      sections: [
        {
          name: 'verse',
          chords,
          parts: sing(theme, whole),
          ...groove(theme, button),
        },
      ],
    },
    {
      name: 'low',
      sections: [
        {
          name: 'verse-low',
          chords: chords.slice(0, 4),
          parts: sing(theme, low),
          ...groove(theme),
        },
        {
          name: 'verse-high',
          chords: chords.slice(4),
          parts: sing(theme, high),
          ...groove(theme, button),
        },
      ],
    },
    {
      name: 'bridge',
      sections: [
        {
          name: 'bridge',
          chords: chordsOf(BRIDGE_CHORDS, elite),
          parts: sing(theme, phrase(inKey(BRIDGE_BARS, elite))),
          ...groove(theme),
        },
        {
          name: 'verse',
          chords,
          parts: sing(theme, whole),
          ...groove(theme, button),
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
  const theme = source.sections[1];
  const button = source.sections[2]?.fill ? { fill: source.sections[2].fill } : {};
  return endings(theme, elite, button).map((ending, index) => ({
    file: `sample-elite-${elite.slug}-${String(index + 1).padStart(2, '0')}`,
    bpm: source.bpm,
    mix: source.mix,
    sections: [cloneSection(source.sections[0]), cloneSection(source.sections[1]), ...ending.sections],
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
