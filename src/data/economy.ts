import type { EconomyConfig } from '../domain/shop';

/** スレスパ 1 章の相場に近い値。 */
export const STANDARD_ECONOMY: EconomyConfig = {
  startingGold: 99,
  encounterGold: {
    normal: { min: 10, max: 20 },
    elite: { min: 25, max: 35 },
    boss: { min: 95, max: 105 },
    // ラスボスを倒すとそのままクリアなので、ゴールドは使い道が無い。
    final: { min: 0, max: 0 },
  },
  relicFallbackGold: 50,
  cardPrice: { common: 50, uncommon: 75, rare: 110 },
  cardTierWeight: { common: 60, uncommon: 30, rare: 10 },
  relicPrice: { common: 120, uncommon: 170, rare: 240 },
  relicTierWeight: { common: 60, uncommon: 30, rare: 10 },
  potionPrice: 50,
  priceVariance: 0.1,
  removalBasePrice: 75,
  removalPriceStep: 25,
  remarkPrice: 80,
  shopCardCount: 5,
  shopRelicCount: 2,
  shopPotionCount: 2,
  treasureGold: { min: 25, max: 45 },
};
