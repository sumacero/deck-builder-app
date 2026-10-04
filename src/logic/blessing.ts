import type { BlessingDefinition, BlessingEffect, BlessingGroup } from '../domain/blessing';
import type { RunState } from '../domain/run';
import { canUpgrade, removeFromDeck, upgradeInDeck } from './cards';
import { fillPotionSlots, grantRandomRelic, upgradeRandomCards } from './loot';
import { pickOne, pickUnique } from './random';

const GROUP_ORDER: readonly BlessingGroup[] = ['deck', 'resource', 'tradeoff'];

/** 選んでも何も起きない恩恵は出さない（強化できるカードが無いのに強化、など）。 */
function isUseful(run: RunState, blessing: BlessingDefinition): boolean {
  const hasUpgradable = run.deck.some(canUpgrade);
  const effectUseful = (effect: BlessingEffect) => {
    switch (effect.kind) {
      case 'upgradeRandom':
        return hasUpgradable;
      case 'fillPotions':
        return run.potions.includes(null);
      case 'loseMaxHp':
        return run.player.maxHp > effect.amount;
      default:
        return true;
    }
  };
  const choiceUseful =
    blessing.choice === 'upgradeCard'
      ? hasUpgradable
      : blessing.choice === 'removeCard'
        ? run.deck.length > 1
        : true;
  return choiceUseful && blessing.effects.every(effectUseful);
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

function applyBlessingEffect(run: RunState, effect: BlessingEffect): RunState {
  switch (effect.kind) {
    case 'gainMaxHp':
      return {
        ...run,
        player: { hp: run.player.hp + effect.amount, maxHp: run.player.maxHp + effect.amount },
      };
    case 'loseMaxHp': {
      const maxHp = Math.max(1, run.player.maxHp - effect.amount);
      return { ...run, player: { maxHp, hp: Math.min(run.player.hp, maxHp) } };
    }
    case 'gainGold':
      return { ...run, gold: run.gold + effect.amount };
    case 'gainRelic':
      return grantRandomRelic(run).run;
    case 'upgradeRandom':
      return upgradeRandomCards(run, effect.count);
    case 'fillPotions':
      return fillPotionSlots(run);
  }
}

export function chooseBlessing(run: RunState, blessingId: string): RunState {
  if (run.phase.kind !== 'blessing') return run;
  const blessing = run.phase.options.find((b) => b.id === blessingId);
  if (!blessing) return run;

  const applied = blessing.effects.reduce(applyBlessingEffect, run);
  switch (blessing.choice) {
    case undefined:
      return { ...applied, phase: { kind: 'map' } };
    case 'upgradeCard':
      return { ...applied, phase: { kind: 'deckEdit', mode: 'upgrade' } };
    case 'removeCard':
      return { ...applied, phase: { kind: 'deckEdit', mode: 'remove' } };
    case 'pickCard': {
      const offered = pickUnique(applied.rewardPool, 3, applied.rngSeed);
      return {
        ...applied,
        rngSeed: offered.seed,
        phase: { kind: 'reward', choices: offered.items, gold: 0, relic: null, next: 'map' },
      };
    }
  }
}

/** 恩恵で選んだカードを強化・削除してマップへ。cardId が null ならやめる。 */
export function finishDeckEdit(run: RunState, cardId: string | null): RunState {
  if (run.phase.kind !== 'deckEdit') return run;
  if (cardId === null) return { ...run, phase: { kind: 'map' } };
  const deck =
    run.phase.mode === 'upgrade' ? upgradeInDeck(run.deck, cardId) : removeFromDeck(run.deck, cardId);
  return { ...run, deck, phase: { kind: 'map' } };
}
