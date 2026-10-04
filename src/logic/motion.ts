import type { CardDefinition, CardMotion } from '../domain/card';

/** 1 発でこれ以上のダメージなら大技の動きにする。 */
const HEAVY_DAMAGE = 12;

/** カードの動きの種類。motion を指定していなければ効果から決める。 */
export function cardMotion(card: CardDefinition): CardMotion {
  if (card.motion) return card.motion;
  const damage = card.effects.find((effect) => effect.kind === 'damage');
  if (damage) {
    if ((damage.hits ?? 1) > 1) return 'flurry';
    return damage.amount >= HEAVY_DAMAGE ? 'heavy' : 'strike';
  }
  if (card.effects.some((effect) => effect.kind === 'damageFromBlock')) return 'heavy';
  if (card.effects.some((effect) => effect.kind === 'loseHp')) return 'sacrifice';
  const empowers = card.effects.some(
    (effect) => effect.kind === 'gainStrength' || effect.kind === 'gainBuff' || effect.kind === 'extendBuffs',
  );
  if (card.type === 'power' || empowers) {
    return 'empower';
  }
  if (card.effects.some((effect) => effect.kind === 'block' || effect.kind === 'doubleBlock')) {
    return 'guard';
  }
  return 'focus';
}
