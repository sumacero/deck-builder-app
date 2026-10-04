import type { CardDefinition } from './card';

/** プレイヤーが操作するキャラクター。将来は固有の初期デッキ・レリックを持たせる。 */
export type AgentDefinition = {
  id: string;
  name: string;
  icon: string;
  /** 秘奥義ゲージが溜まると手札に来る、キャラ固有の必殺技。 */
  mysticArte: CardDefinition;
};
