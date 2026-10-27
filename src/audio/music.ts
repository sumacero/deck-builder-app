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
  | 'sampleEliteGrassland01'
  | 'sampleEliteGrassland02'
  | 'sampleEliteGrassland03'
  | 'sampleEliteGrassland04'
  | 'sampleEliteGrassland05'
  | 'sampleEliteGrassland06'
  | 'sampleEliteGrassland07'
  | 'sampleEliteGrassland08'
  | 'sampleEliteGrassland09'
  | 'sampleEliteGrassland10'
  | 'sampleEliteVolcano01'
  | 'sampleEliteVolcano02'
  | 'sampleEliteVolcano03'
  | 'sampleEliteVolcano04'
  | 'sampleEliteVolcano05'
  | 'sampleEliteVolcano06'
  | 'sampleEliteVolcano07'
  | 'sampleEliteVolcano08'
  | 'sampleEliteVolcano09'
  | 'sampleEliteVolcano10'
  | 'sampleEliteSunken01'
  | 'sampleEliteSunken02'
  | 'sampleEliteSunken03'
  | 'sampleEliteSunken04'
  | 'sampleEliteSunken05'
  | 'sampleEliteSunken06'
  | 'sampleEliteSunken07'
  | 'sampleEliteSunken08'
  | 'sampleEliteSunken09'
  | 'sampleEliteSunken10'
  | 'sampleEliteClockwork01'
  | 'sampleEliteClockwork02'
  | 'sampleEliteClockwork03'
  | 'sampleEliteClockwork04'
  | 'sampleEliteClockwork05'
  | 'sampleEliteClockwork06'
  | 'sampleEliteClockwork07'
  | 'sampleEliteClockwork08'
  | 'sampleEliteClockwork09'
  | 'sampleEliteClockwork10'
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
  /** 図鑑だけで聴くエリート戦の候補。戦闘では流さない。 */
  sampleEliteGrassland01: { source: require('../../assets/music/sample-elite-grassland-01.wav'), volume: 0.28 },
  sampleEliteGrassland02: { source: require('../../assets/music/sample-elite-grassland-02.wav'), volume: 0.28 },
  sampleEliteGrassland03: { source: require('../../assets/music/sample-elite-grassland-03.wav'), volume: 0.28 },
  sampleEliteGrassland04: { source: require('../../assets/music/sample-elite-grassland-04.wav'), volume: 0.28 },
  sampleEliteGrassland05: { source: require('../../assets/music/sample-elite-grassland-05.wav'), volume: 0.28 },
  sampleEliteGrassland06: { source: require('../../assets/music/sample-elite-grassland-06.wav'), volume: 0.28 },
  sampleEliteGrassland07: { source: require('../../assets/music/sample-elite-grassland-07.wav'), volume: 0.28 },
  sampleEliteGrassland08: { source: require('../../assets/music/sample-elite-grassland-08.wav'), volume: 0.28 },
  sampleEliteGrassland09: { source: require('../../assets/music/sample-elite-grassland-09.wav'), volume: 0.28 },
  sampleEliteGrassland10: { source: require('../../assets/music/sample-elite-grassland-10.wav'), volume: 0.28 },
  sampleEliteVolcano01: { source: require('../../assets/music/sample-elite-volcano-01.wav'), volume: 0.28 },
  sampleEliteVolcano02: { source: require('../../assets/music/sample-elite-volcano-02.wav'), volume: 0.28 },
  sampleEliteVolcano03: { source: require('../../assets/music/sample-elite-volcano-03.wav'), volume: 0.28 },
  sampleEliteVolcano04: { source: require('../../assets/music/sample-elite-volcano-04.wav'), volume: 0.28 },
  sampleEliteVolcano05: { source: require('../../assets/music/sample-elite-volcano-05.wav'), volume: 0.28 },
  sampleEliteVolcano06: { source: require('../../assets/music/sample-elite-volcano-06.wav'), volume: 0.28 },
  sampleEliteVolcano07: { source: require('../../assets/music/sample-elite-volcano-07.wav'), volume: 0.28 },
  sampleEliteVolcano08: { source: require('../../assets/music/sample-elite-volcano-08.wav'), volume: 0.28 },
  sampleEliteVolcano09: { source: require('../../assets/music/sample-elite-volcano-09.wav'), volume: 0.28 },
  sampleEliteVolcano10: { source: require('../../assets/music/sample-elite-volcano-10.wav'), volume: 0.28 },
  sampleEliteSunken01: { source: require('../../assets/music/sample-elite-sunken-01.wav'), volume: 0.28 },
  sampleEliteSunken02: { source: require('../../assets/music/sample-elite-sunken-02.wav'), volume: 0.28 },
  sampleEliteSunken03: { source: require('../../assets/music/sample-elite-sunken-03.wav'), volume: 0.28 },
  sampleEliteSunken04: { source: require('../../assets/music/sample-elite-sunken-04.wav'), volume: 0.28 },
  sampleEliteSunken05: { source: require('../../assets/music/sample-elite-sunken-05.wav'), volume: 0.28 },
  sampleEliteSunken06: { source: require('../../assets/music/sample-elite-sunken-06.wav'), volume: 0.28 },
  sampleEliteSunken07: { source: require('../../assets/music/sample-elite-sunken-07.wav'), volume: 0.28 },
  sampleEliteSunken08: { source: require('../../assets/music/sample-elite-sunken-08.wav'), volume: 0.28 },
  sampleEliteSunken09: { source: require('../../assets/music/sample-elite-sunken-09.wav'), volume: 0.28 },
  sampleEliteSunken10: { source: require('../../assets/music/sample-elite-sunken-10.wav'), volume: 0.28 },
  sampleEliteClockwork01: { source: require('../../assets/music/sample-elite-clockwork-01.wav'), volume: 0.28 },
  sampleEliteClockwork02: { source: require('../../assets/music/sample-elite-clockwork-02.wav'), volume: 0.28 },
  sampleEliteClockwork03: { source: require('../../assets/music/sample-elite-clockwork-03.wav'), volume: 0.28 },
  sampleEliteClockwork04: { source: require('../../assets/music/sample-elite-clockwork-04.wav'), volume: 0.28 },
  sampleEliteClockwork05: { source: require('../../assets/music/sample-elite-clockwork-05.wav'), volume: 0.28 },
  sampleEliteClockwork06: { source: require('../../assets/music/sample-elite-clockwork-06.wav'), volume: 0.28 },
  sampleEliteClockwork07: { source: require('../../assets/music/sample-elite-clockwork-07.wav'), volume: 0.28 },
  sampleEliteClockwork08: { source: require('../../assets/music/sample-elite-clockwork-08.wav'), volume: 0.28 },
  sampleEliteClockwork09: { source: require('../../assets/music/sample-elite-clockwork-09.wav'), volume: 0.28 },
  sampleEliteClockwork10: { source: require('../../assets/music/sample-elite-clockwork-10.wav'), volume: 0.28 },
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
  { id: 'sampleEliteGrassland01', title: '【草原 1】翠の刃', description: '120 BPM。気に入った旧サンプル 3。笛と行進で、今の草原エリートを少し静かにした。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland02', title: '【草原 2】風の戻り', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland03', title: '【草原 3】木漏れ日', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland04', title: '【草原 4】遠い丘', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland05', title: '【草原 5】剣を収める', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland06', title: '【草原 6】草原の朝', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland07', title: '【草原 7】風待ち', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland08', title: '【草原 8】緑の弓', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland09', title: '【草原 9】野の列', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteGrassland10', title: '【草原 10】凪', description: '120 BPM。今の草原エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano01', title: '【火山 1】冷めた溶岩', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano02', title: '【火山 2】遠い火口', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano03', title: '【火山 3】灰の列', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano04', title: '【火山 4】岩の寝息', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano05', title: '【火山 5】残り火', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano06', title: '【火山 6】黒い砂', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano07', title: '【火山 7】溶岩の縁', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano08', title: '【火山 8】ゆっくりした炎', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano09', title: '【火山 9】地の底', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteVolcano10', title: '【火山 10】鎮火', description: '108 BPM。今の火山エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken01', title: '【水の古都 1】沈んだ鐘', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken02', title: '【水の古都 2】水面', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken03', title: '【水の古都 3】鏡の底', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken04', title: '【水の古都 4】しずく', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken05', title: '【水の古都 5】暗い水路', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken06', title: '【水の古都 6】氷の回廊', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken07', title: '【水の古都 7】都の残り', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken08', title: '【水の古都 8】長い反響', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken09', title: '【水の古都 9】水脈', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteSunken10', title: '【水の古都 10】静かな守護', description: '100 BPM。今の水の古都エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork01', title: '【歯車塔 1】緩い歯車', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork02', title: '【歯車塔 2】塔の上', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork03', title: '【歯車塔 3】止まった針', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork04', title: '【歯車塔 4】低い電流', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork05', title: '【歯車塔 5】歯車の影', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork06', title: '【歯車塔 6】遅い拍', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork07', title: '【歯車塔 7】塔の風', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork08', title: '【歯車塔 8】薄い雷', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork09', title: '【歯車塔 9】夜の機械', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
  { id: 'sampleEliteClockwork10', title: '【歯車塔 10】眠る塔', description: '108 BPM。今の歯車塔エリートを少し静かにした歌。後半でボスとラスボスのイントロがかすかに乗る。' },
];
