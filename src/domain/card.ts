import type { Attribute } from './attribute';
import type { Effect, EffectTarget } from './effect';

/** status は敵に混ぜられるお邪魔カード。報酬やショップには出ない。 */
export type CardType = 'attack' | 'skill' | 'power' | 'status';

/**
 * デッキ構築の軸。報酬の 3 択で、デッキの軸に合うカードが 1 枚出やすくなる。
 * デバフ / ブロック / 筋力（火力の底上げ）/ 自傷（HP を払う）/ 成長 / 属性（弱点を突く）/ 手数（軽いカードを次々使う）。
 */
export type Archetype = 'debuff' | 'block' | 'strength' | 'sacrifice' | 'growth' | 'element' | 'tempo';

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

/**
 * 使うたび（または敵を倒すたび）に強くなるカード。stat の種類の効果の数値が amount ずつ増える。
 * scope が combat ならその戦闘の間だけ、run ならデッキのカード自体が成長してランの間ずっと続く。
 */
export type CardGrowth = {
  stat: 'damage' | 'block';
  amount: number;
  when: 'play' | 'kill';
  scope: 'combat' | 'run';
};

/** 強化で置き換わる値。指定しなかった項目は強化前のまま。 */
export type CardUpgrade = {
  cost?: number;
  effects?: Effect[];
  exhaust?: boolean;
  growth?: CardGrowth;
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
  growth?: CardGrowth;
  /** 攻撃の属性。アタックで省略すると斬。秘奥義は全属性を持つ。 */
  /**
   * カードの属性。省略で無属性（誰でも報酬で手に入る）。
   * エージェントと違う属性のカードは通常の報酬に出ず、ショップでのみ買える。
   */
  attribute?: Attribute;
  /** ストライクのように、エージェントの属性を受け継ぐ初期カード。 */
  attuned?: boolean;
  /** イラストの差し替え（キャラ専用の絵の名前）。効果は同じで絵だけ変える。省略でカード id の絵。 */
  art?: string;
  /** 秘奥義（ゲージが溜まると手札に来る必殺技）。 */
  mysticArte?: boolean;
  archetypes?: Archetype[];
  /** これまでに成長した回数（効果の数値には反映済み）。 */
  timesGrown?: number;
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
