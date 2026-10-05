// scripts/bgm-intro-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- intro-draft）。
import type { AudioSource } from 'expo-audio';

type IntroDraftTrack = {
  id: `introDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 4 弾: 三つの旗 −試− の A メロ（導入のリフ）だけを差し替えた改編案 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const INTRO_DRAFT_TRACKS = [
  { id: 'introDraft:01', title: '【A 案 1】付点の号令', description: 'サビ頭の付点のリズム（タータータ）を先取りした、1 小節ずつ下がっていく号令。（156 BPM）', source: require('../../assets/music/intro-draft-01.wav') },
  { id: 'introDraft:02', title: '【A 案 2】駆け上がる刃', description: '16 分で一気に駆け上がり、跳ね返って降りてくる速弾き。1 小節ごとに 1 段ずつ高く。（156 BPM）', source: require('../../assets/music/intro-draft-02.wav') },
  { id: 'introDraft:03', title: '【A 案 3】歌う旗手', description: '長い音で大きく歌う旋律。5 度の跳躍で始まり、ゆっくり降りてくる。（156 BPM）', source: require('../../assets/music/intro-draft-03.wav') },
  { id: 'introDraft:04', title: '【A 案 4】刻む鼓動', description: '同じ音を休符をはさんで刻むシンコペーション。旋律より拍の気持ちよさで押す。（156 BPM）', source: require('../../assets/music/intro-draft-04.wav') },
  { id: 'introDraft:05', title: '【A 案 5】落日の嘆き', description: '同じ形の下降フレーズを 1 段ずつ下げていく（ラ→ソ→ファ）。ベースも半音階的に下がる。（156 BPM）', source: require('../../assets/music/intro-draft-05.wav') },
  { id: 'introDraft:06', title: '【A 案 6】問いと答え', description: '2 拍の問いかけと、休符のあとの 2 拍の答えを交互に。会話のようなフレーズ。（156 BPM）', source: require('../../assets/music/intro-draft-06.wav') },
  { id: 'introDraft:07', title: '【A 案 7】跳躍の号砲', description: 'オクターブの跳躍で始まるファンファーレ風。和音の音を上下に打ち鳴らす。（156 BPM）', source: require('../../assets/music/intro-draft-07.wav') },
  { id: 'introDraft:08', title: '【A 案 8】疾駆の蹄', description: '「タッタカ」と馬が駆けるギャロップのリズムで、階段状に上がって下がる。（156 BPM）', source: require('../../assets/music/intro-draft-08.wav') },
  { id: 'introDraft:09', title: '【A 案 9】保続の誓い', description: '裏拍で同じ音（ラ・ソ・ミ）を鳴らし続け、表拍の旋律だけが動く。バロック風の分散。（156 BPM）', source: require('../../assets/music/intro-draft-09.wav') },
  { id: 'introDraft:10', title: '【A 案 10】4 度の呼び声', description: 'B メロの頭の「ラ→レ」（4 度上がる音）を呼び声にして、1 段ずつ下げて繰り返す。B メロへの予告。（156 BPM）', source: require('../../assets/music/intro-draft-10.wav') },
] as const satisfies readonly IntroDraftTrack[];

export type IntroDraftId = (typeof INTRO_DRAFT_TRACKS)[number]['id'];
