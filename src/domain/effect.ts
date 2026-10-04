/** カード・レリック・ポーションに共通する効果。damage は敵に、loseHp / heal などはプレイヤー。 */
export type Effect =
  | { kind: 'damage'; amount: number; hits?: number }
  | { kind: 'block'; amount: number }
  | { kind: 'gainEnergy'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'gainStrength'; amount: number; duration: 'combat' | 'turn' }
  | { kind: 'gainEndTurnBlock'; amount: number };
