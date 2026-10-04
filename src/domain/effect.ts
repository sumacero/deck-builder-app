/**
 * カード・レリック・ポーションに共通する効果。damage は敵に、loseHp / heal などはプレイヤー。
 * damage がどの敵に当たるかは、効果の持ち主（カード・ポーション）の EffectTarget で決まる。
 */
export type Effect =
  | { kind: 'damage'; amount: number; hits?: number }
  | { kind: 'block'; amount: number }
  | { kind: 'gainEnergy'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'gainStrength'; amount: number; duration: 'combat' | 'turn' }
  | { kind: 'gainEndTurnBlock'; amount: number };

/** enemy は敵 1 体を選んで使う。allEnemies は生きている敵全員。self は自分に使う（対象選択なし）。 */
export type EffectTarget = 'enemy' | 'allEnemies' | 'self';
