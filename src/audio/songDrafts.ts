// scripts/bgm-song-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- song-draft）。
import type { AudioSource } from 'expo-audio';

type SongDraftTrack = {
  id: `songDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 7 弾: 三つの旗 −試− 改の「ため」とループの継ぎ目を直した改善案 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const SONG_DRAFT_TRACKS = [
  { id: 'songDraft:01', title: '【改善案 1】8 小節の上り坂 × イントロのドラムも加速', description: 'ため: ためを 8 小節に。金管の長い音が 1 段ずつ 8 段上がり、後半は行進のスネアと金管の合いの手で盛り上げる。ループ: イントロのドラムを旋律と一緒にティンパニ → ハーフ → 8 ビート → ツーバスと加速させ、ゆったりした頭に自然に戻る。（156 BPM）', source: require('../../assets/music/song-draft-01.wav') },
  { id: 'songDraft:02', title: '【改善案 2】8 小節の上り坂 × 終止の 2 小節', description: 'ため: ためを 8 小節に。金管の長い音が 1 段ずつ 8 段上がり、後半は行進のスネアと金管の合いの手で盛り上げる。ループ: サビのあとに、金管とギターがレを伸ばして静まる 2 小節を足し、落ち着いてからイントロへ戻る。（156 BPM）', source: require('../../assets/music/song-draft-02.wav') },
  { id: 'songDraft:03', title: '【改善案 3】サビの影 × サビの最後をレに解決', description: 'ため: ためを 8 小節に。サビ頭の「レー・ドー・シ♭」を 4 倍の長さにして金管がゆったり予告する。ループ: サビの最後を高いラで終わらずレに落ち着かせ、イントロの頭（B♭）へなめらかにつなぐ。イントロのドラムも加速させる。（156 BPM）', source: require('../../assets/music/song-draft-03.wav') },
  { id: 'songDraft:04', title: '【改善案 4】サビの影 × イントロのドラムも加速', description: 'ため: ためを 8 小節に。サビ頭の「レー・ドー・シ♭」を 4 倍の長さにして金管がゆったり予告する。ループ: イントロのドラムを旋律と一緒にティンパニ → ハーフ → 8 ビート → ツーバスと加速させ、ゆったりした頭に自然に戻る。（156 BPM）', source: require('../../assets/music/song-draft-04.wav') },
  { id: 'songDraft:05', title: '【改善案 5】刻みで溜める × キメの 1 小節', description: 'ため: ためは 4 小節のまま。金管の長い音の下でギターが同じ音を 8 分 → 16 分で刻み、行進のスネアで前へ押す。ループ: サビのあとに、全員でレを 1 発鳴らして止まり、タムの合図だけでイントロへ戻る 1 小節を足す。（156 BPM）', source: require('../../assets/music/song-draft-05.wav') },
  { id: 'songDraft:06', title: '【改善案 6】刻みで溜める × サビの最後をレに解決', description: 'ため: ためは 4 小節のまま。金管の長い音の下でギターが同じ音を 8 分 → 16 分で刻み、行進のスネアで前へ押す。ループ: サビの最後を高いラで終わらずレに落ち着かせ、イントロの頭（B♭）へなめらかにつなぐ。イントロのドラムも加速させる。（156 BPM）', source: require('../../assets/music/song-draft-06.wav') },
  { id: 'songDraft:07', title: '【改善案 7】息継ぎ × イントロのドラムも加速', description: 'ため: ためを 8 小節に。忙しい B メロのあと、前半はドラムを止めて弦と金管だけで小さく息をつき、後半のティンパニとロールで一気に溜める。ループ: イントロのドラムを旋律と一緒にティンパニ → ハーフ → 8 ビート → ツーバスと加速させ、ゆったりした頭に自然に戻る。（156 BPM）', source: require('../../assets/music/song-draft-07.wav') },
  { id: 'songDraft:08', title: '【改善案 8】息継ぎ × 終止の 2 小節', description: 'ため: ためを 8 小節に。忙しい B メロのあと、前半はドラムを止めて弦と金管だけで小さく息をつき、後半のティンパニとロールで一気に溜める。ループ: サビのあとに、金管とギターがレを伸ばして静まる 2 小節を足し、落ち着いてからイントロへ戻る。（156 BPM）', source: require('../../assets/music/song-draft-08.wav') },
  { id: 'songDraft:09', title: '【改善案 9】ギターの泣き × サビの最後をレに解決', description: 'ため: ためを 8 小節に。ギターが歌う旋律を乗せ、後半は金管の長い音が重なって高まっていく。ループ: サビの最後を高いラで終わらずレに落ち着かせ、イントロの頭（B♭）へなめらかにつなぐ。イントロのドラムも加速させる。（156 BPM）', source: require('../../assets/music/song-draft-09.wav') },
  { id: 'songDraft:10', title: '【改善案 10】ギターの泣き × キメの 1 小節', description: 'ため: ためを 8 小節に。ギターが歌う旋律を乗せ、後半は金管の長い音が重なって高まっていく。ループ: サビのあとに、全員でレを 1 発鳴らして止まり、タムの合図だけでイントロへ戻る 1 小節を足す。（156 BPM）', source: require('../../assets/music/song-draft-10.wav') },
] as const satisfies readonly SongDraftTrack[];

export type SongDraftId = (typeof SONG_DRAFT_TRACKS)[number]['id'];
