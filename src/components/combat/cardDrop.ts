import type { CardTarget } from '../../domain/card';
import type { EnemyUid } from '../../domain/combat';

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

/** カードを離したときに起きること。null なら手札に戻る。 */
export type DropTarget = { kind: 'enemy'; uid: EnemyUid } | { kind: 'allEnemies' };

const contains = (rect: Rect, { x, y }: Point) =>
  x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;

/**
 * 指を離した位置から、カードの使い道を決める。座標はすべて画面（ウィンドウ）基準。
 * - 手札より上（releaseLineY より上）まで持ち上げていなければ使わない。
 * - 敵 1 体を狙うカードは、生きている敵の上で離す。敵が 1 体だけなら上のどこで離してもよい。
 * - 敵全体に使うカードは、上まで持ち上げて離せば使える。
 * - 自分に使うカードはタップで使うので、持ち上げても使わない。
 */
export function resolveDrop(
  point: Point,
  target: CardTarget,
  livingEnemyRects: readonly { uid: EnemyUid; rect: Rect }[],
  releaseLineY: number,
): DropTarget | null {
  if (point.y > releaseLineY) return null;
  switch (target) {
    case 'enemy': {
      const hovered = livingEnemyRects.find(({ rect }) => contains(rect, point));
      if (hovered) return { kind: 'enemy', uid: hovered.uid };
      return livingEnemyRects.length === 1 ? { kind: 'enemy', uid: livingEnemyRects[0].uid } : null;
    }
    case 'allEnemies':
      return { kind: 'allEnemies' };
    case 'self':
      return null;
  }
}

export const sameDrop = (a: DropTarget | null, b: DropTarget | null) =>
  a?.kind === b?.kind && (a?.kind !== 'enemy' || (b?.kind === 'enemy' && a.uid === b.uid));
