import type { BlessingDefinition } from '../domain/blessing';
import type { CardDefinition } from '../domain/card';
import type { EventDefinition } from '../domain/event';
import type { PotionDefinition } from '../domain/potion';
import type { RelicDefinition } from '../domain/relic';
import { forgeArrow } from '../logic/arrows';
import { ALL_AGENTS } from './agents';
import { STANDARD_BLESSINGS } from './blessings';
import {
  CRIMSON_PHOENIX,
  CRIMSON_STARTER_DECK,
  DEFEND,
  REWARD_CARDS,
  STRIKE,
  ULTIMATE_DEFEND,
  ULTIMATE_STRIKE,
} from './cards';
import { STANDARD_EVENTS } from './events';
import { MIRROR_CARDS, MIRROR_STARTER_DECK, MIRROR_TRIAD } from './mirrorCards';
import { STATUS_CARDS } from './statusCards';
import { ALL_POTIONS } from './potions';
import {
  BOSS_RELIC_POOL,
  CRYSTAL_WEIGHT,
  FIGHTING_SPIRIT,
  QUIET_TIDE,
  RELIC_POOL,
  WORLD_TREE_SPROUT,
} from './relics';
import { THOUSAND_YEAR_TREE, VERDANT_CARDS, VERDANT_STARTER_DECK } from './verdantCards';

/** 同じ id が複数の一覧に入っていても 1 つにまとめる（最初に出たものを残す）。 */
function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * 図鑑に並べるカード。報酬プール・初期デッキ・秘奥義・究極・お邪魔・戦闘中の矢をすべて含める。
 * 新しいカードを足したら、元の一覧（`REWARD_CARDS` / `VERDANT_CARDS` / `MIRROR_CARDS` など）に入れれば図鑑にも出る。
 */
export const ALL_CARDS: CardDefinition[] = uniqueById([
  STRIKE,
  DEFEND,
  ...CRIMSON_STARTER_DECK,
  ...VERDANT_STARTER_DECK,
  ...MIRROR_STARTER_DECK,
  ...REWARD_CARDS,
  ...VERDANT_CARDS,
  ...MIRROR_CARDS,
  ULTIMATE_STRIKE,
  ULTIMATE_DEFEND,
  CRIMSON_PHOENIX,
  THOUSAND_YEAR_TREE,
  MIRROR_TRIAD,
  ...ALL_AGENTS.map((agent) => agent.mysticArte),
  /** リーネの弓が戦闘中に作る「矢」（パワー無しの基本形）。 */
  forgeArrow({}),
  ...STATUS_CARDS,
]);

export const ALL_RELICS: RelicDefinition[] = uniqueById([
  FIGHTING_SPIRIT,
  WORLD_TREE_SPROUT,
  CRYSTAL_WEIGHT,
  QUIET_TIDE,
  ...RELIC_POOL,
  ...BOSS_RELIC_POOL,
]);

export const CATALOG_POTIONS: PotionDefinition[] = uniqueById(ALL_POTIONS);

export const ALL_EVENTS: EventDefinition[] = uniqueById(STANDARD_EVENTS);

export const ALL_BLESSINGS: BlessingDefinition[] = uniqueById(STANDARD_BLESSINGS);
