import type { EnemyDefinition, Encounter } from '../domain/enemy';
import type { RunState } from '../domain/run';
import { nextRandom, pickOne } from './random';

/** 敵 1 体だけの戦闘（ボスなど）。 */
export const soloEncounter = (enemy: EnemyDefinition): Encounter => ({
  id: enemy.id,
  rank: enemy.rank,
  enemies: [enemy],
});

/** 戦闘を始める。戦闘ごとのシャッフル用シードもここで決める。 */
export function startCombat(run: RunState, nodeId: string, encounter: Encounter): RunState {
  const seedRoll = nextRandom(run.rngSeed);
  return {
    ...run,
    rngSeed: seedRoll.seed,
    phase: { kind: 'combat', nodeId, encounter, seed: Math.floor(seedRoll.value * 2 ** 31) },
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
