import type { Effect } from './effect';
import type { RunEffect } from './runEffect';

/** combatStart は戦闘の最初に 1 回、turnStart は毎ターンの始め（1 ターン目も含む）。 */
export type RelicTrigger = 'combatStart' | 'turnStart' | 'turnEnd' | 'combatWon';

/**
 * 発動の条件。
 * - noBlock: ブロックが 0
 * - lowHp: HP が最大 HP の半分以下
 * - eliteOrBoss: エリートかボスがいる戦闘
 * - everyThirdTurn: 3・6・9… ターン目
 * - hasPinnedMark: 印のあるカードを手札に留めている
 */
export type RelicCondition = 'noBlock' | 'lowHp' | 'eliteOrBoss' | 'everyThirdTurn' | 'hasPinnedMark';

/** 通常のレリック（エリート・宝箱・ショップ・恩恵・イベント）のレア度。強いほど出にくい。 */
export type RelicTier = 'common' | 'uncommon' | 'rare';

/** starter はエージェントが最初から持つもの、boss はボス撃破後の 3 択で手に入るもの。 */
export type RelicRarity = 'starter' | RelicTier | 'boss';

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
