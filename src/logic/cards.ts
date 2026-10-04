import type { CardDefinition, CardGrowth, CardInstance, CardStack, CardUpgrade } from '../domain/card';
import type { Effect } from '../domain/effect';

/** 同じ id のカードを枚数付きでまとめる（成長量が違えば別扱い）。コスト順。 */
export function stackCards(cards: readonly CardDefinition[]): CardStack[] {
  const stacks = new Map<string, CardStack>();
  for (const card of cards) {
    const key = `${card.id}#${card.timesGrown ?? 0}`;
    const existing = stacks.get(key);
    if (existing) existing.count += 1;
    else stacks.set(key, { card, count: 1 });
  }
  return [...stacks.values()].sort(
    (a, b) => a.card.cost - b.card.cost || a.card.name.localeCompare(b.card.name, 'ja'),
  );
}

export function stackInstances(cards: readonly CardInstance[]): CardStack[] {
  return stackCards(cards.map((c) => c.card));
}

export function canUpgrade(card: CardDefinition): boolean {
  return card.upgrade !== undefined && !card.upgraded;
}

const UPGRADED_SUFFIX = '+';

/** 強化後のカード id（`xxx+`）から、強化前の id を得る。 */
export const baseCardId = (id: string) =>
  id.endsWith(UPGRADED_SUFFIX) ? id.slice(0, -UPGRADED_SUFFIX.length) : id;

/** 強化後のカード定義。id と名前に + が付くので、強化前とは別のカードとして数える。 */
export function upgradeCard(card: CardDefinition): CardDefinition {
  if (!card.upgrade || card.upgraded) return card;
  const { upgrade, ...base } = card;
  return {
    ...base,
    ...upgrade,
    id: `${card.id}${UPGRADED_SUFFIX}`,
    name: `${card.name}${UPGRADED_SUFFIX}`,
    upgraded: true,
  };
}

/** 指定 id の最初の 1 枚を強化したデッキ。見つからない・強化できないなら元のまま。 */
export function upgradeInDeck(deck: readonly CardDefinition[], cardId: string): CardDefinition[] {
  const index = deck.findIndex((card) => card.id === cardId && canUpgrade(card));
  if (index < 0) return [...deck];
  return deck.map((card, i) => (i === index ? upgradeCard(card) : card));
}

/** 強化前の id が baseId のカードの枚数（強化済みも数える）。 */
export const countBase = (deck: readonly CardDefinition[], baseId: string) =>
  deck.filter((card) => baseCardId(card.id) === baseId).length;

/**
 * 強化前の id が fromId のカードを count 枚取り除き、into を加えたデッキ。強化していない方から使う。
 * 素材に強化済みが含まれていたら into も強化する。足りなければ null。
 */
export function fuseInDeck(
  deck: readonly CardDefinition[],
  fromId: string,
  count: number,
  into: CardDefinition,
): CardDefinition[] | null {
  const consumed = deck
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => baseCardId(card.id) === fromId)
    .sort((a, b) => Number(a.card.upgraded ?? false) - Number(b.card.upgraded ?? false))
    .slice(0, count);
  if (consumed.length < count) return null;
  const removed = new Set(consumed.map(({ index }) => index));
  const fused = consumed.some(({ card }) => card.upgraded) ? upgradeCard(into) : into;
  return [...deck.filter((_, index) => !removed.has(index)), fused];
}

function growEffect(effect: Effect, growth: CardGrowth): Effect {
  if (growth.stat === 'damage' && effect.kind === 'damage') {
    return { ...effect, amount: effect.amount + growth.amount };
  }
  if (growth.stat === 'block' && effect.kind === 'block') {
    return { ...effect, amount: effect.amount + growth.amount };
  }
  return effect;
}

/**
 * 強化後の効果を成長させる。強化で効果が変わらないカード（成長量だけ増えるなど）は effects を持たないので、
 * そのまま返す（effects: undefined を書き込むと、強化したときに元の効果を消してしまう）。
 */
function growUpgrade(upgrade: CardUpgrade, growth: CardGrowth): CardUpgrade {
  if (!upgrade.effects) return upgrade;
  return { ...upgrade, effects: upgrade.effects.map((effect) => growEffect(effect, upgrade.growth ?? growth)) };
}

/** 成長したカード。強化後の効果も同じだけ増やしておき、あとで強化しても成長が消えないようにする。 */
export function growCard(card: CardDefinition): CardDefinition {
  const { growth } = card;
  if (!growth) return card;
  return {
    ...card,
    effects: card.effects.map((effect) => growEffect(effect, growth)),
    upgrade: card.upgrade && growUpgrade(card.upgrade, growth),
    timesGrown: (card.timesGrown ?? 0) + 1,
  };
}

/** 指定 id の最初の 1 枚を取り除いたデッキ。 */
export function removeFromDeck(deck: readonly CardDefinition[], cardId: string): CardDefinition[] {
  const index = deck.findIndex((card) => card.id === cardId);
  if (index < 0) return [...deck];
  return deck.filter((_, i) => i !== index);
}
