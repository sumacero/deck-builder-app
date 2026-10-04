import type { Effect } from './effect';
import type { RunEffect } from './runEffect';

export type RelicTrigger = 'combatStart' | 'turnEnd' | 'combatWon';

export type RelicCondition = 'noBlock';

/** 通常のレリックはエリート・宝箱・ショップ・恩恵で、ボスレリックはボス撃破後の 3 択で手に入る。 */
export type RelicRarity = 'common' | 'boss';

/**
 * 所持しているだけで効果がある。
 * trigger があれば戦闘中の決まったタイミングに effects が自動で発動し、
 * onObtain があれば手に入れた瞬間にランの能力値（毎ターンのエナジーなど）が変わる。
 */
export type RelicDefinition = {
  id: string;
  name: string;
  icon: string;
  rarity: RelicRarity;
  trigger?: RelicTrigger;
  condition?: RelicCondition;
  effects: Effect[];
  onObtain?: RunEffect[];
};
