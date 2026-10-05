// scripts/bgm-chorus-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- chorus-draft）。
import type { AudioSource } from 'expo-audio';

type ChorusDraftTrack = {
  id: `chorusDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し: サビになるフレーズだけの短い試作 50 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const CHORUS_DRAFT_TRACKS = [
  { id: 'chorusDraft:01', title: '【サビ 1】蒼き約束', description: '王道のアニメ主題歌。シンセブラスと三角波のハモり。（152 BPM）', source: require('../../assets/music/chorus-draft-01.wav') },
  { id: 'chorusDraft:02', title: '【サビ 2】勇者の凱歌', description: '金管が高らかに歌う、行進のスネアとティンパニ。（132 BPM）', source: require('../../assets/music/chorus-draft-02.wav') },
  { id: 'chorusDraft:03', title: '【サビ 3】哀しき姫君', description: 'ゆっくりした短調の笛。ハープとパッドだけ。（72 BPM）', source: require('../../assets/music/chorus-draft-03.wav') },
  { id: 'chorusDraft:04', title: '【サビ 4】嵐の決戦', description: 'ト短調の速いロック。ギターとオルガンのハモり。（168 BPM）', source: require('../../assets/music/chorus-draft-04.wav') },
  { id: 'chorusDraft:05', title: '【サビ 5】祭囃子', description: '五音音階の笛とボンゴで、お祭りのにぎわい。（138 BPM）', source: require('../../assets/music/chorus-draft-05.wav') },
  { id: 'chorusDraft:06', title: '【サビ 6】都の雅', description: '都節音階（和風）のベルと笛。しっとりと。（84 BPM）', source: require('../../assets/music/chorus-draft-06.wav') },
  { id: 'chorusDraft:07', title: '【サビ 7】星屑のセレナーデ', description: 'リディア旋法の浮遊感。ベルとエレピ。（104 BPM）', source: require('../../assets/music/chorus-draft-07.wav') },
  { id: 'chorusDraft:08', title: '【サビ 8】海賊の宴', description: 'ドリア旋法で跳ねる笛。陽気な船乗りの踊り。（144 BPM）', source: require('../../assets/music/chorus-draft-08.wav') },
  { id: 'chorusDraft:09', title: '【サビ 9】黒騎士', description: 'フリギア旋法の重い金管とタム。（112 BPM）', source: require('../../assets/music/chorus-draft-09.wav') },
  { id: 'chorusDraft:10', title: '【サビ 10】砂漠の隊商', description: '和声的短音階の笛とダラブッカ風の太鼓。（108 BPM）', source: require('../../assets/music/chorus-draft-10.wav') },
  { id: 'chorusDraft:11', title: '【サビ 11】夕暮れの酒場', description: '7 の和音のジャズ風。エレピとウォーキングベース。（100 BPM）', source: require('../../assets/music/chorus-draft-11.wav') },
  { id: 'chorusDraft:12', title: '【サビ 12】天空城', description: 'ゆったり雄大な弦。16 分のハープとティンパニ。（76 BPM）', source: require('../../assets/music/chorus-draft-12.wav') },
  { id: 'chorusDraft:13', title: '【サビ 13】駆け抜ける風', description: '速い長調の笛とベルのハモり。（160 BPM）', source: require('../../assets/music/chorus-draft-13.wav') },
  { id: 'chorusDraft:14', title: '【サビ 14】機械仕掛けの心', description: 'ピコピコ鳴る矩形波のチップチューン。（140 BPM）', source: require('../../assets/music/chorus-draft-14.wav') },
  { id: 'chorusDraft:15', title: '【サビ 15】森の子守唄', description: '五音音階のベル。とても静か。（60 BPM）', source: require('../../assets/music/chorus-draft-15.wav') },
  { id: 'chorusDraft:16', title: '【サビ 16】炎の闘技場', description: 'ミクソリディア旋法のギターロック。（150 BPM）', source: require('../../assets/music/chorus-draft-16.wav') },
  { id: 'chorusDraft:17', title: '【サビ 17】氷の女王', description: '和声的短音階のベルと弦。冷たく妖しい。（92 BPM）', source: require('../../assets/music/chorus-draft-17.wav') },
  { id: 'chorusDraft:18', title: '【サビ 18】花畑の約束', description: '明るいポップス。笛とベル、軽い拍。（124 BPM）', source: require('../../assets/music/chorus-draft-18.wav') },
  { id: 'chorusDraft:19', title: '【サビ 19】誓いの剣', description: 'ニ短調の勇ましい金管。メインテーマと同じ調。（120 BPM）', source: require('../../assets/music/chorus-draft-19.wav') },
  { id: 'chorusDraft:20', title: '【サビ 20】夜明けの港', description: '跳ねるリズムのエレピと笛。穏やかな朝。（98 BPM）', source: require('../../assets/music/chorus-draft-20.wav') },
  { id: 'chorusDraft:21', title: '【サビ 21】魔王城の鐘', description: '和声的短音階のオルガン。重々しく。（100 BPM）', source: require('../../assets/music/chorus-draft-21.wav') },
  { id: 'chorusDraft:22', title: '【サビ 22】疾風怒濤', description: '176 BPM の全力疾走。三角波とシンセブラス。（176 BPM）', source: require('../../assets/music/chorus-draft-22.wav') },
  { id: 'chorusDraft:23', title: '【サビ 23】春風ステップ', description: '弾むベルとスラップベース。（116 BPM）', source: require('../../assets/music/chorus-draft-23.wav') },
  { id: 'chorusDraft:24', title: '【サビ 24】遥かなる大地', description: 'リディア旋法の雄大な金管と弦。（108 BPM）', source: require('../../assets/music/chorus-draft-24.wav') },
  { id: 'chorusDraft:25', title: '【サビ 25】涙の雨', description: '切ない短調のポップス。エレピと弦のハモり。（104 BPM）', source: require('../../assets/music/chorus-draft-25.wav') },
  { id: 'chorusDraft:26', title: '【サビ 26】剣士の誇り', description: 'フリギア旋法のスパニッシュ風ギター。（132 BPM）', source: require('../../assets/music/chorus-draft-26.wav') },
  { id: 'chorusDraft:27', title: '【サビ 27】星の巡礼', description: 'ドリア旋法の聖歌風。弦とオルガン。（64 BPM）', source: require('../../assets/music/chorus-draft-27.wav') },
  { id: 'chorusDraft:28', title: '【サビ 28】ゴブリン行進', description: 'おどけた矩形波の行進曲。（120 BPM）', source: require('../../assets/music/chorus-draft-28.wav') },
  { id: 'chorusDraft:29', title: '【サビ 29】翼の歌', description: 'アニメのバラードのサビ。笛とエレピ。（100 BPM）', source: require('../../assets/music/chorus-draft-29.wav') },
  { id: 'chorusDraft:30', title: '【サビ 30】雷鳴の軍勢', description: '五音音階の金管と和太鼓風のタム。（128 BPM）', source: require('../../assets/music/chorus-draft-30.wav') },
  { id: 'chorusDraft:31', title: '【サビ 31】水晶の洞窟', description: 'リディア旋法のベルの分散和音。（110 BPM）', source: require('../../assets/music/chorus-draft-31.wav') },
  { id: 'chorusDraft:32', title: '【サビ 32】闘志のファンファーレ', description: '跳ねる金管のファンファーレと弦のハモり。（140 BPM）', source: require('../../assets/music/chorus-draft-32.wav') },
  { id: 'chorusDraft:33', title: '【サビ 33】影の暗殺者', description: '裏拍から入る三角波。暗いシンセ。（124 BPM）', source: require('../../assets/music/chorus-draft-33.wav') },
  { id: 'chorusDraft:34', title: '【サビ 34】草原のピクニック', description: '五音音階ののどかな笛。（112 BPM）', source: require('../../assets/music/chorus-draft-34.wav') },
  { id: 'chorusDraft:35', title: '【サビ 35】古の神殿', description: '和声的短音階の笛。オルガンとティンパニ。（70 BPM）', source: require('../../assets/music/chorus-draft-35.wav') },
  { id: 'chorusDraft:36', title: '【サビ 36】竜騎士の空', description: '速い長調の金管とシンセブラス。（156 BPM）', source: require('../../assets/music/chorus-draft-36.wav') },
  { id: 'chorusDraft:37', title: '【サビ 37】月夜の舞踏会', description: '跳ねる短調のエレピと弦。（108 BPM）', source: require('../../assets/music/chorus-draft-37.wav') },
  { id: 'chorusDraft:38', title: '【サビ 38】仲間との絆', description: 'あたたかい弦と笛のハモり。（100 BPM）', source: require('../../assets/music/chorus-draft-38.wav') },
  { id: 'chorusDraft:39', title: '【サビ 39】鋼鉄の巨人', description: 'フリギア旋法の重いギター。（100 BPM）', source: require('../../assets/music/chorus-draft-39.wav') },
  { id: 'chorusDraft:40', title: '【サビ 40】妖精の悪戯', description: '五音音階で駆け回るベルと笛。（148 BPM）', source: require('../../assets/music/chorus-draft-40.wav') },
  { id: 'chorusDraft:41', title: '【サビ 41】鎮魂の祈り', description: 'とても遅い短調の弦。（52 BPM）', source: require('../../assets/music/chorus-draft-41.wav') },
  { id: 'chorusDraft:42', title: '【サビ 42】勝利の宴', description: '明るいダンス。シンセブラスと笛、スラップベース。（136 BPM）', source: require('../../assets/music/chorus-draft-42.wav') },
  { id: 'chorusDraft:43', title: '【サビ 43】迷いの森', description: 'ドリア旋法の不思議な笛。（102 BPM）', source: require('../../assets/music/chorus-draft-43.wav') },
  { id: 'chorusDraft:44', title: '【サビ 44】決意の朝', description: 'ポップロック。ギターとオルガンのハモり。（144 BPM）', source: require('../../assets/music/chorus-draft-44.wav') },
  { id: 'chorusDraft:45', title: '【サビ 45】時計塔の謎', description: '和声的短音階の矩形波とベル。（118 BPM）', source: require('../../assets/music/chorus-draft-45.wav') },
  { id: 'chorusDraft:46', title: '【サビ 46】白銀の騎士団', description: '短調の行進。金管と弦。（112 BPM）', source: require('../../assets/music/chorus-draft-46.wav') },
  { id: 'chorusDraft:47', title: '【サビ 47】雲の上の散歩', description: 'リディア旋法のエレピとベル。ふわふわ。（100 BPM）', source: require('../../assets/music/chorus-draft-47.wav') },
  { id: 'chorusDraft:48', title: '【サビ 48】獣の咆哮', description: '五音音階の金管とタムの連打。（126 BPM）', source: require('../../assets/music/chorus-draft-48.wav') },
  { id: 'chorusDraft:49', title: '【サビ 49】旅立ちの鐘', description: 'ベルと弦のハモり、ティンパニ。（106 BPM）', source: require('../../assets/music/chorus-draft-49.wav') },
  { id: 'chorusDraft:50', title: '【サビ 50】星灯りの巡礼', description: 'ゲーム名の曲。ニ短調の壮大な金管と弦。（120 BPM）', source: require('../../assets/music/chorus-draft-50.wav') },
] as const satisfies readonly ChorusDraftTrack[];

export type ChorusDraftId = (typeof CHORUS_DRAFT_TRACKS)[number]['id'];
