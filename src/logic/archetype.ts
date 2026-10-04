import type { Archetype, CardDefinition } from '../domain/card';
import { pickUnique } from './random';

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
 * 報酬の候補。デッキの軸が決まっていれば、そのうち 1 枚は軸に合うカードにする
 * （軸がそろう瞬間を早めに来させるため）。残りは全体から重複なく選ぶ。
 */
export function pickRewardChoices(
  pool: readonly CardDefinition[],
  deck: readonly CardDefinition[],
  count: number,
  seed: number,
): { items: CardDefinition[]; seed: number } {
  const archetype = mainArchetype(deck);
  const matching = archetype ? pool.filter((card) => card.archetypes?.includes(archetype)) : [];
  if (matching.length === 0) return pickUnique(pool, count, seed);
  const synergy = pickUnique(matching, 1, seed);
  const rest = pickUnique(
    pool.filter((card) => !synergy.items.includes(card)),
    count - synergy.items.length,
    synergy.seed,
  );
  const merged = pickUnique([...synergy.items, ...rest.items], count, rest.seed);
  return merged;
}
