import type { AgentDefinition } from './agent';
import type { Attribute } from './attribute';
import type { CardDefinition, CardInstance, CardMotion, CardType } from './card';
import type { EnemyAction, EnemyDefinition, EnemyMove, EnemyRank, EnemyTrait } from './enemy';
import type { PotionDefinition } from './potion';
import type { RelicDefinition } from './relic';
import type { DebuffId, Powers, Statuses } from './status';

export type Fighter = {
  hp: number;
  maxHp: number;
  block: number;
  /** ターン数つきのバフ・デバフ。 */
  statuses: Statuses;
};

/** 敵の妨害。かけられた次の自分のターンだけ効く。 */
export type Hindrance = {
  /** 麻痺: エナジーが減る。 */
  paralysis: number;
  /** 凍え: 引く枚数が減る。 */
  chill: number;
  /** 封印: スキルカードを使えない。 */
  seal: boolean;
};

export type PlayerState = Fighter & {
  energy: number;
  maxEnergy: number;
  strength: number;
  tempStrength: number;
  endTurnBlock: number;
  /** パワーカードで得た、戦闘の終わりまで続く能力。 */
  powers: Powers;
  /** 魔法剣で、このターンのアタックに加わっている属性。 */
  enchant: Attribute[];
  /** 秘奥義ゲージ。ARTE_GAUGE_MAX で秘奥義カードが手札に来る。 */
  arteGauge: number;
  /** 今のターンに効いている妨害。 */
  hindrance: Hindrance;
  /** 敵のターンにかけられ、次の自分のターンに効く妨害。 */
  pendingHindrance: Hindrance;
};

/** 戦闘中の敵 1 体の識別子。同じ種類の敵が 2 体いても区別できるよう、並び順から振る。 */
export type EnemyUid = `enemy-${number}`;

/** 戦闘に参加しているキャラクター。イベントの対象や演出の振り分けに使う。 */
export type ActorId = 'player' | EnemyUid;

export type CombatSide = 'player' | 'enemy';

export type EnemyState = Fighter & {
  uid: EnemyUid;
  id: string;
  name: string;
  icon: string;
  rank: EnemyRank;
  strength: number;
  moves: EnemyMove[];
  moveIndex: number;
  traits: EnemyTrait[];
  /** 眠りの残りターン。0 なら起きている。 */
  asleep: number;
  /** ダウンして、次の行動を休む。 */
  stunned: boolean;
  weaknesses: Attribute[];
  /** ダウンゲージの残り（あと何回弱点を突くとダウンするか）。 */
  stagger: number;
  /** ダウンゲージの最大値。ダウンが明けるとここまで戻る。 */
  breakGauge: number;
  /** 加護の残り回数。 */
  ward: number;
  /** 不屈: これまでに受けたデバフ。 */
  debuffsTaken: DebuffId[];
};

export type CombatStatus = 'playerTurn' | 'won' | 'lost';

export type CombatLogEntry = {
  id: number;
  turn: number;
  text: string;
};

export type Vitals = { hp: number; block: number };

export type CombatEventBody =
  /** targets はカードが狙った敵（自分に使うカードは空）。 */
  | {
      kind: 'cardPlayed';
      target: 'player';
      targets: EnemyUid[];
      cardType: CardType;
      motion: CardMotion;
    }
  /** 敵が行動した（攻撃は 1 発ごと）。target は行動した敵。 */
  | { kind: 'enemyAct'; target: EnemyUid; action: EnemyAction['kind'] }
  | { kind: 'potionUsed'; target: 'player'; potionId: string }
  | { kind: 'relicTriggered'; target: 'player'; relicId: string }
  /**
   * after は起きた直後の HP とブロック。演出に合わせて 1 発ずつ表示を進めるのに使う。
   * hpLoss は倒しきった分も含むので、直前の値は before で持つ。
   */
  | {
      kind: 'hit';
      target: ActorId;
      hpLoss: number;
      blocked: number;
      before: Vitals;
      after: Vitals;
      /** 弱点を突いた。 */
      weak?: boolean;
    }
  /** 秘奥義を放った。画面全体にカットインを出す。 */
  | { kind: 'mysticArte'; target: 'player'; name: string }
  | { kind: 'blockGain'; target: ActorId; amount: number; after: Vitals }
  | { kind: 'heal'; target: ActorId; amount: number; after: Vitals }
  | { kind: 'defeated'; target: ActorId }
  /** 性質が発動した（目覚めた、ダウンした、デバフを防いだ など）。キャラの上に短い文字を出す。 */
  | { kind: 'callout'; target: ActorId; text: string }
  /** 手札が上限で、blocked 枚を引けなかった（山札に残る）。 */
  | { kind: 'handFull'; target: 'player'; blocked: number }
  /** 敵が全滅した。 */
  | { kind: 'won'; target: 'player' };

/** 直前の操作で起きた出来事。UI はこれを見て演出を再生する。 */
export type CombatEvent = CombatEventBody & { id: number };

/** ランの振り返りに使う記録。戦闘ごとに数え、ランで合算する。 */
export type CombatStats = {
  /** 1 ヒットで与えた最大ダメージ（HP に通った分）。 */
  maxHit: number;
  enemiesDefeated: number;
  downs: number;
  artes: number;
  /** 強化前のカード id ごとの使用回数。 */
  cardsPlayed: Record<string, number>;
};

/** ポーションスロット。空きは null。 */
export type PotionSlot = PotionDefinition | null;

export type CombatSetup = {
  agent: AgentDefinition;
  deck: CardDefinition[];
  /** 左から順に並ぶ敵。 */
  enemies: EnemyDefinition[];
  /** 戦闘の格（通常・エリート・ボス）。BGM の切り替えに使う。 */
  rank: EnemyRank;
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
  /** 倒した敵も HP 0 のまま残す（並び位置を保つため）。 */
  enemies: EnemyState[];
  drawPerTurn: number;
  /** ゲージが溜まったら手札に加える秘奥義。 */
  mysticArte: CardDefinition;
  stats: CombatStats;
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

/** カードを敵の上で離したときに、その敵が受ける実ダメージの予告。 */
export type DamagePreview = {
  uid: EnemyUid;
  hpLoss: number;
  blocked: number;
  lethal: boolean;
};
