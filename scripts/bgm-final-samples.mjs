// ラスボス戦の候補。4 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// ためからサビの 1 回目まで。章ボスのイントロを、フレーズの切れ目から入れて、そのあとサビが来る。
// 本番の battle-final.wav はここでは書き出さない。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { FINAL_BOSS_SONG } from './bgm-final.mjs';
import { join4 } from './bgm-song.mjs';
import { INTRO_BARS as THEME_INTRO_BARS } from './bgm-theme.mjs';

/** 章ボスのイントロ。最後の小節だけ、シ♭を経由してド♯へ上がる。 */
const CHAPTER_INTRO = [...THEME_INTRO_BARS.slice(0, 3), 'E5:0.5 F5:0.5 G5:0.5 Bb5:0.5 C#6:1 A5:1'];
const REST = '-:4';

const cloneSections = (sections) =>
  sections.map((section) => ({
    ...section,
    chords: [...section.chords],
    parts: (section.parts ?? []).map((part) => ({ ...part })),
    ...(section.comp ? { comp: [...section.comp] } : {}),
  }));

const barsOf = (notes) => notes.split('|').map((text) => text.trim());
const sounding = (notes) => barsOf(notes).some((bar) => bar !== REST);

/**
 * サビまでの小節数に、イントロを頭から当てる。
 * 4 小節を超えるときは、サビの直前がイントロの締め（ド♯へ上がる小節）になるように続ける。
 */
const lineFor = (barsBefore) => {
  if (barsBefore === 2) return CHAPTER_INTRO.slice(0, 2);
  if (barsBefore === 4) return [...CHAPTER_INTRO];
  if (barsBefore === 6) return [...CHAPTER_INTRO, ...CHAPTER_INTRO.slice(2)];
  if (barsBefore === 8) return [...CHAPTER_INTRO, ...CHAPTER_INTRO];
  throw new Error(`${barsBefore} 小節前は切れ目ではない`);
};

const voiced = (bar) => [
  { inst: 'guitarLead', vol: 0.42, notes: bar },
  { inst: 'organ', vol: 0.22, notes: shiftPhrase(bar, 1) },
];

/** サビ直前のスロットへ、イントロの各小節を置く。スロットはための 4 小節と、上がり坂の 4 小節。 */
const paint = (sections, line) => {
  const chorusAt = sections.findIndex((section) => section.name === 'chorus1');
  const buildAt = sections.findIndex((section) => section.name === 'build');
  const riseAt = [1, 2, 3, 4].map((n) => sections.findIndex((section) => section.name === `build2-${n}`));
  if (sections[buildAt]?.chords.length !== 4 || riseAt.some((index) => sections[index]?.chords.length !== 1)) {
    throw new Error('サビ前の並びが変わっている');
  }
  const slots = [
    { section: buildAt, bar: 0 },
    { section: buildAt, bar: 1 },
    { section: buildAt, bar: 2 },
    { section: buildAt, bar: 3 },
    ...riseAt.map((section) => ({ section, bar: 0 })),
  ];
  const start = slots.length - line.length;
  const bySection = new Map();
  line.forEach((bar, index) => {
    const slot = slots[start + index];
    if (!bySection.has(slot.section)) bySection.set(slot.section, new Map());
    bySection.get(slot.section).set(slot.bar, bar);
  });

  for (const [index, barMap] of bySection) {
    const section = sections[index];
    if (section.chords.length === 1) {
      sections[index] = { ...section, parts: voiced(barMap.get(0)) };
      continue;
    }
    const leadBars = section.parts.map((part) => barsOf(part.notes));
    const kept = leadBars.map(() => []);
    const guitar = [];
    const organ = [];
    for (let bar = 0; bar < section.chords.length; bar += 1) {
      if (!barMap.has(bar)) {
        leadBars.forEach((bars, part) => kept[part].push(bars[bar]));
        guitar.push(REST);
        organ.push(REST);
        continue;
      }
      kept.forEach((list) => list.push(REST));
      guitar.push(barMap.get(bar));
      organ.push(shiftPhrase(barMap.get(bar), 1));
    }
    const parts = [
      ...section.parts.map((part, partIndex) => ({ ...part, notes: join4(...kept[partIndex]) })),
      { inst: 'guitarLead', vol: 0.42, notes: join4(...guitar) },
      { inst: 'organ', vol: 0.22, notes: join4(...organ) },
    ].filter((part) => sounding(part.notes));
    sections[index] = { ...section, parts };
  }
  return sections.slice(buildAt, chorusAt + 1);
};

const sample = (barsBefore, file) => {
  const sections = cloneSections(FINAL_BOSS_SONG.sections);
  return {
    bpm: FINAL_BOSS_SONG.bpm,
    mix: FINAL_BOSS_SONG.mix,
    sections: paint(sections, lineFor(barsBefore)),
    file,
    barsBefore,
  };
};

export const FINAL_SAMPLE_SONGS = [
  sample(2, 'sample-final-01'),
  sample(4, 'sample-final-02'),
  sample(6, 'sample-final-03'),
  sample(8, 'sample-final-04'),
];

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);

for (const song of FINAL_SAMPLE_SONGS) {
  if (song.sections[0]?.name !== 'build' || song.sections.at(-1)?.name !== 'chorus1') {
    throw new Error(`${song.file} はためからサビまでになっていない`);
  }
  const before = song.sections.at(-2);
  if (before?.name !== 'build2-4' || before.parts[0]?.inst !== 'guitarLead') {
    throw new Error(`${song.file} のサビ直前がイントロになっていない`);
  }
  for (const section of song.sections) {
    for (const part of section.parts ?? []) {
      const bars = barsOf(part.notes);
      if (bars.length !== section.chords.length) throw new Error(`${song.file} ${section.name} ${part.inst}: ${bars.length} 小節`);
      bars.forEach((text, index) => {
        const beats = beatsOf(text);
        if (Math.abs(beats - 4) > 1e-6) throw new Error(`${song.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
      });
    }
  }
}

const original = FINAL_BOSS_SONG.sections.find((section) => section.name === 'build2-4');
if (original.parts[0]?.inst !== 'brassLead') throw new Error('本番のラスボス戦にサンプルが混ざった');
