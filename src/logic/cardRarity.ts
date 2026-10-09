import type { CardDefinition, CardRarity } from '../domain/card';
import { nextRandom, pickOne, shuffle } from './random';

export const CARD_RARITIES: readonly CardRarity[] = ['common', 'uncommon', 'rare'];

/**
 * レア度の重みに従って 1 枚選ぶ。まずレア度を抽選し、そのレア度の中から等確率で選ぶ。
 * 候補が尽きたレア度は抽選から外す（残りのレア度で重みを配り直す）。
 * レリックの pickWeightedRelic と同じ決まり。
 */
export function pickWeightedCard(
  pool: readonly CardDefinition[],
  weights: Record<CardRarity, number>,
  seed: number,
): { item: CardDefinition | undefined; seed: number } {
  const available = CARD_RARITIES.filter(
    (tier) => weights[tier] > 0 && pool.some((card) => card.rarity === tier),
  );
  const total = available.reduce((sum, tier) => sum + weights[tier], 0);
  if (total === 0) return { item: undefined, seed };
  const roll = nextRandom(seed);
  let threshold = roll.value * total;
  const tier =
    available.find((candidate) => {
      threshold -= weights[candidate];
      return threshold < 0;
    }) ?? available[available.length - 1];
  return pickOne(
    pool.filter((card) => card.rarity === tier),
    roll.seed,
  );
}

/** 重みに従って重複なしで count 枚選ぶ。 */
export function pickWeightedCards(
  pool: readonly CardDefinition[],
  count: number,
  weights: Record<CardRarity, number>,
  seed: number,
): { items: CardDefinition[]; seed: number } {
  const items: CardDefinition[] = [];
  let currentSeed = seed;
  let remaining = pool;
  for (let i = 0; i < count; i++) {
    const picked = pickWeightedCard(remaining, weights, currentSeed);
    currentSeed = picked.seed;
    const item = picked.item;
    if (!item) break;
    items.push(item);
    remaining = remaining.filter((card) => card.id !== item.id);
  }
  return { items, seed: currentSeed };
}

/** 選んだ並びを混ぜる（軸枠がいつも左に来ないように）。 */
export function shuffleCards(
  cards: readonly CardDefinition[],
  seed: number,
): { items: CardDefinition[]; seed: number } {
  return shuffle(cards, seed);
}
