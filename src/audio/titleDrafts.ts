import type { AudioSource } from 'expo-audio';

type TitleDraftTrack = {
  id: `titleDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/**
 * タイトル曲の試作 30 案（scripts/bgm-title-drafts.mjs で合成）。図鑑で聞き比べるだけで、ゲーム中には流れない。
 * 1 つに決まったらタイトル曲に置き換えて、このファイルと試作の音源を消す。
 */
export const TITLE_DRAFT_TRACKS = [
  { id: 'titleDraft:01', title: '【試作 1】三つの旗 −凱−', description: '旋律はそのままで、金管・弦・ティンパニのオーケストラ版。', source: require('../../assets/music/title-draft-01.wav') },
  { id: 'titleDraft:02', title: '【試作 2】三つの旗 −夜明け−', description: 'ハープだけで始まり、笛・弦・金管と増えて盛り上がる。', source: require('../../assets/music/title-draft-02.wav') },
  { id: 'titleDraft:03', title: '【試作 3】三つの旗 −予兆−', description: '今の曲の最後に、ボス戦のサビの頭を遠くの金管が小さく鳴らす。', source: require('../../assets/music/title-draft-03.wav') },
  { id: 'titleDraft:04', title: '【試作 4】三つの旗 −旗揚げ−', description: '金管とティンパニのファンファーレで幕を開けてから今の曲へ。', source: require('../../assets/music/title-draft-04.wav') },
  { id: 'titleDraft:05', title: '【試作 5】三つの旗 −光−', description: 'ニ長調にした明るい版。笛とベル、軽い拍。', source: require('../../assets/music/title-draft-05.wav') },
  { id: 'titleDraft:06', title: '【試作 6】光の行進', description: 'ニ長調で、金管が A メロを全部歌う行進曲。', source: require('../../assets/music/title-draft-06.wav') },
  { id: 'titleDraft:07', title: '【試作 7】風の旅人', description: '16 分のハープに乗せた軽やかな笛。A メロ前半を元の速さで。', source: require('../../assets/music/title-draft-07.wav') },
  { id: 'titleDraft:08', title: '【試作 8】蒼の紋章', description: '新しい旋律。弦とパッド、オルガンの合唱風で荘厳に。', source: require('../../assets/music/title-draft-08.wav') },
  { id: 'titleDraft:09', title: '【試作 9】星詠みの旅路', description: '新しい旋律。132 BPM で疾走するシンセの冒険曲。', source: require('../../assets/music/title-draft-09.wav') },
  { id: 'titleDraft:10', title: '【試作 10】忘れられた王国', description: '新しい旋律。ベルとハープのしっとりした郷愁の曲。', source: require('../../assets/music/title-draft-10.wav') },
  { id: 'titleDraft:11', title: '【試作 11】剣と祈り', description: '前半は勇ましい金管の A メロ、後半はやさしい笛。', source: require('../../assets/music/title-draft-11.wav') },
  { id: 'titleDraft:12', title: '【試作 12】聖堂', description: 'オルガンの独奏。ゆっくり荘厳に。', source: require('../../assets/music/title-draft-12.wav') },
  { id: 'titleDraft:13', title: '【試作 13】オルゴール', description: '高いベルとハープだけの、オルゴールのような版。', source: require('../../assets/music/title-draft-13.wav') },
  { id: 'titleDraft:14', title: '【試作 14】弦の誓い', description: '弦楽合奏。16 分のハープが流れる。', source: require('../../assets/music/title-draft-14.wav') },
  { id: 'titleDraft:15', title: '【試作 15】小夜曲', description: '丸いエレピの独奏。夜のように静か。', source: require('../../assets/music/title-draft-15.wav') },
  { id: 'titleDraft:16', title: '【試作 16】妖精の丘', description: '新しい旋律。ケルト風に跳ねる笛とボンゴ。', source: require('../../assets/music/title-draft-16.wav') },
  { id: 'titleDraft:17', title: '【試作 17】英雄の行進', description: '行進のスネアに乗せて、金管が A メロを全部歌う。', source: require('../../assets/music/title-draft-17.wav') },
  { id: 'titleDraft:18', title: '【試作 18】烈火', description: 'ギターとオルガンのロックアレンジ。', source: require('../../assets/music/title-draft-18.wav') },
  { id: 'titleDraft:19', title: '【試作 19】蒼穹の翼', description: 'シンセブラスと三角波の壮大なアレンジ。', source: require('../../assets/music/title-draft-19.wav') },
  { id: 'titleDraft:20', title: '【試作 20】砂の王都', description: '和声的短音階にした異国風。ダラブッカ風の太鼓。', source: require('../../assets/music/title-draft-20.wav') },
  { id: 'titleDraft:21', title: '【試作 21】夜の城', description: '低い弦とオルガン、ナポリの和音で妖しく。', source: require('../../assets/music/title-draft-21.wav') },
  { id: 'titleDraft:22', title: '【試作 22】星降る夜', description: '平行調のヘ長調に寄せた、ベルとエレピのやさしい版。', source: require('../../assets/music/title-draft-22.wav') },
  { id: 'titleDraft:23', title: '【試作 23】昇る旗', description: 'A メロの頭を途中でホ短調へ転調し、金管で盛り上げる。', source: require('../../assets/music/title-draft-23.wav') },
  { id: 'titleDraft:24', title: '【試作 24】ボレロ', description: '同じ旋律を 4 回、楽器と音量を増やしながら繰り返す。', source: require('../../assets/music/title-draft-24.wav') },
  { id: 'titleDraft:25', title: '【試作 25】呼び交わす声', description: '笛と金管が旋律を掛け合う。', source: require('../../assets/music/title-draft-25.wav') },
  { id: 'titleDraft:26', title: '【試作 26】野の花', description: 'ハープと笛だけの素朴な版。ベースもなし。', source: require('../../assets/music/title-draft-26.wav') },
  { id: 'titleDraft:27', title: '【試作 27】鋼の軍旗', description: '低い金管とタムの重厚な版。', source: require('../../assets/music/title-draft-27.wav') },
  { id: 'titleDraft:28', title: '【試作 28】全開', description: 'サビをタイトルで全部聞かせる（サビはボス戦で初登場という方針を崩す案）。', source: require('../../assets/music/title-draft-28.wav') },
  { id: 'titleDraft:29', title: '【試作 29】翔べ、旗のもとへ', description: '新しい旋律。150 BPM のアニメ主題歌風。', source: require('../../assets/music/title-draft-29.wav') },
  { id: 'titleDraft:30', title: '【試作 30】静かな祈り', description: 'パッドとベルだけ。A メロの頭をさらに倍の長さで。', source: require('../../assets/music/title-draft-30.wav') },
] as const satisfies readonly TitleDraftTrack[];

export type TitleDraftId = (typeof TITLE_DRAFT_TRACKS)[number]['id'];
