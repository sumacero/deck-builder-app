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

/** 重ねた瞬間の効果の、消える札 1 段あたりの量。 */
export const FUSE_FROST_PER_STACK = 2;
export const FUSE_STRIP_PER_STACK = 3;

/** この札の段（まとまっている枚数）。 */
export function stackOf(instance: CardInstance): number {
  return instance.stack ?? 1;
}

/** 重ねて消える側の札。段は相手に移したので、捨て札では 1 段の札に戻す。 */
export function releaseFusion(instance: CardInstance): CardInstance {
  if (instance.stack === undefined) return instance;
  return { instanceId: instance.instanceId, card: instance.card };
}

/** 重ねられる札。印があり、アタックかスキル。 */
const isStackable = (card: CardDefinition) =>
  card.mark !== undefined && (card.type === 'attack' || card.type === 'skill');

/**
 * この札を重ねられる手札の相手。印があり、種類（アタック・スキル）と段が同じ札。印は違ってよい。
 * 重ねたあとの段が MAX_STACK を超える相手は除く。
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

/** ドラッグした札を、相手の上に重ねられるか。相手が stackPartners に入っているときだけ。 */
export function canStackOnto(
  hand: readonly CardInstance[],
  source: CardInstance,
  target: CardInstance,
): boolean {
  return stackPartners(hand, source).some((card) => card.instanceId === target.instanceId);
}

export type MarkLink = {
  fromId: string;
  toId: string;
  fromMark: CardMark;
  toMark: CardMark;
};

/**
 * 手札に波紋を引く組。
 * focus が無いときは、どの札を重ねても結ばれる組を全部（摘む前）。
 * あるときは、その札を重ねられる相手だけ（摘んだとき）。
 */
export function markLinks(hand: readonly CardInstance[], focusId: string | null): MarkLink[] {
  const sources = focusId ? hand.filter((card) => card.instanceId === focusId) : hand;
  const seen = new Set<string>();
  const links: MarkLink[] = [];
  for (const source of sources) {
    const mark = source.card.mark;
    if (!mark) continue;
    for (const partner of stackPartners(hand, source)) {
      const other = partner.card.mark;
      if (!other) continue;
      const key = [source.instanceId, partner.instanceId].sort().join('\0');
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ fromId: source.instanceId, toId: partner.instanceId, fromMark: mark, toMark: other });
    }
  }
  return links;
}

/** 段の倍率。1 段は 1 倍、2 段は 2 倍、4 段は 3 倍。深みは重ねた札（2 段以上）にだけ足す。 */
export function stackMultiplier(stack: number, depth: number): number {
  if (stack <= 1) return 1;
  return (stack >= MAX_STACK ? 3 : 2) + depth;
}

/** 手札のこの札を、いま使ったときの倍率。 */
export function handMultiplier(instance: CardInstance, player: PlayerState): number {
  return stackMultiplier(stackOf(instance), player.powers.stackDepth ?? 0);
}

const scale = (amount: number, multiplier: number) => amount * multiplier;

/**
 * 段の倍率をかけた効果。ダメージ・ブロック・デバフのターン数・霜・かわす・筋力を消す量・悪い効果を消す数。
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
      return { ...effect, amount: scale(effect.amount, multiplier) };
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
 * 重ねた瞬間の効果の狙い。threat = 予告の攻撃が一番大きい敵、strongest = 筋力が一番高い敵、self = 自分。
 * 札を重ねるドラッグの先は札なので、敵は指で選ばない。
 */
export type FuseAim = 'threat' | 'strongest' | 'self';

export type FuseBurst = { effects: Effect[]; aim: FuseAim };

/** 重ねて消える札の印と種類で決まる、重ねた瞬間の効果。量は消える札の段に比例する。 */
export function fuseBurst(card: CardDefinition, stack: number): FuseBurst | null {
  switch (card.mark) {
    case 'ice':
      return { effects: [{ kind: 'applyFrost', amount: FUSE_FROST_PER_STACK * stack }], aim: 'threat' };
    case 'drop':
      return { effects: [{ kind: 'draw', amount: stack }], aim: 'self' };
    case 'mist':
      return card.type === 'attack'
        ? { effects: [{ kind: 'stripStrength', amount: FUSE_STRIP_PER_STACK * stack }], aim: 'strongest' }
        : { effects: [{ kind: 'cleanse', count: stack }], aim: 'self' };
    case undefined:
      return null;
  }
}
