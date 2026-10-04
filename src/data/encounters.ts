import type { EnemyDefinition, Encounter } from '../domain/enemy';
import { soloEncounter } from '../logic/encounter';
import {
  BONE_ARCHER,
  CASTLE_BAT,
  CAVE_BAT,
  CAVE_HOUND,
  CAVE_SLIME,
  CAVE_SPIDER,
  COMET_HOUND,
  CURSED_CANDLE,
  FANG_RAT,
  GARGOYLE_PUP,
  GOBLIN_SCOUT,
  HEX_MAGE,
  IRON_EXECUTIONER,
  MOSS_SPROUT,
  NEBULA_JELLY,
  ROTTING_SOLDIER,
  RUST_MITE,
  RUSTED_KNIGHT,
  SHIELD_BEARER,
  SKY_EAGLE,
  SMALL_SLIME,
  STAR_EATER,
  STAR_FRAGMENT,
  STAR_WISP,
  STARDUST_SOLDIER,
  STONE_GUARDIAN,
  TIME_KEEPER,
  VOID_EYE,
  VOID_MOTE,
  WILL_O_WARDEN,
} from './enemies';

/** 戦闘画面は 4 体まで並べても収まるように作っているので、それより多くは出さない。 */
const group = (id: string, enemies: EnemyDefinition[]): Encounter => ({
  id,
  rank: 'normal',
  enemies,
});

// ---- 第 1 章 ----

export const ACT1_ENCOUNTERS: Encounter[] = [
  soloEncounter(CAVE_SLIME),
  soloEncounter(FANG_RAT),
  soloEncounter(ROTTING_SOLDIER),
  group('slime-pair', [SMALL_SLIME, SMALL_SLIME]),
  group('rat-and-slime', [FANG_RAT, SMALL_SLIME]),
  group('goblin-pair', [GOBLIN_SCOUT, GOBLIN_SCOUT]),
  group('bat-swarm', [CAVE_BAT, CAVE_BAT, CAVE_BAT]),
  group('spider-nest', [CAVE_SPIDER, CAVE_BAT, CAVE_SPIDER]),
  group('goblin-pack', [CAVE_SPIDER, GOBLIN_SCOUT, MOSS_SPROUT]),
  group('sprout-patch', [MOSS_SPROUT, MOSS_SPROUT, MOSS_SPROUT, MOSS_SPROUT]),
  group('slime-family', [SMALL_SLIME, MOSS_SPROUT, SMALL_SLIME, MOSS_SPROUT]),
];

export const ACT1_ELITES: Encounter[] = [soloEncounter(CAVE_HOUND), soloEncounter(STONE_GUARDIAN)];

// ---- 第 2 章 ----

export const ACT2_ENCOUNTERS: Encounter[] = [
  soloEncounter(RUSTED_KNIGHT),
  soloEncounter(HEX_MAGE),
  soloEncounter(CASTLE_BAT),
  group('archer-pair', [BONE_ARCHER, BONE_ARCHER]),
  group('candle-and-bat', [CURSED_CANDLE, CASTLE_BAT]),
  group('gargoyle-perch', [GARGOYLE_PUP, CURSED_CANDLE, GARGOYLE_PUP]),
  group('shield-wall', [BONE_ARCHER, SHIELD_BEARER, BONE_ARCHER]),
  group('mite-swarm', [RUST_MITE, RUST_MITE, RUST_MITE, RUST_MITE]),
  group('candle-procession', [CURSED_CANDLE, RUST_MITE, CURSED_CANDLE, RUST_MITE]),
];

export const ACT2_ELITES: Encounter[] = [
  soloEncounter(IRON_EXECUTIONER),
  soloEncounter(WILL_O_WARDEN),
];

// ---- 第 3 章 ----

export const ACT3_ENCOUNTERS: Encounter[] = [
  soloEncounter(STARDUST_SOLDIER),
  soloEncounter(VOID_EYE),
  soloEncounter(SKY_EAGLE),
  group('wisp-pair', [STAR_WISP, STAR_WISP]),
  group('comet-pack', [COMET_HOUND, COMET_HOUND]),
  group('mote-cluster', [VOID_MOTE, VOID_MOTE, VOID_MOTE]),
  group('jelly-bloom', [NEBULA_JELLY, STAR_WISP, NEBULA_JELLY]),
  group('fragment-shower', [STAR_FRAGMENT, STAR_FRAGMENT, STAR_FRAGMENT, STAR_FRAGMENT]),
  group('void-court', [VOID_MOTE, NEBULA_JELLY, STAR_FRAGMENT, VOID_MOTE]),
];

export const ACT3_ELITES: Encounter[] = [soloEncounter(STAR_EATER), soloEncounter(TIME_KEEPER)];
