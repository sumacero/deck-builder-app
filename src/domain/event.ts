import type { RunChoice, RunEffect } from './runEffect';

/** イベントの選択肢。effects をかけたあと、choice があればカードを選び、fight があれば戦闘になる。 */
export type EventOption = {
  id: string;
  label: string;
  effects: RunEffect[];
  choice?: RunChoice;
  /** 戦闘になる。勝てばその格に応じた報酬。 */
  fight?: 'elite';
  /** 選んだあとに表示する結末（choice / fight が無い場合）。 */
  outcome: string;
};

/** マップの「？」マスで起きる出来事。 */
export type EventDefinition = {
  id: string;
  title: string;
  icon: string;
  text: string;
  options: EventOption[];
};
