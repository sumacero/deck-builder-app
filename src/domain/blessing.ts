import type { RunChoice, RunEffect } from './runEffect';

/** 3 択はグループから 1 つずつ出す（似た選択肢ばかりにならないように）。 */
export type BlessingGroup = 'deck' | 'resource' | 'tradeoff';

export type BlessingDefinition = {
  id: string;
  group: BlessingGroup;
  /** この贈り物が出る章（1 始まり）。 */
  act: 1 | 2 | 3;
  /** 選んだ瞬間にかかる効果。 */
  effects: RunEffect[];
  choice?: RunChoice;
};

/** 章の開始で、3 つの選択肢がセットになった贈り物。章ごとに 4 組あり、そのうち 1 組が出る。 */
export type BlessingPattern = {
  id: string;
  act: 1 | 2 | 3;
  /** 案内役が、地域の挨拶のあとに付け加える一言。 */
  offer: string;
  choices: BlessingDefinition[];
};

/** 各章の最初に現れて恩恵を授ける案内役。 */
export type GuideCharacter = {
  name: string;
  icon: string;
  /** 最後の章を終え、ラスボスに挑む前のセリフ。 */
  finaleLine: string;
};
