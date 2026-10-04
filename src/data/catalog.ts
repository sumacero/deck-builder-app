import type { BlessingDefinition } from '../domain/blessing';
import type { CardDefinition } from '../domain/card';
import type { EventDefinition } from '../domain/event';
import type { PotionDefinition } from '../domain/potion';
import type { RelicDefinition } from '../domain/relic';
import { STANDARD_BLESSINGS } from './blessings';
import { DEFEND, REWARD_CARDS, STRIKE } from './cards';
import { STANDARD_EVENTS } from './events';
import { ALL_POTIONS } from './potions';
import {
  BOSS_RELIC_POOL,
  EMBER_LANTERN,
  FIGHTING_SPIRIT,
  RELIC_POOL,
  RUSTY_ANCHOR,
  STEADFAST_STONE,
} from './relics';

/** 同じ id が複数の一覧に入っていても 1 つにまとめる（最初に出たものを残す）。 */
function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/** 図鑑に並べるもの。新しいカード・レリックなどを足したら、それぞれの一覧に入れれば図鑑にも出る。 */
export const ALL_CARDS: CardDefinition[] = uniqueById([STRIKE, DEFEND, ...REWARD_CARDS]);

export const ALL_RELICS: RelicDefinition[] = uniqueById([
  RUSTY_ANCHOR,
  EMBER_LANTERN,
  STEADFAST_STONE,
  FIGHTING_SPIRIT,
  ...RELIC_POOL,
  ...BOSS_RELIC_POOL,
]);

export const CATALOG_POTIONS: PotionDefinition[] = uniqueById(ALL_POTIONS);

export const ALL_EVENTS: EventDefinition[] = uniqueById(STANDARD_EVENTS);

export const ALL_BLESSINGS: BlessingDefinition[] = uniqueById(STANDARD_BLESSINGS);
