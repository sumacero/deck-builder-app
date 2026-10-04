import type { CardDefinition } from '../domain/card';
import type { PotionDefinition } from '../domain/potion';
import type { RelicDefinition } from '../domain/relic';
import type { RunState } from '../domain/run';
import type { EconomyConfig, ShopOffer, ShopStock } from '../domain/shop';
import { removeFromDeck } from './cards';
import { nextRandom, pickUnique } from './random';
import { isRelicTier, pickWeightedRelics } from './relics';
import { obtainRelic } from './runEffects';

/** 基準価格を ±variance の範囲でばらつかせる。 */
function jitterPrice(base: number, variance: number, seed: number): { price: number; seed: number } {
  const random = nextRandom(seed);
  const factor = 1 + (random.value * 2 - 1) * variance;
  return { price: Math.round(base * factor), seed: random.seed };
}

function toOffers<T>(
  items: readonly T[],
  prefix: string,
  basePrice: (item: T) => number,
  variance: number,
  seed: number,
): { offers: ShopOffer<T>[]; seed: number } {
  let currentSeed = seed;
  const offers = items.map((item, index) => {
    const priced = jitterPrice(basePrice(item), variance, currentSeed);
    currentSeed = priced.seed;
    return { offerId: `${prefix}-${index}`, item, price: priced.price, sold: false };
  });
  return { offers, seed: currentSeed };
}

export function removalPrice(economy: EconomyConfig, removalCount: number): number {
  return economy.removalBasePrice + economy.removalPriceStep * removalCount;
}

/**
 * relicPool にはまだ持っていないレリックだけを渡す。
 * exclusivePool（エージェントと違う属性のカード）からは 1 枚を必ず並べる。ここでしか手に入らないため。
 */
export function generateShopStock(
  cardPool: readonly CardDefinition[],
  exclusivePool: readonly CardDefinition[],
  relicPool: readonly RelicDefinition[],
  potionPool: readonly PotionDefinition[],
  economy: EconomyConfig,
  removalCount: number,
  seed: number,
): { stock: ShopStock; seed: number } {
  const exclusive = pickUnique(exclusivePool, 1, seed);
  const regular = pickUnique(cardPool, economy.shopCardCount - exclusive.items.length, exclusive.seed);
  const cards = toOffers(
    [...regular.items, ...exclusive.items],
    'card',
    (card) => economy.cardPrice[card.type],
    economy.priceVariance,
    regular.seed,
  );
  const pickedRelics = pickWeightedRelics(relicPool, economy.shopRelicCount, economy.relicTierWeight, cards.seed);
  const relics = toOffers(
    pickedRelics.items,
    'relic',
    (relic) => (isRelicTier(relic.rarity) ? economy.relicPrice[relic.rarity] : economy.relicPrice.rare),
    economy.priceVariance,
    pickedRelics.seed,
  );
  const pickedPotions = pickUnique(potionPool, economy.shopPotionCount, relics.seed);
  const potions = toOffers(
    pickedPotions.items,
    'potion',
    () => economy.potionPrice,
    economy.priceVariance,
    pickedPotions.seed,
  );
  return {
    stock: {
      cards: cards.offers,
      relics: relics.offers,
      potions: potions.offers,
      removal: { price: removalPrice(economy, removalCount), used: false },
    },
    seed: potions.seed,
  };
}

export function hasEmptyPotionSlot(run: RunState): boolean {
  return run.potions.includes(null);
}

export const canAfford = (run: RunState, price: number) => run.gold >= price;

const markSold = <T>(offers: ShopOffer<T>[], offerId: string): ShopOffer<T>[] =>
  offers.map((offer) => (offer.offerId === offerId ? { ...offer, sold: true } : offer));

export function buyCard(run: RunState, offerId: string): RunState {
  if (run.phase.kind !== 'shop') return run;
  const stock = run.phase.stock;
  const offer = stock.cards.find((o) => o.offerId === offerId);
  if (!offer || offer.sold || !canAfford(run, offer.price)) return run;
  return {
    ...run,
    gold: run.gold - offer.price,
    deck: [...run.deck, offer.item],
    phase: { kind: 'shop', stock: { ...stock, cards: markSold(stock.cards, offerId) } },
  };
}

/** 買ったレリックは入手時の効果（毎ターンのエナジーなど）もすぐにかかる。 */
export function buyRelic(run: RunState, offerId: string): RunState {
  if (run.phase.kind !== 'shop') return run;
  const stock = run.phase.stock;
  const offer = stock.relics.find((o) => o.offerId === offerId);
  if (!offer || offer.sold || !canAfford(run, offer.price)) return run;
  if (run.relics.some((relic) => relic.id === offer.item.id)) return run;
  return {
    ...obtainRelic({ ...run, gold: run.gold - offer.price }, offer.item),
    phase: { kind: 'shop', stock: { ...stock, relics: markSold(stock.relics, offerId) } },
  };
}

/** ポーションは空きスロットがあるときだけ買える。左の空きから埋める。 */
export function buyPotion(run: RunState, offerId: string): RunState {
  if (run.phase.kind !== 'shop') return run;
  const stock = run.phase.stock;
  const offer = stock.potions.find((o) => o.offerId === offerId);
  const slot = run.potions.indexOf(null);
  if (!offer || offer.sold || slot < 0 || !canAfford(run, offer.price)) return run;
  return {
    ...run,
    gold: run.gold - offer.price,
    potions: run.potions.map((potion, i) => (i === slot ? offer.item : potion)),
    phase: { kind: 'shop', stock: { ...stock, potions: markSold(stock.potions, offerId) } },
  };
}

export function removeCard(run: RunState, cardId: string): RunState {
  if (run.phase.kind !== 'shop') return run;
  const stock = run.phase.stock;
  const { price, used } = stock.removal;
  if (used || !canAfford(run, price) || !run.deck.some((card) => card.id === cardId)) return run;
  return {
    ...run,
    gold: run.gold - price,
    deck: removeFromDeck(run.deck, cardId),
    removalCount: run.removalCount + 1,
    phase: { kind: 'shop', stock: { ...stock, removal: { price, used: true } } },
  };
}

export function leaveShop(run: RunState): RunState {
  if (run.phase.kind !== 'shop') return run;
  return { ...run, phase: { kind: 'map' } };
}
