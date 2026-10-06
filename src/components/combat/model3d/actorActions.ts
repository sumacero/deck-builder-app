import type { CombatEvent } from '../../../domain/combat';

/**
 * 3D モデルの全身の姿勢（定位置からのずれ）。攻撃・被弾の動きは、この値の時間変化として表す。
 * three.js に依存しない純粋なデータと関数なので、描画せずに動きを確かめられる。
 */
export type BodyPose = {
  /** 相手の方への前傾（ラジアン）。負でのけぞる。 */
  lean: number;
  /** 相手の方への踏み込み（モデル座標）。負で下がる。 */
  step: number;
  /** 跳び上がる高さ。 */
  hop: number;
  /** 縦軸まわりの回転（回転斬り・回転ムチ）。 */
  spin: number;
  /** 0〜1 の沈み込み（ため・着地・被弾）。 */
  crouch: number;
  /** 武器を持つ腕の肩の回転（z 軸）。正で相手側へ振り上げ、π 近くで真上。 */
  arm: number;
  /** 武器を持つ腕を前（カメラ側）へ出す回転（x 軸）。負で前へ。 */
  armReach: number;
  /** 手首（武器）の回転（z 軸）。腕の回転と足した向きに刃先・弓が向く。 */
  weapon: number;
  /** 反対の腕の肩の回転（z 軸）。正で胸の前を相手側へ、負で外へ振り上げる。 */
  offArm: number;
  /** 反対の腕を前へ出す回転（x 軸）。負で前へ。 */
  offReach: number;
  /** 振るっているムチの見え方。0.5 以上で手のムチが現れ、腰のムチが消える。 */
  whip: number;
  /** 被弾の白い光（0〜1）。 */
  flash: number;
};

export const NEUTRAL_POSE: BodyPose = {
  lean: 0,
  step: 0,
  hop: 0,
  spin: 0,
  crouch: 0,
  arm: 0,
  armReach: 0,
  weapon: 0,
  offArm: 0,
  offReach: 0,
  whip: 0,
  flash: 0,
};

/**
 * カードを使ったときの 3D の動き。どのカードでどれを使うかはキャラクターごとに motionPresets で決める。
 * - 剣: slash（振りかぶって斬る）/ combo（連続斬り）/ cleave（跳んで叩き斬る）/ spin（回転斬り）/ charge（構える）
 * - 弓: shoot（引き絞って放つ）/ rapid（連射）/ volley（空へ放つ大技）/ aim（引き絞ったまま狙う）
 * - ムチ: lash（振りかぶって打ち据える）/ whirlLash（回転して全体を薙ぐ）
 * - 共通: guard（武器を横にして守る）/ hopBack（跳び退いて構える）/ raise（武器を掲げる）/ wince（自傷）
 */
export type ActorAction =
  | 'slash'
  | 'combo'
  | 'cleave'
  | 'spin'
  | 'charge'
  | 'shoot'
  | 'rapid'
  | 'volley'
  | 'aim'
  | 'lash'
  | 'whirlLash'
  | 'guard'
  | 'hopBack'
  | 'raise'
  | 'wince';

/** 被弾の動き。flinch はひるむ、knockback は大きく吹き飛ぶ、blocked はブロックで受け止める。 */
export type HitReaction = 'flinch' | 'knockback' | 'blocked';

/** 動きの 1 コマ。at は 0〜1 の進み具合、省略した値は定位置。 */
type Frame = { at: number } & Partial<BodyPose>;

type Track = { duration: number; frames: Frame[] };

const TURN = Math.PI * 2;

/** 弓は腕と逆に手首を回し、狙う向きに対して常に弓を立てる。 */
const BOW = -1.45;
const DRAW: Partial<BodyPose> = { arm: 1.45, weapon: BOW, offArm: 1.0, offReach: -0.8, lean: -0.1 };
const RELEASE: Partial<BodyPose> = { arm: 1.55, weapon: BOW, offArm: 0.3, offReach: -0.3, lean: 0.04, step: -0.06 };
/** 剣を振りかぶった姿勢と、振り抜いた姿勢。 */
const WIND_UP: Partial<BodyPose> = { arm: 2.3, weapon: -1.3, armReach: -0.3, lean: -0.08 };
const SWING: Partial<BodyPose> = { arm: 0.7, weapon: -2.4, armReach: -0.6, lean: 0.32, step: 0.22 };
const GUARD: Partial<BodyPose> = { arm: 1.0, weapon: 0.6, armReach: -0.4 };

const ACTION_TRACKS: Record<ActorAction, Track> = {
  slash: {
    duration: 560,
    frames: [
      { at: 0 },
      { at: 0.3, ...WIND_UP, crouch: 0.2 },
      { at: 0.45, ...SWING },
      { at: 0.62, ...SWING, arm: 0.6, weapon: -2.5 },
      { at: 1 },
    ],
  },
  combo: {
    duration: 780,
    frames: [
      { at: 0 },
      { at: 0.12, ...WIND_UP },
      { at: 0.24, ...SWING },
      { at: 0.38, arm: 1.2, weapon: -0.2, lean: 0.15, step: 0.2 },
      { at: 0.5, arm: 2.2, weapon: -2.4, lean: 0.25, step: 0.25, armReach: -0.4 },
      { at: 0.64, ...WIND_UP, step: 0.2 },
      { at: 0.78, ...SWING, lean: 0.42, step: 0.3 },
      { at: 0.88, ...SWING, lean: 0.38, step: 0.3 },
      { at: 1 },
    ],
  },
  cleave: {
    duration: 780,
    frames: [
      { at: 0 },
      { at: 0.2, arm: 1.5, weapon: -0.8, crouch: 0.35, lean: -0.05 },
      { at: 0.36, arm: 2.9, weapon: -2.3, hop: 0.28, lean: -0.15, armReach: -0.2 },
      { at: 0.52, arm: 0.4, weapon: -2.1, armReach: -0.7, lean: 0.5, step: 0.35, crouch: 0.3 },
      { at: 0.72, arm: 0.4, weapon: -2.1, armReach: -0.7, lean: 0.45, step: 0.35, crouch: 0.25 },
      { at: 1 },
    ],
  },
  spin: {
    duration: 720,
    frames: [
      { at: 0 },
      { at: 0.15, arm: 1.4, weapon: -2.9, crouch: 0.2, spin: -0.4 },
      { at: 0.6, arm: 1.5, weapon: -3.0, spin: TURN, step: 0.15, lean: 0.1 },
      { at: 0.76, arm: 1.4, weapon: -2.9, spin: TURN, step: 0.1 },
      { at: 1, spin: TURN },
    ],
  },
  charge: {
    duration: 540,
    frames: [
      { at: 0 },
      { at: 0.35, arm: 1.3, weapon: -1.2, armReach: -0.5, crouch: 0.15 },
      { at: 0.72, arm: 1.3, weapon: -1.2, armReach: -0.5, crouch: 0.15 },
      { at: 1 },
    ],
  },
  shoot: {
    duration: 560,
    frames: [
      { at: 0 },
      { at: 0.3, ...DRAW, step: -0.05 },
      { at: 0.42, ...RELEASE },
      { at: 0.66, arm: 1.4, weapon: BOW, step: -0.08 },
      { at: 1 },
    ],
  },
  rapid: {
    duration: 760,
    frames: [
      { at: 0 },
      { at: 0.15, ...DRAW },
      { at: 0.25, ...RELEASE },
      { at: 0.37, ...DRAW },
      { at: 0.47, ...RELEASE },
      { at: 0.59, ...DRAW },
      { at: 0.69, ...RELEASE, step: -0.1 },
      { at: 0.84, arm: 1.4, weapon: BOW },
      { at: 1 },
    ],
  },
  volley: {
    duration: 780,
    frames: [
      { at: 0 },
      { at: 0.3, arm: 2.2, weapon: BOW, offArm: 1.4, offReach: -0.6, lean: -0.25, crouch: 0.2 },
      { at: 0.48, arm: 2.25, weapon: BOW, offArm: 0.4, offReach: -0.2, lean: -0.3, hop: 0.08 },
      { at: 0.7, arm: 2.1, weapon: BOW, lean: -0.1 },
      { at: 1 },
    ],
  },
  aim: {
    duration: 600,
    frames: [
      { at: 0 },
      { at: 0.35, ...DRAW, lean: -0.05 },
      { at: 0.75, ...DRAW, lean: -0.05 },
      { at: 1 },
    ],
  },
  // 反対の腕を外から頭上を回して相手側へ振り下ろす。回し終わりは 1 周（-2π）で定位置と同じ向き。
  lash: {
    duration: 640,
    frames: [
      { at: 0 },
      { at: 0.08, whip: 1, offArm: -0.6, arm: 0.3 },
      { at: 0.32, whip: 1, offArm: -2.5, offReach: 0.3, lean: -0.1, arm: 0.3 },
      { at: 0.46, whip: 1, offArm: -5.0, offReach: -0.4, lean: 0.25, step: 0.15, arm: 0.3 },
      { at: 0.66, whip: 1, offArm: -5.1, offReach: -0.3, lean: 0.2, step: 0.15, arm: 0.3 },
      { at: 0.9, offArm: -TURN },
      { at: 1, offArm: -TURN },
    ],
  },
  whirlLash: {
    duration: 760,
    frames: [
      { at: 0 },
      { at: 0.12, whip: 1, offArm: -1.2, crouch: 0.15 },
      { at: 0.62, whip: 1, offArm: -1.6, spin: -TURN, lean: 0.08 },
      { at: 0.78, whip: 1, offArm: -1.4, spin: -TURN },
      { at: 0.92, offArm: -0.3, spin: -TURN },
      { at: 1, spin: -TURN },
    ],
  },
  guard: {
    duration: 480,
    frames: [
      { at: 0 },
      { at: 0.3, ...GUARD, step: -0.1, crouch: 0.15 },
      { at: 0.7, ...GUARD, step: -0.1, crouch: 0.15 },
      { at: 1 },
    ],
  },
  hopBack: {
    duration: 500,
    frames: [
      { at: 0 },
      { at: 0.3, arm: 1.2, weapon: BOW, step: -0.25, hop: 0.14, lean: -0.1 },
      { at: 0.65, arm: 1.2, weapon: BOW, step: -0.2, crouch: 0.15 },
      { at: 1 },
    ],
  },
  raise: {
    duration: 620,
    frames: [
      { at: 0 },
      { at: 0.35, arm: 2.5, weapon: -2.6, offArm: -0.4, hop: 0.1 },
      { at: 0.65, arm: 2.5, weapon: -2.6, offArm: -0.4, hop: 0.05 },
      { at: 1 },
    ],
  },
  wince: {
    duration: 440,
    frames: [
      { at: 0 },
      { at: 0.25, crouch: 0.3, lean: 0.25, offArm: 0.9, offReach: -0.6, arm: -0.2 },
      { at: 0.6, crouch: 0.3, lean: 0.25, offArm: 0.9, offReach: -0.6, arm: -0.2 },
      { at: 1 },
    ],
  },
};

const HIT_TRACKS: Record<HitReaction, Track> = {
  flinch: {
    duration: 380,
    frames: [
      { at: 0 },
      { at: 0.15, lean: -0.3, step: -0.08, crouch: 0.1, arm: -0.25, offArm: 0.25, flash: 1 },
      { at: 0.45, lean: -0.15, step: -0.05, flash: 0.3 },
      { at: 1 },
    ],
  },
  knockback: {
    duration: 640,
    frames: [
      { at: 0 },
      { at: 0.12, lean: -0.55, step: -0.22, hop: 0.1, arm: -0.5, offArm: 0.5, flash: 1 },
      { at: 0.4, lean: -0.35, step: -0.25, crouch: 0.35, arm: -0.3, offArm: 0.3, flash: 0.4 },
      { at: 0.7, lean: -0.1, step: -0.12, crouch: 0.2 },
      { at: 1 },
    ],
  },
  blocked: {
    duration: 400,
    frames: [
      { at: 0 },
      { at: 0.15, ...GUARD, step: -0.07, lean: -0.08 },
      { at: 0.5, ...GUARD, step: -0.03 },
      { at: 1 },
    ],
  },
};

/** 1 発でこれ以上 HP を削られたら、大きく吹き飛ぶ。 */
const HEAVY_HIT = 10;

const POSE_KEYS = Object.keys(NEUTRAL_POSE) as (keyof BodyPose)[];

/** 0〜1 をなめらかに（始めと終わりをゆっくり）。 */
const smooth = (t: number) => t * t * (3 - 2 * t);

/** 経過時間での姿勢。動きが終わっていれば null。 */
function sampleTrack({ duration, frames }: Track, elapsed: number): BodyPose | null {
  if (elapsed < 0 || elapsed >= duration) return null;
  const t = elapsed / duration;
  const nextIndex = frames.findIndex((frame) => frame.at > t);
  const next = frames[nextIndex === -1 ? frames.length - 1 : nextIndex];
  const prev = frames[Math.max(0, (nextIndex === -1 ? frames.length : nextIndex) - 1)];
  const span = next.at - prev.at;
  const mix = span > 0 ? smooth((t - prev.at) / span) : 1;
  const pose = { ...NEUTRAL_POSE };
  for (const key of POSE_KEYS) {
    const from = prev[key] ?? 0;
    const to = next[key] ?? 0;
    pose[key] = from + (to - from) * mix;
  }
  return pose;
}

export const sampleAction = (action: ActorAction, elapsed: number) => sampleTrack(ACTION_TRACKS[action], elapsed);

export const sampleHit = (reaction: HitReaction, elapsed: number) => sampleTrack(HIT_TRACKS[reaction], elapsed);

/** 被弾イベントから動きを決める。ダメージもブロックも無ければ動かない。 */
export function hitReactionFor(event: CombatEvent): HitReaction | null {
  if (event.kind !== 'hit') return null;
  if (event.hpLoss >= HEAVY_HIT) return 'knockback';
  if (event.hpLoss > 0) return 'flinch';
  return event.blocked > 0 ? 'blocked' : null;
}

const LEAN_ANGLE = 0.35;
const LEAN_STEP = 0.12;
const RECOIL_ANGLE = 0.3;

/** 敵の簡易な動き: 行動で相手へ傾き（lean）、被弾でのけぞって光る（recoil）。どちらも 0〜1。 */
export function pulsePose(lean: number, recoil: number): BodyPose {
  return {
    ...NEUTRAL_POSE,
    lean: lean * LEAN_ANGLE - recoil * RECOIL_ANGLE,
    step: (lean - recoil * 0.5) * LEAN_STEP,
    flash: recoil,
  };
}

/** 同時に起きている動き（攻撃中の被弾など）を足し合わせる。光は強い方。 */
export function combinePoses(poses: (BodyPose | null)[]): BodyPose {
  return poses.reduce<BodyPose>((total, pose) => {
    if (!pose) return total;
    const sum = { ...total };
    for (const key of POSE_KEYS) sum[key] = key === 'flash' ? Math.max(total.flash, pose.flash) : total[key] + pose[key];
    return sum;
  }, NEUTRAL_POSE);
}
