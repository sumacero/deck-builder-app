import type { AudioSource } from 'expo-audio';
import type { Region } from '../domain/act';
import type { EnemyRank } from '../domain/enemy';

/** 地域ごとの曲は `field:grassland` のように「種類:地域」で表す。 */
export type MusicId =
  | 'title'
  | 'titleLene'
  | 'titleNoa'
  | 'battleNormal'
  | 'battleBoss'
  | 'battleFinal'
  | 'shop'
  | 'bossSample01'
  | 'bossSample02'
  | 'bossSample03'
  | 'bossSample04'
  | 'bossSample05'
  | 'bossSample06'
  | 'bossSample07'
  | 'bossSample08'
  | 'bossSample09'
  | 'bossSample10'
  | 'bossSample11'
  | 'bossSample12'
  | 'bossSample13'
  | 'bossSample14'
  | 'bossSample15'
  | 'bossSample16'
  | 'bossSample17'
  | 'bossSample18'
  | 'bossSample19'
  | 'bossSample20'
  | 'bossSample21'
  | 'bossSample22'
  | 'bossSample23'
  | 'bossSample24'
  | 'bossSample25'
  | 'bossSample26'
  | 'bossSample27'
  | 'bossSample28'
  | 'bossSample29'
  | 'bossSample30'
  | `field:${Region}`
  | `elite:${Region}`;

/** タイトル画面で流す 3 キャラ分の曲（起動のたびにどれか 1 つ）。 */
export type TitleMusicId = 'title' | 'titleLene' | 'titleNoa';

export const TITLE_MUSIC_IDS: readonly TitleMusicId[] = ['title', 'titleLene', 'titleNoa'];

/** タイトル画面用。3 キャラの曲から等確率で 1 つ選ぶ。 */
export function pickTitleMusic(): TitleMusicId {
  return TITLE_MUSIC_IDS[Math.floor(Math.random() * TITLE_MUSIC_IDS.length)]!;
}

type MusicDef = {
  source: AudioSource;
  volume: number;
};

/** 音源は scripts/generate-bgm.mjs で合成している（npm run bgm）。本編の曲はメインテーマ「三つの旗」の素材を共有する。 */
export const MUSIC: Record<MusicId, MusicDef> = {
  title: { source: require('../../assets/music/title.wav'), volume: 0.34 },
  /** 旧【サンプル 2】。翠風のリーネのタイトル。 */
  titleLene: { source: require('../../assets/music/title-lene.wav'), volume: 0.34 },
  /** 旧【サンプル 3】。水鏡のノアのタイトル。 */
  titleNoa: { source: require('../../assets/music/title-noa.wav'), volume: 0.34 },
  battleNormal: { source: require('../../assets/music/battle-normal.wav'), volume: 0.36 },
  battleBoss: { source: require('../../assets/music/battle-boss.wav'), volume: 0.27 },
  battleFinal: { source: require('../../assets/music/battle-final.wav'), volume: 0.32 },
  shop: { source: require('../../assets/music/shop.wav'), volume: 0.32 },
  'field:volcano': { source: require('../../assets/music/field-volcano.wav'), volume: 0.32 },
  'field:grassland': { source: require('../../assets/music/field-grassland.wav'), volume: 0.32 },
  'field:sunkenCity': { source: require('../../assets/music/field-sunken-city.wav'), volume: 0.34 },
  'field:clockwork': { source: require('../../assets/music/field-clockwork.wav'), volume: 0.32 },
  'elite:volcano': { source: require('../../assets/music/elite-volcano.wav'), volume: 0.3 },
  'elite:grassland': { source: require('../../assets/music/elite-grassland.wav'), volume: 0.32 },
  'elite:sunkenCity': { source: require('../../assets/music/elite-sunken-city.wav'), volume: 0.32 },
  'elite:clockwork': { source: require('../../assets/music/elite-clockwork.wav'), volume: 0.3 },
  /** 図鑑だけで聴くボス戦の候補。戦闘では流さない。 */
  bossSample01: { source: require('../../assets/music/boss-sample-01.wav'), volume: 0.28 },
  bossSample02: { source: require('../../assets/music/boss-sample-02.wav'), volume: 0.28 },
  bossSample03: { source: require('../../assets/music/boss-sample-03.wav'), volume: 0.28 },
  bossSample04: { source: require('../../assets/music/boss-sample-04.wav'), volume: 0.28 },
  bossSample05: { source: require('../../assets/music/boss-sample-05.wav'), volume: 0.28 },
  bossSample06: { source: require('../../assets/music/boss-sample-06.wav'), volume: 0.28 },
  bossSample07: { source: require('../../assets/music/boss-sample-07.wav'), volume: 0.28 },
  bossSample08: { source: require('../../assets/music/boss-sample-08.wav'), volume: 0.28 },
  bossSample09: { source: require('../../assets/music/boss-sample-09.wav'), volume: 0.28 },
  bossSample10: { source: require('../../assets/music/boss-sample-10.wav'), volume: 0.28 },
  bossSample11: { source: require('../../assets/music/boss-sample-11.wav'), volume: 0.28 },
  bossSample12: { source: require('../../assets/music/boss-sample-12.wav'), volume: 0.28 },
  bossSample13: { source: require('../../assets/music/boss-sample-13.wav'), volume: 0.28 },
  bossSample14: { source: require('../../assets/music/boss-sample-14.wav'), volume: 0.28 },
  bossSample15: { source: require('../../assets/music/boss-sample-15.wav'), volume: 0.28 },
  bossSample16: { source: require('../../assets/music/boss-sample-16.wav'), volume: 0.28 },
  bossSample17: { source: require('../../assets/music/boss-sample-17.wav'), volume: 0.28 },
  bossSample18: { source: require('../../assets/music/boss-sample-18.wav'), volume: 0.28 },
  bossSample19: { source: require('../../assets/music/boss-sample-19.wav'), volume: 0.28 },
  bossSample20: { source: require('../../assets/music/boss-sample-20.wav'), volume: 0.28 },
  bossSample21: { source: require('../../assets/music/boss-sample-21.wav'), volume: 0.28 },
  bossSample22: { source: require('../../assets/music/boss-sample-22.wav'), volume: 0.28 },
  bossSample23: { source: require('../../assets/music/boss-sample-23.wav'), volume: 0.28 },
  bossSample24: { source: require('../../assets/music/boss-sample-24.wav'), volume: 0.28 },
  bossSample25: { source: require('../../assets/music/boss-sample-25.wav'), volume: 0.28 },
  bossSample26: { source: require('../../assets/music/boss-sample-26.wav'), volume: 0.28 },
  bossSample27: { source: require('../../assets/music/boss-sample-27.wav'), volume: 0.28 },
  bossSample28: { source: require('../../assets/music/boss-sample-28.wav'), volume: 0.28 },
  bossSample29: { source: require('../../assets/music/boss-sample-29.wav'), volume: 0.28 },
  bossSample30: { source: require('../../assets/music/boss-sample-30.wav'), volume: 0.28 },
};

/** 通常戦闘・ボス戦・ラスボス戦はどの地域でも共通、エリート戦は地域ごとの曲。 */
export function battleMusicFor(rank: EnemyRank, region: Region): MusicId {
  switch (rank) {
    case 'normal':
      return 'battleNormal';
    case 'elite':
      return `elite:${region}`;
    case 'boss':
      return 'battleBoss';
    case 'final':
      return 'battleFinal';
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
  {
    id: 'title',
    title: '三つの旗 −序−',
    description: 'タイトル（紅蓮のカイル）。笛の旋律と、ゆったりした A メロの頭。起動時に 3 キャラの曲からランダム。',
  },
  {
    id: 'titleLene',
    title: '翠風 −序−',
    description:
      'タイトル（翠風のリーネ）。旧サンプル 2。ト長調・笛の旋律。中ほどで B メロの五度圏（前半）をゆったり引用。（73 BPM）',
  },
  {
    id: 'titleNoa',
    title: '水鏡 −序−',
    description:
      'タイトル（水鏡のノア）。旧サンプル 3。嬰ハ短調・ベルの旋律。中ほどでための上り坂を小さなベルが鳴らす。（77 BPM）',
  },
  { id: 'battleNormal', title: '三つの旗 −静−', description: '通常戦闘（全地域）。ハープとパッドだけの静かな曲。旋律は和音の奥にひそんでいる。' },
  { id: 'battleBoss', title: '三つの旗 −試−', description: '各章のボス戦。ラスボス曲の構成を 140 BPM で踏襲し、旋律を少し変えた弟分。B メロはギターが落ち着いて歌う。サビはラスボス戦まで取っておく。' },
  { id: 'battleFinal', title: '三つの旗 −試− 改', description: 'ラスボス戦（星喰みの魔皇ノクス）。加速するイントロ、低く歌う A メロ、五度圏を巡る B メロ、上り坂のためを経て、ハモり付きの 20 小節のサビ。締めはレに解決してイントロへ戻る。' },
  { id: 'shop', title: 'にぎわいの市場', description: 'ショップ。ハープの刻みと笛、ボンゴ。中ほどにメインテーマが顔を出す。' },
  { id: 'field:volcano', title: '紅蓮の火山', description: 'フィールド（火・岩）。地響きのタムと低い金管。' },
  { id: 'elite:volcano', title: '溶岩の咆哮', description: 'エリート戦（火山）。ギターの刻みと金管。' },
  { id: 'field:grassland', title: '風わたる草原', description: 'フィールド（草・風）。ト長調の笛とハープ。後半に導入の動機が長調で。' },
  { id: 'elite:grassland', title: '草原の剣戟', description: 'エリート戦（草原）。行進のスネアと金管、締めに導入の動機。' },
  { id: 'field:sunkenCity', title: '水の古都', description: 'フィールド（水・氷）。しずくのようなベルとハープ。後半に導入の動機。' },
  { id: 'elite:sunkenCity', title: '沈む都の守護者', description: 'エリート戦（水の古都）。三角波のリフと笛、反響するベル。' },
  { id: 'field:clockwork', title: '雷鳴の歯車塔', description: 'フィールド（電・機械）。歯車のように刻む分散和音と矩形波の電子音。' },
  { id: 'elite:clockwork', title: '機巧の雷鳴', description: 'エリート戦（歯車塔）。矩形波のリフと金管、締めはギターで導入の動機。' },
  { id: 'bossSample01', title: '【サンプル 1】黒金の門', description: '156 BPM。金管とツーバスの重い行進。' },
  { id: 'bossSample02', title: '【サンプル 2】紅蓮の蹄', description: '148 BPM。ギターが駆ける炎のボス。' },
  { id: 'bossSample03', title: '【サンプル 3】翠の刃', description: '128 BPM。笛と行進のスネア。' },
  { id: 'bossSample04', title: '【サンプル 4】深海の鐘', description: '92 BPM。ベルがゆっくり鳴る。' },
  { id: 'bossSample05', title: '【サンプル 5】歯車の王', description: '150 BPM。矩形波が歯車のように回る。' },
  { id: 'bossSample06', title: '【サンプル 6】王城', description: '78 BPM。オルガンの遅い賛歌。' },
  { id: 'bossSample07', title: '【サンプル 7】嵐の翼', description: '170 BPM。弦とツーバスの突風。' },
  { id: 'bossSample08', title: '【サンプル 8】溶岩', description: '120 BPM。タムと低い金管。' },
  { id: 'bossSample09', title: '【サンプル 9】氷の鏡', description: '104 BPM。ハープが間を空けて鳴る。' },
  { id: 'bossSample10', title: '【サンプル 10】雷鳴', description: '158 BPM。三角波の細かいリフ。' },
  { id: 'bossSample11', title: '【サンプル 11】古龍', description: '84 BPM。金管の遅い足音。' },
  { id: 'bossSample12', title: '【サンプル 12】剣戟', description: '162 BPM。ギターの打ち合い。' },
  { id: 'bossSample13', title: '【サンプル 13】祝砲', description: '118 BPM。金管のファンファーレ。' },
  { id: 'bossSample14', title: '【サンプル 14】夜の城壁', description: '108 BPM。弦が低く張ってから立ち上がる。' },
  { id: 'bossSample15', title: '【サンプル 15】潮の門', description: '134 BPM。ギターのうねり。' },
  { id: 'bossSample16', title: '【サンプル 16】傀儡', description: '146 BPM。矩形波の歯車。' },
  { id: 'bossSample17', title: '【サンプル 17】森の王', description: '116 BPM。長調の笛。' },
  { id: 'bossSample18', title: '【サンプル 18】星の縁', description: '96 BPM。ベルとパッド。' },
  { id: 'bossSample19', title: '【サンプル 19】鉄騎', description: '152 BPM。金管の突撃。' },
  { id: 'bossSample20', title: '【サンプル 20】砂の王', description: '114 BPM。シンセブラスと砂漠の太鼓。' },
  { id: 'bossSample21', title: '【サンプル 21】断崖', description: '142 BPM。ギターが落ちていく。' },
  { id: 'bossSample22', title: '【サンプル 22】聖歌', description: '80 BPM。オルガンの聖歌。' },
  { id: 'bossSample23', title: '【サンプル 23】疾風', description: '176 BPM。笛の駆け足。' },
  { id: 'bossSample24', title: '【サンプル 24】釜', description: '100 BPM。タムと低い金管の連打。' },
  { id: 'bossSample25', title: '【サンプル 25】双剣', description: '154 BPM。ギターと金管が別の歌を同時に。' },
  { id: 'bossSample26', title: '【サンプル 26】地下水脈', description: '126 BPM。ハープと沼の拍。' },
  { id: 'bossSample27', title: '【サンプル 27】王冠', description: '122 BPM。金管の戴冠。' },
  { id: 'bossSample28', title: '【サンプル 28】影踏み', description: '110 BPM。矩形波が静かに近づいてから叩く。' },
  { id: 'bossSample29', title: '【サンプル 29】終幕の手前', description: '138 BPM。弦と金管が開いていく。' },
  { id: 'bossSample30', title: '【サンプル 30】開門', description: '166 BPM。金管が門を開ける。' },
];
