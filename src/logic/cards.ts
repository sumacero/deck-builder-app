import type { CardDefinition, CardGrowth, CardInstance, CardStack, CardUpgrade } from '../domain/card';
import type { Effect } from '../domain/effect';
import type { CardStamp } from '../domain/runEffect';

/** 同じカードでも成長回数が違えば別の山。削除で、どれを選んだか分かるようにする。 */
/** 性質や数値が違う同じ id は、別の山にする。 */
export function cardStackKey(card: CardDefinition): string {
  const numbers = card.effects
    .map((effect) =>
      effect.kind === 'damage' || effect.kind === 'block' ? `${effect.kind}${effect.amount}` : effect.kind,
    )
    .join(',');
  return [
    card.id,
    card.timesGrown ?? 0,
    card.sly ? 'sly' : '',
    card.innate ? 'innate' : '',
    card.retain ? 'retain' : '',
    card.priority ? 'priority' : '',
    numbers,
  ].join('#');
}

/** 同じ id・成長回数の 1 枚。強化の有無は id の末尾で分かれる。 */
export function cardsMatch(a: CardDefinition, b: CardDefinition): boolean {
  return a.id === b.id && (a.timesGrown ?? 0) === (b.timesGrown ?? 0);
}

/** 同じ id のカードを枚数付きでまとめる（成長量が違えば別扱い）。コスト順。 */
export function stackCards(cards: readonly CardDefinition[]): CardStack[] {
  const stacks = new Map<string, CardStack>();
  for (const card of cards) {
    const key = cardStackKey(card);
    const existing = stacks.get(key);
    if (existing) existing.count += 1;
    else stacks.set(key, { card, count: 1 });
  }
  return [...stacks.values()].sort(
    (a, b) => a.card.cost - b.card.cost || a.card.name.localeCompare(b.card.name, 'ja'),
  );
}

/**
 * 戦闘中の山を、枚数付きでまとめる。手札で重ねた札は、重ね方が同じものだけを同じ山にする。
 * describe を渡すと、重ねた札にその数字を載せる。
 */
export function stackInstances(
  cards: readonly CardInstance[],
  describe?: (instance: CardInstance) => string,
): CardStack[] {
  const stacks = new Map<string, CardStack>();
  for (const instance of cards) {
    const stack = instance.stack ?? 1;
    const key = `${cardStackKey(instance.card)}#${stack}`;
    const existing = stacks.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    stacks.set(key, {
      card: instance.card,
      count: 1,
      ...(stack > 1 ? { stack, ...(describe ? { description: describe(instance) } : {}) } : {}),
    });
  }
  return [...stacks.values()].sort(
    (a, b) =>
      a.card.cost - b.card.cost ||
      a.card.name.localeCompare(b.card.name, 'ja') ||
      (a.stack ?? 1) - (b.stack ?? 1),
  );
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

/** 選んだ 1 枚を強化したデッキ。見つからない・強化できないなら元のまま。 */
export function upgradeInDeck(deck: readonly CardDefinition[], target: CardDefinition): CardDefinition[] {
  const index = deck.findIndex((card) => cardsMatch(card, target) && canUpgrade(card));
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

const BASIC_IDS = { strike: 'strike', defend: 'defend' } as const;

export function isStrike(card: CardDefinition): boolean {
  return baseCardId(card.id) === BASIC_IDS.strike;
}

export function isDefend(card: CardDefinition): boolean {
  return baseCardId(card.id) === BASIC_IDS.defend;
}

/** 性質を足せるカードか。呪い・使えない札・秘奥義には足さない。 */
export function canStamp(card: CardDefinition, stamp: CardStamp): boolean {
  if (card.curse || card.unplayable || card.mysticArte) return false;
  switch (stamp) {
    case 'replay':
      return !card.effects.some((effect) => effect.kind === 'gainReplay');
    case 'sly':
      return card.sly !== true;
    case 'innate':
      return card.innate !== true;
    case 'retain':
      return card.retain !== true && card.ethereal !== true;
  }
}

const REPLAY: Effect = { kind: 'gainReplay' };

function withReplay(card: CardDefinition): CardDefinition {
  if (!canStamp(card, 'replay')) return card;
  const upgrade = card.upgrade?.effects
    ? { ...card.upgrade, effects: [...card.upgrade.effects, REPLAY] }
    : card.upgrade;
  return { ...card, effects: [...card.effects, REPLAY], upgrade };
}

/** カードに性質を 1 つ足す。足せないときは元のまま。 */
export function stampCard(card: CardDefinition, stamp: CardStamp): CardDefinition {
  switch (stamp) {
    case 'replay':
      return withReplay(card);
    case 'sly':
      return canStamp(card, stamp) ? { ...card, sly: true } : card;
    case 'innate':
      return canStamp(card, stamp) ? { ...card, innate: true } : card;
    case 'retain':
      return canStamp(card, stamp) ? { ...card, retain: true } : card;
  }
}

/** 選んだ 1 枚に性質を足したデッキ。 */
export function stampInDeck(
  deck: readonly CardDefinition[],
  target: CardDefinition,
  stamp: CardStamp,
): CardDefinition[] {
  const index = deck.findIndex((card) => cardsMatch(card, target) && canStamp(card, stamp));
  if (index < 0) return [...deck];
  return deck.map((card, i) => (i === index ? stampCard(card, stamp) : card));
}

function mapStat(effects: readonly Effect[], stat: 'damage' | 'block', bonus: number): Effect[] {
  return effects.map((effect) =>
    effect.kind === stat ? { ...effect, amount: effect.amount + bonus } : effect,
  );
}

function scaleStat(effects: readonly Effect[], stat: 'damage' | 'block'): Effect[] {
  return effects.map((effect) =>
    effect.kind === stat ? { ...effect, amount: effect.amount * 2 } : effect,
  );
}

/** ストライクのダメージと、防御のブロックを amount ずつ増やす。強化後の数値も同じだけ増やす。 */
export function honeCard(card: CardDefinition, amount: number): CardDefinition {
  const stat = isStrike(card) ? 'damage' : isDefend(card) ? 'block' : null;
  if (!stat) return card;
  const upgrade = card.upgrade?.effects
    ? { ...card.upgrade, effects: mapStat(card.upgrade.effects, stat, amount) }
    : card.upgrade;
  return { ...card, effects: mapStat(card.effects, stat, amount), upgrade };
}

/** ストライクか防御を、手札にあるあいだ他の札を止める狂鬼の札にする。数値は 2 倍。 */
export function toBerserk(card: CardDefinition): CardDefinition {
  const strike = isStrike(card);
  if (!strike && !isDefend(card)) return card;
  const stat = strike ? 'damage' : 'block';
  const id = strike ? 'berserk-strike' : 'berserk-defend';
  const name = strike ? '狂鬼のストライク' : '狂鬼の防御';
  const upgrade = card.upgrade?.effects
    ? { ...card.upgrade, effects: scaleStat(card.upgrade.effects, stat) }
    : card.upgrade;
  return {
    ...card,
    id: card.upgraded ? `${id}+` : id,
    name: card.upgraded ? `${name}+` : name,
    art: card.art ?? (strike ? 'ultimate-strike' : 'steadfast-guard'),
    priority: true,
    effects: scaleStat(card.effects, stat),
    upgrade,
  };
}

/** 強化していない方から 1 枚の位置を返す。無ければ -1。 */
export function findBasicIndex(deck: readonly CardDefinition[], kind: 'strike' | 'defend'): number {
  const match = kind === 'strike' ? isStrike : isDefend;
  const plain = deck.findIndex((card) => match(card) && !card.upgraded);
  if (plain >= 0) return plain;
  return deck.findIndex(match);
}

/** 選んだ 1 枚を取り除いたデッキ。 */
export function removeFromDeck(deck: readonly CardDefinition[], target: CardDefinition): CardDefinition[] {
  const index = deck.findIndex((card) => cardsMatch(card, target));
  if (index < 0) return [...deck];
  return deck.filter((_, i) => i !== index);
}
