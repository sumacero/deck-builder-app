import type { Attribute } from './attribute';
import type { CardDefinition } from './card';
import type { DebuffId } from './status';

export type EnemyAction =
  | { kind: 'attack'; damage: number; hits: number; /** 章の攻撃倍率と一周の火力上昇を受けない。ギミック側の攻撃。 */ flat?: boolean }
  | { kind: 'block'; amount: number }
  /** 戦闘中ずっと筋力が上がり、以降の攻撃 1 回ごとのダメージが増える。 */
  | { kind: 'buff'; strength: number }
  /** HP を回復する。allies なら生きている仲間全員（自分を含む）。 */
  | { kind: 'heal'; amount: number; allies?: boolean }
  /** 麻痺: 次の自分のターン、エナジーが amount 減る。 */
  | { kind: 'paralyze'; amount: number }
  /** 凍え: 次の自分のターン、引く枚数が amount 減る。 */
  | { kind: 'chill'; amount: number }
  /**
   * 封印。charges が無いときは次の自分のターンだけスキルを使えない。
   * charges があるときは、スキル以外をその枚数使うまで解けない。
   */
  | { kind: 'seal'; charges?: number }
  /** 絡め: 次の自分のターン、アタックカードを使えない。 */
  | { kind: 'bind' }
  /** 力を溜める（それ自体は何もしない）。次の行動が大技であることの予告。 */
  | { kind: 'charge' }
  /** プレイヤーに弱体・衰弱をかける。 */
  | { kind: 'debuff'; status: DebuffId; turns: number }
  /** プレイヤーの捨て札にお邪魔カードを混ぜる。 */
  | { kind: 'addCard'; card: CardDefinition; count: number }
  /** 霊体化: 次のプレイヤーのターンの間、攻撃 1 回で受けるダメージが最大 1。turns はそのターン数。 */
  | { kind: 'intangible'; turns?: number }
  /** デッキ（手札・山札・捨て札）にある火傷を、今すぐまとめて発動して廃棄する。 */
  | { kind: 'detonateBurns' }
  /** 今かかっている凍えを、戦闘が終わるまで残す。かかっていなければ 1 から始まる。 */
  | { kind: 'lockChill' }
  /** 旗を掲げる: 自分の属性（と弱点）が変わる。同じ行動のあとの攻撃から新しい属性になる。 */
  | { kind: 'shiftAttribute'; attribute: Attribute }
  /** 眠っていて何もしない、またはスタンで行動を飛ばす（行動パターンには書かない）。 */
  | { kind: 'idle'; reason: 'sleep' | 'stun' };

export type EnemyMove = {
  id: string;
  name: string;
  actions: EnemyAction[];
};

/** 戦闘中ずっと効く敵の性質。 */
export type EnemyTrait =
  /** 仇討ち: 仲間が倒れるたびに筋力が上がる。 */
  | { kind: 'vengeance'; strength: number }
  /**
   * 激昂: プレイヤーがスキルを使うたびに筋力が上がる。
   * 行動パターンの火力は一周で戻るが、ここで付いた筋力は戦闘の終わりまで残る。
   */
  | { kind: 'enrage'; strength: number }
  /** 眠り: 最初の turns ターンは眠っている。HP にダメージを受けるか、時間が来ると起きて筋力が上がる。 */
  | { kind: 'sleep'; turns: number; wakeStrength: number }
  /**
   * アーティファクト: 次に受けるデバフを charges 回だけ無効にする。
   * 付与・延長・倍化が 1 回分。使い切ったあとは、同じデバフも重ねてかかる。
   */
  | { kind: 'artifact'; charges: number }
  /**
   * 鉄鱗: 攻撃 1 ヒットで受けるダメージの上限。超える一撃はここまで削られる。
   * 多段攻撃はヒットごとにこの上限まで通る。固定ダメージ（宿り木・弱点看破など）は対象外。
   */
  | { kind: 'hitCap'; amount: number }
  /** かばう: 生きている間、仲間 1 体を狙った攻撃・デバフを代わりに受ける。 */
  | { kind: 'guardian' }
  /** 死に際: 倒れたときに action を行う。 */
  | { kind: 'deathThroes'; action: EnemyAction }
  /**
   * 覚醒: HP が最大 HP の threshold 倍以下になると、筋力とブロックを得て行動パターンが moves に替わる（1 回だけ）。
   * 覚醒する前は HP がその値より下がらない（倒しきれず、余ったダメージは消える）。
   */
  | { kind: 'awaken'; threshold: number; strength: number; block: number; moves: EnemyMove[] }
  /**
   * 局面の変化: HP が最大 HP の threshold 倍以下になると、行動が moves に替わる（1 回だけ）。
   * 覚醒と違い、HP は止めず、筋力やブロックは足さない。ルールが変わるだけ。
   */
  | { kind: 'phase'; threshold: number; moves: EnemyMove[] }
  /** 棘札: 攻撃で HP を削られるたびに、お邪魔カードを捨て札へ混ぜる。 */
  | { kind: 'spines'; card: CardDefinition; count: number }
  /** 呼び声: 自分のターンの始めに、生きている召喚が limit 体未満なら 1 体呼ぶ。場は 4 体まで。 */
  | { kind: 'call'; summon: EnemyDefinition; limit: number }
  /**
   * 連命: 仲間が生きていれば、倒れてから turns 回の自分のターン開始で起き上がる。
   * その前に連命の仲間が全滅すると、起き上がらない。
   */
  | { kind: 'pact'; turns: number; hpRatio: number }
  /** 爆散: 倒れたとき、プレイヤーにダメージ（ブロックで防げる）。 */
  | { kind: 'burst'; damage: number }
  /** 膝折れ: 1 ヒットで threshold 以上の HP ダメージを受けると、次の自分の行動を飛ばす。 */
  | { kind: 'stun'; threshold: number }
  /** 返し棘: 攻撃を受けるたびに、プレイヤーへダメージ（ブロックで防げる）。 */
  | { kind: 'riposte'; damage: number }
  /** 導火: 自分のターンが turns 回来ると爆発して倒れ、そのダメージをプレイヤーに与える。 */
  | { kind: 'wick'; turns: number; damage: number }
  /** 分裂: 倒れたとき、into を count 体まで呼ぶ。into 自身は分裂しない。場は 4 体まで。 */
  | { kind: 'split'; into: EnemyDefinition; count: number }
  /** 吸血: プレイヤーの HP を削った分だけ、自分の HP を回復する。 */
  | { kind: 'leech' }
  /** 脱皮: HP が threshold 以下になったとき一度だけ、少し回復して霊体化する。 */
  | { kind: 'molt'; threshold: number; heal: number }
  /** 執念: 最初の致死ダメージでは HP 1 で踏みとどまり、次の行動を飛ばす。 */
  | { kind: 'spite' }
  /** 瘴気: 自分のターンの開始時に、お邪魔カードを捨て札へ混ぜる。 */
  | { kind: 'plague'; card: CardDefinition; count: number }
  /** 重圧: 生きているあいだ、自分のターンのエナジーが energy 減る。 */
  | { kind: 'weight'; energy: number }
  /** 共鳴: HP を削られたとき、同じ性質の仲間も同じだけ HP を失う（ブロックを無視。連鎖しない）。 */
  | { kind: 'link' }
  /** 捕食: プレイヤーの HP を削る攻撃のあと、捨て札から 1 枚をその戦闘から消す。 */
  | { kind: 'devour' }
  /**
   * 単独: この戦闘の首領が、格下の仲間を 1 体失うと行動が moves に替わる（1 回だけ）。
   * 首領を倒すと、仲間が残っていても戦いは終わる。
   */
  | { kind: 'lone'; moves: EnemyMove[] };

/** 通常敵 / エリート / ボス / 最後の章のあとに戦うラスボス。報酬や BGM が変わる。 */
export type EnemyRank = 'normal' | 'elite' | 'boss' | 'final';

export type EnemyDefinition = {
  id: string;
  name: string;
  icon: string;
  rank: EnemyRank;
  maxHp: number;
  /**
   * 先頭から順に使い、最後まで行ったら先頭に戻る。
   * エリート・ボスは先頭が一番弱く、最後の手が一番強い。火力の上がり方は logic/routine.ts。
   */
  moves: EnemyMove[];
  traits?: EnemyTrait[];
  /**
   * 敵の属性。これに強い属性（三つ巴）が弱点で、弱点を突かれるとダメージ 1.25 倍。
   * 省略で無属性（機械など）: 相性なし。
   */
  attribute?: Attribute;
};

/** 通常戦が、マップのどの時期に出るか。同じ敵を弱・中・強に分けず、時期ごとに別の敵を出す。 */
export type RoadTier = 'early' | 'mid' | 'late';

/** 1 回の戦闘で出てくる敵の組み合わせ。rank で報酬や BGM が変わる。 */
export type Encounter = {
  id: string;
  rank: EnemyRank;
  /** 左から順に並び、この順に行動する。 */
  enemies: EnemyDefinition[];
  /**
   * 通常戦だけ。序盤・中盤・終盤のどれに出すか。
   * 無いプール（古いセーブ、エリート、ボス）は、階で絞り込まない。
   */
  tier?: RoadTier;
};
