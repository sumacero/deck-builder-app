// ボス戦の候補 10 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 編成は 10 曲とも同じ。サンプル 1「鉄門の行進」（金管・ツーバス・刻み、150 BPM）のあとに、短い溜めと 8 小節のサビ。
// サビはラスボス曲の雰囲気（付点の「レー・ドー・シ♭」、金管と 1 オクターブ下のギター）だけ借りる。
// ツーバス・ハモり・2 回しは付けず、音量もラスボスのサビより低い。ラスボスのサビ旋律そのものは使わない。
// 違うのは旋律だけ。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4 } from './bgm-song.mjs';

const BPM = 150;
const MIX = { reverbLevel: 0.38, tone: 0.64, echoLevel: 0.16 };
const MARCH = ['Dm', 'Bb', 'F', 'A', 'Dm', 'Bb', 'F', 'A'];
const LIFT = ['Gm', 'A', 'Bb', 'A'];
const CHORUS = ['Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F A', 'A'];

const phrase = (...barsText) => join4(...barsText);

/** 鉄門の行進。金管だけが歌い、ツーバスと刻み。 */
const march = (melody) => ({
  name: 'march',
  chords: bars(...MARCH),
  parts: [{ inst: 'brassLead', vol: 0.36, notes: melody }],
  comp: ['chug', 'brassHits'],
  bass: 'gallop',
  drums: 'double',
  level: 0.82,
  fill: 'snare',
});

/** サビの前の溜め。弦とハーフのドラムで、ラスボスの上り坂ほど押さない。 */
const lift = (melody) => ({
  name: 'lift',
  chords: bars(...LIFT),
  parts: [
    { inst: 'brassLead', vol: 0.28, notes: melody },
    { inst: 'guitarLead', vol: 0.16, notes: shiftPhrase(melody, -1) },
  ],
  comp: ['strings'],
  bass: 'sustain',
  drums: 'half',
  level: 0.68,
  crash: false,
});

/** サビ。付点で歌うが、ハモりもツーバスも無い。 */
const chorus = (melody) => ({
  name: 'chorus',
  chords: bars(...CHORUS),
  parts: [
    { inst: 'brassLead', vol: 0.34, notes: melody },
    { inst: 'guitarLead', vol: 0.18, notes: shiftPhrase(melody, -1) },
  ],
  comp: ['stabs', 'chug'],
  bass: 'drive8',
  drums: 'drive',
  level: 0.9,
  fill: 'snare',
});

const song = (n, marchMelody, liftMelody, chorusMelody) => ({
  file: `boss-sample-${String(n).padStart(2, '0')}`,
  bpm: BPM,
  mix: MIX,
  sections: [march(marchMelody), lift(liftMelody), chorus(chorusMelody)],
});

export const BOSS_SAMPLE_SONGS = [
  // 1. 鉄門の跳躍をそのまま歌い、サビは低いレから付点で開いてレで着地する。
  song(
    1,
    phrase(
      'D5:1 F5:0.5 A5:0.5 D6:0.5 C6:0.5 Bb5:1',
      'A5:1 G5:0.5 F5:0.5 E5:2',
      'F5:0.5 G5:0.5 A5:1 D6:1 C6:1',
      'A5:2 E5:1 C#5:1',
      'D5:0.5 F5:0.5 A5:1 D6:1 Bb5:1',
      'A5:1.5 G5:0.5 F5:1 E5:1',
      'F5:1 G5:1 A5:1 C6:1',
      'A5:1 E5:1 C#5:2',
    ),
    phrase('G5:2 A5:2', 'A5:1 C#6:1 E6:2', 'Bb5:2 D6:2', 'C#6:2 A5:2'),
    phrase(
      'D5:0.75 C5:0.75 Bb4:0.5 F5:1 D6:1',
      'E6:0.75 D6:0.75 C6:0.5 A5:1 F5:1',
      'C6:0.75 Bb5:0.75 A5:0.5 F5:1 D5:1',
      'A5:2 F5:1 E5:1',
      'Bb5:0.75 A5:0.75 G5:0.5 D5:1 F5:1',
      'G5:0.75 A5:0.75 Bb5:0.5 D6:1 C6:1',
      'A5:0.75 G5:0.75 F5:0.5 E5:1 D5:1',
      'C#5:2 A4:2',
    ),
  ),
  // 2. サビの付点を下行ではなく上行にする。
  song(
    2,
    phrase(
      'D5:1 F5:1 A5:1 C6:1',
      'Bb5:1 D6:1 F6:1 D6:1',
      'A5:0.5 C6:0.5 E6:1 D6:1 C6:1',
      'C#6:2 A5:1 E5:1',
      'F5:1 A5:1 D6:2',
      'D6:1 E6:1 F6:1 D6:1',
      'C6:1 A5:1 F5:1 D5:1',
      'E5:1 C#5:1 A4:2',
    ),
    phrase('Bb5:4', 'C6:4', 'D6:2 E6:2', 'C#6:4'),
    phrase(
      'D5:0.75 E5:0.75 F5:0.5 A5:1 D6:1',
      'E5:0.75 F5:0.75 G5:0.5 C6:1 E6:1',
      'C5:0.75 D5:0.75 E5:0.5 A5:1 C6:1',
      'D5:2 F5:1 A5:1',
      'Bb4:0.75 C5:0.75 D5:0.5 G5:1 Bb5:1',
      'C5:0.75 D5:0.75 E5:0.5 G5:1 C6:1',
      'F5:0.75 G5:0.75 A5:0.5 C6:1 D6:1',
      'E5:2 C#5:2',
    ),
  ),
  // 3. 鉄門の五度を三度に縮め、サビの付点も三度で積む。
  song(
    3,
    phrase(
      'D5:1 F5:1 A5:1 F5:1',
      'A5:1 G5:1 F5:1 E5:1',
      'F5:1 A5:1 C6:1 A5:1',
      'G5:1 E5:1 C#5:2',
      'D5:0.5 F5:0.5 A5:1 F5:1 D5:1',
      'G5:1 E5:1 C5:1 G4:1',
      'A5:1 C6:1 A5:1 F5:1',
      'E5:2 C#5:2',
    ),
    phrase('G5:1 Bb5:3', 'A5:2 C#6:2', 'Bb5:1 D6:3', 'C#6:2 A5:2'),
    phrase(
      'D5:0.75 F5:0.75 A5:0.5 F5:1 D6:1',
      'E5:0.75 G5:0.75 C6:0.5 G5:1 E6:1',
      'C5:0.75 E5:0.75 A5:0.5 E5:1 C6:1',
      'D5:2 A5:1 F5:1',
      'Bb4:0.75 D5:0.75 G5:0.5 D5:1 Bb5:1',
      'C5:0.75 E5:0.75 G5:0.5 E5:1 C6:1',
      'F5:0.75 A5:0.75 C6:0.5 A5:1 F5:1',
      'E5:1 C#5:1 A4:2',
    ),
  ),
  // 4. 行進もサビも長い音。付点はサビの頭だけ。
  song(
    4,
    phrase(
      'D5:2 F5:1 A5:1',
      'Bb5:2 A5:1 G5:1',
      'F5:1 A5:1 D6:2',
      'A5:2 E5:2',
      'D5:1 F5:1 A5:2',
      'G5:2 F5:1 E5:1',
      'A5:1 C6:1 Bb5:2',
      'C#5:4',
    ),
    phrase('G5:4', 'A5:4', 'Bb5:4', 'C#5:4'),
    phrase(
      'D6:0.75 C6:0.75 Bb5:0.5 A5:2',
      'E6:0.75 D6:0.75 C6:0.5 G5:2',
      'C6:2 A5:2',
      'D5:4',
      'Bb5:0.75 A5:0.75 G5:0.5 D5:2',
      'C6:2 E5:2',
      'F5:2 A5:2',
      'E5:2 C#5:2',
    ),
  ),
  // 5. 鉄門の音を休符で割り、サビの付点のあとも休む。
  song(
    5,
    phrase(
      'D5:1 -:0.5 F5:0.5 A5:0.5 -:0.5 D6:1',
      'A5:1 -:0.5 G5:0.5 F5:2',
      'F5:0.5 -:0.5 G5:0.5 A5:0.5 D6:1 C6:1',
      'A5:1 -:1 E5:1 C#5:1',
      'D5:0.5 -:0.5 F5:0.5 A5:0.5 D6:2',
      'Bb5:1 -:0.5 A5:0.5 G5:2',
      'F5:1 A5:1 -:0.5 C6:0.5 -:1',
      'E5:1 C#5:1 -:2',
    ),
    phrase('G5:1 -:1 Bb5:2', 'A5:2 -:0.5 C#6:1.5', 'Bb5:1.5 -:0.5 D6:2', 'C#6:2 -:2'),
    phrase(
      'D5:0.75 C5:0.75 Bb4:0.5 -:1 D5:1',
      'E5:0.75 D5:0.75 C5:0.5 -:1 E5:1',
      'A5:0.75 G5:0.75 F5:0.5 -:1 A5:1',
      'D6:1 -:1 A5:1 F5:1',
      'Bb5:0.75 A5:0.75 G5:0.5 -:1 Bb5:1',
      'C6:0.75 Bb5:0.75 A5:0.5 -:1 C6:1',
      'F5:1 -:0.5 A5:0.5 C6:1 -:1',
      'E5:1 C#5:1 A4:2',
    ),
  ),
  // 6. 行進は毎小節レ・ファ・ラ。サビは毎小節レー・ドー・シ♭。
  song(
    6,
    phrase(
      'D5:0.5 F5:0.5 A5:1 E5:1 C5:1',
      'D5:0.5 F5:0.5 A5:1 G5:1 F5:1',
      'D5:0.5 F5:0.5 A5:1 C6:1 A5:1',
      'D5:0.5 F5:0.5 A5:1 C#5:2',
      'D5:0.5 F5:0.5 A5:1 Bb5:1 G5:1',
      'D5:0.5 F5:0.5 A5:1 F5:2',
      'D5:0.5 F5:0.5 A5:1 D6:1 C6:1',
      'D5:0.5 F5:0.5 A5:1 E5:2',
    ),
    phrase('D5:0.5 F5:0.5 A5:1 G5:2', 'D5:0.5 F5:0.5 A5:1 C#6:2', 'D5:0.5 F5:0.5 A5:1 Bb5:2', 'D5:0.5 F5:0.5 A5:1 C#5:2'),
    phrase(
      'D5:0.75 C5:0.75 Bb4:0.5 F5:2',
      'D5:0.75 C5:0.75 Bb4:0.5 G5:1 E5:1',
      'D5:0.75 C5:0.75 Bb4:0.5 A5:2',
      'D5:0.75 C5:0.75 Bb4:0.5 F5:1 D5:1',
      'D5:0.75 C5:0.75 Bb4:0.5 G5:2',
      'D5:0.75 C5:0.75 Bb4:0.5 E5:1 C6:1',
      'D5:0.75 C5:0.75 Bb4:0.5 A5:1 F5:1',
      'D5:0.75 C5:0.75 Bb4:0.5 C#5:2',
    ),
  ),
  // 7. 着地の前に五度下から跳ね、サビはそこから付点で落ちる。
  song(
    7,
    phrase(
      'D5:0.5 A5:1.5 F5:0.5 C6:1.5',
      'E5:0.5 Bb5:1.5 G5:0.5 D6:1.5',
      'C5:0.5 G5:1.5 A4:0.5 E5:1.5',
      'A4:0.5 E5:3.5',
      'F5:0.5 C6:1.5 D5:0.5 A5:1.5',
      'G4:0.5 D5:1.5 Bb4:0.5 F5:1.5',
      'E5:0.5 A5:1.5 C5:0.5 G5:1.5',
      'D5:0.5 A5:2 C#5:1.5',
    ),
    phrase('G4:0.5 D5:3.5', 'A4:0.5 E5:3.5', 'Bb4:0.5 F5:3.5', 'E4:0.5 C#5:3.5'),
    phrase(
      'G4:0.5 D5:0.75 C5:0.75 Bb4:0.5 F5:1.5',
      'G4:0.5 E5:0.75 D5:0.75 C5:0.5 G5:1.5',
      'E4:0.5 C5:0.75 B4:0.75 A4:0.5 E5:1.5',
      'A4:0.5 D5:2 F5:1.5',
      'D5:0.5 Bb5:0.75 A5:0.75 G5:0.5 D6:1.5',
      'G4:0.5 C5:0.75 Bb4:0.75 A4:0.5 E5:1.5',
      'C5:0.5 F5:0.75 E5:0.75 D5:0.5 A5:1.5',
      'E4:0.5 C#5:3.5',
    ),
  ),
  // 8. 跳躍をやめて順次。サビの付点も音階のまま。
  song(
    8,
    phrase(
      'D5:1 E5:1 F5:1 G5:1',
      'A5:1 G5:1 F5:1 E5:1',
      'F5:0.5 G5:0.5 A5:0.5 Bb5:0.5 A5:1 G5:1',
      'A5:1 G5:1 E5:1 C#5:1',
      'D5:0.5 E5:0.5 F5:1 G5:1 A5:1',
      'Bb5:1 A5:1 G5:1 F5:1',
      'E5:1 F5:1 G5:1 A5:1',
      'G5:1 E5:1 C#5:2',
    ),
    phrase('G5:1 A5:1 Bb5:2', 'A5:1 C6:1 C#6:2', 'Bb5:1 C6:1 D6:2', 'C#6:2 A5:2'),
    phrase(
      'D5:0.75 E5:0.75 F5:0.5 G5:1 A5:1',
      'E5:0.75 F5:0.75 G5:0.5 A5:1 C6:1',
      'A5:0.75 G5:0.75 F5:0.5 E5:1 C5:1',
      'D5:2 F5:1 A5:1',
      'Bb5:0.75 A5:0.75 G5:0.5 F5:1 D5:1',
      'C6:0.75 Bb5:0.75 A5:0.5 G5:1 E5:1',
      'F5:0.75 G5:0.75 A5:0.5 Bb5:1 C6:1',
      'E5:2 C#5:2',
    ),
  ),
  // 9. 鉄門の音を逆から歌い、サビの後半は前半を折り返す。
  song(
    9,
    phrase(
      'Bb5:1 C6:0.5 D6:0.5 A5:0.5 F5:0.5 D5:1',
      'E5:2 F5:0.5 G5:0.5 A5:1',
      'C6:1 D6:1 A5:1 G5:0.5 F5:0.5',
      'C#5:1 E5:1 A5:2',
      'A5:1 G5:1 F5:0.5 E5:0.5 D5:1',
      'F5:2 E5:1 C5:1',
      'D6:1 C6:1 Bb5:1 A5:1',
      'E5:2 C#5:2',
    ),
    phrase('D6:4', 'C6:4', 'Bb5:4', 'C#6:2 A5:2'),
    phrase(
      'F6:0.75 E6:0.75 D6:0.5 C6:1 A5:1',
      'E6:0.75 D6:0.75 C6:0.5 Bb5:1 G5:1',
      'A5:0.75 G5:0.75 F5:0.5 C5:1 E5:1',
      'D5:2 A4:2',
      'A4:2 D5:2',
      'E5:1 C5:1 F5:0.5 G5:0.75 A5:0.75',
      'G5:1 Bb5:1 C6:0.5 D6:0.75 E6:0.75',
      'A5:1 C6:1 D6:0.5 E6:0.75 F6:0.75',
    ),
  ),
  // 10. レ・ファ・ラ・シ♭・ド♯だけ。付点もその五音。
  song(
    10,
    phrase(
      'F5:1 A5:1 D6:0.5 C#6:0.5 Bb5:1',
      'A5:0.5 Bb5:0.5 F5:1 D5:0.5 A4:0.5 C#5:1',
      'D5:1 F5:2 A5:1',
      'C#5:1 F5:1 A5:2',
      'Bb5:1 A5:0.5 Bb5:0.5 F5:1 D5:1',
      'D6:0.5 C#6:0.5 Bb5:1 A5:2',
      'A5:1 F5:1 D5:1 A4:1',
      'C#5:2 F5:1 A4:1',
    ),
    phrase('Bb5:4', 'C#6:4', 'D6:2 F6:2', 'C#5:4'),
    phrase(
      'D5:0.75 F5:0.75 A5:0.5 Bb5:1 D6:1',
      'F5:0.75 A5:0.75 Bb5:0.5 D6:1 F6:1',
      'A5:0.75 F5:0.75 D5:0.5 Bb4:1 A4:1',
      'D5:2 F5:1 A5:1',
      'Bb5:0.75 A5:0.75 F5:0.5 D5:1 Bb4:1',
      'C#5:0.75 D5:0.75 F5:0.5 A5:1 C#6:1',
      'A5:0.75 Bb5:0.75 D6:0.5 C#6:1 A5:1',
      'F5:2 C#5:2',
    ),
  ),
];

for (const sample of BOSS_SAMPLE_SONGS) {
  for (const section of sample.sections) {
    for (const part of section.parts) {
      const barsText = part.notes.split('|');
      if (barsText.length !== section.chords.length) {
        throw new Error(`${sample.file} ${section.name} ${part.inst}: ${barsText.length} 小節`);
      }
      barsText.forEach((text, index) => {
        const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
        if (Math.abs(beats - 4) > 1e-6) {
          throw new Error(`${sample.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍`);
        }
      });
    }
  }
}
