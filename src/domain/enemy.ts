export type EnemyAction =
  | { kind: 'attack'; damage: number; hits: number }
  | { kind: 'block'; amount: number }
  /** 戦闘中ずっと筋力が上がり、以降の攻撃 1 回ごとのダメージが増える。 */
  | { kind: 'buff'; strength: number };

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
