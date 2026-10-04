import type { RelicDefinition, RelicTier } from '../domain/relic';
import { nextRandom, pickOne } from './random';

export const RELIC_TIERS: readonly RelicTier[] = ['common', 'uncommon', 'rare'];

export const isRelicTier = (rarity: RelicDefinition['rarity']): rarity is RelicTier =>
  (RELIC_TIERS as readonly string[]).includes(rarity);

/**
 * レア度の重みに従って 1 つ選ぶ。まずレア度を抽選し、そのレア度の中から等確率で選ぶ。
 * 候補が尽きたレア度は抽選から外す（残りのレア度で重みを配り直す）。
 * 通常のレア度でないもの（ボス・初期）は候補にしない。
 */
export function pickWeightedRelic(
  pool: readonly RelicDefinition[],
  weights: Record<RelicTier, number>,
  seed: number,
): { item: RelicDefinition | undefined; seed: number } {
  const available = RELIC_TIERS.filter(
    (tier) => weights[tier] > 0 && pool.some((relic) => relic.rarity === tier),
  );
  const total = available.reduce((sum, tier) => sum + weights[tier], 0);
  if (total === 0) return { item: undefined, seed };
  const roll = nextRandom(seed);
  let threshold = roll.value * total;
  const tier = available.find((candidate) => {
    threshold -= weights[candidate];
    return threshold < 0;
  }) ?? available[available.length - 1];
  return pickOne(
    pool.filter((relic) => relic.rarity === tier),
    roll.seed,
  );
}

/** 重みに従って重複なしで count 個選ぶ（ショップの品揃えなど）。 */
export function pickWeightedRelics(
  pool: readonly RelicDefinition[],
  count: number,
  weights: Record<RelicTier, number>,
  seed: number,
): { items: RelicDefinition[]; seed: number } {
  const items: RelicDefinition[] = [];
  let currentSeed = seed;
  let remaining = pool;
  for (let i = 0; i < count; i++) {
    const picked = pickWeightedRelic(remaining, weights, currentSeed);
    currentSeed = picked.seed;
    const item = picked.item;
    if (!item) break;
    items.push(item);
    remaining = remaining.filter((relic) => relic.id !== item.id);
  }
  return { items, seed: currentSeed };
}

/** tier を指定したら、そのレア度だけの重みにする（候補が無ければほかのレア度から）。 */
export function weightsFor(
  base: Record<RelicTier, number>,
  pool: readonly RelicDefinition[],
  tier: RelicTier | undefined,
): Record<RelicTier, number> {
  if (!tier || !pool.some((relic) => relic.rarity === tier)) return base;
  return { common: 0, uncommon: 0, rare: 0, [tier]: 1 };
}
