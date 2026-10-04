import type { AgentDefinition } from '../domain/agent';
import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';

export const ALL_ATTRIBUTES: readonly Attribute[] = ['grass', 'fire', 'water'];

/** 三つ巴: キーの属性は、値の属性に強い。 */
export const STRONG_AGAINST: Record<Attribute, Attribute> = {
  grass: 'water',
  water: 'fire',
  fire: 'grass',
};

/** 相性で有利な攻撃のダメージ倍率（攻めでも受けでも同じ）。 */
export const ADVANTAGE_MULTIPLIER = 1.25;

/** その属性の相手の弱点（それに強い属性）。無属性なら弱点なし。 */
export function weaknessesOf(attribute: Attribute | null | undefined): Attribute[] {
  if (!attribute) return [];
  return ALL_ATTRIBUTES.filter((strong) => STRONG_AGAINST[strong] === attribute);
}

/** 攻撃の属性のどれかが、受ける側の属性に強いか。 */
export const hasAdvantage = (attacking: readonly Attribute[], defending: Attribute | null | undefined) =>
  defending != null && attacking.some((attribute) => STRONG_AGAINST[attribute] === defending);

/** 相性によるダメージ倍率。 */
export const affinityMultiplier = (attacking: readonly Attribute[], defending: Attribute | null | undefined) =>
  hasAdvantage(attacking, defending) ? ADVANTAGE_MULTIPLIER : 1;

/** カードの攻撃の属性。秘奥義は全属性。無属性なら空。 */
export function cardAttributes(card: CardDefinition): Attribute[] {
  if (card.mysticArte) return [...ALL_ATTRIBUTES];
  return card.attribute ? [card.attribute] : [];
}

/** 通常の報酬に出せるか（無属性か、エージェントと同じ属性）。違う属性はショップ限定。 */
export const isDraftable = (card: CardDefinition, agent: AgentDefinition) =>
  card.attribute === undefined || card.attribute === agent.attribute;

/** ストライクなど attuned のカードにエージェントの属性を付ける。 */
export const attuneDeck = (deck: readonly CardDefinition[], attribute: Attribute): CardDefinition[] =>
  deck.map((card) => (card.attuned ? { ...card, attribute } : card));
