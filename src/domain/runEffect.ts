import type { CardDefinition } from './card';
import type { RelicDefinition, RelicTier } from './relic';

/** 今あるカードに後から足す性質。 */
export type CardStamp = 'replay' | 'sly' | 'innate' | 'retain';

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
  /** まだ持っていないレリックからランダムに 1 つ（レア度の出現率に従う）。tier を指定するとそのレア度から。 */
  | { kind: 'gainRelic'; tier?: RelicTier }
  /** デッキにカードを加える（お邪魔カードを押し付けられる代償など）。 */
  | { kind: 'addCard'; card: CardDefinition }
  /** 強化できるカードからランダムに count 枚を強化。 */
  | { kind: 'upgradeRandom'; count: number }
  /** 空いているポーション枠をランダムなポーションで埋める。 */
  | { kind: 'fillPotions' }
  /** 毎ターンのエナジー。負の値で減る。 */
  | { kind: 'changeEnergyPerTurn'; amount: number }
  /** 毎ターン引く枚数。負の値で減る。 */
  | { kind: 'changeDrawPerTurn'; amount: number }
  /** from（強化後も含む）を count 枚取り除き、into を 1 枚加える。素材に強化済みがあれば into も強化済み。 */
  | { kind: 'fuseCards'; from: CardDefinition; count: number; into: CardDefinition }
  /** 報酬に出るカードを count 枚、無作為にデッキへ加える。 */
  | { kind: 'addRandomCards'; count: number }
  /** 呪いでも秘奥義でもないカードを count 枚、別のランダムなカードに置き換える。 */
  | { kind: 'transformRandom'; count: number }
  /** ストライクと防御を、それぞれ指定枚数だけデッキから外す。強化していない方から外す。 */
  | { kind: 'removeBasics'; strikes: number; defends: number }
  /** デッキのストライクすべてのダメージを amount 増やし、防御すべてのブロックを amount 増やす。 */
  | { kind: 'honeBasics'; amount: number }
  /** 強化できるカードを、残らず強化する。 */
  | { kind: 'upgradeAll' }
  /** ストライクと防御のうち、強化できるものを残らず強化する。 */
  | { kind: 'upgradeStarters' }
  /** ストライク 1 枚と防御 1 枚を、狂鬼の札に変える。 */
  | { kind: 'berserkBasics' }
  /** 同じ呪いを count 枚、デッキに加える。 */
  | { kind: 'addCurses'; card: CardDefinition; count: number }
  /** 条件を満たすカードを count 枚選ばせ、性質を足す。 */
  | { kind: 'stampCards'; stamp: CardStamp; count: number }
  /** 名前の決まったレリックを 1 つ与える。ショップの抽選には入っていない。 */
  | { kind: 'gainNamedRelic'; relic: RelicDefinition };

/** 効果のあとにプレイヤーがカードを選ぶ。 */
export type RunChoice = 'upgradeCard' | 'removeCard' | 'pickCard';
