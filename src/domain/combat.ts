import type { AgentDefinition } from './agent';
import type { CardDefinition, CardInstance, CardMotion, CardType } from './card';
import type { EnemyAction, EnemyDefinition, EnemyMove, EnemyRank } from './enemy';
import type { PotionDefinition } from './potion';
import type { RelicDefinition } from './relic';

export type Fighter = {
  hp: number;
  maxHp: number;
  block: number;
};

export type PlayerState = Fighter & {
  energy: number;
  maxEnergy: number;
  strength: number;
  tempStrength: number;
  endTurnBlock: number;
};

export type EnemyState = Fighter & {
  id: string;
  name: string;
  icon: string;
  rank: EnemyRank;
  strength: number;
  moves: EnemyMove[];
  moveIndex: number;
};

export type CombatStatus = 'playerTurn' | 'won' | 'lost';

export type CombatLogEntry = {
  id: number;
  turn: number;
  text: string;
};

export type CombatTarget = 'player' | 'enemy';

export type CombatEventBody =
  | { kind: 'cardPlayed'; target: CombatTarget; cardType: CardType; motion: CardMotion }
  /** 敵が行動した（攻撃は 1 発ごと）。target は行動した側（敵）。 */
  | { kind: 'enemyAct'; target: CombatTarget; action: EnemyAction['kind'] }
  | { kind: 'potionUsed'; target: CombatTarget; potionId: string }
  | { kind: 'relicTriggered'; target: CombatTarget; relicId: string }
  | { kind: 'hit'; target: CombatTarget; hpLoss: number; blocked: number }
  | { kind: 'blockGain'; target: CombatTarget; amount: number }
  | { kind: 'heal'; target: CombatTarget; amount: number }
  | { kind: 'defeated'; target: CombatTarget };

/** 直前の操作で起きた出来事。UI はこれを見て演出を再生する。 */
export type CombatEvent = CombatEventBody & { id: number };

/** ポーションスロット。空きは null。 */
export type PotionSlot = PotionDefinition | null;

export type CombatSetup = {
  agent: AgentDefinition;
  deck: CardDefinition[];
  enemy: EnemyDefinition;
  /** ラン途中の戦闘を想定し、最大 HP とは別に現在 HP を持つ。 */
  playerHp: number;
  playerMaxHp: number;
  energyPerTurn: number;
  drawPerTurn: number;
  relics: RelicDefinition[];
  potions: PotionSlot[];
};

export type CombatState = {
  status: CombatStatus;
  turn: number;
  player: PlayerState;
  enemy: EnemyState;
  drawPerTurn: number;
  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  relics: RelicDefinition[];
  potions: PotionSlot[];
  /** シャッフル用の乱数シード。状態に持たせることで同じシードなら同じ展開を再現できる。 */
  rngSeed: number;
  log: CombatLogEntry[];
  /** 直前の操作 1 回分のイベント。操作のたびに作り直す。 */
  events: CombatEvent[];
  nextEventId: number;
};
