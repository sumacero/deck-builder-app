import type { ActConfig } from './act';
import type { AgentDefinition } from './agent';
import type { BlessingDefinition, GuideCharacter } from './blessing';
import type { CardDefinition } from './card';
import type { CombatStats, PotionSlot } from './combat';
import type { EnemyDefinition, Encounter } from './enemy';
import type { EventDefinition } from './event';
import type { GameMap } from './map';
import type { PotionDefinition } from './potion';
import type { RelicDefinition } from './relic';
import type { RunEffect } from './runEffect';
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
  /** 章ごとの地域の候補。この順に進み、ランの開始時に各章から 1 つ選ばれる。 */
  actChoices: ActConfig[][];
  /** 最後の章のボスを倒したあとに戦うラスボス（強さの倍率はかけ済み）。倒したらクリア。 */
  finalBoss: EnemyDefinition;
  rewardPool: CardDefinition[];
  /** ショップ・恩恵・戦闘報酬で手に入るポーションの候補。 */
  potionPool: PotionDefinition[];
  /** エリート・宝箱・ショップ・恩恵で手に入るレリックの候補。持っているものは出ない。 */
  relicPool: RelicDefinition[];
  /** ボス撃破後の 3 択に出るレリックの候補。 */
  bossRelicPool: RelicDefinition[];
  /** 「？」マスで起きるイベントの候補。 */
  eventPool: EventDefinition[];
  blessingPool: BlessingDefinition[];
  guide: GuideCharacter;
  economy: EconomyConfig;
  /** 休憩所で休んだときに回復する最大 HP の割合。 */
  restHealRatio: number;
};

/** 出来事の画面。outcome は選択肢を選んだあとの結末。null ならまだ選んでいない。 */
export type EventPhase = { kind: 'event'; event: EventDefinition; outcome: string | null };

/**
 * カードを 1 枚選ぶ画面の共通。
 * 出来事の強化は、カードを決めるまで held の効果をかけず、選択肢へ戻れる。
 * 削除など、それ以外の出来事は取り消せず、選び終えたら結末を見せる。
 */
type DeckEditFollowUp = {
  cancellable: boolean;
  resume?: EventPhase;
  /** 強化を決めたときにかける効果と、そのあとに見せる結末。戻るときは使わない。 */
  held?: { effects: readonly RunEffect[]; outcome: string };
};

/** ラン全体が今どの画面にいるか。 */
export type RunPhase =
  | { kind: 'blessing'; options: BlessingDefinition[] }
  | ({ kind: 'deckEdit'; mode: 'upgrade' } & DeckEditFollowUp)
  | ({ kind: 'deckEdit'; mode: 'remove' } & DeckEditFollowUp)
  | { kind: 'map' }
  | { kind: 'combat'; nodeId: string; encounter: Encounter; seed: number }
  | {
      kind: 'reward';
      /** card のあと、空き枠か入れ替えでポーションを 1 つ選ぶ。 */
      step: 'card' | 'potion';
      choices: CardDefinition[];
      /** カードを決めたあとに出す 3 択。空ならポーションの画面は出さない。 */
      potionChoices: PotionDefinition[];
      gold: number;
      /** すでに所持品に入っている。 */
      relic: RelicDefinition | null;
      /** 報酬のあとに進む先。ボス撃破後はボスレリックの 3 択へ。 */
      next: 'map' | 'bossRelic';
      /** カードを受け取らずに進める。出来事でカードを足すときは false。 */
      canSkip: boolean;
      /** カードを決めたあとの結末。無いときは next へ進む。 */
      resume?: EventPhase;
    }
  | { kind: 'bossRelic'; choices: RelicDefinition[] }
  /** 最後の章を終え、ラスボスとの決戦の前。HP は全回復している。 */
  | { kind: 'finale' }
  | { kind: 'rest' }
  | { kind: 'shop'; stock: ShopStock }
  | EventPhase
  /** opened までは中身は未定。開けた時点でレリックとゴールドが所持品に入る。 */
  | { kind: 'treasure'; opened: boolean; relic: RelicDefinition | null; gold: number }
  /** atFinale はラスボス戦で力尽きた。 */
  | { kind: 'gameOver'; atFinale: boolean }
  | { kind: 'cleared' };

/** 戦闘から持ち帰る結果。 */
export type CombatResult = {
  status: 'won' | 'lost';
  playerHp: number;
  /** 戦闘中に増えた分を含む最大 HP。 */
  playerMaxHp: number;
  potions: PotionSlot[];
  /** 永続的に成長したカードを反映したデッキ。 */
  deck: CardDefinition[];
  stats: CombatStats;
};

/** ラン全体の記録（振り返り画面用）。 */
export type RunStats = CombatStats & { combatsWon: number };

export type RunState = {
  phase: RunPhase;
  acts: ActConfig[];
  /** 今の章（0 始まり）。 */
  actIndex: number;
  map: GameMap;
  /** 今の章のボス戦（ボスと取り巻き）。 */
  boss: Encounter;
  finalBoss: EnemyDefinition;
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
  bossRelicPool: RelicDefinition[];
  eventPool: EventDefinition[];
  /** このランで起きたイベント。候補が残っている間は同じイベントを出さない。 */
  seenEventIds: string[];
  blessingPool: BlessingDefinition[];
  guide: GuideCharacter;
  economy: EconomyConfig;
  restHealRatio: number;
  /** このランでカード削除を使った回数。削除の値段に影響する。 */
  removalCount: number;
  stats: RunStats;
  rngSeed: number;
};
