// ラスボス戦の候補。5 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 今のラスボス戦の、ためからサビの 1 回目まで。サビの直前に章ボスのイントロを足す。
// 本番の battle-final.wav はここでは書き出さない。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { FINAL_BOSS_SONG } from './bgm-final.mjs';
import { join4 } from './bgm-song.mjs';
import { INTRO_BARS as THEME_INTRO_BARS } from './bgm-theme.mjs';

/** 章ボスのイントロ。最後の小節だけ、シ♭を経由してド♯へ上がる。 */
const CHAPTER_INTRO = [...THEME_INTRO_BARS.slice(0, 3), 'E5:0.5 F5:0.5 G5:0.5 Bb5:0.5 C#6:1 A5:1'];

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

/** サビの直前へ、章ボスのイントロを足したラスボス戦を返す。 */
const hinted = (place) => {
  const sections = cloneSections(FINAL_BOSS_SONG.sections);
  const chorusAt = sections.findIndex((section) => section.name === 'chorus1');
  if (chorusAt < 0) throw new Error('ラスボス戦のサビが見つからない');
  const calm = chorusAt - 5;
  const rise = [chorusAt - 4, chorusAt - 3, chorusAt - 2, chorusAt - 1];
  if (sections[calm]?.name !== 'build' || sections[rise[0]]?.chords.length !== 1) {
    throw new Error('サビ前の並びが変わっている');
  }
  place({ sections, calm, rise });
  const from = sections.findIndex((section) => section.name === 'build');
  const to = sections.findIndex((section) => section.name === 'chorus1');
  if (from < 0 || to < from) throw new Error('サビ前の範囲が取れない');
  return {
    bpm: FINAL_BOSS_SONG.bpm,
    mix: FINAL_BOSS_SONG.mix,
    sections: sections.slice(from, to + 1),
  };
};

const onRise = (sections, rise, from, notes, { inst, vol, octaves = 0 }) => {
  notes.forEach((bar, index) => {
    sections[rise[from + index]] = layer(sections[rise[from + index]], voice(inst, vol, bar, octaves));
  });
};

export const FINAL_SAMPLE_SONGS = [
  {
    // サビ直前の 1 小節。章ボスのイントロの頭だけを、鐘で前に出す。
    ...hinted(({ sections, rise }) => {
      onRise(sections, rise, 3, [CHAPTER_INTRO[0]], { inst: 'bell', vol: 0.2 });
    }),
    file: 'sample-final-01',
  },
  {
    // サビ前の 2 小節。イントロの前半を、1 オクターブ下の弦で。
    ...hinted(({ sections, rise }) => {
      onRise(sections, rise, 2, CHAPTER_INTRO.slice(0, 2), { inst: 'strings', vol: 0.28, octaves: -1 });
    }),
    file: 'sample-final-02',
  },
  {
    // サビへ上がる 4 小節のあいだ。章ボスのイントロを、鐘で通す。
    ...hinted(({ sections, rise }) => {
      onRise(sections, rise, 0, CHAPTER_INTRO, { inst: 'bell', vol: 0.16 });
    }),
    file: 'sample-final-03',
  },
  {
    // サビ前の静かな 4 小節。上がり坂の手前に、笛でイントロを置く。
    ...hinted(({ sections, calm }) => {
      sections[calm] = layer(sections[calm], voice('flute', 0.24, join4(...CHAPTER_INTRO)));
    }),
    file: 'sample-final-04',
  },
  {
    // サビ直前の 1 小節。章ボスだけの最後の小節を、低いギターで。
    ...hinted(({ sections, rise }) => {
      onRise(sections, rise, 3, [CHAPTER_INTRO[3]], { inst: 'guitarLead', vol: 0.22, octaves: -1 });
    }),
    file: 'sample-final-05',
  },
];

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);

for (const song of FINAL_SAMPLE_SONGS) {
  if (song.sections[0]?.name !== 'build' || song.sections.at(-1)?.name !== 'chorus1') {
    throw new Error(`${song.file} はためからサビまでになっていない`);
  }
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

if (FINAL_BOSS_SONG.sections[11].parts.length !== 2) throw new Error('本番のラスボス戦にサンプルが混ざった');
