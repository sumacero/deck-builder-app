import type { AudioSource } from 'expo-audio';
import type { Region } from '../domain/act';
import type { EnemyRank } from '../domain/enemy';

/** 地域ごとの曲は `field:grassland` のように「種類:地域」で表す。 */
export type MusicId =
  | 'title'
  | 'battleNormal'
  | 'battleBoss'
  | 'shop'
  | `field:${Region}`
  | `elite:${Region}`;

type MusicDef = {
  source: AudioSource;
  volume: number;
};

/** 音源は scripts/generate-bgm.mjs で合成している（npm run bgm）。全曲がメインテーマ「三つの旗」の素材を共有する。 */
export const MUSIC: Record<MusicId, MusicDef> = {
  title: { source: require('../../assets/music/title.wav'), volume: 0.34 },
  battleNormal: { source: require('../../assets/music/battle-normal.wav'), volume: 0.36 },
  battleBoss: { source: require('../../assets/music/battle-boss.wav'), volume: 0.32 },
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
  'elite:grassland': { source: require('../../assets/music/elite-grassland.wav'), volume: 0.32 },
  'elite:swamp': { source: require('../../assets/music/elite-swamp.wav'), volume: 0.32 },
  'elite:cave': { source: require('../../assets/music/elite-cave.wav'), volume: 0.32 },
  'elite:desert': { source: require('../../assets/music/elite-desert.wav'), volume: 0.32 },
  'elite:snowfield': { source: require('../../assets/music/elite-snowfield.wav'), volume: 0.32 },
  'elite:castle': { source: require('../../assets/music/elite-castle.wav'), volume: 0.32 },
  'elite:volcano': { source: require('../../assets/music/elite-volcano.wav'), volume: 0.3 },
  'elite:shadow': { source: require('../../assets/music/elite-shadow.wav'), volume: 0.32 },
  'elite:stars': { source: require('../../assets/music/elite-stars.wav'), volume: 0.32 },
};

/** 通常戦闘とボス戦はどの地域でも共通、エリート戦は地域ごとの曲。 */
export function battleMusicFor(rank: EnemyRank, region: Region): MusicId {
  switch (rank) {
    case 'normal':
      return 'battleNormal';
    case 'elite':
      return `elite:${region}`;
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
  { id: 'battleNormal', title: '三つの旗 −静−', description: '通常戦闘（全地域）。ハープとパッドだけの静かな曲。旋律は和音の奥にひそんでいる。' },
  { id: 'battleBoss', title: '三つの旗 −試−', description: 'ボス戦。ギターとオルガンのリフ、溜めのあとサビが初めて鳴る。' },
  { id: 'shop', title: 'にぎわいの市場', description: 'ショップ。ハープの刻みと笛、ボンゴ。中ほどにメインテーマが顔を出す。' },
  { id: 'field:grassland', title: '風わたる草原', description: 'フィールド。ト長調の笛とハープ。後半に導入の動機が長調で。' },
  { id: 'elite:grassland', title: '草原の剣戟', description: 'エリート戦（草原）。行進のスネアと金管、締めに導入の動機。' },
  { id: 'field:swamp', title: '霧の沼湿原', description: 'フィールド。低いベルとボンゴ、霧の中を手探りで進む。' },
  { id: 'elite:swamp', title: '沼地の攻防', description: 'エリート戦（沼湿原）。三角波のリフと柔らかな鍵盤。' },
  { id: 'field:cave', title: '苔むす洞窟', description: 'フィールド。水晶に響くベル。後半で導入の動機をまるごと。' },
  { id: 'elite:cave', title: '水晶の迷宮', description: 'エリート戦（洞窟）。弦の細かな刻みとリード、反響するベル。' },
  { id: 'field:desert', title: '灼熱の砂海', description: 'フィールド。異国の音階の笛とダラブッカ風の打楽器。' },
  { id: 'elite:desert', title: '砂塵の決闘', description: 'エリート戦（砂漠）。蛇使いのようなリフ、導入の動機も砂漠の音階で。' },
  { id: 'field:snowfield', title: '白銀の氷原', description: 'フィールド。きらめくベルとハープの細かな分散和音。' },
  { id: 'elite:snowfield', title: '氷原の剣舞', description: 'エリート戦（氷原）。弦の刻みと澄んだリード。' },
  { id: 'field:castle', title: '黄昏の城塞', description: 'フィールド。オルガンと行進、導入の動機を倍の長さで。' },
  { id: 'elite:castle', title: '城塞の守り', description: 'エリート戦（城塞）。オルガンのリフと金管、ギャロップのベース。' },
  { id: 'field:volcano', title: '紅蓮の火山', description: 'フィールド。地響きのタムと低い金管。' },
  { id: 'elite:volcano', title: '溶岩の咆哮', description: 'エリート戦（火山）。ギターの刻みと金管。' },
  { id: 'field:shadow', title: '影の深淵', description: 'フィールド。影の差すオルガンと時計のような拍。' },
  { id: 'elite:shadow', title: '影との対峙', description: 'エリート戦（影の世界）。オルガンのリフと重いベース。' },
  { id: 'field:stars', title: '星の頂', description: 'フィールド。雲海の上でまたたくベル。' },
  { id: 'elite:stars', title: '星の戦い', description: 'エリート戦（星の頂）。矩形波のリフと笛、最後に導入の動機。' },
];
