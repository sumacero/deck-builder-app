import type { EnemyAction, EnemyDefinition, Encounter } from '../domain/enemy';

/** 章ごとの敵の強さ。敵のデータは第 1 章の強さで書き、後の章ではこの倍率で強くする。 */
export type ChapterScale = {
  /** 最大 HP・回復量の倍率。 */
  hp: number;
  /** 攻撃・ブロック・筋力の倍率。 */
  power: number;
};

/** 麻痺・凍え・封印・チャージは量を変えない（妨害の重さは章で変えない）。 */
function scaleAction(action: EnemyAction, scale: ChapterScale): EnemyAction {
  const power = (value: number) => Math.round(value * scale.power);
  switch (action.kind) {
    case 'attack':
      return { ...action, damage: power(action.damage) };
    case 'block':
      return { ...action, amount: power(action.amount) };
    case 'buff':
      return { ...action, strength: power(action.strength) };
    case 'heal':
      return { ...action, amount: Math.round(action.amount * scale.hp) };
    case 'paralyze':
    case 'chill':
    case 'seal':
    case 'charge':
      return action;
  }
}

export function scaleEnemy(enemy: EnemyDefinition, scale: ChapterScale): EnemyDefinition {
  return {
    ...enemy,
    maxHp: Math.round(enemy.maxHp * scale.hp),
    moves: enemy.moves.map((move) => ({
      ...move,
      actions: move.actions.map((action) => scaleAction(action, scale)),
    })),
  };
}

export function scaleEncounter(encounter: Encounter, scale: ChapterScale): Encounter {
  return { ...encounter, enemies: encounter.enemies.map((enemy) => scaleEnemy(enemy, scale)) };
}
