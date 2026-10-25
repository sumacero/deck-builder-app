import type { EnemyRank } from '../domain/enemy';

/**
 * エリート・ボス・ラスボスは、行動パターンの 1 周で攻撃が強くなる。
 * 通常の敵は手ごとに書いたダメージのまま。
 */
export function routineRank(rank: EnemyRank): boolean {
  return rank !== 'normal';
}

/**
 * 今の手がパターンの何手目かで決まる攻撃倍率。先頭は 0.7、最後の手は 1.15。
 * 先頭に戻ると 0.7 に戻る。手の数（3〜5。ノクスの旗だけ 6）のあいだは均等に上がる。
 */
export function routineAttackMultiplier(rank: EnemyRank, moveIndex: number, moveCount: number): number {
  if (!routineRank(rank) || moveCount <= 1) return 1;
  const step = ((moveIndex % moveCount) + moveCount) % moveCount;
  return 0.7 + 0.45 * (step / (moveCount - 1));
}
