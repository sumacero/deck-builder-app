import type { Attribute } from './attribute';
import type { BuffId, DebuffId, PowerId } from './status';

/**
 * カード・レリック・ポーションに共通する効果。damage は敵に、loseHp / heal などはプレイヤー。
 * damage がどの敵に当たるかは、効果の持ち主（カード・ポーション）の EffectTarget で決まる。
 */
export type Effect =
  /** strengthMultiplier: 筋力が N 倍で乗る（筋力を貯めるほど伸びる大技）。 */
  | { kind: 'damage'; amount: number; hits?: number; strengthMultiplier?: number }
  /** base + この戦闘でカードの効果で自分が失った HP × perHp のダメージ（敵の攻撃で減った分は数えない）。 */
  | { kind: 'damagePerSelfHpLost'; base: number; perHp: number }
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
  | { kind: 'extendBuffs'; turns: number }
  /** 戦闘の終わりまで続く能力を得る（重ねると量が増える）。 */
  | { kind: 'gainPower'; power: PowerId; amount: number }
  /** base + 狙った敵のデバフの合計ターン数 × perTurn のダメージ。 */
  | { kind: 'damagePerDebuff'; base: number; perTurn: number }
  /** 狙った敵のデバフをすべて消し、消した合計ターン数 × perTurn のダメージ（弱体は消す前に効く）。 */
  | { kind: 'detonateDebuffs'; perTurn: number }
  /** 狙った敵が status にかかっていれば effects を使う。 */
  | { kind: 'ifTargetHas'; status: DebuffId; effects: Effect[] }
  /** ブロックをすべて失い、その multiplier 倍のダメージを与える。 */
  | { kind: 'consumeBlock'; multiplier: number }
  /** damage を与え、それで敵を倒したら最大 HP +maxHp（ランの間ずっと）。 */
  | { kind: 'feed'; damage: number; maxHp: number }
  /** 魔法剣: このターン、アタックに attribute の属性が加わる。 */
  | { kind: 'enchant'; attribute: Attribute }
  /** 狙った敵の status のターン数を factor 倍にする（かかっていなければ何もしない）。 */
  | { kind: 'multiplyDebuff'; status: DebuffId; factor: number }
  /** 狙った敵の宿り木を、今すぐ 1 回発動させる（ターン数は減らない）。 */
  | { kind: 'bloomSeed' };

/** enemy は敵 1 体を選んで使う。allEnemies は生きている敵全員。self は自分に使う（対象選択なし）。 */
export type EffectTarget = 'enemy' | 'allEnemies' | 'self';
