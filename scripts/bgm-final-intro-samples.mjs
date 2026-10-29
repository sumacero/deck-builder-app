// ラスボス戦の「ため」（Cメロ）を 2 倍に伸ばし、サビの 8 小節前または 4 小節前から
// 主題の導入を忍ばせた候補。Cメロの頭からサビの頭 4 小節まで（約 31 秒）。
// 本番の battle-final.wav は変えない。node scripts/bgm-final-intro-samples.mjs
//
// ためは B メロとサビのあいだの 8 小節（ギターが歌う 4 + 金管が上がる 4）。
// 旋律とコードの長さだけを倍にし、ドラムとギターの刻みは元の速さのまま 2 小節ずつ続ける。
// 導入は足した声だけ。ため本体は消さない。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOSS_BPM, BOSS_MIX } from './bgm-boss.mjs';
import { parsePhrase, SAMPLE_RATE, seedNoise, shiftPhrase } from './bgm-engine.mjs';
import { bars, remapPhrase, renderSong, stretchPhrase } from './bgm-song.mjs';
import { CHORUS_BARS, CHORUS_CHORDS, D_MAJOR, INTRO_BARS } from './bgm-theme.mjs';
import { toWav } from './wav.mjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../assets/music');

/** ため前半。ギターの歌と、同じ音を支える低い金管。 */
const CALM_GUITAR = ['G5:1.5 A5:0.5 Bb5:2', 'A5:3 E5:1', 'F5:1.5 G5:0.5 A5:2', 'C#6:4'];
const CALM_BRASS = ['G4:4', 'A4:4', 'Bb4:4', 'C#5:4'];
const CALM_CHORDS = ['Gm', 'A', 'Bb', 'A'];
/** ため後半。金管が一段ずつ上がり、最後の小節でド♯がサビのレを待つ。 */
const RISE_BRASS = ['D6:4', 'E6:4', 'F6:4', 'E6:2 C#6:2'];
const RISE_CHORDS = ['Gm', 'Gm', 'A', 'A', 'Bb', 'Bb', 'C', 'A'];

const CALM_LEVELS = [0.66, 0.68, 0.7, 0.72, 0.74, 0.76, 0.78, 0.8];
const RISE_LEVELS = [0.84, 0.88, 0.92, 0.96, 1.0, 1.04, 1.08, 1.12];

const beatsOf = (text) => parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);

const fmt = (name, beats) => `${name ?? '-'}:${Math.round(beats * 1000) / 1000}`;

/** 先頭 beats 拍と、残りのフレーズ。音が境界をまたぐときはそこで分ける。 */
function splitAt(text, beats) {
  const left = [];
  const right = [];
  let used = 0;
  let index = 0;
  const tokens = parsePhrase(text);
  for (; index < tokens.length; index++) {
    const [name, n] = tokens[index];
    if (used + n <= beats + 1e-6) {
      left.push([name, n]);
      used += n;
      if (beats - used <= 1e-6) {
        index += 1;
        break;
      }
    } else {
      const take = beats - used;
      if (take > 1e-6) left.push([name, take]);
      const rest = n - take;
      if (rest > 1e-6) right.push([name, rest]);
      index += 1;
      used = beats;
      break;
    }
  }
  for (; index < tokens.length; index++) right.push(tokens[index]);
  if (beats - used > 1e-6) left.push([null, beats - used]);
  const join = (notes) => notes.map(([name, n]) => fmt(name, n)).join(' ');
  return [join(left), join(right)];
}

/** フレーズを 4 拍ずつの小節に分ける。 */
function chunkBars(text) {
  const out = [];
  let rest = text.trim();
  while (beatsOf(rest) > 1e-4) {
    const [bar, tail] = splitAt(rest, 4);
    out.push(bar);
    rest = tail.trim();
    if (out.length > 64) throw new Error(`chunkBars: ${text}`);
  }
  return out;
}

/** 1 小節を 2 倍の長さにして、2 小節に分ける。 */
function stretchPair(barText) {
  const pair = chunkBars(stretchPhrase(barText, 2));
  if (pair.length !== 2) throw new Error(`stretchPair: ${barText} → ${pair.length}`);
  return pair;
}

const repeatNote = (name, dur, beats) => Array.from({ length: Math.round(beats / dur) }, () => `${name}:${dur}`).join(' ');

/** 導入 4 小節を 2 倍にして 8 小節にする。休符も倍になる。 */
function stretchedIntro(map) {
  return INTRO_BARS.flatMap((bar) => stretchPair(map ? map(bar) : bar));
}

/** フレーズ全体を delayBeats 遅らせ、長さは小節数ぶんのまま（はみ出した末尾は切る）。 */
function delayBars(barNotes, delayBeats) {
  const delayed = splitAt(`-:${delayBeats} ${barNotes.join(' ')}`, barNotes.length * 4)[0];
  const barsOut = chunkBars(delayed);
  if (barsOut.length !== barNotes.length) throw new Error(`delayBars: ${barsOut.length}`);
  return barsOut;
}

/**
 * 16 小節のため。毎回新しい配列を返す（候補のあいだで共有しない）。
 * 0–7 が歌、8–15 が上り坂。上り坂の頭がサビの 8 小節前、12 小節目が 4 小節前。
 */
function bed() {
  const calmGuitar = CALM_GUITAR.flatMap((bar) => stretchPair(bar));
  const calmBrass = CALM_BRASS.flatMap((bar) => stretchPair(bar));
  const calmChords = CALM_CHORDS.flatMap((symbol) => [symbol, symbol]);
  const riseBrass = RISE_BRASS.flatMap((bar) => stretchPair(bar));
  const riseGuitar = [
    repeatNote('G5', 0.5, 4),
    repeatNote('G5', 0.5, 4),
    repeatNote('A5', 0.5, 4),
    repeatNote('A5', 0.5, 4),
    repeatNote('Bb5', 0.25, 4),
    repeatNote('Bb5', 0.25, 4),
    repeatNote('C6', 0.25, 4),
    repeatNote('C#6', 0.25, 4),
  ];
  const sections = [];
  for (let i = 0; i < 8; i++) {
    sections.push({
      name: `calm-${i + 1}`,
      chords: bars(calmChords[i]),
      parts: [
        { inst: 'guitarLead', vol: 0.38, notes: calmGuitar[i] },
        { inst: 'brassLead', vol: 0.24, notes: calmBrass[i] },
      ],
      comp: ['strings'],
      bass: 'sustain',
      drums: 'half',
      crash: i === 0,
      level: CALM_LEVELS[i],
    });
  }
  for (let i = 0; i < 8; i++) {
    sections.push({
      name: `rise-${i + 1}`,
      chords: bars(RISE_CHORDS[i]),
      parts: [
        { inst: 'brassLead', vol: 0.38, notes: riseBrass[i] },
        { inst: 'guitarLead', vol: 0.2, notes: riseGuitar[i] },
      ],
      comp: ['strings', 'brassHits'],
      bass: 'drive8',
      drums: 'march',
      fill: i === 7 ? 'roll' : undefined,
      crash: false,
      level: RISE_LEVELS[i],
    });
  }
  return sections;
}

/** start 小節目から、1 小節ずつの声を足す。vol は数値か、小節ごとの配列。 */
function addVoice(sections, start, barNotes, inst, vol, { shift = 0, double } = {}) {
  barNotes.forEach((notes, i) => {
    const section = sections[start + i];
    if (!section) throw new Error(`addVoice: ${inst} @ ${start + i}`);
    section.parts = [
      ...section.parts,
      {
        inst,
        vol: Array.isArray(vol) ? vol[i] : vol,
        notes: shift ? shiftPhrase(notes, shift) : notes,
        ...(double != null ? { double } : {}),
      },
    ];
  });
}

/** サビの頭 4 小節。ためより大きく聞こえるように、段差をつけておく。 */
function chorusHook() {
  const notes = CHORUS_BARS.slice(0, 4);
  return {
    name: 'chorus',
    chords: bars(...CHORUS_CHORDS.slice(0, 4)),
    parts: [
      { inst: 'brassLead', vol: 0.4, notes: notes.join(' | ') },
      { inst: 'guitarLead', vol: 0.22, notes: shiftPhrase(notes.join(' | '), -1) },
    ],
    comp: ['stabs', 'chug', 'brassHits'],
    bass: 'drive8',
    drums: 'double',
    level: 1.32,
  };
}

const song = (file, sections) => ({ file, bpm: BOSS_BPM, mix: BOSS_MIX, sections: [...sections, chorusHook()] });

const REST = '-:4';
/** 章ボスの導入の上昇。最後のラは置かず、ド♯を残してサビのレへ向ける。 */
const CLIMB = ['E5:1 F5:1 G5:1 Bb5:1', 'C#6:4'];
/** ハープは休符を隣の音で埋め、8 分で流す。輪郭は導入のまま。 */
const HARP_FLOW = [
  'D5:0.5 A4:0.5 D5:0.5 A4:0.5 F5:0.5 E5:0.5 D5:0.5 A4:0.5',
  'Bb4:0.5 D5:0.5 F5:0.5 D5:0.5 C5:0.5 E5:0.5 G5:0.5 E5:0.5',
  'A5:0.5 C6:0.5 A5:0.5 F5:0.5 C6:0.5 Bb5:0.5 A5:0.5 F5:0.5',
  'E5:0.5 F5:0.5 G5:0.5 A5:0.5 C#6:0.5 E5:0.5 C#6:1',
];

/**
 * 01–10 はサビの 8 小節前（上り坂の頭、サンプルの約 12 秒）から導入。
 * 11–20 は 4 小節前（約 18 秒）から。どちらも Cメロの最初の音から鳴り、約 25 秒でサビに入る。
 */
function candidates() {
  const wide = () => stretchedIntro();
  const at8 = (inst, vol, notes, extra) => {
    const sections = bed();
    addVoice(sections, 8, notes, inst, vol, extra);
    return sections;
  };

  // 8 小節前。導入を引き伸ばして、上り坂のあいだじゅう小さく置く。
  const eight = [
    song('sample-final-intro-01', at8('bell', 0.16, wide())),
    song('sample-final-intro-02', at8('flute', 0.14, wide(), { shift: 1 })),
    song('sample-final-intro-03', at8('harp', 0.18, wide())),
    song('sample-final-intro-04', at8('strings', 0.26, wide(), { double: -1 })),
    song('sample-final-intro-05', (() => {
      // レ・レ、一拍分の休み、答え、ラ・ラ、休み、ド♯。休符が坂の持続のあいだに開く。
      const sections = bed();
      const phrase = [INTRO_BARS[0], REST, ...stretchPair(INTRO_BARS[1]), INTRO_BARS[2], REST, ...stretchPair(INTRO_BARS[3])];
      addVoice(sections, 8, phrase, 'bell', 0.16);
      return sections;
    })()),
    song('sample-final-intro-06', (() => {
      // 元の速さの導入を、笛が一度、鐘がもう一度。二度目のド♯がサビのレにつながる。
      const sections = bed();
      addVoice(sections, 8, INTRO_BARS, 'flute', 0.13);
      addVoice(sections, 12, INTRO_BARS, 'bell', 0.15);
      return sections;
    })()),
    // 上り坂の金管（レ〜ファ）より 1 オクターブ下。同じ金管でも高さが違う。
    song('sample-final-intro-07', at8('brassLead', 0.2, wide())),
    song('sample-final-intro-08', at8('flute', 0.12, stretchedIntro((bar) => remapPhrase(bar, D_MAJOR)), { shift: 1 })),
    song('sample-final-intro-09', at8('bell', [0.06, 0.08, 0.1, 0.13, 0.16, 0.19, 0.22, 0.26], wide())),
    song('sample-final-intro-10', (() => {
      const sections = bed();
      const phrase = wide();
      addVoice(sections, 8, phrase, 'harp', 0.14);
      addVoice(sections, 8, delayBars(phrase, 2), 'bell', 0.11);
      return sections;
    })()),
  ];

  // 4 小節前。先の 12 小節は伸ばしたためだけ。導入は元の速さで 4 小節。
  const at4 = (inst, vol, notes, extra) => {
    const sections = bed();
    addVoice(sections, 12, notes, inst, vol, extra);
    return sections;
  };
  const four = [
    song('sample-final-intro-11', at4('bell', 0.16, INTRO_BARS)),
    song('sample-final-intro-12', at4('flute', 0.13, INTRO_BARS, { shift: 1 })),
    song('sample-final-intro-13', at4('harp', 0.18, HARP_FLOW)),
    song('sample-final-intro-14', at4('brassLead', 0.18, INTRO_BARS, { shift: -1 })),
    song('sample-final-intro-15', at4('bell', 0.16, [INTRO_BARS[0], REST, INTRO_BARS[2], REST])),
    song('sample-final-intro-16', (() => {
      // 「レ・レ」を笛で一度、1 オクターブ上でもう一度。鐘はド♯まで上がって止める。
      const sections = bed();
      addVoice(sections, 12, [INTRO_BARS[0]], 'flute', 0.14);
      addVoice(sections, 13, [INTRO_BARS[0]], 'flute', 0.14, { shift: 1 });
      addVoice(sections, 14, CLIMB, 'bell', 0.16);
      return sections;
    })()),
    song('sample-final-intro-17', at4('organ', 0.16, INTRO_BARS, { shift: 1 })),
    song('sample-final-intro-18', at4('squareLead', 0.13, INTRO_BARS, { shift: -1 })),
    song('sample-final-intro-19', (() => {
      const sections = bed();
      addVoice(sections, 12, INTRO_BARS, 'flute', 0.11);
      addVoice(sections, 12, delayBars(INTRO_BARS, 1), 'harp', 0.15);
      return sections;
    })()),
    song('sample-final-intro-20', at4('bell', [0.09, 0.09, 0.09, 0.24], INTRO_BARS)),
  ];

  return [...eight, ...four];
}

const SONGS = candidates();
if (SONGS.length !== 20) throw new Error(`候補は 20 のはず: ${SONGS.length}`);

for (const songDef of SONGS) {
  const totalBars = songDef.sections.reduce((n, section) => n + section.chords.length, 0);
  if (totalBars !== 20) throw new Error(`${songDef.file}: ${totalBars} 小節`);
  for (const section of songDef.sections) {
    const beats = section.chords.length * 4;
    for (const part of section.parts ?? []) {
      const got = beatsOf(part.notes);
      if (Math.abs(got - beats) > 1e-3) {
        throw new Error(`${songDef.file} ${section.name} ${part.inst}: ${got} 拍（${beats} 拍のはず） ${part.notes}`);
      }
    }
  }
}

const regionRms = (samples, startBar, endBar) => {
  const beat = 60 / BOSS_BPM;
  const start = Math.floor(startBar * 4 * beat * SAMPLE_RATE);
  const end = Math.min(samples.length, Math.floor(endBar * 4 * beat * SAMPLE_RATE));
  let acc = 0;
  for (let i = start; i < end; i++) acc += samples[i] * samples[i];
  return Math.sqrt(acc / (end - start));
};

mkdirSync(OUT_DIR, { recursive: true });
const loud = [];
for (const songDef of SONGS) {
  seedNoise(4242);
  const samples = renderSong(songDef);
  const pre = regionRms(samples, 8, 16);
  const chorus = regionRms(samples, 16, 20);
  const ratio = chorus / pre;
  if (ratio < 1) loud.push(`${songDef.file} サビ/坂 ${ratio.toFixed(2)}`);
  const file = join(OUT_DIR, `${songDef.file}.wav`);
  writeFileSync(file, toWav(samples, SAMPLE_RATE));
  console.log(`wrote ${songDef.file} (${(samples.length / SAMPLE_RATE).toFixed(1)}s) chorus/rise ${ratio.toFixed(2)}`);
}
if (loud.length) {
  console.error(loud.join('\n'));
  process.exitCode = 1;
}
