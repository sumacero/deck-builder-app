import type { BlessingDefinition, BlessingGroup } from '../domain/blessing';
import type { RunState } from '../domain/run';
import type { CardDefinition } from '../domain/card';
import { canUpgrade, removeFromDeck, upgradeInDeck } from './cards';
import { pickOne } from './random';
import { applyEffectsThenChoice, canApplyRunEffect, canMakeChoice } from './runEffects';

const GROUP_ORDER: readonly BlessingGroup[] = ['deck', 'resource', 'tradeoff'];

/** 選んでも何も起きない恩恵は出さない（強化できるカードが無いのに強化、など）。 */
function isUseful(run: RunState, blessing: BlessingDefinition): boolean {
  return (
    canMakeChoice(run, blessing.choice) &&
    blessing.effects.every((effect) => canApplyRunEffect(run, effect))
  );
}

/** グループごとに 1 つずつ選んだ 3 択。 */
export function generateBlessingOptions(run: RunState): {
  options: BlessingDefinition[];
  seed: number;
} {
  let seed = run.rngSeed;
  const options: BlessingDefinition[] = [];
  for (const group of GROUP_ORDER) {
    const candidates = run.blessingPool.filter((b) => b.group === group && isUseful(run, b));
    const picked = pickOne(candidates, seed);
    seed = picked.seed;
    if (picked.item) options.push(picked.item);
  }
  return { options, seed };
}

export function chooseBlessing(run: RunState, blessingId: string): RunState {
  if (run.phase.kind !== 'blessing') return run;
  const blessing = run.phase.options.find((b) => b.id === blessingId);
  if (!blessing) return run;
  return applyEffectsThenChoice(run, blessing.effects, blessing.choice, { kind: 'map' });
}

/** 恩恵・出来事で選んだカードを強化・削除する。card が null ならやめる。 */
export function finishDeckEdit(run: RunState, card: CardDefinition | null): RunState {
  if (run.phase.kind !== 'deckEdit') return run;
  const phase = run.phase;
  if (card === null) {
    if (phase.cancellable === false && deckEditHasChoice(run, phase)) return run;
    return { ...run, phase: phase.resume ?? { kind: 'map' } };
  }
  const deck = phase.mode === 'upgrade' ? upgradeInDeck(run.deck, card) : removeFromDeck(run.deck, card);
  return { ...run, deck, phase: phase.resume ?? { kind: 'map' } };
}

function deckEditHasChoice(run: RunState, phase: Extract<RunState['phase'], { kind: 'deckEdit' }>): boolean {
  if (phase.mode === 'upgrade') return run.deck.some(canUpgrade);
  return run.deck.length > 1;
}
