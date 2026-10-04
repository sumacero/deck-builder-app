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
  'field:sunkenCity': { source: require('../../assets/music/field-sunken-city.wav'), volume: 0.34 },
  'field:desert': { source: require('../../assets/music/field-desert.wav'), volume: 0.32 },
  'field:snowfield': { source: require('../../assets/music/field-snowfield.wav'), volume: 0.34 },
  'elite:grassland': { source: require('../../assets/music/elite-grassland.wav'), volume: 0.32 },
  'elite:swamp': { source: require('../../assets/music/elite-swamp.wav'), volume: 0.32 },
  'elite:sunkenCity': { source: require('../../assets/music/elite-sunken-city.wav'), volume: 0.32 },
  'elite:desert': { source: require('../../assets/music/elite-desert.wav'), volume: 0.32 },
  'elite:snowfield': { source: require('../../assets/music/elite-snowfield.wav'), volume: 0.32 },
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
  { id: 'field:sunkenCity', title: '水の古都', description: 'フィールド。嬰へ短調のしずくのようなベルとハープ。後半に導入の動機。' },
  { id: 'elite:sunkenCity', title: '沈む都の守護者', description: 'エリート戦（水の古都）。三角波のリフと笛、反響するベル。' },
  { id: 'field:desert', title: '灼熱の砂海', description: 'フィールド。異国の音階の笛とダラブッカ風の打楽器。' },
  { id: 'elite:desert', title: '砂塵の決闘', description: 'エリート戦（砂漠）。蛇使いのようなリフ、導入の動機も砂漠の音階で。' },
  { id: 'field:snowfield', title: '白銀の氷原', description: 'フィールド。きらめくベルとハープの細かな分散和音。' },
  { id: 'elite:snowfield', title: '氷原の剣舞', description: 'エリート戦（氷原）。弦の刻みと澄んだリード。' },
];
