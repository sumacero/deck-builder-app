// ボス戦の候補 30 曲。ゲーム中には流さない。図鑑の BGM で聴く。
// 旋律の型も編成も曲ごとに別。テンポ、調、主旋律の楽器、ドラムを変えて、聴き分けられるようにしてある。
import { parsePhrase } from './bgm-engine.mjs';
import { bars } from './bgm-song.mjs';

const MID = { reverbLevel: 0.4, tone: 0.62, echoLevel: 0.16 };
const DRY = { reverbLevel: 0.22, tone: 0.72, echoLevel: 0.08 };
const HALL = { reverbLevel: 0.72, tone: 0.46, echoLevel: 0.28 };

const phrase = (...barsText) => barsText.join(' | ');
const voice = (inst, vol, ...barsText) => ({ inst, vol, notes: phrase(...barsText) });

const section = (name, chords, parts, style = {}) => ({
  name,
  chords: bars(...chords),
  parts,
  comp: style.comp ?? ['chug'],
  bass: style.bass ?? 'gallop',
  drums: style.drums ?? 'rock',
  level: style.level ?? 0.86,
  ...(style.fill ? { fill: style.fill } : {}),
  ...(style.crash === false ? { crash: false } : {}),
});

const song = (n, bpm, sections, mix = MID) => ({
  file: `boss-sample-${String(n).padStart(2, '0')}`,
  bpm,
  mix,
  sections,
});

export const BOSS_SAMPLE_SONGS = [
  // 1 黒金の門
  song(1, 156, [
    section('hook', ['Dm', 'Bb', 'F', 'A'], [voice('brassLead', 0.4, 'D5:1 F5:1 A5:0.5 G5:0.5 F5:1', 'Bb5:1 A5:1 G5:2', 'A5:0.5 C6:0.5 D6:1 C6:1 Bb5:1', 'A5:2 E5:2')], { comp: ['chug', 'brassHits'], drums: 'double' }),
    section('rise', ['Bb', 'F', 'C', 'A'], [voice('guitarLead', 0.32, 'F5:2 G5:2', 'A5:1 Bb5:1 C6:2', 'D6:2 C6:1 Bb5:1', 'A5:4')], { comp: ['strings'], bass: 'sustain', drums: 'half', level: 0.74, crash: false }),
    section('shout', ['Bb', 'C', 'F', 'A'], [voice('brassLead', 0.4, 'D6:1 C6:0.5 Bb5:0.5 A5:1 F5:1', 'G5:1 A5:1 Bb5:2', 'C6:1 D6:1 F6:1 D6:1', 'A5:2 E5:2')], { comp: ['stabs', 'chug'], bass: 'drive8', drums: 'drive', level: 0.94, fill: 'toms' }),
  ], DRY),
  // 2 紅蓮の蹄
  song(2, 148, [
    section('hook', ['Em', 'C', 'G', 'D'], [voice('guitarLead', 0.4, 'E5:0.5 G5:0.5 B5:1 E6:1 D6:1', 'C6:1 B5:1 G5:2', 'A5:1 B5:1 C6:1 D6:1', 'E6:2 B5:2')], { comp: ['chug', 'organ'] }),
    section('run', ['Em', 'C', 'G', 'B'], [voice('guitarLead', 0.42, 'E6:1 D6:1 B5:2', 'C6:1.5 B5:0.5 A5:2', 'G5:1 A5:1 B5:2', 'E5:4')], { fill: 'snare' }),
    section('shout', ['Em', 'D', 'G', 'B'], [voice('brassLead', 0.36, 'G5:1 B5:1 E6:2', 'A5:1 C6:1 B5:2', 'D6:1 E6:1 G6:1 E6:1', 'B5:2 E5:2')], { comp: ['brassHits', 'chug'], drums: 'double', level: 0.94, fill: 'toms' }),
  ], DRY),
  // 3 翠の刃
  song(3, 128, [
    section('hook', ['G', 'D', 'Em', 'C'], [voice('flute', 0.4, 'D5:1 G5:1 A5:0.5 B5:0.5 A5:1', 'G5:1.5 E5:0.5 D5:2', 'C5:1 D5:1 E5:1 G5:1', 'F#5:2 D5:2')], { comp: ['arp8', 'pad'], bass: 'walk', drums: 'march' }),
    section('answer', ['G', 'C', 'D', 'D'], [voice('bell', 0.22, 'B5:2 A5:1 G5:1', 'E5:1 G5:1 C6:2', 'A5:1 B5:1 D6:1 B5:1', 'A5:2 F#5:2')], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'light', level: 0.78, crash: false }),
    section('shout', ['G', 'C', 'D', 'G'], [voice('flute', 0.42, 'G5:1 B5:1 D6:2', 'C6:1 A5:1 G5:2', 'B5:0.5 C6:0.5 D6:1 E6:1 D6:1', 'B5:2 G5:2')], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'march', fill: 'snare' }),
  ]),
  // 4 深海の鐘
  song(4, 92, [
    section('toll', ['Am', 'F', 'C', 'G'], [voice('bell', 0.36, 'A5:3 E5:1', 'C6:2 G5:2', 'B5:1 A5:1 G5:2', 'E5:4')], { comp: ['pad', 'arp8'], bass: 'sustain', drums: 'half', level: 0.76, crash: false }),
    section('depth', ['Am', 'F', 'Dm', 'E'], [voice('strings', 0.28, 'E5:2 A5:2', 'F5:1 G5:1 A5:2', 'G5:2 E5:1 C5:1', 'A4:4')], { comp: ['pad'], bass: 'sustain', drums: 'timp', level: 0.72, crash: false }),
    section('surface', ['Am', 'G', 'F', 'E'], [voice('bell', 0.34, 'C6:2 B5:1 A5:1', 'G5:4', 'A5:1 C6:1 E6:2', 'A5:4')], { comp: ['pad', 'arp8'], bass: 'sustain', drums: 'half', fill: 'snare' }),
  ], HALL),
  // 5 歯車の王
  song(5, 150, [
    section('ostinato', ['Am', 'F', 'G', 'Em'], [voice('squareLead', 0.24, 'A4:0.5 C5:0.5 E5:0.5 A5:0.5 G5:0.5 E5:0.5 C5:0.5 A4:0.5', 'F4:0.5 A4:0.5 C5:0.5 F5:0.5 E5:1 C5:1', 'G4:0.5 B4:0.5 D5:0.5 G5:0.5 F5:0.5 D5:0.5 B4:0.5 G4:0.5', 'E5:1 G5:1 B5:2')], { comp: ['arp16'], bass: 'octave', drums: 'drive' }),
    section('climb', ['C', 'G', 'Am', 'E'], [voice('squareLead', 0.26, 'C5:0.5 E5:0.5 A5:1 G5:1 E5:1', 'F5:2 E5:1 C5:1', 'D5:0.5 E5:0.5 F5:0.5 G5:0.5 A5:2', 'B5:2 E5:2')], { comp: ['arp16', 'stabs'], bass: 'octave', drums: 'drive' }),
    section('shout', ['Am', 'F', 'G', 'E'], [voice('brassLead', 0.34, 'A5:1 E5:1 C5:1 A4:1', 'F5:1 A5:1 C6:2', 'G5:1 B5:1 D6:1 B5:1', 'E5:4')], { comp: ['stabs', 'chug'], bass: 'octave', drums: 'double', level: 0.92, fill: 'snare' }),
  ], DRY),
  // 6 王城
  song(6, 78, [
    section('hymn', ['Dm', 'Bb', 'F', 'A'], [voice('organ', 0.34, 'D4:4', 'F4:2 A4:2', 'G4:4', 'A4:2 E4:2')], { comp: ['strings', 'pad'], bass: 'sustain', drums: 'timp', level: 0.78, crash: false }),
    section('brass', ['Dm', 'Bb', 'C', 'A'], [voice('brassLead', 0.32, 'D5:2 F5:2', 'Bb5:4', 'A5:2 G5:2', 'E5:4')], { comp: ['strings'], bass: 'sustain', drums: 'timp', level: 0.82 }),
    section('close', ['Dm', 'Bb', 'A', 'Dm'], [voice('organ', 0.36, 'A5:4', 'D6:2 C6:2', 'Bb5:2 A5:2', 'D5:4')], { comp: ['strings', 'pad'], bass: 'sustain', drums: 'half', fill: 'roll' }),
  ], HALL),
  // 7 嵐の翼
  song(7, 170, [
    section('gust', ['Gm', 'Eb', 'Bb', 'F'], [voice('strings', 0.32, 'G5:0.5 Bb5:0.5 D6:1 F6:1 D6:1', 'C6:1 Bb5:1 G5:2', 'Eb6:1 D6:1 C6:2', 'Bb5:2 A5:2')], { comp: ['chug', 'strings'], drums: 'double' }),
    section('dive', ['Gm', 'Eb', 'F', 'D'], [voice('strings', 0.3, 'D5:1 G5:1 Bb5:1 D6:1', 'Eb6:2 D6:1 Bb5:1', 'C6:1 A5:1 F5:2', 'G5:4')], { drums: 'drive' }),
    section('shout', ['Gm', 'Eb', 'Bb', 'D'], [voice('brassLead', 0.38, 'Bb5:1 D6:1 G6:2', 'F6:1 Eb6:1 D6:2', 'C6:1 Bb5:1 A5:2', 'G5:2 D5:2')], { comp: ['brassHits', 'chug'], drums: 'double', level: 0.94, fill: 'toms' }),
  ], DRY),
  // 8 溶岩
  song(8, 120, [
    section('pound', ['Cm', 'Ab', 'Bb', 'G'], [voice('brassLead', 0.38, 'C5:1 Eb5:1 G5:2', 'Ab5:1 G5:1 Eb5:2', 'F5:1 G5:1 Ab5:1 Bb5:1', 'C6:2 G5:2')], { comp: ['brassHits', 'strings'], bass: 'sustain', drums: 'tribal' }),
    section('guitar', ['Cm', 'Ab', 'Bb', 'G'], [voice('guitarLead', 0.36, 'Eb5:2 G5:1 Bb5:1', 'C6:1 Bb5:1 Ab5:2', 'G5:1 F5:1 Eb5:2', 'D5:4')], { comp: ['chug'], bass: 'gallop', drums: 'tribal' }),
    section('shout', ['Cm', 'Eb', 'Ab', 'G'], [voice('brassLead', 0.4, 'G5:1 Bb5:1 C6:2', 'Eb6:2 C6:2', 'Bb5:1 Ab5:1 G5:2', 'C5:4')], { comp: ['brassHits', 'chug'], bass: 'gallop', drums: 'tribal', level: 0.94, fill: 'toms' }),
  ]),
  // 9 氷の鏡
  song(9, 104, [
    section('mirror', ['Dm', 'Gm', 'Bb', 'A'], [voice('harp', 0.34, 'D5:0.5 -:0.5 A5:0.5 -:0.5 F5:2', 'E5:0.5 -:0.5 C5:0.5 -:0.5 G4:2', 'A4:1 D5:1 F5:1 A5:1', 'C#5:4')], { comp: ['arp8', 'pad'], bass: 'sustain', drums: 'half', level: 0.74, crash: false }),
    section('flute', ['Dm', 'C', 'Bb', 'A'], [voice('flute', 0.36, 'A5:1.5 G5:0.5 F5:2', 'E5:2 C5:2', 'D5:1 F5:1 A5:2', 'E5:2 C#5:2')], { comp: ['arp8', 'pad'], bass: 'sustain', drums: 'light', level: 0.78, crash: false }),
    section('bell', ['Dm', 'Bb', 'A', 'Dm'], [voice('bell', 0.28, 'D6:2 A5:2', 'C6:1 Bb5:1 A5:2', 'G5:2 F5:1 E5:1', 'D5:4')], { comp: ['pad'], bass: 'sustain', drums: 'half', fill: 'snare' }),
  ], HALL),
  // 10 雷鳴
  song(10, 158, [
    section('bolt', ['Em', 'C', 'D', 'B'], [voice('triLead', 0.28, 'E5:0.25 G5:0.25 B5:0.25 E6:0.25 D6:0.5 B5:0.5 G5:1 E5:1', 'A5:0.5 B5:0.5 C6:1 B5:1 G5:1', 'F#5:0.5 A5:0.5 C6:0.5 E6:0.5 D6:2', 'B5:2 E5:2')], { comp: ['stabs', 'arp16'], bass: 'octave', drums: 'drive' }),
    section('arc', ['Em', 'C', 'D', 'B'], [voice('triLead', 0.3, 'G5:1 B5:1 E6:2', 'D6:1 C6:1 B5:2', 'A5:1 G5:1 F#5:2', 'E5:4')], { comp: ['stabs'], bass: 'octave', drums: 'drive' }),
    section('shout', ['Em', 'G', 'D', 'B'], [voice('squareLead', 0.24, 'E6:1 D6:0.5 C6:0.5 B5:1 G5:1', 'A5:2 F#5:2', 'G5:1 A5:1 B5:2', 'E6:2 B5:2')], { comp: ['stabs', 'chug'], bass: 'octave', drums: 'double', level: 0.92, fill: 'snare' }),
  ], DRY),
  // 11 古龍
  song(11, 84, [
    section('step', ['F', 'Bb', 'C', 'Dm'], [voice('brassLead', 0.36, 'F4:2 A4:2', 'C5:4', 'Bb4:2 A4:2', 'G4:4')], { comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'timp', level: 0.8, crash: false }),
    section('rise', ['F', 'Bb', 'C', 'F'], [voice('brassLead', 0.38, 'C5:2 F5:2', 'G5:4', 'A5:2 G5:2', 'F5:4')], { comp: ['strings'], bass: 'sustain', drums: 'timp' }),
    section('roar', ['F', 'C', 'Bb', 'F'], [voice('brassLead', 0.4, 'A5:1 C6:1 F6:2', 'E6:2 C6:2', 'D6:1 Bb5:1 A5:2', 'F5:4')], { comp: ['brassHits', 'strings'], bass: 'sustain', drums: 'half', level: 0.92, fill: 'roll' }),
  ], HALL),
  // 12 剣戟
  song(12, 162, [
    section('clash', ['Am', 'G', 'F', 'E'], [voice('guitarLead', 0.4, 'A5:0.5 C6:0.5 E6:1 D6:0.5 C6:0.5 B5:1', 'A5:1 G5:1 E5:2', 'F5:0.5 G5:0.5 A5:1 C6:1 E6:1', 'D6:1 E6:1 A5:2')], { comp: ['chug'], drums: 'rock' }),
    section('press', ['Am', 'G', 'F', 'E'], [voice('guitarLead', 0.42, 'E5:1 A5:1 C6:1 E6:1', 'D6:2 C6:1 B5:1', 'A5:1 G5:1 F5:2', 'E5:4')], { drums: 'drive', fill: 'snare' }),
    section('shout', ['Am', 'F', 'G', 'E'], [voice('brassLead', 0.36, 'C6:1 B5:1 A5:2', 'G5:1 A5:1 B5:2', 'C6:0.5 D6:0.5 E6:1 G6:1 E6:1', 'A5:2 E5:2')], { comp: ['brassHits', 'chug'], drums: 'double', level: 0.94, fill: 'toms' }),
  ], DRY),
  // 13 祝砲
  song(13, 118, [
    section('fanfare', ['Bb', 'Eb', 'F', 'Gm'], [voice('brassLead', 0.4, 'Bb4:1 D5:1 F5:1 Bb5:1', 'A5:1 G5:1 F5:2', 'G5:1 A5:1 Bb5:2', 'C6:2 A5:2')], { comp: ['brassHits', 'strings'], bass: 'walk', drums: 'march' }),
    section('flute', ['Bb', 'Eb', 'F', 'D'], [voice('flute', 0.34, 'D5:2 F5:1 G5:1', 'Eb5:1 F5:1 G5:2', 'A5:2 G5:1 F5:1', 'D5:4')], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'march', level: 0.8 }),
    section('shout', ['Bb', 'Eb', 'F', 'Bb'], [voice('brassLead', 0.4, 'Bb5:2 F5:1 D5:1', 'Eb6:1 D6:1 C6:2', 'Bb5:1 A5:1 G5:2', 'F5:2 D5:2')], { comp: ['brassHits', 'strings'], bass: 'walk', drums: 'march', fill: 'snare' }),
  ]),
  // 14 夜の城壁
  song(14, 108, [
    section('watch', ['Dm', 'A', 'Bb', 'C'], [voice('strings', 0.3, 'A4:2 D5:2', 'F5:1 E5:1 D5:2', 'C5:2 Bb4:1 A4:1', 'E4:4')], { comp: ['pad'], bass: 'sustain', drums: 'half', level: 0.74, crash: false }),
    section('guitar', ['Dm', 'Bb', 'F', 'A'], [voice('guitarLead', 0.32, 'D5:1 F5:1 A5:2', 'G5:2 F5:1 E5:1', 'F5:1 G5:1 A5:2', 'C#5:4')], { comp: ['pad', 'organ'], bass: 'sustain', drums: 'half', level: 0.8, crash: false }),
    section('alarm', ['Dm', 'Bb', 'A', 'Dm'], [voice('strings', 0.34, 'D5:1 A5:1 D6:2', 'C6:1 Bb5:1 A5:2', 'G5:1 F5:1 E5:2', 'D5:4')], { comp: ['strings', 'chug'], bass: 'gallop', drums: 'rock', level: 0.9, fill: 'snare' }),
  ], HALL),
  // 15 潮の門
  song(15, 134, [
    section('tide', ['Cm', 'Ab', 'Fm', 'G'], [voice('guitarLead', 0.38, 'C5:1 G5:1 Eb5:1 C5:1', 'Ab4:1 C5:1 Eb5:2', 'F5:1 G5:1 Bb5:1 G5:1', 'C6:2 G5:2')], { comp: ['arp8', 'organ'] }),
    section('swell', ['Cm', 'Bb', 'Ab', 'G'], [voice('guitarLead', 0.38, 'Eb5:2 C5:2', 'Bb4:1 D5:1 F5:2', 'G5:1 Ab5:1 Bb5:2', 'C6:2 Eb5:2')]),
    section('crest', ['Cm', 'Ab', 'Bb', 'G'], [voice('flute', 0.36, 'G5:1 C6:1 Eb6:2', 'D6:1 C6:1 Bb5:2', 'Ab5:1 G5:1 F5:2', 'Eb5:4')], { comp: ['arp8', 'strings'], drums: 'drive', fill: 'snare' }),
  ]),
  // 16 傀儡
  song(16, 146, [
    section('coil', ['F#m', 'D', 'E', 'C#m'], [voice('squareLead', 0.24, 'F#5:0.5 A5:0.5 C#6:1 E6:0.5 C#6:0.5 A5:1', 'B5:1 A5:1 F#5:2', 'G#5:0.5 A5:0.5 B5:1 C#6:1 E6:1', 'F#6:2 C#6:2')], { comp: ['arp16', 'stabs'], bass: 'octave', drums: 'double' }),
    section('gear', ['C#m', 'E', 'F#m', 'C#'], [voice('squareLead', 0.24, 'C#5:1 E5:1 F#5:1 A5:1', 'B5:2 A5:1 G#5:1', 'A5:1 F#5:1 E5:2', 'C#5:4')], { comp: ['arp16'], bass: 'octave', drums: 'drive' }),
    section('shout', ['F#m', 'D', 'E', 'C#'], [voice('brassLead', 0.36, 'F#5:1 C#6:1 F#6:2', 'E6:1 D6:1 C#6:2', 'B5:1 A5:1 G#5:2', 'F#5:4')], { comp: ['stabs', 'chug'], bass: 'octave', drums: 'double', level: 0.94, fill: 'snare' }),
  ], DRY),
  // 17 森の王
  song(17, 116, [
    section('court', ['D', 'G', 'A', 'Bm'], [voice('flute', 0.4, 'D5:1 F#5:1 A5:1 D6:1', 'B5:1 A5:1 G5:2', 'E5:1 F#5:1 G5:1 A5:1', 'F#5:2 D5:2')], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'march' }),
    section('horn', ['D', 'G', 'A', 'F#'], [voice('brassLead', 0.32, 'F#5:2 A5:2', 'G5:1 B5:1 D6:2', 'C#6:1 B5:1 A5:2', 'F#5:4')], { comp: ['strings', 'brassHits'], bass: 'walk', drums: 'march', level: 0.84 }),
    section('shout', ['D', 'G', 'A', 'D'], [voice('flute', 0.42, 'A5:1 D6:1 F#6:2', 'E6:1 D6:1 B5:2', 'A5:1 G5:1 F#5:2', 'D5:4')], { comp: ['arp8', 'strings'], bass: 'walk', drums: 'march', fill: 'snare' }),
  ]),
  // 18 星の縁
  song(18, 96, [
    section('edge', ['Em', 'C', 'Am', 'B'], [voice('bell', 0.3, 'E5:4', 'G5:2 B5:2', 'A5:2 G5:1 E5:1', 'F#5:4')], { comp: ['pad'], bass: 'sustain', drums: 'half', level: 0.72, crash: false }),
    section('strings', ['Em', 'C', 'D', 'B'], [voice('strings', 0.26, 'B4:2 E5:2', 'C5:4', 'D5:2 E5:2', 'F#5:4')], { comp: ['pad'], bass: 'sustain', drums: 'timp', level: 0.74, crash: false }),
    section('fall', ['Em', 'C', 'Am', 'B'], [voice('bell', 0.32, 'E6:2 D6:1 C6:1', 'B5:4', 'G5:1 A5:1 B5:2', 'E5:4')], { comp: ['pad', 'arp8'], bass: 'sustain', drums: 'half', fill: 'snare' }),
  ], HALL),
  // 19 鉄騎
  song(19, 152, [
    section('charge', ['Gm', 'Cm', 'D', 'Gm'], [voice('brassLead', 0.4, 'G4:1 Bb4:1 D5:1 G5:1', 'F5:1 Eb5:1 D5:2', 'C5:1 D5:1 Eb5:1 F5:1', 'D5:2 A4:2')], { comp: ['chug', 'brassHits'], drums: 'double' }),
    section('line', ['Gm', 'Eb', 'F', 'D'], [voice('brassLead', 0.38, 'Bb4:2 D5:2', 'Eb5:1 F5:1 G5:2', 'A5:2 G5:1 F5:1', 'D5:4')], { drums: 'double' }),
    section('shout', ['Gm', 'Eb', 'D', 'Gm'], [voice('brassLead', 0.42, 'G5:1 Bb5:1 D6:2', 'C6:1 Bb5:1 A5:2', 'G5:1 F5:1 D5:2', 'G4:4')], { comp: ['brassHits', 'chug'], drums: 'double', level: 0.96, fill: 'toms' }),
  ], DRY),
  // 20 砂の王
  song(20, 114, [
    section('dune', ['Cm', 'Fm', 'G', 'Cm'], [voice('synthBrass', 0.32, 'C5:1 Eb5:0.5 G5:0.5 Bb5:1 Ab5:1', 'G5:2 Eb5:2', 'F5:1 G5:1 Ab5:2', 'G5:1 F5:1 Eb5:2')], { comp: ['stabs', 'strings'], drums: 'desertDrive' }),
    section('flute', ['Cm', 'Ab', 'Bb', 'G'], [voice('flute', 0.34, 'Eb5:1.5 F5:0.5 G5:2', 'Ab5:2 G5:1 F5:1', 'Eb5:2 C5:2', 'D5:4')], { comp: ['arp8', 'pad'], bass: 'walk', drums: 'desert', level: 0.78, crash: false }),
    section('shout', ['Cm', 'Fm', 'G', 'Cm'], [voice('synthBrass', 0.36, 'C5:2 G5:2', 'Bb5:1 Ab5:1 G5:2', 'F5:1 Eb5:1 D5:2', 'C5:4')], { comp: ['stabs', 'brassHits'], drums: 'desertDrive', fill: 'toms' }),
  ]),
  // 21 断崖
  song(21, 142, [
    section('cliff', ['Em', 'D', 'C', 'B'], [voice('guitarLead', 0.4, 'E5:1 B5:1 E6:1 D6:1', 'C6:2 B5:1 G5:1', 'A5:1 B5:1 C6:2', 'B5:2 E5:2')], { comp: ['chug'], drums: 'drive' }),
    section('slide', ['Em', 'C', 'D', 'B'], [voice('guitarLead', 0.4, 'G5:2 A5:1 B5:1', 'C6:1 D6:1 E6:2', 'D6:1 C6:1 B5:2', 'E5:4')]),
    section('shout', ['Em', 'G', 'D', 'E'], [voice('brassLead', 0.36, 'B5:1 E6:1 G6:2', 'F#6:1 E6:1 D6:2', 'C6:1 B5:1 A5:2', 'E5:4')], { comp: ['brassHits', 'chug'], drums: 'double', level: 0.94, fill: 'toms' }),
  ], DRY),
  // 22 聖歌
  song(22, 80, [
    section('chant', ['F', 'Bb', 'C', 'F'], [voice('organ', 0.34, 'F4:2 A4:1 C5:1', 'Bb4:4', 'A4:2 G4:2', 'F4:4')], { comp: ['strings', 'pad'], bass: 'sustain', drums: 'timp', level: 0.76, crash: false }),
    section('verse', ['F', 'C', 'Bb', 'F'], [voice('organ', 0.36, 'C5:2 F5:2', 'G5:2 A5:2', 'Bb5:2 A5:1 G5:1', 'F5:4')], { comp: ['strings'], bass: 'sustain', drums: 'timp' }),
    section('amen', ['F', 'C', 'Bb', 'F'], [voice('brassLead', 0.34, 'A5:1 C6:1 F6:2', 'E6:2 D6:2', 'C6:1 Bb5:1 A5:2', 'F5:4')], { comp: ['strings', 'brassHits'], bass: 'sustain', drums: 'half', level: 0.9, fill: 'roll' }),
  ], HALL),
  // 23 疾風
  song(23, 176, [
    section('run', ['G', 'C', 'D', 'Em'], [voice('flute', 0.4, 'G5:0.5 A5:0.5 B5:0.5 D6:0.5 B5:1 G5:1', 'A5:0.5 B5:0.5 C6:1 A5:2', 'F#5:0.5 G5:0.5 A5:1 D6:1 C6:1', 'B5:2 G5:2')], { comp: ['arp16'], bass: 'octave', drums: 'drive' }),
    section('turn', ['G', 'Em', 'C', 'D'], [voice('flute', 0.4, 'D6:1 B5:1 G5:2', 'E6:1 D6:1 C6:2', 'B5:1 A5:1 G5:2', 'F#5:2 D5:2')], { comp: ['arp16', 'stabs'], bass: 'octave', drums: 'drive' }),
    section('shout', ['G', 'D', 'C', 'G'], [voice('flute', 0.42, 'G5:1 D6:1 G6:2', 'F#6:1 E6:1 D6:2', 'C6:1 B5:1 A5:2', 'G5:4')], { comp: ['stabs', 'arp8'], bass: 'octave', drums: 'double', level: 0.94, fill: 'snare' }),
  ], DRY),
  // 24 釜
  song(24, 100, [
    section('kiln', ['Dm', 'C', 'Bb', 'A'], [voice('brassLead', 0.36, 'D4:2 A4:2', 'F4:4', 'G4:2 A4:2', 'D4:4')], { comp: ['brassHits'], bass: 'sustain', drums: 'tribal', level: 0.84 }),
    section('guitar', ['Dm', 'C', 'Bb', 'A'], [voice('guitarLead', 0.36, 'D5:1 F5:1 A5:2', 'G5:2 F5:1 E5:1', 'F5:1 G5:1 A5:2', 'E5:4')], { comp: ['chug'], bass: 'gallop', drums: 'tribal' }),
    section('shout', ['Dm', 'Bb', 'A', 'Dm'], [voice('brassLead', 0.4, 'A4:1 D5:1 F5:1 A5:1', 'Bb5:2 A5:1 G5:1', 'F5:2 E5:2', 'D5:4')], { comp: ['brassHits', 'chug'], bass: 'gallop', drums: 'tribal', level: 0.94, fill: 'toms' }),
  ]),
  // 25 双剣
  song(25, 154, [
    section(
      'duel',
      ['Am', 'F', 'C', 'G'],
      [
        voice('guitarLead', 0.36, 'A5:1 C6:1 E6:1 C6:1', 'B5:1 A5:1 G5:2', 'F5:1 A5:1 C6:2', 'E6:2 B5:2'),
        voice('brassLead', 0.28, 'E5:1 A5:1 C6:1 A5:1', 'G5:2 E5:2', 'C5:1 F5:1 A5:2', 'B5:2 E5:2'),
      ],
      { comp: ['chug', 'stabs'] },
    ),
    section(
      'cross',
      ['Am', 'G', 'F', 'E'],
      [
        voice('guitarLead', 0.36, 'E6:1 D6:1 C6:2', 'B5:1 C6:1 D6:2', 'E6:1 G6:1 E6:2', 'A5:4'),
        voice('brassLead', 0.26, 'C6:2 A5:2', 'G5:1 E5:1 B4:2', 'C5:1 E5:1 G5:2', 'A4:4'),
      ],
      { drums: 'drive' },
    ),
    section('shout', ['Am', 'F', 'G', 'E'], [voice('brassLead', 0.4, 'C6:1 E6:1 G6:1 E6:1', 'D6:2 C6:1 B5:1', 'A5:1 G5:1 F5:2', 'E5:4')], { comp: ['brassHits', 'chug'], drums: 'double', level: 0.94, fill: 'toms' }),
  ], DRY),
  // 26 地下水脈
  song(26, 126, [
    section('drip', ['Dm', 'Bb', 'F', 'C'], [voice('harp', 0.34, 'D5:1 A4:1 F5:2', 'E5:1 C5:1 G4:2', 'A4:0.5 C5:0.5 D5:1 F5:1 A5:1', 'C#5:2 A4:2')], { comp: ['arp8', 'pad'], bass: 'sustain', drums: 'swamp', level: 0.76, crash: false }),
    section('flute', ['Dm', 'Bb', 'Gm', 'A'], [voice('flute', 0.34, 'A5:2 F5:1 D5:1', 'Bb5:1 A5:1 G5:2', 'F5:1 E5:1 D5:2', 'A4:4')], { comp: ['pad', 'arp8'], bass: 'sustain', drums: 'half', level: 0.8, crash: false }),
    section('rise', ['Dm', 'Bb', 'A', 'Dm'], [voice('flute', 0.38, 'D5:2 F5:1 A5:1', 'C6:2 Bb5:1 A5:1', 'G5:2 E5:2', 'D5:4')], { comp: ['arp8', 'strings'], bass: 'gallop', drums: 'rock', fill: 'snare' }),
  ], HALL),
  // 27 王冠
  song(27, 122, [
    section('crown', ['Bb', 'Eb', 'F', 'C'], [voice('brassLead', 0.4, 'F5:1 Bb5:1 D6:1 F6:1', 'Eb6:2 D6:1 C6:1', 'Bb5:1 C6:1 D6:2', 'C6:2 A5:2')], { comp: ['brassHits', 'strings'], bass: 'walk', drums: 'march' }),
    section('court', ['Bb', 'Gm', 'F', 'Bb'], [voice('brassLead', 0.36, 'D5:1 F5:1 Bb5:2', 'A5:2 G5:2', 'F5:1 G5:1 A5:2', 'Bb5:4')], { comp: ['strings'], bass: 'walk', drums: 'march', level: 0.82 }),
    section('shout', ['Bb', 'Eb', 'F', 'Bb'], [voice('brassLead', 0.42, 'Bb5:1 D6:1 F6:2', 'G6:1 F6:1 Eb6:2', 'D6:1 C6:1 Bb5:2', 'F5:4')], { comp: ['brassHits', 'stabs'], bass: 'gallop', drums: 'drive', level: 0.94, fill: 'snare' }),
  ]),
  // 28 影踏み
  song(28, 110, [
    section('step', ['Em', 'Am', 'D', 'Em'], [voice('squareLead', 0.2, 'E4:0.5 -:0.5 G4:0.5 -:0.5 B4:2', 'C5:1 -:1 A4:2', 'B4:0.5 C5:0.5 D5:1 E5:2', 'F#5:1 -:1 E4:2')], { comp: ['pad', 'arp16'], bass: 'walk', drums: 'half', level: 0.72, crash: false }),
    section('near', ['Em', 'C', 'D', 'B'], [voice('squareLead', 0.22, 'E5:1 B4:1 G4:2', 'A4:2 C5:2', 'D5:1 E5:1 F#5:2', 'G5:2 E5:2')], { comp: ['pad'], bass: 'walk', drums: 'light', level: 0.76, crash: false }),
    section('strike', ['Em', 'C', 'D', 'B'], [voice('squareLead', 0.28, 'E5:0.5 G5:0.5 B5:1 E6:2', 'D6:1 C6:1 B5:2', 'A5:1 G5:1 F#5:2', 'E5:4')], { comp: ['stabs', 'chug'], bass: 'gallop', drums: 'drive', level: 0.92, fill: 'snare' }),
  ]),
  // 29 終幕の手前
  song(29, 138, [
    section(
      'approach',
      ['Dm', 'Bb', 'F', 'A'],
      [
        voice('strings', 0.28, 'A4:1 D5:1 F5:1 A5:1', 'G5:2 F5:1 E5:1', 'D5:1 F5:1 Bb5:2', 'A5:2 E5:2'),
        voice('brassLead', 0.26, 'D5:2 A4:2', 'C5:2 Bb4:2', 'F4:1 G4:1 A4:2', 'E4:4'),
      ],
      { comp: ['strings', 'chug'], drums: 'rock' },
    ),
    section(
      'open',
      ['Gm', 'A', 'Bb', 'A'],
      [
        voice('strings', 0.28, 'D6:2 C6:1 Bb5:1', 'A5:2 G5:2', 'F5:1 A5:1 D6:2', 'C#6:2 A5:2'),
        voice('brassLead', 0.28, 'A5:1 F5:1 D5:2', 'E5:2 C5:2', 'D5:1 F5:1 A5:2', 'E5:4'),
      ],
      { comp: ['stabs', 'strings'], bass: 'drive8', drums: 'drive' },
    ),
    section('shout', ['Bb', 'C', 'F', 'A'], [voice('brassLead', 0.4, 'D5:1 F5:1 A5:1 D6:1', 'C6:1 Bb5:1 A5:2', 'G5:1 A5:1 Bb5:2', 'A5:2 D5:2')], { comp: ['stabs', 'chug'], bass: 'drive8', drums: 'drive', level: 0.94, fill: 'toms' }),
  ]),
  // 30 開門
  song(30, 166, [
    section('gate', ['F', 'Bb', 'C', 'Dm'], [voice('brassLead', 0.4, 'F5:0.5 A5:0.5 C6:1 F6:1 E6:1', 'D6:1 C6:1 A5:2', 'Bb5:0.5 C6:0.5 D6:1 F6:1 E6:1', 'C6:2 A5:2')], { comp: ['chug', 'brassHits'], drums: 'double' }),
    section('court', ['F', 'C', 'Bb', 'A'], [voice('brassLead', 0.38, 'A5:1 C6:1 F6:2', 'G6:1 F6:1 E6:2', 'D6:1 C6:1 Bb5:2', 'A5:4')], { drums: 'drive' }),
    section('shout', ['F', 'C', 'Bb', 'F'], [voice('brassLead', 0.42, 'F5:1 C6:1 F6:2', 'E6:1 D6:1 C6:2', 'Bb5:1 A5:1 G5:2', 'F5:4')], { comp: ['brassHits', 'stabs'], drums: 'double', level: 0.96, fill: 'toms' }),
  ], DRY),
];

for (const sample of BOSS_SAMPLE_SONGS) {
  for (const part of sample.sections.flatMap((item) => item.parts)) {
    const section = sample.sections.find((item) => item.parts.includes(part));
    const barsText = part.notes.split('|');
    if (barsText.length !== section.chords.length) {
      throw new Error(`${sample.file} ${section.name} ${part.inst}: ${barsText.length} 小節`);
    }
    barsText.forEach((text, index) => {
      const beats = parsePhrase(text).reduce((sum, [, n]) => sum + n, 0);
      if (Math.abs(beats - 4) > 1e-6) {
        throw new Error(`${sample.file} ${section.name} ${part.inst} の ${index + 1} 小節: ${beats} 拍 「${text.trim()}」`);
      }
    });
  }
}
