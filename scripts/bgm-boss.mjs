// ボス戦「三つの旗 −試−」。イントロ違いの試作（bgm-intro-drafts.mjs）と共有する。
// パートの呼び方（2026-10-05 にオーナーが定義）: イントロ = 導入のリフ（INTRO）/ A メロ = VERSE /
// B メロ = オルガンの駆け上がり（RUN）/ ため = サビ前 / サビ。
import { shiftPhrase } from './bgm-engine.mjs';
import { bars, join4 } from './bgm-song.mjs';
import { CHORUS, CHORUS_CHORDS, INTRO, INTRO_CHORDS, RUN, RUN_CHORDS, VERSE, VERSE_CHORDS } from './bgm-theme.mjs';

/** イントロ（導入のリフ）。ギターと、1 オクターブ上のオルガン。arrange で伴奏や旋律の楽器を差し替えられる。 */
export const bossIntroSection = ({ notes = INTRO, chords = INTRO_CHORDS, organShift = 1, arrange = {} } = {}) => ({
  name: 'riff',
  chords: bars(...chords),
  parts: [
    { inst: 'guitarLead', vol: 0.38, notes },
    { inst: 'organ', vol: 0.2, notes: shiftPhrase(notes, organShift) },
  ],
  comp: ['chug'],
  bass: 'gallop',
  drums: 'rock',
  fill: 'toms',
  ...arrange,
});

/** A メロ〜サビ。 */
export const BOSS_AFTER_INTRO = [
  { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'guitarLead', vol: 0.4, notes: VERSE }], comp: ['organ', 'chug'], bass: 'gallop', drums: 'drive', fill: 'snare' },
  { name: 'run', chords: bars(...RUN_CHORDS), parts: [{ inst: 'organ', vol: 0.36, notes: RUN }], comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' },
  {
    name: 'build',
    chords: bars('Gm', 'A', 'Bb', 'A'),
    parts: [{ inst: 'brassLead', vol: 0.36, notes: join4('G5:4', 'A5:4', 'Bb5:4', 'C#6:4') }],
    comp: ['strings'],
    bass: 'sustain',
    drums: 'half',
    fill: 'roll',
  },
  {
    name: 'chorus',
    chords: bars(...CHORUS_CHORDS),
    parts: [
      { inst: 'brassLead', vol: 0.4, notes: CHORUS },
      { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(CHORUS, -1) },
    ],
    comp: ['stabs', 'chug', 'brassHits'],
    bass: 'drive8',
    drums: 'double',
    fill: 'toms',
  },
];

export const BOSS_BPM = 156;
export const BOSS_MIX = { drive: 0.5, tone: 0.7 };

/** ボス戦「三つの旗 −試−」（156 BPM・約 43 秒）。サビはここで初めて登場。 */
export const MAIN_BOSS = {
  file: 'battle-boss',
  bpm: BOSS_BPM,
  mix: BOSS_MIX,
  sections: [bossIntroSection(), ...BOSS_AFTER_INTRO],
};
