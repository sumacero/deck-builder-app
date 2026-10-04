import type { EconomyConfig } from '../domain/shop';

/** スレスパ 1 章の相場に近い値。 */
export const STANDARD_ECONOMY: EconomyConfig = {
  startingGold: 99,
  encounterGold: {
    normal: { min: 10, max: 20 },
    elite: { min: 25, max: 35 },
    boss: { min: 95, max: 105 },
  },
  relicFallbackGold: 50,
  cardPrice: { attack: 50, skill: 50, power: 75, status: 0 },
  relicPrice: { common: 120, uncommon: 170, rare: 240 },
  relicTierWeight: { common: 60, uncommon: 30, rare: 10 },
  potionPrice: 50,
  priceVariance: 0.1,
  removalBasePrice: 75,
  removalPriceStep: 25,
  shopCardCount: 5,
  shopRelicCount: 2,
  shopPotionCount: 2,
  treasureGold: { min: 25, max: 45 },
};
