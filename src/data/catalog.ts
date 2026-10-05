import type { BlessingDefinition } from '../domain/blessing';
import type { CardDefinition } from '../domain/card';
import type { EventDefinition } from '../domain/event';
import type { PotionDefinition } from '../domain/potion';
import type { RelicDefinition } from '../domain/relic';
import { STANDARD_BLESSINGS } from './blessings';
import { CRIMSON_PHOENIX, DEFEND, REWARD_CARDS, STRIKE, ULTIMATE_DEFEND, ULTIMATE_STRIKE } from './cards';
import { STANDARD_EVENTS } from './events';
import { STATUS_CARDS } from './statusCards';
import { ALL_POTIONS } from './potions';
import { BOSS_RELIC_POOL, FIGHTING_SPIRIT, RELIC_POOL, WORLD_TREE_SPROUT } from './relics';
import { THOUSAND_YEAR_TREE, VERDANT_CARDS } from './verdantCards';

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
export const ALL_CARDS: CardDefinition[] = uniqueById([
  STRIKE,
  DEFEND,
  ...REWARD_CARDS,
  ...VERDANT_CARDS,
  ULTIMATE_STRIKE,
  ULTIMATE_DEFEND,
  CRIMSON_PHOENIX,
  THOUSAND_YEAR_TREE,
  ...STATUS_CARDS,
]);

export const ALL_RELICS: RelicDefinition[] = uniqueById([
  FIGHTING_SPIRIT,
  WORLD_TREE_SPROUT,
  ...RELIC_POOL,
  ...BOSS_RELIC_POOL,
]);

export const CATALOG_POTIONS: PotionDefinition[] = uniqueById(ALL_POTIONS);

export const ALL_EVENTS: EventDefinition[] = uniqueById(STANDARD_EVENTS);

export const ALL_BLESSINGS: BlessingDefinition[] = uniqueById(STANDARD_BLESSINGS);
