import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';
import type { EnemyDefinition } from '../domain/enemy';

export const ALL_ATTRIBUTES: readonly Attribute[] = ['slash', 'blunt', 'fire', 'ice', 'thunder'];

/** カードの攻撃の属性。アタックで指定が無ければ斬。アタック以外は属性なし。 */
export function cardAttributes(card: CardDefinition): Attribute[] {
  if (card.attributes) return card.attributes;
  return card.type === 'attack' ? ['slash'] : [];
}

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
