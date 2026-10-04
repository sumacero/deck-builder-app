import type { CardTarget } from '../../domain/card';
import type { EnemyUid } from '../../domain/combat';

export type Point = { x: number; y: number };

/** 持ち上げてから離すまでの共通の知らせ。velocity は離した瞬間の指の速さ（px/ms）。 */
export type DragMoveHandlers = {
  /** 指が触れた瞬間。素早いフリックに間に合うよう、ここで敵や手札の位置を測っておく。 */
  onPressIn: () => void;
  onDragMove: (point: Point) => void;
  onDragEnd: (point: Point, velocity: Point) => void;
  onDragCancel: () => void;
};

export type PotionDragHandlers = DragMoveHandlers & {
  onDragStart: (slot: number, point: Point) => void;
};

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

/** ポーションは、持ち始めた位置からこれだけ指を動かしたら「使う」位置。 */
const ITEM_DROP_DISTANCE = 40;

/**
 * ポーションを離した位置から、使い道を決める。所持品欄は画面の端にあり手札のような境目が無いので、
 * 持ち始めた位置から十分に動かしたかで判定する。敵 1 体を狙うものは、指の横位置に一番近い敵。
 */
export function resolveItemDrop(
  point: Point,
  start: Point,
  target: CardTarget,
  livingEnemyRects: readonly { uid: EnemyUid; rect: Rect }[],
): DropTarget | null {
  if (Math.hypot(point.x - start.x, point.y - start.y) < ITEM_DROP_DISTANCE) return null;
  switch (target) {
    case 'self':
      return { kind: 'self' };
    case 'allEnemies':
      return { kind: 'allEnemies' };
    case 'enemy': {
      const aimed = nearestByX(livingEnemyRects, point.x);
      return aimed ? { kind: 'enemy', uid: aimed.uid } : null;
    }
  }
}

/** これより速く（px/ms）指を払って離したら「フリック」。 */
const FLICK_MIN_SPEED = 0.5;
/** フリックしたとき、指がこの時間（ms）だけ同じ速さで進んだ先で離したとみなす。 */
const FLICK_PROJECTION_MS = 120;

/** 素早く払って離したときは、指の勢いの先で離したことにする（短いフリックでも狙いが届く）。 */
export function projectFlick(point: Point, velocity: Point): Point {
  if (Math.hypot(velocity.x, velocity.y) < FLICK_MIN_SPEED) return point;
  return {
    x: point.x + velocity.x * FLICK_PROJECTION_MS,
    y: point.y + velocity.y * FLICK_PROJECTION_MS,
  };
}

/**
 * タップだけで使えるか。狙う敵を選ぶ必要がないカード（自分・敵全体、敵が 1 体だけのときの単体攻撃）。
 * 敵が複数いるときの単体攻撃は、狙う敵へスワイプするか、タップしてから敵をタップして使う。
 */
export const canPlayByTap = (target: CardTarget, livingEnemyCount: number) =>
  target !== 'enemy' || livingEnemyCount <= 1;

export const sameDrop = (a: DropTarget | null, b: DropTarget | null) =>
  a?.kind === b?.kind && (a?.kind !== 'enemy' || (b?.kind === 'enemy' && a.uid === b.uid));
