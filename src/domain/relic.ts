import type { Effect } from './effect';

export type RelicTrigger = 'combatStart' | 'turnEnd' | 'combatWon';

export type RelicCondition = 'noBlock';

/** 所持しているだけで、決まったタイミングに自動で発動する。 */
export type RelicDefinition = {
  id: string;
  name: string;
  icon: string;
  trigger: RelicTrigger;
  condition?: RelicCondition;
  effects: Effect[];
};
