import type { EventOption } from '../domain/event';
import type { RunState } from '../domain/run';
import { startRandomCombat } from './encounter';
import { pickOne } from './random';
import { applyEffectsThenChoice, canApplyRunEffect, canMakeChoice } from './runEffects';

/** 「？」マスに入ったときのイベントを決める。まだ起きていないものを優先する。 */
export function startEvent(run: RunState): RunState {
  const unseen = run.eventPool.filter((event) => !run.seenEventIds.includes(event.id));
  const picked = pickOne(unseen.length > 0 ? unseen : run.eventPool, run.rngSeed);
  if (!picked.item) return { ...run, rngSeed: picked.seed, phase: { kind: 'map' } };
  return {
    ...run,
    rngSeed: picked.seed,
    seenEventIds: [...run.seenEventIds, picked.item.id],
    phase: { kind: 'event', event: picked.item, outcome: null },
  };
}

/** 払えない代償があったり、選んでも何も起きなかったりする選択肢は選べない。 */
export function canChooseEventOption(run: RunState, option: EventOption): boolean {
  return (
    canMakeChoice(run, option.choice) &&
    option.effects.every((effect) => canApplyRunEffect(run, effect))
  );
}

export function chooseEventOption(run: RunState, optionId: string): RunState {
  if (run.phase.kind !== 'event' || run.phase.outcome !== null) return run;
  const { event } = run.phase;
  const option = event.options.find((o) => o.id === optionId);
  if (!option || !canChooseEventOption(run, option)) return run;

  if (option.fight === 'elite') {
    const act = run.acts[run.actIndex];
    return startRandomCombat(run, run.currentNodeId ?? event.id, act.elitePool);
  }
  return applyEffectsThenChoice(run, option.effects, option.choice, {
    kind: 'event',
    event,
    outcome: option.outcome,
  });
}

/** 結末を読んだらマップへ戻る。 */
export function leaveEvent(run: RunState): RunState {
  if (run.phase.kind !== 'event' || run.phase.outcome === null) return run;
  return { ...run, phase: { kind: 'map' } };
}
