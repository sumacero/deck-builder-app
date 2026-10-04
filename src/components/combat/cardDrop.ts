import type { CardTarget } from '../../domain/card';
import type { EnemyUid } from '../../domain/combat';

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

/** カードを離したときに起きること。null なら手札に戻る。 */
export type DropTarget =
  | { kind: 'enemy'; uid: EnemyUid }
  | { kind: 'allEnemies' }
  | { kind: 'self' };

const centerX = (rect: Rect) => rect.x + rect.width / 2;

/** 指の横位置に一番近い敵。敵の真上まで指を運ばなくても、横位置が合えば狙える。 */
function nearestByX<T extends { rect: Rect }>(items: readonly T[], x: number): T | undefined {
  let best: T | undefined;
  for (const item of items) {
    if (!best || Math.abs(centerX(item.rect) - x) < Math.abs(centerX(best.rect) - x)) best = item;
  }
  return best;
}

/**
 * 指を離した位置から、カードの使い道を決める。座標はすべて画面（ウィンドウ）基準。
 * - 自分に使うカードは、少しでも持ち上げたらどこで離しても自分に使う。
 * - それ以外は、手札より上（releaseLineY より上）まで持ち上げていなければ使わない。
 * - 敵 1 体を狙うカードは、指の横位置に一番近い生きている敵を狙う（高さは問わない）。
 * - 敵全体に使うカードは、上まで持ち上げて離せば使える。
 */
export function resolveDrop(
  point: Point,
  target: CardTarget,
  livingEnemyRects: readonly { uid: EnemyUid; rect: Rect }[],
  releaseLineY: number,
): DropTarget | null {
  if (target === 'self') return { kind: 'self' };
  if (point.y > releaseLineY) return null;
  switch (target) {
    case 'enemy': {
      const aimed = nearestByX(livingEnemyRects, point.x);
      return aimed ? { kind: 'enemy', uid: aimed.uid } : null;
    }
    case 'allEnemies':
      return { kind: 'allEnemies' };
  }
}

/**
 * タップだけで使えるか。狙う敵を選ぶ必要がないカード（自分・敵全体、敵が 1 体だけのときの単体攻撃）。
 * 敵が複数いるときの単体攻撃だけは、狙う敵へスワイプして使う。
 */
export const canPlayByTap = (target: CardTarget, livingEnemyCount: number) =>
  target !== 'enemy' || livingEnemyCount <= 1;

export const sameDrop = (a: DropTarget | null, b: DropTarget | null) =>
  a?.kind === b?.kind && (a?.kind !== 'enemy' || (b?.kind === 'enemy' && a.uid === b.uid));
