import type { RunSetup } from '../domain/run';
import { STANDARD_ACT_CHOICES } from './acts';
import { CRIMSON_HERO, VERDANT_ARCHER } from './agents';
import { LANTERN_SPIRIT, STANDARD_BLESSINGS } from './blessings';
import { CRIMSON_STARTER_DECK, REWARD_CARDS } from './cards';
import { STANDARD_ECONOMY } from './economy';
import { STANDARD_EVENTS } from './events';
import { ALL_POTIONS, FIRE_POTION, IRON_POTION, SWIFT_POTION } from './potions';
import { BOSS_RELIC_POOL, FIGHTING_SPIRIT, RELIC_POOL, WORLD_TREE_SPROUT } from './relics';
import { VERDANT_CARDS, VERDANT_STARTER_DECK } from './verdantCards';

/**
 * 全エージェント共通のカードの候補。エージェントと違う属性のカードは報酬に出ず、ショップでだけ買える
 * （`isDraftable`）ので、ほかのエージェントの属性カードもここに入れておく。
 */
const ALL_REWARD_CARDS = [...REWARD_CARDS, ...VERDANT_CARDS];

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
  rewardPool: ALL_REWARD_CARDS,
  potionPool: ALL_POTIONS,
  relicPool: RELIC_POOL,
  bossRelicPool: BOSS_RELIC_POOL,
  eventPool: STANDARD_EVENTS,
  blessingPool: STANDARD_BLESSINGS,
  guide: LANTERN_SPIRIT,
  economy: STANDARD_ECONOMY,
  restHealRatio: 0.3,
};

/** リーネは HP がやや低いぶん、宿り木の初期レリックで戦闘の立ち上がりから削れる。 */
export const VERDANT_RUN: RunSetup = {
  ...STANDARD_RUN,
  agent: VERDANT_ARCHER,
  deck: VERDANT_STARTER_DECK,
  playerMaxHp: 68,
  relics: [WORLD_TREE_SPROUT],
};

/** タイトルで選べるエージェント。並び順がそのまま選択画面の並び順。 */
export const AGENT_RUNS: readonly RunSetup[] = [STANDARD_RUN, VERDANT_RUN];
