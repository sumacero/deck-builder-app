// 草原エリートの候補を 10 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 出だしと地域の旋律は、今の草原エリートのまま。
// 気に入った「同じ拍」（地域のリズムに、ラスボスの A メロの高さを乗せる）を、混ぜ方だけ変える。
// 和音は地域の旋律の最後 4 小節のまま。入りのシンバルは鳴らさない。
// どの曲も、続きの最初の音は地域の旋律の最後の音にして、そこで割れないようにする。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { REGION_SONGS } from './bgm-regions.mjs';
import { join4, remapPhrase, transposePhrase } from './bgm-song.mjs';
import { D_MAJOR, VERSE_BARS } from './bgm-theme.mjs';

const SCALE = [0, 2, 4, 6, 7, 9, 11];
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const phrase = (lines) => join4(...lines);
const num = (beats) => String(Math.round(beats * 1000) / 1000);
const beatsOf = (text) => Math.round(parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0) * 1000) / 1000;

const midiOf = (name) => {
  const match = /^([A-G])([#b]?)(-?\d+)$/.exec(name);
  if (!match) throw new Error(`音名ではない: ${name}`);
  return PC[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0) + (Number(match[3]) + 1) * 12;
};

const nameOf = (midi) => {
  const wrapped = ((midi % 12) + 12) % 12;
  return `${NAMES[wrapped]}${Math.floor(midi / 12) - 1}`;
};

/** ト長調に吸着する。等距離なら A メロの音に近い方。 */
const snap = (midi, toward) => {
  let best = midi;
  let scaleDist = 99;
  let towardDist = 99;
  for (let delta = -3; delta <= 3; delta += 1) {
    const candidate = midi + delta;
    const pc = ((candidate % 12) + 12) % 12;
    if (!SCALE.includes(pc)) continue;
    const nextScale = Math.abs(delta);
    const nextToward = Math.abs(candidate - toward);
    if (nextScale < scaleDist || (nextScale === scaleDist && nextToward < towardDist)) {
      best = candidate;
      scaleDist = nextScale;
      towardDist = nextToward;
    }
  }
  return best;
};

const halfway = (region, target) => nameOf(snap(Math.round((midiOf(region) + midiOf(target)) / 2), midiOf(target)));

const cloneSection = (section) => ({
  ...section,
  chords: [...section.chords],
  parts: (section.parts ?? []).map((part) => ({ ...part })),
});

const sing = (theme, notes, gain = 1) =>
  (theme.parts ?? []).map((part) => ({
    inst: part.inst,
    vol: part.vol * gain,
    ...(part.double != null ? { double: part.double } : {}),
    notes,
  }));

const groove = (theme, extra = {}) => ({
  comp: theme.comp,
  bass: theme.bass,
  drums: theme.drums,
  ...(theme.energy != null ? { energy: theme.energy } : {}),
  crash: false,
  ...extra,
});

/** 地域の各音と、同じ順番の A メロの音を組にする。 */
const zip = (regionBars, quoteBars) => {
  const pitches = quoteBars.flatMap((bar) => parsePhrase(bar).flatMap(([note]) => (note ? [note] : [])));
  let index = 0;
  return regionBars.map((bar) =>
    parsePhrase(bar).map(([note, beats]) => {
      if (!note) return { note: null, beats, region: null, target: null };
      const target = pitches[index % pitches.length];
      index += 1;
      return { note, beats, region: note, target };
    }),
  );
};

const mapNotes = (grid, pick) =>
  grid.map((bar, barIndex) => {
    const sounded = bar.flatMap((event, index) => (event.note ? [index] : []));
    return bar.map((event, index) => {
      if (!event.note) return { ...event };
      const place = { barIndex, head: index === sounded[0], tail: index === sounded[sounded.length - 1] };
      return { ...event, note: pick(event, place) };
    });
  });

const render = (grid) => grid.map((bar) => bar.map((event) => `${event.note ?? '-'}:${num(event.beats)}`).join(' '));

const lastNote = (grid) => {
  const bar = grid[grid.length - 1];
  return bar.filter((event) => event.note).at(-1).note;
};

/** フレーズの頭を、直前の音のままにする。 */
const hold = (grid, pitch) => {
  const copy = grid.map((bar) => bar.map((event) => ({ ...event })));
  const head = copy[0].find((event) => event.note);
  if (head) head.note = pitch;
  return copy;
};

const regionOf = (grid) => mapNotes(grid, (event) => event.region);
const swapped = (grid) => mapNotes(grid, (event) => event.target);
const blended = (grid) => mapNotes(grid, (event) => halfway(event.region, event.target));
const nearest = (grid) => mapNotes(grid, (event) => (Math.abs(midiOf(event.region) - midiOf(event.target)) <= 2 ? event.target : event.region));
const heads = (grid) => mapNotes(grid, (event, place) => (place.head ? event.target : event.region));
const tails = (grid) => mapNotes(grid, (event, place) => (place.tail ? event.target : event.region));
const everyOther = (grid) => mapNotes(grid, (event, place) => (place.barIndex % 2 === 1 ? event.target : event.region));
const late = (grid) => mapNotes(grid, (event, place) => (place.barIndex >= 2 ? event.target : event.region));

/** 素材が切り替わる小節の頭を、直前の音につなぐ。 */
const carry = (grid, pitch, at) => {
  let next = hold(grid, pitch);
  for (const index of at) {
    const before = lastNote(next.slice(0, index));
    next = [...next.slice(0, index), ...hold(next.slice(index), before)];
  }
  return next;
};

const lead = (lines, chords, theme, { fill, shadow }) => ({
  name: 'tail',
  chords,
  parts: [
    ...sing(theme, phrase(lines)),
    ...(shadow ? [{ inst: theme.parts[0].inst, vol: 0.2, notes: shiftPhrase(phrase(shadow), -1) }] : []),
  ],
  ...groove(theme, fill ? { fill } : {}),
});

const grassland = () => {
  const source = REGION_SONGS.find((song) => song.file === 'elite-grassland');
  const theme = source.sections[1];
  const themeBars = theme.parts[0].notes.split('|').map((bar) => bar.trim());
  const tail = themeBars.slice(-4);
  const anchor = parsePhrase(themeBars.at(-1)).filter(([note]) => note).at(-1)[0];
  const quote = VERSE_BARS.slice(0, 4).map((line) => transposePhrase(remapPhrase(line, D_MAJOR), 5));
  const grid = zip(tail, quote);
  const chords = theme.chords.slice(-4);
  const again = [...chords, ...chords];
  const region = carry(regionOf(grid), anchor, []);
  const paint = carry(swapped(grid), anchor, []);
  const half = carry(blended(grid), anchor, []);
  const button = source.sections[2]?.fill ? { fill: source.sections[2].fill } : {};
  const themeSection = cloneSection(theme);
  delete themeSection.fill;

  const patterns = [
    { lines: render(paint), chords, ...button },
    { lines: render(carry([...regionOf(grid), ...swapped(grid)], anchor, [4])), chords: again, ...button },
    { lines: render(carry(heads(grid), anchor, [])), chords, ...button },
    { lines: render(carry(tails(grid), anchor, [])), chords, ...button },
    { lines: render(half), chords, ...button },
    { lines: render(carry(everyOther(grid), anchor, [1, 3])), chords, ...button },
    { lines: render(carry([...blended(grid), ...swapped(grid)], anchor, [4])), chords: again, ...button },
    { lines: render(carry(nearest(grid), anchor, [])), chords, ...button },
    { lines: render(region), chords, shadow: render(paint), ...button },
    { lines: render(carry(late(grid), anchor, [2])), chords, ...button },
  ];

  return patterns.map((pattern, index) => ({
    file: `sample-elite-grassland-${String(index + 1).padStart(2, '0')}`,
    bpm: source.bpm,
    mix: source.mix,
    sections: [cloneSection(source.sections[0]), themeSection, lead(pattern.lines, pattern.chords, theme, pattern)],
  }));
};

export const ELITE_SAMPLE_SONGS = grassland();

const firstPitch = (line) => parsePhrase(line).find(([note]) => note)[0];

for (const sample of ELITE_SAMPLE_SONGS) {
  const themeLine = sample.sections[1].parts[0].notes.split('|').map((bar) => bar.trim());
  const anchor = parsePhrase(themeLine.at(-1)).filter(([note]) => note).at(-1)[0];
  const tail = sample.sections[2];
  const opening = tail.parts[0].notes.split('|')[0];
  if (firstPitch(opening) !== anchor) throw new Error(`${sample.file} の入りが ${firstPitch(opening)}（${anchor} のはず）`);
  if (tail.chords.length !== tail.parts[0].notes.split('|').length) throw new Error(`${sample.file} の小節数が合わない`);
  for (const part of tail.parts) {
    part.notes.split('|').forEach((text, index) => {
      if (Math.abs(beatsOf(text) - 4) > 1e-6) throw new Error(`${sample.file} ${part.inst} の ${index + 1} 小節: ${beatsOf(text)} 拍`);
    });
  }
}

const heard = ELITE_SAMPLE_SONGS.map((sample) => sample.sections[2].parts.map((part) => part.notes).join('~'));
heard.forEach((notes, index) => {
  if (heard.indexOf(notes) !== index) throw new Error(`草原 ${index + 1} が別の候補と同じ旋律`);
});
