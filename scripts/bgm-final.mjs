// ラスボス戦「三つの旗 −試− 改」（battle-final.wav、156 BPM・約 74 秒）。3 つの章を終えたあとの、星喰みの魔皇ノクスとの決戦で流れる。
// 元はタイトル曲の候補探し 第 8 弾（2026-10-06）の【試作 1】統合版: 「三つの旗 −試− 改」の改善案のうち、オーナーが気に入った
// 1（8 小節の上り坂 × イントロのドラムも加速）・6（刻みで溜める × サビの最後をレに解決）・9（ギターの泣き × 解決）を統合した版。
// 構成: イントロ 4（ドラムも加速）/ A メロ 8（前半は低く）/ B メロ 8（五度圏を巡る）/ ため 8（後半は G→A→B♭→C と上がる）/ サビ 20（2 回目はハモり、締めに後半 4 小節を回してレに解決）。
// 章のボス戦「三つの旗 −試−」（battle-boss.wav）もこの台本から作る（CHAPTER_BOSS_SONG、サビ抜き・楽器を減らし・140 BPM）。
// ほかの曲が引用している素材（bgm-theme.mjs）は変えない。
import { BOSS_AFTER_INTRO, BOSS_BPM, BOSS_MIX, bossIntroSection } from './bgm-boss.mjs';
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4 } from './bgm-song.mjs';
import { CHORUS_BARS, CHORUS_CHORDS, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

const [verse, , , chorus] = BOSS_AFTER_INTRO;

const at = (beats) => (names) => names.split(' ').map((name) => `${name}:${beats}`).join(' ');
const x16 = at(0.25);
const x8 = at(0.5);
const b = (...pieces) => pieces.join(' ');
const brass = (vol, ...barsText) => ({ inst: 'brassLead', vol, notes: join4(...barsText) });
const guitar = (vol, ...barsText) => ({ inst: 'guitarLead', vol, notes: join4(...barsText) });
const strings = (vol, ...barsText) => ({ inst: 'strings', vol, notes: join4(...barsText) });

/**
 * 強弱の段差: A メロ・B メロを抑えて、サビだけが全開に聞こえるようにする。
 * A メロはドラムも 8 ビートに落とす。ため後半は 1 小節ずつ上げてロールの小節を一番大きく。
 */
const VERSE_LOW_LEVEL = 0.72;
const VERSE_HIGH_LEVEL = 0.84;
const RUN_LEVEL = 0.78;
const BUILD_RAMP = [0.85, 1.0, 1.1, 1.28];

/**
 * イントロ: サビ頭の「レー・ドー・シ♭」の形を、小節ごとに倍の速さにしていく。
 * ドラムも旋律と一緒にティンパニ → ハーフ → 8 ビート → ツーバスと加速させ、サビの終わりからゆったりした頭へ自然に戻す。
 */
const INTRO_CHORDS = ['Bb', 'C Dm', 'Gm C', 'A'];
const INTRO_BARS = [
  'D6:1.5 C6:1.5 Bb5:1',
  'E6:0.75 D6:0.75 C6:0.5 F6:0.75 E6:0.75 D6:0.5',
  'D6:0.5 C6:0.5 Bb5:0.5 G5:0.5 E6:0.5 D6:0.5 C6:0.5 G5:0.5',
  'F6:0.25 E6:0.25 D6:0.25 C#6:0.25 E6:0.25 D6:0.25 C#6:0.25 A5:0.25 E5:1 C#5:1',
];
const ACCEL = [
  { drums: 'timp', level: 0.68 },
  { drums: 'half', level: 0.7 },
  { drums: 'rock', level: 0.8 },
  { drums: 'double', level: 0.85, fill: 'toms' },
];
const intro = INTRO_BARS.map((notes, i) =>
  bossIntroSection({ chords: [INTRO_CHORDS[i]], notes, organShift: 0, arrange: { fill: undefined, ...ACCEL[i] } }),
);

/**
 * A メロ: 前半 4 小節はギターが 1 オクターブ下で、弦と一緒に低く歌う（刻みだけの伴奏、8 ビート）。
 * 後半 4 小節は元の高さに上がり、オルガンの伴奏とドライブのドラムが加わる。
 */
const verseLow = join4(...VERSE_BARS.slice(0, 4).map((text) => shiftPhrase(text, -1)));
const verseSections = [
  {
    name: 'verse-low',
    chords: bars(...VERSE_CHORDS.slice(0, 4)),
    parts: [{ inst: 'guitarLead', vol: 0.44, notes: verseLow }, strings(0.24, verseLow)],
    comp: ['chug'],
    bass: 'gallop',
    drums: 'rock',
    level: VERSE_LOW_LEVEL,
  },
  { ...verse, name: 'verse-high', chords: bars(...VERSE_CHORDS.slice(4)), parts: [guitar(0.4, ...VERSE_BARS.slice(4))], level: VERSE_HIGH_LEVEL },
];

/** B メロ: 五度圏を巡る（8 小節）。 */
const run = {
  name: 'run',
  chords: bars('Dm', 'Gm', 'C', 'F', 'Bb', 'Gm', 'A', 'A'),
  parts: [
    {
      inst: 'organ',
      vol: 0.36,
      notes: join4(
        b(x16('D5 F5 A5 D6 A5 F5 A5 D6'), 'F6:1 D6:1'),
        b(x16('D5 G5 Bb5 D6 Bb5 G5 Bb5 D6'), 'G6:1 D6:1'),
        b(x16('C5 E5 G5 C6 G5 E5 G5 C6'), 'E6:1 C6:1'),
        b(x16('C5 F5 A5 C6 A5 F5 A5 C6'), 'F6:1 C6:1'),
        b(x16('D5 F5 Bb5 D6 Bb5 F5 Bb5 D6'), 'F6:1 D6:1'),
        b(x16('D5 G5 Bb5 D6 Bb5 G5 Bb5 D6'), 'G6:2'),
        b(x16('C#5 E5 A5 C#6 A5 E5 A5 C#6'), 'E6:1 C#6:1'),
        b(x16('E6 C#6 A5 E5 C#6 A5 E5 C#5'), 'A4:2'),
      ),
    },
  ],
  comp: ['chug'],
  bass: 'gallop',
  drums: 'double',
  fill: 'toms',
};

/** 部分を 1 小節ずつに分け、小節ごとに音量 levels を変える（2 小節目からは頭のシンバルを鳴らさない）。 */
const rampBars = (section, levels) => {
  const partBars = section.parts.map((part) => part.notes.split('|').map((text) => text.trim()));
  return levels.map((level, i) => ({
    ...section,
    name: `${section.name}-${i + 1}`,
    chords: [section.chords[i]],
    parts: section.parts.map((part, p) => ({ ...part, notes: partBars[p][i] })),
    fill: i === levels.length - 1 ? section.fill : undefined,
    crash: i === 0,
    level,
  }));
};

/**
 * ため（8 小節）: 前半はギターが歌い（案 9）、低い金管が支える。
 * 後半は金管の長い音が 1 段ずつ高く上がり（案 1）、ギターが同じ音を 8 分 → 16 分で刻んで行進のスネアと前へ押す（案 6）。
 * 後半はコードが Gm→A→B♭→C→A と 1 段ずつ上がり、1 小節ずつ音量を上げ、ロールの小節を一番大きくしてサビへ飛び込む。
 */
const [buildCalm, buildRise] = [
  {
    name: 'build',
    chords: bars('Gm', 'A', 'Bb', 'A'),
    parts: [guitar(0.38, 'G5:1.5 A5:0.5 Bb5:2', 'A5:3 E5:1', 'F5:1.5 G5:0.5 A5:2', 'C#6:4'), brass(0.24, 'G4:4', 'A4:4', 'Bb4:4', 'C#5:4')],
    comp: ['strings'],
    bass: 'sustain',
    drums: 'half',
    level: 0.7,
  },
  {
    name: 'build2',
    chords: bars('Gm', 'A', 'Bb', 'C A'),
    parts: [
      brass(0.38, 'D6:4', 'E6:4', 'F6:4', 'E6:2 C#6:2'),
      guitar(0.2, x8('G5 G5 G5 G5 G5 G5 G5 G5'), x8('A5 A5 A5 A5 A5 A5 A5 A5'), x16('Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5'), b(x16('C6 C6 C6 C6 C6 C6 C6 C6'), x16('C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6'))),
    ],
    comp: ['strings', 'brassHits'],
    bass: 'drive8',
    drums: 'march',
    fill: 'roll',
  },
];
const build = [buildCalm, ...rampBars(buildRise, BUILD_RAMP)];

/**
 * サビ（20 小節）: 1 回目は今のサビ（最後は高いラのまま 2 回目へ）。ドラムは 8 ビートで少し余力を残す。
 * 2 回目は金管の 3 度下のハモりと弦を足し、ツーバスで全開に（最後は高いラのまま）。
 * 締め（4 小節）で 2 回目の後半 4 小節（頂上へ駆け上がる部分）をもう一度回し、最後の小節でレに解決する（コードも A → Dm）。
 */
const chorus1 = { ...chorus, name: 'chorus1', drums: 'drive', level: 1.0 };

const HARMONY_BARS = [
  'Bb5:0.75 A5:0.75 G5:0.5 D5:1 Bb5:1',
  'C6:0.75 Bb5:0.75 A5:0.5 E5:1 C6:1',
  'A5:0.5 G#5:0.5 E5:0.5 C5:0.5 A5:1 C6:1',
  'A5:2 F5:1 D5:1',
  'G5:0.75 F5:0.75 E5:0.5 Bb4:1 G5:1',
  'A5:0.75 G5:0.75 F5:0.5 E5:0.5 C5:0.5 A5:1',
  'C5:0.5 F5:0.5 A5:0.5 C6:0.5 C#6:0.5 A5:0.5 E5:1',
  'E5:0.5 A5:0.5 C#6:0.5 E6:0.5 E6:2',
];
const RESOLVED_BAR = 'A5:0.5 C#6:0.5 E6:0.5 G6:0.5 F6:1 D6:1';
const RESOLVED_HARMONY_BAR = 'E5:0.5 A5:0.5 C#6:0.5 E6:0.5 D6:1 A5:1';

/** ハモり付きのサビの部分（旋律・ハモり・弦・1 オクターブ下のギター）。 */
const harmonizedChorus = (name, chords, melodyBars, harmonyBars) => {
  const melody = join4(...melodyBars);
  const harmony = join4(...harmonyBars);
  return {
    ...chorus,
    name,
    chords: bars(...chords),
    parts: [
      { inst: 'brassLead', vol: 0.4, notes: melody },
      { inst: 'brassLead', vol: 0.26, notes: harmony },
      { inst: 'strings', vol: 0.18, notes: harmony },
      { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(melody, -1) },
    ],
  };
};

const chorus2 = harmonizedChorus('chorus2', CHORUS_CHORDS, CHORUS_BARS, HARMONY_BARS);

/**
 * 締めとループ: 最後の 2 小節で少しずつ音量を下げ、解決の小節はハーフのドラムにしておかずも入れない。
 * レの響きが落ち着いたところで、イントロの静かなティンパニの小節に戻る。
 */
const tag = {
  ...harmonizedChorus(
    'tag',
    [...CHORUS_CHORDS.slice(4, 7), 'A Dm'],
    [...CHORUS_BARS.slice(4, 7), RESOLVED_BAR],
    [...HARMONY_BARS.slice(4, 7), RESOLVED_HARMONY_BAR],
  ),
  fill: undefined,
};
const TAG_RAMP = [1, 1, 0.94, 0.84];
const tagBars = rampBars(tag, TAG_RAMP).map((section, i) =>
  i === TAG_RAMP.length - 1 ? { ...section, drums: 'half', comp: ['stabs', 'strings'], bass: 'sustain' } : section,
);

export const FINAL_BOSS_SONG = {
  file: 'battle-final',
  bpm: BOSS_BPM,
  mix: BOSS_MIX,
  sections: [...intro, ...verseSections, { ...run, level: RUN_LEVEL }, ...build, chorus1, chorus2, ...tagBars],
};

/**
 * 章のボス戦「三つの旗 −試−」（battle-boss.wav、140 BPM・約 41 秒）。ラスボス戦からサビを丸ごと抜き、
 * 楽器を減らして、テンポも一回り落とした弟分。サビはラスボス戦で初めて鳴る。
 * ため後半（上り坂とロール）はサビへ飛び込むための部分なので、これもラスボス戦だけに残す。
 * ため前半の静かな 4 小節（A で止まる）から、加速するイントロへそのまま戻ってループする。
 * 減らすもの: イントロのオルガンの重ね、A メロ前半の弦の重ね・後半のオルガンの伴奏、ため前半の金管。
 */
const CHAPTER_BOSS_BPM = 140;

const withoutParts = (section, insts) => ({ ...section, parts: section.parts.filter((part) => !insts.includes(part.inst)) });

export const CHAPTER_BOSS_SONG = {
  file: 'battle-boss',
  bpm: CHAPTER_BOSS_BPM,
  mix: BOSS_MIX,
  sections: [
    ...intro.map((section) => withoutParts(section, ['organ'])),
    withoutParts(verseSections[0], ['strings']),
    { ...verseSections[1], comp: ['chug'] },
    { ...run, level: RUN_LEVEL },
    withoutParts(buildCalm, ['brassLead']),
  ],
};

/** 1 小節ずつ 4 拍かを確かめる（renderSong は部分全体の拍数しか見ないため）。 */
for (const section of [...FINAL_BOSS_SONG.sections, ...CHAPTER_BOSS_SONG.sections]) {
  for (const part of section.parts ?? []) {
    part.notes.split('|').forEach((text, i) => {
      const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
      if (Math.abs(beats - 4) > 1e-9) throw new Error(`ラスボス戦 ${section.name} ${part.inst} の ${i + 1} 小節目: ${beats} 拍`);
    });
  }
}
