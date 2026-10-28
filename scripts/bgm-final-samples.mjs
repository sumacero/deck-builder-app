// ラスボス戦の候補。30 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// サビの 2 小節前か 4 小節前に、章ボスのイントロを重ねる。元の上がり坂は残す。
// 本番の battle-final.wav はここでは書き出さない。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { FINAL_BOSS_SONG } from './bgm-final.mjs';
import { remapPhrase, transposePhrase } from './bgm-song.mjs';
import { D_MAJOR, INTRO_BARS as THEME_INTRO_BARS } from './bgm-theme.mjs';

/** 章ボスのイントロ。最後の小節だけ、シ♭を経由してド♯へ上がる。 */
const CHAPTER_INTRO = [...THEME_INTRO_BARS.slice(0, 3), 'E5:0.5 F5:0.5 G5:0.5 Bb5:0.5 C#6:1 A5:1'];
const HEAD = CHAPTER_INTRO.slice(0, 2);
const TAIL = CHAPTER_INTRO.slice(2);
const HOOK = [CHAPTER_INTRO[0], CHAPTER_INTRO[0], CHAPTER_INTRO[0], CHAPTER_INTRO[0]];
const CADENCE = [...TAIL, ...TAIL];
const ENDS = [CHAPTER_INTRO[0], CHAPTER_INTRO[3], CHAPTER_INTRO[0], CHAPTER_INTRO[3]];
const REVERSED = [...CHAPTER_INTRO].reverse();

const cloneSections = (sections) =>
  sections.map((section) => ({
    ...section,
    chords: [...section.chords],
    parts: (section.parts ?? []).map((part) => ({ ...part })),
    ...(section.comp ? { comp: [...section.comp] } : {}),
  }));

const firstPitch = (bar) => {
  const match = /([A-G][#b]?\d)/.exec(bar);
  if (!match) throw new Error(`音がない: ${bar}`);
  return `${match[1]}:4`;
};

const shape = (bar, layer) => {
  let text = layer.whole ? firstPitch(bar) : bar;
  if (layer.major) text = remapPhrase(text, D_MAJOR);
  if (layer.semitones) text = transposePhrase(text, layer.semitones);
  if (layer.octaves) text = shiftPhrase(text, layer.octaves);
  return text;
};

/** 上がり坂の終わりに、イントロを足す。元の金管や刻みは残す。 */
const weave = (barsBefore, layers) => {
  const sections = cloneSections(FINAL_BOSS_SONG.sections);
  const rise = [1, 2, 3, 4].map((n) => sections.findIndex((section) => section.name === `build2-${n}`));
  const chorusAt = sections.findIndex((section) => section.name === 'chorus1');
  if (rise.some((index) => sections[index]?.chords.length !== 1) || chorusAt !== rise[3] + 1) {
    throw new Error('サビ前の並びが変わっている');
  }
  const from = 4 - barsBefore;
  for (const layer of layers) {
    if (layer.bars.length !== barsBefore) throw new Error(`小節数が ${barsBefore} ではない`);
    layer.bars.forEach((bar, index) => {
      const at = rise[from + index];
      const grow = layer.swell ? 0.4 + (0.6 * index) / (layer.bars.length - 1) : 1;
      sections[at] = {
        ...sections[at],
        parts: [...sections[at].parts, { inst: layer.inst, vol: Math.round(layer.vol * grow * 1000) / 1000, notes: shape(bar, layer) }],
      };
    });
  }
  return {
    bpm: FINAL_BOSS_SONG.bpm,
    mix: FINAL_BOSS_SONG.mix,
    sections: sections.slice(rise[0], chorusAt + 1),
  };
};

const one = (inst, vol, extra = {}) => [{ inst, vol, bars: CHAPTER_INTRO, ...extra }];

/** 入りは 2 小節前か 4 小節前。音量・楽器・キー・旋律の形をばらす。 */
const VARIANTS = [
  ['sample-final-01', 4, one('strings', 0.12, { octaves: -1 })],
  ['sample-final-02', 4, one('bell', 0.2)],
  ['sample-final-03', 4, one('pad', 0.28, { whole: true })],
  ['sample-final-04', 4, one('guitarLead', 0.16)],
  ['sample-final-05', 4, one('organ', 0.14, { octaves: 1 })],
  ['sample-final-06', 4, one('squareLead', 0.08)],
  ['sample-final-07', 4, one('harp', 0.18)],
  ['sample-final-08', 4, one('brassLead', 0.16, { octaves: -1 })],
  ['sample-final-09', 4, one('flute', 0.16, { semitones: 1 })],
  ['sample-final-10', 4, one('strings', 0.2, { semitones: -1, octaves: -1 })],
  ['sample-final-11', 4, one('bell', 0.15, { semitones: 2 })],
  ['sample-final-12', 4, one('guitarLead', 0.18, { semitones: -2 })],
  ['sample-final-13', 4, one('organ', 0.16, { semitones: 3 })],
  ['sample-final-14', 4, one('guitarLead', 0.17, { major: true })],
  ['sample-final-15', 4, one('softKey', 0.15, { semitones: 7 })],
  ['sample-final-16', 4, one('brassLead', 0.16, { semitones: -5 })],
  ['sample-final-17', 4, one('strings', 0.22, { whole: true })],
  ['sample-final-18', 4, one('bell', 0.12, { bars: HOOK })],
  ['sample-final-19', 4, one('synthBrass', 0.17, { bars: CADENCE })],
  ['sample-final-20', 4, one('triLead', 0.12, { bars: ENDS })],
  ['sample-final-21', 4, one('guitarLead', 0.18, { bars: REVERSED })],
  ['sample-final-22', 4, [...one('guitarLead', 0.15), ...one('strings', 0.12, { semitones: -3 })]],
  ['sample-final-23', 4, [...one('guitarLead', 0.14), ...one('organ', 0.1, { octaves: 1 })]],
  ['sample-final-24', 4, one('bell', 0.26, { swell: true })],
  ['sample-final-25', 2, one('bell', 0.18, { bars: HEAD })],
  ['sample-final-26', 2, one('strings', 0.22, { bars: HEAD, octaves: -1 })],
  ['sample-final-27', 2, one('brassLead', 0.2, { bars: TAIL })],
  ['sample-final-28', 2, one('guitarLead', 0.18, { bars: HEAD, semitones: 1 })],
  ['sample-final-29', 2, one('softKey', 0.16, { bars: TAIL, semitones: 7 })],
  ['sample-final-30', 2, one('pad', 0.3, { bars: TAIL, whole: true })],
];

export const FINAL_SAMPLE_SONGS = VARIANTS.map(([file, barsBefore, layers]) => ({
  ...weave(barsBefore, layers),
  file,
}));

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0);
const seen = new Set();

for (const song of FINAL_SAMPLE_SONGS) {
  if (song.sections[0]?.name !== 'build2-1' || song.sections.at(-1)?.name !== 'chorus1') {
    throw new Error(`${song.file} の範囲が違う`);
  }
  const stamp = [];
  for (const section of song.sections) {
    for (const part of section.parts ?? []) {
      const bars = part.notes.split('|').map((text) => text.trim());
      if (bars.length !== section.chords.length) throw new Error(`${song.file} ${section.name} ${part.inst}: ${bars.length} 小節`);
      bars.forEach((text, index) => {
        const beats = beatsOf(text);
        if (Math.abs(beats - 4) > 1e-6) throw new Error(`${song.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
      });
      stamp.push(`${section.name}:${part.inst}:${part.vol}:${part.notes}`);
    }
  }
  if (seen.has(stamp.join('~'))) throw new Error(`${song.file} が他の曲と同じ`);
  seen.add(stamp.join('~'));
}

const original = FINAL_BOSS_SONG.sections.find((section) => section.name === 'build2-4');
if (original.parts.length !== 2 || original.parts[0].inst !== 'brassLead') throw new Error('本番のラスボス戦にサンプルが混ざった');
if (FINAL_SAMPLE_SONGS.length !== 30) throw new Error(`${FINAL_SAMPLE_SONGS.length} 曲`);
