import type { GameMap } from '../../domain/map';
import { MAP_LAYOUT } from '../../theme';

export type Point = { x: number; y: number };

export type MapLayout = {
  positions: Record<string, Point>;
  width: number;
  height: number;
};

/** id から決まる -range〜range の整数。毎回同じ位置にずらすために使う。 */
function jitter(id: string, salt: string, range: number): number {
  let hash = 0;
  for (const char of id + salt) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return (Math.abs(hash) % (range * 2 + 1)) - range;
}

/** 縦向き: 下の階ほど下に置き、列は画面の幅に等分する。上下にスクロールして見る。 */
export function layoutMap(map: GameMap, width: number): MapLayout {
  const columnWidth = width / map.columns;
  const height = (map.floorCount - 1) * MAP_LAYOUT.rowHeight + MAP_LAYOUT.verticalPadding * 2;
  const positions: Record<string, Point> = {};

  for (const node of map.nodes) {
    const isBoss = node.id === map.bossId;
    positions[node.id] = {
      x: (node.column + 0.5) * columnWidth + (isBoss ? 0 : jitter(node.id, 'x', MAP_LAYOUT.jitter)),
      y:
        height -
        MAP_LAYOUT.verticalPadding -
        node.floor * MAP_LAYOUT.rowHeight +
        (isBoss ? 0 : jitter(node.id, 'y', MAP_LAYOUT.jitter)),
    };
  }
  return { positions, width, height };
}

/**
 * 横向き: 下の階ほど左に置き（右へ進む）、列は画面の高さに等分する。左右にスクロールして見る。
 * 画面が広ければ階の間隔を広げて全体を収め、狭ければ最小の間隔で並べてスクロールさせる。
 */
export function layoutMapHorizontal(map: GameMap, height: number, viewportWidth: number): MapLayout {
  const { horizontalPadding, minFloorSpacing, rowHeight, jitter: range } = MAP_LAYOUT;
  const gaps = map.floorCount - 1;
  const spacing = Math.min(rowHeight, Math.max(minFloorSpacing, (viewportWidth - horizontalPadding * 2) / gaps));
  const width = gaps * spacing + horizontalPadding * 2;
  const rowWidth = height / map.columns;
  const positions: Record<string, Point> = {};

  for (const node of map.nodes) {
    const isBoss = node.id === map.bossId;
    positions[node.id] = {
      x: horizontalPadding + node.floor * spacing + (isBoss ? 0 : jitter(node.id, 'y', range)),
      y: (node.column + 0.5) * rowWidth + (isBoss ? 0 : jitter(node.id, 'x', range)),
    };
  }
  return { positions, width, height };
}
