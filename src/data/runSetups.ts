import type { CardDefinition } from '../domain/card';
import type { RunSetup } from '../domain/run';
import { FINAL_BOSS, STANDARD_ACT_CHOICES } from './acts';
import { CRIMSON_HERO, VERDANT_ARCHER } from './agents';
import { LANTERN_SPIRIT, STANDARD_BLESSINGS } from './blessings';
import { CRIMSON_STARTER_DECK, REWARD_CARDS } from './cards';
import { STANDARD_ECONOMY } from './economy';
import { STANDARD_EVENTS } from './events';
import { ALL_POTIONS, FIRE_POTION, IRON_POTION, SWIFT_POTION } from './potions';
import { BOSS_RELIC_POOL, FIGHTING_SPIRIT, RELIC_POOL, WORLD_TREE_SPROUT } from './relics';
import { VERDANT_CARDS, VERDANT_STARTER_DECK } from './verdantCards';

/**
 * 報酬に出るカードは「共通の無属性カード」+「そのキャラのカード」。キャラのカードの枚数はどのキャラも同じにする
 * （カイル: 戦士の無属性 + 火属性、リーネ: 草属性。2026-10-07 時点で各 38 種、共通 8 種）。
 * エージェントと違う属性のカードは報酬に出ず、ショップでだけ買える（`isDraftable`）ので、候補には入れておく。
 */
const ALL_REWARD_CARDS = [...REWARD_CARDS, ...VERDANT_CARDS];

/**
 * どのキャラにも似合う無属性カード（連撃・薙ぎ払い・雷鳴・見切り・足払い・つけ込む・急所蹴り・弱点看破）。
 * これ以外の無属性カードは剣・盾・雄叫び・血を払う戦士のカードで、カイルにだけ出る。
 */
const SHARED_NEUTRAL_CARD_IDS: ReadonlySet<string> = new Set([
  'twin-strike',
  'cleave',
  'thunderclap',
  'seeing-red',
  'trip',
  'exploit',
  'dropkick',
  'weak-point',
]);

const isBlockAxis = (card: CardDefinition) => card.archetypes?.includes('block') ?? false;

/**
 * リーネの候補: 属性カード（草は報酬、火・水はショップ限定）と、共通の無属性カードだけ。
 * リーネは守りで勝つキャラにしないので、ブロック軸のカードは報酬にもショップにも出さない。
 */
const HUNTER_REWARD_CARDS = [
  ...REWARD_CARDS.filter((card) => card.attribute !== undefined || SHARED_NEUTRAL_CARD_IDS.has(card.id)),
  ...VERDANT_CARDS,
].filter((card) => !isBlockAxis(card));

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
  finalBoss: FINAL_BOSS,
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
  rewardPool: HUNTER_REWARD_CARDS,
};

/** タイトルで選べるエージェント。並び順がそのまま選択画面の並び順。 */
export const AGENT_RUNS: readonly RunSetup[] = [STANDARD_RUN, VERDANT_RUN];
