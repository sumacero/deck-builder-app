// 草原エリートの候補を 5 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 出だしと地域の旋律は、今の草原エリートのまま。
// 気に入った 3 つを混ぜる。もう一周（地域の旋律をもう一度）、影（A メロを小さく下に重ねる）、
// 後半（フレーズの後ろ 2 小節だけ、笛が同じ拍になる）。
// 和音は地域の旋律の最後 4 小節のまま。入りのシンバルは鳴らさない。
// 続きの最初の音は、地域の旋律の最後の音。
import { parsePhrase, shiftPhrase } from './bgm-engine.mjs';
import { REGION_SONGS } from './bgm-regions.mjs';
import { join4, remapPhrase, transposePhrase } from './bgm-song.mjs';
import { D_MAJOR, VERSE_BARS } from './bgm-theme.mjs';

const phrase = (lines) => join4(...lines);
const num = (beats) => String(Math.round(beats * 1000) / 1000);
const beatsOf = (text) => Math.round(parsePhrase(text).reduce((sum, [, beats]) => sum + beats, 0) * 1000) / 1000;
const rest = (count) => Array.from({ length: count }, () => '-:4');

const cloneSection = (section) => ({
  ...section,
  chords: [...section.chords],
  parts: (section.parts ?? []).map((part) => ({ ...part })),
});

const sing = (theme, notes) =>
  (theme.parts ?? []).map((part) => ({
    inst: part.inst,
    vol: part.vol,
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
  grid.map((bar, barIndex) =>
    bar.map((event) => {
      if (!event.note) return { ...event };
      return { ...event, note: pick(event, barIndex) };
    }),
  );

const render = (grid) => grid.map((bar) => bar.map((event) => `${event.note ?? '-'}:${num(event.beats)}`).join(' '));

const lastNote = (grid) => grid[grid.length - 1].filter((event) => event.note).at(-1).note;

/** 指定した小節の頭を、直前の音のままにする。0 は曲の続きの頭。 */
const carry = (grid, pitch, at) => {
  const copy = grid.map((bar) => bar.map((event) => ({ ...event })));
  const glue = (bars, note) => {
    const head = bars[0]?.find((event) => event.note);
    if (head) head.note = note;
    return bars;
  };
  let next = glue(copy, pitch);
  for (const index of at) {
    next = [...next.slice(0, index), ...glue(next.slice(index), lastNote(next.slice(0, index)))];
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
  const anchor = parsePhrase(themeBars.at(-1)).filter(([note]) => note).at(-1)[0];
  const quote = VERSE_BARS.slice(0, 4).map((line) => transposePhrase(remapPhrase(line, D_MAJOR), 5));
  const grid = zip(themeBars.slice(-4), quote);
  const region = mapNotes(grid, (event) => event.region);
  const paint = mapNotes(grid, (event) => event.target);
  const back = mapNotes(grid, (event, barIndex) => (barIndex >= 2 ? event.target : event.region));
  const chords = theme.chords.slice(-4);
  const again = [...chords, ...chords];
  const button = source.sections[2]?.fill ? { fill: source.sections[2].fill } : {};
  const themeSection = cloneSection(theme);
  delete themeSection.fill;
  const quiet = render(carry(paint, anchor, []));

  const patterns = [
    {
      // もう一周のあいだ影を重ね、次の 4 小節で笛が同じ拍を歌う。
      lines: render(carry([...region, ...paint], anchor, [4])),
      chords: again,
      shadow: [...quiet, ...rest(4)],
      ...button,
    },
    {
      // 後半 2 小節だけ笛が同じ拍。影は最初から最後まで A メロ。
      lines: render(carry(back, anchor, [2])),
      chords,
      shadow: quiet,
      ...button,
    },
    {
      // もう一周して、二周目の後半 2 小節だけ同じ拍。影は無し。
      lines: render(carry([...region, ...back], anchor, [4, 6])),
      chords: again,
      ...button,
    },
    {
      // もう一周のあいだ影を重ね続け、笛が同じ拍になるのは最後の 2 小節だけ。
      lines: render(carry([...region, ...back], anchor, [4, 6])),
      chords: again,
      shadow: render(carry([...paint, ...paint], anchor, [4])),
      ...button,
    },
    {
      // 前半は笛が地域で影が A メロ。後半 2 小節で入れ替わる。
      lines: render(carry(back, anchor, [2])),
      chords,
      shadow: render(carry([...paint.slice(0, 2), ...region.slice(2)], anchor, [2])),
      ...button,
    },
  ];

  return patterns.map((pattern, index) => ({
    file: `sample-elite-grassland-${String(index + 1).padStart(2, '0')}`,
    bpm: source.bpm,
    mix: source.mix,
    sections: [cloneSection(source.sections[0]), themeSection, lead(pattern.lines, pattern.chords, theme, pattern)],
  }));
};

export const ELITE_SAMPLE_SONGS = grassland();

const firstPitch = (line) => parsePhrase(line).find(([note]) => note)?.[0];

for (const sample of ELITE_SAMPLE_SONGS) {
  const themeLine = sample.sections[1].parts[0].notes.split('|').map((bar) => bar.trim());
  const anchor = parsePhrase(themeLine.at(-1)).filter(([note]) => note).at(-1)[0];
  const tail = sample.sections[2];
  if (firstPitch(tail.parts[0].notes.split('|')[0]) !== anchor) throw new Error(`${sample.file} の入りが最後の音と違う`);
  for (const part of tail.parts) {
    const barsText = part.notes.split('|');
    if (barsText.length !== tail.chords.length) throw new Error(`${sample.file} ${part.inst}: ${barsText.length} 小節`);
    barsText.forEach((text, index) => {
      if (Math.abs(beatsOf(text) - 4) > 1e-6) throw new Error(`${sample.file} ${part.inst} の ${index + 1} 小節: ${beatsOf(text)} 拍`);
    });
  }
}

const heard = ELITE_SAMPLE_SONGS.map((sample) => sample.sections[2].parts.map((part) => part.notes).join('~'));
heard.forEach((notes, index) => {
  if (heard.indexOf(notes) !== index) throw new Error(`草原 ${index + 1} が別の候補と同じ`);
});
