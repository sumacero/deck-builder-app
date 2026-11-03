import { ALL_AGENTS } from '../data/agents';
import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';

/** 図鑑のカード一覧の区分。属性の無い札は共通。 */
export type CardCatalogGroup = 'shared' | Attribute;

/**
 * 図鑑でどの欄に出すか。
 * 火・草・水は、その属性のキャラの欄。秘奥義は属性が無くても、持ち主のキャラの欄。
 * それ以外（無属性の報酬、ストライク、お邪魔カード）は共通。
 */
export function cardCatalogGroup(card: CardDefinition): CardCatalogGroup {
  if (card.attribute) return card.attribute;
  if (card.mysticArte) {
    const owner = ALL_AGENTS.find((agent) => agent.mysticArte.id === card.id);
    if (owner) return owner.attribute;
  }
  return 'shared';
}
