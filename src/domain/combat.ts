import type { AgentDefinition } from './agent';
import type { Attribute } from './attribute';
import type { CardDefinition, CardInstance, CardMark, CardMotion, CardType } from './card';
import type { Effect } from './effect';
import type { EnemyAction, EnemyDefinition, EnemyMove, EnemyRank, EnemyTrait } from './enemy';
import type { PotionDefinition } from './potion';
import type { RelicDefinition } from './relic';
import type { Powers, Statuses } from './status';

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
  /** 絡め: アタックカードを使えない。 */
  bind: boolean;
};

export type PlayerState = Fighter & {
  energy: number;
  maxEnergy: number;
  strength: number;
  tempStrength: number;
  endTurnBlock: number;
  /** パワーカードで得た、戦闘の終わりまで続く能力。 */
  powers: Powers;
  /** エージェントの基本属性。敵の攻撃を受けるときの相性に使う。 */
  attribute: Attribute;
  /** ポーション等で、このターンのアタックに加わっている属性。 */
  enchant: Attribute[];
  /** このターンに使ったカードの枚数（手数を数えるカード用）。 */
  cardsThisTurn: number;
  /** このターンに使ったスキルの枚数（使ったあとに数えるカードより前の分）。 */
  skillsThisTurn: number;
  /** このターンに使ったアタックの枚数。 */
  attacksThisTurn: number;
  /** このターンに手札から捨てた枚数（効果・ターン終了）。 */
  discardsThisTurn: number;
  /** このターンに廃棄した枚数。 */
  exhaustsThisTurn: number;
  /** この戦闘で廃棄した枚数（灰・燃え殻・廃棄シナジー用）。 */
  exhaustsThisCombat: number;
  /** このターンだけ、ムチの攻撃が 1 回当たるたびにその敵へ与える宿り木（パワーの宿り木の蔓とは別に足す）。 */
  lashSeedThisTurn: number;
  /** この戦闘で使った（廃棄した）矢の本数。 */
  arrowsSpent: number;
  /** この戦闘で作った矢の本数（矢の instanceId を重ならないように振るため）。 */
  arrowsForged: number;
  /** この戦闘で、カードの効果（HP を払う）で失った HP の合計。 */
  selfHpLost: number;
  /** 秘奥義ゲージ。ARTE_GAUGE_MAX で秘奥義カードが手札に来る。 */
  arteGauge: number;
  /** 今のターンに効いている妨害。 */
  hindrance: Hindrance;
  /** 敵のターンにかけられ、次の自分のターンに効く妨害。 */
  pendingHindrance: Hindrance;
  /** かわす: 敵のヒットを無効にできる残り回数。次の自分のターンの始めに消える。 */
  evade: number;
  /** このターン、手札で札を重ねた回数（水晶の文鎮は最初の 1 回で発動）。 */
  fusesThisTurn: number;
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
  /**
   * 同じ戦闘にエリート以上が 2 体いるとき、2 体目が最初の 1 ターンだけ様子を見る。
   * 0 なら通常の行動。大技の開始位置が揃って、1 ターン目に重なるのを避ける。
   */
  windup: number;
  traits: EnemyTrait[];
  /** 眠りの残りターン。0 なら起きている。 */
  asleep: number;
  /** null は無属性。 */
  attribute: Attribute | null;
  /** 属性から決まる弱点（三つ巴で強い属性。無属性なら無し）。 */
  weaknesses: Attribute[];
  /** アーティファクトの残り回数。0 ならデバフを普通に受ける。 */
  artifact: number;
  /** 覚醒の性質を持つ敵が、すでに覚醒したか。 */
  awakened: boolean;
  /** 霜。次の攻撃のダメージが、1 ヒットごとにこの分下がる。攻撃を終えると消える。 */
  frost: number;
  /** 次の攻撃のヒット数をこの分減らす（重ねた瞬間の霞）。攻撃を終えると消える。 */
  hitCut: number;
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
      /** 性質カードの印。水鏡のノアは、この印で戦闘エフェクトを切り替える。 */
      mark?: CardMark;
    }
  /** 敵が行動した（攻撃は 1 発ごと）。target は行動した敵。 */
  | { kind: 'enemyAct'; target: EnemyUid; action: EnemyAction['kind'] }
  /**
   * 敵のターンの始まりと終わり。演出は出さない。
   * このあいだの出来事が終わるまで、UI は手札を触れなくする。
   */
  | { kind: 'enemyTurnStart'; target: 'player' }
  | { kind: 'enemyTurnEnd'; target: 'player' }
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
  /** 性質が発動した（目覚めた、デバフを防いだ など）。キャラの上に短い文字を出す。 */
  | { kind: 'callout'; target: ActorId; text: string }
  /** 手札が上限で、blocked 枚を引けなかった（山札に残る）。 */
  | { kind: 'handFull'; target: 'player'; blocked: number }
  /**
   * 手札で印を重ねた。波紋と、重なる動きの演出に使う。
   * playedId は残った札（摘んでいた札）。materialIds は廃棄札にした下の札。
   * consumed は、消える直前の下の札。
   */
  | {
      kind: 'marksFused';
      target: 'player';
      playedId: string;
      materialIds: string[];
      consumed: CardInstance;
    }
  /**
   * 山札・手札・捨て札・廃棄札のあいだを札が移った。
   * 枚数は先に更新する。UI は札のゴーストを from から to へ飛ばし、
   * 手札へ着く札は着くまで見せない（補充が一瞬で埋まるのを避ける）。
   * handIndex / handCount は、手札を離れた瞬間の並び。
   * 山札から来た札の着地点は、今の手札から instanceId で探す。
   */
  | {
      kind: 'pileTravel';
      target: 'player';
      card: CardInstance;
      from: 'draw' | 'hand';
      to: 'hand' | 'discard' | 'exhaust';
      handIndex: number;
      handCount: number;
    }
  /** 敵が全滅した。 */
  | { kind: 'won'; target: 'player' };

/** 直前の操作で起きた出来事。UI はこれを見て演出を再生する。 */
export type CombatEvent = CombatEventBody & { id: number };

/** ランの振り返りに使う記録。戦闘ごとに数え、ランで合算する。 */
export type CombatStats = {
  /** 1 ヒットで与えた最大ダメージ（HP に通った分）。 */
  maxHit: number;
  enemiesDefeated: number;
  /** 相性で有利な属性で攻撃したヒット数。 */
  weakHits: number;
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
  /** 戦闘の格（通常・エリート・ボス・ラスボス）。BGM と背景の切り替えに使う。 */
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
  /**
   * 札を重ねたあと、敵をタップで選ぶ待ち。
   * ブロック半減・攻撃回数減で、候補が 2 体以上いるときだけ入る。
   */
  pendingFuse: PendingFuseAim | null;
  /**
   * 手札から捨てる・廃棄する札を、プレイヤーがタップで選ぶ待ち。
   * 枚数を選び終わるまで、ターン終了やほかのカードは使えない。
   */
  pendingHandRemoval: PendingHandRemoval | null;
};

/** 手札から手放す札を選ぶ待ち。rest は、選び終わったあとに続ける効果。 */
export type PendingHandRemoval = {
  mode: 'discard' | 'exhaust';
  /** あと何枚選ぶか。 */
  left: number;
  /** この選択で既に手放した枚数。拾い集めのドローは、選び終わってからまとめて行う。 */
  taken: number;
  rest: readonly Effect[];
  aim: EnemyUid | 'all';
  attributes: readonly Attribute[];
  pierce?: boolean;
  fixed?: boolean;
  /**
   * カード使用の後処理。ポーションやレリック由来なら null。
   * sawWeak は、タップでイベントを捨てる前に出ていた弱点ヒット。
   */
  follow: { instance: CardInstance; eventsBefore: number; sawWeak?: boolean } | null;
};

/** 重ねた瞬間の効果で、敵を選んでもらう待ち。 */
export type PendingFuseAim = {
  effects: Effect[];
  candidates: EnemyUid[];
  repeats: number;
  /** 案内文用。block = ブロック半減、multiHit = 攻撃回数を減らす。 */
  kind: 'block' | 'multiHit';
};

/** カードを敵の上で離したときに、その敵が受ける実ダメージの予告。 */
export type DamagePreview = {
  uid: EnemyUid;
  hpLoss: number;
  blocked: number;
  lethal: boolean;
};
