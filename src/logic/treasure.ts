import type { RunState } from '../domain/run';
import { randomInt } from './random';
import { grantRandomRelic } from './runEffects';

/** 宝箱を開ける: まだ持っていないレリック 1 つとゴールド。 */
export function openTreasure(run: RunState): RunState {
  if (run.phase.kind !== 'treasure' || run.phase.opened) return run;
  const { min, max } = run.economy.treasureGold;
  const gold = randomInt(min, max, run.rngSeed);
  const looted = grantRandomRelic({ ...run, gold: run.gold + gold.value, rngSeed: gold.seed });
  return {
    ...looted.run,
    phase: { kind: 'treasure', opened: true, relic: looted.relic, gold: gold.value },
  };
}

export function leaveTreasure(run: RunState): RunState {
  if (run.phase.kind !== 'treasure' || !run.phase.opened) return run;
  return { ...run, phase: { kind: 'map' } };
}
