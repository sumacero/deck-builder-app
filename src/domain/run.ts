import type { ActConfig } from './act';
import type { AgentDefinition } from './agent';
import type { BlessingDefinition, GuideCharacter } from './blessing';
import type { CardDefinition } from './card';
import type { PotionSlot } from './combat';
import type { EnemyDefinition } from './enemy';
import type { GameMap } from './map';
import type { PotionDefinition } from './potion';
import type { RelicDefinition } from './relic';
import type { EconomyConfig, ShopStock } from './shop';

/** 1 回の挑戦（ラン）を始めるための設定。 */
export type RunSetup = {
  agent: AgentDefinition;
  deck: CardDefinition[];
  playerMaxHp: number;
  energyPerTurn: number;
  drawPerTurn: number;
  relics: RelicDefinition[];
  potions: PotionSlot[];
  /** この順に進み、最後の章のボスを倒したらクリア。 */
  acts: ActConfig[];
  rewardPool: CardDefinition[];
  /** ショップ・恩恵で手に入るポーションの候補。 */
  potionPool: PotionDefinition[];
  /** エリート・ボス・恩恵で手に入るレリックの候補。持っているものは出ない。 */
  relicPool: RelicDefinition[];
  blessingPool: BlessingDefinition[];
  guide: GuideCharacter;
  economy: EconomyConfig;
  /** 休憩所で休んだときに回復する最大 HP の割合。 */
  restHealRatio: number;
};

/** 恩恵のあとのデッキ操作。 */
export type DeckEditMode = 'upgrade' | 'remove';

/** ラン全体が今どの画面にいるか。 */
export type RunPhase =
  | { kind: 'blessing'; options: BlessingDefinition[] }
  | { kind: 'deckEdit'; mode: DeckEditMode }
  | { kind: 'map' }
  | { kind: 'combat'; nodeId: string; enemy: EnemyDefinition; seed: number }
  | {
      kind: 'reward';
      choices: CardDefinition[];
      gold: number;
      /** すでに所持品に入っている。 */
      relic: RelicDefinition | null;
      /** 報酬のあとに進む先。ボス撃破後は次の章へ。 */
      next: 'map' | 'nextAct';
    }
  | { kind: 'rest' }
  | { kind: 'shop'; stock: ShopStock }
  | { kind: 'gameOver' }
  | { kind: 'cleared' };

/** 戦闘から持ち帰る結果。 */
export type CombatResult = {
  status: 'won' | 'lost';
  playerHp: number;
  potions: PotionSlot[];
};

export type RunState = {
  phase: RunPhase;
  acts: ActConfig[];
  /** 今の章（0 始まり）。 */
  actIndex: number;
  map: GameMap;
  /** 今の章のボス。 */
  boss: EnemyDefinition;
  currentNodeId: string | null;
  visitedNodeIds: string[];
  agent: AgentDefinition;
  player: { hp: number; maxHp: number };
  gold: number;
  deck: CardDefinition[];
  relics: RelicDefinition[];
  potions: PotionSlot[];
  energyPerTurn: number;
  drawPerTurn: number;
  rewardPool: CardDefinition[];
  potionPool: PotionDefinition[];
  relicPool: RelicDefinition[];
  blessingPool: BlessingDefinition[];
  guide: GuideCharacter;
  economy: EconomyConfig;
  restHealRatio: number;
  /** このランでカード削除を使った回数。削除の値段に影響する。 */
  removalCount: number;
  rngSeed: number;
};
