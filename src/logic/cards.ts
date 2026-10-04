import type { CardDefinition, CardInstance, CardStack } from '../domain/card';

/** 同じ id のカードを枚数付きでまとめる。コスト順。 */
export function stackCards(cards: readonly CardDefinition[]): CardStack[] {
  const stacks = new Map<string, CardStack>();
  for (const card of cards) {
    const existing = stacks.get(card.id);
    if (existing) existing.count += 1;
    else stacks.set(card.id, { card, count: 1 });
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

/** 指定 id の最初の 1 枚を取り除いたデッキ。 */
export function removeFromDeck(deck: readonly CardDefinition[], cardId: string): CardDefinition[] {
  const index = deck.findIndex((card) => card.id === cardId);
  if (index < 0) return [...deck];
  return deck.filter((_, i) => i !== index);
}
