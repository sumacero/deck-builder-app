import type { GameMap, MapConfig, MapNode, MapNodeType, RandomNodeType } from '../domain/map';
import { nextRandom } from './random';

/** 経路上で連続させない種類。 */
const NO_REPEAT: readonly MapNodeType[] = ['elite', 'rest', 'shop'];

const nodeId = (floor: number, column: number) => `n-${floor}-${column}`;
const edgeKey = (floor: number, from: number, to: number) => `${floor}:${from}>${to}`;

type Rng = { next: () => number; seed: () => number };

function createRng(seed: number): Rng {
  let current = seed;
  return {
    next: () => {
      const result = nextRandom(current);
      current = result.seed;
      return result.value;
    },
    seed: () => current,
  };
}

function pickWeighted(
  weights: Record<RandomNodeType, number>,
  excluded: readonly MapNodeType[],
  random: number,
): RandomNodeType {
  const candidates = (Object.keys(weights) as RandomNodeType[]).filter(
    (type) => !excluded.includes(type),
  );
  const total = candidates.reduce((sum, type) => sum + weights[type], 0);
  let threshold = random * total;
  for (const type of candidates) {
    threshold -= weights[type];
    if (threshold < 0) return type;
  }
  return 'enemy';
}

/**
 * スレスパ式のマップ生成。
 * 下の階からルートを config.paths 本伸ばし（1 階ごとに左・まっすぐ・右へ進む）、
 * 他のルートと交差する斜め移動はまっすぐに変える。最上階の全マスはボスにつながる。
 */
export function generateMap(config: MapConfig, seed: number): { map: GameMap; seed: number } {
  const rng = createRng(seed);
  const randomInt = (max: number) => Math.floor(rng.next() * max);
  const clampColumn = (column: number) => Math.max(0, Math.min(config.columns - 1, column));

  const points = new Set<string>();
  const edges = new Set<string>();
  const starts: number[] = [];

  for (let path = 0; path < config.paths; path++) {
    let column = randomInt(config.columns);
    // 最初の 2 本は別の列から始め、スタートの選択肢を必ず 2 つ以上にする。
    while (path === 1 && column === starts[0]) column = randomInt(config.columns);
    starts.push(column);
    points.add(nodeId(0, column));

    for (let floor = 0; floor < config.floors - 1; floor++) {
      let next = clampColumn(column + randomInt(3) - 1);
      if (next !== column && edges.has(edgeKey(floor, next, column))) next = column;
      edges.add(edgeKey(floor, column, next));
      points.add(nodeId(floor + 1, next));
      column = next;
    }
  }

  const bossId = 'boss';
  const nodes: MapNode[] = [];
  for (let floor = 0; floor < config.floors; floor++) {
    for (let column = 0; column < config.columns; column++) {
      if (!points.has(nodeId(floor, column))) continue;
      const next =
        floor === config.floors - 1
          ? [bossId]
          : [-1, 0, 1]
              .map((d) => column + d)
              .filter((to) => edges.has(edgeKey(floor, column, to)))
              .map((to) => nodeId(floor + 1, to));
      nodes.push({ id: nodeId(floor, column), floor, column, type: 'enemy', next });
    }
  }

  const typed = assignTypes(nodes, config, rng);
  typed.push({
    id: bossId,
    floor: config.floors,
    column: (config.columns - 1) / 2,
    type: 'boss',
    next: [],
  });

  return {
    map: { floorCount: config.floors + 1, columns: config.columns, nodes: typed, bossId },
    seed: rng.seed(),
  };
}

/** 下の階から順に種類を決める（親マスの種類を見て連続を避けるため）。 */
function assignTypes(nodes: MapNode[], config: MapConfig, rng: Rng): MapNode[] {
  const typeById = new Map<string, MapNodeType>();
  return nodes.map((node) => {
    const parentTypes = nodes
      .filter((parent) => parent.next.includes(node.id))
      .map((parent) => typeById.get(parent.id))
      .filter((type): type is MapNodeType => type !== undefined);
    const type = chooseType(node.floor, parentTypes, config, rng.next());
    typeById.set(node.id, type);
    return { ...node, type };
  });
}

function chooseType(
  floor: number,
  parentTypes: MapNodeType[],
  config: MapConfig,
  random: number,
): MapNodeType {
  if (floor === 0) return 'enemy';
  if (floor === config.treasureFloor) return 'treasure';
  if (floor === config.floors - 1) return 'rest';

  const excluded: MapNodeType[] = NO_REPEAT.filter((type) => parentTypes.includes(type));
  if (floor < config.restAndEliteFromFloor) excluded.push('rest', 'elite');
  // 直後が必ず休憩所になる階では休憩所を置かない。
  if (floor === config.floors - 2) excluded.push('rest');
  return pickWeighted(config.typeWeights, excluded, random);
}
