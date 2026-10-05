// タイトル曲の試作 4 案（2026-10-05）。図鑑の「🎵 BGM」で今のタイトル曲と聞き比べ、選ばれた案をタイトル曲に置き換える。
import { shiftPhrase } from './bgm-engine.mjs';
import { bars, join4, stretchPhrase } from './bgm-song.mjs';
import { CHORUS_BARS, VERSE_BARS } from './bgm-theme.mjs';

/** 今のタイトル曲の、笛の新しい旋律（出だし）と締め。 */
const OPENING = join4('A5:2 G5:1 F5:1', 'D5:3 F5:1', 'C5:2 F5:1 A5:1', 'G5:4');
const CLOSING = join4('D5:2 F5:2', 'Bb5:2 A5:1 G5:1', 'A5:3 E5:1', 'C#5:4');
const VERSE_HEAD = stretchPhrase(join4(...VERSE_BARS.slice(0, 2)), 2);
const VERSE_RISE = stretchPhrase(join4(...VERSE_BARS.slice(2, 4)), 2);

/** 案 1「−凱−」: 旋律はそのままで、笛を金管に、伴奏を弦とティンパニにしたオーケストラ版。 */
const orchestra = {
  file: 'title-draft-orchestra',
  bpm: 72,
  mix: { reverbLevel: 0.9, tone: 0.5, echoLevel: 0.3 },
  sections: [
    {
      name: 'opening',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      parts: [{ inst: 'brassLead', vol: 0.34, notes: OPENING, double: -1 }],
      comp: ['strings', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
    },
    {
      name: 'verse-head',
      chords: bars('Dm', 'Dm', 'C', 'C'),
      parts: [
        { inst: 'brassLead', vol: 0.36, notes: VERSE_HEAD },
        { inst: 'strings', vol: 0.2, notes: shiftPhrase(VERSE_HEAD, -1) },
      ],
      comp: ['strings', 'brassHits', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'verse-rise',
      chords: bars('Bb', 'Bb', 'A', 'A'),
      parts: [
        { inst: 'brassLead', vol: 0.38, notes: VERSE_RISE },
        { inst: 'flute', vol: 0.18, notes: shiftPhrase(VERSE_RISE, 1) },
      ],
      comp: ['strings', 'brassHits', 'arp8'],
      bass: 'sustain',
      drums: 'march',
    },
    {
      name: 'closing',
      chords: bars('Bb', 'Gm', 'A', 'A7'),
      parts: [{ inst: 'brassLead', vol: 0.32, notes: CLOSING, double: -1 }],
      comp: ['strings', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
    },
  ],
};

/** 案 2「−夜明け−」: ハープだけで始まり、笛 → 弦 → 金管と楽器が増え、最後は全員で A メロを歌い上げる。 */
const dawn = {
  file: 'title-draft-dawn',
  bpm: 72,
  mix: { reverbLevel: 0.9, tone: 0.48, echoLevel: 0.35 },
  sections: [
    {
      name: 'harp-alone',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      comp: ['arp8'],
      drums: 'none',
    },
    {
      name: 'flute',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      parts: [{ inst: 'flute', vol: 0.36, notes: OPENING }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'strings-join',
      chords: bars('Dm', 'Dm', 'C', 'C'),
      parts: [
        { inst: 'flute', vol: 0.34, notes: VERSE_HEAD },
        { inst: 'strings', vol: 0.18, notes: shiftPhrase(VERSE_HEAD, -1) },
      ],
      comp: ['arp8', 'strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'brass-sings',
      chords: bars('Bb', 'Bb', 'A', 'A'),
      parts: [
        { inst: 'brassLead', vol: 0.38, notes: VERSE_RISE, double: -1 },
        { inst: 'flute', vol: 0.2, notes: shiftPhrase(VERSE_RISE, 1) },
      ],
      comp: ['strings', 'brassHits', 'arp16'],
      bass: 'sustain',
      drums: 'march',
    },
    {
      name: 'afterglow',
      chords: bars('Bb', 'Gm', 'A', 'A7'),
      parts: [{ inst: 'flute', vol: 0.34, notes: CLOSING }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
  ],
};

/** 案 4「−予兆−」: 今のタイトル曲の最後に、ボス戦で初めて全部聞けるサビの頭 2 小節を、遠くの金管が小さく鳴らす。 */
const chorusTease = {
  file: 'title-draft-tease',
  bpm: 72,
  mix: { reverbLevel: 0.85, tone: 0.45, echoLevel: 0.35 },
  sections: [
    {
      name: 'opening',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      parts: [{ inst: 'flute', vol: 0.4, notes: OPENING }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'verse-head',
      chords: bars('Dm', 'Dm', 'C', 'C'),
      parts: [{ inst: 'brassLead', vol: 0.32, notes: VERSE_HEAD }],
      comp: ['strings', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
    },
    {
      name: 'closing',
      chords: bars('Bb', 'Gm', 'A', 'A7'),
      parts: [{ inst: 'flute', vol: 0.38, notes: CLOSING }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'distant-chorus',
      chords: bars('Bb', 'C', 'Bb', 'A'),
      parts: [
        {
          inst: 'brassLead',
          vol: 0.2,
          send: 0.7,
          notes: join4(CHORUS_BARS[0], CHORUS_BARS[1], 'D6:2 C6:1 Bb5:1', 'A5:4'),
        },
      ],
      comp: ['pad', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
      energy: 0.5,
    },
  ],
};

/** 金管のファンファーレ。導入の動機の「レ・レ」の刻みを、ラッパの 3 連打に。 */
const FANFARE = join4(
  'D5:0.25 D5:0.25 D5:0.5 A5:1.5 -:0.5 F5:0.5 A5:0.5',
  'Bb5:1.5 A5:0.5 G5:0.5 F5:0.5 G5:1',
  'A5:0.25 A5:0.25 A5:0.5 D6:1.5 -:0.5 C6:0.5 Bb5:0.5',
  'A5:3 -:1',
);

/** 案 5「−旗揚げ−」: 金管とティンパニのファンファーレ 4 小節で幕を開けてから、今のタイトル曲へ。 */
const fanfare = {
  file: 'title-draft-fanfare',
  bpm: 72,
  mix: { reverbLevel: 0.85, tone: 0.5, echoLevel: 0.3 },
  sections: [
    {
      name: 'fanfare',
      chords: bars('Dm', 'Gm C', 'Dm Bb', 'A'),
      parts: [{ inst: 'brassLead', vol: 0.4, notes: FANFARE, double: -1 }],
      comp: ['brassHits', 'strings'],
      bass: 'sustain',
      drums: 'timp',
      fill: 'roll',
    },
    {
      name: 'opening',
      chords: bars('Dm', 'Bb', 'F', 'C'),
      parts: [{ inst: 'flute', vol: 0.4, notes: OPENING }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
    {
      name: 'verse-head',
      chords: bars('Dm', 'Dm', 'C', 'C'),
      parts: [{ inst: 'brassLead', vol: 0.32, notes: VERSE_HEAD }],
      comp: ['strings', 'arp8'],
      bass: 'sustain',
      drums: 'timp',
    },
    {
      name: 'closing',
      chords: bars('Bb', 'Gm', 'A', 'A7'),
      parts: [{ inst: 'flute', vol: 0.38, notes: CLOSING }],
      comp: ['arp8', 'pad'],
      bass: 'sustain',
      drums: 'none',
    },
  ],
};

export const TITLE_DRAFTS = [orchestra, dawn, chorusTease, fanfare];
