import type { EnemyDefinition, Encounter } from '../domain/enemy';
import { soloEncounter } from '../logic/encounter';
import {
  BONE_ARCHER,
  CASTLE_BAT,
  CAVE_BAT,
  CAVE_HOUND,
  CAVE_SLIME,
  CURSED_CANDLE,
  FANG_RAT,
  HEX_MAGE,
  IRON_EXECUTIONER,
  ROTTING_SOLDIER,
  RUSTED_KNIGHT,
  SKY_EAGLE,
  SMALL_SLIME,
  STAR_EATER,
  STAR_WISP,
  STARDUST_SOLDIER,
  STONE_GUARDIAN,
  TIME_KEEPER,
  VOID_EYE,
  VOID_MOTE,
  WILL_O_WARDEN,
} from './enemies';

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
  group('bat-swarm', [CAVE_BAT, CAVE_BAT, CAVE_BAT]),
  group('rat-and-slime', [FANG_RAT, SMALL_SLIME]),
];

export const ACT1_ELITES: Encounter[] = [soloEncounter(CAVE_HOUND), soloEncounter(STONE_GUARDIAN)];

// ---- 第 2 章 ----

export const ACT2_ENCOUNTERS: Encounter[] = [
  soloEncounter(RUSTED_KNIGHT),
  soloEncounter(HEX_MAGE),
  soloEncounter(CASTLE_BAT),
  group('archer-pair', [BONE_ARCHER, BONE_ARCHER]),
  group('candle-and-bat', [CURSED_CANDLE, CASTLE_BAT]),
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
  group('mote-cluster', [VOID_MOTE, VOID_MOTE, VOID_MOTE]),
];

export const ACT3_ELITES: Encounter[] = [soloEncounter(STAR_EATER), soloEncounter(TIME_KEEPER)];
