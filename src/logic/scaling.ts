import type { EnemyAction, EnemyDefinition, EnemyMove, EnemyTrait, Encounter } from '../domain/enemy';

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
    case 'debuff':
    case 'addCard':
    case 'intangible':
    case 'shiftAttribute':
    case 'idle':
      return action;
  }
}

const scaleMoves = (moves: readonly EnemyMove[], scale: ChapterScale): EnemyMove[] =>
  moves.map((move) => ({ ...move, actions: move.actions.map((action) => scaleAction(action, scale)) }));

/** 筋力が上がる性質は攻撃と同じ倍率。回数・ターン数は変えない。 */
function scaleTrait(trait: EnemyTrait, scale: ChapterScale): EnemyTrait {
  const power = (value: number) => Math.round(value * scale.power);
  switch (trait.kind) {
    case 'vengeance':
      return { ...trait, strength: power(trait.strength) };
    case 'sleep':
      return { ...trait, wakeStrength: power(trait.wakeStrength) };
    case 'deathThroes':
      return { ...trait, action: scaleAction(trait.action, scale) };
    case 'awaken':
      return {
        ...trait,
        strength: power(trait.strength),
        block: power(trait.block),
        moves: scaleMoves(trait.moves, scale),
      };
    case 'artifact':
    case 'hitCap':
    case 'guardian':
      return trait;
  }
}

export function scaleEnemy(enemy: EnemyDefinition, scale: ChapterScale): EnemyDefinition {
  return {
    ...enemy,
    traits: enemy.traits?.map((trait) => scaleTrait(trait, scale)),
    maxHp: Math.round(enemy.maxHp * scale.hp),
    moves: scaleMoves(enemy.moves, scale),
  };
}

export function scaleEncounter(encounter: Encounter, scale: ChapterScale): Encounter {
  return { ...encounter, enemies: encounter.enemies.map((enemy) => scaleEnemy(enemy, scale)) };
}
