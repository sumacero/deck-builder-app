import type { Attribute } from './attribute';
import type { CardDefinition } from './card';
import type { DebuffId } from './status';

export type EnemyAction =
  | { kind: 'attack'; damage: number; hits: number }
  | { kind: 'block'; amount: number }
  /** 戦闘中ずっと筋力が上がり、以降の攻撃 1 回ごとのダメージが増える。 */
  | { kind: 'buff'; strength: number }
  /** HP を回復する。allies なら生きている仲間全員（自分を含む）。 */
  | { kind: 'heal'; amount: number; allies?: boolean }
  /** 麻痺: 次の自分のターン、エナジーが amount 減る。 */
  | { kind: 'paralyze'; amount: number }
  /** 凍え: 次の自分のターン、引く枚数が amount 減る。 */
  | { kind: 'chill'; amount: number }
  /** 封印: 次の自分のターン、スキルカードを使えない。 */
  | { kind: 'seal' }
  /** 力を溜める（それ自体は何もしない）。次の行動が大技であることの予告。 */
  | { kind: 'charge' }
  /** プレイヤーに弱体・衰弱をかける。 */
  | { kind: 'debuff'; status: DebuffId; turns: number }
  /** プレイヤーの捨て札にお邪魔カードを混ぜる。 */
  | { kind: 'addCard'; card: CardDefinition; count: number }
  /** 霊体化: 次のプレイヤーのターンの間、攻撃 1 回で受けるダメージが最大 1。 */
  | { kind: 'intangible' }
  /** 眠っていて何もしない（行動パターンには書かない。状態から自動で決まる）。 */
  | { kind: 'idle'; reason: 'sleep' };

export type EnemyMove = {
  id: string;
  name: string;
  actions: EnemyAction[];
};

/** 戦闘中ずっと効く敵の性質。 */
export type EnemyTrait =
  /** 仇討ち: 仲間が倒れるたびに筋力が上がる。 */
  | { kind: 'vengeance'; strength: number }
  /** 眠り: 最初の turns ターンは眠っている。HP にダメージを受けるか、時間が来ると起きて筋力が上がる。 */
  | { kind: 'sleep'; turns: number; wakeStrength: number }
  /** 不屈: 同じ種類のデバフは戦闘中 1 回しか受け付けない（延長も効かない）。 */
  | { kind: 'resolute' }
  /** 加護: 最初の charges 回のデバフ（延長を含む）を無効にする。 */
  | { kind: 'ward'; charges: number }
  /** かばう: 生きている間、仲間 1 体を狙った攻撃・デバフを代わりに受ける。 */
  | { kind: 'guardian' }
  /** 死に際: 倒れたときに action を行う。 */
  | { kind: 'deathThroes'; action: EnemyAction };

/** 通常敵 / エリート / ボス。報酬の内容が変わる。 */
export type EnemyRank = 'normal' | 'elite' | 'boss';

export type EnemyDefinition = {
  id: string;
  name: string;
  icon: string;
  rank: EnemyRank;
  maxHp: number;
  /** 先頭から順に使い、最後まで行ったら先頭に戻る。 */
  moves: EnemyMove[];
  traits?: EnemyTrait[];
  /**
   * 敵の属性。これに強い属性（三つ巴）が弱点で、弱点を突かれるとダメージ 1.25 倍。
   * 省略で無属性（機械など）: 相性なし。
   */
  attribute?: Attribute;
};

/** 1 回の戦闘で出てくる敵の組み合わせ。rank で報酬や BGM が変わる。 */
export type Encounter = {
  id: string;
  rank: EnemyRank;
  /** 左から順に並び、この順に行動する。 */
  enemies: EnemyDefinition[];
};
