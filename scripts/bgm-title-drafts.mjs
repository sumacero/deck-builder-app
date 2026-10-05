// タイトル曲の試作 30 案（2026-10-05）。図鑑の「🎵 BGM」で今のタイトル曲と聞き比べ、選ばれた案をタイトル曲に置き換える。
// ファイルは title-draft-01.wav 〜 title-draft-30.wav。番号と名前は src/audio/titleDrafts.ts と合わせる。
import { shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, remapPhrase, stretchPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { CHORUS, CHORUS_CHORDS, CHORUS_BARS, D_MAJOR, VERSE, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

// ===== 今のタイトル曲の素材 =====

/** 笛の新しい旋律（出だし）。 */
const OPENING = join4('A5:2 G5:1 F5:1', 'D5:3 F5:1', 'C5:2 F5:1 A5:1', 'G5:4');
const OPENING_CHORDS = ['Dm', 'Bb', 'F', 'C'];
/** 締め（属和音で終わり、曲頭に戻る）。 */
const CLOSING = join4('D5:2 F5:2', 'Bb5:2 A5:1 G5:1', 'A5:3 E5:1', 'C#5:4');
const CLOSING_CHORDS = ['Bb', 'Gm', 'A', 'A7'];
/** A メロの頭 2 小節を倍の長さに（4 小節）。 */
const VERSE_HEAD = stretchPhrase(join4(...VERSE_BARS.slice(0, 2)), 2);
const VERSE_HEAD_CHORDS = ['Dm', 'Dm', 'C', 'C'];
/** A メロの 3〜4 小節目を倍の長さに（4 小節）。 */
const VERSE_RISE = stretchPhrase(join4(...VERSE_BARS.slice(2, 4)), 2);
const VERSE_RISE_CHORDS = ['Bb', 'Bb', 'A', 'A'];
/** A メロの前半 4 小節（元の長さ）。 */
const VERSE_HALF = join4(...VERSE_BARS.slice(0, 4));
const VERSE_HALF_CHORDS = VERSE_CHORDS.slice(0, 4);

const major = (text) => remapPhrase(text, D_MAJOR);

// ===== 組み立ての略記 =====

/** 1 部分。chords はコード記号の配列。 */
const S = (name, chords, parts, rest = {}) => ({
  name,
  chords: bars(...chords),
  parts,
  bass: 'sustain',
  drums: 'none',
  ...rest,
});
const P = (inst, vol, notes, extra = {}) => ({ inst, vol, notes, ...extra });
const song = (no, bpm, mix, sections) => ({ file: `title-draft-${String(no).padStart(2, '0')}`, bpm, mix, sections });

const SOFT = { reverbLevel: 0.85, tone: 0.45, echoLevel: 0.35 };
const GRAND = { reverbLevel: 0.9, tone: 0.5, echoLevel: 0.3 };
const BRIGHT = { reverbLevel: 0.6, tone: 0.65, echoLevel: 0.25 };
const LOUD = { drive: 0.4, tone: 0.7 };

// ===== 新しい旋律 =====

/** 8. 合唱風のゆっくりした旋律。 */
const CHORALE = join4('D5:2 F5:2', 'E5:2 D5:2', 'C5:2 D5:1 F5:1', 'A5:4');
const CHORALE_2 = join4('Bb5:2 A5:2', 'G5:2 F5:2', 'E5:2 F5:1 G5:1', 'A5:4');

/** 9. 疾走する 8 分の駆け回り。 */
const RUSH = join4(
  'D5:0.5 F5:0.5 A5:0.5 D6:0.5 C6:0.5 A5:0.5 F5:0.5 A5:0.5',
  'Bb5:0.5 A5:0.5 G5:0.5 F5:0.5 G5:1 D5:1',
  'C5:0.5 E5:0.5 G5:0.5 C6:0.5 Bb5:0.5 G5:0.5 E5:0.5 G5:0.5',
  'A5:1.5 E5:0.5 C#6:2',
);
const RUSH_CHORDS = ['Dm', 'Gm', 'C', 'A'];

/** 10. 郷愁の旋律。 */
const NOSTALGIA = join4('F5:1.5 E5:0.5 D5:1 A4:1', 'Bb4:2 C5:1 D5:1', 'E5:1.5 D5:0.5 C5:1 G4:1', 'A4:4');
const NOSTALGIA_2 = join4('D5:1.5 E5:0.5 F5:1 A5:1', 'G5:2 F5:1 E5:1', 'F5:1 E5:1 D5:1 C#5:1', 'D5:4');

/** 16. ケルト風の跳ねる旋律（ドリア旋法）。 */
const CELTIC = join4(
  'D5:0.75 E5:0.25 F5:0.5 A5:0.5 G5:0.75 F5:0.25 E5:0.5 C5:0.5',
  'D5:0.75 E5:0.25 F5:0.5 G5:0.5 A5:2',
  'C6:0.75 A5:0.25 G5:0.5 E5:0.5 F5:0.75 E5:0.25 D5:0.5 C5:0.5',
  'D5:1.5 A4:0.5 D5:2',
);

/** 22. ヘ長調で終わる締め。 */
const F_ENDING = join4('F5:2 A5:2', 'Bb5:2 A5:1 G5:1', 'A5:2 G5:1 E5:1', 'F5:4');

/** 29. アニメの主題歌風。 */
const ANIME = join4(
  'A5:0.5 A5:0.5 G5:0.5 A5:0.5 -:0.5 F5:0.5 G5:0.5 A5:0.5',
  'Bb5:1 A5:0.5 G5:0.5 F5:1 D5:1',
  'G5:0.5 G5:0.5 F5:0.5 G5:0.5 -:0.5 E5:0.5 F5:0.5 G5:0.5',
  'A5:2 C#6:1 E6:1',
);
const ANIME_2 = join4('C6:1 A5:0.5 C6:0.5 D6:1 C6:1', 'Bb5:1 A5:0.5 G5:0.5 A5:2', 'F5:0.5 G5:0.5 A5:0.5 Bb5:0.5 C6:1 D6:1', 'E6:2 C#6:2');

/** 5. 金管のファンファーレ。導入の動機の「レ・レ」の刻みを、ラッパの 3 連打に。 */
const FANFARE = join4(
  'D5:0.25 D5:0.25 D5:0.5 A5:1.5 -:0.5 F5:0.5 A5:0.5',
  'Bb5:1.5 A5:0.5 G5:0.5 F5:0.5 G5:1',
  'A5:0.25 A5:0.25 A5:0.5 D6:1.5 -:0.5 C6:0.5 Bb5:0.5',
  'A5:3 -:1',
);

// ===== 30 案 =====

/** 今のタイトル曲の 3 部分（出だし・A メロの頭・締め）。多くの案の土台。 */
const baseSections = () => [
  S('opening', OPENING_CHORDS, [P('flute', 0.4, OPENING)], { comp: ['arp8', 'pad'] }),
  S('verse-head', VERSE_HEAD_CHORDS, [P('brassLead', 0.32, VERSE_HEAD)], { comp: ['strings', 'arp8'], drums: 'timp' }),
  S('closing', CLOSING_CHORDS, [P('flute', 0.38, CLOSING)], { comp: ['arp8', 'pad'] }),
];

export const TITLE_DRAFTS = [
  // 1. −凱− オーケストラ版
  song(1, 72, GRAND, [
    S('opening', OPENING_CHORDS, [P('brassLead', 0.34, OPENING, { double: -1 })], { comp: ['strings', 'arp8'], drums: 'timp' }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('brassLead', 0.36, VERSE_HEAD), P('strings', 0.2, shiftPhrase(VERSE_HEAD, -1))], {
      comp: ['strings', 'brassHits', 'arp8'],
      drums: 'timp',
      fill: 'roll',
    }),
    S('verse-rise', VERSE_RISE_CHORDS, [P('brassLead', 0.38, VERSE_RISE), P('flute', 0.18, shiftPhrase(VERSE_RISE, 1))], {
      comp: ['strings', 'brassHits', 'arp8'],
      drums: 'march',
    }),
    S('closing', CLOSING_CHORDS, [P('brassLead', 0.32, CLOSING, { double: -1 })], { comp: ['strings', 'arp8'], drums: 'timp' }),
  ]),

  // 2. −夜明け− ハープだけで始まり楽器が増えていく
  song(2, 72, GRAND, [
    S('harp-alone', OPENING_CHORDS, [], { comp: ['arp8'], bass: undefined }),
    S('flute', OPENING_CHORDS, [P('flute', 0.36, OPENING)], { comp: ['arp8', 'pad'] }),
    S('strings-join', VERSE_HEAD_CHORDS, [P('flute', 0.34, VERSE_HEAD), P('strings', 0.18, shiftPhrase(VERSE_HEAD, -1))], {
      comp: ['arp8', 'strings'],
      drums: 'timp',
      fill: 'roll',
    }),
    S('brass-sings', VERSE_RISE_CHORDS, [P('brassLead', 0.38, VERSE_RISE, { double: -1 }), P('flute', 0.2, shiftPhrase(VERSE_RISE, 1))], {
      comp: ['strings', 'brassHits', 'arp16'],
      drums: 'march',
    }),
    S('afterglow', CLOSING_CHORDS, [P('flute', 0.34, CLOSING)], { comp: ['arp8', 'pad'] }),
  ]),

  // 3. −予兆− 最後にサビの頭を遠くの金管で
  song(3, 72, SOFT, [
    ...baseSections(),
    S('distant-chorus', ['Bb', 'C', 'Bb', 'A'], [P('brassLead', 0.2, join4(CHORUS_BARS[0], CHORUS_BARS[1], 'D6:2 C6:1 Bb5:1', 'A5:4'), { send: 0.7 })], {
      comp: ['pad', 'arp8'],
      drums: 'timp',
      energy: 0.5,
    }),
  ]),

  // 4. −旗揚げ− ファンファーレで幕を開ける
  song(4, 72, GRAND, [
    S('fanfare', ['Dm', 'Gm C', 'Dm Bb', 'A'], [P('brassLead', 0.4, FANFARE, { double: -1 })], {
      comp: ['brassHits', 'strings'],
      drums: 'timp',
      fill: 'roll',
    }),
    ...baseSections(),
  ]),

  // 5. −光− ニ長調で明るく
  song(5, 92, BRIGHT, [
    S('opening', ['D', 'Bm', 'F#m', 'G'], [P('flute', 0.4, major(OPENING))], { comp: ['arp8', 'pad'], drums: 'light' }),
    S('verse-head', ['D', 'D', 'A', 'A'], [P('bell', 0.3, major(VERSE_HEAD)), P('flute', 0.2, major(VERSE_HEAD))], { comp: ['strings', 'arp8'], drums: 'light' }),
    S('closing', ['G', 'Em', 'A', 'A7'], [P('flute', 0.38, major(CLOSING))], { comp: ['arp8', 'pad'], drums: 'light' }),
  ]),

  // 6. −光の行進− ニ長調で金管の行進
  song(6, 112, BRIGHT, [
    S('opening', ['D', 'Bm', 'F#m', 'G'], [P('brassLead', 0.36, major(OPENING))], { comp: ['strings', 'brassHits'], drums: 'march' }),
    S('verse', ['D', 'A7', 'Bm', 'A', 'G', 'A', 'D Bm', 'A'], [P('brassLead', 0.38, major(VERSE)), P('flute', 0.16, shiftPhrase(major(VERSE), 1))], {
      comp: ['strings', 'brassHits', 'arp8'],
      bass: 'walk',
      drums: 'march',
      fill: 'snare',
    }),
    S('closing', ['G', 'Em', 'A', 'A7'], [P('brassLead', 0.34, major(CLOSING))], { comp: ['strings'], drums: 'march', fill: 'roll' }),
  ]),

  // 7. −風の旅人− 16 分のハープに乗せて軽やかに
  song(7, 96, BRIGHT, [
    S('opening', OPENING_CHORDS, [P('flute', 0.4, OPENING)], { comp: ['arp16', 'pad'], drums: 'light' }),
    S('verse-half', VERSE_HALF_CHORDS, [P('flute', 0.4, VERSE_HALF)], { comp: ['arp16', 'strings'], drums: 'light' }),
    S('closing', CLOSING_CHORDS, [P('flute', 0.38, CLOSING), P('bell', 0.14, shiftPhrase(CLOSING, 1))], { comp: ['arp16', 'pad'], drums: 'light' }),
  ]),

  // 8. −蒼の紋章− 合唱風の荘厳な新曲
  song(8, 60, GRAND, [
    S('chorale', ['Dm', 'C', 'F', 'A'], [P('strings', 0.34, CHORALE, { double: -1 })], { comp: ['pad'], drums: 'timp' }),
    S('chorale-2', ['Gm', 'Dm', 'C', 'A'], [P('strings', 0.36, CHORALE_2, { double: -1 })], { comp: ['pad', 'organ'], drums: 'timp', fill: 'roll' }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('organ', 0.3, VERSE_HEAD)], { comp: ['pad', 'strings'], drums: 'timp' }),
  ]),

  // 9. −星詠みの旅路− 疾走する新曲
  song(9, 132, LOUD, [
    S('rush', RUSH_CHORDS, [P('triLead', 0.36, RUSH)], { comp: ['stabs'], bass: 'octave', drums: 'drive', fill: 'snare' }),
    S('verse', VERSE_CHORDS, [P('synthBrass', 0.34, VERSE)], { comp: ['stabs', 'pad'], bass: 'octave', drums: 'drive', fill: 'toms' }),
    S('rush-again', RUSH_CHORDS, [P('triLead', 0.36, RUSH), P('synthBrass', 0.2, shiftPhrase(RUSH, -1))], {
      comp: ['stabs', 'strings'],
      bass: 'octave',
      drums: 'double',
      fill: 'toms',
    }),
  ]),

  // 10. −忘れられた王国− しっとりした郷愁の新曲
  song(10, 66, SOFT, [
    S('nostalgia', ['Dm', 'Bb', 'C', 'A'], [P('bell', 0.34, NOSTALGIA)], { comp: ['arp8', 'pad'] }),
    S('nostalgia-2', ['Dm', 'Gm', 'Bb A', 'Dm'], [P('bell', 0.3, NOSTALGIA_2), P('flute', 0.16, NOSTALGIA_2, { send: 0.6 })], { comp: ['arp8', 'pad'] }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('flute', 0.22, VERSE_HEAD, { send: 0.6 })], { comp: ['arp8', 'pad'] }),
  ]),

  // 11. −剣と祈り− 前半は勇ましい金管、後半はやさしい笛
  song(11, 92, GRAND, [
    S('brave', VERSE_CHORDS, [P('brassLead', 0.38, VERSE, { double: -1 })], { comp: ['strings', 'brassHits'], drums: 'march', fill: 'roll' }),
    S('gentle', OPENING_CHORDS, [P('flute', 0.38, OPENING)], { comp: ['arp8', 'pad'] }),
    S('gentle-close', CLOSING_CHORDS, [P('flute', 0.36, CLOSING)], { comp: ['arp8', 'pad'] }),
  ]),

  // 12. −聖堂− オルガンの独奏
  song(12, 64, GRAND, [
    S('opening', OPENING_CHORDS, [P('organ', 0.3, OPENING)], { comp: ['pad'] }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('organ', 0.32, VERSE_HEAD, { double: -1 })], { comp: ['pad', 'organ'], drums: 'timp' }),
    S('closing', CLOSING_CHORDS, [P('organ', 0.3, CLOSING)], { comp: ['pad'] }),
  ]),

  // 13. −オルゴール− 高いベルだけで
  song(13, 84, SOFT, [
    S('opening', OPENING_CHORDS, [P('bell', 0.34, shiftPhrase(OPENING, 1))], { comp: ['arp8'], bass: undefined }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('bell', 0.32, shiftPhrase(VERSE_HEAD, 1))], { comp: ['arp8'], bass: undefined }),
    S('closing', CLOSING_CHORDS, [P('bell', 0.32, shiftPhrase(CLOSING, 1))], { comp: ['arp8'], bass: undefined }),
  ]),

  // 14. −弦の誓い− 弦楽合奏
  song(14, 76, GRAND, [
    S('opening', OPENING_CHORDS, [P('strings', 0.36, OPENING)], { comp: ['arp16', 'strings'] }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('strings', 0.38, VERSE_HEAD, { double: -1 })], { comp: ['arp16', 'strings'], drums: 'timp' }),
    S('closing', CLOSING_CHORDS, [P('strings', 0.36, CLOSING)], { comp: ['arp16', 'strings'] }),
  ]),

  // 15. −小夜曲− 丸いエレピの独奏
  song(15, 70, SOFT, [
    S('opening', OPENING_CHORDS, [P('softKey', 0.4, OPENING)], { comp: ['pad'] }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('softKey', 0.4, VERSE_HEAD)], { comp: ['pad', 'arp8'] }),
    S('closing', CLOSING_CHORDS, [P('softKey', 0.38, CLOSING)], { comp: ['pad'] }),
  ]),

  // 16. −妖精の丘− ケルト風の跳ねる新曲
  song(16, 104, BRIGHT, [
    S('celtic', ['Dm', 'Dm', 'C', 'Dm'], [P('flute', 0.4, CELTIC)], { comp: ['arp8'], bass: 'walk', drums: 'light' }),
    S('celtic-bell', ['Dm', 'Dm', 'C', 'Dm'], [P('flute', 0.4, CELTIC), P('bell', 0.16, shiftPhrase(CELTIC, 1))], { comp: ['arp8'], bass: 'walk', drums: 'tropical', energy: 0.6 }),
    S('verse-half', ['Dm', 'C', 'G', 'A'], [P('flute', 0.4, remapPhrase(VERSE_HALF, { Bb: 'B' }))], { comp: ['arp8', 'pad'], bass: 'walk', drums: 'light' }),
    S('celtic-again', ['Dm', 'Dm', 'C', 'Dm'], [P('flute', 0.4, CELTIC)], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'tropical', energy: 0.7 }),
  ]),

  // 17. −英雄の行進− 金管が A メロを全部歌う
  song(17, 108, GRAND, [
    S('opening', OPENING_CHORDS, [P('brassLead', 0.34, OPENING)], { comp: ['strings', 'brassHits'], drums: 'march' }),
    S('verse', VERSE_CHORDS, [P('brassLead', 0.38, VERSE, { double: -1 })], { comp: ['strings', 'brassHits', 'arp8'], drums: 'march', fill: 'snare' }),
    S('closing', CLOSING_CHORDS, [P('brassLead', 0.34, CLOSING)], { comp: ['strings'], drums: 'march', fill: 'roll' }),
  ]),

  // 18. −烈火− ギターのロックアレンジ
  song(18, 140, LOUD, [
    S('opening', OPENING_CHORDS, [P('guitarLead', 0.36, OPENING)], { comp: ['chug'], bass: 'gallop', drums: 'rock', fill: 'toms' }),
    S('verse', VERSE_CHORDS, [P('guitarLead', 0.38, VERSE)], { comp: ['organ', 'chug'], bass: 'gallop', drums: 'drive', fill: 'snare' }),
    S('closing', CLOSING_CHORDS, [P('organ', 0.34, CLOSING)], { comp: ['chug'], bass: 'gallop', drums: 'half', fill: 'roll' }),
  ]),

  // 19. −蒼穹の翼− シンセの壮大なアレンジ
  song(19, 120, { reverbLevel: 0.7, tone: 0.6, echoLevel: 0.3 }, [
    S('opening', OPENING_CHORDS, [P('triLead', 0.36, OPENING)], { comp: ['stabs', 'pad'], bass: 'octave', drums: 'half' }),
    S('verse', VERSE_CHORDS, [P('synthBrass', 0.34, VERSE)], { comp: ['stabs', 'pad'], bass: 'octave', drums: 'drive', fill: 'toms' }),
    S('closing', CLOSING_CHORDS, [P('triLead', 0.34, CLOSING)], { comp: ['pad'], bass: 'octave', drums: 'half', fill: 'roll' }),
  ]),

  // 20. −砂の王都− 和声的短音階で異国風
  song(20, 96, BRIGHT, [
    S('opening', ['Dm', 'Bb', 'A', 'Gm'], [P('flute', 0.4, remapPhrase(OPENING, { C: 'C#' }))], { comp: ['arp8'], drums: 'desert' }),
    S('verse-half', ['Dm', 'A7', 'Bb', 'A'], [P('flute', 0.4, remapPhrase(VERSE_HALF, { C: 'C#' }))], { comp: ['arp8', 'pad'], drums: 'desert' }),
    S('closing', CLOSING_CHORDS, [P('flute', 0.38, CLOSING)], { comp: ['arp8'], drums: 'desertDrive' }),
    S('opening-bell', ['Dm', 'Bb', 'A', 'Gm'], [P('bell', 0.3, remapPhrase(OPENING, { C: 'C#' }))], { comp: ['arp8'], drums: 'desert', energy: 0.6 }),
  ]),

  // 21. −夜の城− ナポリの和音で妖しく
  song(21, 60, GRAND, [
    S('opening', ['Dm', 'Bb', 'F', 'Eb'], [P('strings', 0.34, shiftPhrase(OPENING, -1)), P('bell', 0.14, OPENING)], { comp: ['organ'], drums: 'shadow' }),
    S('closing', CLOSING_CHORDS, [P('strings', 0.32, shiftPhrase(CLOSING, -1))], { comp: ['organ'], drums: 'shadow' }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('organ', 0.28, VERSE_HEAD)], { comp: ['pad'], drums: 'shadow' }),
  ]),

  // 22. −星降る夜− 平行調のヘ長調で
  song(22, 80, SOFT, [
    S('opening', ['F', 'Dm', 'F', 'C'], [P('bell', 0.34, OPENING)], { comp: ['arp8', 'pad'] }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('softKey', 0.36, VERSE_HEAD), P('bell', 0.14, shiftPhrase(VERSE_HEAD, 1))], { comp: ['arp8', 'pad'] }),
    S('ending', ['Bb', 'Gm', 'C', 'F'], [P('bell', 0.34, F_ENDING)], { comp: ['arp8', 'pad'] }),
  ]),

  // 23. −昇る旗− A メロの頭をホ短調へ転調して盛り上げる
  song(23, 80, GRAND, [
    S('opening', OPENING_CHORDS, [P('flute', 0.4, OPENING)], { comp: ['arp8', 'pad'] }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('flute', 0.38, VERSE_HEAD)], { comp: ['arp8', 'strings'], drums: 'timp', fill: 'roll' }),
    S('verse-head-up', transposeSymbols(VERSE_HEAD_CHORDS, 2), [P('brassLead', 0.38, transposePhrase(VERSE_HEAD, 2), { double: -1 })], {
      comp: ['strings', 'brassHits'],
      drums: 'march',
    }),
    S('closing', CLOSING_CHORDS, [P('flute', 0.36, CLOSING)], { comp: ['arp8', 'pad'], drums: 'timp' }),
  ]),

  // 24. −ボレロ− 同じ旋律を 4 回、楽器と音量を増やしながら
  song(24, 84, GRAND, [
    S('1', OPENING_CHORDS, [P('flute', 0.32, OPENING)], { comp: ['arp8'], drums: 'march', energy: 0.25 }),
    S('2', OPENING_CHORDS, [P('flute', 0.34, OPENING), P('bell', 0.16, shiftPhrase(OPENING, 1))], { comp: ['arp8', 'pad'], drums: 'march', energy: 0.45 }),
    S('3', OPENING_CHORDS, [P('brassLead', 0.36, OPENING), P('strings', 0.18, shiftPhrase(OPENING, -1))], { comp: ['arp8', 'strings'], drums: 'march', energy: 0.7 }),
    S('4', OPENING_CHORDS, [P('brassLead', 0.4, OPENING, { double: -1 }), P('flute', 0.2, shiftPhrase(OPENING, 1))], {
      comp: ['arp16', 'strings', 'brassHits'],
      drums: 'march',
      fill: 'roll',
    }),
  ]),

  // 25. −呼び交わす声− 笛と金管の掛け合い
  song(25, 84, GRAND, [
    S('call', OPENING_CHORDS, [P('flute', 0.4, join4('A5:2 G5:1 F5:1', 'D5:3 F5:1', '-:4', '-:4')), P('brassLead', 0.34, join4('-:4', '-:4', 'C5:2 F5:1 A5:1', 'G5:4'))], {
      comp: ['arp8', 'pad'],
    }),
    S('together', VERSE_HEAD_CHORDS, [P('flute', 0.3, VERSE_HEAD), P('brassLead', 0.3, shiftPhrase(VERSE_HEAD, -1))], { comp: ['arp8', 'strings'], drums: 'timp' }),
    S('answer', CLOSING_CHORDS, [P('brassLead', 0.34, join4('D5:2 F5:2', 'Bb5:2 A5:1 G5:1', '-:4', '-:4')), P('flute', 0.38, join4('-:4', '-:4', 'A5:3 E5:1', 'C#5:4'))], {
      comp: ['arp8', 'pad'],
    }),
  ]),

  // 26. −野の花− ハープと笛だけの素朴な版
  song(26, 80, SOFT, [
    S('opening', OPENING_CHORDS, [P('flute', 0.4, OPENING)], { comp: ['arp8'], bass: undefined }),
    S('verse-half', VERSE_HALF_CHORDS, [P('flute', 0.4, VERSE_HALF)], { comp: ['arp8'], bass: undefined }),
    S('closing', CLOSING_CHORDS, [P('flute', 0.38, CLOSING)], { comp: ['arp8'], bass: undefined }),
  ]),

  // 27. −鋼の軍旗− 低い金管とタムの重厚な版
  song(27, 64, GRAND, [
    S('opening', OPENING_CHORDS, [P('brassLead', 0.38, shiftPhrase(OPENING, -1))], { comp: ['brassHits', 'strings'], drums: 'tribal' }),
    S('verse-head', VERSE_HEAD_CHORDS, [P('brassLead', 0.4, shiftPhrase(VERSE_HEAD, -1))], { comp: ['brassHits', 'strings'], drums: 'tribal', fill: 'roll' }),
    S('closing', CLOSING_CHORDS, [P('brassLead', 0.38, shiftPhrase(CLOSING, -1)), P('strings', 0.2, CLOSING)], { comp: ['strings'], drums: 'tribal' }),
  ]),

  // 28. −全開− サビをタイトルで全部聞かせる（サビはボス戦で初登場という方針を崩す案）
  song(28, 96, GRAND, [
    S('opening', OPENING_CHORDS, [P('flute', 0.4, OPENING)], { comp: ['arp8', 'pad'], drums: 'timp', fill: 'roll' }),
    S('chorus', CHORUS_CHORDS, [P('brassLead', 0.4, CHORUS, { double: -1 }), P('flute', 0.16, shiftPhrase(CHORUS, 1))], {
      comp: ['strings', 'brassHits', 'arp8'],
      drums: 'march',
      fill: 'roll',
    }),
  ]),

  // 29. −翔べ、旗のもとへ− アニメ主題歌風の新曲
  song(29, 150, LOUD, [
    S('a', ['Dm', 'Bb', 'C', 'A'], [P('triLead', 0.36, ANIME)], { comp: ['stabs'], bass: 'slap', drums: 'drive', fill: 'snare' }),
    S('b', ['F', 'Gm', 'Bb C', 'A'], [P('synthBrass', 0.34, ANIME_2)], { comp: ['stabs', 'pad'], bass: 'slap', drums: 'drive', fill: 'toms' }),
    S('verse-half', VERSE_HALF_CHORDS, [P('guitarLead', 0.34, VERSE_HALF)], { comp: ['chug'], bass: 'slap', drums: 'rock', fill: 'snare' }),
    S('a-again', ['Dm', 'Bb', 'C', 'A'], [P('brassLead', 0.38, ANIME, { double: -1 })], { comp: ['stabs', 'strings'], bass: 'slap', drums: 'double' }),
    S('b-again', ['F', 'Gm', 'Bb C', 'A'], [P('brassLead', 0.38, ANIME_2, { double: -1 })], { comp: ['stabs', 'strings'], bass: 'slap', drums: 'double', fill: 'toms' }),
  ]),

  // 30. −静かな祈り− パッドとベルだけ
  song(30, 56, SOFT, [
    S('verse-head', ['Dm', 'Dm', 'Dm', 'Dm', 'C', 'C', 'C', 'C'], [P('bell', 0.3, stretchPhrase(VERSE_HEAD, 2))], { comp: ['pad'] }),
    S('closing', CLOSING_CHORDS, [P('bell', 0.28, CLOSING)], { comp: ['pad'] }),
  ]),
];
