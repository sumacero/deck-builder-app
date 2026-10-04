import type { CardMotion } from '../../../domain/card';
import type { ActorId, CombatEvent } from '../../../domain/combat';
import type { EnemyAction } from '../../../domain/enemy';

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

/** 動きの最中に出すエフェクト絵文字。self は動いた本人、opponent は相手の位置に出る。 */
export type Burst = { emoji: string; on: 'self' | 'opponent'; delay: number };

export type MotionPreset = {
  keyframes: Keyframe[];
  burst?: Burst;
};

/** 放浪の剣士: 踏み込んで斬る、剣を構えて守る。 */
const SWORDSMAN_MOTIONS: Record<CardMotion, MotionPreset> = {
  strike: {
    keyframes: [
      { x: -10, duration: 80 },
      { x: 48, rotate: 12, duration: 120 },
      { x: 48, rotate: 12, duration: 60 },
      { duration: 180 },
    ],
    burst: { emoji: '🗡️', on: 'opponent', delay: 180 },
  },
  flurry: {
    keyframes: [
      { x: -6, duration: 60 },
      { x: 38, rotate: 10, duration: 80 },
      { x: 14, rotate: -6, duration: 70 },
      { x: 42, rotate: 12, duration: 80 },
      { x: 16, rotate: -6, duration: 70 },
      { x: 46, rotate: 14, duration: 80 },
      { duration: 160 },
    ],
    burst: { emoji: '⚔️', on: 'opponent', delay: 140 },
  },
  heavy: {
    keyframes: [
      { y: -26, scale: 1.15, rotate: -18, duration: 220 },
      { x: 54, scale: 1.2, rotate: 22, duration: 110 },
      { x: 54, scale: 1.2, rotate: 22, duration: 90 },
      { duration: 220 },
    ],
    burst: { emoji: '💥', on: 'opponent', delay: 330 },
  },
  guard: {
    keyframes: [
      { x: -12, scale: 0.92, duration: 120 },
      { x: -12, scale: 0.92, duration: 160 },
      { duration: 180 },
    ],
    burst: { emoji: '🛡️', on: 'self', delay: 60 },
  },
  empower: {
    keyframes: [
      { y: -12, scale: 1.25, duration: 220 },
      { y: -12, scale: 1.25, duration: 140 },
      { duration: 220 },
    ],
    burst: { emoji: '🔥', on: 'self', delay: 120 },
  },
  focus: {
    keyframes: [
      { y: -14, duration: 150 },
      { duration: 150 },
      { y: -6, duration: 100 },
      { duration: 100 },
    ],
    burst: { emoji: '✨', on: 'self', delay: 80 },
  },
  sacrifice: {
    keyframes: [
      { rotate: -10, scale: 0.95, duration: 60 },
      { rotate: 10, scale: 0.95, duration: 60 },
      { rotate: -6, duration: 60 },
      { duration: 80 },
    ],
    burst: { emoji: '💢', on: 'self', delay: 40 },
  },
};

/** エージェント id ごとの動き。未登録のエージェントは剣士の動きを使う。 */
const AGENT_MOTIONS: Record<string, Record<CardMotion, MotionPreset>> = {
  'wandering-swordsman': SWORDSMAN_MOTIONS,
};

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
    burst: { emoji: '🛡️', on: 'self', delay: 40 },
  },
  buff: {
    keyframes: [
      { y: -10, scale: 1.25, duration: 200 },
      { y: -10, scale: 1.25, duration: 100 },
      { duration: 220 },
    ],
    burst: { emoji: '💢', on: 'self', delay: 100 },
  },
  heal: {
    keyframes: [
      { y: -6, scale: 1.1, duration: 200 },
      { duration: 220 },
    ],
    burst: { emoji: '🍃', on: 'self', delay: 80 },
  },
  paralyze: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { emoji: '💫', on: 'opponent', delay: 120 },
  },
  chill: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { emoji: '❄️', on: 'opponent', delay: 120 },
  },
  seal: {
    keyframes: [
      { x: 16, scale: 1.05, duration: 120 },
      { duration: 200 },
    ],
    burst: { emoji: '🔒', on: 'opponent', delay: 120 },
  },
  charge: {
    keyframes: [
      { scale: 0.9, duration: 160 },
      { scale: 1.15, duration: 200 },
      { duration: 200 },
    ],
    burst: { emoji: '🔋', on: 'self', delay: 160 },
  },
};

/** 相手（プレイヤー）に向けて行う敵の行動。 */
const TARGETS_PLAYER: ReadonlySet<EnemyAction['kind']> = new Set(['attack', 'paralyze', 'chill', 'seal']);

export type ActorMotionPlan = {
  actor: ActorId;
  /** opponent のエフェクトを出す相手。 */
  opponents: ActorId[];
  preset: MotionPreset;
};

/** イベントから「誰が・誰に向けて・どう動くか」を決める。動きの無いイベントは null。 */
export function motionForEvent(event: CombatEvent, agentId: string): ActorMotionPlan | null {
  switch (event.kind) {
    case 'cardPlayed': {
      const motions = AGENT_MOTIONS[agentId] ?? SWORDSMAN_MOTIONS;
      return { actor: 'player', opponents: event.targets, preset: motions[event.motion] };
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
