import type { RunSetup } from '../domain/run';
import { STANDARD_ACT_CHOICES } from './acts';
import { CRIMSON_HERO } from './agents';
import { LANTERN_SPIRIT, STANDARD_BLESSINGS } from './blessings';
import { CRIMSON_STARTER_DECK, REWARD_CARDS } from './cards';
import { STANDARD_ECONOMY } from './economy';
import { STANDARD_EVENTS } from './events';
import { ALL_POTIONS, FIRE_POTION, IRON_POTION, SWIFT_POTION } from './potions';
import { BOSS_RELIC_POOL, FIGHTING_SPIRIT, RELIC_POOL } from './relics';

/** レリックはカイルの初期レリック 1 つ、ポーションは 3 つ持って始める。 */
export const STANDARD_RUN: RunSetup = {
  agent: CRIMSON_HERO,
  deck: CRIMSON_STARTER_DECK,
  playerMaxHp: 70,
  energyPerTurn: 3,
  drawPerTurn: 5,
  relics: [FIGHTING_SPIRIT],
  potions: [FIRE_POTION, IRON_POTION, SWIFT_POTION],
  actChoices: STANDARD_ACT_CHOICES,
  rewardPool: REWARD_CARDS,
  potionPool: ALL_POTIONS,
  relicPool: RELIC_POOL,
  bossRelicPool: BOSS_RELIC_POOL,
  eventPool: STANDARD_EVENTS,
  blessingPool: STANDARD_BLESSINGS,
  guide: LANTERN_SPIRIT,
  economy: STANDARD_ECONOMY,
  restHealRatio: 0.3,
};
