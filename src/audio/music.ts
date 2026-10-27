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
  | 'sampleEliteVolcano01'
  | 'sampleEliteVolcano02'
  | 'sampleEliteVolcano03'
  | 'sampleEliteSunken01'
  | 'sampleEliteSunken02'
  | 'sampleEliteSunken03'
  | 'sampleEliteClockwork01'
  | 'sampleEliteClockwork02'
  | 'sampleEliteClockwork03'
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
  sampleEliteVolcano01: { source: require('../../assets/music/sample-elite-volcano-01.wav'), volume: 0.28 },
  sampleEliteVolcano02: { source: require('../../assets/music/sample-elite-volcano-02.wav'), volume: 0.28 },
  sampleEliteVolcano03: { source: require('../../assets/music/sample-elite-volcano-03.wav'), volume: 0.28 },
  sampleEliteSunken01: { source: require('../../assets/music/sample-elite-sunken-01.wav'), volume: 0.28 },
  sampleEliteSunken02: { source: require('../../assets/music/sample-elite-sunken-02.wav'), volume: 0.28 },
  sampleEliteSunken03: { source: require('../../assets/music/sample-elite-sunken-03.wav'), volume: 0.28 },
  sampleEliteClockwork01: { source: require('../../assets/music/sample-elite-clockwork-01.wav'), volume: 0.28 },
  sampleEliteClockwork02: { source: require('../../assets/music/sample-elite-clockwork-02.wav'), volume: 0.28 },
  sampleEliteClockwork03: { source: require('../../assets/music/sample-elite-clockwork-03.wav'), volume: 0.28 },
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
  { id: 'sampleEliteGrassland01', title: '【草原 1】同じ声', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。最後の共通部分は地域の旋律と同じ楽器・同じ伴奏のまま、ラスボスの A メロへ続く。入りのシンバルは鳴らさない。' },
  { id: 'sampleEliteGrassland02', title: '【草原 2】低くから', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。最後の共通部分は同じ伴奏のまま、ラスボスの A メロの前半を 1 オクターブ下で歌い、後半で元の高さに戻る。' },
  { id: 'sampleEliteGrassland03', title: '【草原 3】橋', description: '116 BPM。出だしと地域の旋律は今の草原エリートのまま。最後の共通部分は地域の旋律の最後の和音を 2 小節伸ばしてから、同じ声でラスボスの A メロに入る。' },
  { id: 'sampleEliteVolcano01', title: '【火山 1】同じ声', description: '132 BPM。出だしと地域の旋律は今の火山エリートのまま。最後の共通部分は地域の旋律と同じ楽器・同じ伴奏のまま、ラスボスの A メロへ続く。入りのシンバルは鳴らさない。' },
  { id: 'sampleEliteVolcano02', title: '【火山 2】低くから', description: '132 BPM。出だしと地域の旋律は今の火山エリートのまま。最後の共通部分は同じ伴奏のまま、ラスボスの A メロの前半を 1 オクターブ下で歌い、後半で元の高さに戻る。' },
  { id: 'sampleEliteVolcano03', title: '【火山 3】橋', description: '132 BPM。出だしと地域の旋律は今の火山エリートのまま。最後の共通部分は地域の旋律の最後の和音を 2 小節伸ばしてから、同じ声でラスボスの A メロに入る。' },
  { id: 'sampleEliteSunken01', title: '【水の古都 1】同じ声', description: '114 BPM。出だしと地域の旋律は今の水の古都エリートのまま。最後の共通部分は地域の旋律と同じ楽器・同じ伴奏のまま、ラスボスの A メロへ続く。入りのシンバルは鳴らさない。' },
  { id: 'sampleEliteSunken02', title: '【水の古都 2】低くから', description: '114 BPM。出だしと地域の旋律は今の水の古都エリートのまま。最後の共通部分は同じ伴奏のまま、ラスボスの A メロの前半を 1 オクターブ下で歌い、後半で元の高さに戻る。' },
  { id: 'sampleEliteSunken03', title: '【水の古都 3】橋', description: '114 BPM。出だしと地域の旋律は今の水の古都エリートのまま。最後の共通部分は地域の旋律の最後の和音を 2 小節伸ばしてから、同じ声でラスボスの A メロに入る。' },
  { id: 'sampleEliteClockwork01', title: '【歯車塔 1】同じ声', description: '122 BPM。出だしと地域の旋律は今の歯車塔エリートのまま。最後の共通部分は地域の旋律と同じ楽器・同じ伴奏のまま、ラスボスの A メロへ続く。入りのシンバルは鳴らさない。' },
  { id: 'sampleEliteClockwork02', title: '【歯車塔 2】低くから', description: '122 BPM。出だしと地域の旋律は今の歯車塔エリートのまま。最後の共通部分は同じ伴奏のまま、ラスボスの A メロの前半を 1 オクターブ下で歌い、後半で元の高さに戻る。' },
  { id: 'sampleEliteClockwork03', title: '【歯車塔 3】橋', description: '122 BPM。出だしと地域の旋律は今の歯車塔エリートのまま。最後の共通部分は地域の旋律の最後の和音を 2 小節伸ばしてから、同じ声でラスボスの A メロに入る。' },
];
