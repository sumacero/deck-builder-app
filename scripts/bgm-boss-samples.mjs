// ボス戦の候補 10 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 編成は 10 曲とも同じ。サンプル 1「鉄門の行進」（金管・刻み）と、章のボス戦「三つの旗 −試−」（ギター・長い歌）の中間。
// 違うのは旋律だけ。鉄門の跳躍と、章ボスの A メロ・B メロの音の動きを、曲ごとに別のつなぎ方で混ぜる。サビは入れない。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4 } from './bgm-song.mjs';

const BPM = 145;
const MIX = { reverbLevel: 0.42, tone: 0.58, echoLevel: 0.2 };
const INTRO = ['Dm', 'Bb C', 'Dm', 'A'];
const VERSE = ['Dm', 'C', 'Bb', 'A'];
const RUN = ['Dm', 'Gm', 'C', 'F'];
const TAG = ['Bb', 'Gm', 'A', 'A'];

/** 金管が歌い、1 オクターブ下のギターが同じ旋律をなぞる。ドラムは 8 ビート、伴奏は刻みとオルガン。 */
const section = (name, chords, melody, fill) => ({
  name,
  chords: bars(...chords),
  parts: [
    { inst: 'brassLead', vol: 0.34, notes: melody },
    { inst: 'guitarLead', vol: 0.24, notes: shiftPhrase(melody, -1) },
  ],
  comp: ['chug', 'organ'],
  bass: 'gallop',
  drums: 'rock',
  level: 0.88,
  ...(fill ? { fill } : { crash: name !== 'intro' }),
});

const song = (n, intro, verse, run, tag) => ({
  file: `boss-sample-${String(n).padStart(2, '0')}`,
  bpm: BPM,
  mix: MIX,
  sections: [
    section('intro', INTRO, intro),
    section('verse', VERSE, verse),
    section('run', RUN, run),
    section('tag', TAG, tag, 'snare'),
  ],
});

const phrase = (...barsText) => join4(...barsText);

export const BOSS_SAMPLE_SONGS = [
  // 1. 奇数小節は鉄門の跳躍、偶数小節は章ボスの順次下行。
  song(
    1,
    phrase('D5:1 F5:0.5 A5:0.5 D6:0.5 C6:0.5 Bb5:1', 'E5:1.5 C5:0.5 G4:1 C5:1', 'D5:1 F5:1 A5:0.5 G5:0.5 F5:1', 'A5:1.5 G5:0.5 E5:1 C#5:1'),
    phrase('D5:1 F5:0.5 A5:0.5 D6:2', 'E5:1 C5:1 G4:1 C5:1', 'F5:0.5 G5:0.5 A5:1 Bb5:1 A5:1', 'A5:2 E5:1 C#5:1'),
    phrase('A5:2 F5:2', 'Bb5:2 G5:1 D5:1', 'G5:1 E5:1 C5:2', 'A5:1 F5:1 E5:1 C#5:1'),
    phrase('D5:1 F5:1 A5:2', 'Bb5:1 A5:1 G5:2', 'A5:1 G5:0.5 F5:0.5 E5:2', 'E5:1 C#5:1 A4:2'),
  ),
  // 2. 章ボス A メロの音の順番を、鉄門の細かい符割に乗せ替える。
  song(
    2,
    phrase('A4:1 D5:0.5 E5:0.5 F5:0.5 G5:0.5 A5:1', 'E5:1 C5:0.5 G4:0.5 C5:0.5 E5:0.5 G5:1', 'D5:1 F5:0.5 G5:0.5 Bb5:0.5 A5:0.5 G5:1', 'A5:1 G5:0.5 E5:0.5 C#5:0.5 A4:0.5 E5:1'),
    phrase('A4:1.5 D5:0.5 F5:2', 'E5:1 C5:1 D5:1 E5:1', 'F5:1 G5:1 Bb5:1 A5:1', 'G5:1 E5:1 C#5:2'),
    phrase('F5:3 A5:1', 'G5:2 Bb5:1 D6:1', 'E5:2 C5:2', 'F5:1 A5:1 C6:1 A5:1'),
    phrase('Bb5:2 A5:1 G5:1', 'A5:1 F5:1 D5:2', 'E5:0.5 F5:0.5 G5:1 A5:2', 'C#5:2 A4:2'),
  ),
  // 3. 鉄門の五度の跳躍を三度に縮める。
  song(
    3,
    phrase('D5:1 F5:1 A5:1 F5:1', 'A5:1 G5:1 F5:1 E5:1', 'F5:1 A5:1 C6:1 A5:1', 'G5:1 E5:1 C#5:2'),
    phrase('D5:0.5 F5:0.5 A5:1 F5:1 D5:1', 'E5:1 G5:1 E5:1 C5:1', 'F5:1 A5:1 Bb5:1 G5:1', 'A5:1 E5:1 C#5:2'),
    phrase('D5:2 F5:1 A5:1', 'Bb5:2 A5:2', 'G5:2 E5:1 C5:1', 'A5:2 C#5:2'),
    phrase('F5:1 A5:1 D6:2', 'C6:1 Bb5:1 A5:2', 'G5:1 F5:1 E5:2', 'E5:2 C#5:2'),
  ),
  // 4. 章ボスの上行を折り返して、最初から下りる。
  song(
    4,
    phrase('A5:1 F5:0.5 E5:0.5 D5:0.5 C5:0.5 Bb4:1', 'G5:1.5 E5:0.5 C5:1 G4:1', 'Bb5:1.5 A5:0.5 G5:1 F5:1', 'E5:1 C#5:1 A4:2'),
    phrase('D6:1 A5:1 F5:1 D5:1', 'C6:1 G5:1 E5:1 C5:1', 'Bb5:1 F5:1 D5:1 Bb4:1', 'A5:1 E5:1 C#5:2'),
    phrase('F5:2 D5:2', 'G5:2 Bb4:2', 'E5:2 C5:2', 'D5:2 A4:2'),
    phrase('A5:2 F5:2', 'G5:1 E5:1 C5:2', 'F5:1 D5:1 Bb4:2', 'E5:2 C#5:2'),
  ),
  // 5. 章ボス B メロの音を、鉄門のように細かく刻んでから、レから始まる長い歌にまとめる。
  song(
    5,
    phrase('A5:1 F5:0.5 A5:0.5 Bb5:0.5 A5:0.5 G5:1', 'G5:1 E5:0.5 C5:0.5 F5:0.5 A5:0.5 C6:1', 'D6:1 C6:0.5 Bb5:0.5 G5:0.5 D5:0.5 Bb5:1', 'E5:1 A5:0.5 C#6:0.5 A5:0.5 E5:0.5 C#5:1'),
    phrase('F5:1 A5:1 C6:1 A5:1', 'Bb5:0.5 A5:0.5 G5:1 D5:1 Bb4:1', 'G5:1 E5:1 C5:1 E5:1', 'A5:2 F5:1 E5:1'),
    phrase('D5:3 F5:1', 'G5:2 F5:1 E5:1', 'E5:2 C5:1 A4:1', 'D5:1 F5:2 A5:1'),
    phrase('C6:1 A5:1 F5:2', 'Bb5:2 G5:2', 'A5:1 G5:1 E5:2', 'C#5:4'),
  ),
  // 6. 毎小節の頭はレ・ファ・ラの同じ動機。答えの音だけが章ボスの順次に変わる。
  song(
    6,
    phrase('D5:0.5 F5:0.5 A5:1 E5:1 C5:1', 'D5:0.5 F5:0.5 A5:1 G4:1 C5:1', 'D5:0.5 F5:0.5 A5:1 Bb5:1 A5:1', 'D5:0.5 F5:0.5 A5:1 C#5:2'),
    phrase('D5:0.5 F5:0.5 A5:1 C6:1 A5:1', 'D5:0.5 F5:0.5 A5:1 G5:1 E5:1', 'D5:0.5 F5:0.5 A5:1 Bb5:1 G5:1', 'D5:0.5 F5:0.5 A5:1 E5:2'),
    phrase('D5:0.5 F5:0.5 A5:1 F5:2', 'D5:0.5 F5:0.5 A5:1 G4:1 C5:1', 'D5:0.5 F5:0.5 A5:1 Bb5:2', 'D5:0.5 F5:0.5 A5:1 C#5:2'),
    phrase('D5:0.5 F5:0.5 A5:1 A4:2', 'D5:0.5 F5:0.5 A5:1 C5:1 E5:1', 'D5:0.5 F5:0.5 A5:1 Bb5:1 G5:1', 'D5:0.5 F5:0.5 A5:1 C#6:2'),
  ),
  // 7. 章ボス導入の「鳴らして休む」リズムに、鉄門のレ・ファ・ラを載せる。
  song(
    7,
    phrase('D5:0.5 -:0.5 F5:0.5 -:0.5 A5:0.5 D6:0.5 C6:0.5 Bb5:0.5', 'Bb5:1 -:0.5 D5:0.5 -:0.5 F5:0.5 A5:1', 'A5:0.5 -:0.5 A5:0.5 -:0.5 C6:0.5 Bb5:0.5 A5:0.5 F5:0.5', 'E5:0.5 F5:0.5 G5:0.5 A5:0.5 C#6:2'),
    phrase('D5:1 A5:1 F5:2', 'E5:1 C5:2 G4:1', 'F5:1 Bb5:1 A5:2', 'G5:1 E5:1 C#5:2'),
    phrase('A5:0.5 -:0.5 F5:0.5 -:0.5 D5:2', 'Bb5:0.5 -:0.5 G5:0.5 -:0.5 D5:2', 'C5:0.5 -:0.5 E5:0.5 -:0.5 G5:2', 'A4:0.5 -:0.5 C#5:0.5 -:0.5 E5:2'),
    phrase('D6:1 -:1 C6:1 Bb5:1', 'A5:2 G5:2', 'F5:1 E5:1 D5:2', 'C#5:4'),
  ),
  // 8. 鉄門と章ボスから 1 音ずつ取り、間は新しい経過音でつなぐ。
  song(
    8,
    phrase('D5:1 A5:1 F5:0.5 E5:0.5 D5:1', 'C5:1 G4:1 E5:1 C5:1', 'F5:1 D5:0.5 G5:0.5 Bb5:1 A5:1', 'A5:1 E5:1 C#5:2'),
    phrase('F5:1 C6:1 A5:0.5 G5:0.5 F5:1', 'E5:1 C5:1 G5:1 E5:1', 'A5:1 F5:0.5 Bb5:0.5 D6:1 C6:1', 'C#6:1 A5:1 E5:2'),
    phrase('F5:2 A5:1 D6:1', 'G5:2 Bb5:2', 'E5:1 C5:1 G5:2', 'A5:2 E5:2'),
    phrase('D5:1 F5:1 G5:1 A5:1', 'Bb5:1 A5:1 G5:1 F5:1', 'E5:2 C#5:1 A4:1', 'D5:4'),
  ),
  // 9. 着地の音は章ボス B メロ。その前に鉄門のように五度下から跳ねる。
  song(
    9,
    phrase('E5:0.5 A5:1.5 F5:0.5 A5:1.5', 'F5:0.5 Bb5:1.5 D5:0.5 G5:1.5', 'C5:0.5 G5:1.5 G4:0.5 C5:1.5', 'D5:0.5 A5:2 C#5:1.5'),
    phrase('A4:0.5 D5:1.5 C5:0.5 F5:1.5', 'G4:0.5 C5:1.5 E5:0.5 A5:1.5', 'Bb4:0.5 F5:1.5 A4:0.5 E5:1.5', 'E4:0.5 C#5:3.5'),
    phrase('D5:1 A5:3', 'F5:1 Bb5:3', 'E5:1 C6:3', 'C#5:1 A5:3'),
    phrase('A5:1 F5:1 D5:2', 'G5:1 E5:1 C5:2', 'F5:1 D5:1 Bb4:2', 'E5:1 C#5:3'),
  ),
  // 10. レ・ファ・ラ・シ♭・ド♯だけを使った、どちらにも無かった新しい旋律。
  song(
    10,
    phrase('F5:1 A5:1 D6:0.5 C#6:0.5 Bb5:1', 'A5:0.5 Bb5:0.5 F5:1 D5:0.5 A4:0.5 C#5:1', 'D5:1 F5:2 A5:1', 'C#5:1 F5:1 A5:2'),
    phrase('Bb5:1 A5:0.5 Bb5:0.5 F5:1 D5:1', 'D6:0.5 C#6:0.5 Bb5:1 A5:2', 'A5:1 F5:1 D5:1 A4:1', 'C#5:2 F5:1 A4:1'),
    phrase('F5:1.5 A5:0.5 D5:2', 'Bb5:1 A5:1 D6:1 Bb5:1', 'D5:1.5 F5:0.5 A5:2', 'A5:1 F5:1 D5:2'),
    phrase('Bb5:1 D6:1 F6:1 D6:1', 'A5:1 C#6:1 F6:2', 'F5:1 A5:1 D6:1 A5:1', 'F5:2 C#5:2'),
  ),
];

for (const sample of BOSS_SAMPLE_SONGS) {
  for (const part of sample.sections.flatMap((item) => item.parts)) {
    const barsText = part.notes.split('|');
    barsText.forEach((text, index) => {
      const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
      if (Math.abs(beats - 4) > 1e-9) {
        throw new Error(`${sample.file} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
      }
    });
  }
}
