// エリート戦の候補。マップごとに 5 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 出だし（リフ）と地域の旋律は、今のエリート戦のまま。テンポも伴奏も歌っている楽器も変えない。
// 最後の共通部分はラスボスの A メロ。ただし前の候補は、地域の最後の音と A メロの最初の音が離れていて、
// そこで曲が割れて聞こえた。今回は最後の音から階段で入り、入りのシンバルと、フレーズを切るフィルは外す。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { REGION_SONGS } from './bgm-regions.mjs';
import { bars, join4, remapPhrase, transposePhrase, transposeSymbols } from './bgm-song.mjs';
import { D_MAJOR, VERSE_BARS, VERSE_CHORDS } from './bgm-theme.mjs';

const ELITES = [
  { slug: 'grassland', file: 'elite-grassland', semitones: 5, major: true },
  { slug: 'volcano', file: 'elite-volcano', semitones: -2, major: false },
  { slug: 'sunken', file: 'elite-sunken-city', semitones: 4, major: false },
  { slug: 'clockwork', file: 'elite-clockwork', semitones: 5, major: false },
];

/** 短調の A メロを同主長調にしたときのコード。旋律の F・C・B♭ を上げた音に合わせてある。 */
const MAJOR_VERSE_CHORDS = ['D', 'A7', 'Bm', 'A', 'G', 'A7', 'D Bm', 'A7'];

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const phrase = (lines) => join4(...lines);
const beatsOf = (text) => Math.round(parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0) * 1000) / 1000;
const num = (beats) => String(Math.round(beats * 1000) / 1000);

const midiOf = (name) => {
  const match = /^([A-G])([#b]?)(-?\d+)$/.exec(name);
  if (!match) throw new Error(`音名ではない: ${name}`);
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return PC[match[1]] + accidental + (Number(match[3]) + 1) * 12;
};

const shiftName = (name, octaves) => name.replace(/(-?\d+)$/, (_, octave) => String(Number(octave) + octaves));
const sounded = (bar) => parsePhrase(bar).filter(([note]) => note);
const firstPitch = (lines) => sounded(lines[0])[0][0];
const lastPitch = (lines) => {
  const notes = sounded(lines[lines.length - 1]);
  return notes[notes.length - 1][0];
};

/** ラスボスの A メロ（草原だけ長調）を、その地域の調へ移す。 */
const inKey = (lines, elite) => lines.map((line) => transposePhrase(elite.major ? remapPhrase(line, D_MAJOR) : line, elite.semitones));

const verseSymbols = (elite) => transposeSymbols(elite.major ? MAJOR_VERSE_CHORDS : VERSE_CHORDS, elite.semitones);

const cloneSection = (section) => ({
  ...section,
  chords: [...section.chords],
  parts: (section.parts ?? []).map((part) => ({ ...part })),
});

/** 地域の旋律と同じ楽器で歌う。2 本目は水の古都のベル（1 オクターブ上）だけ。 */
const sing = (theme, notes, gain = 1) =>
  (theme.parts ?? []).map((part, index) => ({
    inst: part.inst,
    vol: part.vol * gain,
    ...(part.double != null ? { double: part.double } : {}),
    ...(part.send != null ? { send: part.send } : {}),
    notes: index === 0 ? notes : shiftPhrase(notes, 1),
  }));

/** 地域の旋律の伴奏を、シンバルなしで続ける。 */
const groove = (theme, extra = {}) => ({
  comp: theme.comp,
  bass: theme.bass,
  drums: theme.drums,
  ...(theme.energy != null ? { energy: theme.energy } : {}),
  crash: false,
  ...extra,
});

const section = (name, chordSymbols, noteLines, theme, extra) => ({
  name,
  chords: bars(...chordSymbols),
  parts: sing(theme, phrase(noteLines), extra?.gain ?? 1),
  ...groove(theme, extra?.fill ? { fill: extra.fill } : {}),
});

/** 2 番目の音が、地域の最後の音から一番近いオクターブ。 */
const bestOctave = (bar, target) => {
  const note = sounded(bar)[1]?.[0] ?? sounded(bar)[0][0];
  let best = 0;
  let distance = Infinity;
  for (let octave = -2; octave <= 2; octave += 1) {
    const next = Math.abs(midiOf(shiftName(note, octave)) - midiOf(target));
    if (next < distance) {
      distance = next;
      best = octave;
    }
  }
  return best;
};

const shiftBars = (lines, octaves) => (octaves === 0 ? lines : lines.map((line) => shiftPhrase(line, octaves)));
const elideFirst = (bar, pitch) => bar.replace(/^[A-G][#b]?\d+/, pitch);

/** A メロを、2 音目が地域の最後の音に近い高さへ置く。 */
const placed = (lines, target) => shiftBars(lines, bestOctave(lines[0], target));

/** すぐ続けるときだけ、最初の音を地域の最後の音に差し替える。 */
const connected = (lines, target) => {
  const shifted = placed(lines, target);
  return [elideFirst(shifted[0], target), ...shifted.slice(1)];
};

/** 1 小節を倍の長さ（2 小節）にする。拍を地域の長い音に近づける。 */
const doubleBar = (bar) => {
  const out = [[], []];
  let beat = 0;
  for (const [note, beats] of parsePhrase(bar)) {
    let left = beats * 2;
    while (left > 1e-6) {
      const index = Math.min(1, Math.floor((beat + 1e-6) / 4));
      const take = Math.min((index + 1) * 4 - beat, left);
      out[index].push(`${note ?? '-'}:${num(take)}`);
      beat += take;
      left -= take;
    }
  }
  return out.map((tokens) => tokens.join(' '));
};

/** 地域のリズムに、A メロの音の高さを順番に乗せる。 */
const paint = (rhythmBars, sourceBars) => {
  const pitches = sourceBars.flatMap((bar) => sounded(bar).map(([note]) => note));
  let index = 0;
  return rhythmBars.map((bar) =>
    parsePhrase(bar)
      .map(([note, beats]) => {
        if (!note) return `-:${num(beats)}`;
        const pitch = pitches[index % pitches.length];
        index += 1;
        return `${pitch}:${num(beats)}`;
      })
      .join(' '),
  );
};

/**
 * 地域の最後の音から、A メロの最初の音（つながる高さ）まで歩く 4 小節。
 * 最後の和音は A メロの最初の和音と同じにして、そこで和音も割らない。
 */
const WALKS = {
  grassland: {
    link: ['F#5:1 G5:0.5 A5:0.5 B5:2', 'B5:1 A5:0.5 G5:0.5 F#5:1 E5:1', 'E5:1 D5:1 C5:1 D5:1', 'B4:1 C5:1 D5:2'],
    linkChords: ['G', 'Em', 'C', 'G'],
    motif: ['F#5:1 G5:0.5 A5:0.5 D5:2', 'B5:1 A5:0.5 G5:0.5 G5:1 D5:1', 'C5:1 F#5:1 A5:1 C6:1', 'B5:1 A5:0.5 G5:0.5 D5:2'],
    motifChords: ['G', 'C', 'G', 'G'],
  },
  volcano: {
    link: ['B5:2 D6:2', 'C6:2 Ab5:2', 'G5:1 F5:1 Eb5:2', 'Eb5:1 D5:1 C5:1 G5:1'],
    linkChords: ['G', 'Ab', 'Eb', 'Cm'],
    motif: ['B5:1 D6:1 B5:1.5 G5:0.5', 'C6:2 Ab5:1 G5:1', 'Eb5:1 F5:1 G5:1 Bb5:1', 'C6:2 G5:2'],
    motifChords: ['G', 'Ab', 'Eb', 'Cm'],
  },
  sunken: {
    link: ['G#5:1 F#5:1 E5:2', 'D5:1 C#5:1 B4:2', 'C#5:1 D5:1 E5:1 F#5:1', 'E5:1 D5:1 C#5:2'],
    linkChords: ['F#m', 'Bm', 'D', 'F#m'],
    motif: ['G#5:1 F#5:0.5 E5:0.5 C#5:2', 'A5:1 B5:1 F#5:2', 'E5:1 F#5:1 G#5:1 A5:1', 'G#5:1 F#5:1 C#5:2'],
    motifChords: ['F#m', 'D', 'E', 'F#m'],
  },
  clockwork: {
    link: ['A5:1 G5:1 F5:2', 'Eb5:1 D5:1 C5:2', 'Bb4:1 C5:1 D5:1 Eb5:1', 'Bb4:1 D5:1 F5:1 D5:1'],
    linkChords: ['Gm', 'Cm', 'Eb', 'Gm'],
    motif: ['A5:1.5 G5:0.5 F5:2', 'Eb5:1 D5:1 C5:2', 'Bb4:0.5 C5:0.5 D5:0.5 Eb5:0.5 F5:1 G5:1', 'F5:2 D5:2'],
    motifChords: ['Gm', 'Cm', 'Eb', 'Gm'],
  },
};

const endings = (theme, barsOfTheme, elite, button) => {
  const target = lastPitch(barsOfTheme);
  const head = inKey(VERSE_BARS, elite).slice(0, 4);
  const quote = connected(head, target);
  const arrived = placed(head, target);
  const symbols = verseSymbols(elite);
  const walk = WALKS[elite.slug];
  const rhythm = barsOfTheme.slice(-4);
  const painted = paint(rhythm, arrived);
  const slow = [...doubleBar(quote[0]), ...doubleBar(quote[1])];
  return [
    { name: 'continue', sections: [section('verse', symbols.slice(0, 4), quote, theme, button)] },
    {
      name: 'gentle',
      sections: [section('verse', [symbols[0], symbols[0], symbols[1], symbols[1]], slow, theme, { ...button, gain: 0.82 })],
    },
    {
      name: 'link',
      sections: [
        section('link', walk.linkChords, walk.link, theme),
        section('verse', symbols.slice(0, 4), arrived, theme, button),
      ],
    },
    {
      name: 'rhythm',
      sections: [section('verse', symbols.slice(0, 4), [elideFirst(painted[0], target), ...painted.slice(1)], theme, button)],
    },
    {
      name: 'motif',
      sections: [
        section('motif', walk.motifChords, walk.motif, theme),
        section('verse', symbols.slice(0, 4), arrived, theme, button),
      ],
    },
  ];
};

const eliteByFile = (file) => {
  const song = REGION_SONGS.find((item) => item.file === file);
  if (!song || song.sections[0]?.name !== 'riff' || song.sections[1]?.name !== 'theme') {
    throw new Error(`エリート戦の出だしが見つからない: ${file}`);
  }
  return song;
};

export const ELITE_SAMPLE_SONGS = ELITES.flatMap((elite) => {
  const source = eliteByFile(elite.file);
  const theme = source.sections[1];
  const themeSection = cloneSection(theme);
  delete themeSection.fill;
  const barsOfTheme = theme.parts[0].notes.split('|').map((bar) => bar.trim());
  const button = source.sections[2]?.fill ? { fill: source.sections[2].fill } : {};
  return endings(theme, barsOfTheme, elite, button).map((ending, index) => ({
    file: `sample-elite-${elite.slug}-${String(index + 1).padStart(2, '0')}`,
    bpm: source.bpm,
    mix: source.mix,
    sections: [cloneSection(source.sections[0]), themeSection, ...ending.sections],
  }));
});

const near = (from, to, limit, label) => {
  const distance = Math.abs(midiOf(to) - midiOf(from));
  if (distance > limit) throw new Error(`${label}: ${from} → ${to}（${distance} 半音）`);
};

for (const sample of ELITE_SAMPLE_SONGS) {
  const themeBars = sample.sections[1].parts[0].notes.split('|').map((bar) => bar.trim());
  const target = lastPitch(themeBars);
  const entry = sample.sections[2].parts[0].notes.split('|').map((bar) => bar.trim());
  near(target, firstPitch(entry), 0, `${sample.file} の入り`);
  near(target, firstPitch([entry[0].replace(/^[A-G][#b]?\d+/, sounded(entry[0])[1][0])]), 4, `${sample.file} の 2 音目`);
  if (sample.sections[3]) {
    const next = sample.sections[3].parts[0].notes.split('|').map((bar) => bar.trim());
    near(lastPitch(entry), firstPitch(next), 0, `${sample.file} の受け渡し`);
  }
  for (const part of sample.sections.flatMap((sec) => sec.parts ?? [])) {
    const barsText = part.notes.split('|');
    const owner = sample.sections.find((sec) => (sec.parts ?? []).includes(part));
    if (barsText.length !== owner.chords.length) throw new Error(`${sample.file} ${owner.name} ${part.inst}: ${barsText.length} 小節`);
    barsText.forEach((text, index) => {
      if (Math.abs(beatsOf(text) - 4) > 1e-6) throw new Error(`${sample.file} ${owner.name} ${part.inst} の ${index + 1} 小節: ${beatsOf(text)} 拍`);
    });
  }
}
