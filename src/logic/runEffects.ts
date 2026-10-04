import type { RelicDefinition, RelicTier } from '../domain/relic';
import type { RunState } from '../domain/run';
import type { RunChoice, RunEffect } from '../domain/runEffect';
import { canUpgrade, countBase, fuseInDeck, upgradeCard } from './cards';
import { draftPool, pickRewardChoices } from './archetype';
import { attuneDeck } from './attribute';
import { pickOne, shuffle } from './random';
import { pickWeightedRelic, weightsFor } from './relics';

/** pool のうち、まだ持っていないレリック。 */
export function unownedRelics(run: RunState, pool: readonly RelicDefinition[]): RelicDefinition[] {
  const owned = new Set(run.relics.map((relic) => relic.id));
  return pool.filter((relic) => !owned.has(relic.id));
}

/** レリックを所持品に加え、入手時の効果（毎ターンのエナジーなど）をかける。 */
export function obtainRelic(run: RunState, relic: RelicDefinition): RunState {
  const added: RunState = { ...run, relics: [...run.relics, relic] };
  return (relic.onObtain ?? []).reduce(applyRunEffect, added);
}

/**
 * まだ持っていないレリックを、レア度の出現率に従って 1 つ与える。tier を指定するとそのレア度から。
 * 候補が尽きていたら代わりにゴールド。
 */
export function grantRandomRelic(
  run: RunState,
  tier?: RelicTier,
): { run: RunState; relic: RelicDefinition | null } {
  const pool = unownedRelics(run, run.relicPool);
  const picked = pickWeightedRelic(pool, weightsFor(run.economy.relicTierWeight, pool, tier), run.rngSeed);
  if (!picked.item) {
    return {
      run: { ...run, rngSeed: picked.seed, gold: run.gold + run.economy.relicFallbackGold },
      relic: null,
    };
  }
  return { run: obtainRelic({ ...run, rngSeed: picked.seed }, picked.item), relic: picked.item };
}

/** 強化できるカードからランダムに count 枚を強化する。 */
export function upgradeRandomCards(run: RunState, count: number): RunState {
  const indices = run.deck.flatMap((card, index) => (canUpgrade(card) ? [index] : []));
  const shuffled = shuffle(indices, run.rngSeed);
  const chosen = new Set(shuffled.items.slice(0, count));
  return {
    ...run,
    rngSeed: shuffled.seed,
    deck: run.deck.map((card, index) => (chosen.has(index) ? upgradeCard(card) : card)),
  };
}

/** 空いているポーション枠をランダムなポーションで埋める。 */
export function fillPotionSlots(run: RunState): RunState {
  let seed = run.rngSeed;
  const potions = run.potions.map((slot) => {
    if (slot) return slot;
    const picked = pickOne(run.potionPool, seed);
    seed = picked.seed;
    return picked.item ?? null;
  });
  return { ...run, rngSeed: seed, potions };
}

/** 毎ターンのエナジー・ドローは、どんな代償でも 1 未満にはしない。 */
const MIN_PER_TURN = 1;

export function applyRunEffect(run: RunState, effect: RunEffect): RunState {
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
    case 'heal':
      return {
        ...run,
        player: { ...run.player, hp: Math.min(run.player.maxHp, run.player.hp + effect.amount) },
      };
    case 'loseHp':
      return { ...run, player: { ...run.player, hp: Math.max(1, run.player.hp - effect.amount) } };
    case 'gainGold':
      return { ...run, gold: run.gold + effect.amount };
    case 'loseGold':
      return { ...run, gold: Math.max(0, run.gold - effect.amount) };
    case 'gainRelic':
      return grantRandomRelic(run, effect.tier).run;
    case 'addCard':
      return { ...run, deck: [...run.deck, ...attuneDeck([effect.card], run.agent.attribute)] };
    case 'upgradeRandom':
      return upgradeRandomCards(run, effect.count);
    case 'fillPotions':
      return fillPotionSlots(run);
    case 'changeEnergyPerTurn':
      return { ...run, energyPerTurn: Math.max(MIN_PER_TURN, run.energyPerTurn + effect.amount) };
    case 'changeDrawPerTurn':
      return { ...run, drawPerTurn: Math.max(MIN_PER_TURN, run.drawPerTurn + effect.amount) };
    case 'fuseCards': {
      const [into] = attuneDeck([effect.into], run.agent.attribute);
      const deck = fuseInDeck(run.deck, effect.from.id, effect.count, into);
      return deck ? { ...run, deck } : run;
    }
  }
}

/**
 * 今の状態でこの効果を選べるか。払えない代償（足りないゴールド、HP が尽きる）や、
 * 選んでも何も起きないもの（強化できるカードが無いのに強化など）は選べない。
 */
export function canApplyRunEffect(run: RunState, effect: RunEffect): boolean {
  switch (effect.kind) {
    case 'loseMaxHp':
      return run.player.maxHp > effect.amount;
    case 'loseHp':
      return run.player.hp > effect.amount;
    case 'loseGold':
      return run.gold >= effect.amount;
    case 'upgradeRandom':
      return run.deck.some(canUpgrade);
    case 'fillPotions':
      return run.potions.includes(null);
    case 'fuseCards':
      return countBase(run.deck, effect.from.id) >= effect.count;
    default:
      return true;
  }
}

export function canMakeChoice(run: RunState, choice: RunChoice | undefined): boolean {
  switch (choice) {
    case 'upgradeCard':
      return run.deck.some(canUpgrade);
    case 'removeCard':
      return run.deck.length > 1;
    case 'pickCard':
    case undefined:
      return true;
  }
}

/** 効果をかけ、choice があればカードを選ぶ画面へ。無ければ after の画面へ。 */
export function applyEffectsThenChoice(
  run: RunState,
  effects: readonly RunEffect[],
  choice: RunChoice | undefined,
  after: RunState['phase'],
): RunState {
  const applied = effects.reduce(applyRunEffect, run);
  switch (choice) {
    case undefined:
      return { ...applied, phase: after };
    case 'upgradeCard':
      return { ...applied, phase: { kind: 'deckEdit', mode: 'upgrade' } };
    case 'removeCard':
      return { ...applied, phase: { kind: 'deckEdit', mode: 'remove' } };
    case 'pickCard':
      return offerCardPick(applied);
  }
}

/** 3 枚から 1 枚選んでデッキに加える（ゴールド・レリック無しの報酬画面）。 */
function offerCardPick(run: RunState): RunState {
  const offered = pickRewardChoices(draftPool(run), run.deck, 3, run.rngSeed);
  return {
    ...run,
    rngSeed: offered.seed,
    phase: { kind: 'reward', choices: offered.items, gold: 0, relic: null, next: 'map' },
  };
}
