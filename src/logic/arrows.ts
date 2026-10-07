import type { CardDefinition } from '../domain/card';
import type { Powers } from '../domain/status';

export const ARROW_ID = 'arrow';
export const ARROW_BASE_DAMAGE = 4;

/**
 * 今のパワーに合わせた「矢」のカード。鋭き鏃でダメージが増え、散り矢の構えで敵全体に当たる。
 * パワーが変わったら、手札・山札・捨て札の矢もこれで作り直す（説明文と狙い方が実際の効果と一致するように）。
 */
export function forgeArrow(powers: Powers): CardDefinition {
  const spread = (powers.arrowSpread ?? 0) > 0;
  return {
    id: ARROW_ID,
    name: '矢',
    type: 'attack',
    arrow: true,
    attribute: 'grass',
    cost: 0,
    target: spread ? 'allEnemies' : 'enemy',
    effects: [{ kind: 'damage', amount: ARROW_BASE_DAMAGE + (powers.arrowEdge ?? 0) }],
    exhaust: true,
    motion: 'strike',
  };
}

/** 矢の 1 本分のダメージ（筋力などをかける前）。 */
export const arrowDamage = (powers: Powers) => ARROW_BASE_DAMAGE + (powers.arrowEdge ?? 0);
