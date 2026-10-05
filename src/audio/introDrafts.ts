// scripts/bgm-intro-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- intro-draft）。
import type { AudioSource } from 'expo-audio';

type IntroDraftTrack = {
  id: `introDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 4 弾: 三つの旗 −試− のイントロ（導入のリフ）だけを差し替えた案 30 個（音源はイントロ + A メロ）。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const INTRO_DRAFT_TRACKS = [
  { id: 'introDraft:01', title: '【イントロ案 1】付点の号令', description: 'サビ頭の付点のリズム（タータータ）を先取りした、1 小節ずつ下がっていく号令。（156 BPM）', source: require('../../assets/music/intro-draft-01.wav') },
  { id: 'introDraft:02', title: '【イントロ案 2】駆け上がる刃', description: '16 分で一気に駆け上がり、跳ね返って降りてくる速弾き。1 小節ごとに 1 段ずつ高く。（156 BPM）', source: require('../../assets/music/intro-draft-02.wav') },
  { id: 'introDraft:03', title: '【イントロ案 3】歌う旗手', description: '長い音で大きく歌う旋律。5 度の跳躍で始まり、ゆっくり降りてくる。（156 BPM）', source: require('../../assets/music/intro-draft-03.wav') },
  { id: 'introDraft:04', title: '【イントロ案 4】刻む鼓動', description: '同じ音を休符をはさんで刻むシンコペーション。旋律より拍の気持ちよさで押す。（156 BPM）', source: require('../../assets/music/intro-draft-04.wav') },
  { id: 'introDraft:05', title: '【イントロ案 5】落日の嘆き', description: '同じ形の下降フレーズを 1 段ずつ下げていく（ラ→ソ→ファ）。ベースも半音階的に下がる。（156 BPM）', source: require('../../assets/music/intro-draft-05.wav') },
  { id: 'introDraft:06', title: '【イントロ案 6】問いと答え', description: '2 拍の問いかけと、休符のあとの 2 拍の答えを交互に。会話のようなフレーズ。（156 BPM）', source: require('../../assets/music/intro-draft-06.wav') },
  { id: 'introDraft:07', title: '【イントロ案 7】跳躍の号砲', description: 'オクターブの跳躍で始まるファンファーレ風。和音の音を上下に打ち鳴らす。（156 BPM）', source: require('../../assets/music/intro-draft-07.wav') },
  { id: 'introDraft:08', title: '【イントロ案 8】疾駆の蹄', description: '「タッタカ」と馬が駆けるギャロップのリズムで、階段状に上がって下がる。（156 BPM）', source: require('../../assets/music/intro-draft-08.wav') },
  { id: 'introDraft:09', title: '【イントロ案 9】保続の誓い', description: '裏拍で同じ音（ラ・ソ・ミ）を鳴らし続け、表拍の旋律だけが動く。バロック風の分散。（156 BPM）', source: require('../../assets/music/intro-draft-09.wav') },
  { id: 'introDraft:10', title: '【イントロ案 10】4 度の呼び声', description: 'A メロの頭の「ラ→レ」（4 度上がる音）を呼び声にして、1 段ずつ下げて繰り返す。A メロへの予告。（156 BPM）', source: require('../../assets/music/intro-draft-10.wav') },
  { id: 'introDraft:11', title: '【イントロ案 11】鳴り止まぬ警鐘', description: '同じ音（ラ）を 8 分で打ち続け、下で和音だけが D→C→B♭ と下がっていく。最後に 1 段降りて A メロへ。（156 BPM）', source: require('../../assets/music/intro-draft-11.wav') },
  { id: 'introDraft:12', title: '【イントロ案 12】這い上がる影', description: '半音ずつじわじわ上がっていく旋律。不穏さをためて、最後のド♯で一気に解ける。（156 BPM）', source: require('../../assets/music/intro-draft-12.wav') },
  { id: 'introDraft:13', title: '【イントロ案 13】こだま', description: '高い音で鳴らした 3 音を、すぐ 1 オクターブ下でこだまのように返す。山あいに響く角笛のイメージ。（156 BPM）', source: require('../../assets/music/intro-draft-13.wav') },
  { id: 'introDraft:14', title: '【イントロ案 14】王の行進', description: '「ターン・タ・ター・ター」の付点の行進。ドラムは小太鼓の行進、伴奏は金管の合いの手。（156 BPM）', source: require('../../assets/music/intro-draft-14.wav') },
  { id: 'introDraft:15', title: '【イントロ案 15】静寂からの点火', description: 'オルガンの長い音だけで 2 小節静かに始まり、スネアのロールから 8 分の分散和音のリフが一気に走り出す。（156 BPM）', source: require('../../assets/music/intro-draft-15.wav') },
  { id: 'introDraft:16', title: '【イントロ案 16】戦太鼓の号砲', description: '低いタムとティンパニだけの 2 小節から始まり、同じ音を「タータータ」と 3 回叩く短い号令が 1 段ずつ上がる。（156 BPM）', source: require('../../assets/music/intro-draft-16.wav') },
  { id: 'introDraft:17', title: '【イントロ案 17】遅れて抜く刃', description: '最初の 1 小節半は旋律が黙り、伴奏とドラムだけで間をためる。そこへ旋律が切り込んでくる。（156 BPM）', source: require('../../assets/music/intro-draft-17.wav') },
  { id: 'introDraft:18', title: '【イントロ案 18】並び立つ二本の旗', description: '2 本のギターが 3 度でハモる、同じ形を 1 段ずつ下げていく旋律。ツインギターの王道。（156 BPM）', source: require('../../assets/music/intro-draft-18.wav') },
  { id: 'introDraft:19', title: '【イントロ案 19】3・3・2 の波', description: '8 分音符を 3 つ・3 つ・2 つに区切り、区切りごとに一段高く。拍とずれて押し寄せるうねり。（156 BPM）', source: require('../../assets/music/intro-draft-19.wav') },
  { id: 'introDraft:20', title: '【イントロ案 20】流れ落ちる滝', description: '16 分で音階を一気に駆け下り、2 つの長い音で受け止める。1 小節ごとに滝の始まりが高くなる（案 2 の逆向き）。（156 BPM）', source: require('../../assets/music/intro-draft-20.wav') },
  { id: 'introDraft:21', title: '【イントロ案 21】ため息の二音', description: '和音から外れた音を鳴らしてすぐ下の音に落ち着く「ため息」を、2 つずつ並べて 1 段ずつ下げていく。（156 BPM）', source: require('../../assets/music/intro-draft-21.wav') },
  { id: 'introDraft:22', title: '【イントロ案 22】跳ねる軍靴', description: '「タッカ・タッカ」と跳ねるリズムで和音を駆け上がり、てっぺんで折り返す。（156 BPM）', source: require('../../assets/music/intro-draft-22.wav') },
  { id: 'introDraft:23', title: '【イントロ案 23】三つの音', description: '「短・短・長」の 3 音だけの主題を、形を変えずに 1 段ずつ下げる。下の和音が変わることで表情が変わる。（156 BPM）', source: require('../../assets/music/intro-draft-23.wav') },
  { id: 'introDraft:24', title: '【イントロ案 24】八度の行き来', description: '低い音と 1 オクターブ上を 8 分で行き来しながら、レ→ド→シ♭→ラと下がっていく。ベースラインを旋律にした形。（156 BPM）', source: require('../../assets/music/intro-draft-24.wav') },
  { id: 'introDraft:25', title: '【イントロ案 25】遠い国の旋律', description: 'シ♭とド♯の間の広い音程（増 2 度）を使った、異国の民謡のような旋律。（156 BPM）', source: require('../../assets/music/intro-draft-25.wav') },
  { id: 'introDraft:26', title: '【イントロ案 26】速まる足音', description: '2 分音符 → 4 分 → 8 分 → 16 分と、小節ごとに音の細かさが倍になって加速していく。（156 BPM）', source: require('../../assets/music/intro-draft-26.wav') },
  { id: 'introDraft:27', title: '【イントロ案 27】囁きから鬨の声へ', description: 'ギターだけが小さく旋律を囁く 2 小節のあと、同じ旋律をバンド全員で鳴らす。（156 BPM）', source: require('../../assets/music/intro-draft-27.wav') },
  { id: 'introDraft:28', title: '【イントロ案 28】独奏の口上', description: 'ギターが伴奏なしで 16 分の分散和音を弾き上げる 2 小節の口上。タムの合図でバンドが入り、8 分で歌うリフへ。（156 BPM）', source: require('../../assets/music/intro-draft-28.wav') },
  { id: 'introDraft:29', title: '【イントロ案 29】サビの予告', description: 'サビ頭の「レー・ドー・シ♭」の形をそのまま使い、1 段ずつ上げていく。最初からサビを予感させる。（156 BPM）', source: require('../../assets/music/intro-draft-29.wav') },
  { id: 'introDraft:30', title: '【イントロ案 30】ギターとオルガンの掛け合い', description: 'ギターが 1 小節問いかけ、オルガンが高い音で 1 小節答える。楽器どうしの会話。（156 BPM）', source: require('../../assets/music/intro-draft-30.wav') },
] as const satisfies readonly IntroDraftTrack[];

export type IntroDraftId = (typeof INTRO_DRAFT_TRACKS)[number]['id'];
