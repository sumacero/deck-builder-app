import type { EnemyAction } from '../domain/enemy';

/** 潮 1 につき、攻撃 1 発の基礎ダメージがこれだけ減る（筋力を足す前）。 */
export const TIDE_ATTACK_CUT = 2;

/** 潮 1 につき、守り・強化・回復・妨害の数値がこれだけ減る。0 になった行動は流れる。 */
export const TIDE_EFFECT_CUT = 2;

/** 潮の影響を受けない行動。旗は切り替わる。溜めと眠りは潮を消費しない。 */
export function tideIgnores(kind: EnemyAction['kind']): boolean {
  return kind === 'idle' || kind === 'charge' || kind === 'shiftAttribute';
}

/** 数値を潮の分だけ削る。潮が無いときはそのまま。 */
export function tideSoftened(amount: number, tide: number): number {
  if (tide <= 0) return amount;
  return Math.max(0, amount - tide * TIDE_EFFECT_CUT);
}

/**
 * この行動は潮で消えて発動しない。
 * 攻撃は弱まるだけで残る。封印と霊体化は数値が無いので、潮が 1 つでも流れる。
 * 旗・溜め・眠りは残る。
 */
export function tideWashes(action: EnemyAction, tide: number): boolean {
  if (tide <= 0 || tideIgnores(action.kind) || action.kind === 'attack') return false;
  switch (action.kind) {
    case 'block':
    case 'heal':
    case 'paralyze':
    case 'chill':
      return tideSoftened(action.amount, tide) === 0;
    case 'buff':
      return tideSoftened(action.strength, tide) === 0;
    case 'debuff':
      return tideSoftened(action.turns, tide) === 0;
    case 'addCard':
      return tideSoftened(action.count, tide) === 0;
    case 'seal':
    case 'intangible':
      return true;
    default:
      return false;
  }
}

/** 攻撃・守りなど、潮が効く行動が 1 つでもあれば、その行動のあと潮は消える。 */
export function tideSpends(actions: readonly EnemyAction[]): boolean {
  return actions.some((action) => !tideIgnores(action.kind));
}
