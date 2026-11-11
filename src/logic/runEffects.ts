import type { RelicDefinition, RelicTier } from '../domain/relic';
import type { RunState } from '../domain/run';
import type { RunChoice, RunEffect } from '../domain/runEffect';
import {
  canStamp,
  canUpgrade,
  countBase,
  findBasicIndex,
  honeCard,
  isDefend,
  isStrike,
  toBerserk,
  upgradeCard,
  fuseInDeck,
} from './cards';
import { pickRewardChoices, rewardCandidates, rewardFocus } from './archetype';
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
    case 'addRandomCards':
      return addRandomCards(run, effect.count);
    case 'transformRandom':
      return transformRandomCards(run, effect.count);
    case 'removeBasics':
      return removeBasics(run, effect.strikes, effect.defends);
    case 'honeBasics':
      return { ...run, deck: run.deck.map((card) => honeCard(card, effect.amount)) };
    case 'upgradeAll':
      return { ...run, deck: run.deck.map(upgradeCard) };
    case 'upgradeStarters':
      return {
        ...run,
        deck: run.deck.map((card) => (isStrike(card) || isDefend(card) ? upgradeCard(card) : card)),
      };
    case 'berserkBasics':
      return berserkBasics(run);
    case 'addCurses':
      return {
        ...run,
        deck: [...run.deck, ...Array.from({ length: effect.count }, () => effect.card)],
      };
    case 'stampCards':
      return run;
    case 'gainNamedRelic':
      return run.relics.some((owned) => owned.id === effect.relic.id) ? run : obtainRelic(run, effect.relic);
  }
}

function addRandomCards(run: RunState, count: number): RunState {
  const offered = pickRewardChoices(
    rewardCandidates(run),
    run.deck,
    count,
    run.rngSeed,
    run.economy.cardTierWeight,
    rewardFocus(run),
  );
  return {
    ...run,
    rngSeed: offered.seed,
    deck: [...run.deck, ...attuneDeck(offered.items, run.agent.attribute)],
  };
}

function transformRandomCards(run: RunState, count: number): RunState {
  let seed = run.rngSeed;
  const deck = [...run.deck];
  for (let i = 0; i < count; i += 1) {
    const indexes = deck.flatMap((card, index) =>
      card.curse || card.unplayable || card.mysticArte ? [] : [index],
    );
    const picked = pickOne(indexes, seed);
    seed = picked.seed;
    if (picked.item === undefined) break;
    const offered = pickRewardChoices(rewardCandidates(run), deck, 1, seed, run.economy.cardTierWeight, rewardFocus(run));
    seed = offered.seed;
    const [next] = attuneDeck(offered.items, run.agent.attribute);
    if (next) deck[picked.item] = next;
  }
  return { ...run, rngSeed: seed, deck };
}

function removeBasics(run: RunState, strikes: number, defends: number): RunState {
  let deck = [...run.deck];
  const drop = (kind: 'strike' | 'defend', count: number) => {
    for (let i = 0; i < count; i += 1) {
      const index = findBasicIndex(deck, kind);
      if (index < 0) return;
      deck = deck.filter((_, at) => at !== index);
    }
  };
  drop('strike', strikes);
  drop('defend', defends);
  return { ...run, deck };
}

function berserkBasics(run: RunState): RunState {
  const deck = [...run.deck];
  const strike = findBasicIndex(deck, 'strike');
  const defend = findBasicIndex(deck, 'defend');
  if (strike >= 0 && deck[strike]) deck[strike] = toBerserk(deck[strike]);
  if (defend >= 0 && deck[defend]) deck[defend] = toBerserk(deck[defend]);
  return { ...run, deck };
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
    case 'addRandomCards':
      return true;
    case 'transformRandom':
      return run.deck.some((card) => !card.curse && !card.unplayable && !card.mysticArte);
    case 'removeBasics':
    case 'berserkBasics':
      return run.deck.some(isStrike) && run.deck.some(isDefend);
    case 'honeBasics':
      return run.deck.some((card) => isStrike(card) || isDefend(card));
    case 'upgradeAll':
      return run.deck.some(canUpgrade);
    case 'upgradeStarters':
      return run.deck.some((card) => (isStrike(card) || isDefend(card)) && canUpgrade(card));
    case 'addCurses':
      return true;
    case 'stampCards':
      return run.deck.filter((card) => canStamp(card, effect.stamp)).length >= effect.count;
    case 'gainNamedRelic':
      return !run.relics.some((owned) => owned.id === effect.relic.id);
    default:
      return true;
  }
}

export function canMakeChoice(run: RunState, choice: RunChoice | undefined): boolean {
  if (choice === undefined || choice === 'pickCard') return true;
  if (choice === 'upgradeCard') return run.deck.some(canUpgrade);
  return run.deck.length > 1;
}

/** 効果をかけ、choice があればカードを選ぶ画面へ。無ければ after の画面へ。 */
export function applyEffectsThenChoice(
  run: RunState,
  effects: readonly RunEffect[],
  choice: RunChoice | undefined,
  after: RunState['phase'],
): RunState {
  const stamp = effects.find((effect) => effect.kind === 'stampCards');
  const applied = effects.reduce(applyRunEffect, run);
  if (stamp?.kind === 'stampCards') {
    const followUp = after.kind === 'event' ? { cancellable: false, resume: after } : { cancellable: true };
    return {
      ...applied,
      phase: {
        kind: 'deckEdit',
        mode: 'stamp',
        stamp: stamp.stamp,
        remaining: stamp.count,
        ...followUp,
      },
    };
  }
  if (choice === undefined) return { ...applied, phase: after };
  // 出来事の選択肢は、カードを選び終えても選択肢の画面には戻さない。
  // 効果をすでに受け取った贈り物も、カード選びを飛ばせない（最大 HP だけ取って削除を避ける、などを防ぐ）。
  const paid = effects.some((effect) => effect.kind !== 'stampCards');
  const followUp =
    after.kind === 'event' ? { cancellable: false, resume: after } : { cancellable: !paid };
  if (choice === 'upgradeCard') return { ...applied, phase: { kind: 'deckEdit', mode: 'upgrade', ...followUp } };
  if (choice === 'removeCard') return { ...applied, phase: { kind: 'deckEdit', mode: 'remove', ...followUp } };
  return offerCardPick(applied, after);
}

/** 3 枚から 1 枚選んでデッキに加える（ゴールド・レリック無しの報酬画面）。 */
function offerCardPick(run: RunState, after: RunState['phase']): RunState {
  const offered = pickRewardChoices(
    rewardCandidates(run),
    run.deck,
    3,
    run.rngSeed,
    run.economy.cardTierWeight,
    rewardFocus(run),
  );
  const fromEvent = after.kind === 'event';
  if (offered.items.length === 0) return { ...run, rngSeed: offered.seed, phase: after };
  return {
    ...run,
    rngSeed: offered.seed,
    phase: {
      kind: 'reward',
      step: 'card',
      choices: offered.items,
      potionChoices: [],
      gold: 0,
      relic: null,
      next: 'map',
      canSkip: !fromEvent,
      ...(fromEvent ? { resume: after } : {}),
    },
  };
}
