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
  | 'sampleFinal01'
  | 'sampleFinal02'
  | 'sampleFinal03'
  | 'sampleFinal04'
  | 'sampleFinal05'
  | 'sampleFinal06'
  | 'sampleFinal07'
  | 'sampleFinal08'
  | 'sampleFinal09'
  | 'sampleFinal10'
  | 'sampleFinal11'
  | 'sampleFinal12'
  | 'sampleFinal13'
  | 'sampleFinal14'
  | 'sampleFinal15'
  | 'sampleFinal16'
  | 'sampleFinal17'
  | 'sampleFinal18'
  | 'sampleFinal19'
  | 'sampleFinal20'
  | 'sampleFinal21'
  | 'sampleFinal22'
  | 'sampleFinal23'
  | 'sampleFinal24'
  | 'sampleFinal25'
  | 'sampleFinal26'
  | 'sampleFinal27'
  | 'sampleFinal28'
  | 'sampleFinal29'
  | 'sampleFinal30'
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
  /** 図鑑だけで聴くラスボス戦の候補。戦闘では流さない。 */
  sampleFinal01: { source: require('../../assets/music/sample-final-01.wav'), volume: 0.32 },
  sampleFinal02: { source: require('../../assets/music/sample-final-02.wav'), volume: 0.32 },
  sampleFinal03: { source: require('../../assets/music/sample-final-03.wav'), volume: 0.32 },
  sampleFinal04: { source: require('../../assets/music/sample-final-04.wav'), volume: 0.32 },
  sampleFinal05: { source: require('../../assets/music/sample-final-05.wav'), volume: 0.32 },
  sampleFinal06: { source: require('../../assets/music/sample-final-06.wav'), volume: 0.32 },
  sampleFinal07: { source: require('../../assets/music/sample-final-07.wav'), volume: 0.32 },
  sampleFinal08: { source: require('../../assets/music/sample-final-08.wav'), volume: 0.32 },
  sampleFinal09: { source: require('../../assets/music/sample-final-09.wav'), volume: 0.32 },
  sampleFinal10: { source: require('../../assets/music/sample-final-10.wav'), volume: 0.32 },
  sampleFinal11: { source: require('../../assets/music/sample-final-11.wav'), volume: 0.32 },
  sampleFinal12: { source: require('../../assets/music/sample-final-12.wav'), volume: 0.32 },
  sampleFinal13: { source: require('../../assets/music/sample-final-13.wav'), volume: 0.32 },
  sampleFinal14: { source: require('../../assets/music/sample-final-14.wav'), volume: 0.32 },
  sampleFinal15: { source: require('../../assets/music/sample-final-15.wav'), volume: 0.32 },
  sampleFinal16: { source: require('../../assets/music/sample-final-16.wav'), volume: 0.32 },
  sampleFinal17: { source: require('../../assets/music/sample-final-17.wav'), volume: 0.32 },
  sampleFinal18: { source: require('../../assets/music/sample-final-18.wav'), volume: 0.32 },
  sampleFinal19: { source: require('../../assets/music/sample-final-19.wav'), volume: 0.32 },
  sampleFinal20: { source: require('../../assets/music/sample-final-20.wav'), volume: 0.32 },
  sampleFinal21: { source: require('../../assets/music/sample-final-21.wav'), volume: 0.32 },
  sampleFinal22: { source: require('../../assets/music/sample-final-22.wav'), volume: 0.32 },
  sampleFinal23: { source: require('../../assets/music/sample-final-23.wav'), volume: 0.32 },
  sampleFinal24: { source: require('../../assets/music/sample-final-24.wav'), volume: 0.32 },
  sampleFinal25: { source: require('../../assets/music/sample-final-25.wav'), volume: 0.32 },
  sampleFinal26: { source: require('../../assets/music/sample-final-26.wav'), volume: 0.32 },
  sampleFinal27: { source: require('../../assets/music/sample-final-27.wav'), volume: 0.32 },
  sampleFinal28: { source: require('../../assets/music/sample-final-28.wav'), volume: 0.32 },
  sampleFinal29: { source: require('../../assets/music/sample-final-29.wav'), volume: 0.32 },
  sampleFinal30: { source: require('../../assets/music/sample-final-30.wav'), volume: 0.32 },
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
  { id: 'sampleFinal01', title: '【1】薄い弦', description: '4小節前から。イントロを1オクターブ下の弦で、小さく重ねる。' },
  { id: 'sampleFinal02', title: '【2】鐘', description: '4小節前から。イントロを鐘でそのまま。' },
  { id: 'sampleFinal03', title: '【3】伸ばすパッド', description: '4小節前から。各小節の頭の音だけを、パッドの長い音にする。' },
  { id: 'sampleFinal04', title: '【4】半分のギター', description: '4小節前から。イントロをギターで、元の上がり坂より小さく。' },
  { id: 'sampleFinal05', title: '【5】上のオルガン', description: '4小節前から。イントロを1オクターブ上のオルガンで。' },
  { id: 'sampleFinal06', title: '【6】細い矩形', description: '4小節前から。イントロを、ごく細い矩形波で。' },
  { id: 'sampleFinal07', title: '【7】ハープ', description: '4小節前から。イントロをハープで。' },
  { id: 'sampleFinal08', title: '【8】低い金管', description: '4小節前から。イントロを1オクターブ下の金管で。' },
  { id: 'sampleFinal09', title: '【9】半音上の笛', description: '4小節前から。イントロを半音上げて、笛で。' },
  { id: 'sampleFinal10', title: '【10】半音下の弦', description: '4小節前から。イントロを半音下げ、さらに1オクターブ下の弦で。' },
  { id: 'sampleFinal11', title: '【11】全音上の鐘', description: '4小節前から。イントロを全音上げて、鐘で。' },
  { id: 'sampleFinal12', title: '【12】全音下のギター', description: '4小節前から。イントロを全音下げて、ギターで。' },
  { id: 'sampleFinal13', title: '【13】短三度上', description: '4小節前から。イントロを短三度上げて、オルガンで。' },
  { id: 'sampleFinal14', title: '【14】同主長調', description: '4小節前から。イントロのシ♭とファをナチュラルにして、ギターで。' },
  { id: 'sampleFinal15', title: '【15】五度上', description: '4小節前から。イントロを五度上げて、鍵盤で。' },
  { id: 'sampleFinal16', title: '【16】四度下', description: '4小節前から。イントロを四度下げて、金管で。' },
  { id: 'sampleFinal17', title: '【17】骨だけ', description: '4小節前から。各小節の頭の音だけを、弦の長い音にする。' },
  { id: 'sampleFinal18', title: '【18】レ・レが続く', description: '4小節前から。イントロの頭「レ・レ」だけを、4小節鐘で繰り返す。' },
  { id: 'sampleFinal19', title: '【19】締めが二度', description: '4小節前から。イントロの後半（ラ・ラと、シ♭からド♯）を二度、シンセ金管で。' },
  { id: 'sampleFinal20', title: '【20】頭と締め', description: '4小節前から。頭と締めの小節を交互に、三角波で。' },
  { id: 'sampleFinal21', title: '【21】逆から', description: '4小節前から。イントロを後ろの小節から、ギターで。' },
  { id: 'sampleFinal22', title: '【22】三度下でハモる', description: '4小節前から。ギターのイントロに、短三度下の弦を重ねる。' },
  { id: 'sampleFinal23', title: '【23】ボスの鳴らし方', description: '4小節前から。章ボスと同じくギターと上のオルガン。音は小さめ。' },
  { id: 'sampleFinal24', title: '【24】だんだん大きく', description: '4小節前から。鐘のイントロが、サビに向かって大きくなる。' },
  { id: 'sampleFinal25', title: '【25】2小節・鐘の頭', description: '2小節前から。イントロの頭を鐘で。' },
  { id: 'sampleFinal26', title: '【26】2小節・低い弦', description: '2小節前から。イントロの頭を、1オクターブ下の弦で。' },
  { id: 'sampleFinal27', title: '【27】2小節・締めの金管', description: '2小節前から。イントロの締め（シ♭からド♯）を金管で。' },
  { id: 'sampleFinal28', title: '【28】2小節・半音上', description: '2小節前から。イントロの頭を半音上げて、ギターで。' },
  { id: 'sampleFinal29', title: '【29】2小節・五度の締め', description: '2小節前から。イントロの締めを五度上げて、鍵盤で。' },
  { id: 'sampleFinal30', title: '【30】2小節・伸ばすパッド', description: '2小節前から。締めの頭の音だけを、パッドの長い音にする。' },
];
