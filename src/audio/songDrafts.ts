// scripts/bgm-song-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- song-draft）。
import type { AudioSource } from 'expo-audio';

type SongDraftTrack = {
  id: `songDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 6 弾: 選んだパートを組み合わせた三つの旗 −試− の改訂版。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const SONG_DRAFT_TRACKS = [
  { id: 'songDraft:01', title: '【試作 1】三つの旗 −試− 改', description: 'イントロはサビ頭の形が小節ごとに速くなる（案 26 + 29）。B メロは 8 小節の五度圏を巡る（案 13）。A メロ・ため・サビは今のまま。（156 BPM）', source: require('../../assets/music/song-draft-01.wav') },
] as const satisfies readonly SongDraftTrack[];

export type SongDraftId = (typeof SONG_DRAFT_TRACKS)[number]['id'];
