import type { RunChoice, RunEffect } from './runEffect';

/** 3 択はグループから 1 つずつ出す（似た選択肢ばかりにならないように）。 */
export type BlessingGroup = 'deck' | 'resource' | 'tradeoff';

export type BlessingDefinition = {
  id: string;
  group: BlessingGroup;
  /** 選んだ瞬間にかかる効果。 */
  effects: RunEffect[];
  choice?: RunChoice;
};

/** 各章の最初に現れて恩恵を授ける案内役。 */
export type GuideCharacter = {
  name: string;
  icon: string;
  /** 最後の章を終え、ラスボスに挑む前のセリフ。 */
  finaleLine: string;
};
