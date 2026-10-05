// scripts/bgm-boss-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- boss-draft）。
import type { AudioSource } from 'expo-audio';

type BossDraftTrack = {
  id: `bossDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 3 弾: 三つの旗 −試− に星灯りの戦旗の雰囲気を入れた試作 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const BOSS_DRAFT_TRACKS = [
  { id: 'bossDraft:01', title: '【試案 1】星灯りの序', description: 'ベルが導入の動機を小さく鳴らして始まる。溜めは −試− の倍の 8 小節。（156 BPM）', source: require('../../assets/music/boss-draft-01.wav') },
  { id: 'bossDraft:02', title: '【試案 2】星灯りの潮騒', description: '弦の和音が少しずつ満ちて始まる。溜めはスネアのロールが段々大きく。（152 BPM）', source: require('../../assets/music/boss-draft-02.wav') },
  { id: 'bossDraft:03', title: '【試案 3】星灯りの誓い', description: '星灯りのサビをベルでそっと引用して始まり、溜めでも弦が星灯りのサビを歌う。（156 BPM）', source: require('../../assets/music/boss-draft-03.wav') },
  { id: 'bossDraft:04', title: '【試案 4】星灯りのオルゴール', description: 'サビの頭をオルゴールのように鳴らして始まる。（160 BPM）', source: require('../../assets/music/boss-draft-04.wav') },
  { id: 'bossDraft:05', title: '【試案 5】星灯りの鼓動', description: '鼓動のようなティンパニで始まる。溜めはいったん音を引いてから盛り返す。ギター強め。（150 BPM）', source: require('../../assets/music/boss-draft-05.wav') },
  { id: 'bossDraft:06', title: '【試案 6】星灯りの朝', description: 'ハープだけで始まり、笛が A メロの頭をゆっくり。溜めはスネアのロールが段々大きく。（156 BPM）', source: require('../../assets/music/boss-draft-06.wav') },
  { id: 'bossDraft:07', title: '【試案 7】星灯りの聖堂', description: 'オルガンの聖歌のように始まる。溜めで一段上がり、サビはホ短調に転調。（154 BPM）', source: require('../../assets/music/boss-draft-07.wav') },
  { id: 'bossDraft:08', title: '【試案 8】星灯りの行軍', description: '遠くから行進が近づいてくる出だし。ギター強め。（148 BPM）', source: require('../../assets/music/boss-draft-08.wav') },
  { id: 'bossDraft:09', title: '【試案 9】星灯りのまたたき', description: '星がまたたくようなハープとベルで始まる。溜めで星灯りのサビを引用。（158 BPM）', source: require('../../assets/music/boss-draft-09.wav') },
  { id: 'bossDraft:10', title: '【試案 10】星灯りの凱旋', description: 'エレピと遠い笛で始まる。溜めは音を引いてから盛り返し、サビは 2 回目で一段上がる。（156 BPM）', source: require('../../assets/music/boss-draft-10.wav') },
] as const satisfies readonly BossDraftTrack[];

export type BossDraftId = (typeof BOSS_DRAFT_TRACKS)[number]['id'];
