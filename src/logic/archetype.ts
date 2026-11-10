import type { Archetype, CardDefinition, CardRarity } from '../domain/card';
import type { RunState } from '../domain/run';
import { isDraftable } from './attribute';
import { pickWeightedCards, shuffleCards } from './cardRarity';
import { encounterLeader } from './encounter';

/** 今の章（1 始まり）。 */
export const actNumber = (run: RunState): number => run.actIndex + 1;

/** この章で出してよいカード。minAct より前の札はまだ出ていない。 */
export function cardsForAct(pool: readonly CardDefinition[], act: number): CardDefinition[] {
  return pool.filter((card) => (card.minAct ?? 1) <= act);
}

/**
 * ショップと、軸が決まっていないときの候補。
 * 違う属性のカードは出さない。軸の決め手（archetypePayoff）も除く。
 */
export const draftPool = (run: RunState): CardDefinition[] =>
  cardsForAct(run.rewardPool, actNumber(run)).filter(
    (card) => isDraftable(card, run.agent) && !card.archetypePayoff,
  );

/** 戦闘報酬・出来事の 3 択。軸の決め手も、その章になっていれば含む。 */
export const rewardCandidates = (run: RunState): CardDefinition[] =>
  cardsForAct(run.rewardPool, actNumber(run)).filter((card) => isDraftable(card, run.agent));

export type ArchetypeCount = { archetype: Archetype; count: number };

/** デッキに入っている軸ごとの枚数（多い順）。 */
export function deckArchetypes(deck: readonly CardDefinition[]): ArchetypeCount[] {
  const counts = new Map<Archetype, number>();
  for (const card of deck) {
    for (const archetype of card.archetypes ?? []) counts.set(archetype, (counts.get(archetype) ?? 0) + 1);
  }
  return [...counts]
    .map(([archetype, count]) => ({ archetype, count }))
    .sort((a, b) => b.count - a.count);
}

/** この枚数以上そろった軸を「デッキの軸」とみなす（初期デッキの強打 1 枚だけでは偏らせない）。 */
export const ARCHETYPE_THRESHOLD = 2;

/** デッキの軸。まだ決まっていなければ null。 */
export function mainArchetype(deck: readonly CardDefinition[]): Archetype | null {
  const [top] = deckArchetypes(deck);
  return top && top.count >= ARCHETYPE_THRESHOLD ? top.archetype : null;
}

/** 第3章の報酬で、1枠をボスへの答えにする。 */
export type RewardFocus = { act: number; bossId: string };

export function rewardFocus(run: RunState): RewardFocus {
  return { act: actNumber(run), bossId: encounterLeader(run.boss).id };
}

/** ボス本体に鉄鱗（1発の上限）が付く章ボス。答えは、1枚で2回以上殴る札。 */
const HIT_CAP_BOSSES = new Set(['flame-dragon', 'storm-griffin', 'ice-leviathan', 'engine-beast']);

const answersHitCap = (card: CardDefinition): boolean =>
  card.effects.some((effect) => effect.kind === 'damage' && (effect.hits ?? 1) >= 2);

/**
 * 報酬の候補。レア度の重みで選ぶ（強いカードほど出にくい）。
 * 第1章と第2章は、デッキの軸が決まっていれば、そのうち 1 枚を軸に合うカードにする
 * （その 1 枚も、軸の中でレア度の重みに従う）。
 * 第3章は軸を押し付けない。1 枚は、その章のボスに通る多段の札にする。残りは全体の重みのまま。
 * 並びは混ぜて、決まった札がいつも左に来ないようにする。
 */
export function pickRewardChoices(
  pool: readonly CardDefinition[],
  deck: readonly CardDefinition[],
  count: number,
  seed: number,
  weights: Record<CardRarity, number>,
  focus?: RewardFocus,
): { items: CardDefinition[]; seed: number } {
  if (focus && focus.act >= 3) {
    const answers = HIT_CAP_BOSSES.has(focus.bossId) ? pool.filter(answersHitCap) : [];
    const counter = answers.length > 0 ? pickWeightedCards(answers, 1, weights, seed) : { items: [], seed };
    const rest = pickWeightedCards(
      pool.filter((card) => !counter.items.includes(card)),
      count - counter.items.length,
      weights,
      counter.seed,
    );
    return shuffleCards([...counter.items, ...rest.items], rest.seed);
  }
  const filler = pool.filter((card) => !card.archetypePayoff);
  const source = filler.length > 0 ? filler : pool;
  const archetype = mainArchetype(deck);
  const payoffs = archetype
    ? pool.filter((card) => card.archetypePayoff && card.archetypes?.includes(archetype))
    : [];
  const matching = archetype ? source.filter((card) => card.archetypes?.includes(archetype)) : [];
  const synergyPool = payoffs.length > 0 ? payoffs : matching;
  if (synergyPool.length === 0) return pickWeightedCards(source, count, weights, seed);
  const synergy = pickWeightedCards(synergyPool, 1, weights, seed);
  const rest = pickWeightedCards(
    source.filter((card) => !synergy.items.includes(card)),
    count - synergy.items.length,
    weights,
    synergy.seed,
  );
  return shuffleCards([...synergy.items, ...rest.items], rest.seed);
}
