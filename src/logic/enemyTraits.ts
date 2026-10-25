import type { EnemyMove, EnemyTrait } from '../domain/enemy';

export type TraitOf<K extends EnemyTrait['kind']> = Extract<EnemyTrait, { kind: K }>;

export function traitOf<K extends EnemyTrait['kind']>(
  enemy: { traits?: readonly EnemyTrait[] },
  kind: K,
): TraitOf<K> | undefined {
  return enemy.traits?.find((trait): trait is TraitOf<K> => trait.kind === kind);
}

/** 眠っている間の行動。行動パターンの順番は進めない。 */
export const SLEEP_MOVE: EnemyMove = {
  id: 'sleep',
  name: '眠っている',
  actions: [{ kind: 'idle', reason: 'sleep' }],
};

/**
 * 2 体目のエリート・ボスが、最初の 1 ターンだけ出す。ダメージは無い。
 * 得たブロックは、次の自分のターンの開始時に消える。
 */
export const WINDUP_MOVE: EnemyMove = {
  id: 'windup',
  name: '見極める',
  actions: [{ kind: 'block', amount: 6 }],
};
