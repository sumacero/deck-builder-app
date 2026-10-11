import type { BlessingDefinition, BlessingGroup } from '../domain/blessing';
import type { RunState } from '../domain/run';
import type { CardDefinition } from '../domain/card';
import { remarkInDeck, removeFromDeck, upgradeInDeck } from './cards';
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

/** 恩恵・イベントで選んだカードを強化・削除・印の書き換えしてマップへ。card が null ならやめる。 */
export function finishDeckEdit(run: RunState, card: CardDefinition | null): RunState {
  if (run.phase.kind !== 'deckEdit') return run;
  if (card === null) return { ...run, phase: { kind: 'map' } };
  const phase = run.phase;
  if (phase.mode === 'upgrade') return { ...run, deck: upgradeInDeck(run.deck, card), phase: { kind: 'map' } };
  if (phase.mode === 'remove') return { ...run, deck: removeFromDeck(run.deck, card), phase: { kind: 'map' } };
  return { ...run, deck: remarkInDeck(run.deck, card, phase.mark), phase: { kind: 'map' } };
}
