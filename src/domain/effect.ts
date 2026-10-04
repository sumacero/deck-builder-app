import type { BuffId, DebuffId } from './status';

/**
 * カード・レリック・ポーションに共通する効果。damage は敵に、loseHp / heal などはプレイヤー。
 * damage がどの敵に当たるかは、効果の持ち主（カード・ポーション）の EffectTarget で決まる。
 */
export type Effect =
  | { kind: 'damage'; amount: number; hits?: number }
  /** 今のブロック値と同じダメージを与える（筋力などの補正も乗る）。 */
  | { kind: 'damageFromBlock' }
  | { kind: 'block'; amount: number }
  /** 今のブロック値を 2 倍にする。 */
  | { kind: 'doubleBlock' }
  | { kind: 'gainEnergy'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'loseHp'; amount: number }
  | { kind: 'gainStrength'; amount: number; duration: 'combat' | 'turn' }
  | { kind: 'gainEndTurnBlock'; amount: number }
  /** 狙った敵にデバフを turns ターン分かける（かかっていれば加算）。 */
  | { kind: 'applyDebuff'; status: DebuffId; turns: number }
  /** 自分にバフを turns ターン分かける（かかっていれば加算）。 */
  | { kind: 'gainBuff'; status: BuffId; turns: number }
  /** 狙った敵にかかっているデバフすべてのターン数を加算する。 */
  | { kind: 'extendDebuffs'; turns: number }
  /** 自分にかかっているバフすべてのターン数を加算する。 */
  | { kind: 'extendBuffs'; turns: number };

/** enemy は敵 1 体を選んで使う。allEnemies は生きている敵全員。self は自分に使う（対象選択なし）。 */
export type EffectTarget = 'enemy' | 'allEnemies' | 'self';
