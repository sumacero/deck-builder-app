import type { Effect, EffectTarget } from './effect';

/** status は敵に混ぜられるお邪魔カード。報酬やショップには出ない。 */
export type CardType = 'attack' | 'skill' | 'power' | 'status';

/** enemy のカードは敵の上までスワイプして使う。それ以外は上にスワイプすれば使える。 */
export type CardTarget = EffectTarget;

/**
 * カードを使ったときのキャラクターの動きの種類。
 * 実際の動き方はキャラクターごとに違う（同じ strike でも剣士と魔法使いで別の動き）。
 */
export type CardMotion =
  | 'strike'
  | 'flurry'
  | 'heavy'
  | 'guard'
  | 'empower'
  | 'focus'
  | 'sacrifice';

/** 強化で置き換わる値。指定しなかった項目は強化前のまま。 */
export type CardUpgrade = {
  cost?: number;
  effects?: Effect[];
  exhaust?: boolean;
};

export type CardDefinition = {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  target: CardTarget;
  effects: Effect[];
  /** 使ったあと捨て札ではなく廃棄札へ。パワーは基本こちら。 */
  exhaust?: boolean;
  /** 使用時、同じカードをもう 1 枚捨て札に加える（怒気など）。 */
  addCopyToDiscard?: boolean;
  /** 無いカードは強化できない。 */
  upgrade?: CardUpgrade;
  /** 強化済み。強化は 1 回まで。 */
  upgraded?: boolean;
  /** 省略すると効果から自動で決まる。 */
  motion?: CardMotion;
  /** 使用できない。 */
  unplayable?: boolean;
  /** ターン終了時に手札にあると廃棄される。 */
  ethereal?: boolean;
  /** ターン終了時に手札にあるとかかる効果。 */
  turnEndInHand?: Effect[];
};

/** 山札・手札・捨て札の中の 1 枚。同じ定義のカードでも 1 枚ずつ区別する。 */
export type CardInstance = {
  instanceId: string;
  card: CardDefinition;
};

export type CardStack = {
  card: CardDefinition;
  count: number;
};
