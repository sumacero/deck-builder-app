// BGM（タイトル・通常戦闘・ボス戦・ショップ + 地域ごとのフィールド曲・エリート戦）を合成して
// assets/music/*.wav に書き出す。地域の曲は bgm-regions.mjs、主題の素材は bgm-theme.mjs。
// 実行: npm run bgm（`npm run bgm -- field-` でファイル名がその文字列で始まる曲だけ）
//
// 全曲がメインテーマ「三つの旗」の素材（導入の動機・A メロ・サビ・オルガンの駆け上がり、ニ短調）を共有する。
// オーナーの方針:
// - サビはボス戦（三つの旗 −試−）だけ。
// - 曲の出だしは曲ごとに別のフレーズにし、共通の旋律は曲の途中にだけ置く。共通箇所は少なめに。
// - 通常戦闘は全地域共通で静かに。旋律は普通の人が気づかない程度にさりげなく入れる。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAMPLE_RATE, seedNoise, shiftPhrase } from './bgm-engine.mjs';
import { REGION_SONGS } from './bgm-regions.mjs';
import { BOSS_DRAFTS, writeBossDraftCatalog } from './bgm-boss-drafts.mjs';
import { bars, join4, remapPhrase, renderSong, stretchPhrase } from './bgm-song.mjs';
import {
  CHORUS,
  CHORUS_CHORDS,
  D_MAJOR,
  INTRO,
  INTRO_BARS,
  INTRO_CHORDS,
  RUN,
  RUN_CHORDS,
  VERSE,
  VERSE_BARS,
  VERSE_CHORDS,
} from './bgm-theme.mjs';
import { toWav } from './wav.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'music');

// ===== 曲 =====

/** タイトル（72 BPM・約 40 秒）。笛の新しい旋律で始まり、中ほどで A メロの頭を金管がゆったり歌う。サビなし。 */
const mainTitle = {
  file: 'title',
  bpm: 72,
  mix: { reverbLevel: 0.85, tone: 0.45, echoLevel: 0.35 },
  sections: [
    {
      name: 'opening',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      parts: [{ inst: 'flute', vol: 0.4, notes: join4('A5:2 G5:1 F5:1', 'D5:3 F5:1', 'C5:2 F5:1 A5:1', 'G5:4') }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'verse-head',
      chords: bars('Dm', 'Dm', 'C', 'C'),
      parts: [{ inst: 'brassLead', vol: 0.32, notes: stretchPhrase(join4(...VERSE_BARS.slice(0, 2)), 2) }],
      comp: ['strings', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
    },
    {
      name: 'closing',
      chords: bars('Bb', 'Gm', 'A', 'A7'),
      parts: [{ inst: 'flute', vol: 0.38, notes: join4('D5:2 F5:2', 'Bb5:2 A5:1 G5:1', 'A5:3 E5:1', 'C#5:4') }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
  ],
};

/**
 * 通常戦闘（全地域共通・88 BPM・約 44 秒）。考えるのを邪魔しない、ハープの刻みとパッドだけの静かな曲。
 * 旋律は前に出さず、A メロの頭を倍の長さにして低い弦が和音の中でなぞり、
 * 終わりに導入の動機を倍の長さで小さなベルが鳴らす（気づく人だけ気づく程度の音量）。
 */
const mainNormal = {
  file: 'battle-normal',
  bpm: 88,
  mix: { reverbLevel: 0.65, tone: 0.4, echoLevel: 0.2 },
  sections: [
    {
      name: 'pulse',
      chords: bars('Dm', 'Bb', 'Gm', 'A'),
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'veiled-verse',
      chords: bars('Dm', 'Dm', 'C', 'C', 'Bb', 'Bb', 'A', 'A'),
      parts: [{ inst: 'strings', vol: 0.14, send: 0.4, notes: shiftPhrase(stretchPhrase(join4(...VERSE_BARS.slice(0, 4)), 2), -1) }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'light',
      energy: 0.4,
    },
    {
      name: 'veiled-intro',
      chords: bars('Dm', 'Dm', 'Bb', 'C'),
      parts: [{ inst: 'bell', vol: 0.12, send: 0.5, notes: stretchPhrase(join4(...INTRO_BARS.slice(0, 2)), 2) }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'light',
      energy: 0.35,
    },
  ],
};

/** ボス戦「三つの旗 −試−」（156 BPM・約 43 秒）。05 のテンポを落とし、サビの前に溜めを入れた。サビはここで初めて登場。 */
const mainBoss = {
  file: 'battle-boss',
  bpm: 156,
  mix: { drive: 0.5, tone: 0.7 },
  sections: [
    {
      name: 'riff',
      chords: bars(...INTRO_CHORDS),
      parts: [
        { inst: 'guitarLead', vol: 0.38, notes: INTRO },
        { inst: 'organ', vol: 0.2, notes: shiftPhrase(INTRO, 1) },
      ],
      comp: ['chug'],
      bass: 'gallop',
      drums: 'rock',
      fill: 'toms',
    },
    { name: 'verse', chords: bars(...VERSE_CHORDS), parts: [{ inst: 'guitarLead', vol: 0.4, notes: VERSE }], comp: ['organ', 'chug'], bass: 'gallop', drums: 'drive', fill: 'snare' },
    { name: 'run', chords: bars(...RUN_CHORDS), parts: [{ inst: 'organ', vol: 0.36, notes: RUN }], comp: ['chug'], bass: 'gallop', drums: 'double', fill: 'toms' },
    {
      name: 'build',
      chords: bars('Gm', 'A', 'Bb', 'A'),
      parts: [{ inst: 'brassLead', vol: 0.36, notes: join4('G5:4', 'A5:4', 'Bb5:4', 'C#6:4') }],
      comp: ['strings'],
      bass: 'sustain',
      drums: 'half',
      fill: 'roll',
    },
    {
      name: 'chorus',
      chords: bars(...CHORUS_CHORDS),
      parts: [
        { inst: 'brassLead', vol: 0.4, notes: CHORUS },
        { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(CHORUS, -1) },
      ],
      comp: ['stabs', 'chug', 'brassHits'],
      bass: 'drive8',
      drums: 'double',
      fill: 'toms',
    },
  ],
};

/** ショップの A メロ。弾むような 8 分の上り下り。 */
const SHOP_TUNE = join4(
  'A5:1 F#5:0.5 A5:0.5 D6:1 C#6:0.5 B5:0.5',
  'B5:1 F#5:0.5 B5:0.5 D6:2',
  'G5:0.5 A5:0.5 B5:0.5 D6:0.5 E6:1 D6:0.5 B5:0.5',
  'C#6:1.5 B5:0.5 A5:2',
  'A5:1 F#5:0.5 A5:0.5 D6:1 F#6:1',
  'E6:0.5 D6:0.5 B5:0.5 F#5:0.5 B5:2',
  'E6:0.5 F#6:0.5 G6:0.5 E6:0.5 C#6:0.5 B5:0.5 A5:1',
  'D6:2 -:1 A5:1',
);
const SHOP_TUNE_CHORDS = ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em A', 'D'];

/**
 * ショップ（128 BPM・約 52 秒）。にぎわう商店街のイメージ。ニ長調で、ハープの刻み・笛・ボンゴとシェイカー。
 * 中ほどで A メロの頭をニ長調にしてオルガン（手回しオルガン風）が奏でる。
 */
const shop = {
  file: 'shop',
  bpm: 128,
  mix: { reverbLevel: 0.45, tone: 0.65 },
  sections: [
    {
      name: 'opening',
      chords: bars('D', 'G', 'A', 'D'),
      parts: [
        {
          inst: 'bell',
          vol: 0.38,
          notes: join4(
            'F#5:0.5 A5:0.5 D6:0.5 A5:0.5 B5:0.5 A5:0.5 F#5:1',
            'G5:0.5 B5:0.5 D6:0.5 B5:0.5 E6:0.5 D6:0.5 B5:1',
            'A5:0.5 C#6:0.5 E6:0.5 C#6:0.5 G6:0.5 F#6:0.5 E6:1',
            'D6:1 A5:0.5 F#5:0.5 D5:2',
          ),
        },
      ],
      comp: ['arp8'],
      bass: 'walk',
      drums: 'light',
      fill: 'toms',
    },
    {
      name: 'tune',
      chords: bars(...SHOP_TUNE_CHORDS),
      parts: [{ inst: 'flute', vol: 0.42, notes: SHOP_TUNE }],
      comp: ['arp8', 'pad'],
      bass: 'walk',
      drums: 'tropical',
      fill: 'snare',
      energy: 0.6,
    },
    {
      name: 'theme-cameo',
      chords: bars('D', 'A7', 'Bm', 'A', 'G', 'A7', 'D G', 'A7'),
      parts: [
        {
          inst: 'organ',
          vol: 0.32,
          notes: join4(
            ...remapPhrase(join4(...VERSE_BARS.slice(0, 4)), D_MAJOR).split(' | '),
            'B4:1 D5:1 G5:1 B5:1',
            'A5:1.5 G5:0.5 E5:1 C#5:1',
            'D5:0.5 F#5:0.5 A5:0.5 D6:0.5 B5:1 G5:1',
            'A5:2 C#6:1 E6:1',
          ),
        },
      ],
      comp: ['arp8'],
      bass: 'walk',
      drums: 'tropical',
      fill: 'toms',
      energy: 0.65,
    },
    {
      name: 'tune-again',
      chords: bars(...SHOP_TUNE_CHORDS),
      parts: [
        { inst: 'flute', vol: 0.42, notes: SHOP_TUNE },
        { inst: 'bell', vol: 0.16, notes: shiftPhrase(SHOP_TUNE, 1) },
      ],
      comp: ['arp8', 'strings'],
      bass: 'walk',
      drums: 'tropical',
      fill: 'snare',
      energy: 0.75,
    },
  ],
};

const SONGS = [mainTitle, mainNormal, mainBoss, shop, ...REGION_SONGS, ...BOSS_DRAFTS];

/** `npm run bgm -- field-` のように渡すと、ファイル名がその文字列で始まる曲だけ作る。 */
const only = process.argv[2];

mkdirSync(OUT_DIR, { recursive: true });
const AUDIO_SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'audio');
writeBossDraftCatalog(join(AUDIO_SRC, 'bossDrafts.ts'));
for (const song of SONGS.filter((s) => !only || s.file.startsWith(only))) {
  seedNoise(4242);
  const samples = renderSong(song);
  const file = join(OUT_DIR, `${song.file}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
