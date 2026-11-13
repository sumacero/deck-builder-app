import type { CardDefinition } from '../domain/card';
import type { RunSetup } from '../domain/run';
import { FINAL_BOSS, STANDARD_ACT_CHOICES } from './acts';
import { CRIMSON_HERO, MIRROR_SEER, VERDANT_ARCHER } from './agents';
import { LANTERN_SPIRIT, STANDARD_BLESSINGS } from './blessings';
import { CRIMSON_STARTER_DECK, REWARD_CARDS } from './cards';
import { STANDARD_ECONOMY } from './economy';
import {
  BASIN_ORACLE,
  KYLE_TECHNIQUE_EVENTS,
  NOAH_TECHNIQUE_EVENTS,
  RINE_TECHNIQUE_EVENTS,
  STANDARD_EVENTS,
} from './events';
import { ALL_POTIONS } from './potions';
import { MIRROR_CARDS, MIRROR_STARTER_DECK } from './mirrorCards';
import {
  BOSS_RELIC_POOL,
  CRYSTAL_WEIGHT,
  FIGHTING_SPIRIT,
  RELIC_POOL,
  VERDANT_QUIVER,
} from './relics';
import { VERDANT_CARDS, VERDANT_STARTER_DECK } from './verdantCards';

/**
 * 報酬に出るカードは「共通の無属性カード」+「そのキャラの属性のカード」。
 * 無属性は 3 人とも同じ集合（2026-10-21。剣・盾は火属性。力みは共通。強打はカイル専用）。
 * 2026-11-12: 二連打・重圧・広打ち・雷鳴も火属性で、カイルの報酬とショップにだけ出る。
 * 2026-10-07 時点では各 38 種、共通 8 種。2026-10-08 にブロックを足した。
 * リーネのブロックは年輪の盾・葉の番え・鞭の牽制。数字だけの守りは置かない。
 * 2026-10-10 のノアは印のカード。波はブロック軸ではなく波の印なので、盾のフィルタには掛からない。
 * エージェントと違う属性のカードは、報酬にもショップにも出ない。候補には残しているが、抽選では除く。
 */
const ALL_REWARD_CARDS = [...REWARD_CARDS, ...VERDANT_CARDS, ...MIRROR_CARDS];

/**
 * どのキャラの戦闘報酬にも出る無属性。剣・盾はここへ入れず、火属性にする。
 * 力みはデバフと筋力の入口なので、3 人共通。二連打・重圧・広打ち・雷鳴・強打は火属性でカイルだけ。
 */
const SHARED_NEUTRAL_CARD_IDS: ReadonlySet<string> = new Set([
  'flurry-form',
  'seeing-red',
  'trip',
  'exploit',
  'dropkick',
  'weak-point',
  'clothesline',
  'flex',
  // シナジー軸（捨て・廃棄・手数）。誰でも報酬に出る。
  'toss-draw',
  'sweep-out',
  'scatter-blade',
  'offer-ember',
  'ashen-rite',
  'skill-follow',
  'momentum-form',
  'scavenge-form',
  'cinder-form',
  'combo-pulse',
  // 呪い・捨て・廃棄・ドローで伸びる札。誰でも報酬に出る。
  'curse-drop',
  'leaf-count',
  'ash-ledger',
  'shed-oath',
  'spring-vein',
  // 3 エナジーの共通大技
  'condemnation',
  'cataclysm',
  'ashen-tempest',
  'discard-judgment',
]);

const isBlockAxis = (card: CardDefinition) => card.archetypes?.includes('block') ?? false;

/**
 * リーネのブロック軸。盾のカードは出さず、絵のある狩人の守りだけ報酬とショップに出す。
 * 以前の茨の鎧・茨の垣根・命の芽吹き・大樹の加護・世界樹の種は、ここに無いので出さない。
 */
const HUNTER_BLOCK_CARD_IDS: ReadonlySet<string> = new Set([
  'ring-shield',
  'leaf-nock',
  'whip-check',
]);

/**
 * 草属性だが、リーネには出さないカード（カイルはショップで買える）。
 * - 宿り木を直接与えるカード: 宿り木は「ムチで打つたびに植える」（蔓の構え・宿り木の蔓）で増やす形にし、
 *   直接与えるカードは宿り木の矢・種子散布・森の侵蝕・茨鞭の種撒きの 4 種に絞った。
 * - 以前の弓のカード: 弓は「矢」（0 コストで廃棄されるアタックを作って放つ）の軸に作り替えた。
 */
const HUNTER_EXCLUDED_CARD_IDS: ReadonlySet<string> = new Set([
  'vine-bind',
  'spore-cloud',
  'deep-roots',
  'hunters-mark',
  'nocking-rhythm',
  'sunbeam',
  'vital-shot',
  'aimed-shot',
]);

/**
 * リーネの候補: 草属性と、共通の無属性カード。火・水は報酬にもショップにも出ない。
 * ブロック軸は、年輪の盾・葉の番え・鞭の牽制だけ出す。カイルの盾や以前の茨の守りは出さない。
 */
const HUNTER_REWARD_CARDS = [
  ...REWARD_CARDS.filter((card) => card.attribute !== undefined || SHARED_NEUTRAL_CARD_IDS.has(card.id)),
  ...VERDANT_CARDS,
  ...MIRROR_CARDS,
].filter(
  (card) =>
    (!isBlockAxis(card) || HUNTER_BLOCK_CARD_IDS.has(card.id)) && !HUNTER_EXCLUDED_CARD_IDS.has(card.id),
);

/** レリックはカイルの初期レリック 1 つ。ポーションの枠は 3 つあるが、中身は空で始める。 */
const EMPTY_POTION_SLOTS = [null, null, null];

export const STANDARD_RUN: RunSetup = {
  agent: CRIMSON_HERO,
  deck: CRIMSON_STARTER_DECK,
  playerMaxHp: 72,
  energyPerTurn: 3,
  drawPerTurn: 5,
  relics: [FIGHTING_SPIRIT],
  potions: EMPTY_POTION_SLOTS,
  actChoices: STANDARD_ACT_CHOICES,
  finalBoss: FINAL_BOSS,
  rewardPool: ALL_REWARD_CARDS,
  potionPool: ALL_POTIONS,
  relicPool: RELIC_POOL,
  bossRelicPool: BOSS_RELIC_POOL,
  eventPool: [...STANDARD_EVENTS, ...KYLE_TECHNIQUE_EVENTS],
  blessingPool: STANDARD_BLESSINGS,
  guide: LANTERN_SPIRIT,
  economy: STANDARD_ECONOMY,
  restHealRatio: 0.3,
};

/** リーネは HP を抑えてある。初期レリックで、毎ターン通常より 1 枚多く引く。 */
export const VERDANT_RUN: RunSetup = {
  ...STANDARD_RUN,
  agent: VERDANT_ARCHER,
  deck: VERDANT_STARTER_DECK,
  playerMaxHp: 62,
  relics: [VERDANT_QUIVER],
  rewardPool: HUNTER_REWARD_CARDS,
  eventPool: [...STANDARD_EVENTS, ...RINE_TECHNIQUE_EVENTS],
};

/**
 * ノアの候補。盾や蔦は出さない。波の印はブロック軸ではないので、ここには残る。
 * 火・草のカードはプールに残るが、抽選では除く。
 */
const MIRROR_REWARD_CARDS = [
  ...REWARD_CARDS.filter((card) => card.attribute !== undefined || SHARED_NEUTRAL_CARD_IDS.has(card.id)),
  ...VERDANT_CARDS,
  ...MIRROR_CARDS,
].filter((card) => !isBlockAxis(card) || (card.attribute !== undefined && card.attribute !== 'water'));

/** ノアの最大 HP はカイルと同じ 72。初期レリックは水晶の文鎮だけ。 */
export const MIRROR_RUN: RunSetup = {
  ...STANDARD_RUN,
  agent: MIRROR_SEER,
  deck: MIRROR_STARTER_DECK,
  playerMaxHp: 72,
  relics: [CRYSTAL_WEIGHT],
  rewardPool: MIRROR_REWARD_CARDS,
  eventPool: [...STANDARD_EVENTS, BASIN_ORACLE, ...NOAH_TECHNIQUE_EVENTS],
};

/** タイトルで選べるエージェント。並び順がそのまま選択画面の並び順。 */
export const AGENT_RUNS: readonly RunSetup[] = [STANDARD_RUN, VERDANT_RUN, MIRROR_RUN];
