// scripts/bgm-full-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- full-draft）。
import type { AudioSource } from 'expo-audio';

type FullDraftTrack = {
  id: `fullDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 2 弾: 気に入ったサビを「三つの旗 −試−」と同じ構成で 1 曲にした試作 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const FULL_DRAFT_TRACKS = [
  { id: 'fullDraft:01', title: '【構成 1】蒼き約束 −試−', description: '【サビ 1】を −試− の構成で。ギターとオルガンのロック。（152 BPM）', source: require('../../assets/music/full-draft-01.wav') },
  { id: 'fullDraft:02', title: '【構成 2】蒼き約束 −翔−', description: '【サビ 1】を −試− の構成で。シンセと矩形波のアニメ主題歌風。（152 BPM）', source: require('../../assets/music/full-draft-02.wav') },
  { id: 'fullDraft:03', title: '【構成 3】疾風怒濤 −試−', description: '【サビ 22】を −試− の構成で。ギターとオルガンのロック。（172 BPM）', source: require('../../assets/music/full-draft-03.wav') },
  { id: 'fullDraft:04', title: '【構成 4】疾風怒濤 −覇−', description: '【サビ 22】を −試− の構成で。金管・弦・ギターの壮大な版。（172 BPM）', source: require('../../assets/music/full-draft-04.wav') },
  { id: 'fullDraft:05', title: '【構成 5】妖精の悪戯 −試−', description: '【サビ 40】を −試− の構成で。ギターとオルガンのロック。（148 BPM）', source: require('../../assets/music/full-draft-05.wav') },
  { id: 'fullDraft:06', title: '【構成 6】妖精の悪戯 −舞−', description: '【サビ 40】を −試− の構成で。ベルと笛、16 分のハープ。（148 BPM）', source: require('../../assets/music/full-draft-06.wav') },
  { id: 'fullDraft:07', title: '【構成 7】暁の誓約', description: '新しいサビ（【サビ 1】と同じ作り方）。シンセのアニメ主題歌風。（150 BPM）', source: require('../../assets/music/full-draft-07.wav') },
  { id: 'fullDraft:08', title: '【構成 8】紅蓮の疾駆', description: '新しいサビ（【サビ 22】と同じ作り方、ニ短調）。ロック。（170 BPM）', source: require('../../assets/music/full-draft-08.wav') },
  { id: 'fullDraft:09', title: '【構成 9】月影の妖精', description: '新しいサビ（【サビ 40】と同じ作り方）。ベルと笛。（146 BPM）', source: require('../../assets/music/full-draft-09.wav') },
  { id: 'fullDraft:10', title: '【構成 10】星灯りの戦旗', description: '新しいサビ（カノン進行）。金管・弦・ギターの壮大な版。（156 BPM）', source: require('../../assets/music/full-draft-10.wav') },
] as const satisfies readonly FullDraftTrack[];

export type FullDraftId = (typeof FULL_DRAFT_TRACKS)[number]['id'];
