import type { GameMap } from '../../domain/map';
import { MAP_LAYOUT } from '../../theme';

export type Point = { x: number; y: number };

export type MapLayout = {
  positions: Record<string, Point>;
  height: number;
};

/** id から決まる -range〜range の整数。毎回同じ位置にずらすために使う。 */
function jitter(id: string, salt: string, range: number): number {
  let hash = 0;
  for (const char of id + salt) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return (Math.abs(hash) % (range * 2 + 1)) - range;
}

/** マスの画面上の座標を決める。下の階ほど下に置く。 */
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
  return { positions, height };
}
