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

/** 音源は scripts/generate-bgm.mjs で合成している（npm run bgm）。全曲がメインテーマ「三つの旗」の素材を共有する。 */
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
  {
    id: 'bossSample01',
    title: '【サンプル 1】鉄門のサビ',
    description: '鉄門の行進（150 BPM、金管・ツーバス）に、抑えたサビ。付点は低いレから開き、頂上はレ。戦闘では流さない。',
  },
  {
    id: 'bossSample02',
    title: '【サンプル 2】上る付点',
    description: '同じ編成。サビの付点を下行ではなく上行にした旋律。戦闘では流さない。',
  },
  {
    id: 'bossSample03',
    title: '【サンプル 3】三度のサビ',
    description: '同じ編成。鉄門の五度を三度に縮め、サビの付点も三度で積んだ旋律。戦闘では流さない。',
  },
  {
    id: 'bossSample04',
    title: '【サンプル 4】長いサビ',
    description: '同じ編成。行進もサビも長い音。付点はサビの頭だけ。戦闘では流さない。',
  },
  {
    id: 'bossSample05',
    title: '【サンプル 5】休符のサビ',
    description: '同じ編成。鉄門の音を休符で割り、サビの付点のあとも休む旋律。戦闘では流さない。',
  },
  {
    id: 'bossSample06',
    title: '【サンプル 6】同じ頭',
    description: '同じ編成。行進は毎小節レ・ファ・ラ。サビは毎小節レー・ドー・シ♭。戦闘では流さない。',
  },
  {
    id: 'bossSample07',
    title: '【サンプル 7】五度から',
    description: '同じ編成。着地の前に五度下から跳ね、サビはそこから付点で落ちる。戦闘では流さない。',
  },
  {
    id: 'bossSample08',
    title: '【サンプル 8】順次のサビ',
    description: '同じ編成。跳躍をやめて順次。サビの付点も音階のまま。戦闘では流さない。',
  },
  {
    id: 'bossSample09',
    title: '【サンプル 9】逆行のサビ',
    description: '同じ編成。鉄門の音を逆から歌い、サビの後半は前半を折り返す。戦闘では流さない。',
  },
  {
    id: 'bossSample10',
    title: '【サンプル 10】共通音のサビ',
    description: '同じ編成。レ・ファ・ラ・シ♭・ド♯だけを使った付点のサビ。戦闘では流さない。',
  },
];
