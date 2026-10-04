import type { AudioSource } from 'expo-audio';
import type { EnemyRank } from '../domain/enemy';

export type MusicId = 'battleNormal' | 'battleElite' | 'battleBoss';

type MusicDef = {
  source: AudioSource;
  volume: number;
};

/** 音源は scripts/generate-bgm.mjs で合成している（npm run bgm）。3 曲は共通のモチーフを持つ。 */
export const MUSIC: Record<MusicId, MusicDef> = {
  battleNormal: { source: require('../../assets/music/battle-normal.wav'), volume: 0.35 },
  battleElite: { source: require('../../assets/music/battle-elite.wav'), volume: 0.35 },
  battleBoss: { source: require('../../assets/music/battle-boss.wav'), volume: 0.3 },
};

const BATTLE_MUSIC: Record<EnemyRank, MusicId> = {
  normal: 'battleNormal',
  elite: 'battleElite',
  boss: 'battleBoss',
};

export function battleMusicFor(rank: EnemyRank): MusicId {
  return BATTLE_MUSIC[rank];
}
