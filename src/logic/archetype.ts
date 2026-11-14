import type { Archetype, CardDefinition, CardRarity } from '../domain/card';
import type { RunState } from '../domain/run';
import { isDraftable } from './attribute';
import { pickWeightedCards, shuffleCards } from './cardRarity';

/** 今の章（1 始まり）。 */
export const actNumber = (run: RunState): number => run.actIndex + 1;

/** この章で出してよいカード。minAct より前の札はまだ出ていない。 */
export function cardsForAct(pool: readonly CardDefinition[], act: number): CardDefinition[] {
  return pool.filter((card) => (card.minAct ?? 1) <= act);
}

/**
 * ショップと、軸が決まっていないときの候補。
 * 違う属性のカードは出さない。軸の決め手（archetypePayoff）も除く。
 */
export const draftPool = (run: RunState): CardDefinition[] =>
  cardsForAct(run.rewardPool, actNumber(run)).filter(
    (card) => isDraftable(card, run.agent) && !card.archetypePayoff,
  );

/** 戦闘報酬・出来事の 3 択。軸の決め手も、その章になっていれば含む。 */
export const rewardCandidates = (run: RunState): CardDefinition[] =>
  cardsForAct(run.rewardPool, actNumber(run)).filter((card) => isDraftable(card, run.agent));

export type ArchetypeCount = { archetype: Archetype; count: number };

/** デッキに入っている軸ごとの枚数（多い順）。 */
export function deckArchetypes(deck: readonly CardDefinition[]): ArchetypeCount[] {
  const counts = new Map<Archetype, number>();
  for (const card of deck) {
    for (const archetype of card.archetypes ?? []) counts.set(archetype, (counts.get(archetype) ?? 0) + 1);
  }
  return [...counts]
    .map(([archetype, count]) => ({ archetype, count }))
    .sort((a, b) => b.count - a.count);
}

/** この枚数以上そろった軸を「デッキの軸」とみなす（初期デッキの強打 1 枚だけでは偏らせない）。 */
export const ARCHETYPE_THRESHOLD = 2;

/** デッキの軸。まだ決まっていなければ null。 */
export function mainArchetype(deck: readonly CardDefinition[]): Archetype | null {
  const [top] = deckArchetypes(deck);
  return top && top.count >= ARCHETYPE_THRESHOLD ? top.archetype : null;
}

/** 第3章の報酬は、軸の1枠を押し付けない。 */
export type RewardFocus = { act: number };

export function rewardFocus(run: RunState): RewardFocus {
  return { act: actNumber(run) };
}

/**
 * 報酬の候補。レア度の重みで選ぶ（強いカードほど出にくい）。
 * 3 枚揃えるときは、役割をずらす。1 枚はコスト 2 以上かパワー、1 枚はコスト 1 以下のアタック、1 枚はスキル。
 * 足りない役割は、残りの札から埋める。並びは混ぜて、決まった札がいつも左に来ないようにする。
 * 1 枚だけのときは、重みのまま選ぶ。
 */
export function pickRewardChoices(
  pool: readonly CardDefinition[],
  deck: readonly CardDefinition[],
  count: number,
  seed: number,
  weights: Record<CardRarity, number>,
  _focus?: RewardFocus,
): { items: CardDefinition[]; seed: number } {
  if (count < 3) return pickWeightedCards(pool, count, weights, seed);
  return pickRoleChoices(pool, deck, count, seed, weights);
}

function pickRoleChoices(
  pool: readonly CardDefinition[],
  deck: readonly CardDefinition[],
  count: number,
  seed: number,
  weights: Record<CardRarity, number>,
): { items: CardDefinition[]; seed: number } {
  const archetype = mainArchetype(deck);
  const prefer = (cards: readonly CardDefinition[]) => {
    if (!archetype) return cards;
    const themed = cards.filter((card) => card.archetypes?.includes(archetype));
    return themed.length > 0 ? themed : cards;
  };
  const buckets: ((card: CardDefinition) => boolean)[] = [
    (card) => card.type === 'power' || card.cost >= 2,
    (card) => card.type === 'attack' && card.cost <= 1,
    (card) => card.type === 'skill',
  ];
  const items: CardDefinition[] = [];
  let current = seed;
  let remaining = [...pool];
  for (const matches of buckets) {
    if (items.length >= count) break;
    const picked = pickWeightedCards(prefer(remaining.filter(matches)), 1, weights, current);
    current = picked.seed;
    const item = picked.items[0];
    if (!item) continue;
    items.push(item);
    remaining = remaining.filter((card) => card.id !== item.id);
  }
  if (items.length < count) {
    const rest = pickWeightedCards(remaining, count - items.length, weights, current);
    items.push(...rest.items);
    current = rest.seed;
  }
  return shuffleCards(items, current);
}
