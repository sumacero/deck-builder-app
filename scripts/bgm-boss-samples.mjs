// ボス戦の候補 10 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// どの曲も、自分の旋律が前に出て、ラスボス戦の A メロ前半と B メロの五度圏の頭を低い音で短く通す。
// サビは入れない（サビはラスボス戦だけ）。
import { shiftPhrase } from './bgm-engine.mjs';
import { run } from './bgm-final.mjs';
import { bars, join4 } from './bgm-song.mjs';
import { VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

const A_CHORDS = VERSE_CHORDS.slice(0, 4);
const B_CHORDS = ['Dm', 'Gm', 'C', 'F'];
const aMelody = shiftPhrase(join4(...VERSE_BARS.slice(0, 4)), -1);
const bMelody = shiftPhrase(
  join4(
    ...run.parts[0].notes
      .split('|')
      .slice(0, 4)
      .map((text) => text.trim()),
  ),
  -1,
);
const A_HOLD = join4('D5:4', 'C5:4', 'Bb4:4', 'A4:4');
const B_HOLD = join4('D5:4', 'G4:4', 'C5:4', 'F4:4');

/** 自分の 4 小節 → A メロをかすかに → もう一度 → B メロをかすかに。 */
const sample = ({ file, bpm, lead, hook, hookChords, drums, comp, bass, quote, mix }) => ({
  file,
  bpm,
  mix: { reverbLevel: 0.4, tone: 0.62, echoLevel: 0.22, ...mix },
  sections: [
    {
      name: 'hook',
      chords: bars(...hookChords),
      parts: [{ inst: lead, vol: 0.42, notes: hook }],
      comp,
      bass,
      drums,
    },
    {
      name: 'verse-hint',
      chords: bars(...A_CHORDS),
      parts: [
        { inst: lead, vol: 0.16, notes: A_HOLD },
        { inst: quote, vol: 0.2, send: 0.55, notes: aMelody },
      ],
      comp,
      bass,
      drums,
      crash: false,
    },
    {
      name: 'hook-again',
      chords: bars(...hookChords),
      parts: [{ inst: lead, vol: 0.44, notes: hook }],
      comp,
      bass,
      drums,
      fill: 'toms',
    },
    {
      name: 'run-hint',
      chords: bars(...B_CHORDS),
      parts: [
        { inst: lead, vol: 0.16, notes: B_HOLD },
        { inst: quote, vol: 0.18, send: 0.6, notes: bMelody },
      ],
      comp,
      bass,
      drums,
      fill: 'snare',
      crash: false,
    },
  ],
});

const chords = (...symbols) => symbols;

export const BOSS_SAMPLE_SONGS = [
  sample({
    file: 'boss-sample-01',
    bpm: 150,
    lead: 'brassLead',
    quote: 'strings',
    hookChords: chords('Dm', 'Bb', 'F', 'A'),
    hook: join4('D5:1 F5:0.5 A5:0.5 D6:0.5 C6:0.5 Bb5:1', 'A5:1 G5:0.5 F5:0.5 E5:2', 'F5:0.5 G5:0.5 A5:1 D6:1 C6:1', 'A5:2 E5:1 C#5:1'),
    drums: 'double',
    comp: ['chug', 'brassHits'],
    bass: 'gallop',
  }),
  sample({
    file: 'boss-sample-02',
    bpm: 138,
    lead: 'guitarLead',
    quote: 'bell',
    hookChords: chords('Dm', 'Gm', 'Bb', 'A'),
    hook: join4('A4:0.5 C5:0.5 D5:1 F5:1 E5:1', 'D5:1.5 C5:0.5 Bb4:2', 'A4:1 D5:1 F5:1 A5:1', 'G5:1 E5:1 C#5:2'),
    drums: 'rock',
    comp: ['chug', 'organ'],
    bass: 'gallop',
  }),
  sample({
    file: 'boss-sample-03',
    bpm: 144,
    lead: 'squareLead',
    quote: 'flute',
    hookChords: chords('Dm', 'Bb', 'F', 'A'),
    hook: join4('A5:0.5 A5:0.5 D6:1 E6:0.5 D6:0.5 C6:1', 'Bb5:2 A5:1 G5:1', 'A5:1 C6:1 D6:2', 'E6:1 C#6:1 A5:2'),
    drums: 'drive',
    comp: ['stabs', 'chug'],
    bass: 'octave',
  }),
  sample({
    file: 'boss-sample-04',
    bpm: 132,
    lead: 'flute',
    quote: 'strings',
    hookChords: chords('Dm', 'C', 'Bb', 'A'),
    hook: join4('D6:1.5 E6:0.5 F6:2', 'E6:1 C6:1 A5:2', 'D6:0.5 F6:0.5 A6:1 G6:1 F6:1', 'E6:2 C#6:2'),
    drums: 'march',
    comp: ['strings', 'arp8'],
    bass: 'sustain',
  }),
  sample({
    file: 'boss-sample-05',
    bpm: 126,
    lead: 'triLead',
    quote: 'softKey',
    hookChords: chords('Dm', 'C', 'Bb', 'A'),
    hook: join4('D5:2 A5:2', 'C5:2 G5:1 E5:1', 'F5:1 Bb5:2 A5:1', 'A5:2 E5:2'),
    drums: 'half',
    comp: ['organ', 'pad'],
    bass: 'sustain',
  }),
  sample({
    file: 'boss-sample-06',
    bpm: 156,
    lead: 'synthBrass',
    quote: 'strings',
    hookChords: chords('Dm', 'Bb', 'Gm', 'A'),
    hook: join4(
      'D5:0.5 D5:0.5 F5:0.5 F5:0.5 A5:0.5 A5:0.5 D6:1',
      'C6:0.5 Bb5:0.5 A5:1 G5:1 F5:1',
      'Bb5:1 A5:0.5 G5:0.5 F5:1 E5:1',
      'E5:1 C#5:1 A4:2',
    ),
    drums: 'double',
    comp: ['brassHits', 'chug'],
    bass: 'drive8',
  }),
  sample({
    file: 'boss-sample-07',
    bpm: 128,
    lead: 'brassLead',
    quote: 'bell',
    hookChords: chords('Dm', 'C', 'Bb', 'A'),
    hook: join4('A4:2 D5:2', 'E5:2 C5:2', 'D5:1 F5:1 A5:2', 'G5:1 E5:1 C#5:2'),
    drums: 'timp',
    comp: ['pad', 'strings'],
    bass: 'sustain',
    mix: { reverbLevel: 0.55, tone: 0.5 },
  }),
  sample({
    file: 'boss-sample-08',
    bpm: 142,
    lead: 'guitarLead',
    quote: 'organ',
    hookChords: chords('Dm', 'Am', 'Bb', 'A'),
    hook: join4('F5:0.5 G5:0.5 A5:1 D6:0.5 E6:0.5 F6:1', 'E6:1 C6:1 A5:2', 'D6:1 Bb5:1 A5:1 G5:1', 'A5:2 E5:2'),
    drums: 'rock',
    comp: ['chug', 'arp16'],
    bass: 'gallop',
  }),
  sample({
    file: 'boss-sample-09',
    bpm: 134,
    lead: 'organ',
    quote: 'flute',
    hookChords: chords('Dm', 'Gm', 'F', 'A'),
    hook: join4('D5:0.5 F5:0.5 A5:0.5 D6:0.5 A5:0.5 F5:0.5 D5:1', 'G5:1 Bb5:1 D6:1 Bb5:1', 'C6:1 A5:1 F5:2', 'E5:1 G5:1 C#6:2'),
    drums: 'drive',
    comp: ['organ', 'strings'],
    bass: 'walk',
  }),
  sample({
    file: 'boss-sample-10',
    bpm: 146,
    lead: 'squareLead',
    quote: 'strings',
    hookChords: chords('Dm', 'Bb', 'Gm', 'A'),
    hook: join4('A5:1.5 G5:0.5 F5:1 E5:1', 'D5:2 F5:1 A5:1', 'Bb5:1 A5:1 G5:1 F5:1', 'E5:4'),
    drums: 'double',
    comp: ['stabs', 'chug'],
    bass: 'gallop',
  }),
];
