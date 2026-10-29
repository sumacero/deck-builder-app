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

/** ラスボス戦のため（Cメロ）を 2 倍にして、サビ前に導入を忍ばせた候補。戦闘には入っていない。 */
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
  | 'sampleIntro20';

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
  { id: 'sampleIntro01', title: 'サビ前 01 8小節前・鐘', description: 'Cメロの頭から。約 12 秒（サビの 8 小節前）で、導入を 2 倍の長さにした鐘が小さく入る。約 25 秒でサビ。' },
  { id: 'sampleIntro02', title: 'サビ前 02 8小節前・高い笛', description: '同じ引き伸ばした導入を、1 オクターブ上の笛で。約 12 秒から、約 25 秒でサビ。' },
  { id: 'sampleIntro03', title: 'サビ前 03 8小節前・ハープ', description: 'ハープが引き伸ばした導入を弾く。休符もそのまま。約 12 秒から。' },
  { id: 'sampleIntro04', title: 'サビ前 04 8小節前・暗い弦', description: '弦が導入をゆっくり歌い、1 オクターブ下も重ねる。坂の明るさの下に沈む。' },
  { id: 'sampleIntro05', title: 'サビ前 05 8小節前・休符', description: '鐘の「レ・レ」のあと休み、「ラ・ラ」のあと休み、最後はド♯。約 12 秒から。' },
  { id: 'sampleIntro06', title: 'サビ前 06 8小節前・二度', description: '元の速さの導入を二度。一度目は笛、二度目は鐘。二度目のド♯がサビのレにつながる。' },
  { id: 'sampleIntro07', title: 'サビ前 07 8小節前・低い金管', description: '上り坂の金管より 1 オクターブ下の金管が、引き伸ばした導入を吹く。約 12 秒から。' },
  { id: 'sampleIntro08', title: 'サビ前 08 8小節前・長調の笛', description: '笛だけ同主長調（ファ♯・シ）で、1 オクターブ上。短調の坂の上を横切る。約 12 秒から。' },
  { id: 'sampleIntro09', title: 'サビ前 09 8小節前・近づく鐘', description: '鐘は小さく始まり、サビが近いほど大きくなる。約 12 秒から。' },
  { id: 'sampleIntro10', title: 'サビ前 10 8小節前・追う鐘', description: 'ハープが先に導入を弾き、2 拍遅れて鐘が同じ旋律を追う。約 12 秒から。' },
  { id: 'sampleIntro11', title: 'サビ前 11 4小節前・鐘', description: '先の 12 小節はためだけ。約 18 秒（サビの 4 小節前）から、鐘が導入を元の速さで。約 25 秒でサビ。' },
  { id: 'sampleIntro12', title: 'サビ前 12 4小節前・高い笛', description: '約 18 秒から、1 オクターブ上の笛が導入を歌う。約 25 秒でサビ。' },
  { id: 'sampleIntro13', title: 'サビ前 13 4小節前・流れるハープ', description: '約 18 秒から。ハープは休符を隣の音で埋め、8 分音符で導入を流す。' },
  { id: 'sampleIntro14', title: 'サビ前 14 4小節前・低い金管', description: '約 18 秒から、1 オクターブ下の金管が導入を吹く。16 分の刻みの下に置く。' },
  { id: 'sampleIntro15', title: 'サビ前 15 4小節前・呼びと休み', description: '約 18 秒から鐘が「レ・レ」、休み、「ラ・ラ」、休み。空いたところへサビのレが入る。' },
  { id: 'sampleIntro16', title: 'サビ前 16 4小節前・レ・レから', description: '笛が「レ・レ」を二度（二度目は高く）。鐘がド♯まで上がって、サビのレを指す。約 18 秒から。' },
  { id: 'sampleIntro17', title: 'サビ前 17 4小節前・オルガン', description: '約 18 秒から、1 オクターブ上のオルガンが薄く導入を弾く。' },
  { id: 'sampleIntro18', title: 'サビ前 18 4小節前・矩形波', description: '約 18 秒から、1 オクターブ下の矩形波が導入の影を弾く。' },
  { id: 'sampleIntro19', title: 'サビ前 19 4小節前・遅れるハープ', description: '約 18 秒から笛が導入を吹き、1 拍遅れてハープが追う。' },
  { id: 'sampleIntro20', title: 'サビ前 20 4小節前・最後だけ', description: '約 18 秒から鐘はささやき。最後の小節のド♯だけはっきりして、サビのレを指す。' },
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
