import type { EnemyDefinition, Encounter, RoadTier } from '../domain/enemy';
import type { GameMap } from '../domain/map';
import type { RunState } from '../domain/run';
import { nextRandom, pickOne } from './random';
import { scaleEncounter } from './scaling';

/** 敵 1 体だけの戦闘（ボスなど）。 */
export const soloEncounter = (enemy: EnemyDefinition): Encounter => ({
  id: enemy.id,
  rank: enemy.rank,
  enemies: [enemy],
});

/** 戦闘の主役（エリート・ボスなど一番格の高い敵）。取り巻きと一緒に出ても、名前を出すときはこの敵。 */
export function encounterLeader(encounter: Encounter): EnemyDefinition {
  return encounter.enemies.find((enemy) => enemy.rank === encounter.rank) ?? encounter.enemies[0];
}

/**
 * ボスを除く 10 階を三等分に近い幅で分ける。0 がスタート。
 * 序盤 0〜2、中盤 3〜6、終盤 7〜9。
 */
export function roadTier(floor: number): RoadTier {
  if (floor <= 2) return 'early';
  if (floor <= 6) return 'mid';
  return 'late';
}

/** 今の階の通常戦だけを残す。印の無い候補しか無いときは、そのまま使う。 */
export function encountersForFloor(pool: readonly Encounter[], floor: number): readonly Encounter[] {
  const tier = roadTier(floor);
  const band = pool.filter((encounter) => encounter.tier === tier);
  return band.length > 0 ? band : pool;
}

/** 今いる階での、章の中の強さの倍率（1 階目が一番弱く、ボスの階で 1）。 */
export function floorMultiplier(run: RunState): number {
  const node = run.map.nodes.find((n) => n.id === run.currentNodeId);
  const { start, perFloor } = run.acts[run.actIndex].floorScaling;
  return start + perFloor * (node?.floor ?? 0);
}

/**
 * 戦闘を始める。今いる階に応じて敵を強くし（multiplier を渡せばその倍率）、戦闘ごとのシャッフル用シードもここで決める。
 */
export function startCombat(
  run: RunState,
  nodeId: string,
  encounter: Encounter,
  multiplier = floorMultiplier(run),
): RunState {
  const seedRoll = nextRandom(run.rngSeed);
  const scaled = multiplier === 1 ? encounter : scaleEncounter(encounter, { hp: multiplier, power: multiplier });
  return {
    ...run,
    rngSeed: seedRoll.seed,
    phase: { kind: 'combat', nodeId, encounter: scaled, seed: Math.floor(seedRoll.value * 2 ** 31) },
  };
}

export function startRandomCombat(
  run: RunState,
  nodeId: string,
  pool: readonly Encounter[],
): RunState {
  const node = run.map.nodes.find((item) => item.id === run.currentNodeId);
  const picked = pickOne(encountersForFloor(pool, node?.floor ?? 0), run.rngSeed);
  if (!picked.item) return run;
  return startCombat({ ...run, rngSeed: picked.seed }, nodeId, picked.item);
}

/** マップを作ったあと、エリートのマスに戦闘を割り当てる。入る前から、どの困らせ方か見えるようにする。 */
export function stampEliteEncounters(
  map: GameMap,
  pool: readonly Encounter[],
  seed: number,
): { map: GameMap; seed: number } {
  let current = seed;
  const nodes = map.nodes.map((node) => {
    if (node.type !== 'elite' || pool.length === 0) return node;
    const picked = pickOne(pool, current);
    current = picked.seed;
    if (!picked.item) return node;
    return { ...node, encounterId: picked.item.id };
  });
  return { map: { ...map, nodes }, seed: current };
}
