import type { CardDefinition } from './card';

/**
 * ラン全体にかかる効果（戦闘の外で起きる）。恩恵・イベント・レリックの入手時に使う。
 * 戦闘中の効果は `Effect`（effect.ts）。
 */
export type RunEffect =
  | { kind: 'gainMaxHp'; amount: number }
  | { kind: 'loseMaxHp'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'gainGold'; amount: number }
  | { kind: 'loseGold'; amount: number }
  /** まだ持っていないレリックからランダムに 1 つ。 */
  | { kind: 'gainRelic' }
  /** 強化できるカードからランダムに count 枚を強化。 */
  | { kind: 'upgradeRandom'; count: number }
  /** 空いているポーション枠をランダムなポーションで埋める。 */
  | { kind: 'fillPotions' }
  /** 毎ターンのエナジー。負の値で減る。 */
  | { kind: 'changeEnergyPerTurn'; amount: number }
  /** 毎ターン引く枚数。負の値で減る。 */
  | { kind: 'changeDrawPerTurn'; amount: number }
  /** from（強化後も含む）を count 枚取り除き、into を 1 枚加える。素材に強化済みがあれば into も強化済み。 */
  | { kind: 'fuseCards'; from: CardDefinition; count: number; into: CardDefinition };

/** 効果のあとにプレイヤーがカードを選ぶ。 */
export type RunChoice = 'upgradeCard' | 'removeCard' | 'pickCard';
