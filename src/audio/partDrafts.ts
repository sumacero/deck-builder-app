// scripts/bgm-boss-parts.mjs が書き出すファイル。手で直さない（npm run bgm -- part-draft）。
import type { AudioSource } from 'expo-audio';

type PartDraftTrack = {
  id: `partDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** 三つの旗 −試− をパートごとに切り出した音源（パートの呼び方の確認用）。図鑑で聞くだけで、ゲーム中には流れない。 */
export const PART_DRAFT_TRACKS = [
  { id: 'partDraft:01', title: '【パート 1】イントロ', description: '−試− の導入のリフ。ギターとオルガン（4 小節）。（156 BPM）', source: require('../../assets/music/part-draft-01.wav') },
  { id: 'partDraft:02', title: '【パート 2】A メロ', description: 'ギターの主旋律（8 小節）。（156 BPM）', source: require('../../assets/music/part-draft-02.wav') },
  { id: 'partDraft:03', title: '【パート 3】B メロ', description: 'オルガンの駆け上がり（4 小節）。（156 BPM）', source: require('../../assets/music/part-draft-03.wav') },
  { id: 'partDraft:04', title: '【パート 4】ため', description: 'サビ前。金管の長い音とスネアのロール（4 小節）。（156 BPM）', source: require('../../assets/music/part-draft-04.wav') },
  { id: 'partDraft:05', title: '【パート 5】サビ', description: '金管の主旋律と低いギター（8 小節）。（156 BPM）', source: require('../../assets/music/part-draft-05.wav') },
] as const satisfies readonly PartDraftTrack[];

export type PartDraftId = (typeof PART_DRAFT_TRACKS)[number]['id'];
