// 戦闘 BGM の試作 10 曲を合成して assets/music/trial/*.wav に書き出す。
// 実行: npm run bgm:trial
//
// オーナーの好きな 3 曲の「雰囲気」（テンポ・楽器・ノリ）を参考にしたオリジナル曲。旋律は流用していない。
// - T: テイルズ「剣を以って切り拓け」… 速いプログレ風ロック。オルガンと歪んだギター、駆けるベース、短調。
// - A: エターナルアルカディア「アルマダとの戦い」… 金管と弦のオーケストラ、行進のスネアとティンパニ、冒険の高揚感。
// - P: ポケモン サン・ムーン「戦闘！島キング・島クイーン」… 速いテンポ、シンセブラスの裏打ち、スラップベース、南国の打楽器。
//
// 曲はデータ（コード・旋律・伴奏 / ベース / ドラムの型）で書き、renderSong が 1 本の波形にする。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAMPLE_RATE, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, renderSong } from './bgm-song.mjs';
import { toWav } from './wav.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'music', 'trial');

// ===== 曲 =====

/** 01 剣閃の輪舞（T 寄り）。ホ短調 168 BPM。オルガンと歪みギターのユニゾンリフ → 歌うギター → 長調へ持ち上げるサビ → オルガンの速弾き。 */
const song01 = {
  file: 'trial-01',
  bpm: 168,
  mix: { drive: 0.5 },
  sections: [
    {
      name: 'intro',
      chords: bars('Em', 'C D', 'Em', 'B7'),
      parts: [
        {
          inst: 'guitarLead',
          vol: 0.36,
          notes: join4(
            'E4:0.5 B4:0.5 E5:0.5 B4:0.5 D5:0.5 B4:0.5 C5:0.5 B4:0.5',
            'C5:0.5 G4:0.5 E5:0.5 G4:0.5 D5:0.5 A4:0.5 F#5:0.5 A4:0.5',
            'G5:0.5 F#5:0.5 E5:0.5 D5:0.5 E5:0.5 B4:0.5 G4:0.5 B4:0.5',
            'D#5:0.5 F#5:0.5 A5:0.5 B5:0.5 D#5:1 F#5:0.5 B4:0.5',
          ),
        },
        {
          inst: 'organ',
          vol: 0.22,
          notes: join4(
            'E5:0.5 B5:0.5 E6:0.5 B5:0.5 D6:0.5 B5:0.5 C6:0.5 B5:0.5',
            'C6:0.5 G5:0.5 E6:0.5 G5:0.5 D6:0.5 A5:0.5 F#6:0.5 A5:0.5',
            'G6:0.5 F#6:0.5 E6:0.5 D6:0.5 E6:0.5 B5:0.5 G5:0.5 B5:0.5',
            'D#6:0.5 F#6:0.5 A6:0.5 B6:0.5 D#6:1 F#6:0.5 B5:0.5',
          ),
        },
      ],
      comp: ['chug'],
      bass: 'drive8',
      drums: 'rock',
      fill: 'toms',
    },
    {
      name: 'verse',
      chords: bars('Em', 'Em', 'C', 'D', 'Am', 'B7', 'Em', 'D'),
      parts: [
        {
          inst: 'guitarLead',
          vol: 0.4,
          notes: join4(
            'B4:1.5 E5:0.5 G5:1 F#5:1',
            'E5:1 D5:0.5 E5:0.5 B4:2',
            'C5:1.5 E5:0.5 G5:1 A5:1',
            'F#5:2 D5:1 A4:1',
            'A4:1 C5:1 E5:1 A5:1',
            'G5:0.5 F#5:0.5 D#5:1 B4:2',
            'E5:1.5 G5:0.5 B5:1 A5:0.5 G5:0.5',
            'F#5:1 E5:0.5 D5:0.5 F#5:2',
          ),
        },
      ],
      comp: ['organ', 'chug'],
      bass: 'drive8',
      drums: 'rock',
      fill: 'snare',
    },
    {
      name: 'chorus',
      chords: bars('C', 'D', 'Bm', 'Em', 'Am', 'D', 'C', 'B7'),
      parts: [
        {
          inst: 'organ',
          vol: 0.36,
          double: -1,
          notes: join4(
            'E5:0.5 G5:0.5 C6:2 B5:0.5 A5:0.5',
            'A5:1 F#5:1 D5:1 A5:1',
            'B5:1.5 A5:0.5 F#5:1 D5:1',
            'E5:3 B4:1',
            'C5:0.5 E5:0.5 A5:1 C6:1 B5:0.5 A5:0.5',
            'B5:1 A5:1 F#5:1 D5:1',
            'E5:0.5 G5:0.5 C6:1 E6:1 D6:0.5 C6:0.5',
            'B5:0.5 A5:0.5 F#5:0.5 D#5:0.5 B4:2',
          ),
        },
      ],
      comp: ['chug', 'pad'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'solo',
      chords: bars('Em', 'D', 'C', 'B7', 'Em', 'D', 'C', 'B7'),
      parts: [
        {
          inst: 'organ',
          vol: 0.36,
          notes: join4(
            'E5:0.25 F#5:0.25 G5:0.25 A5:0.25 B5:0.5 A5:0.5 G5:0.5 F#5:0.5 E5:1',
            'D5:0.25 E5:0.25 F#5:0.25 G5:0.25 A5:0.5 G5:0.5 F#5:0.5 E5:0.5 D5:1',
            'C5:0.25 D5:0.25 E5:0.25 F#5:0.25 G5:0.5 A5:0.5 B5:0.5 C6:0.5 E6:1',
            'D#6:1 B5:0.5 A5:0.5 F#5:0.5 D#5:0.5 B4:1',
            'E5:0.25 F#5:0.25 G5:0.25 A5:0.25 B5:0.5 A5:0.5 G5:0.5 F#5:0.5 E5:1',
            'D5:0.25 E5:0.25 F#5:0.25 G5:0.25 A5:0.5 G5:0.5 F#5:0.5 E5:0.5 D5:1',
            'C5:0.25 D5:0.25 E5:0.25 F#5:0.25 G5:0.5 A5:0.5 B5:0.5 C6:0.5 E6:1',
            'B5:0.5 A5:0.5 G5:0.5 F#5:0.5 D#5:1 B4:1',
          ),
        },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

/** 02 蒼穹の艦隊（A 寄り）。ハ短調 148 BPM。金管のファンファーレ → 弦の刻みに乗る冒険の旋律 → 長調で高揚 → ティンパニの橋渡し。 */
const song02 = {
  file: 'trial-02',
  bpm: 148,
  mix: { reverbLevel: 0.7, tone: 0.6 },
  sections: [
    {
      name: 'fanfare',
      chords: bars('Cm', 'Ab', 'Bb', 'G'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.42,
          double: -1,
          notes: join4(
            'C5:0.5 C5:0.25 C5:0.25 G5:1 -:0.5 Eb5:0.5 F5:0.5 G5:0.5',
            'Ab5:1.5 G5:0.5 F5:1 Eb5:1',
            'D5:0.5 D5:0.25 D5:0.25 F5:1 Bb5:1 Ab5:0.5 G5:0.5',
            'G5:3 -:1',
          ),
        },
      ],
      comp: ['brassHits', 'strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'theme',
      chords: bars('Cm', 'Bb', 'Ab', 'G', 'Fm', 'Bb', 'Eb', 'G'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.4,
          notes: join4(
            'G4:1 C5:1 D5:1 Eb5:1',
            'F5:1.5 D5:0.5 Bb4:2',
            'C5:1 Eb5:1 Ab5:1 G5:0.5 F5:0.5',
            'G5:2 D5:1 B4:1',
            'C5:1 F5:1 Ab5:1 C6:1',
            'Bb5:1.5 Ab5:0.5 F5:1 D5:1',
            'Eb5:1 G5:1 Bb5:1 Eb6:1',
            'D6:1 C6:0.5 B5:0.5 G5:2',
          ),
        },
      ],
      comp: ['strings', 'arp16'],
      bass: 'walk',
      drums: 'march',
      fill: 'snare',
    },
    {
      name: 'lift',
      chords: bars('Ab', 'Bb', 'Eb', 'Cm', 'Fm', 'G', 'Ab Bb', 'G'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.42,
          double: -1,
          notes: join4(
            'C6:1.5 Bb5:0.5 Ab5:1 Eb5:1',
            'D5:0.5 Eb5:0.5 F5:1 Bb5:2',
            'G5:1.5 F5:0.5 Eb5:1 Bb5:1',
            'C6:2 G5:1 Eb5:1',
            'F5:1 Ab5:1 C6:1 Eb6:1',
            'D6:1.5 C6:0.5 B5:1 G5:1',
            'C6:1 D6:1 Eb6:1 F6:1',
            'D6:2 B5:1 G5:1',
          ),
        },
      ],
      comp: ['strings', 'brassHits', 'arp16'],
      bass: 'walk',
      drums: 'march',
      fill: 'snare',
    },
    {
      name: 'bridge',
      chords: bars('Fm', 'G', 'Ab', 'G'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.4,
          notes: join4('F5:0.5 G5:0.5 Ab5:1 C6:1.5 Ab5:0.5', 'G5:0.5 F5:0.5 D5:1 B4:2', 'Ab5:0.5 Bb5:0.5 C6:1 Eb6:1.5 C6:0.5', 'B5:1 D6:1 G6:2'),
        },
        { inst: 'flute', vol: 0.18, notes: join4('C6:4', 'B5:4', 'C6:4', 'D6:4') },
      ],
      comp: ['strings', 'brassHits'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
  ],
};

/** 03 南風のチャンピオン（P 寄り）。ト短調 176 BPM。裏打ちのシンセブラス → 跳ねる主旋律 → 変ロ長調寄りの明るいサビ → 打楽器だけの掛け合い。 */
const song03 = {
  file: 'trial-03',
  bpm: 176,
  mix: { tone: 0.75, reverbLevel: 0.35 },
  sections: [
    {
      name: 'intro',
      chords: bars('Gm', 'Eb F', 'Gm', 'D'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.42,
          double: -1,
          notes: join4(
            'G5:0.75 G5:0.75 G5:0.5 F5:0.5 G5:0.5 Bb5:0.5 -:0.5',
            'Eb5:0.75 Eb5:0.75 F5:0.5 -:0.5 F5:0.5 A5:1',
            'G5:0.75 G5:0.75 G5:0.5 Bb5:0.5 C6:0.5 D6:0.5 -:0.5',
            'D6:0.5 C6:0.5 A5:0.5 F#5:0.5 D5:2',
          ),
        },
      ],
      bass: 'slap',
      drums: 'tropical',
      fill: 'toms',
    },
    {
      name: 'theme',
      chords: bars('Gm', 'F', 'Eb', 'D', 'Gm', 'F', 'Eb', 'D'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          notes: join4(
            'D5:0.5 G5:0.5 A5:0.5 Bb5:1 A5:0.5 G5:1',
            'F5:0.5 A5:0.5 C6:1.5 A5:0.5 F5:1',
            'Eb5:0.5 G5:0.5 Bb5:0.5 Eb6:1 D6:0.5 C6:1',
            'D6:1.5 A5:0.5 F#5:1 D5:1',
            'G5:0.5 Bb5:0.5 D6:0.5 G6:1 F6:0.5 D6:1',
            'C6:0.5 D6:0.5 F6:1.5 C6:0.5 A5:1',
            'Bb5:0.5 C6:0.5 Eb6:0.5 G6:1 F6:0.5 Eb6:0.5 C6:0.5',
            'D6:2 C6:0.5 A5:0.5 F#5:1',
          ),
        },
      ],
      comp: ['stabs'],
      bass: 'slap',
      drums: 'tropical',
      fill: 'snare',
    },
    {
      name: 'chorus',
      chords: bars('Eb', 'F', 'Dm', 'Gm', 'Cm', 'F', 'Bb', 'D'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          notes: join4(
            'Bb5:1 G5:0.5 Bb5:0.5 Eb6:1 D6:1',
            'C6:1 A5:0.5 C6:0.5 F6:2',
            'F6:0.5 E6:0.5 D6:0.5 A5:0.5 F5:1 A5:1',
            'Bb5:1.5 A5:0.5 G5:1 D5:1',
            'Eb5:0.5 G5:0.5 C6:1 Eb6:1 D6:0.5 C6:0.5',
            'C6:1 F6:1 Eb6:0.5 D6:0.5 C6:1',
            'D6:1.5 Bb5:0.5 F5:1 Bb5:1',
            'A5:0.5 Bb5:0.5 C6:0.5 D6:0.5 F#6:2',
          ),
        },
        {
          inst: 'bell',
          vol: 0.16,
          notes: join4('G6:4', 'A6:4', 'F6:4', 'G6:4', 'G6:4', 'A6:4', 'F6:4', 'F#6:4'),
        },
      ],
      comp: ['stabs', 'strings'],
      bass: 'slap',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'break',
      chords: bars('Gm', 'Gm', 'Eb', 'F', 'Gm', 'Gm', 'Eb', 'D'),
      parts: [
        {
          inst: 'bell',
          vol: 0.36,
          notes: join4(
            'G5:0.5 -:0.5 G5:0.5 Bb5:0.5 -:1 D6:0.5 C6:0.5',
            'Bb5:0.5 A5:0.5 G5:1 -:2',
            'Eb6:0.5 -:0.5 Eb6:0.5 D6:0.5 -:1 C6:0.5 Bb5:0.5',
            'C6:0.5 Bb5:0.5 A5:1 -:2',
            'G5:0.5 -:0.5 G5:0.5 Bb5:0.5 -:1 D6:0.5 C6:0.5',
            'Bb5:0.5 A5:0.5 G5:1 -:2',
            'Eb6:0.5 -:0.5 Eb6:0.5 D6:0.5 -:1 C6:0.5 Bb5:0.5',
            'A5:0.5 C6:0.5 D6:1 F#5:1 D5:1',
          ),
        },
      ],
      bass: 'slap',
      drums: 'tropical',
      fill: 'toms',
      energy: 0.85,
    },
  ],
};

/** 04 三つの旗（3 曲の平均）。ニ短調 160 BPM。金管（A）・歪みギターとオルガン（T）・シンセの裏打ち（P）を均等に混ぜた。 */
const CHORUS04 = join4(
  'D6:0.75 C6:0.75 Bb5:0.5 F5:1 D6:1',
  'E6:0.75 D6:0.75 C6:0.5 G5:1 E6:1',
  'C6:0.5 B5:0.5 A5:0.5 E5:0.5 C6:1 E6:1',
  'D6:2 A5:1 F5:1',
  'Bb5:0.75 A5:0.75 G5:0.5 D5:1 Bb5:1',
  'C6:0.75 Bb5:0.75 A5:0.5 G5:0.5 E5:0.5 C6:1',
  'F5:0.5 A5:0.5 C6:0.5 F6:0.5 E6:0.5 C#6:0.5 A5:1',
  'A5:0.5 C#6:0.5 E6:0.5 G6:0.5 A6:2',
);
const song04 = {
  file: 'trial-04',
  bpm: 160,
  mix: { drive: 0.3 },
  sections: [
    {
      name: 'intro',
      chords: bars('Dm', 'Bb C', 'Dm', 'A'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.42,
          double: -1,
          notes: join4(
            'D5:0.5 -:0.5 D5:0.5 -:0.5 F5:0.5 E5:0.5 D5:0.5 A4:0.5',
            'Bb4:1 D5:0.5 F5:0.5 C5:1 E5:0.5 G5:0.5',
            'A5:0.5 -:0.5 A5:0.5 -:0.5 C6:0.5 Bb5:0.5 A5:0.5 F5:0.5',
            'E5:0.5 F5:0.5 G5:0.5 A5:0.5 C#6:2',
          ),
        },
      ],
      comp: ['brassHits'],
      bass: 'octave',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'verse',
      chords: bars('Dm', 'C', 'Bb', 'A', 'Gm', 'A', 'Dm Bb', 'A'),
      parts: [
        {
          inst: 'guitarLead',
          vol: 0.38,
          notes: join4(
            'A4:1 D5:1 E5:0.5 F5:1 G5:0.5',
            'E5:1.5 C5:0.5 G4:1 C5:1',
            'D5:1 F5:1 Bb5:1.5 A5:0.5',
            'A5:2 E5:1 C#5:1',
            'D5:0.5 E5:0.5 F5:0.5 G5:0.5 Bb5:1 D6:1',
            'C#6:1.5 A5:0.5 E5:1 G5:1',
            'F5:1 A5:1 D6:1 Bb5:1',
            'A5:1 G5:0.5 F5:0.5 E5:1 C#5:1',
          ),
        },
      ],
      comp: ['stabs', 'strings'],
      bass: 'octave',
      drums: 'rock',
      fill: 'snare',
    },
    {
      name: 'chorus',
      chords: bars('Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F A', 'A'),
      parts: [
        { inst: 'brassLead', vol: 0.4, notes: CHORUS04 },
        {
          inst: 'guitarLead',
          vol: 0.2,
          notes: shiftPhrase(CHORUS04, -1),
        },
      ],
      comp: ['stabs', 'chug'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'organ',
      chords: bars('Dm', 'C', 'Bb', 'A'),
      parts: [
        {
          inst: 'organ',
          vol: 0.36,
          notes: join4(
            'D6:0.25 C6:0.25 A5:0.25 F5:0.25 D5:0.5 F5:0.5 A5:0.5 D6:0.5 F6:1',
            'E6:0.25 D6:0.25 C6:0.25 G5:0.25 E5:0.5 G5:0.5 C6:0.5 E6:0.5 G6:1',
            'F6:0.25 D6:0.25 Bb5:0.25 F5:0.25 D5:0.5 F5:0.5 Bb5:0.5 D6:0.5 F6:1',
            'E6:0.5 C#6:0.5 A5:0.5 E5:0.5 C#5:0.5 E5:0.5 A4:1',
          ),
        },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

/** 05 紅蓮の決闘（T 寄り・ボス向け）。イ短調 178 BPM。疾走する 3 連のベースと半音階の駆け上がり。 */
const RIFF05 = [
  'A4:0.5 A4:0.25 A4:0.25 C5:0.5 A4:0.5 D#5:0.5 E5:0.5 A4:0.5 G5:0.5',
  'A4:0.5 A4:0.25 A4:0.25 C5:0.5 A4:0.5 D#5:0.5 E5:0.5 G5:0.5 F5:0.5',
  'F4:0.5 F4:0.25 F4:0.25 A4:0.5 F4:0.5 C5:0.5 B4:0.5 A4:0.5 C5:0.5',
  'E5:0.5 F5:0.5 E5:0.5 D5:0.5 C5:0.5 B4:0.5 G#4:1',
];
const song05 = {
  file: 'trial-05',
  bpm: 178,
  mix: { drive: 0.6, tone: 0.7 },
  sections: [
    {
      name: 'riff',
      chords: bars('Am', 'Am', 'F', 'E'),
      parts: [
        { inst: 'guitarLead', vol: 0.38, notes: join4(...RIFF05) },
        { inst: 'organ', vol: 0.2, notes: shiftPhrase(join4(...RIFF05), 1) },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'rock',
      fill: 'toms',
    },
    {
      name: 'verse',
      chords: bars('Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E7'),
      parts: [
        {
          inst: 'guitarLead',
          vol: 0.4,
          notes: join4(
            'E5:1.5 A5:0.5 C6:1 B5:1',
            'G5:1 D5:0.5 G5:0.5 B5:2',
            'A5:1 C6:1 F6:1.5 E6:0.5',
            'E6:2 D6:0.5 C6:0.5 B5:1',
            'A5:0.5 B5:0.5 C6:0.5 E6:0.5 A6:2',
            'G6:1 F6:0.5 E6:0.5 D6:1 B5:1',
            'C6:1 A5:1 F5:1 A5:1',
            'G#5:1 B5:1 E6:1 D6:1',
          ),
        },
      ],
      comp: ['organ', 'chug'],
      bass: 'gallop',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'chorus',
      chords: bars('Dm', 'E', 'Am', 'C', 'Dm', 'E', 'F E', 'E'),
      parts: [
        {
          inst: 'organ',
          vol: 0.36,
          notes: join4(
            'F5:0.5 E5:0.5 D5:0.5 F5:0.5 A5:1 D6:1',
            'G#5:0.5 A5:0.5 B5:0.5 D6:0.5 E6:2',
            'C6:0.5 B5:0.5 A5:0.5 C6:0.5 E6:1 A6:1',
            'G6:1.5 E6:0.5 C6:1 G5:1',
            'A5:0.5 D6:0.5 F6:0.5 A6:0.5 G6:0.5 F6:0.5 E6:0.5 D6:0.5',
            'E6:0.5 D6:0.5 C6:0.5 B5:0.5 G#5:1 E5:1',
            'F5:0.5 A5:0.5 C6:0.5 F6:0.5 E6:0.5 B5:0.5 G#5:0.5 E5:0.5',
            'E5:0.25 F5:0.25 F#5:0.25 G5:0.25 G#5:0.25 A5:0.25 A#5:0.25 B5:0.25 E6:2',
          ),
        },
        {
          inst: 'guitarLead',
          vol: 0.22,
          notes: join4('D5:4', 'E5:4', 'E5:4', 'G5:4', 'F5:4', 'G#5:4', 'A5:2 G#5:2', 'B5:4'),
        },
      ],
      comp: ['chug', 'pad'],
      bass: 'drive8',
      drums: 'double',
      fill: 'snare',
    },
    {
      name: 'riff2',
      chords: bars('Am', 'Am', 'F', 'E', 'Am', 'Am', 'F', 'E'),
      parts: [
        { inst: 'guitarLead', vol: 0.38, notes: join4(...RIFF05, ...RIFF05) },
        { inst: 'organ', vol: 0.22, notes: shiftPhrase(join4(...RIFF05, ...RIFF05), 1) },
      ],
      comp: ['chug', 'brassHits'],
      bass: 'gallop',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

/** 06 風の甲板（A 寄り・通常戦闘向け）。ヘ長調 140 BPM。笛と金管、ハープの刻みで、空を駆ける冒険の明るさ。 */
const song06 = {
  file: 'trial-06',
  bpm: 140,
  mix: { reverbLevel: 0.65, tone: 0.6 },
  sections: [
    {
      name: 'fanfare',
      chords: bars('F', 'Bb', 'C', 'C'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.4,
          double: -1,
          notes: join4('C5:0.5 F5:0.5 A5:1 C6:1.5 A5:0.5', 'Bb5:1 D6:1 F6:1 D6:1', 'C6:0.5 Bb5:0.5 A5:0.5 G5:0.5 E5:1 G5:1', 'C6:3 -:1'),
        },
      ],
      comp: ['brassHits', 'strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'theme',
      chords: bars('F', 'Dm', 'Bb', 'C', 'F', 'Am', 'Bb', 'C'),
      parts: [
        {
          inst: 'flute',
          vol: 0.42,
          notes: join4(
            'A5:1 C6:0.5 A5:0.5 F5:1 C5:1',
            'D5:0.5 F5:0.5 A5:1 D6:2',
            'D6:1 C6:0.5 Bb5:0.5 F5:1 D5:1',
            'E5:1.5 G5:0.5 C6:2',
            'A5:1 C6:0.5 A5:0.5 F6:1 E6:1',
            'C6:0.5 E6:0.5 A5:1 E5:2',
            'F5:1 Bb5:1 D6:1 F6:1',
            'E6:1 D6:0.5 C6:0.5 G5:2',
          ),
        },
      ],
      comp: ['arp8', 'pad'],
      bass: 'walk',
      drums: 'march',
      fill: 'snare',
      energy: 0.8,
    },
    {
      name: 'brave',
      chords: bars('Dm', 'Bb', 'Gm', 'C', 'Dm', 'Bb', 'Gm C', 'C'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.42,
          double: -1,
          notes: join4(
            'D6:1.5 A5:0.5 F5:1 D5:1',
            'Bb5:1.5 F5:0.5 D5:1 Bb4:1',
            'G5:1 Bb5:1 D6:1 G6:1',
            'E6:2 C6:1 G5:1',
            'A5:0.5 D6:0.5 F6:1 E6:0.5 D6:0.5 A5:1',
            'Bb5:0.5 D6:0.5 F6:1 G6:0.5 F6:0.5 D6:1',
            'G6:1 F6:0.5 E6:0.5 D6:1 C6:1',
            'E6:1 F6:1 G6:2',
          ),
        },
      ],
      comp: ['strings', 'arp16', 'brassHits'],
      bass: 'walk',
      drums: 'march',
      fill: 'roll',
    },
  ],
};

/** 07 島の祭り太鼓（P 寄り）。イ短調 170 BPM。打楽器から始まり、スラップベースとシンセブラスで踊るように。 */
const song07 = {
  file: 'trial-07',
  bpm: 170,
  mix: { tone: 0.75, reverbLevel: 0.35 },
  sections: [
    {
      name: 'intro',
      chords: bars('Am', 'Am', 'F', 'G'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.42,
          notes: join4(
            '-:4',
            '-:2 E5:0.5 G5:0.5 A5:0.5 C6:0.5',
            'A5:0.75 A5:0.75 C6:0.5 -:0.5 B5:0.5 G5:1',
            'G5:0.75 G5:0.75 B5:0.5 -:0.5 D6:0.5 E6:1',
          ),
        },
      ],
      bass: 'slap',
      drums: 'tropical',
      fill: 'toms',
    },
    {
      name: 'theme',
      chords: bars('Am', 'F', 'G', 'Em', 'Am', 'F', 'G', 'E'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          double: -1,
          notes: join4(
            'E6:0.5 D6:0.5 C6:0.5 A5:1 C6:0.5 D6:1',
            'C6:0.5 A5:0.5 F5:1 A5:0.5 C6:0.5 F6:1',
            'D6:0.5 B5:0.5 G5:1 B5:0.5 D6:0.5 G6:1',
            'E6:1.5 D6:0.5 B5:1 G5:1',
            'A5:0.5 C6:0.5 E6:0.5 A6:1 G6:0.5 E6:1',
            'F6:0.5 E6:0.5 C6:0.5 A5:1 C6:0.5 F6:1',
            'G6:0.5 F6:0.5 D6:0.5 B5:1 D6:0.5 G6:1',
            'G#6:1.5 E6:0.5 B5:1 G#5:1',
          ),
        },
      ],
      comp: ['stabs'],
      bass: 'slap',
      drums: 'tropical',
      fill: 'snare',
    },
    {
      name: 'bright',
      chords: bars('F', 'G', 'Em', 'Am', 'Dm', 'G', 'C E', 'E'),
      parts: [
        {
          inst: 'squareLead',
          vol: 0.32,
          notes: join4(
            'C6:1 A5:0.5 C6:0.5 F6:1 E6:1',
            'D6:1 B5:0.5 D6:0.5 G6:1 F6:1',
            'E6:1.5 B5:0.5 G5:1 E6:1',
            'C6:2 A5:1 E5:1',
            'F5:0.5 A5:0.5 D6:1 F6:1 E6:0.5 D6:0.5',
            'D6:1 G6:1 F6:0.5 E6:0.5 D6:1',
            'E6:0.5 D6:0.5 C6:0.5 G5:0.5 G#5:0.5 B5:0.5 E6:1',
            'E6:0.5 D6:0.5 B5:0.5 G#5:0.5 E5:2',
          ),
        },
      ],
      comp: ['stabs', 'strings'],
      bass: 'slap',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'call',
      chords: bars('Am', 'Am', 'F', 'G'),
      parts: [
        {
          inst: 'bell',
          vol: 0.38,
          notes: join4(
            'A5:0.5 -:0.5 C6:0.5 -:0.5 E6:0.5 D6:0.5 C6:1',
            '-:2 E6:0.5 D6:0.5 C6:0.5 B5:0.5',
            'A5:0.5 -:0.5 C6:0.5 -:0.5 F6:0.5 E6:0.5 C6:1',
            'B5:0.5 C6:0.5 D6:0.5 E6:0.5 G6:2',
          ),
        },
      ],
      bass: 'slap',
      drums: 'tropical',
      fill: 'toms',
      energy: 0.9,
    },
  ],
};

/** 08 王道バトル（T と P の平均）。ロ短調 172 BPM。矩形波とシンセブラスの主旋律、パワーコードの刻み。 */
const song08 = {
  file: 'trial-08',
  bpm: 172,
  mix: { drive: 0.4 },
  sections: [
    {
      name: 'intro',
      chords: bars('Bm', 'G A', 'Bm', 'F#'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          double: -1,
          notes: join4(
            'B4:0.5 D5:0.5 F#5:0.5 B5:0.5 A5:0.75 F#5:0.75 D5:0.5',
            'G5:0.5 B5:0.5 D6:0.5 B5:0.5 A5:0.5 C#6:0.5 E6:0.5 C#6:0.5',
            'D6:0.75 C#6:0.75 B5:0.5 F#5:0.5 B5:0.5 D6:0.5 F#6:0.5',
            'F#6:0.5 E6:0.5 C#6:0.5 A#5:0.5 F#5:2',
          ),
        },
      ],
      comp: ['chug'],
      bass: 'octave',
      drums: 'rock',
      fill: 'toms',
    },
    {
      name: 'verse',
      chords: bars('Bm', 'A', 'G', 'F#', 'Em', 'F#', 'Bm G', 'F#'),
      parts: [
        {
          inst: 'squareLead',
          vol: 0.36,
          notes: join4(
            'F#5:1 B5:1 C#6:0.5 D6:1 E6:0.5',
            'C#6:1.5 A5:0.5 E5:1 A5:1',
            'B5:1 D6:1 G6:1.5 F#6:0.5',
            'F#6:2 C#6:1 A#5:1',
            'B5:0.5 C#6:0.5 D6:0.5 E6:0.5 G6:1 B6:1',
            'A#6:1.5 F#6:0.5 C#6:1 E6:1',
            'D6:1 F#6:1 B6:1 G6:1',
            'F#6:1 E6:0.5 D6:0.5 C#6:1 A#5:1',
          ),
        },
      ],
      comp: ['chug', 'pad'],
      bass: 'octave',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'chorus',
      chords: bars('G', 'A', 'F#m', 'Bm', 'Em', 'A', 'D F#', 'F#'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          double: -1,
          notes: join4(
            'B5:0.75 A5:0.75 G5:0.5 D6:1 B5:1',
            'C#6:0.75 B5:0.75 A5:0.5 E6:1 C#6:1',
            'A5:0.5 C#6:0.5 F#6:1 E6:0.5 C#6:0.5 A5:1',
            'B5:2 D6:1 F#6:1',
            'G6:0.75 F#6:0.75 E6:0.5 B5:1 G6:1',
            'A6:0.75 G6:0.75 E6:0.5 C#6:1 A5:1',
            'D6:0.5 F#6:0.5 A6:1 A#6:0.5 F#6:0.5 C#6:1',
            'F#6:0.5 C#6:0.5 A#5:0.5 F#5:0.5 F#6:2',
          ),
        },
      ],
      comp: ['stabs', 'chug'],
      bass: 'drive8',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'riff',
      chords: bars('Bm', 'Bm', 'G', 'F#'),
      parts: [
        {
          inst: 'squareLead',
          vol: 0.34,
          notes: join4(
            'B4:0.5 B4:0.5 D5:0.5 B4:0.5 E5:0.5 B4:0.5 F#5:0.5 E5:0.5',
            'B4:0.5 B4:0.5 D5:0.5 B4:0.5 F#5:0.5 E5:0.5 D5:0.5 C#5:0.5',
            'G4:0.5 G4:0.5 B4:0.5 G4:0.5 D5:0.5 C#5:0.5 B4:0.5 A4:0.5',
            'A#4:0.5 C#5:0.5 F#5:0.5 A#5:0.5 C#6:1 F#5:1',
          ),
        },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'half',
      fill: 'toms',
    },
  ],
};

/** 09 冒険者の凱歌（A と P の平均）。ト短調 / 変ロ長調 156 BPM。金管の旋律にシンセの裏打ちとスラップベース。 */
const song09 = {
  file: 'trial-09',
  bpm: 156,
  mix: { reverbLevel: 0.5, tone: 0.7 },
  sections: [
    {
      name: 'fanfare',
      chords: bars('Gm', 'Eb F', 'Gm', 'D'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.42,
          double: -1,
          notes: join4(
            'G4:0.5 Bb4:0.5 D5:0.5 G5:1 F5:0.5 G5:1',
            'Eb5:0.75 F5:0.75 G5:0.5 F5:0.75 G5:0.75 A5:0.5',
            'Bb5:0.5 A5:0.5 G5:0.5 D6:1 C6:0.5 Bb5:1',
            'A5:1 F#5:1 D5:2',
          ),
        },
      ],
      comp: ['brassHits'],
      bass: 'octave',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'major',
      chords: bars('Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Eb F', 'F'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.4,
          notes: join4(
            'D5:1 F5:0.5 Bb5:1 A5:0.5 Bb5:1',
            'C6:1.5 A5:0.5 F5:2',
            'G5:0.5 A5:0.5 Bb5:1 D6:1 C6:0.5 Bb5:0.5',
            'C6:1 Bb5:0.5 G5:0.5 Eb5:2',
            'F5:1 Bb5:0.5 D6:1 C6:0.5 D6:1',
            'F6:1.5 E6:0.5 C6:2',
            'Eb6:1 D6:0.5 C6:0.5 C6:1 D6:0.5 C6:0.5',
            'A5:2 C6:1 F5:1',
          ),
        },
      ],
      comp: ['stabs', 'strings'],
      bass: 'slap',
      drums: 'march',
      fill: 'snare',
    },
    {
      name: 'minor',
      chords: bars('Gm', 'Eb', 'Cm', 'D', 'Gm', 'Eb', 'F', 'D'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          double: -1,
          notes: join4(
            'D6:0.75 D6:0.75 Bb5:0.5 G5:1 Bb5:1',
            'Eb6:0.75 Eb6:0.75 Bb5:0.5 G5:1 Eb6:1',
            'C6:0.5 Eb6:0.5 G6:1 F6:0.5 Eb6:0.5 C6:1',
            'D6:2 A5:1 F#5:1',
            'G5:0.5 Bb5:0.5 D6:0.5 G6:1 F6:0.5 D6:1',
            'Eb6:0.5 D6:0.5 Bb5:0.5 G5:1 Bb5:0.5 Eb6:1',
            'F6:0.75 Eb6:0.75 D6:0.5 C6:0.75 D6:0.75 A5:0.5',
            'D6:1 F#6:1 A6:2',
          ),
        },
      ],
      comp: ['stabs', 'brassHits', 'arp16'],
      bass: 'slap',
      drums: 'drive',
      fill: 'snare',
    },
  ],
};

/** 10 最終決戦（3 曲すべての平均・ボス向け）。ハ短調 150 BPM。オルガンの序奏 → 全員のリフ → 金管の主題 → 裏打ちのサビ → オルガンの速弾き。 */
const song10 = {
  file: 'trial-10',
  bpm: 150,
  mix: { drive: 0.4, reverbLevel: 0.55 },
  sections: [
    {
      name: 'prelude',
      chords: bars('Cm', 'Ab', 'Fm', 'G'),
      parts: [{ inst: 'organ', vol: 0.36, notes: join4('C5:1 Eb5:1 G5:1 C6:1', 'Ab5:1.5 G5:0.5 Eb5:1 C5:1', 'F5:1 Ab5:1 C6:1 F6:1', 'D6:1 B5:1 G5:0.5 F5:0.5 D5:0.5 B4:0.5') }],
      comp: ['strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'riff',
      chords: bars('Cm', 'Cm', 'Ab Bb', 'G'),
      parts: [
        {
          inst: 'guitarLead',
          vol: 0.38,
          notes: join4(
            'C5:0.5 C5:0.25 C5:0.25 Eb5:0.5 C5:0.5 G5:0.5 F5:0.5 Eb5:0.5 D5:0.5',
            'C5:0.5 C5:0.25 C5:0.25 Eb5:0.5 C5:0.5 Ab5:0.5 G5:0.5 F#5:0.5 G5:0.5',
            'Ab5:0.5 G5:0.5 F5:0.5 Eb5:0.5 Bb5:0.5 Ab5:0.5 G5:0.5 F5:0.5',
            'G5:0.5 B5:0.5 D6:0.5 F6:0.5 G6:2',
          ),
          double: 1,
        },
      ],
      comp: ['chug', 'brassHits'],
      bass: 'gallop',
      drums: 'rock',
      fill: 'toms',
    },
    {
      name: 'theme',
      chords: bars('Cm', 'Bb', 'Ab', 'G', 'Fm', 'G', 'Ab', 'G'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.42,
          double: -1,
          notes: join4(
            'G5:1.5 C6:0.5 Eb6:1 D6:1',
            'D6:1 Bb5:0.5 D6:0.5 F6:2',
            'Eb6:1 C6:1 Ab5:1.5 C6:0.5',
            'B5:2 G5:1 D5:1',
            'C6:1 F6:1 Ab6:1 G6:0.5 F6:0.5',
            'G6:1.5 F6:0.5 D6:1 B5:1',
            'C6:0.5 Eb6:0.5 Ab6:1 G6:0.5 F6:0.5 Eb6:1',
            'D6:1 Eb6:0.5 D6:0.5 B5:2',
          ),
        },
      ],
      comp: ['strings', 'arp16'],
      bass: 'drive8',
      drums: 'march',
      fill: 'snare',
    },
    {
      name: 'chorus',
      chords: bars('Ab', 'Bb', 'Gm', 'Cm', 'Fm', 'Bb', 'Eb', 'G'),
      parts: [
        {
          inst: 'synthBrass',
          vol: 0.4,
          notes: join4(
            'C6:0.75 Eb6:0.75 Ab6:0.5 G6:1 Eb6:1',
            'D6:0.75 F6:0.75 Bb6:0.5 Ab6:1 F6:1',
            'G6:0.5 F6:0.5 D6:0.5 Bb5:0.5 G5:1 D6:1',
            'Eb6:2 C6:1 G5:1',
            'F6:0.75 Ab6:0.75 C7:0.5 Bb6:0.5 Ab6:0.5 F6:1',
            'Bb6:0.75 Ab6:0.75 F6:0.5 D6:1 Bb5:1',
            'G6:1 Eb6:0.5 G6:0.5 Bb6:2',
            'B6:1 G6:0.5 F6:0.5 D6:0.5 B5:0.5 G5:1',
          ),
          double: -1,
        },
      ],
      comp: ['stabs', 'strings', 'brassHits'],
      bass: 'octave',
      drums: 'drive',
      fill: 'snare',
    },
    {
      name: 'solo',
      chords: bars('Cm', 'Bb', 'Ab', 'G', 'Cm', 'Bb', 'Ab', 'G'),
      parts: [
        {
          inst: 'organ',
          vol: 0.36,
          notes: join4(
            'C6:0.25 D6:0.25 Eb6:0.25 F6:0.25 G6:0.5 F6:0.5 Eb6:0.5 D6:0.5 C6:1',
            'Bb5:0.25 C6:0.25 D6:0.25 Eb6:0.25 F6:0.5 Eb6:0.5 D6:0.5 C6:0.5 Bb5:1',
            'Ab5:0.25 Bb5:0.25 C6:0.25 D6:0.25 Eb6:0.5 F6:0.5 G6:0.5 Ab6:0.5 C7:1',
            'B6:1 G6:0.5 F6:0.5 D6:0.5 B5:0.5 G5:1',
            'Eb6:0.5 G6:0.5 C7:1 Bb6:0.5 G6:0.5 Eb6:1',
            'D6:0.5 F6:0.5 Bb6:1 Ab6:0.5 F6:0.5 D6:1',
            'C6:0.5 Eb6:0.5 Ab6:1 G6:0.5 Eb6:0.5 C6:1',
            'D6:0.25 Eb6:0.25 F6:0.25 G6:0.25 Ab6:0.25 Bb6:0.25 B6:0.5 G6:2',
          ),
        },
        { inst: 'guitarLead', vol: 0.18, notes: join4('C5:4', 'D5:4', 'C5:4', 'B4:4', 'C5:4', 'D5:4', 'Eb5:4', 'D5:4') },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

const SONGS = [song01, song02, song03, song04, song05, song06, song07, song08, song09, song10];

mkdirSync(OUT_DIR, { recursive: true });
for (const song of SONGS) {
  const samples = renderSong(song);
  const file = join(OUT_DIR, `${song.file}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
