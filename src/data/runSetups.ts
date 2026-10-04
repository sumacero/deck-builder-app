import type { RunSetup } from '../domain/run';
import { STANDARD_ACTS } from './acts';
import { WANDERING_SWORDSMAN } from './agents';
import { LANTERN_SPIRIT, STANDARD_BLESSINGS } from './blessings';
import { PLAIN_STARTER_DECK, REWARD_CARDS } from './cards';
import { STANDARD_ECONOMY } from './economy';
import { ALL_POTIONS, FIRE_POTION, IRON_POTION, SWIFT_POTION } from './potions';
import {
  EMBER_LANTERN,
  FIGHTING_SPIRIT,
  RELIC_POOL,
  RUSTY_ANCHOR,
  STEADFAST_STONE,
} from './relics';

/** レリックとポーションはすでに持っている前提で始める。 */
export const STANDARD_RUN: RunSetup = {
  agent: WANDERING_SWORDSMAN,
  deck: PLAIN_STARTER_DECK,
  playerMaxHp: 70,
  energyPerTurn: 3,
  drawPerTurn: 5,
  relics: [RUSTY_ANCHOR, EMBER_LANTERN, STEADFAST_STONE, FIGHTING_SPIRIT],
  potions: [FIRE_POTION, IRON_POTION, SWIFT_POTION],
  acts: STANDARD_ACTS,
  rewardPool: REWARD_CARDS,
  potionPool: ALL_POTIONS,
  relicPool: RELIC_POOL,
  blessingPool: STANDARD_BLESSINGS,
  guide: LANTERN_SPIRIT,
  economy: STANDARD_ECONOMY,
  restHealRatio: 0.3,
};
