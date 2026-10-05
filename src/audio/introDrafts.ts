// scripts/bgm-intro-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- intro-draft）。
import type { AudioSource } from 'expo-audio';

type IntroDraftTrack = {
  id: `introDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 4 弾: 三つの旗 −試− のイントロ（導入のリフ）の候補（音源はイントロ + A メロ）。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const INTRO_DRAFT_TRACKS = [
  { id: 'introDraft:26', title: '【イントロ案 26】速まる足音', description: '2 分音符 → 4 分 → 8 分 → 16 分と、小節ごとに音の細かさが倍になって加速していく。（156 BPM）', source: require('../../assets/music/intro-draft-26.wav') },
  { id: 'introDraft:29', title: '【イントロ案 29】サビの予告', description: 'サビ頭の「レー・ドー・シ♭」の形をそのまま使い、1 段ずつ上げていく。最初からサビを予感させる。（156 BPM）', source: require('../../assets/music/intro-draft-29.wav') },
] as const satisfies readonly IntroDraftTrack[];

export type IntroDraftId = (typeof INTRO_DRAFT_TRACKS)[number]['id'];
