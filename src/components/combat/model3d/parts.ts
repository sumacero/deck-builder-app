import type { ModelPart, Vec3 } from './modelTypes';

/**
 * モデルを組み立てる部品の作成関数。基本図形と、炎・結晶・歯車などの使い回す飾り。
 */

type PartExtra = Partial<Omit<ModelPart, 'shape' | 'color' | 'position'>>;
/** 円錐・円柱では側面の分割数も指定できる（4 で角ばった結晶・とげになる）。 */
type Extra = PartExtra & { segments?: number };

/** extra から形の指定（segments）を取り除き、部品の属性だけにする。 */
function attributes(extra: Extra | undefined): PartExtra {
  const rest: Extra = { ...extra };
  delete rest.segments;
  return rest;
}

export const EYE_COLOR = '#111111';

export const box = (size: Vec3, color: string, position: Vec3, extra?: Extra): ModelPart => ({
  shape: { kind: 'box', size },
  color,
  position,
  ...attributes(extra),
});

export const sphere = (radius: number, color: string, position: Vec3, extra?: Extra): ModelPart => ({
  shape: { kind: 'sphere', radius },
  color,
  position,
  ...attributes(extra),
});

export const cone = (
  radius: number,
  height: number,
  color: string,
  position: Vec3,
  extra?: Extra,
): ModelPart => ({
  shape: { kind: 'cone', radius, height, segments: extra?.segments },
  color,
  position,
  ...attributes(extra),
});

export const cylinder = (
  radius: number,
  height: number,
  color: string,
  position: Vec3,
  extra?: Extra,
): ModelPart => ({
  shape: { kind: 'cylinder', radiusTop: radius, radiusBottom: radius, height, segments: extra?.segments },
  color,
  position,
  ...attributes(extra),
});

/** 上下で太さの違う円柱（幹・ドレスの裾・脚など）。 */
export const taper = (
  radiusTop: number,
  radiusBottom: number,
  height: number,
  color: string,
  position: Vec3,
  extra?: Extra,
): ModelPart => ({
  shape: { kind: 'cylinder', radiusTop, radiusBottom, height, segments: extra?.segments },
  color,
  position,
  ...attributes(extra),
});

export const capsule = (
  radius: number,
  length: number,
  color: string,
  position: Vec3,
  extra?: Extra,
): ModelPart => ({
  shape: { kind: 'capsule', radius, length },
  color,
  position,
  ...attributes(extra),
});

export const rock = (radius: number, color: string, position: Vec3, extra?: Extra): ModelPart => ({
  shape: { kind: 'rock', radius },
  color,
  position,
  ...attributes(extra),
});

export const torus = (
  radius: number,
  tube: number,
  color: string,
  position: Vec3,
  extra?: Extra,
): ModelPart => ({
  shape: { kind: 'torus', radius, tube },
  color,
  position,
  ...attributes(extra),
});

export const octahedron = (
  radius: number,
  color: string,
  position: Vec3,
  extra?: Extra,
): ModelPart => ({
  shape: { kind: 'octahedron', radius },
  color,
  position,
  ...attributes(extra),
});

/** 目に入れるアニメ調のハイライト。 */
export const eyeShine = (x: number, y: number, z: number): ModelPart =>
  sphere(0.018, '#FFFFFF', [x + 0.012, y + 0.018, z], { glow: true });

/** 左右一対の目。color を渡すと光る目、省略すると黒目 + ハイライト。 */
export function eyes(spread: number, y: number, z: number, radius: number, color?: string): ModelPart[] {
  const glow = color !== undefined;
  const pair = [spread, -spread].map((x) =>
    sphere(radius, color ?? EYE_COLOR, [x, y, z], { glow, scale: [1, glow ? 0.8 : 1.3, 0.6] }),
  );
  if (glow) return pair;
  return [...pair, eyeShine(spread, y, z + radius * 0.5), eyeShine(-spread, y, z + radius * 0.5)];
}

/** 頭の上に乗せる王冠。y は王冠の底の高さ。 */
export function crown(y: number, color = '#E2B53E', width = 0.26): ModelPart[] {
  const spikes = [-1, 0, 1].map((step) => cone(0.06, 0.16, color, [step * width * 0.6, y + 0.17, 0]));
  return [cylinder(width, 0.12, color, [0, y + 0.06, 0]), ...spikes];
}

/** ゆらめく炎。外側の赤・中の橙・芯の黄を重ねる。position は炎の根元。 */
export function flame(position: Vec3, size = 1, phase = 0): ModelPart[] {
  const [x, y, z] = position;
  const layer = (radius: number, height: number, color: string, offset: number): ModelPart =>
    cone(radius * size, height * size, color, [x, y + (height * size) / 2, z + offset], {
      glow: true,
      opacity: 0.9,
      animation: 'flicker',
      phase: phase + offset * 3,
    });
  return [
    layer(0.12, 0.36, '#E8402A', 0),
    layer(0.085, 0.28, '#FF9A2A', 0.02),
    layer(0.05, 0.18, '#FFE36A', 0.04),
  ];
}

/** 地面や体から突き出す結晶の束。position は束の根元。 */
export function crystals(position: Vec3, color: string, size = 1, glow = true): ModelPart[] {
  const [x, y, z] = position;
  const spikes: [number, number, number, number][] = [
    [0, 0.3, 0, 0],
    [0.08, 0.2, 0.03, -0.45],
    [-0.08, 0.22, -0.02, 0.5],
    [0.02, 0.16, 0.08, 0.15],
  ];
  return spikes.map(([dx, height, dz, tilt]) =>
    cone(0.06 * size, height * size, color, [x + dx * size, y + (height * size) / 2, z + dz * size], {
      rotation: [dz * 3, 0, tilt],
      glow,
      opacity: 0.88,
      segments: 4,
    }),
  );
}

/**
 * 歯車。既定では正面を向き、rotation で傾ける。spin を付けると回り、reverse で逆回転。
 */
export function gear(
  position: Vec3,
  radius: number,
  color: string,
  options?: { rotation?: Vec3; spin?: boolean; reverse?: boolean; teeth?: number; thickness?: number },
): ModelPart {
  return {
    shape: {
      kind: 'gear',
      radius,
      teeth: options?.teeth ?? Math.max(6, Math.round(radius * 30)),
      thickness: options?.thickness ?? Math.max(0.03, radius * 0.25),
    },
    color,
    position,
    rotation: options?.rotation,
    animation: options?.spin ? 'roll' : undefined,
    phase: options?.reverse ? 0.5 : 0,
  };
}

/** ジグザグの稲妻。start から下向きに、segments 本の光る棒でつなぐ。 */
export function lightning(start: Vec3, length: number, color = '#FFE04A', segments = 3): ModelPart[] {
  const step = length / segments;
  return Array.from({ length: segments }, (_, index) => {
    const side = index % 2 === 0 ? 1 : -1;
    return box([0.035, step * 1.15, 0.035], color, [start[0] + side * 0.04, start[1] - step * (index + 0.5), start[2]], {
      rotation: [0, 0, side * 0.5],
      glow: true,
    });
  });
}