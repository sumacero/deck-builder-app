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

/**
 * 報酬の候補。レア度の重みで選ぶ（強いカードほど出にくい）。
 * デッキの軸が決まっていれば、そのうち 1 枚は軸に合うカードにする
 * （その 1 枚も、軸の中でレア度の重みに従う）。並びは混ぜて、軸のカードがいつも左に来ないようにする。
 */
export function pickRewardChoices(
  pool: readonly CardDefinition[],
  deck: readonly CardDefinition[],
  count: number,
  seed: number,
  weights: Record<CardRarity, number>,
): { items: CardDefinition[]; seed: number } {
  const filler = pool.filter((card) => !card.archetypePayoff);
  const source = filler.length > 0 ? filler : pool;
  const archetype = mainArchetype(deck);
  const payoffs = archetype
    ? pool.filter((card) => card.archetypePayoff && card.archetypes?.includes(archetype))
    : [];
  const matching = archetype ? source.filter((card) => card.archetypes?.includes(archetype)) : [];
  const synergyPool = payoffs.length > 0 ? payoffs : matching;
  if (synergyPool.length === 0) return pickWeightedCards(source, count, weights, seed);
  const synergy = pickWeightedCards(synergyPool, 1, weights, seed);
  const rest = pickWeightedCards(
    source.filter((card) => !synergy.items.includes(card)),
    count - synergy.items.length,
    weights,
    synergy.seed,
  );
  return shuffleCards([...synergy.items, ...rest.items], rest.seed);
}
