// ラスボス戦の候補。10 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// サビの 1 回目はそのまま。2 回目の頭から、章ボスのイントロを乗せる。笛は使わない。
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

const layer = (section, part) => ({ ...section, parts: [...section.parts, part] });

const voice = (inst, vol, notes, octaves = 0) => ({
  inst,
  vol,
  notes: octaves === 0 ? notes : shiftPhrase(notes, octaves),
});

/** 8 小節のサビに、短いフレーズを頭から乗せる。余った小節は休符。 */
const fit = (bars) => join4(...[...bars, ...Array(8).fill(REST)].slice(0, 8));

/** サビの 2 回目の頭からイントロを足し、サビ 2 回分だけを返す。 */
const hinted = (place) => {
  const sections = cloneSections(FINAL_BOSS_SONG.sections);
  const first = sections.findIndex((section) => section.name === 'chorus1');
  const second = sections.findIndex((section) => section.name === 'chorus2');
  if (first < 0 || second !== first + 1) throw new Error('サビの 2 回目が見つからない');
  place(sections[second], (part) => {
    sections[second] = layer(sections[second], part);
  });
  return {
    bpm: FINAL_BOSS_SONG.bpm,
    mix: FINAL_BOSS_SONG.mix,
    sections: sections.slice(first, second + 1),
  };
};

const sing = (inst, vol, bars, octaves = 0) => (section, add) => {
  if (section.name !== 'chorus2' || section.chords.length !== 8) throw new Error('2 回目のサビが 8 小節ではない');
  add(voice(inst, vol, fit(bars), octaves));
};

export const FINAL_SAMPLE_SONGS = [
  { ...hinted(sing('bell', 0.24, CHAPTER_INTRO)), file: 'sample-final-01' },
  { ...hinted(sing('bell', 0.26, CHAPTER_INTRO, -1)), file: 'sample-final-02' },
  { ...hinted(sing('strings', 0.32, CHAPTER_INTRO)), file: 'sample-final-03' },
  { ...hinted(sing('strings', 0.34, CHAPTER_INTRO, -1)), file: 'sample-final-04' },
  { ...hinted(sing('guitarLead', 0.28, CHAPTER_INTRO)), file: 'sample-final-05' },
  { ...hinted(sing('brassLead', 0.2, [CHAPTER_INTRO[0]])), file: 'sample-final-06' },
  { ...hinted(sing('organ', 0.26, CHAPTER_INTRO.slice(0, 2))), file: 'sample-final-07' },
  { ...hinted(sing('softKey', 0.24, CHAPTER_INTRO)), file: 'sample-final-08' },
  { ...hinted(sing('bell', 0.2, [...CHAPTER_INTRO, ...CHAPTER_INTRO])), file: 'sample-final-09' },
  { ...hinted(sing('squareLead', 0.14, [...CHAPTER_INTRO, ...CHAPTER_INTRO])), file: 'sample-final-10' },
];

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);
const baseChorus = (name) => FINAL_BOSS_SONG.sections.find((section) => section.name === name);

for (const song of FINAL_SAMPLE_SONGS) {
  if (song.sections.length !== 2 || song.sections[0]?.name !== 'chorus1' || song.sections[1]?.name !== 'chorus2') {
    throw new Error(`${song.file} はサビの 2 回になっていない`);
  }
  if (song.sections[0].parts.length !== baseChorus('chorus1').parts.length) {
    throw new Error(`${song.file} の 1 回目にイントロが乗っている`);
  }
  const added = song.sections[1].parts.at(-1);
  if (!added || added.inst === 'flute') throw new Error(`${song.file} の音色が笛になっている`);
  for (const section of song.sections) {
    for (const part of section.parts ?? []) {
      const bars = part.notes.split('|');
      if (bars.length !== section.chords.length) throw new Error(`${song.file} ${section.name} ${part.inst}: ${bars.length} 小節`);
      bars.forEach((text, index) => {
        const beats = beatsOf(text);
        if (Math.abs(beats - 4) > 1e-6) throw new Error(`${song.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
      });
    }
  }
}

if (baseChorus('chorus2').parts.length !== 4) throw new Error('本番のラスボス戦にサンプルが混ざった');
