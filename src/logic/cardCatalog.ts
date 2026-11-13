import { ALL_AGENTS } from '../data/agents';
import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';
import { baseCardId } from './cards';

/** 図鑑のカード一覧の区分。属性の無い札は共通。 */
export type CardCatalogGroup = 'shared' | Attribute;

/** ストライクと防御は、絵の違いでキャラの欄に分ける。絵の指定が無ければカイル。 */
const STARTER_ART_GROUP: Record<string, Attribute> = {
  'strike-verdant': 'grass',
  'defend-verdant': 'grass',
  'strike-azure': 'water',
  'defend-azure': 'water',
};

/**
 * 図鑑でどの欄に出すか。
 * 火・草・水は、その属性のキャラの欄。秘奥義は属性が無くても、持ち主のキャラの欄。
 * ストライクと防御は、初期デッキの絵ごとにそのキャラの欄。
 * それ以外（無属性の報酬、お邪魔カード）は共通。
 */
export function cardCatalogGroup(card: CardDefinition): CardCatalogGroup {
  const base = baseCardId(card.id);
  if (base === 'strike' || base === 'defend') {
    return STARTER_ART_GROUP[card.art ?? ''] ?? 'fire';
  }
  if (card.attribute) return card.attribute;
  if (card.mysticArte) {
    const owner = ALL_AGENTS.find((agent) => agent.mysticArte.id === card.id);
    if (owner) return owner.attribute;
  }
  return 'shared';
}
