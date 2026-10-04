import type { AudioSource } from 'expo-audio';
import type { EnemyRank } from '../domain/enemy';

type TrialMusicId =
  | 'trial01'
  | 'trial02'
  | 'trial03'
  | 'trial04'
  | 'trial05'
  | 'trial06'
  | 'trial07'
  | 'trial08'
  | 'trial09'
  | 'trial10';

type ThemeMusicId =
  | 'theme01'
  | 'theme02'
  | 'theme03'
  | 'theme04'
  | 'theme05'
  | 'theme06'
  | 'theme07'
  | 'theme08'
  | 'theme09'
  | 'theme10';

export type MusicId = 'battleNormal' | 'battleElite' | 'battleBoss' | TrialMusicId | ThemeMusicId;

type MusicDef = {
  source: AudioSource;
  volume: number;
};

/**
 * 音源は scripts/generate-bgm.mjs（戦闘の 3 曲。共通のモチーフを持つ）と
 * scripts/generate-bgm-trial.mjs（試作 10 曲）、scripts/generate-bgm-theme.mjs（メインテーマの変奏 10 曲）で
 * 合成している（npm run bgm / npm run bgm:trial / npm run bgm:theme）。
 */
export const MUSIC: Record<MusicId, MusicDef> = {
  battleNormal: { source: require('../../assets/music/battle-normal.wav'), volume: 0.35 },
  battleElite: { source: require('../../assets/music/battle-elite.wav'), volume: 0.35 },
  battleBoss: { source: require('../../assets/music/battle-boss.wav'), volume: 0.3 },
  trial01: { source: require('../../assets/music/trial/trial-01.wav'), volume: 0.32 },
  trial02: { source: require('../../assets/music/trial/trial-02.wav'), volume: 0.32 },
  trial03: { source: require('../../assets/music/trial/trial-03.wav'), volume: 0.32 },
  trial04: { source: require('../../assets/music/trial/trial-04.wav'), volume: 0.32 },
  trial05: { source: require('../../assets/music/trial/trial-05.wav'), volume: 0.32 },
  trial06: { source: require('../../assets/music/trial/trial-06.wav'), volume: 0.32 },
  trial07: { source: require('../../assets/music/trial/trial-07.wav'), volume: 0.32 },
  trial08: { source: require('../../assets/music/trial/trial-08.wav'), volume: 0.32 },
  trial09: { source: require('../../assets/music/trial/trial-09.wav'), volume: 0.32 },
  trial10: { source: require('../../assets/music/trial/trial-10.wav'), volume: 0.32 },
  theme01: { source: require('../../assets/music/theme/theme-01.wav'), volume: 0.32 },
  theme02: { source: require('../../assets/music/theme/theme-02.wav'), volume: 0.32 },
  theme03: { source: require('../../assets/music/theme/theme-03.wav'), volume: 0.32 },
  theme04: { source: require('../../assets/music/theme/theme-04.wav'), volume: 0.32 },
  theme05: { source: require('../../assets/music/theme/theme-05.wav'), volume: 0.32 },
  theme06: { source: require('../../assets/music/theme/theme-06.wav'), volume: 0.32 },
  theme07: { source: require('../../assets/music/theme/theme-07.wav'), volume: 0.32 },
  theme08: { source: require('../../assets/music/theme/theme-08.wav'), volume: 0.32 },
  theme09: { source: require('../../assets/music/theme/theme-09.wav'), volume: 0.32 },
  theme10: { source: require('../../assets/music/theme/theme-10.wav'), volume: 0.32 },
};

const BATTLE_MUSIC: Record<EnemyRank, MusicId> = {
  normal: 'battleNormal',
  elite: 'battleElite',
  boss: 'battleBoss',
};

export function battleMusicFor(rank: EnemyRank): MusicId {
  return BATTLE_MUSIC[rank];
}

export type MusicGroup = 'theme' | 'current' | 'trial';

export type MusicEntry = {
  id: MusicId;
  group: MusicGroup;
  title: string;
  description: string;
};

/** 図鑑の「BGM」で聴ける曲の一覧。 */
export const MUSIC_ENTRIES: MusicEntry[] = [
  { id: 'theme01', group: 'theme', title: '三つの旗 −完全版−', description: '04 をもとに、最後にサビを全楽器でもう一度。160 BPM。' },
  { id: 'theme02', group: 'theme', title: '三つの旗 −静−', description: '通常戦闘向け。笛と分散和音で落ち着いて考えられる。108 BPM。' },
  { id: 'theme03', group: 'theme', title: '三つの旗 −思索−', description: '通常戦闘向け。ベルと笛だけ、いちばん静か。92 BPM。' },
  { id: 'theme04', group: 'theme', title: '三つの旗 −行軍−', description: 'エリート向け。金管と弦の刻み、行進のスネア。138 BPM。' },
  { id: 'theme05', group: 'theme', title: '三つの旗 −激闘−', description: 'ボス向け。ギターとオルガンのリフ、駆けるベース。176 BPM。' },
  { id: 'theme06', group: 'theme', title: '三つの旗 −決戦−', description: '最終ボス向け。オルガンの前奏、最後はサビを転調して鳴らし切る。160 BPM。' },
  { id: 'theme07', group: 'theme', title: '三つの旗 −凱歌−', description: '同じ旋律を長調に。勝利後やマップの候補。132 BPM。' },
  { id: 'theme08', group: 'theme', title: '三つの旗 −南風−', description: 'ポケモン風。シンセブラスとスラップベース。172 BPM。' },
  { id: 'theme09', group: 'theme', title: '三つの旗 −剣閃−', description: 'テイルズ風。オルガンと歪みギターのロック。168 BPM。' },
  { id: 'theme10', group: 'theme', title: '三つの旗 −夜明け−', description: 'タイトル・マップ向け。サビをゆったり倍の長さで歌う。84 BPM。' },
  { id: 'battleNormal', group: 'current', title: '静寂の書庫', description: '通常戦闘。ゆっくり静かなベル。' },
  { id: 'battleElite', group: 'current', title: '試練の回廊', description: 'エリート戦闘。三角波の軽い刻み。' },
  { id: 'battleBoss', group: 'current', title: '決戦', description: 'ボス戦闘。矩形波のリフ。' },
  { id: 'trial01', group: 'trial', title: '剣閃の輪舞', description: 'テイルズ寄り。オルガンと歪みギターのロック、168 BPM。' },
  { id: 'trial02', group: 'trial', title: '蒼穹の艦隊', description: 'アルカディア寄り。金管と弦、行進のスネア、148 BPM。' },
  { id: 'trial03', group: 'trial', title: '南風のチャンピオン', description: 'ポケモン寄り。シンセブラスの裏打ちと南国の打楽器、176 BPM。' },
  { id: 'trial04', group: 'trial', title: '三つの旗', description: '3 曲の平均。金管・ギター・シンセを均等に、160 BPM。' },
  { id: 'trial05', group: 'trial', title: '紅蓮の決闘', description: 'テイルズ寄りのボス曲。疾走ベースと半音階の駆け上がり、178 BPM。' },
  { id: 'trial06', group: 'trial', title: '風の甲板', description: 'アルカディア寄りの通常戦闘。笛と金管で明るく、140 BPM。' },
  { id: 'trial07', group: 'trial', title: '島の祭り太鼓', description: 'ポケモン寄り。スラップベースで踊るように、170 BPM。' },
  { id: 'trial08', group: 'trial', title: '王道バトル', description: 'テイルズ＋ポケモンの平均。矩形波とパワーコード、172 BPM。' },
  { id: 'trial09', group: 'trial', title: '冒険者の凱歌', description: 'アルカディア＋ポケモンの平均。金管とスラップ、156 BPM。' },
  { id: 'trial10', group: 'trial', title: '最終決戦', description: '3 曲すべての平均のボス曲。オルガン序奏 → 全部入り、150 BPM。' },
];
