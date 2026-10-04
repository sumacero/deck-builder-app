import type { AudioSource } from 'expo-audio';
import type { Region } from '../domain/act';
import type { EnemyRank } from '../domain/enemy';

/** 地域ごとの曲は `field:grassland` のように「種類:地域」で表す。 */
export type MusicId =
  | 'title'
  | 'battleElite'
  | 'battleBoss'
  | 'shop'
  | `field:${Region}`
  | `battle:${Region}`;

type MusicDef = {
  source: AudioSource;
  volume: number;
};

/** 音源は scripts/generate-bgm.mjs で合成している（npm run bgm）。全曲がメインテーマ「三つの旗」の素材を共有する。 */
export const MUSIC: Record<MusicId, MusicDef> = {
  title: { source: require('../../assets/music/title.wav'), volume: 0.34 },
  battleElite: { source: require('../../assets/music/battle-elite.wav'), volume: 0.32 },
  battleBoss: { source: require('../../assets/music/battle-boss.wav'), volume: 0.3 },
  shop: { source: require('../../assets/music/shop.wav'), volume: 0.32 },
  'field:grassland': { source: require('../../assets/music/field-grassland.wav'), volume: 0.32 },
  'field:swamp': { source: require('../../assets/music/field-swamp.wav'), volume: 0.34 },
  'field:cave': { source: require('../../assets/music/field-cave.wav'), volume: 0.34 },
  'field:desert': { source: require('../../assets/music/field-desert.wav'), volume: 0.32 },
  'field:snowfield': { source: require('../../assets/music/field-snowfield.wav'), volume: 0.34 },
  'field:castle': { source: require('../../assets/music/field-castle.wav'), volume: 0.32 },
  'field:volcano': { source: require('../../assets/music/field-volcano.wav'), volume: 0.32 },
  'field:shadow': { source: require('../../assets/music/field-shadow.wav'), volume: 0.34 },
  'field:stars': { source: require('../../assets/music/field-stars.wav'), volume: 0.34 },
  'battle:grassland': { source: require('../../assets/music/battle-grassland.wav'), volume: 0.32 },
  'battle:swamp': { source: require('../../assets/music/battle-swamp.wav'), volume: 0.32 },
  'battle:cave': { source: require('../../assets/music/battle-normal.wav'), volume: 0.34 },
  'battle:desert': { source: require('../../assets/music/battle-desert.wav'), volume: 0.32 },
  'battle:snowfield': { source: require('../../assets/music/battle-snowfield.wav'), volume: 0.32 },
  'battle:castle': { source: require('../../assets/music/battle-castle.wav'), volume: 0.32 },
  'battle:volcano': { source: require('../../assets/music/battle-volcano.wav'), volume: 0.3 },
  'battle:shadow': { source: require('../../assets/music/battle-shadow.wav'), volume: 0.32 },
  'battle:stars': { source: require('../../assets/music/battle-stars.wav'), volume: 0.32 },
};

/** 通常戦闘は地域ごとのアレンジ、エリート戦・ボス戦はどの地域でも共通。 */
export function battleMusicFor(rank: EnemyRank, region: Region): MusicId {
  switch (rank) {
    case 'normal':
      return `battle:${region}`;
    case 'elite':
      return 'battleElite';
    case 'boss':
      return 'battleBoss';
  }
}

export const fieldMusicFor = (region: Region): MusicId => `field:${region}`;

export type MusicEntry = {
  id: MusicId;
  title: string;
  description: string;
};

/** 図鑑の「BGM」で聴ける曲の一覧。 */
export const MUSIC_ENTRIES: MusicEntry[] = [
  { id: 'title', title: '三つの旗 −序−', description: 'タイトル。笛の旋律と、ゆったりした A メロの頭。' },
  { id: 'battle:cave', title: '三つの旗 −歩−', description: '通常戦闘（洞窟）。ベルと笛で、落ち着いて考えられる。' },
  { id: 'battleElite', title: '三つの旗 −試−', description: 'エリート戦。ギターとオルガンのリフ、ここでサビが初登場。' },
  { id: 'battleBoss', title: '三つの旗 −決−', description: 'ボス戦。ボス専用の旋律とサビ、さらに上へ転調する新しいサビ。' },
  { id: 'shop', title: 'にぎわいの市場', description: 'ショップ。ハープの刻みと笛、ボンゴ。中ほどにメインテーマが顔を出す。' },
  { id: 'field:grassland', title: '風わたる草原', description: 'フィールド。ト長調の笛とハープ。後半に導入の動機が長調で。' },
  { id: 'battle:grassland', title: '草原の剣戟', description: '通常戦闘（草原）。行進のスネアと金管、締めに導入の動機。' },
  { id: 'field:swamp', title: '霧の沼湿原', description: 'フィールド。低いベルとボンゴ、霧の中を手探りで進む。' },
  { id: 'battle:swamp', title: '沼地の攻防', description: '通常戦闘（沼湿原）。三角波のリフと柔らかな鍵盤。' },
  { id: 'field:cave', title: '苔むす洞窟', description: 'フィールド。水晶に響くベル。後半で導入の動機をまるごと。' },
  { id: 'field:desert', title: '灼熱の砂海', description: 'フィールド。異国の音階の笛とダラブッカ風の打楽器。' },
  { id: 'battle:desert', title: '砂塵の決闘', description: '通常戦闘（砂漠）。蛇使いのようなリフ、導入の動機も砂漠の音階で。' },
  { id: 'field:snowfield', title: '白銀の氷原', description: 'フィールド。きらめくベルとハープの細かな分散和音。' },
  { id: 'battle:snowfield', title: '氷原の剣舞', description: '通常戦闘（氷原）。弦の刻みと澄んだリード。' },
  { id: 'field:castle', title: '黄昏の城塞', description: 'フィールド。オルガンと行進、導入の動機を倍の長さで。' },
  { id: 'battle:castle', title: '城塞の守り', description: '通常戦闘（城塞）。オルガンのリフと金管、ギャロップのベース。' },
  { id: 'field:volcano', title: '紅蓮の火山', description: 'フィールド。地響きのタムと低い金管。' },
  { id: 'battle:volcano', title: '溶岩の咆哮', description: '通常戦闘（火山）。ギターの刻みと金管、いちばん熱い通常戦。' },
  { id: 'field:shadow', title: '影の深淵', description: 'フィールド。影の差すオルガンと時計のような拍。' },
  { id: 'battle:shadow', title: '影との対峙', description: '通常戦闘（影の世界）。オルガンのリフと重いベース。' },
  { id: 'field:stars', title: '星の頂', description: 'フィールド。雲海の上でまたたくベル。' },
  { id: 'battle:stars', title: '星の戦い', description: '通常戦闘（星の頂）。矩形波のリフと笛、最後に導入の動機。' },
];
