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

/**
 * 使ったカードを除いた、同じ印の枚数。
 * 手札にある枚数に、文鎮が覚えている分と「水面」の分を足す。
 */
export function otherMarkCount(
  hand: readonly CardInstance[],
  instanceId: string,
  mark: CardMark,
  player: PlayerState,
): number {
  const inHand = hand.filter(
    (card) => card.instanceId !== instanceId && card.card.mark === mark,
  ).length;
  return inHand + (player.markMemory[mark] ?? 0) + (player.powers.markCount ?? 0);
}

/**
 * このプレイで融合して廃棄する手札。
 * 同じ印がほかにあれば、その全部。無ければ、三印が揃っていて文鎮や水面で既に倍率が付いていないとき、
 * ほかの印を 1 枚ずつ（三印の素材）。
 */
export function fusionMaterials(
  hand: readonly CardInstance[],
  instance: CardInstance,
  player: PlayerState,
): CardInstance[] {
  const mark = instance.card.mark;
  if (!mark) return [];
  const same = hand.filter((card) => card.instanceId !== instance.instanceId && card.card.mark === mark);
  if (same.length > 0) return same;
  const virtual = (player.markMemory[mark] ?? 0) + (player.powers.markCount ?? 0);
  if (virtual > 0 || !handHasRainbow(hand)) return [];
  const taken = new Set<CardMark>();
  const materials: CardInstance[] = [];
  for (const card of hand) {
    if (card.instanceId === instance.instanceId || !card.card.mark || card.card.mark === mark) continue;
    if (taken.has(card.card.mark)) continue;
    taken.add(card.card.mark);
    materials.push(card);
  }
  return materials;
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

/** カードを手札から出す前に呼ぶ。虹の判定は、使うカード自身も含む。 */
export function markPlay(hand: readonly CardInstance[], instance: CardInstance, player: PlayerState): MarkPlay {
  const mark = instance.card.mark;
  if (!mark) return { multiplier: 1, iceEnergy: 0, iceDraw: 0 };
  const others = otherMarkCount(hand, instance.instanceId, mark, player);
  const depth = player.powers.markDepth ?? 0;
  if (mark === 'ice') {
    return {
      multiplier: 1,
      iceEnergy: others >= 1 ? 1 : 0,
      iceDraw: others >= 2 ? 1 : 0,
    };
  }
  return {
    multiplier: markMultiplier(others, depth, handHasRainbow(hand)),
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
