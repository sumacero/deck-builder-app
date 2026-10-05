// タイトル曲の候補探し 第 7 弾（2026-10-05）: 「三つの旗 −試− 改」の改善案 10 曲。
// 改の構成: イントロ（【イントロ案 26】速まる足音 + 【29】サビの予告）/ A メロ / B メロ（【B メロ案 13】五度圏を巡る、8 小節）/ ため / サビ。
// オーナー: 「ため」を全体のバランスに合うように（B メロが 8 小節に伸びたので、4 小節の長い音だけでは釣り合わない）、
// ループ時の不自然さ（サビの最後の高いラ＋ツーバスから、いきなりゆったりしたイントロに戻る）も解消。
// ため 5 種 × ループの直し方 4 種から 10 通りを組み合わせる。
// 今の −試−（battle-boss.wav）とほかの曲が引用している素材は変えない。音源は song-draft-01〜10.wav、図鑑の一覧 src/audio/songDrafts.ts はこの台本が書き出す。
import { BOSS_AFTER_INTRO, BOSS_BPM, BOSS_MIX, bossIntroSection } from './bgm-boss.mjs';
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { pad2, writeDraftCatalog } from './bgm-melody.mjs';
import { bars, join4 } from './bgm-song.mjs';
import { CHORUS_BARS, CHORUS_CHORDS } from './bgm-theme.mjs';

const [verse, , , chorus] = BOSS_AFTER_INTRO;

const at = (beats) => (names) => names.split(' ').map((name) => `${name}:${beats}`).join(' ');
const x16 = at(0.25);
const x8 = at(0.5);
const b = (...pieces) => pieces.join(' ');

// ===== 改で決まったパート =====

/** イントロ: サビ頭の「レー・ドー・シ♭」の形を、小節ごとに倍の速さにしていく。 */
const INTRO_CHORDS = ['Bb', 'C Dm', 'Gm C', 'A'];
const INTRO_BARS = [
  'D6:1.5 C6:1.5 Bb5:1',
  'E6:0.75 D6:0.75 C6:0.5 F6:0.75 E6:0.75 D6:0.5',
  'D6:0.5 C6:0.5 Bb5:0.5 G5:0.5 E6:0.5 D6:0.5 C6:0.5 G5:0.5',
  'F6:0.25 E6:0.25 D6:0.25 C#6:0.25 E6:0.25 D6:0.25 C#6:0.25 A5:0.25 E5:1 C#5:1',
];
const intro = bossIntroSection({ chords: INTRO_CHORDS, notes: join4(...INTRO_BARS), organShift: 0 });

/** イントロのドラムも旋律と一緒に加速させる（ティンパニ → ハーフ → 8 ビート → ツーバス）。 */
const ACCEL = [
  { drums: 'timp', level: 0.7 },
  { drums: 'half', level: 0.8 },
  { drums: 'rock', level: 0.9 },
  { drums: 'double', level: 1, fill: 'toms' },
];
const introAccel = INTRO_BARS.map((notes, i) =>
  bossIntroSection({ chords: [INTRO_CHORDS[i]], notes, organShift: 0, arrange: { fill: undefined, ...ACCEL[i] } }),
);

/** B メロ: 五度圏を巡る（8 小節）。 */
const RUN = {
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

// ===== ため 5 種（どれも属和音 A で終わり、サビの B♭ へ） =====

const brass = (vol, ...barsText) => ({ inst: 'brassLead', vol, notes: join4(...barsText) });
const guitar = (vol, ...barsText) => ({ inst: 'guitarLead', vol, notes: join4(...barsText) });

const BUILDS = {
  slope: {
    name: '8 小節の上り坂',
    desc: 'ためを 8 小節に。金管の長い音が 1 段ずつ 8 段上がり、後半は行進のスネアと金管の合いの手で盛り上げる',
    sections: [
      { name: 'build', chords: bars('Gm', 'A', 'Bb', 'A'), parts: [brass(0.34, 'G5:4', 'A5:4', 'Bb5:4', 'C#6:4')], comp: ['strings'], bass: 'sustain', drums: 'half', level: 0.85 },
      { name: 'build2', chords: bars('Gm', 'A', 'Bb', 'A'), parts: [brass(0.38, 'D6:4', 'E6:4', 'F6:4', 'E6:2 C#6:2')], comp: ['strings', 'brassHits'], bass: 'octave', drums: 'march', fill: 'roll' },
    ],
  },
  shadow: {
    name: 'サビの影',
    desc: 'ためを 8 小節に。サビ頭の「レー・ドー・シ♭」を 4 倍の長さにして金管がゆったり予告する',
    sections: [
      { name: 'build', chords: bars('Bb', 'C', 'Gm', 'A'), parts: [brass(0.34, 'D6:3 C6:1', 'C6:2 Bb5:2', 'G5:2 Bb5:2', 'A5:4')], comp: ['strings'], bass: 'sustain', drums: 'half', level: 0.85 },
      { name: 'build2', chords: bars('C', 'Dm', 'Gm', 'A'), parts: [brass(0.38, 'E6:3 D6:1', 'D6:2 C6:2', 'Bb5:2 D6:2', 'C#6:2 E6:2')], comp: ['strings', 'brassHits'], bass: 'octave', drums: 'march', fill: 'roll' },
    ],
  },
  pulse: {
    name: '刻みで溜める',
    desc: 'ためは 4 小節のまま。金管の長い音の下でギターが同じ音を 8 分 → 16 分で刻み、行進のスネアで前へ押す',
    sections: [
      {
        name: 'build',
        chords: bars('Gm', 'A', 'Bb', 'A'),
        parts: [
          brass(0.36, 'G5:4', 'A5:4', 'Bb5:4', 'C#6:4'),
          guitar(0.2, x8('G5 G5 G5 G5 G5 G5 G5 G5'), x8('A5 A5 A5 A5 A5 A5 A5 A5'), x16('Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5'), x16('C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6')),
        ],
        comp: ['strings', 'chug'],
        bass: 'drive8',
        drums: 'march',
        fill: 'roll',
      },
    ],
  },
  breath: {
    name: '息継ぎ',
    desc: 'ためを 8 小節に。忙しい B メロのあと、前半はドラムを止めて弦と金管だけで小さく息をつき、後半のティンパニとロールで一気に溜める',
    sections: [
      { name: 'build', chords: bars('Gm', 'A', 'Bb', 'A'), parts: [brass(0.3, 'G5:4', 'A5:4', 'Bb5:4', 'C#6:4')], comp: ['strings'], bass: 'sustain', drums: 'none', level: 0.6 },
      { name: 'build2', chords: bars('Gm', 'A', 'Bb', 'A'), parts: [brass(0.36, 'D6:4', 'E6:4', 'F6:4', 'E6:2 C#6:2')], comp: ['strings', 'brassHits'], bass: 'octave', drums: 'timp', fill: 'roll', level: 0.9 },
    ],
  },
  cry: {
    name: 'ギターの泣き',
    desc: 'ためを 8 小節に。ギターが歌う旋律を乗せ、後半は金管の長い音が重なって高まっていく',
    sections: [
      { name: 'build', chords: bars('Gm', 'A', 'Bb', 'A'), parts: [guitar(0.38, 'G5:1.5 A5:0.5 Bb5:2', 'A5:3 E5:1', 'F5:1.5 G5:0.5 A5:2', 'C#6:4')], comp: ['strings'], bass: 'sustain', drums: 'half', level: 0.9 },
      {
        name: 'build2',
        chords: bars('Gm', 'A', 'Bb', 'A'),
        parts: [guitar(0.38, 'D6:1.5 C6:0.5 Bb5:2', 'C#6:3 A5:1', 'D6:1 E6:1 F6:2', 'E6:4'), brass(0.2, 'D6:4', 'E6:4', 'F6:4', 'E6:4')],
        comp: ['strings'],
        bass: 'octave',
        drums: 'march',
        fill: 'roll',
      },
    ],
  },
};

// ===== ループの直し方 4 種 =====

/** サビの最後の小節を、高いラで終わらずレに解決させた版（コードも A → Dm）。 */
const resolvedChorusNotes = join4(...CHORUS_BARS.slice(0, 7), 'A5:0.5 C#6:0.5 E6:0.5 G6:0.5 F6:1 D6:1');
const resolvedChorus = {
  ...chorus,
  chords: bars(...CHORUS_CHORDS.slice(0, 7), 'A Dm'),
  parts: [
    { inst: 'brassLead', vol: 0.4, notes: resolvedChorusNotes },
    { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(resolvedChorusNotes, -1) },
  ],
};

const LOOPS = {
  accel: {
    name: 'イントロのドラムも加速',
    desc: 'イントロのドラムを旋律と一緒にティンパニ → ハーフ → 8 ビート → ツーバスと加速させ、ゆったりした頭に自然に戻る',
    head: introAccel,
    chorus,
    tail: [],
  },
  ending: {
    name: '終止の 2 小節',
    desc: 'サビのあとに、金管とギターがレを伸ばして静まる 2 小節を足し、落ち着いてからイントロへ戻る',
    head: [intro],
    chorus,
    tail: [
      {
        name: 'ending',
        chords: bars('Dm', 'Dm'),
        parts: [
          { inst: 'brassLead', vol: 0.36, notes: 'D6:4 | -:4' },
          { inst: 'guitarLead', vol: 0.22, notes: 'D5:4 | -:4' },
        ],
        comp: ['strings'],
        bass: 'sustain',
        drums: 'timp',
        level: 0.8,
      },
    ],
  },
  resolve: {
    name: 'サビの最後をレに解決',
    desc: 'サビの最後を高いラで終わらずレに落ち着かせ、イントロの頭（B♭）へなめらかにつなぐ。イントロのドラムも加速させる',
    head: introAccel,
    chorus: resolvedChorus,
    tail: [],
  },
  kime: {
    name: 'キメの 1 小節',
    desc: 'サビのあとに、全員でレを 1 発鳴らして止まり、タムの合図だけでイントロへ戻る 1 小節を足す',
    head: [intro],
    chorus,
    tail: [
      {
        name: 'kime',
        chords: bars('Dm'),
        parts: [
          { inst: 'brassLead', vol: 0.4, notes: 'D6:1 -:3' },
          { inst: 'guitarLead', vol: 0.3, notes: 'D5:1 -:3' },
        ],
        comp: [],
        drums: 'none',
        fill: 'toms',
      },
    ],
  },
};

// ===== 10 通りの組み合わせ =====

const COMBOS = [
  ['slope', 'accel'],
  ['slope', 'ending'],
  ['shadow', 'resolve'],
  ['shadow', 'accel'],
  ['pulse', 'kime'],
  ['pulse', 'resolve'],
  ['breath', 'accel'],
  ['breath', 'ending'],
  ['cry', 'resolve'],
  ['cry', 'kime'],
];

const SONGS = COMBOS.map(([buildKey, loopKey], i) => {
  const build = BUILDS[buildKey];
  const loop = LOOPS[loopKey];
  return {
    no: i + 1,
    name: `${build.name} × ${loop.name}`,
    desc: `ため: ${build.desc}。ループ: ${loop.desc}。`,
    sections: [...loop.head, verse, RUN, ...build.sections, loop.chorus, ...loop.tail],
  };
});

/** 1 小節ずつ 4 拍かを確かめる（renderSong は部分全体の拍数しか見ないため）。 */
for (const song of SONGS) {
  for (const section of song.sections) {
    for (const part of section.parts ?? []) {
      part.notes.split('|').forEach((text, i) => {
        const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
        if (Math.abs(beats - 4) > 1e-9) throw new Error(`改善案 ${song.no} ${section.name} ${part.inst} の ${i + 1} 小節目: ${beats} 拍`);
      });
    }
  }
}

export const SONG_DRAFTS = SONGS.map((song) => ({ file: `song-draft-${pad2(song.no)}`, bpm: BOSS_BPM, mix: BOSS_MIX, sections: song.sections }));

export const writeSongDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'song',
    label: '改善案',
    script: 'scripts/bgm-song-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 7 弾: 三つの旗 −試− 改の「ため」とループの継ぎ目を直した改善案 10 曲。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: SONGS.map((song) => ({ no: song.no, name: song.name, desc: song.desc, bpm: BOSS_BPM })),
  });
