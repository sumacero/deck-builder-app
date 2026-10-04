/** 選んだ瞬間に効果が決まる恩恵。 */
export type BlessingEffect =
  | { kind: 'gainMaxHp'; amount: number }
  | { kind: 'loseMaxHp'; amount: number }
  | { kind: 'gainGold'; amount: number }
  /** まだ持っていないレリックからランダムに 1 つ。 */
  | { kind: 'gainRelic' }
  /** 強化できるカードからランダムに count 枚を強化。 */
  | { kind: 'upgradeRandom'; count: number }
  /** 空いているポーション枠をランダムなポーションで埋める。 */
  | { kind: 'fillPotions' };

/** 選んだあとにプレイヤーがカードを選ぶ恩恵。 */
export type BlessingChoice = 'upgradeCard' | 'removeCard' | 'pickCard';

/** 3 択はグループから 1 つずつ出す（似た選択肢ばかりにならないように）。 */
export type BlessingGroup = 'deck' | 'resource' | 'tradeoff';

export type BlessingDefinition = {
  id: string;
  group: BlessingGroup;
  effects: BlessingEffect[];
  choice?: BlessingChoice;
};

/** 各章の最初に現れて恩恵を授ける案内役。 */
export type GuideCharacter = {
  name: string;
  icon: string;
};
