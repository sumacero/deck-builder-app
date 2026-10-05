// scripts/bgm-song-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- song-draft）。
import type { AudioSource } from 'expo-audio';

type SongDraftTrack = {
  id: `songDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 8 弾: 三つの旗 −試− 改の改善案 1・6・9 を統合した版。図鑑で聞くだけで、ゲーム中には流れない。 */
export const SONG_DRAFT_TRACKS = [
  { id: 'songDraft:01', title: '【試作 1】三つの旗 −試− 改 統合版', description: '改善案 1・6・9 の統合。イントロはドラムも一緒に加速。ためは 8 小節で、前半はギターが歌い、後半は金管が上り詰めてギターの刻みと行進のスネアで押す。サビの最後はレに解決してイントロへ戻る。A メロ・B メロを抑え、ため後半は 1 小節ずつ大きくして、サビが一番大きく聞こえるようにした。（156 BPM）', source: require('../../assets/music/song-draft-01.wav') },
] as const satisfies readonly SongDraftTrack[];

export type SongDraftId = (typeof SONG_DRAFT_TRACKS)[number]['id'];
