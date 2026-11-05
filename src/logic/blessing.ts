import type { BlessingDefinition } from '../domain/blessing';
import { BLESSING_PATTERNS } from '../data/blessings';
import type { RunState } from '../domain/run';
import type { CardDefinition } from '../domain/card';
import { canStamp, canUpgrade, removeFromDeck, stampInDeck, upgradeInDeck } from './cards';
import { pickOne } from './random';
import { applyEffectsThenChoice, canApplyRunEffect, canMakeChoice } from './runEffects';

/** 選んでも何も起きない恩恵は出さない（強化できるカードが無いのに強化、など）。 */
function isUseful(run: RunState, blessing: BlessingDefinition): boolean {
  return (
    canMakeChoice(run, blessing.choice) &&
    blessing.effects.every((effect) => canApplyRunEffect(run, effect))
  );
}

/**
 * 今の章の贈り物を 4 組から 1 組選ぶ。1 組は 3 択。
 * 選んでも何も起きない選択肢だけ外す。全部外れた組は出さない。
 */
export function generateBlessingOptions(run: RunState): {
  options: BlessingDefinition[];
  seed: number;
  offer: string;
} {
  const act = run.actIndex + 1;
  const patterns = BLESSING_PATTERNS.filter((pattern) => pattern.act === act);
  const usable = patterns
    .map((pattern) => ({
      pattern,
      choices: pattern.choices.filter((blessing) => isUseful(run, blessing)),
    }))
    .filter((entry) => entry.choices.length > 0);
  const source = usable.length > 0 ? usable : patterns.map((pattern) => ({ pattern, choices: pattern.choices }));
  const picked = pickOne(source, run.rngSeed);
  const chosen = picked.item ?? source[0];
  return {
    options: chosen?.choices ?? [],
    seed: picked.seed,
    offer: chosen?.pattern.offer ?? '',
  };
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
  if (phase.mode === 'stamp') {
    const deck = stampInDeck(run.deck, card, phase.stamp);
    const remaining = phase.remaining - 1;
    const more = remaining > 0 && deck.some((next) => canStamp(next, phase.stamp));
    if (more) return { ...run, deck, phase: { ...phase, remaining } };
    return { ...run, deck, phase: phase.resume ?? { kind: 'map' } };
  }
  const deck = phase.mode === 'upgrade' ? upgradeInDeck(run.deck, card) : removeFromDeck(run.deck, card);
  return { ...run, deck, phase: phase.resume ?? { kind: 'map' } };
}

function deckEditHasChoice(run: RunState, phase: Extract<RunState['phase'], { kind: 'deckEdit' }>): boolean {
  if (phase.mode === 'upgrade') return run.deck.some(canUpgrade);
  if (phase.mode === 'stamp') return run.deck.some((card) => canStamp(card, phase.stamp));
  return run.deck.length > 1;
}
