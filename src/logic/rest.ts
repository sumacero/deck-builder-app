import type { RunState } from '../domain/run';
import { canUpgrade, upgradeInDeck } from './cards';

export function restHealAmount(run: RunState): number {
  const amount = Math.floor(run.player.maxHp * run.restHealRatio);
  return Math.min(amount, run.player.maxHp - run.player.hp);
}

export function hasUpgradableCard(run: RunState): boolean {
  return run.deck.some(canUpgrade);
}

/** 休む: HP を回復してマップへ。 */
export function rest(run: RunState): RunState {
  if (run.phase.kind !== 'rest') return run;
  return {
    ...run,
    player: { ...run.player, hp: run.player.hp + restHealAmount(run) },
    phase: { kind: 'map' },
  };
}

/** 鍛える: カードを 1 枚強化してマップへ。 */
export function smith(run: RunState, cardId: string): RunState {
  if (run.phase.kind !== 'rest') return run;
  const target = run.deck.find((card) => card.id === cardId);
  if (!target || !canUpgrade(target)) return run;
  return { ...run, deck: upgradeInDeck(run.deck, cardId), phase: { kind: 'map' } };
}
