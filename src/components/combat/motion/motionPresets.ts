import type { CardMark, CardMotion } from '../../../domain/card';
import type { ActorId, CombatEvent } from '../../../domain/combat';
import type { EnemyAction } from '../../../domain/enemy';
import { MOTION } from '../../../theme';
import type { ActorAction } from '../model3d/actorActions';

/**
 * 動きの 1 コマ。x は「相手に向かう方向」への踏み込み量（向きの反転と斜めの移動は描画側で行う）。
 * 省略した値は定位置（0 / 等倍 / 回転なし）。
 */
export type Keyframe = {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  duration: number;
};

/** アニメ風 VFX の種類（斬撃ライン・衝撃波など）。 */
export type VfxKind =
  | 'slash'
  | 'cross'
  | 'impact'
  | 'spin'
  | 'guard'
  | 'power'
  | 'spark'
  | 'wince'
  | 'arrow'
  | 'leaf'
  | 'water'
  | 'ice'
  | 'drop'
  | 'mist';

/** 動きの最中に出すエフェクト。self は動いた本人、opponent は相手の位置に出る。 */
export type Burst = { kind: VfxKind; on: 'self' | 'opponent'; delay: number };

/**
 * keyframes は絵（3D の描画面ごと）の移動、action は 3D モデル自身の動き（腕・武器を振る）。
 * action が無い動き（敵）は、3D では相手の方へ体を傾けるだけ。
 */
export type MotionPreset = {
  keyframes: Keyframe[];
  burst?: Burst;
  action?: ActorAction;
};

/**
 * 紅蓮のカイル（2D 切り紙）: 3D の腕振りが無いぶん、踏み込み・回転・拡大を強めに出す。
 */
const SWORDSMAN_MOTIONS: Record<CardMotion, MotionPreset> = {
  strike: {
    action: 'slash',
    keyframes: [
      { x: -10, rotate: -6, duration: 90 },
      { x: 36, rotate: 12, scale: 1.06, duration: 130 },
      { x: 28, rotate: 8, duration: 70 },
      { duration: 200 },
    ],
    burst: { kind: 'slash', on: 'opponent', delay: 200 },
  },
  flurry: {
    action: 'combo',
    keyframes: [
      { x: -8, duration: 50 },
      { x: 30, rotate: 10, scale: 1.04, duration: 70 },
      { x: 12, rotate: -8, duration: 60 },
      { x: 34, rotate: 12, scale: 1.06, duration: 70 },
      { x: 12, rotate: -8, duration: 60 },
      { x: 36, rotate: 14, scale: 1.06, duration: 80 },
      { duration: 180 },
    ],
    burst: { kind: 'cross', on: 'opponent', delay: 120 },
  },
  heavy: {
    action: 'cleave',
    keyframes: [
      { y: -22, scale: 1.1, rotate: -14, duration: 240 },
      { x: 40, y: 4, scale: 1.14, rotate: 16, duration: 120 },
      { x: 32, scale: 1.08, rotate: 10, duration: 100 },
      { duration: 240 },
    ],
    burst: { kind: 'impact', on: 'opponent', delay: 340 },
  },
  sweep: {
    action: 'spin',
    keyframes: [
      { scale: 0.94, rotate: -12, duration: 100 },
      { x: 20, scale: 1.08, rotate: 24, duration: 280 },
      { x: 14, rotate: 8, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'spin', on: 'opponent', delay: 300 },
  },
  // 剣士にムチのカードは無いが、型を埋めるため通常の斬撃と同じにする。
  lash: {
    action: 'slash',
    keyframes: [
      { x: -10, rotate: -6, duration: 90 },
      { x: 36, rotate: 12, scale: 1.06, duration: 130 },
      { x: 28, rotate: 8, duration: 70 },
      { duration: 200 },
    ],
    burst: { kind: 'slash', on: 'opponent', delay: 200 },
  },
  guard: {
    action: 'guard',
    keyframes: [
      { x: -12, scale: 0.94, duration: 130 },
      { x: -12, scale: 0.94, duration: 180 },
      { duration: 200 },
    ],
    burst: { kind: 'guard', on: 'self', delay: 50 },
  },
  empower: {
    action: 'raise',
    keyframes: [
      { y: -12, scale: 1.14, duration: 240 },
      { y: -12, scale: 1.14, duration: 160 },
      { duration: 240 },
    ],
    burst: { kind: 'power', on: 'self', delay: 100 },
  },
  focus: {
    action: 'charge',
    keyframes: [
      { y: -10, scale: 0.96, duration: 160 },
      { y: -6, scale: 1.08, duration: 140 },
      { y: -4, duration: 100 },
      { duration: 120 },
    ],
    burst: { kind: 'spark', on: 'self', delay: 80 },
  },
  sacrifice: {
    action: 'wince',
    keyframes: [
      { rotate: -8, scale: 0.96, duration: 55 },
      { rotate: 8, scale: 0.96, duration: 55 },
      { rotate: -6, duration: 55 },
      { rotate: 4, duration: 55 },
      { duration: 90 },
    ],
    burst: { kind: 'wince', on: 'self', delay: 30 },
  },
};

/** 翠風のリーネ: その場で弓を引き絞って放つ。踏み込まず、軽く跳んで距離を取る。 */
const ARCHER_MOTIONS: Record<CardMotion, MotionPreset> = {
  strike: {
    action: 'shoot',
    keyframes: [
      { x: -16, rotate: -6, duration: 140 },
      { x: -16, rotate: -6, duration: 60 },
      { x: 8, duration: 70 },
      { duration: 160 },
    ],
    burst: { kind: 'arrow', on: 'opponent', delay: 220 },
  },
  flurry: {
    action: 'rapid',
    keyframes: [
      { x: -12, duration: 80 },
      { x: 4, duration: 50 },
      { x: -10, duration: 60 },
      { x: 4, duration: 50 },
      { x: -10, duration: 60 },
      { x: 6, duration: 50 },
      { duration: 140 },
    ],
    burst: { kind: 'leaf', on: 'opponent', delay: 120 },
  },
  heavy: {
    action: 'volley',
    keyframes: [
      { y: -34, x: -14, scale: 1.12, rotate: -10, duration: 240 },
      { y: -34, x: -14, scale: 1.12, rotate: -10, duration: 100 },
      { x: 10, scale: 1.15, duration: 90 },
      { duration: 240 },
    ],
    burst: { kind: 'spin', on: 'opponent', delay: 340 },
  },
  // 腰のムチを抜いて、その場で回って敵全体を薙ぐ。
  sweep: {
    action: 'whirlLash',
    keyframes: [
      { x: 6, scale: 0.95, duration: 100 },
      { x: 14, scale: 1.05, duration: 360 },
      { duration: 200 },
    ],
    burst: { kind: 'leaf', on: 'opponent', delay: 320 },
  },
  // 腰のムチを抜いて、頭上を回して打ち据える。
  lash: {
    action: 'lash',
    keyframes: [
      { x: -8, duration: 160 },
      { x: 18, rotate: 6, duration: 110 },
      { x: 14, duration: 120 },
      { duration: 160 },
    ],
    burst: { kind: 'impact', on: 'opponent', delay: 290 },
  },
  guard: {
    action: 'hopBack',
    keyframes: [
      { x: -18, y: -10, duration: 120 },
      { x: -18, duration: 100 },
      { duration: 180 },
    ],
    burst: { kind: 'leaf', on: 'self', delay: 60 },
  },
  empower: {
    action: 'raise',
    keyframes: [
      { y: -10, scale: 1.18, rotate: 4, duration: 220 },
      { y: -10, scale: 1.18, rotate: -4, duration: 160 },
      { duration: 220 },
    ],
    burst: { kind: 'power', on: 'self', delay: 120 },
  },
  focus: {
    action: 'aim',
    keyframes: [
      { y: -12, duration: 160 },
      { duration: 140 },
      { y: -5, duration: 100 },
      { duration: 100 },
    ],
    burst: { kind: 'leaf', on: 'opponent', delay: 120 },
  },
  sacrifice: SWORDSMAN_MOTIONS.sacrifice,
};

/** 水鏡のノア: その場で札を払う。杖は持たず、唱える動きは占いの手つきとして使う。 */
const MAGE_MOTIONS: Record<CardMotion, MotionPreset> = {
  strike: {
    action: 'cast',
    keyframes: [
      { x: -6, duration: 90 },
      { x: 16, rotate: 4, duration: 120 },
      { x: 16, rotate: 4, duration: 70 },
      { duration: 160 },
    ],
    burst: { kind: 'water', on: 'opponent', delay: 200 },
  },
  flurry: {
    action: 'cast',
    keyframes: [
      { x: -4, duration: 60 },
      { x: 12, duration: 70 },
      { x: 2, duration: 50 },
      { x: 14, duration: 70 },
      { x: 4, duration: 50 },
      { x: 16, duration: 70 },
      { duration: 140 },
    ],
    burst: { kind: 'water', on: 'opponent', delay: 140 },
  },
  heavy: {
    action: 'cleave',
    keyframes: [
      { y: -18, scale: 1.08, rotate: -8, duration: 220 },
      { x: 22, scale: 1.12, rotate: 8, duration: 120 },
      { x: 18, duration: 100 },
      { duration: 200 },
    ],
    burst: { kind: 'water', on: 'opponent', delay: 320 },
  },
  sweep: {
    action: 'spin',
    keyframes: [
      { scale: 0.96, duration: 100 },
      { x: 12, scale: 1.06, duration: 320 },
      { duration: 180 },
    ],
    burst: { kind: 'water', on: 'opponent', delay: 280 },
  },
  lash: {
    action: 'cast',
    keyframes: [
      { x: -6, duration: 90 },
      { x: 16, duration: 120 },
      { duration: 160 },
    ],
    burst: { kind: 'water', on: 'opponent', delay: 180 },
  },
  guard: {
    action: 'guard',
    keyframes: [
      { x: -8, scale: 0.94, duration: 120 },
      { x: -8, scale: 0.94, duration: 150 },
      { duration: 170 },
    ],
    burst: { kind: 'guard', on: 'self', delay: 60 },
  },
  empower: {
    action: 'raise',
    keyframes: [
      { y: -10, scale: 1.16, duration: 220 },
      { y: -10, scale: 1.16, duration: 140 },
      { duration: 200 },
    ],
    burst: { kind: 'water', on: 'self', delay: 120 },
  },
  focus: {
    action: 'charge',
    keyframes: [
      { y: -8, duration: 150 },
      { duration: 140 },
      { y: -4, duration: 100 },
      { duration: 100 },
    ],
    burst: { kind: 'water', on: 'opponent', delay: 100 },
  },
  sacrifice: SWORDSMAN_MOTIONS.sacrifice,
};

/** エージェント id ごとの動き。未登録のエージェントは剣士の動きを使う。 */
const AGENT_MOTIONS: Record<string, Record<CardMotion, MotionPreset>> = {
  'crimson-hero': SWORDSMAN_MOTIONS,
  'verdant-archer': ARCHER_MOTIONS,
  'mirror-seer': MAGE_MOTIONS,
};

/** キーフレームと、エフェクトが消えるまでの長い方。 */
export function presetDuration(preset: MotionPreset): number {
  const motion = preset.keyframes.reduce((sum, frame) => sum + frame.duration, 0);
  const burst = preset.burst ? preset.burst.delay + MOTION.burst : 0;
  return Math.max(motion, burst);
}

/** エージェントのカード動きの再生時間（ポーズを戻すタイミング用）。 */
export function agentMotionDuration(agentId: string, motion: CardMotion): number {
  const motions = AGENT_MOTIONS[agentId] ?? SWORDSMAN_MOTIONS;
  return presetDuration(motions[motion]);
}

/** 敵の動き。攻撃は 1 発ごとに体当たりする。 */
const ENEMY_MOTIONS: Record<EnemyAction['kind'], MotionPreset> = {
  attack: {
    keyframes: [
      { x: -6, duration: 60 },
      { x: 40, scale: 1.08, duration: 100 },
      { x: 40, scale: 1.08, duration: 40 },
      { duration: 150 },
    ],
  },
  block: {
    keyframes: [
      { scale: 0.88, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'guard', on: 'self', delay: 40 },
  },
  buff: {
    keyframes: [
      { y: -10, scale: 1.25, duration: 200 },
      { y: -10, scale: 1.25, duration: 100 },
      { duration: 220 },
    ],
    burst: { kind: 'wince', on: 'self', delay: 100 },
  },
  heal: {
    keyframes: [
      { y: -6, scale: 1.1, duration: 200 },
      { duration: 220 },
    ],
    burst: { kind: 'leaf', on: 'self', delay: 80 },
  },
  paralyze: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'impact', on: 'opponent', delay: 120 },
  },
  chill: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'guard', on: 'opponent', delay: 120 },
  },
  seal: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'spark', on: 'opponent', delay: 120 },
  },
  bind: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'leaf', on: 'opponent', delay: 120 },
  },
  charge: {
    keyframes: [
      { scale: 0.9, duration: 160 },
      { scale: 1.15, duration: 200 },
      { duration: 200 },
    ],
    burst: { kind: 'power', on: 'self', delay: 160 },
  },
  debuff: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'spin', on: 'opponent', delay: 120 },
  },
  addCard: {
    keyframes: [
      { y: -8, rotate: -8, duration: 120 },
      { x: 20, rotate: 8, duration: 120 },
      { duration: 200 },
    ],
    burst: { kind: 'spark', on: 'opponent', delay: 160 },
  },
  intangible: {
    keyframes: [
      { y: -12, scale: 0.9, duration: 260 },
      { y: -6, scale: 1.05, duration: 200 },
      { duration: 240 },
    ],
    burst: { kind: 'spark', on: 'self', delay: 120 },
  },
  shiftAttribute: {
    keyframes: [
      { y: -14, scale: 1.2, duration: 220 },
      { y: -14, scale: 1.2, duration: 120 },
      { duration: 220 },
    ],
    burst: { kind: 'power', on: 'self', delay: 120 },
  },
  idle: {
    keyframes: [
      { y: 4, scale: 0.97, duration: 260 },
      { duration: 260 },
    ],
  },
};

/** この敵の行動の絵が終わるまで。 */
export function enemyActionDuration(action: EnemyAction['kind']): number {
  return presetDuration(ENEMY_MOTIONS[action]);
}

/** 相手（プレイヤー）に向けて行う敵の行動。 */
const TARGETS_PLAYER: ReadonlySet<EnemyAction['kind']> = new Set([
  'attack',
  'paralyze',
  'chill',
  'seal',
  'bind',
  'debuff',
  'addCard',
]);

export type ActorMotionPlan = {
  actor: ActorId;
  /** opponent のエフェクトを出す相手。 */
  opponents: ActorId[];
  preset: MotionPreset;
};

/** 敵の攻撃を受けたときののけぞり（2D 立ち絵向け）。 */
export const PLAYER_FLINCH: MotionPreset = {
  keyframes: [
    { x: -28, rotate: -12, scale: 0.94, duration: 90 },
    { x: -18, rotate: -6, duration: 80 },
    { duration: 160 },
  ],
  burst: { kind: 'impact', on: 'self', delay: 40 },
};

/** ノアの性質カード。印が無いカードは、動き側に書いた水のエフェクトのまま。 */
function burstKindForMark(mark: CardMark): VfxKind {
  switch (mark) {
    case 'ice':
      return 'ice';
    case 'drop':
      return 'drop';
    case 'mist':
      return 'mist';
  }
}

/** イベントから「誰が・誰に向けて・どう動くか」を決める。動きの無いイベントは null。 */
export function motionForEvent(event: CombatEvent, agentId: string): ActorMotionPlan | null {
  switch (event.kind) {
    case 'cardPlayed': {
      const motions = AGENT_MOTIONS[agentId] ?? SWORDSMAN_MOTIONS;
      const base = motions[event.motion];
      const preset =
        agentId === 'mirror-seer' && event.mark
          ? {
              ...base,
              burst: {
                kind: burstKindForMark(event.mark),
                on: base.burst?.on ?? (event.targets.length > 0 ? 'opponent' : 'self'),
                delay: base.burst?.delay ?? 80,
              },
            }
          : base;
      return { actor: 'player', opponents: event.targets, preset };
    }
    case 'enemyAct':
      return {
        actor: event.target,
        opponents: TARGETS_PLAYER.has(event.action) ? ['player'] : [],
        preset: ENEMY_MOTIONS[event.action],
      };
    default:
      return null;
  }
}

/** このキャラの位置にエフェクトを出すか。 */
export function burstsOn(plan: ActorMotionPlan, me: ActorId): boolean {
  if (!plan.preset.burst) return false;
  return plan.preset.burst.on === 'self' ? plan.actor === me : plan.opponents.includes(me);
}
