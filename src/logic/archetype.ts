import type { Archetype, CardDefinition, CardRarity } from '../domain/card';
import type { RunState } from '../domain/run';
import { isDraftable } from './attribute';
import { pickWeightedCards, shuffleCards } from './cardRarity';

/**
 * 戦闘報酬・カード選択イベントの候補（違う属性のカードはショップ限定なので除く）。
 * 印を絞っているランは、その印か、印の無いカードだけ。効果の中身は書き換えない。
 */
export const draftPool = (run: RunState): CardDefinition[] => {
  const cards = run.rewardPool.filter((card) => isDraftable(card, run.agent));
  if (!run.markBias) return cards;
  return cards.filter((card) => card.mark === undefined || card.mark === run.markBias);
};

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
  const archetype = mainArchetype(deck);
  const matching = archetype ? pool.filter((card) => card.archetypes?.includes(archetype)) : [];
  if (matching.length === 0) return pickWeightedCards(pool, count, weights, seed);
  const synergy = pickWeightedCards(matching, 1, weights, seed);
  const rest = pickWeightedCards(
    pool.filter((card) => !synergy.items.includes(card)),
    count - synergy.items.length,
    weights,
    synergy.seed,
  );
  return shuffleCards([...synergy.items, ...rest.items], rest.seed);
}
