import type { CardDefinition } from './card';

export type UpgradedCard = { before: CardDefinition; after: CardDefinition };

/**
 * 戦闘の外で起きた、演出・効果音で知らせたい出来事。
 * 操作の前後のラン状態を比べて作る（休憩所・イベント・恩恵など、どこで起きても同じ演出になる）。
 */
export type RunEvent =
  | { kind: 'heal'; hpBefore: number; hpAfter: number; maxHpBefore: number; maxHpAfter: number }
  | { kind: 'upgrade'; cards: UpgradedCard[] }
  /** 負の値は支払い。 */
  | { kind: 'goldChange'; amount: number }
  | { kind: 'cardGain'; count: number };

/** 演出の順番待ち。id は表示が終わったときに取り除くための通し番号。 */
export type QueuedRunEvent = { id: number; event: RunEvent };
