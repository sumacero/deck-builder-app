// ラスボス戦の候補。1 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// サビの直前の 1 小節に、章ボスのイントロの頭を入れて、そのあとサビが来る。
// 本番の battle-final.wav はここでは書き出さない。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { FINAL_BOSS_SONG } from './bgm-final.mjs';
import { INTRO_BARS as THEME_INTRO_BARS } from './bgm-theme.mjs';

/** 章ボスのイントロの頭。「レ・レ・ファミレラ」。 */
const INTRO_HEAD = THEME_INTRO_BARS[0];

const cloneSections = (sections) =>
  sections.map((section) => ({
    ...section,
    chords: [...section.chords],
    parts: (section.parts ?? []).map((part) => ({ ...part })),
    ...(section.comp ? { comp: [...section.comp] } : {}),
  }));

const sections = cloneSections(FINAL_BOSS_SONG.sections);
const chorusAt = sections.findIndex((section) => section.name === 'chorus1');
const before = chorusAt - 1;
if (sections[before]?.name !== 'build2-4' || sections[before].chords.length !== 1) {
  throw new Error('サビの直前の 1 小節が見つからない');
}

// 上がりきった最後の小節は、金管の長い音を章ボスのイントロに差し替える。ドラムのロールはそのまま。
sections[before] = {
  ...sections[before],
  parts: [
    { inst: 'guitarLead', vol: 0.42, notes: INTRO_HEAD },
    { inst: 'organ', vol: 0.22, notes: shiftPhrase(INTRO_HEAD, 1) },
  ],
};

const from = sections.findIndex((section) => section.name === 'build2-1');
export const FINAL_SAMPLE_SONGS = [
  {
    bpm: FINAL_BOSS_SONG.bpm,
    mix: FINAL_BOSS_SONG.mix,
    sections: sections.slice(from, chorusAt + 1),
    file: 'sample-final-01',
  },
];

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);
const song = FINAL_SAMPLE_SONGS[0];
if (song.sections.at(-2)?.name !== 'build2-4' || song.sections.at(-1)?.name !== 'chorus1') {
  throw new Error('サビの直前からサビまでになっていない');
}
const intro = song.sections.at(-2).parts;
if (intro.length !== 2 || intro[0].inst !== 'guitarLead' || intro[1].inst !== 'organ') {
  throw new Error('直前の小節が章ボスのイントロになっていない');
}
for (const section of song.sections) {
  for (const part of section.parts ?? []) {
    const bars = part.notes.split('|');
    if (bars.length !== section.chords.length) throw new Error(`${section.name} ${part.inst}: ${bars.length} 小節`);
    bars.forEach((text, index) => {
      const beats = beatsOf(text);
      if (Math.abs(beats - 4) > 1e-6) throw new Error(`${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
    });
  }
}

const original = FINAL_BOSS_SONG.sections.find((section) => section.name === 'build2-4');
if (original.parts.length !== 2 || original.parts[0].inst !== 'brassLead') throw new Error('本番のラスボス戦にサンプルが混ざった');
