// タイトル曲の候補探し 第 5 弾（2026-10-05）: 「三つの旗 −試−」の B メロ（オルガンの駆け上がり）を倍の 8 小節にした旋律の案 30 個。
// オーナー: B メロは倍の長さに。旋律のパターンを 30 個。楽器・伴奏は −試− の B メロと同じ（オルガン、刻み、ギャロップのベース、ツーバス）。
// どれもニ短調で、属和音 A で終わって「ため」の Gm へ入る。
// 前後のつながりが分かるよう、音源は A メロの後半 4 小節 + B メロ 8 小節 + ため 4 小節（run-draft-01〜30.wav）。
// 図鑑の一覧 src/audio/runDrafts.ts はこの台本が書き出す。
import { BOSS_AFTER_INTRO, BOSS_BPM, BOSS_MIX } from './bgm-boss.mjs';
import { parsePhrase } from './bgm-engine.mjs';
import { pad2, writeDraftCatalog } from './bgm-melody.mjs';
import { bars, join4 } from './bgm-song.mjs';
import { RUN_BARS, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

const [verse, , build] = BOSS_AFTER_INTRO;

/** 同じ長さの音を並べる（x16('D5 F5') → 'D5:0.25 F5:0.25'）。 */
const at = (beats) => (names) => names.split(' ').map((name) => `${name}:${beats}`).join(' ');
const x16 = at(0.25);
const x8 = at(0.5);
const b = (...pieces) => pieces.join(' ');

/** コード進行（8 小節）。 */
const RUN2 = ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb', 'A'];
const RISE = ['Dm', 'C', 'Bb', 'A', 'Gm', 'Am', 'Bb', 'A'];
const CIRCLE = ['Dm', 'Gm', 'C', 'F', 'Bb', 'Gm', 'A', 'A'];

const [R1, R2, R3] = RUN_BARS;

/** B メロ 30 案。parts を指定した案は楽器の組み合わせも変える。 */
const RUNS = [
  {
    no: 1,
    name: '原形の繰り返し',
    desc: '今の B メロを 2 回。2 回目の終わりだけ駆け上がって締める。',
    chords: RUN2,
    bars: [...RUN_BARS, R1, R2, R3, b(x16('E6 F6 G6 A6'), 'G6:0.5 E6:0.5 C#6:1 A5:1')],
  },
  {
    no: 2,
    name: '昇る分散和音',
    desc: '16 分で和音を 2 段に駆け上がり、長い音で受ける。後半は低い所から始めて、だんだん頂上へ。',
    chords: RISE,
    bars: [
      b(x16('D5 F5 A5 D6 F5 A5 D6 F6'), x8('A5 D6'), 'F6:1'),
      b(x16('C5 E5 G5 C6 E5 G5 C6 E6'), x8('G5 C6'), 'E6:1'),
      b(x16('Bb4 D5 F5 Bb5 D5 F5 Bb5 D6'), x8('F5 Bb5'), 'D6:1'),
      b(x16('A4 C#5 E5 A5 C#5 E5 A5 C#6'), 'E6:2'),
      b(x16('G4 Bb4 D5 G5 Bb4 D5 G5 Bb5'), x8('D5 G5'), 'Bb5:1'),
      b(x16('A4 C5 E5 A5 C5 E5 A5 C6'), x8('E5 A5'), 'C6:1'),
      b(x16('Bb4 D5 F5 Bb5 D5 F5 Bb5 D6'), x8('F6 D6'), 'F6:1'),
      b(x16('A5 C#6 E6 A6'), x8('E6 C#6'), 'A5:2'),
    ],
  },
  {
    no: 3,
    name: '下降の嵐',
    desc: '16 分で音階を一気に駆け下りては跳ね上がる。後半は 1 オクターブ高い所から降ってくる。',
    chords: RUN2,
    bars: [
      b(x16('F6 E6 D6 C6 Bb5 A5 G5 F5'), 'D5:0.5 F5:0.5 A5:1'),
      b(x16('E6 D6 C6 Bb5 A5 G5 F5 E5'), 'C5:0.5 E5:0.5 G5:1'),
      b(x16('D6 C6 Bb5 A5 G5 F5 E5 D5'), 'Bb4:0.5 D5:0.5 F5:1'),
      b(x16('C#6 Bb5 A5 G5 F5 E5 D5 C#5'), 'A4:2'),
      b(x16('A6 G6 F6 E6 D6 C6 Bb5 A5'), 'F5:0.5 A5:0.5 D6:1'),
      b(x16('G6 F6 E6 D6 C6 Bb5 A5 G5'), 'E5:0.5 G5:0.5 C6:1'),
      b(x16('F6 E6 D6 C6 Bb5 A5 G5 F5'), 'D5:0.5 F5:0.5 Bb5:1'),
      b(x16('E6 D6 C#6 Bb5 A5 G5 F5 E5'), 'C#5:1 A4:1'),
    ],
  },
  {
    no: 4,
    name: '軽やかな分散',
    desc: '8 分で「低・高・中・高」と和音を転がす。後半は 3 度上から転がして明るく。',
    chords: RUN2,
    bars: [
      x8('D5 A5 F5 A5 D6 A5 F5 A5'),
      x8('C5 G5 E5 G5 C6 G5 E5 G5'),
      x8('Bb4 F5 D5 F5 Bb5 F5 D5 F5'),
      x8('A4 E5 C#5 E5 A5 E5 C#5 E5'),
      x8('F5 D6 A5 D6 F6 D6 A5 D6'),
      x8('E5 C6 G5 C6 E6 C6 G5 C6'),
      x8('D5 Bb5 F5 Bb5 D6 Bb5 F5 Bb5'),
      b(x8('C#5 A5 E5 A5 C#6 E6'), 'A6:1'),
    ],
  },
  {
    no: 5,
    name: 'トッカータ',
    desc: '同じ音を 16 分で挟みながら旋律を動かす、パイプオルガンの定番の弾き方。前半は下、後半は上に軸の音。',
    chords: RUN2,
    bars: [
      x16('A5 D6 A5 E6 A5 F6 A5 E6 A5 D6 A5 C6 A5 Bb5 A5 C6'),
      x16('G5 C6 G5 D6 G5 E6 G5 D6 G5 C6 G5 Bb5 G5 A5 G5 Bb5'),
      x16('F5 Bb5 F5 C6 F5 D6 F5 C6 F5 Bb5 F5 A5 F5 G5 F5 A5'),
      b(x16('E5 A5 E5 Bb5 E5 C#6 E5 Bb5'), 'A5:2'),
      x16('D6 A5 D6 G5 D6 F5 D6 E5 D6 F5 D6 G5 D6 A5 D6 F5'),
      x16('C6 G5 C6 F5 C6 E5 C6 D5 C6 E5 C6 F5 C6 G5 C6 E5'),
      x16('D6 Bb5 D6 A5 D6 G5 D6 F5 D6 G5 D6 A5 D6 Bb5 D6 C6'),
      b(x16('C#6 A5 C#6 G5 C#6 E5 C#6 A5'), 'E6:1 A5:1'),
    ],
  },
  {
    no: 6,
    name: '歌うオルガン',
    desc: '長い音でゆったり歌う聖歌風。コードが 5 度ずつ巡る王道の進行に乗せる。',
    chords: CIRCLE,
    bars: ['A5:2 D6:2', 'D6:1.5 C6:0.5 Bb5:2', 'G5:2 C6:2', 'C6:1.5 Bb5:0.5 A5:2', 'F5:1 G5:1 A5:1 Bb5:1', 'Bb5:1 D6:1 G6:2', 'E6:1.5 D6:0.5 C#6:2', 'A5:1 C#6:1 E6:2'],
  },
  {
    no: 7,
    name: '高低の掛け合い',
    desc: '高い所で回る音型が問いかけ、低い所で同じ音型が答える。後半は同じ音型で 1 段ずつ降りる。',
    chords: RUN2,
    bars: [
      b(x16('D6 E6 F6 E6'), x8('D6 A5'), 'F6:2'),
      b(x16('E6 F6 G6 F6'), x8('E6 C6'), 'G6:2'),
      b(x16('D5 C5 Bb4 C5'), x8('D5 F5'), 'Bb4:2'),
      b(x16('C#5 D5 E5 D5'), x8('C#5 A4'), 'E5:2'),
      b(x16('A5 Bb5 C6 Bb5'), x8('A5 F5'), 'D6:2'),
      b(x16('G5 A5 Bb5 A5'), x8('G5 E5'), 'C6:2'),
      b(x16('F5 G5 A5 G5'), x8('F5 D5'), 'Bb5:2'),
      b(x16('E5 F5 G5 F5'), x8('E5 C#5'), 'A5:2'),
    ],
  },
  {
    no: 8,
    name: '食い気味のシンコペーション',
    desc: '拍の裏で音を伸ばして前のめりに。後半は休符で刻んで、最後に跳ね上がる。',
    chords: RUN2,
    bars: [
      'D6:0.5 A5:1 F5:1 A5:0.5 D6:1',
      'E6:0.5 C6:1 G5:1 C6:0.5 E6:1',
      'F6:0.5 D6:1 Bb5:1 D6:0.5 F6:1',
      'E6:0.5 C#6:1 A5:1 C#6:0.5 E6:1',
      'F6:0.5 D6:0.5 -:0.5 A5:0.5 F6:0.5 D6:0.5 -:0.5 A5:0.5',
      'E6:0.5 C6:0.5 -:0.5 G5:0.5 E6:0.5 C6:0.5 -:0.5 G5:0.5',
      'D6:0.5 Bb5:0.5 -:0.5 F5:0.5 D6:0.5 Bb5:0.5 F6:0.5 D6:0.5',
      'C#6:0.5 E6:1 A6:1 E6:0.5 C#6:1',
    ],
  },
  {
    no: 9,
    name: '付点の行進',
    desc: '「タッカ・タッカ」の付点で和音を降りては上がる。後半はコードが上へ進み、付点で駆け上がる。',
    chords: RISE,
    bars: [
      'D6:0.75 A5:0.25 F5:0.75 A5:0.25 D6:0.75 F6:0.25 E6:1',
      'C6:0.75 G5:0.25 E5:0.75 G5:0.25 C6:0.75 E6:0.25 D6:1',
      'Bb5:0.75 F5:0.25 D5:0.75 F5:0.25 Bb5:0.75 D6:0.25 C6:1',
      'A5:0.75 E5:0.25 C#5:0.75 E5:0.25 A5:2',
      'G5:0.75 Bb5:0.25 D6:0.75 G6:0.25 F6:1 D6:1',
      'A5:0.75 C6:0.25 E6:0.75 A6:0.25 G6:1 E6:1',
      'Bb5:0.75 D6:0.25 F6:0.75 Bb6:0.25 A6:1 F6:1',
      'E6:0.75 C#6:0.25 A5:0.75 E5:0.25 C#5:2',
    ],
  },
  {
    no: 10,
    name: '這い上がる半音',
    desc: '半音ずつ這い上がって和音の音にたどり着く。後半は 8 分で 1 小節かけて半音階を上り続ける。',
    chords: RUN2,
    bars: [
      b(x16('A5 A#5 B5 C6'), 'D6:1', x8('A5 F5'), 'D5:1'),
      b(x16('G5 G#5 A5 A#5'), 'C6:1', x8('G5 E5'), 'C5:1'),
      b(x16('F5 G5 G#5 A5'), 'Bb5:1', x8('F5 D5'), 'Bb4:1'),
      b(x16('E5 F5 F#5 G5'), 'G#5:1 A5:2'),
      x8('D5 D#5 E5 F5 F#5 G5 G#5 A5'),
      x8('C5 C#5 D5 D#5 E5 F5 F#5 G5'),
      x8('Bb4 B4 C5 C#5 D5 D#5 E5 F5'),
      b(x16('E5 F5 F#5 G5 G#5 A5 A#5 B5'), 'C6:0.5 C#6:1.5'),
    ],
  },
  {
    no: 11,
    name: 'オクターブの跳躍',
    desc: '低い音から 1 オクターブ跳んで和音を降り、もう一度跳んで高い音へ。後半は 3 度上から。',
    chords: RUN2,
    bars: [
      'D5:0.5 D6:0.5 A5:0.5 F5:0.5 D5:0.5 D6:0.5 F6:1',
      'C5:0.5 C6:0.5 G5:0.5 E5:0.5 C5:0.5 C6:0.5 E6:1',
      'Bb4:0.5 Bb5:0.5 F5:0.5 D5:0.5 Bb4:0.5 Bb5:0.5 D6:1',
      'A4:0.5 A5:0.5 E5:0.5 C#5:0.5 A4:0.5 A5:0.5 C#6:1',
      'F5:0.5 F6:0.5 D6:0.5 A5:0.5 F5:0.5 F6:0.5 A6:1',
      'E5:0.5 E6:0.5 C6:0.5 G5:0.5 E5:0.5 E6:0.5 G6:1',
      'D5:0.5 D6:0.5 Bb5:0.5 F5:0.5 D5:0.5 D6:0.5 F6:1',
      'C#5:0.5 C#6:0.5 A5:0.5 E5:0.5 A4:2',
    ],
  },
  {
    no: 12,
    name: '3 度のハモり',
    desc: 'オルガン 2 本が 3 度でハモりながら、波のように上り下りする。',
    chords: RUN2,
    parts: [
      {
        inst: 'organ',
        vol: 0.3,
        bars: [
          x8('F5 G5 A5 G5 F5 A5 D6 A5'),
          x8('E5 F5 G5 F5 E5 G5 C6 G5'),
          x8('D5 E5 F5 E5 D5 F5 Bb5 F5'),
          b(x8('C#5 D5 E5 D5 C#5 E5'), 'A5:1'),
          x8('A5 Bb5 C6 Bb5 A5 C6 F6 C6'),
          x8('G5 A5 Bb5 A5 G5 Bb5 E6 Bb5'),
          x8('F5 G5 A5 G5 F5 A5 D6 A5'),
          b(x8('E5 F5 G5 F5 E5 G5'), 'C#6:1'),
        ],
      },
      {
        inst: 'organ',
        vol: 0.22,
        bars: [
          x8('D5 E5 F5 E5 D5 F5 A5 F5'),
          x8('C5 D5 E5 D5 C5 E5 G5 E5'),
          x8('Bb4 C5 D5 C5 Bb4 D5 F5 D5'),
          b(x8('A4 B4 C#5 B4 A4 C#5'), 'E5:1'),
          x8('F5 G5 A5 G5 F5 A5 D6 A5'),
          x8('E5 F5 G5 F5 E5 G5 C6 G5'),
          x8('D5 E5 F5 E5 D5 F5 Bb5 F5'),
          b(x8('C#5 D5 E5 D5 C#5 E5'), 'A5:1'),
        ],
      },
    ],
  },
  {
    no: 13,
    name: '五度圏を巡る',
    desc: 'コードが 5 度ずつ巡る王道の進行（Dm→Gm→C→F→B♭…）を、16 分の分散和音でなぞる。',
    chords: CIRCLE,
    bars: [
      b(x16('D5 F5 A5 D6 A5 F5 A5 D6'), 'F6:1 D6:1'),
      b(x16('D5 G5 Bb5 D6 Bb5 G5 Bb5 D6'), 'G6:1 D6:1'),
      b(x16('C5 E5 G5 C6 G5 E5 G5 C6'), 'E6:1 C6:1'),
      b(x16('C5 F5 A5 C6 A5 F5 A5 C6'), 'F6:1 C6:1'),
      b(x16('D5 F5 Bb5 D6 Bb5 F5 Bb5 D6'), 'F6:1 D6:1'),
      b(x16('D5 G5 Bb5 D6 Bb5 G5 Bb5 D6'), 'G6:2'),
      b(x16('C#5 E5 A5 C#6 A5 E5 A5 C#6'), 'E6:1 C#6:1'),
      b(x16('E6 C#6 A5 E5 C#6 A5 E5 C#5'), 'A4:2'),
    ],
  },
  {
    no: 14,
    name: '駆ける蹄',
    desc: '「タッタカ」のギャロップで、前半は回りながら降り、後半は回りながら昇る。',
    chords: RUN2,
    bars: [
      'D6:0.5 C6:0.25 D6:0.25 A5:0.5 G5:0.25 A5:0.25 F5:0.5 E5:0.25 F5:0.25 D5:1',
      'E6:0.5 D6:0.25 E6:0.25 C6:0.5 B5:0.25 C6:0.25 G5:0.5 F5:0.25 G5:0.25 E5:1',
      'F6:0.5 E6:0.25 F6:0.25 D6:0.5 C6:0.25 D6:0.25 Bb5:0.5 A5:0.25 Bb5:0.25 F5:1',
      'E6:0.5 D6:0.25 E6:0.25 C#6:0.5 B5:0.25 C#6:0.25 A5:2',
      'D5:0.5 E5:0.25 F5:0.25 A5:0.5 Bb5:0.25 A5:0.25 D6:0.5 E6:0.25 D6:0.25 F6:1',
      'C5:0.5 D5:0.25 E5:0.25 G5:0.5 A5:0.25 G5:0.25 C6:0.5 D6:0.25 C6:0.25 E6:1',
      'Bb4:0.5 C5:0.25 D5:0.25 F5:0.5 G5:0.25 F5:0.25 Bb5:0.5 C6:0.25 Bb5:0.25 D6:1',
      'A4:0.5 B4:0.25 C#5:0.25 E5:0.5 F#5:0.25 E5:0.25 A5:2',
    ],
  },
  {
    no: 15,
    name: '回る音',
    desc: '「上・元・下・元」とくるりと回る音（ターン）でつなぐ。後半は 1 段高い所で回る。',
    chords: RUN2,
    bars: [
      b(x16('E6 D6 C#6 D6'), x8('A5 F5'), x16('G5 F5 E5 F5'), x8('D5 A5')),
      b(x16('D6 C6 B5 C6'), x8('G5 E5'), x16('F5 E5 D5 E5'), x8('C5 G5')),
      b(x16('C6 Bb5 A5 Bb5'), x8('F5 D5'), x16('E5 D5 C#5 D5'), x8('Bb4 F5')),
      b(x16('B5 A5 G#5 A5'), x8('E5 C#5'), 'A4:2'),
      b(x16('G6 F6 E6 F6'), x8('D6 A5'), x16('B5 A5 G#5 A5'), x8('F5 D6')),
      b(x16('F6 E6 D#6 E6'), x8('C6 G5'), x16('A5 G5 F#5 G5'), x8('E5 C6')),
      b(x16('E6 D6 C#6 D6'), x8('Bb5 F5'), x16('G5 F5 E5 F5'), x8('D5 Bb5')),
      b(x16('D6 C#6 B5 C#6'), x8('A5 E5'), 'C#6:1 A5:1'),
    ],
  },
  {
    no: 16,
    name: '石の階段',
    desc: '4 音ずつのまとまりを 1 段ずつずらして昇っていく階段。最後に頂上から一気に降りる。',
    chords: RISE,
    bars: [
      x16('D5 E5 F5 G5 E5 F5 G5 A5 F5 G5 A5 Bb5 G5 A5 Bb5 C6'),
      b(x16('A5 Bb5 C6 D6 Bb5 C6 D6 E6'), 'C6:1 G5:1'),
      x16('F5 G5 A5 Bb5 G5 A5 Bb5 C6 A5 Bb5 C6 D6 Bb5 C6 D6 F6'),
      b(x16('E6 D6 C#6 Bb5 A5 G5 F5 E5'), 'C#5:1 A4:1'),
      b(x16('G5 A5 Bb5 C6 A5 Bb5 C6 D6'), 'Bb5:1 G5:1'),
      b(x16('A5 Bb5 C6 D6 Bb5 C6 D6 E6'), 'C6:1 A5:1'),
      x16('Bb5 C6 D6 E6 C6 D6 E6 F6 D6 E6 F6 G6 E6 F6 G6 A6'),
      b(x16('A6 G6 F6 E6 D6 C#6 Bb5 A5'), 'E5:1 C#5:1'),
    ],
  },
  {
    no: 17,
    name: 'うねり',
    desc: '8 分で 1 小節に 1 回、山を描いて上って下りる。後半は山が高くなる。',
    chords: RUN2,
    bars: [
      x8('D5 F5 A5 C6 D6 C6 A5 F5'),
      x8('E5 G5 C6 D6 E6 D6 C6 G5'),
      x8('F5 Bb5 D6 E6 F6 E6 D6 Bb5'),
      b(x8('E5 A5 C#6 E6'), 'A6:1 E6:1'),
      x8('A5 D6 F6 A6 F6 D6 A5 F5'),
      x8('G5 C6 E6 G6 E6 C6 G5 E5'),
      x8('F5 Bb5 D6 F6 D6 Bb5 F5 D5'),
      b(x8('E5 A5 C#6 E6'), 'C#6:1 A5:1'),
    ],
  },
  {
    no: 18,
    name: '打ち鳴らす鐘',
    desc: '高い音を 3 回打ち鳴らしてから跳ね上がる。鐘楼の鐘のように、同じ形を高さを変えて繰り返す。',
    chords: RUN2,
    bars: [
      'D6:0.5 D6:0.5 D6:0.5 A5:0.5 F6:1 D6:1',
      'E6:0.5 E6:0.5 E6:0.5 C6:0.5 G6:1 E6:1',
      'D6:0.5 D6:0.5 D6:0.5 Bb5:0.5 F6:1 D6:1',
      'C#6:0.5 C#6:0.5 C#6:0.5 A5:0.5 E6:2',
      'F6:0.5 F6:0.5 F6:0.5 D6:0.5 A6:1 F6:1',
      'E6:0.5 E6:0.5 E6:0.5 C6:0.5 G6:1 E6:1',
      'D6:0.5 D6:0.5 D6:0.5 Bb5:0.5 F6:1 Bb5:1',
      'C#6:0.5 E6:0.5 A6:0.5 E6:0.5 C#6:1 A5:1',
    ],
  },
  {
    no: 19,
    name: 'オルガンとギターの交代',
    desc: '今の B メロの弾き方で、オルガンとギターが 1 小節ずつ交代しながら駆け上がる。',
    chords: RUN2,
    parts: [
      {
        inst: 'organ',
        vol: 0.36,
        bars: [
          b(x16('D6 C6 A5 F5'), x8('D5 F5 A5 D6'), 'F6:1'),
          '-:4',
          b(x16('F6 D6 Bb5 F5'), x8('D5 F5 Bb5 D6'), 'F6:1'),
          '-:4',
          b(x16('F6 E6 D6 A5'), x8('F5 A5 D6 F6'), 'A6:1'),
          '-:4',
          b(x16('D6 C6 Bb5 F5'), x8('D5 F5 Bb5 D6'), 'F6:1'),
          '-:4',
        ],
      },
      {
        inst: 'guitarLead',
        vol: 0.36,
        bars: [
          '-:4',
          b(x16('E5 G5 C6 E6'), x8('G6 E6 C6 G5'), 'E5:1'),
          '-:4',
          b(x16('E5 A5 C#6 E6'), x8('A6 E6'), 'C#6:2'),
          '-:4',
          b(x16('G5 C6 E6 G6'), x8('E6 C6 G5 E5'), 'C5:1'),
          '-:4',
          b(x16('C#6 E6 A6 E6'), x8('C#6 A5'), 'E5:1 C#5:1'),
        ],
      },
    ],
  },
  {
    no: 20,
    name: '間で刻む',
    desc: '短い音と休符で、すき間を聞かせる。後半は回る音を足して少しずつ埋めていく。',
    chords: RUN2,
    bars: [
      'D6:0.5 -:0.5 A5:0.5 -:0.5 F6:1 -:1',
      'E6:0.5 -:0.5 C6:0.5 -:0.5 G6:1 -:1',
      'F6:0.5 -:0.5 D6:0.5 -:0.5 Bb5:1 -:1',
      'E6:0.5 -:0.5 C#6:0.5 -:0.5 A5:2',
      b(x16('D6 E6 F6 E6'), 'D6:0.5 -:0.5 A5:1 -:1'),
      b(x16('C6 D6 E6 D6'), 'C6:0.5 -:0.5 G5:1 -:1'),
      b(x16('Bb5 C6 D6 C6'), 'Bb5:0.5 -:0.5 F6:1 -:1'),
      b(x16('A5 Bb5 C#6 E6'), 'A6:1 E6:1 C#6:1'),
    ],
  },
  {
    no: 21,
    name: '静から動へ',
    desc: '前半は長い音だけで静かに。後半は 16 分で一気に駆け上がって、ためへ飛び込む。',
    chords: RISE,
    bars: [
      'D6:2 A5:2',
      'C6:2 G5:2',
      'Bb5:2 F5:2',
      'A5:2 E5:1 C#5:1',
      b(x16('G5 A5 Bb5 C6 D6 C6 Bb5 A5 G5 Bb5 D6 G6'), 'D6:1'),
      b(x16('A5 B5 C6 D6 E6 D6 C6 B5 A5 C6 E6 A6'), 'E6:1'),
      b(x16('Bb5 C6 D6 E6 F6 E6 D6 C6 Bb5 D6 F6 Bb6'), 'F6:1'),
      b(x16('A6 G6 F6 E6 D6 C#6 Bb5 A5'), 'E5:1 C#5:1'),
    ],
  },
  {
    no: 22,
    name: '嵐のあとの凪',
    desc: '前半は 16 分の刻みで激しく、後半は長い音で大きく歌う（静から動への逆）。',
    chords: RUN2,
    bars: [
      x16('D6 A5 F5 A5 D6 A5 F5 A5 E6 A5 F5 A5 E6 A5 F5 A5'),
      x16('C6 G5 E5 G5 C6 G5 E5 G5 D6 G5 E5 G5 D6 G5 E5 G5'),
      x16('Bb5 F5 D5 F5 Bb5 F5 D5 F5 C6 F5 D5 F5 C6 F5 D5 F5'),
      b(x16('A5 E5 C#5 E5 A5 E5 C#5 E5'), 'C#6:1 E6:1'),
      'F6:2 D6:2',
      'E6:2 C6:2',
      'D6:2 Bb5:1 D6:1',
      'C#6:3 A5:1',
    ],
  },
  {
    no: 23,
    name: '異国の回廊',
    desc: 'シ♭とド♯の広い音程（増 2 度）を使った、異国風の旋律。',
    chords: ['Dm', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A', 'A'],
    bars: [
      x8('D5 E5 F5 E5 D5 C#5 D5 A5'),
      x8('Bb5 A5 G5 F5 G5 A5 Bb5 D6'),
      b(x8('C#6 Bb5 A5 G5 F5 E5'), 'C#5:1'),
      b(x8('D5 F5 A5 C#6'), 'D6:2'),
      x8('F6 E6 D6 C#6 D6 F6 Bb5 D6'),
      x8('G6 F6 E6 D6 C#6 D6 Bb5 G5'),
      x8('A5 Bb5 C#6 D6 E6 F6 E6 C#6'),
      b(x8('Bb5 A5 G5 F5'), 'E5:1 C#5:1'),
    ],
  },
  {
    no: 24,
    name: '4 度の連鎖',
    desc: 'A メロの頭の「ラ→レ」（4 度上がる音）を 1 段ずつ下げてつなぐ。後半は 16 分に詰めて畳みかける。',
    chords: RUN2,
    bars: [
      'A5:0.5 D6:1 E6:0.5 F6:1 D6:1',
      'G5:0.5 C6:1 D6:0.5 E6:1 C6:1',
      'F5:0.5 Bb5:1 C6:0.5 D6:1 Bb5:1',
      'E5:0.5 A5:1 B5:0.5 C#6:2',
      b(x16('A5 D6 E6 F6 A5 D6 E6 F6'), x8('A6 F6'), 'D6:1'),
      b(x16('G5 C6 D6 E6 G5 C6 D6 E6'), x8('G6 E6'), 'C6:1'),
      b(x16('F5 Bb5 C6 D6 F5 Bb5 C6 D6'), x8('F6 D6'), 'Bb5:1'),
      b(x16('E5 A5 B5 C#6 E5 A5 B5 C#6'), 'E6:1 A5:1'),
    ],
  },
  {
    no: 25,
    name: '付点の下り坂',
    desc: 'サビと同じ付点の「ター・ター・タ」で 1 段ずつ降り、後半は同じ形で 1 段ずつ昇る。',
    chords: RISE,
    bars: [
      'F6:0.75 E6:0.75 D6:0.5 A5:1 F6:1',
      'E6:0.75 D6:0.75 C6:0.5 G5:1 E6:1',
      'D6:0.75 C6:0.75 Bb5:0.5 F5:1 D6:1',
      'C#6:0.75 B5:0.75 A5:0.5 E5:1 C#6:1',
      'D6:0.75 C6:0.75 Bb5:0.5 G5:1 D6:1',
      'E6:0.75 D6:0.75 C6:0.5 A5:1 E6:1',
      'F6:0.75 E6:0.75 D6:0.5 Bb5:1 F6:1',
      'E6:0.75 D6:0.75 C#6:0.5 A5:0.5 E5:0.5 C#5:1',
    ],
  },
  {
    no: 26,
    name: 'バロックの模倣',
    desc: '「回って・跳ねて」の 1 小節の動機を、コードに合わせて写していくバロック風。',
    chords: ['Dm', 'Bb', 'C', 'A', 'Bb', 'Gm', 'A', 'A'],
    bars: [
      b(x16('D6 C6 D6 A5'), x8('F5 A5'), 'D6:1 C6:1'),
      b(x16('Bb5 A5 Bb5 F5'), x8('D5 F5'), 'Bb5:1 A5:1'),
      b(x16('C6 Bb5 C6 G5'), x8('E5 G5'), 'C6:1 Bb5:1'),
      b(x16('A5 G5 A5 E5'), x8('C#5 E5'), 'A5:2'),
      b(x16('F6 E6 F6 D6'), x8('Bb5 D6'), 'F6:1 E6:1'),
      b(x16('D6 C6 D6 Bb5'), x8('G5 Bb5'), 'D6:1 C6:1'),
      b(x16('C#6 B5 C#6 A5'), x8('E5 A5'), 'C#6:1 E6:1'),
      b(x16('A6 G6 F6 E6'), x8('D6 C#6'), 'A5:2'),
    ],
  },
  {
    no: 27,
    name: '重ねた刃',
    desc: 'オルガンとギターが同じ旋律をユニゾンで。低い音を軸にしたリフで押していく。',
    chords: RUN2,
    unison: ['organ', 'guitarLead'],
    bars: [
      x8('D5 D5 A5 D5 C6 D5 A5 F5'),
      x8('C5 C5 G5 C5 Bb5 C5 G5 E5'),
      x8('Bb4 Bb4 F5 Bb4 A5 Bb4 F5 D5'),
      x8('A4 A4 E5 A4 G5 A4 C#5 E5'),
      x8('D5 D5 A5 D5 D6 D5 C6 A5'),
      x8('C5 C5 G5 C5 C6 C5 Bb5 G5'),
      x8('Bb4 Bb4 F5 Bb4 Bb5 Bb4 A5 F5'),
      b(x8('A4 C#5 E5 A5 C#6 E6'), 'A6:1'),
    ],
  },
  {
    no: 28,
    name: '長音と駆け上がり',
    desc: '長い音を伸ばしてから、16 分と 8 分で次の小節へ駆け上がる。毎小節が助走になる。',
    chords: RUN2,
    bars: [
      b('D6:2', x16('F5 G5 A5 Bb5'), x8('C6 D6')),
      b('E6:2', x16('E5 F5 G5 A5'), x8('Bb5 C6')),
      b('D6:2', x16('D5 E5 F5 G5'), x8('A5 Bb5')),
      'C#6:2 A5:2',
      b('A5:2', x16('A5 Bb5 C6 D6'), x8('E6 F6')),
      b('G6:2', x16('G5 A5 Bb5 C6'), x8('D6 E6')),
      b('F6:2', x16('F5 G5 A5 Bb5'), x8('C6 D6')),
      'E6:2 C#6:1 A5:1',
    ],
  },
  {
    no: 29,
    name: '3・3・2 の下り',
    desc: '和音を上から 3 つずつ降りる 8 分を 3・3・2 に区切り、拍とずらして転がす。',
    chords: RUN2,
    bars: [
      x8('D6 A5 F5 D6 A5 F5 D6 A5'),
      x8('E6 C6 G5 E6 C6 G5 E6 C6'),
      x8('F6 D6 Bb5 F6 D6 Bb5 F6 D6'),
      b(x8('E6 C#6 A5 E6 C#6 A5'), 'E5:1'),
      x8('F6 D6 A5 F6 D6 A5 F6 D6'),
      x8('G6 E6 C6 G6 E6 C6 G6 E6'),
      x8('D6 Bb5 F5 D6 Bb5 F5 D6 Bb5'),
      b(x8('C#6 A5 E5 C#6 A5 E5'), 'A5:1'),
    ],
  },
  {
    no: 30,
    name: '止まらない指',
    desc: '8 小節ずっと 16 分で弾き続ける。前半は高い所で回り、後半は低い所でうねる。',
    chords: RUN2,
    bars: [
      x16('D6 E6 F6 E6 D6 C6 A5 C6 D6 E6 F6 G6 A6 G6 F6 E6'),
      x16('C6 D6 E6 D6 C6 Bb5 G5 Bb5 C6 D6 E6 F6 G6 F6 E6 D6'),
      x16('Bb5 C6 D6 C6 Bb5 A5 F5 A5 Bb5 C6 D6 E6 F6 E6 D6 C6'),
      x16('A5 B5 C#6 B5 A5 G5 E5 G5 A5 B5 C#6 D6 E6 D6 C#6 B5'),
      x16('A5 G5 F5 G5 A5 Bb5 A5 G5 F5 E5 D5 E5 F5 G5 A5 C6'),
      x16('G5 F5 E5 F5 G5 A5 G5 F5 E5 D5 C5 D5 E5 F5 G5 Bb5'),
      x16('F5 E5 D5 E5 F5 G5 F5 E5 D5 C5 Bb4 C5 D5 E5 F5 A5'),
      b(x16('E5 F5 G5 A5 Bb5 A5 G5 F5 E5 F5 G5 A5'), 'C#6:1'),
    ],
  },
];

/** 1 小節ずつ 4 拍かを確かめる（全体の拍数だけでは、小節の境目のずれに気づけないため）。 */
const checkBars = (run, list) =>
  list.forEach((text, i) => {
    const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
    if (Math.abs(beats - 4) > 1e-9) throw new Error(`B メロ案 ${run.no} の ${i + 1} 小節目: ${beats} 拍`);
  });

const runParts = (run) => {
  if (run.parts) {
    run.parts.forEach((part) => checkBars(run, part.bars));
    return run.parts.map(({ bars: list, ...part }) => ({ ...part, notes: join4(...list) }));
  }
  checkBars(run, run.bars);
  const notes = join4(...run.bars);
  const insts = run.unison ?? ['organ'];
  return insts.map((inst) => ({ inst, vol: run.unison ? 0.3 : 0.36, notes }));
};

const verseTail = {
  ...verse,
  chords: bars(...VERSE_CHORDS.slice(4)),
  parts: verse.parts.map((part) => ({ ...part, notes: join4(...VERSE_BARS.slice(4)) })),
};

export const RUN_DRAFTS = RUNS.map((run) => ({
  file: `run-draft-${pad2(run.no)}`,
  bpm: BOSS_BPM,
  mix: BOSS_MIX,
  sections: [
    verseTail,
    { name: 'run', chords: bars(...run.chords), parts: runParts(run), comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' },
    build,
  ],
}));

export const writeRunDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'run',
    label: 'B メロ案',
    script: 'scripts/bgm-run-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 5 弾: 三つの旗 −試− の B メロを倍の 8 小節にした旋律の案 30 個（音源は A メロ後半 + B メロ + ため）。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: RUNS.map((run) => ({ no: run.no, name: run.name, desc: run.desc, bpm: BOSS_BPM })),
  });
