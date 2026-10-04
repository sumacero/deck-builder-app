import type { Effect, EffectTarget } from './effect';

/** 自分のターン中にエナジーを使わずに飲める使い捨てアイテム。 */
export type PotionDefinition = {
  id: string;
  name: string;
  icon: string;
  /** enemy なら使うときに敵を 1 体選ぶ（敵が 1 体だけなら選ばずに使える）。 */
  target: EffectTarget;
  effects: Effect[];
};
