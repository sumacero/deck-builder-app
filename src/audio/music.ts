import type { AudioSource } from 'expo-audio';
import type { EnemyRank } from '../domain/enemy';

export type MusicId = 'title' | 'battleNormal' | 'battleElite' | 'battleBoss' | 'shop';

type MusicDef = {
  source: AudioSource;
  volume: number;
};

/** 音源は scripts/generate-bgm.mjs で合成している（npm run bgm）。全曲がメインテーマ「三つの旗」の素材を共有する。 */
export const MUSIC: Record<MusicId, MusicDef> = {
  title: { source: require('../../assets/music/title.wav'), volume: 0.34 },
  battleNormal: { source: require('../../assets/music/battle-normal.wav'), volume: 0.34 },
  battleElite: { source: require('../../assets/music/battle-elite.wav'), volume: 0.32 },
  battleBoss: { source: require('../../assets/music/battle-boss.wav'), volume: 0.3 },
  shop: { source: require('../../assets/music/shop.wav'), volume: 0.32 },
};

const BATTLE_MUSIC: Record<EnemyRank, MusicId> = {
  normal: 'battleNormal',
  elite: 'battleElite',
  boss: 'battleBoss',
};

export function battleMusicFor(rank: EnemyRank): MusicId {
  return BATTLE_MUSIC[rank];
}

export type MusicEntry = {
  id: MusicId;
  title: string;
  description: string;
};

/** 図鑑の「BGM」で聴ける曲の一覧。 */
export const MUSIC_ENTRIES: MusicEntry[] = [
  { id: 'title', title: '三つの旗 −序−', description: 'タイトル。笛の旋律と、ゆったりした A メロの頭。' },
  { id: 'battleNormal', title: '三つの旗 −歩−', description: '通常戦闘。ベルと笛で、落ち着いて考えられる。' },
  { id: 'battleElite', title: '三つの旗 −試−', description: 'エリート戦。ギターとオルガンのリフ、ここでサビが初登場。' },
  { id: 'battleBoss', title: '三つの旗 −決−', description: 'ボス戦。ボス専用の旋律とサビ、さらに上へ転調する新しいサビ。' },
  { id: 'shop', title: 'にぎわいの市場', description: 'ショップ。ハープの刻みと笛、ボンゴ。中ほどにメインテーマが顔を出す。' },
];
