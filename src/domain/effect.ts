import type { Attribute } from './attribute';
import type { BuffId, DebuffId, PowerId } from './status';

/**
 * カード・レリック・ポーションに共通する効果。damage は敵に、loseHp / heal などはプレイヤー。
 * damage がどの敵に当たるかは、効果の持ち主（カード・ポーション）の EffectTarget で決まる。
 */
export type Effect =
  /** strengthMultiplier: 筋力が N 倍で乗る（筋力を貯めるほど伸びる大技）。 */
  /** pierce: 敵のブロックを無視して HP に当たる（ブロックは減らない）。 */
  | { kind: 'damage'; amount: number; hits?: number; strengthMultiplier?: number; pierce?: boolean }
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
  | { kind: 'bloomSeed' }
  /** base + このターンにこのカードより前に使ったカード 1 枚につき perCard のダメージ。 */
  | { kind: 'damagePerCardPlayed'; base: number; perCard: number }
  /** base + このターンに先に使ったスキル 1 枚につき perCard のダメージ。 */
  | { kind: 'damagePerSkillPlayed'; base: number; perCard: number }
  /** base + このターンに先に使ったアタック 1 枚につき perCard のダメージ。 */
  | { kind: 'damagePerAttackPlayed'; base: number; perCard: number }
  /** base + このターンに捨てたカード 1 枚につき perCard のダメージ。 */
  | { kind: 'damagePerDiscard'; base: number; perCard: number }
  /** base + この戦闘で廃棄したカード 1 枚につき perCard のダメージ。 */
  | { kind: 'damagePerExhaust'; base: number; perCard: number }
  /** base + このターンに先に使ったカード 1 枚につき perCard のブロック。 */
  | { kind: 'blockPerCardPlayed'; base: number; perCard: number }
  /** 手札からランダムに amount 枚捨てる（使った札は除く）。 */
  | { kind: 'discardFromHand'; amount: number }
  /** 手札からランダムに amount 枚廃棄する（使った札は除く）。 */
  | { kind: 'exhaustFromHand'; amount: number }
  /** このターン、ムチの攻撃が 1 回当たるたびにその敵へ宿り木 amount。 */
  | { kind: 'gainLashSeed'; amount: number }
  /** 狙った敵の宿り木 × perTurn のダメージを与え、その宿り木を消す。 */
  | { kind: 'detonateSeed'; perTurn: number }
  /** 矢を amount 本、手札に加える（手札がいっぱいなら捨て札へ）。 */
  | { kind: 'addArrows'; amount: number }
  /** この戦闘で廃棄した矢の本数だけ、矢 1 本分のダメージを与える。 */
  | { kind: 'volleySpentArrows' }
  /** 狙った敵に霜。その敵の次の攻撃は、1 ヒットごとに amount 下がる。 */
  | { kind: 'applyFrost'; amount: number }
  /** かわす: 次の自分のターンが始まるまで、敵のヒットを amount 回無効にする。 */
  | { kind: 'gainEvade'; amount: number }
  /** 狙った敵の筋力を amount まで消す（0 より下にはしない）。 */
  | { kind: 'stripStrength'; amount: number }
  /** 自分にかかっている悪い効果を count 個消す。 */
  | { kind: 'cleanse'; count: number }
  /** 狙った敵のブロックを半分にする（切り捨て。0 なら何もしない）。 */
  | { kind: 'halveBlock' }
  /** 狙った敵の次の攻撃のヒット数を amount 減らす（0 未満にはしない。攻撃したら消える）。 */
  | { kind: 'cutHits'; amount: number };

/** enemy は敵 1 体を選んで使う。allEnemies は生きている敵全員。self は自分に使う（対象選択なし）。 */
export type EffectTarget = 'enemy' | 'allEnemies' | 'self';
