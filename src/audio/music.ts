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

type ThemeMusicId = 'theme02' | 'theme05' | 'theme06' | 'theme10';

type MainMusicId = 'mainTitle' | 'mainNormal' | 'mainElite' | 'mainBoss';

export type MusicId = 'battleNormal' | 'battleElite' | 'battleBoss' | TrialMusicId | ThemeMusicId | MainMusicId;

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
  theme02: { source: require('../../assets/music/theme/theme-02.wav'), volume: 0.32 },
  theme05: { source: require('../../assets/music/theme/theme-05.wav'), volume: 0.32 },
  theme06: { source: require('../../assets/music/theme/theme-06.wav'), volume: 0.32 },
  theme10: { source: require('../../assets/music/theme/theme-10.wav'), volume: 0.32 },
  mainTitle: { source: require('../../assets/music/theme/main-title.wav'), volume: 0.34 },
  mainNormal: { source: require('../../assets/music/theme/main-normal.wav'), volume: 0.34 },
  mainElite: { source: require('../../assets/music/theme/main-elite.wav'), volume: 0.32 },
  mainBoss: { source: require('../../assets/music/theme/main-boss.wav'), volume: 0.3 },
};

const BATTLE_MUSIC: Record<EnemyRank, MusicId> = {
  normal: 'battleNormal',
  elite: 'battleElite',
  boss: 'battleBoss',
};

export function battleMusicFor(rank: EnemyRank): MusicId {
  return BATTLE_MUSIC[rank];
}

export type MusicGroup = 'main' | 'theme' | 'current' | 'trial';

export type MusicEntry = {
  id: MusicId;
  group: MusicGroup;
  title: string;
  description: string;
};

/** 図鑑の「BGM」で聴ける曲の一覧。 */
export const MUSIC_ENTRIES: MusicEntry[] = [
  { id: 'mainTitle', group: 'main', title: 'メインタイトル', description: '笛の新しい旋律で始まり、中ほどで A メロの頭をゆったり。サビなし。72 BPM・約 40 秒。' },
  { id: 'mainNormal', group: 'main', title: '通常戦闘', description: '「静」と「思索」の中間。ベルと笛、A メロの前半を使う。サビなし。100 BPM・約 38 秒。' },
  { id: 'mainElite', group: 'main', title: 'エリート戦', description: '「激闘」のテンポを落とし、溜めを入れてサビが初登場。156 BPM・約 43 秒。' },
  { id: 'mainBoss', group: 'main', title: 'ボス戦', description: '不穏な前奏と新しいリフ → ボス専用の旋律 → サビ → さらに上へ転調する新しいサビ。176 BPM・約 60 秒。' },
  { id: 'theme02', group: 'theme', title: '三つの旗 −静−', description: '通常戦闘向け。笛と分散和音で落ち着いて考えられる。108 BPM。' },
  { id: 'theme05', group: 'theme', title: '三つの旗 −激闘−', description: 'ボス向け。ギターとオルガンのリフ、駆けるベース。176 BPM。' },
  { id: 'theme06', group: 'theme', title: '三つの旗 −決戦−', description: '最終ボス向け。オルガンの前奏、最後はサビを転調して鳴らし切る。160 BPM。' },
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
