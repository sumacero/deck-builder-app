import type { RelicDefinition } from '../domain/relic';
import type { RunState } from '../domain/run';
import { canUpgrade, upgradeCard } from './cards';
import { pickOne, shuffle } from './random';

/** まだ持っていないレリックを 1 つ与える。候補が尽きていたら代わりにゴールド。 */
export function grantRandomRelic(run: RunState): { run: RunState; relic: RelicDefinition | null } {
  const owned = new Set(run.relics.map((relic) => relic.id));
  const candidates = run.relicPool.filter((relic) => !owned.has(relic.id));
  const picked = pickOne(candidates, run.rngSeed);
  if (!picked.item) {
    return {
      run: { ...run, rngSeed: picked.seed, gold: run.gold + run.economy.relicFallbackGold },
      relic: null,
    };
  }
  return {
    run: { ...run, rngSeed: picked.seed, relics: [...run.relics, picked.item] },
    relic: picked.item,
  };
}

/** 強化できるカードからランダムに count 枚を強化する。 */
export function upgradeRandomCards(run: RunState, count: number): RunState {
  const indices = run.deck.flatMap((card, index) => (canUpgrade(card) ? [index] : []));
  const shuffled = shuffle(indices, run.rngSeed);
  const chosen = new Set(shuffled.items.slice(0, count));
  return {
    ...run,
    rngSeed: shuffled.seed,
    deck: run.deck.map((card, index) => (chosen.has(index) ? upgradeCard(card) : card)),
  };
}

/** 空いているポーション枠をランダムなポーションで埋める。 */
export function fillPotionSlots(run: RunState): RunState {
  let seed = run.rngSeed;
  const potions = run.potions.map((slot) => {
    if (slot) return slot;
    const picked = pickOne(run.potionPool, seed);
    seed = picked.seed;
    return picked.item ?? null;
  });
  return { ...run, rngSeed: seed, potions };
}
