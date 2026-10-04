import type { Effect } from './effect';

/** 自分のターン中にエナジーを使わずに飲める使い捨てアイテム。 */
export type PotionDefinition = {
  id: string;
  name: string;
  icon: string;
  effects: Effect[];
};
