// タイトル曲の候補探し 第 4 弾（2026-10-05）: 「三つの旗 −試−」のイントロ（導入のリフ）だけを差し替えた案。
// 30 案から、オーナーが気に入った 26 速まる足音・29 サビの予告だけを残している（番号は 30 案のときのまま）。
// 聞き比べやすいよう、音源はイントロ + A メロだけ（intro-draft-26 / 29.wav）。図鑑の一覧 src/audio/introDrafts.ts はこの台本が書き出す。
import { BOSS_AFTER_INTRO, BOSS_BPM, BOSS_MIX, bossIntroSection } from './bgm-boss.mjs';
import { pad2, writeDraftCatalog } from './bgm-melody.mjs';
import { join4 } from './bgm-song.mjs';

const [verse] = BOSS_AFTER_INTRO;

/** どれもニ短調で、属和音 A で終わって A メロの Dm へ入る。organShift はオルガンの重ね（高い旋律は同じ高さ）。 */
const INTROS = [
  {
    no: 26,
    name: '速まる足音',
    desc: '2 分音符 → 4 分 → 8 分 → 16 分と、小節ごとに音の細かさが倍になって加速していく。',
    chords: ['Dm', 'Dm', 'Gm C', 'A'],
    notes: join4(
      'D5:2 F5:2',
      'A5:1 G5:1 F5:1 A5:1',
      'Bb5:0.5 A5:0.5 G5:0.5 Bb5:0.5 C6:0.5 Bb5:0.5 A5:0.5 C6:0.5',
      'C#6:0.25 D6:0.25 E6:0.25 D6:0.25 C#6:0.25 B5:0.25 A5:0.25 G5:0.25 E5:1 C#5:1',
    ),
  },
  {
    no: 29,
    name: 'サビの予告',
    desc: 'サビ頭の「レー・ドー・シ♭」の形をそのまま使い、1 段ずつ上げていく。最初からサビを予感させる。',
    chords: ['Bb', 'C', 'Dm', 'A'],
    organShift: 0,
    notes: join4(
      'D6:0.75 C6:0.75 Bb5:0.5 F5:1 D6:1',
      'E6:0.75 D6:0.75 C6:0.5 G5:1 E6:1',
      'F6:0.75 E6:0.75 D6:0.5 A5:1 F6:1',
      'E6:0.75 D6:0.75 C#6:0.5 A5:0.5 E5:0.5 C#5:1',
    ),
  },
];

export const INTRO_DRAFTS = INTROS.map((intro) => ({
  file: `intro-draft-${pad2(intro.no)}`,
  bpm: BOSS_BPM,
  mix: BOSS_MIX,
  sections: [bossIntroSection(intro), verse],
}));

export const writeIntroDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'intro',
    label: 'イントロ案',
    script: 'scripts/bgm-intro-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 4 弾: 三つの旗 −試− のイントロ（導入のリフ）の候補（音源はイントロ + A メロ）。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: INTROS.map((intro) => ({ no: intro.no, name: intro.name, desc: intro.desc, bpm: BOSS_BPM })),
  });
