import type { CardDefinition, CardInstance, CardMark } from '../domain/card';
import type { Effect } from '../domain/effect';
import type { PlayerState } from '../domain/combat';
/** 画面とログで出す印の名前。説明文（describe）からも使う。 */
export const MARK_NAME: Record<CardMark, string> = {
  rain: '雨',
  wave: '波',
  ice: '氷',
};

/** 深みを足したあとの上限。通常は 3 倍、深み 1 で 4 倍まで。 */
const MARK_MULTIPLIER_CAP = 4;

/** 手札でこの札に重ねた枚数。使ったとき、この数だけ水分身が増える。文鎮の覚えは含まない。 */
export function cloneCount(instance: CardInstance): number {
  return (instance.sameFused ?? 0) + (instance.rainbowFused ?? 0);
}

/** 手札を離れるとき、重ねた枚数を消す。山札に戻った札は、また 1 枚の札として引ける。 */
export function releaseFusion(instance: CardInstance): CardInstance {
  if (instance.sameFused === undefined && instance.rainbowFused === undefined) return instance;
  return { instanceId: instance.instanceId, card: instance.card };
}

/**
 * この札を重ねられる手札の相手。
 * 同じ印がほかにあれば、その全部。無ければ、この札が同じ印をまだ重ねておらず、
 * 手札に三つの印が揃っているときだけ、ほかの印の札。その相手も、手札に同じ印がほかに無く、
 * まだ何も重ねていないものに限る（同じ印同士で重ねられる札には、別の印は重ねない）。
 */
export function stackPartners(hand: readonly CardInstance[], instance: CardInstance): CardInstance[] {
  const mark = instance.card.mark;
  if (!mark) return [];
  const others = hand.filter((card) => card.instanceId !== instance.instanceId && card.card.mark !== undefined);
  const same = others.filter((card) => card.card.mark === mark);
  if (same.length > 0) return same;
  if ((instance.sameFused ?? 0) > 0 || !handHasRainbow(hand)) return [];
  return others.filter(
    (card) =>
      cloneCount(card) === 0 &&
      !others.some((other) => other.instanceId !== card.instanceId && other.card.mark === card.card.mark),
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
      links.push({
        fromId: source.instanceId,
        toId: partner.instanceId,
        fromMark: mark,
        toMark: other,
      });
    }
  }
  return links;
}

/** 使おうとしているカードも含めて、手札に三つの印が揃っている。 */
export function handHasRainbow(hand: readonly CardInstance[]): boolean {
  const marks = new Set<CardMark>();
  for (const card of hand) {
    if (card.card.mark) marks.add(card.card.mark);
  }
  return marks.has('rain') && marks.has('wave') && marks.has('ice');
}

/**
 * 雨・波の倍率。ほかが 0 枚なら 1、1 枚なら 2、2 枚以上なら 3。深みで 1 段階上がり、4 で頭打ち。
 * まだ 1 倍のときだけ、三印が揃っていれば 2 倍にする（専門の倍率とは重ねない）。
 */
export function markMultiplier(others: number, depth: number, rainbow: boolean): number {
  const base = others <= 0 ? 1 : others === 1 ? 2 : 3;
  const raised = Math.min(MARK_MULTIPLIER_CAP, base + depth);
  if (raised === 1 && rainbow) return Math.min(MARK_MULTIPLIER_CAP, 2 + depth);
  return raised;
}

export type MarkPlay = {
  /** 雨のダメージ、波のブロックにかける数。氷と印の無いカードは 1。 */
  multiplier: number;
  /** 氷だけ。ほかの氷が 1 枚以上なら 1。それ以上は増えない。 */
  iceEnergy: number;
  /** 氷だけ。ほかの氷が 2 枚以上なら 1。 */
  iceDraw: number;
};

/**
 * 手札に重ねた枚数と、文鎮の覚え・水面から、使うときの倍率を決める。
 * 水分身は cloneCount。覚えだけでは水分身は増えない。
 */
export function stackedMarkPlay(instance: CardInstance, player: PlayerState): MarkPlay {
  const mark = instance.card.mark;
  if (!mark) return { multiplier: 1, iceEnergy: 0, iceDraw: 0 };
  const same = instance.sameFused ?? 0;
  const memory = (player.markMemory[mark] ?? 0) + (player.powers.markCount ?? 0);
  const others = same + memory;
  const rainbow = (instance.rainbowFused ?? 0) > 0 && others === 0;
  const depth = player.powers.markDepth ?? 0;
  if (mark === 'ice') {
    return {
      multiplier: 1,
      iceEnergy: others >= 1 ? 1 : 0,
      iceDraw: others >= 2 ? 1 : 0,
    };
  }
  return {
    multiplier: markMultiplier(others, depth, rainbow),
    iceEnergy: 0,
    iceDraw: 0,
  };
}

const scale = (amount: number, multiplier: number) => amount * multiplier;

/** 雨はダメージの数値だけ、波はブロックの数値だけを倍率する。氷の数値はそのまま。 */
export function scaledEffects(card: CardDefinition, multiplier: number): Effect[] {
  if (multiplier === 1 || card.mark === undefined || card.mark === 'ice') return card.effects;
  return card.effects.map((effect) => scaleEffect(effect, card.mark, multiplier));
}

function scaleEffect(effect: Effect, mark: CardMark | undefined, multiplier: number): Effect {
  if (mark === 'rain') {
    switch (effect.kind) {
      case 'damage':
        return { ...effect, amount: scale(effect.amount, multiplier) };
      case 'damagePerSelfHpLost':
        return {
          ...effect,
          base: scale(effect.base, multiplier),
          perHp: scale(effect.perHp, multiplier),
        };
      case 'damagePerDebuff':
        return {
          ...effect,
          base: scale(effect.base, multiplier),
          perTurn: scale(effect.perTurn, multiplier),
        };
      case 'detonateDebuffs':
      case 'detonateSeed':
        return { ...effect, perTurn: scale(effect.perTurn, multiplier) };
      case 'feed':
        return { ...effect, damage: scale(effect.damage, multiplier) };
      case 'consumeBlock':
        return { ...effect, multiplier: scale(effect.multiplier, multiplier) };
      case 'damagePerCardPlayed':
        return {
          ...effect,
          base: scale(effect.base, multiplier),
          perCard: scale(effect.perCard, multiplier),
        };
      default:
        return effect;
    }
  }
  if (mark === 'wave') {
    switch (effect.kind) {
      case 'block':
      case 'gainEndTurnBlock':
        return { ...effect, amount: scale(effect.amount, multiplier) };
      default:
        return effect;
    }
  }
  return effect;
}
