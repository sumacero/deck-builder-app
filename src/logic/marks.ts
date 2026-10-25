import type { CardDefinition, CardInstance, CardMark } from '../domain/card';
import type { Effect } from '../domain/effect';
import type { PlayerState } from '../domain/combat';

/** 画面とログで出す印の名前。説明文（describe）からも使う。 */
export const MARK_NAME: Record<CardMark, string> = {
  ice: '氷',
  drop: '雫',
  mist: '霞',
};

/** 段の上限。1 + 1 で 2、2 + 2 で 4。 */
export const MAX_STACK = 4;

/** 氷を重ねて消したとき、1 段あたり得る棘（茨の鎧）。戦闘中ずっと残る。 */
export const FUSE_THORNS_PER_STACK = 1;

/** この札の段（まとまっている枚数）。 */
export function stackOf(instance: CardInstance): number {
  return instance.stack ?? 1;
}

/** 重ねて消える側の札。段は相手に移したので、廃棄札では 1 段の札に戻す。 */
export function releaseFusion(instance: CardInstance): CardInstance {
  if (instance.stack === undefined) return instance;
  return { instanceId: instance.instanceId, card: instance.card };
}

/** 重ねられる札。印があり、アタックかスキル。 */
function isStackable(card: CardDefinition): boolean {
  return card.mark !== undefined && (card.type === 'attack' || card.type === 'skill');
}

/**
 * この札の上に重ねられる相手。同じ種類・同じ段で、重ねたあとも上限以下。
 * 印は違ってよい。
 */
export function stackPartners(hand: readonly CardInstance[], instance: CardInstance): CardInstance[] {
  if (!isStackable(instance.card)) return [];
  const stack = stackOf(instance);
  if (stack * 2 > MAX_STACK) return [];
  return hand.filter(
    (card) =>
      card.instanceId !== instance.instanceId &&
      isStackable(card.card) &&
      card.card.type === instance.card.type &&
      stackOf(card) === stack,
  );
}

/** source を target の上に重ねられるか。 */
export function canStackOnto(
  hand: readonly CardInstance[],
  source: CardInstance,
  target: CardInstance,
): boolean {
  return stackPartners(hand, target).some((card) => card.instanceId === source.instanceId);
}

export type MarkLink = {
  fromId: string;
  toId: string;
  fromMark: CardMark;
  toMark: CardMark;
};

/** 手札の波紋。focus があるときはその札と組める相手だけ。 */
export function markLinks(hand: readonly CardInstance[], focusId: string | null): MarkLink[] {
  const links: MarkLink[] = [];
  const seen = new Set<string>();
  for (const card of hand) {
    if (focusId && card.instanceId !== focusId) continue;
    const mark = card.card.mark;
    if (!mark) continue;
    for (const partner of stackPartners(hand, card)) {
      const partnerMark = partner.card.mark;
      if (!partnerMark) continue;
      const key = [card.instanceId, partner.instanceId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        fromId: card.instanceId,
        toId: partner.instanceId,
        fromMark: mark,
        toMark: partnerMark,
      });
    }
  }
  return links;
}

/** 段の倍率。1 段は 1 倍、2 段は 1.5 倍、4 段は 2 倍。深みは重ねた札（2 段以上）にだけ足す。 */
export function stackMultiplier(stack: number, depth: number): number {
  if (stack <= 1) return 1;
  return (stack >= MAX_STACK ? 2 : 1.5) + depth;
}

/** 手札のこの札を、いま使ったときの倍率。 */
export function handMultiplier(instance: CardInstance, player: PlayerState): number {
  return stackMultiplier(stackOf(instance), player.powers.stackDepth ?? 0);
}

const scale = (amount: number, multiplier: number) => Math.floor(amount * multiplier);

/**
 * 段の倍率をかけた効果。ダメージ・ブロック・デバフのターン数・霜・かわす・筋力を消す量・悪い効果を消す数・攻撃回数減。
 * ドローとエナジーは増やさない。印の無いカードはそのまま。
 */
export function scaledEffects(card: CardDefinition, multiplier: number): Effect[] {
  if (multiplier === 1 || card.mark === undefined) return card.effects;
  return card.effects.map((effect) => scaleEffect(effect, multiplier));
}

function scaleEffect(effect: Effect, multiplier: number): Effect {
  switch (effect.kind) {
    case 'damage':
    case 'block':
    case 'gainEndTurnBlock':
    case 'applyFrost':
    case 'gainEvade':
    case 'stripStrength':
    case 'cutHits':
    case 'discardFromHand':
    case 'exhaustFromHand':
      return { ...effect, amount: scale(effect.amount, multiplier) };
    case 'damagePerCardPlayed':
    case 'damagePerSkillPlayed':
    case 'damagePerAttackPlayed':
    case 'damagePerDiscard':
    case 'damagePerExhaust':
    case 'blockPerCardPlayed':
      return {
        ...effect,
        base: scale(effect.base, multiplier),
        perCard: scale(effect.perCard, multiplier),
      };
    case 'applyDebuff':
      return { ...effect, turns: scale(effect.turns, multiplier) };
    case 'cleanse':
      return { ...effect, count: scale(effect.count, multiplier) };
    case 'ifTargetHas':
      return { ...effect, effects: effect.effects.map((inner) => scaleEffect(inner, multiplier)) };
    default:
      return effect;
  }
}

/**
 * 重ねた瞬間の効果の狙い。
 * self = 自分、block = ブロックがある敵（複数なら選ぶ）、multiHit = 複数ヒット予告の敵（複数なら選ぶ）。
 */
export type FuseAim = 'self' | 'block' | 'multiHit';

export type FuseBurst = { effects: Effect[]; aim: FuseAim };

/** 重ねて消える札の印で決まる、重ねた瞬間の効果。量は消える札の段に比例。アタック／スキル共通。 */
export function fuseBurst(card: CardDefinition, stack: number): FuseBurst | null {
  switch (card.mark) {
    case 'ice':
      return {
        effects: [{ kind: 'gainPower', power: 'thorns', amount: FUSE_THORNS_PER_STACK * stack }],
        aim: 'self',
      };
    case 'drop':
      return { effects: [{ kind: 'halveBlock' }], aim: 'block' };
    case 'mist':
      return { effects: [{ kind: 'cutHits', amount: 1 }], aim: 'multiHit' };
    case undefined:
      return null;
  }
}
