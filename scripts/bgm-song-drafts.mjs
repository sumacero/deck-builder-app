// タイトル曲の候補探し 第 8 弾（2026-10-06）: 「三つの旗 −試− 改」の改善案のうち、オーナーが気に入った
// 1（8 小節の上り坂 × イントロのドラムも加速）・6（刻みで溜める × サビの最後をレに解決）・9（ギターの泣き × 解決）を統合した版。
// 構成: イントロ 4（ドラムも加速）/ A メロ 8 / B メロ 8（五度圏を巡る）/ ため 8 / サビ 8（最後をレに解決）。
// 今の −試−（battle-boss.wav）とほかの曲が引用している素材は変えない。音源は song-draft-01.wav、図鑑の一覧 src/audio/songDrafts.ts はこの台本が書き出す。
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
const brass = (vol, ...barsText) => ({ inst: 'brassLead', vol, notes: join4(...barsText) });
const guitar = (vol, ...barsText) => ({ inst: 'guitarLead', vol, notes: join4(...barsText) });

/**
 * 強弱の段差: A メロ・B メロを抑えて、サビだけが全開に聞こえるようにする。
 * A メロはドラムも 8 ビートに落とす。ため後半は 1 小節ずつ上げてロールの小節を一番大きく。
 */
const VERSE_LEVEL = 0.75;
const RUN_LEVEL = 0.78;
const BUILD_RAMP = [0.85, 1.0, 1.15, 1.3];

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
  { drums: 'timp', level: 0.6 },
  { drums: 'half', level: 0.7 },
  { drums: 'rock', level: 0.8 },
  { drums: 'double', level: 0.85, fill: 'toms' },
];
const intro = INTRO_BARS.map((notes, i) =>
  bossIntroSection({ chords: [INTRO_CHORDS[i]], notes, organShift: 0, arrange: { fill: undefined, ...ACCEL[i] } }),
);

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
 * 後半は 1 小節ずつ音量を上げ、ロールの小節を一番大きくしてサビへ飛び込む。
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
    chords: bars('Gm', 'A', 'Bb', 'A'),
    parts: [
      brass(0.38, 'D6:4', 'E6:4', 'F6:4', 'E6:2 C#6:2'),
      guitar(0.2, x8('G5 G5 G5 G5 G5 G5 G5 G5'), x8('A5 A5 A5 A5 A5 A5 A5 A5'), x16('Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5 Bb5'), x16('C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6 C#6')),
    ],
    comp: ['strings', 'brassHits'],
    bass: 'drive8',
    drums: 'march',
    fill: 'roll',
  },
];
const build = [buildCalm, ...rampBars(buildRise, BUILD_RAMP)];

/** サビ: 最後の小節を高いラで終わらずレに解決させる（コードも A → Dm）。イントロの頭の B♭ へなめらかにつながる。 */
const chorusNotes = join4(...CHORUS_BARS.slice(0, 7), 'A5:0.5 C#6:0.5 E6:0.5 G6:0.5 F6:1 D6:1');
const resolvedChorus = {
  ...chorus,
  chords: bars(...CHORUS_CHORDS.slice(0, 7), 'A Dm'),
  parts: [
    { inst: 'brassLead', vol: 0.4, notes: chorusNotes },
    { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(chorusNotes, -1) },
  ],
};

const SONGS = [
  {
    no: 1,
    name: '三つの旗 −試− 改 統合版',
    desc: '改善案 1・6・9 の統合。イントロはドラムも一緒に加速。ためは 8 小節で、前半はギターが歌い、後半は金管が上り詰めてギターの刻みと行進のスネアで押す。サビの最後はレに解決してイントロへ戻る。A メロ・B メロを抑え、ため後半は 1 小節ずつ大きくして、サビが一番大きく聞こえるようにした。',
    sections: [...intro, { ...verse, drums: 'rock', level: VERSE_LEVEL }, { ...run, level: RUN_LEVEL }, ...build, resolvedChorus],
  },
];

/** 1 小節ずつ 4 拍かを確かめる（renderSong は部分全体の拍数しか見ないため）。 */
for (const song of SONGS) {
  for (const section of song.sections) {
    for (const part of section.parts ?? []) {
      part.notes.split('|').forEach((text, i) => {
        const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
        if (Math.abs(beats - 4) > 1e-9) throw new Error(`試作 ${song.no} ${section.name} ${part.inst} の ${i + 1} 小節目: ${beats} 拍`);
      });
    }
  }
}

export const SONG_DRAFTS = SONGS.map((song) => ({ file: `song-draft-${pad2(song.no)}`, bpm: BOSS_BPM, mix: BOSS_MIX, sections: song.sections }));

export const writeSongDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'song',
    label: '試作',
    script: 'scripts/bgm-song-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 8 弾: 三つの旗 −試− 改の改善案 1・6・9 を統合した版。図鑑で聞くだけで、ゲーム中には流れない。',
    entries: SONGS.map((song) => ({ no: song.no, name: song.name, desc: song.desc, bpm: BOSS_BPM })),
  });
