import type { EnemyMove, EnemyTrait } from '../domain/enemy';

export type TraitOf<K extends EnemyTrait['kind']> = Extract<EnemyTrait, { kind: K }>;

export function traitOf<K extends EnemyTrait['kind']>(
  enemy: { traits?: readonly EnemyTrait[] },
  kind: K,
): TraitOf<K> | undefined {
  return enemy.traits?.find((trait): trait is TraitOf<K> => trait.kind === kind);
}

/** 眠っている間・ダウン中の行動。行動パターンの順番は進めない。 */
export const SLEEP_MOVE: EnemyMove = {
  id: 'sleep',
  name: '眠っている',
  actions: [{ kind: 'idle', reason: 'sleep' }],
};

export const DOWN_MOVE: EnemyMove = {
  id: 'down',
  name: 'ダウン中',
  actions: [{ kind: 'idle', reason: 'down' }],
};
