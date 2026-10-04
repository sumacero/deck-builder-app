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
  | { kind: 'charge' };

export type EnemyMove = {
  id: string;
  name: string;
  actions: EnemyAction[];
};

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
};

/** 1 回の戦闘で出てくる敵の組み合わせ。rank で報酬や BGM が変わる。 */
export type Encounter = {
  id: string;
  rank: EnemyRank;
  /** 左から順に並び、この順に行動する。 */
  enemies: EnemyDefinition[];
};
