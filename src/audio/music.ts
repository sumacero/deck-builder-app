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
  | 'sampleFinal01'
  | 'sampleFinal02'
  | 'sampleFinal03'
  | 'sampleFinal04'
  | 'sampleFinal05'
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
  /** 図鑑だけで聴くラスボス戦の候補。戦闘では流さない。 */
  sampleFinal01: { source: require('../../assets/music/sample-final-01.wav'), volume: 0.32 },
  sampleFinal02: { source: require('../../assets/music/sample-final-02.wav'), volume: 0.32 },
  sampleFinal03: { source: require('../../assets/music/sample-final-03.wav'), volume: 0.32 },
  sampleFinal04: { source: require('../../assets/music/sample-final-04.wav'), volume: 0.32 },
  sampleFinal05: { source: require('../../assets/music/sample-final-05.wav'), volume: 0.32 },
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
  { id: 'sampleEliteGrassland01', title: '【草原 1】予告', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。地域の旋律をもう一度。そのあいだ A メロを小さく下に重ね、次の 4 小節で笛が同じ拍を歌う。' },
  { id: 'sampleEliteGrassland02', title: '【草原 2】追いつき', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。前半は地域の旋律、後半 2 小節だけ同じ拍。下では最初から A メロが小さく流れている。' },
  { id: 'sampleEliteGrassland03', title: '【草原 3】二周目の後半', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。地域の旋律をもう一周。二周目は後半 2 小節だけ同じ拍。' },
  { id: 'sampleEliteGrassland04', title: '【草原 4】影がついてくる', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。もう一周のあいだ A メロを小さく重ね続ける。笛が同じ拍になるのは最後の 2 小節だけ。' },
  { id: 'sampleEliteGrassland05', title: '【草原 5】受け渡し', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。前半は笛が地域の旋律で、下が A メロ。後半 2 小節で入れ替わる。' },
  { id: 'sampleFinal01', title: '【ラスボス 1】鐘で頭', description: '156 BPM。今のラスボス戦のまま。サビ直前の 1 小節だけ、章ボスのイントロの頭を小さい鐘で鳴らす。' },
  { id: 'sampleFinal02', title: '【ラスボス 2】低い弦', description: '156 BPM。今のラスボス戦のまま。サビ前の 2 小節に、章ボスのイントロの前半を 1 オクターブ下の弦で重ねる。' },
  { id: 'sampleFinal03', title: '【ラスボス 3】上り坂の下', description: '156 BPM。今のラスボス戦のまま。サビへ上がる 4 小節のあいだ、章ボスのイントロを小さい鐘で通す。' },
  { id: 'sampleFinal04', title: '【ラスボス 4】ためのうち', description: '156 BPM。今のラスボス戦のまま。サビ前の静かな 4 小節に、章ボスのイントロを笛で置く。' },
  { id: 'sampleFinal05', title: '【ラスボス 5】章の締め', description: '156 BPM。今のラスボス戦のまま。サビ直前の 1 小節だけ、章ボスのイントロの最後（シ♭からド♯へ）を低いギターで鳴らす。' },
];
