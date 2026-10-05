// scripts/bgm-run-drafts.mjs が書き出すファイル。手で直さない（npm run bgm -- run-draft）。
import type { AudioSource } from 'expo-audio';

type RunDraftTrack = {
  id: `runDraft:${string}`;
  title: string;
  description: string;
  source: AudioSource;
};

/** タイトル曲の候補探し 第 5 弾: 三つの旗 −試− の B メロを倍の 8 小節にした旋律の案 30 個（音源は A メロ後半 + B メロ + ため）。図鑑で聞き比べるだけで、ゲーム中には流れない。 */
export const RUN_DRAFT_TRACKS = [
  { id: 'runDraft:01', title: '【B メロ案 1】原形の繰り返し', description: '今の B メロを 2 回。2 回目の終わりだけ駆け上がって締める。（156 BPM）', source: require('../../assets/music/run-draft-01.wav') },
  { id: 'runDraft:02', title: '【B メロ案 2】昇る分散和音', description: '16 分で和音を 2 段に駆け上がり、長い音で受ける。後半は低い所から始めて、だんだん頂上へ。（156 BPM）', source: require('../../assets/music/run-draft-02.wav') },
  { id: 'runDraft:03', title: '【B メロ案 3】下降の嵐', description: '16 分で音階を一気に駆け下りては跳ね上がる。後半は 1 オクターブ高い所から降ってくる。（156 BPM）', source: require('../../assets/music/run-draft-03.wav') },
  { id: 'runDraft:04', title: '【B メロ案 4】軽やかな分散', description: '8 分で「低・高・中・高」と和音を転がす。後半は 3 度上から転がして明るく。（156 BPM）', source: require('../../assets/music/run-draft-04.wav') },
  { id: 'runDraft:05', title: '【B メロ案 5】トッカータ', description: '同じ音を 16 分で挟みながら旋律を動かす、パイプオルガンの定番の弾き方。前半は下、後半は上に軸の音。（156 BPM）', source: require('../../assets/music/run-draft-05.wav') },
  { id: 'runDraft:06', title: '【B メロ案 6】歌うオルガン', description: '長い音でゆったり歌う聖歌風。コードが 5 度ずつ巡る王道の進行に乗せる。（156 BPM）', source: require('../../assets/music/run-draft-06.wav') },
  { id: 'runDraft:07', title: '【B メロ案 7】高低の掛け合い', description: '高い所で回る音型が問いかけ、低い所で同じ音型が答える。後半は同じ音型で 1 段ずつ降りる。（156 BPM）', source: require('../../assets/music/run-draft-07.wav') },
  { id: 'runDraft:08', title: '【B メロ案 8】食い気味のシンコペーション', description: '拍の裏で音を伸ばして前のめりに。後半は休符で刻んで、最後に跳ね上がる。（156 BPM）', source: require('../../assets/music/run-draft-08.wav') },
  { id: 'runDraft:09', title: '【B メロ案 9】付点の行進', description: '「タッカ・タッカ」の付点で和音を降りては上がる。後半はコードが上へ進み、付点で駆け上がる。（156 BPM）', source: require('../../assets/music/run-draft-09.wav') },
  { id: 'runDraft:10', title: '【B メロ案 10】這い上がる半音', description: '半音ずつ這い上がって和音の音にたどり着く。後半は 8 分で 1 小節かけて半音階を上り続ける。（156 BPM）', source: require('../../assets/music/run-draft-10.wav') },
  { id: 'runDraft:11', title: '【B メロ案 11】オクターブの跳躍', description: '低い音から 1 オクターブ跳んで和音を降り、もう一度跳んで高い音へ。後半は 3 度上から。（156 BPM）', source: require('../../assets/music/run-draft-11.wav') },
  { id: 'runDraft:12', title: '【B メロ案 12】3 度のハモり', description: 'オルガン 2 本が 3 度でハモりながら、波のように上り下りする。（156 BPM）', source: require('../../assets/music/run-draft-12.wav') },
  { id: 'runDraft:13', title: '【B メロ案 13】五度圏を巡る', description: 'コードが 5 度ずつ巡る王道の進行（Dm→Gm→C→F→B♭…）を、16 分の分散和音でなぞる。（156 BPM）', source: require('../../assets/music/run-draft-13.wav') },
  { id: 'runDraft:14', title: '【B メロ案 14】駆ける蹄', description: '「タッタカ」のギャロップで、前半は回りながら降り、後半は回りながら昇る。（156 BPM）', source: require('../../assets/music/run-draft-14.wav') },
  { id: 'runDraft:15', title: '【B メロ案 15】回る音', description: '「上・元・下・元」とくるりと回る音（ターン）でつなぐ。後半は 1 段高い所で回る。（156 BPM）', source: require('../../assets/music/run-draft-15.wav') },
  { id: 'runDraft:16', title: '【B メロ案 16】石の階段', description: '4 音ずつのまとまりを 1 段ずつずらして昇っていく階段。最後に頂上から一気に降りる。（156 BPM）', source: require('../../assets/music/run-draft-16.wav') },
  { id: 'runDraft:17', title: '【B メロ案 17】うねり', description: '8 分で 1 小節に 1 回、山を描いて上って下りる。後半は山が高くなる。（156 BPM）', source: require('../../assets/music/run-draft-17.wav') },
  { id: 'runDraft:18', title: '【B メロ案 18】打ち鳴らす鐘', description: '高い音を 3 回打ち鳴らしてから跳ね上がる。鐘楼の鐘のように、同じ形を高さを変えて繰り返す。（156 BPM）', source: require('../../assets/music/run-draft-18.wav') },
  { id: 'runDraft:19', title: '【B メロ案 19】オルガンとギターの交代', description: '今の B メロの弾き方で、オルガンとギターが 1 小節ずつ交代しながら駆け上がる。（156 BPM）', source: require('../../assets/music/run-draft-19.wav') },
  { id: 'runDraft:20', title: '【B メロ案 20】間で刻む', description: '短い音と休符で、すき間を聞かせる。後半は回る音を足して少しずつ埋めていく。（156 BPM）', source: require('../../assets/music/run-draft-20.wav') },
  { id: 'runDraft:21', title: '【B メロ案 21】静から動へ', description: '前半は長い音だけで静かに。後半は 16 分で一気に駆け上がって、ためへ飛び込む。（156 BPM）', source: require('../../assets/music/run-draft-21.wav') },
  { id: 'runDraft:22', title: '【B メロ案 22】嵐のあとの凪', description: '前半は 16 分の刻みで激しく、後半は長い音で大きく歌う（静から動への逆）。（156 BPM）', source: require('../../assets/music/run-draft-22.wav') },
  { id: 'runDraft:23', title: '【B メロ案 23】異国の回廊', description: 'シ♭とド♯の広い音程（増 2 度）を使った、異国風の旋律。（156 BPM）', source: require('../../assets/music/run-draft-23.wav') },
  { id: 'runDraft:24', title: '【B メロ案 24】4 度の連鎖', description: 'A メロの頭の「ラ→レ」（4 度上がる音）を 1 段ずつ下げてつなぐ。後半は 16 分に詰めて畳みかける。（156 BPM）', source: require('../../assets/music/run-draft-24.wav') },
  { id: 'runDraft:25', title: '【B メロ案 25】付点の下り坂', description: 'サビと同じ付点の「ター・ター・タ」で 1 段ずつ降り、後半は同じ形で 1 段ずつ昇る。（156 BPM）', source: require('../../assets/music/run-draft-25.wav') },
  { id: 'runDraft:26', title: '【B メロ案 26】バロックの模倣', description: '「回って・跳ねて」の 1 小節の動機を、コードに合わせて写していくバロック風。（156 BPM）', source: require('../../assets/music/run-draft-26.wav') },
  { id: 'runDraft:27', title: '【B メロ案 27】重ねた刃', description: 'オルガンとギターが同じ旋律をユニゾンで。低い音を軸にしたリフで押していく。（156 BPM）', source: require('../../assets/music/run-draft-27.wav') },
  { id: 'runDraft:28', title: '【B メロ案 28】長音と駆け上がり', description: '長い音を伸ばしてから、16 分と 8 分で次の小節へ駆け上がる。毎小節が助走になる。（156 BPM）', source: require('../../assets/music/run-draft-28.wav') },
  { id: 'runDraft:29', title: '【B メロ案 29】3・3・2 の下り', description: '和音を上から 3 つずつ降りる 8 分を 3・3・2 に区切り、拍とずらして転がす。（156 BPM）', source: require('../../assets/music/run-draft-29.wav') },
  { id: 'runDraft:30', title: '【B メロ案 30】止まらない指', description: '8 小節ずっと 16 分で弾き続ける。前半は高い所で回り、後半は低い所でうねる。（156 BPM）', source: require('../../assets/music/run-draft-30.wav') },
] as const satisfies readonly RunDraftTrack[];

export type RunDraftId = (typeof RUN_DRAFT_TRACKS)[number]['id'];
