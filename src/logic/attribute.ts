import type { AgentDefinition } from '../domain/agent';
import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';
import type { EnemyDefinition } from '../domain/enemy';

export const ALL_ATTRIBUTES: readonly Attribute[] = ['grass', 'fire', 'water'];

/** 三つ巴: キーの属性は、値の属性に強い。 */
export const STRONG_AGAINST: Record<Attribute, Attribute> = {
  grass: 'water',
  water: 'fire',
  fire: 'grass',
};

/** その属性の敵の弱点。無属性（undefined / null）ならすべての属性。 */
export function weaknessesOf(attribute: Attribute | null | undefined): Attribute[] {
  if (!attribute) return [...ALL_ATTRIBUTES];
  return ALL_ATTRIBUTES.filter((strong) => STRONG_AGAINST[strong] === attribute);
}

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

/** 群れで出る小型の敵（HP がこれ未満）はダウンゲージが短い。 */
const SMALL_ENEMY_HP = 20;

/** ダウンゲージの最大値。指定が無ければ格で決まる。 */
export function breakGaugeOf(enemy: EnemyDefinition): number {
  if (enemy.breakGauge !== undefined) return enemy.breakGauge;
  switch (enemy.rank) {
    case 'boss':
      return 8;
    case 'elite':
      return 6;
    case 'normal':
      return enemy.maxHp < SMALL_ENEMY_HP ? 2 : 3;
  }
}

export const isWeakTo = (weaknesses: readonly Attribute[], attributes: readonly Attribute[]) =>
  attributes.some((attribute) => weaknesses.includes(attribute));
