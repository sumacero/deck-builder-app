// ラスボス戦のサビ前（上り坂 4 小節 + サビの頭 4 小節）だけを出す候補。
// 本番の battle-final.wav は変えない。node scripts/bgm-final-intro-samples.mjs
//
// 聴いた結論（2026-10-29）: 今の締めは金管の伸ばし（ファ、それからド♯）と 16 分の刻みに埋もれる。
// 「ラ・ラ」の休符は聞こえず、最後のラはド♯の下で消える。サビの「レー・ドー・シ♭」は、その混み合いの直後に始まる。
// 導入は、サビのレが次の音だと分かる形で渡す。坂の推進は残し、声を一本にする。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRise } from './bgm-final.mjs';
import { BOSS_BPM, BOSS_MIX } from './bgm-boss.mjs';
import { parsePhrase, SAMPLE_RATE, seedNoise, shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, remapPhrase, renderSong, stretchPhrase, transposePhrase } from './bgm-song.mjs';
import { CHORUS_BARS, CHORUS_CHORDS, D_MAJOR, INTRO_BARS, INTRO_CHORDS } from './bgm-theme.mjs';
import { toWav } from './wav.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../assets/music');
const LEVELS = [0.85, 1.0, 1.1, 1.28];

/** 主題の導入。休符のある「レ・レ」、その答え、「ラ・ラ」、ド♯へ伸びてレを待つ小節。 */
const HEAD = INTRO_BARS[0];
const CALL = INTRO_BARS[2];
/** 章ボスの導入の最後。シ♭からド♯へ上がってラで終える。 */
const CLIMB = 'E5:0.5 F5:0.5 G5:0.5 Bb5:0.5 C#6:1 A5:1';
const HOOK = CHORUS_BARS[0];

const lead = (inst, vol, notes, extra = {}) => ({ inst, vol, notes, ...extra });

/** 今の上り坂。金管の伸ばしと、8 分から 16 分へ加速するギター。導入はまだ乗っていない。 */
function riseBars() {
  const partBars = buildRise.parts.map((part) => part.notes.split('|').map((text) => text.trim()));
  return LEVELS.map((level, i) => ({
    name: `rise-${i + 1}`,
    chords: [buildRise.chords[i]],
    parts: buildRise.parts.map((part, p) => ({ ...part, notes: partBars[p][i] })),
    comp: [...buildRise.comp],
    bass: buildRise.bass,
    drums: buildRise.drums,
    fill: i === LEVELS.length - 1 ? 'roll' : undefined,
    crash: i === 0,
    level,
  }));
}

/** サビの最初の 4 小節。候補ごとに同じ着地を聴けるようにする。 */
function chorusHook(extraParts = []) {
  const notes = CHORUS_BARS.slice(0, 4);
  return {
    name: 'chorus',
    chords: bars(...CHORUS_CHORDS.slice(0, 4)),
    parts: [
      lead('brassLead', 0.4, join4(...notes)),
      lead('guitarLead', 0.22, shiftPhrase(join4(...notes), -1)),
      ...extraParts,
    ],
    comp: ['stabs', 'chug', 'brassHits'],
    bass: 'drive8',
    drums: 'double',
    // 足した声がピークを取ると、正規化でサビが小さくなる。着地が一番大きく聞こえるように少し上げる。
    level: 1.15,
  };
}

const drop = (bar, inst) => ({ ...bar, parts: bar.parts.filter((part) => part.inst !== inst) });

const scaleInst = (bar, inst, factor) => ({
  ...bar,
  parts: bar.parts.map((part) => (part.inst === inst ? { ...part, vol: part.vol * factor } : part)),
});

const withLead = (bar, part) => ({ ...bar, parts: [...bar.parts, part] });

/** 拍数を保ったまま、先頭に休符を入れて末尾を切り、後追いの声を作る。 */
function delayPhrase(text, beats) {
  const total = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
  const tokens = parsePhrase(`-:${beats} ${text}`);
  const out = [];
  let left = total;
  for (const [name, n] of tokens) {
    if (left <= 1e-6) break;
    const use = Math.min(n, left);
    out.push(`${name ?? '-'}:${use}`);
    left -= use;
  }
  if (left > 1e-6) out.push(`-:${left}`);
  return out.join(' ');
}

function song(file, sections) {
  return { file, bpm: BOSS_BPM, mix: BOSS_MIX, sections };
}

const two = (a, b) => `${a} ${b}`;

/**
 * 各候補は上り坂 4 小節のどこかを組み替え、サビの頭 4 小節へ渡す。
 * 聴きどころが被らないよう、音色だけの差し替えは置いていない。
 */
function candidates() {
  const base = () => riseBars();

  const overlay = (inst, vol, notesAt) => {
    const bars = base();
    return bars.map((bar, i) => (notesAt[i] ? withLead(bar, lead(inst, vol, notesAt[i])) : bar));
  };

  return [
    // 声を変えて、今の坂の上に乗せる。
    song('sample-final-intro-01', [...overlay('bell', 0.28, { 2: CALL, 3: CLIMB }), chorusHook()]),
    song('sample-final-intro-02', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(bar, 'brassLead');
        const notes = i === 2 ? shiftPhrase(CALL, 1) : shiftPhrase(CLIMB, 1);
        return withLead(opened, lead('flute', 0.28, notes));
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-03', [
      ...overlay('harp', 0.32, {
        2: 'A5:0.5 C6:0.5 F5:0.5 A5:0.5 C6:0.5 Bb5:0.5 A5:0.5 F5:0.5',
        3: 'E5:0.5 G5:0.5 Bb5:0.5 E5:0.5 C#6:0.5 A5:0.5 C#6:0.5 A5:0.5',
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-04', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const quiet = drop(drop(bar, 'guitarLead'), 'brassLead');
        const notes = i === 2 ? shiftPhrase(HEAD, 1) : shiftPhrase(CALL, 1);
        return withLead(quiet, lead('guitarLead', 0.42, notes));
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-05', [
      ...overlay('organ', 0.28, { 3: shiftPhrase(HOOK, 1) }),
      chorusHook(),
    ]),
    song('sample-final-intro-06', [
      ...(() => {
        const bars = base();
        const wide = stretchPhrase(CALL, 2);
        return [
          bars[0],
          bars[1],
          {
            name: 'strings-wide',
            chords: [bars[2].chords[0], bars[3].chords[0]],
            parts: [
              ...bars[2].parts.map((part) => ({ ...part, notes: `${part.notes} ${bars[3].parts.find((item) => item.inst === part.inst).notes}` })),
              lead('strings', 0.34, wide, { double: -1 }),
            ],
            comp: bars[2].comp,
            bass: bars[2].bass,
            drums: 'march',
            fill: 'roll',
            level: 1.15,
          },
        ];
      })(),
      chorusHook(),
    ]),

    // 坂の密度を下げて、締めが旋律として読めるようにする。
    song('sample-final-intro-07', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(bar, 'brassLead');
        return withLead(opened, lead('brassLead', 0.44, i === 2 ? CALL : CLIMB));
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-08', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const lowered = {
          ...bar,
          parts: bar.parts.map((part) =>
            part.inst === 'brassLead' ? { ...part, notes: shiftPhrase(part.notes, -1), vol: 0.28 } : part,
          ),
        };
        return withLead(lowered, lead('brassLead', 0.36, i === 2 ? CALL : CLIMB));
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-09', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(drop(bar, 'brassLead'), 'guitarLead');
        const pad = i === 2 ? 'Bb4:4' : 'C4:2 A4:2';
        return {
          ...withLead(withLead(opened, lead('guitarLead', 0.16, pad)), lead('brassLead', 0.42, i === 2 ? CALL : CLIMB)),
          fill: undefined,
        };
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-10', [
      ...base().map((bar, i) =>
        i < 3
          ? bar
          : {
              ...bar,
              parts: [lead('brassLead', 0.46, CLIMB)],
              comp: ['strings'],
              bass: 'sustain',
              drums: 'timp',
              fill: undefined,
              level: 0.9,
            },
      ),
      chorusHook(),
    ]),
    song('sample-final-intro-11', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(bar, 'brassLead');
        return {
          ...withLead(opened, lead('flute', 0.3, i === 2 ? CALL : CLIMB)),
          drums: 'half',
          fill: undefined,
          comp: ['strings'],
        };
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-12', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        return {
          ...withLead(bar, lead('synthBrass', 0.4, i === 2 ? CALL : CLIMB)),
          comp: ['strings'],
          fill: undefined,
        };
      }),
      chorusHook(),
    ]),

    // サビのレへ、音で渡す。
    song('sample-final-intro-13', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(bar, 'brassLead');
        const notes = i === 2 ? CALL : 'E5:0.5 F5:0.5 G5:0.5 Bb5:0.5 C#6:1 -:1';
        return { ...withLead(opened, lead('brassLead', 0.44, notes)), fill: undefined };
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-14', [
      ...base().map((bar, i) =>
        i < 3
          ? bar
          : { ...withLead(drop(bar, 'brassLead'), lead('flute', 0.24, HOOK)), fill: undefined },
      ),
      chorusHook(),
    ]),
    song('sample-final-intro-15', [
      ...base().map((bar, i) => {
        if (i < 3) return bar;
        return {
          ...drop(bar, 'brassLead'),
          parts: [
            ...drop(bar, 'brassLead').parts,
            lead('brassLead', 0.44, 'E5:0.5 F5:0.5 G5:0.5 A5:0.5 C#6:0.5 D6:1.5'),
          ],
          fill: undefined,
        };
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-16', [
      ...base().map((bar, i) => {
        if (i < 3) return bar;
        return {
          name: 'dominant',
          chords: bars('A'),
          parts: [
            lead('brassLead', 0.42, 'A4:1 C#5:1 E5:1 A5:1'),
            lead('bell', 0.3, 'A5:1 C#6:1 E6:1 A6:1'),
          ],
          comp: ['strings'],
          bass: 'sustain',
          drums: 'half',
          fill: undefined,
          level: 1.05,
        };
      }),
      chorusHook(),
    ]),

    // 聴き覚えのある「レ・レ」を、締めのラではなく呼び声として使う。
    song('sample-final-intro-17', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(bar, 'brassLead');
        const notes = i === 2 ? shiftPhrase(HEAD, 1) : shiftPhrase(CALL, 1);
        return {
          ...withLead(withLead(opened, lead('brassLead', 0.28, notes)), lead('bell', 0.22, notes)),
          fill: undefined,
        };
      }),
      chorusHook(),
    ]),
    song(
      'sample-final-intro-18',
      INTRO_BARS.map((notes, i) => ({
        name: `door-${i + 1}`,
        chords: bars(INTRO_CHORDS[i]),
        parts: [lead('guitarLead', 0.4, notes), lead('organ', 0.22, shiftPhrase(notes, 1))],
        comp: ['chug', 'strings'],
        bass: 'gallop',
        drums: 'march',
        fill: i === 3 ? 'roll' : undefined,
        crash: i === 0,
        level: [0.8, 0.92, 1.0, 1.05][i],
      })).concat(chorusHook()),
    ),
    song('sample-final-intro-19', [
      ...base().map((bar, i) =>
        i < 3
          ? bar
          : {
              name: 'alone',
              chords: bars('Dm'),
              parts: [lead('brassLead', 0.4, shiftPhrase(HEAD, 1)), lead('bell', 0.32, shiftPhrase(HEAD, 1))],
              comp: [],
              bass: 'sustain',
              drums: 'none',
              fill: undefined,
              level: 1,
            },
      ),
      chorusHook(),
    ]),
    song('sample-final-intro-20', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        if (i === 2) {
          return {
            ...drop(bar, 'brassLead'),
            parts: [...drop(bar, 'brassLead').parts, lead('bell', 0.28, HEAD), lead('brassLead', 0.14, 'D4:4')],
            fill: undefined,
          };
        }
        return {
          ...drop(bar, 'brassLead'),
          parts: [...drop(bar, 'brassLead').parts, lead('flute', 0.26, shiftPhrase(CLIMB, 1)), lead('brassLead', 0.14, 'D4:4')],
          fill: undefined,
        };
      }),
      chorusHook(),
    ]),

    // リズムと掛け合い。
    song('sample-final-intro-21', [
      {
        name: 'augmented',
        chords: buildRise.chords,
        parts: [
          lead('brassLead', 0.4, two(stretchPhrase(CALL, 2), stretchPhrase(CLIMB, 2))),
          buildRise.parts.find((part) => part.inst === 'guitarLead'),
        ],
        comp: ['strings'],
        bass: 'drive8',
        drums: 'march',
        fill: 'roll',
        level: 1,
      },
      chorusHook(),
    ]),
    song('sample-final-intro-22', [
      ...base().slice(0, 2),
      {
        name: 'canon',
        chords: [base()[2].chords[0], base()[3].chords[0]],
        parts: [
          lead('guitarLead', 0.36, two(CALL, CLIMB)),
          lead('brassLead', 0.32, delayPhrase(two(CALL, CLIMB), 1)),
        ],
        comp: ['strings'],
        bass: 'drive8',
        drums: 'march',
        fill: undefined,
        level: 1.1,
      },
      chorusHook(),
    ]),
    song('sample-final-intro-23', [
      ...overlay('bell', 0.32, {
        0: '-:3 D5:0.25 E5:0.25 F5:0.25 G5:0.25',
        1: '-:3 E5:0.25 F5:0.25 G5:0.25 A5:0.25',
        2: '-:3 F5:0.25 G5:0.25 A5:0.25 Bb5:0.25',
        3: '-:3 C6:0.25 Bb5:0.25 A5:0.25 D6:0.25',
      }).map((bar, i) => (i === 3 ? { ...bar, fill: undefined } : bar)),
      chorusHook(),
    ]),
    song('sample-final-intro-24', [
      ...overlay('flute', 0.24, { 0: 'A5:4', 1: 'G5:4', 2: 'F5:4', 3: 'E5:2 D5:2' }),
      chorusHook(),
    ]),

    // 和声の色。
    song('sample-final-intro-25', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const notes = remapPhrase(i === 2 ? CALL : CLIMB, D_MAJOR);
        return withLead(scaleInst(bar, 'brassLead', 0.45), lead('flute', 0.26, shiftPhrase(notes, 1)));
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-26', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const melody = i === 2 ? CALL : CLIMB;
        const opened = drop(drop(bar, 'brassLead'), 'guitarLead');
        return {
          ...opened,
          parts: [
            lead('guitarLead', 0.14, i === 2 ? 'Bb4:4' : 'A4:4'),
            lead('brassLead', 0.4, melody),
            lead('brassLead', 0.24, transposePhrase(melody, -3)),
          ],
          fill: undefined,
          comp: ['strings'],
        };
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-27', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        const opened = drop(bar, 'brassLead');
        const notes = i === 2 ? CALL : CLIMB;
        return {
          ...opened,
          parts: [
            ...opened.parts,
            lead('brassLead', 0.24, notes),
            lead('bell', 0.16, notes),
            lead('flute', 0.16, shiftPhrase(notes, 1)),
            lead('strings', 0.16, notes),
          ],
        };
      }),
      chorusHook(),
    ]),
    song('sample-final-intro-28', [
      ...base().map((bar, i) => {
        if (i < 2) return bar;
        if (i === 2) {
          return {
            name: 'call-bb',
            chords: bars('Bb'),
            parts: [
              lead('brassLead', 0.42, 'Bb5:0.5 -:0.5 Bb5:0.5 -:0.5 D6:0.5 C6:0.5 Bb5:0.5 F5:0.5'),
              lead('bell', 0.26, 'Bb5:0.5 -:0.5 Bb5:0.5 -:0.5 D6:0.5 C6:0.5 Bb5:0.5 F5:0.5'),
            ],
            comp: ['strings'],
            bass: 'drive8',
            drums: 'march',
            level: 1.1,
          };
        }
        return {
          name: 'call-a',
          chords: bars('A'),
          parts: [
            lead('brassLead', 0.44, 'A4:1 C#5:1 E5:1 A5:1'),
            lead('bell', 0.28, 'A5:1 C#6:1 E6:1 A6:1'),
          ],
          comp: ['strings'],
          bass: 'sustain',
          drums: 'half',
          fill: undefined,
          level: 1.15,
        };
      }),
      chorusHook(),
    ]),

    // 形。一度空けてからサビを立てる、またはサビにまたがる。
    song('sample-final-intro-29', [
      base()[0],
      base()[1],
      {
        name: 'breath-1',
        chords: bars('Bb'),
        parts: [lead('brassLead', 0.42, CALL)],
        comp: ['strings'],
        bass: 'sustain',
        drums: 'timp',
        level: 0.62,
      },
      {
        name: 'breath-2',
        chords: bars('A'),
        parts: [lead('brassLead', 0.46, 'E5:0.5 F5:0.5 G5:0.5 Bb5:0.5 C#6:1 -:1')],
        comp: ['strings'],
        bass: 'sustain',
        drums: 'timp',
        level: 0.7,
      },
      chorusHook(),
    ]),
    song('sample-final-intro-30', [
      ...base().map((bar, i) => {
        if (i < 3) return bar;
        return withLead(scaleInst(bar, 'brassLead', 0.45), lead('bell', 0.26, CALL));
      }),
      chorusHook([lead('bell', 0.26, join4('F6:2 D6:2', '-:4', '-:4', '-:4'))]),
    ]),
  ];
}

const SONGS = candidates();
if (SONGS.length !== 30) throw new Error(`候補は 30 のはず: ${SONGS.length}`);

for (const songDef of SONGS) {
  for (const section of songDef.sections) {
    const beats = section.chords.length * 4;
    for (const part of section.parts ?? []) {
      const got = parsePhrase(part.notes).reduce((sum, [, n]) => sum + n, 0);
      if (Math.abs(got - beats) > 1e-6) {
        throw new Error(`${songDef.file} ${section.name} ${part.inst}: ${got} 拍（${beats} 拍のはず）`);
      }
    }
  }
}

mkdirSync(OUT_DIR, { recursive: true });
for (const songDef of SONGS) {
  seedNoise(4242);
  const samples = renderSong(songDef);
  const file = join(OUT_DIR, `${songDef.file}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}
