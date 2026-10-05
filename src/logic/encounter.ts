import type { EnemyDefinition, Encounter } from '../domain/enemy';
import type { RunState } from '../domain/run';
import { nextRandom, pickOne } from './random';
import { scaleEncounter } from './scaling';

/** 敵 1 体だけの戦闘（ボスなど）。 */
export const soloEncounter = (enemy: EnemyDefinition): Encounter => ({
  id: enemy.id,
  rank: enemy.rank,
  enemies: [enemy],
});

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
  const picked = pickOne(pool, run.rngSeed);
  if (!picked.item) return run;
  return startCombat({ ...run, rngSeed: picked.seed }, nodeId, picked.item);
}
