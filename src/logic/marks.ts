import type { CardDefinition, CardInstance } from '../domain/card';
import type { Effect } from '../domain/effect';
import type { PlayerState } from '../domain/combat';

/** 段の上限。1 + 1 で 2、2 + 2 で 4。 */
export const MAX_STACK = 4;

/** この札の段（まとまっている枚数）。 */
export function stackOf(instance: CardInstance): number {
  return instance.stack ?? 1;
}

/** 重ねて消える側の札。段は相手に移したので、廃棄札では 1 段の札に戻す。 */
export function releaseFusion(instance: CardInstance): CardInstance {
  if (instance.stack === undefined) return instance;
  return { instanceId: instance.instanceId, card: instance.card };
}

/** 重ねられる札。水札で、アタックかスキル。 */
function isStackable(card: CardDefinition): boolean {
  return card.water === true && (card.type === 'attack' || card.type === 'skill');
}

/**
 * この札の上に重ねられる相手。同じ種類・同じ段で、重ねたあとも上限以下。
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
};

/** 手札で重ねられる組。focus があるときはその札と組める相手だけ。 */
export function markLinks(hand: readonly CardInstance[], focusId: string | null): MarkLink[] {
  const links: MarkLink[] = [];
  const seen = new Set<string>();
  for (const card of hand) {
    if (focusId && card.instanceId !== focusId) continue;
    if (!isStackable(card.card)) continue;
    for (const partner of stackPartners(hand, card)) {
      const key = [card.instanceId, partner.instanceId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ fromId: card.instanceId, toId: partner.instanceId });
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
 * ドローとエナジーは増やさない。水札で無いカードはそのまま。
 */
export function scaledEffects(card: CardDefinition, multiplier: number): Effect[] {
  if (multiplier === 1 || card.water !== true) return card.effects;
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

/** 重ねて消える札の段に、水面の分を足した水力。 */
export function waterFromFusion(consumedStack: number, echo: number): number {
  return consumedStack + echo;
}
