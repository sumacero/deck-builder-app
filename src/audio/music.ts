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
  | IntroSampleId
  | 'shop'
  | `field:${Region}`
  | `elite:${Region}`;

/** ラスボス戦のサビ前だけを聴く候補。戦闘には入っていない。 */
export type IntroSampleId =
  | 'sampleIntro01'
  | 'sampleIntro02'
  | 'sampleIntro03'
  | 'sampleIntro04'
  | 'sampleIntro05'
  | 'sampleIntro06'
  | 'sampleIntro07'
  | 'sampleIntro08'
  | 'sampleIntro09'
  | 'sampleIntro10'
  | 'sampleIntro11'
  | 'sampleIntro12'
  | 'sampleIntro13'
  | 'sampleIntro14'
  | 'sampleIntro15'
  | 'sampleIntro16'
  | 'sampleIntro17'
  | 'sampleIntro18'
  | 'sampleIntro19'
  | 'sampleIntro20'
  | 'sampleIntro21'
  | 'sampleIntro22'
  | 'sampleIntro23'
  | 'sampleIntro24'
  | 'sampleIntro25'
  | 'sampleIntro26'
  | 'sampleIntro27'
  | 'sampleIntro28'
  | 'sampleIntro29'
  | 'sampleIntro30';

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
  sampleIntro01: { source: require('../../assets/music/sample-final-intro-01.wav'), volume: 0.32 },
  sampleIntro02: { source: require('../../assets/music/sample-final-intro-02.wav'), volume: 0.32 },
  sampleIntro03: { source: require('../../assets/music/sample-final-intro-03.wav'), volume: 0.32 },
  sampleIntro04: { source: require('../../assets/music/sample-final-intro-04.wav'), volume: 0.32 },
  sampleIntro05: { source: require('../../assets/music/sample-final-intro-05.wav'), volume: 0.32 },
  sampleIntro06: { source: require('../../assets/music/sample-final-intro-06.wav'), volume: 0.32 },
  sampleIntro07: { source: require('../../assets/music/sample-final-intro-07.wav'), volume: 0.32 },
  sampleIntro08: { source: require('../../assets/music/sample-final-intro-08.wav'), volume: 0.32 },
  sampleIntro09: { source: require('../../assets/music/sample-final-intro-09.wav'), volume: 0.32 },
  sampleIntro10: { source: require('../../assets/music/sample-final-intro-10.wav'), volume: 0.32 },
  sampleIntro11: { source: require('../../assets/music/sample-final-intro-11.wav'), volume: 0.32 },
  sampleIntro12: { source: require('../../assets/music/sample-final-intro-12.wav'), volume: 0.32 },
  sampleIntro13: { source: require('../../assets/music/sample-final-intro-13.wav'), volume: 0.32 },
  sampleIntro14: { source: require('../../assets/music/sample-final-intro-14.wav'), volume: 0.32 },
  sampleIntro15: { source: require('../../assets/music/sample-final-intro-15.wav'), volume: 0.32 },
  sampleIntro16: { source: require('../../assets/music/sample-final-intro-16.wav'), volume: 0.32 },
  sampleIntro17: { source: require('../../assets/music/sample-final-intro-17.wav'), volume: 0.32 },
  sampleIntro18: { source: require('../../assets/music/sample-final-intro-18.wav'), volume: 0.32 },
  sampleIntro19: { source: require('../../assets/music/sample-final-intro-19.wav'), volume: 0.32 },
  sampleIntro20: { source: require('../../assets/music/sample-final-intro-20.wav'), volume: 0.32 },
  sampleIntro21: { source: require('../../assets/music/sample-final-intro-21.wav'), volume: 0.32 },
  sampleIntro22: { source: require('../../assets/music/sample-final-intro-22.wav'), volume: 0.32 },
  sampleIntro23: { source: require('../../assets/music/sample-final-intro-23.wav'), volume: 0.32 },
  sampleIntro24: { source: require('../../assets/music/sample-final-intro-24.wav'), volume: 0.32 },
  sampleIntro25: { source: require('../../assets/music/sample-final-intro-25.wav'), volume: 0.32 },
  sampleIntro26: { source: require('../../assets/music/sample-final-intro-26.wav'), volume: 0.32 },
  sampleIntro27: { source: require('../../assets/music/sample-final-intro-27.wav'), volume: 0.32 },
  sampleIntro28: { source: require('../../assets/music/sample-final-intro-28.wav'), volume: 0.32 },
  sampleIntro29: { source: require('../../assets/music/sample-final-intro-29.wav'), volume: 0.32 },
  sampleIntro30: { source: require('../../assets/music/sample-final-intro-30.wav'), volume: 0.32 },
  shop: { source: require('../../assets/music/shop.wav'), volume: 0.32 },
  'field:volcano': { source: require('../../assets/music/field-volcano.wav'), volume: 0.32 },
  'field:grassland': { source: require('../../assets/music/field-grassland.wav'), volume: 0.32 },
  'field:sunkenCity': { source: require('../../assets/music/field-sunken-city.wav'), volume: 0.34 },
  'field:clockwork': { source: require('../../assets/music/field-clockwork.wav'), volume: 0.32 },
  'elite:volcano': { source: require('../../assets/music/elite-volcano.wav'), volume: 0.3 },
  'elite:grassland': { source: require('../../assets/music/elite-grassland.wav'), volume: 0.32 },
  'elite:sunkenCity': { source: require('../../assets/music/elite-sunken-city.wav'), volume: 0.32 },
  'elite:clockwork': { source: require('../../assets/music/elite-clockwork.wav'), volume: 0.3 },
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
  { id: 'battleFinal', title: '三つの旗 −試− 改', description: 'ラスボス戦（星喰みの魔皇ノクス）。加速するイントロ、低く歌う A メロ、五度圏を巡る B メロ、上り坂のためを経て、ハモり付きの 20 小節のサビ。サビの 2 小節前に、章ボスのイントロの締めを金管で重ねる。締めはレに解決してイントロへ戻る。' },
  { id: 'sampleIntro01', title: 'サビ前 01 鐘で締める', description: '坂はそのまま。最後の 2 小節に、導入の締めを鐘で乗せる。' },
  { id: 'sampleIntro02', title: 'サビ前 02 笛が上で歌う', description: '金管の伸ばしをどかし、1 オクターブ上の笛が締めを歌う。' },
  { id: 'sampleIntro03', title: 'サビ前 03 ハープが散らす', description: '締めの音を、ハープの 8 分音符に組み替えて坂の上に散らす。' },
  { id: 'sampleIntro04', title: 'サビ前 04 ギターがレ・レ', description: '刻みをやめ、ギターが「レ・レ」と「ラ・ラ」を歌う。' },
  { id: 'sampleIntro05', title: 'サビ前 05 サビを先に小さく', description: '最後の小節だけ、オルガンがサビの頭を 1 オクターブ上で先に弾く。' },
  { id: 'sampleIntro06', title: 'サビ前 06 弦がゆっくり', description: '「ラ・ラ」を 2 倍の長さにして、弦が刻みの上でゆっくり歌う。' },
  { id: 'sampleIntro07', title: 'サビ前 07 持続をどける', description: '伸ばしの金管を消し、締めの金管だけを主旋律にする。' },
  { id: 'sampleIntro08', title: 'サビ前 08 持続を下へ', description: '伸ばしを 1 オクターブ下げ、締めは元の高さの金管で歌う。' },
  { id: 'sampleIntro09', title: 'サビ前 09 休符を聴かせる', description: '16 分の刻みを全音符にして、締めの休符が聞こえるようにする。' },
  { id: 'sampleIntro10', title: 'サビ前 10 最後は上昇だけ', description: '最後の 1 小節はティンパニと、上がっていく金管だけ。' },
  { id: 'sampleIntro11', title: 'サビ前 11 ハーフタイム', description: '最後の 2 小節はハーフタイム。ロールをやめ、笛が締める。' },
  { id: 'sampleIntro12', title: 'サビ前 12 シンセブラス', description: 'ロールと金管のヒットを外し、シンセブラスが締めを吹く。' },
  { id: 'sampleIntro13', title: 'サビ前 13 ラを休ませる', description: '締めの最後のラを休符にして、サビのレがその穴に入る。' },
  { id: 'sampleIntro14', title: 'サビ前 14 笛が予告する', description: '最後の小節で、笛がサビの頭を一度。サビがすぐ同じフレーズを繰り返す。' },
  { id: 'sampleIntro15', title: 'サビ前 15 レでつながる', description: '坂の最後をレの伸ばしで終え、サビのレに同じ音で入る。' },
  { id: 'sampleIntro16', title: 'サビ前 16 イの和音', description: '最後の小節をイの和音だけにする。金管と鐘がラへ分散する。' },
  { id: 'sampleIntro17', title: 'サビ前 17 レ・レ、ラ・ラ', description: '最後の 2 小節は「レ・レ」と「ラ・ラ」。金管と鐘のユニゾン。' },
  { id: 'sampleIntro18', title: 'サビ前 18 導入が扉', description: '上り坂の代わりに、主題の導入 4 小節。最後のド♯からサビのレへ。' },
  { id: 'sampleIntro19', title: 'サビ前 19 一人のレ・レ', description: '坂のあと 1 小節、全員が止まって「レ・レ」だけを吹く。' },
  { id: 'sampleIntro20', title: 'サビ前 20 呼びと応え', description: '鐘が「レ・レ」。次の小節で、上の笛が上がって応える。低いレを保つ。' },
  { id: 'sampleIntro21', title: 'サビ前 21 拡大した締め', description: '締めを 4 小節に引き伸ばす。ギターの加速はそのまま。' },
  { id: 'sampleIntro22', title: 'サビ前 22 カノン', description: 'ギターが先に締めを歌い、1 拍遅れて金管が同じ旋律を追う。' },
  { id: 'sampleIntro23', title: 'サビ前 23 小節の終わりの鐘', description: '各小節の最後の拍だけ鐘が上がり、最後はレでサビを指す。' },
  { id: 'sampleIntro24', title: 'サビ前 24 笛が降りる', description: '金管はレから上がる。笛はラからレへ、逆に降りていく。' },
  { id: 'sampleIntro25', title: 'サビ前 25 長調の笛', description: '短調の坂の上を、笛だけ同主長調（ファ♯・シ）で横切る。' },
  { id: 'sampleIntro26', title: 'サビ前 26 三度のファンファーレ', description: '金管が締めを、三度下の金管と一緒に吹く。刻みは全音符。' },
  { id: 'sampleIntro27', title: 'サビ前 27 四つの声', description: '金管・鐘・笛・弦が、同じ締めを同時に歌う。刻みは残す。' },
  { id: 'sampleIntro28', title: 'サビ前 28 シ♭からイ', description: '最後の 2 小節をシ♭の呼び声からイの分散にして、属和音で開く。' },
  { id: 'sampleIntro29', title: 'サビ前 29 一度空ける', description: '坂を 2 小節で止め、導入だけが残る。休符のあと、サビが戻る。' },
  { id: 'sampleIntro30', title: 'サビ前 30 サビにまたがる', description: '鐘の「ラ・ラ」がサビの 1 小節目まで伸び、ファとレを長く乗せる。' },
  { id: 'shop', title: 'にぎわいの市場', description: 'ショップ。ハープの刻みと笛、ボンゴ。中ほどにメインテーマが顔を出す。' },
  { id: 'field:volcano', title: '紅蓮の火山', description: 'フィールド（火・岩）。地響きのタムと低い金管。' },
  { id: 'elite:volcano', title: '溶岩の咆哮', description: 'エリート戦（火山）。ギターの刻みと金管。' },
  { id: 'field:grassland', title: '風わたる草原', description: 'フィールド（草・風）。ト長調の笛とハープ。後半に導入の動機が長調で。' },
  { id: 'elite:grassland', title: '草原の剣戟', description: 'エリート戦（草原）。行進のスネアと金管、締めに導入の動機。' },
  { id: 'field:sunkenCity', title: '水の古都', description: 'フィールド（水・氷）。しずくのようなベルとハープ。後半に導入の動機。' },
  { id: 'elite:sunkenCity', title: '沈む都の守護者', description: 'エリート戦（水の古都）。三角波のリフと笛、反響するベル。' },
  { id: 'field:clockwork', title: '雷鳴の歯車塔', description: 'フィールド（電・機械）。歯車のように刻む分散和音と矩形波の電子音。' },
  { id: 'elite:clockwork', title: '機巧の雷鳴', description: 'エリート戦（歯車塔）。矩形波のリフと金管、締めはギターで導入の動機。' },
];
