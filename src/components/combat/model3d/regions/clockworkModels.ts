import { golem, humanoid, quadruped, withAura } from '../modelBuilders';
import type { ActorModel, ModelPart, Vec3 } from '../modelTypes';
import { box, capsule, cone, crown, cylinder, gear, lightning, sphere, taper, torus } from '../parts';

/**
 * 雷鳴の歯車塔（属性なし）。真鍮と鋼鉄・回る歯車・青白い雷光で統一する。
 */

const BRASS = '#C8A040';
const BRASS_DARK = '#8A6A2A';
const STEEL = '#5A6070';
const STEEL_LIGHT = '#8A9098';
const SPARK = '#FFE04A';
const ARC = '#7AE8FF';

/** 電気をためるコイル（肩や背中の飾り）。 */
const teslaCoil = (position: Vec3, height = 0.3): ModelPart[] => {
  const [x, y, z] = position;
  return [
    cylinder(0.05, height, STEEL, [x, y + height / 2, z]),
    ...[0.25, 0.5, 0.75].map((ratio) => torus(0.07, 0.018, BRASS, [x, y + height * ratio, z], { rotation: [Math.PI / 2, 0, 0] })),
    sphere(0.07, ARC, [x, y + height + 0.05, z], { glow: true }),
  ];
};

/** 宙に浮かぶ真鍮の目玉。上でプロペラが回り、下に雷を垂らす。 */
function thunderEye(): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.42, BRASS, [0, 0, 0]),
    torus(0.44, 0.04, BRASS_DARK, [0, 0, 0], { rotation: [Math.PI / 2, 0, 0] }),
    sphere(0.26, '#F4F0E0', [0, 0, 0.26], { scale: [1, 1, 0.6] }),
    sphere(0.15, SPARK, [0, 0, 0.4], { glow: true, scale: [1, 1, 0.4] }),
    sphere(0.07, '#1A1A1A', [0, 0, 0.46], { scale: [1, 1, 0.4] }),
    torus(0.28, 0.035, STEEL, [0, 0, 0.3]),
    gear([0.44, 0.05, 0], 0.16, STEEL_LIGHT, { rotation: [0, Math.PI / 2, 0], spin: true }),
    gear([-0.44, 0.05, 0], 0.16, STEEL_LIGHT, { rotation: [0, Math.PI / 2, 0], spin: true, reverse: true }),
    cylinder(0.03, 0.18, STEEL, [0, 0.5, 0]),
    box([0.8, 0.02, 0.1], STEEL_LIGHT, [0, 0.6, 0], { animation: 'spin' }),
    box([0.1, 0.02, 0.8], STEEL_LIGHT, [0, 0.6, 0], { animation: 'spin' }),
    cone(0.12, 0.18, STEEL, [0, -0.46, 0], { rotation: [Math.PI, 0, 0] }),
    ...lightning([0, -0.55, 0], 0.4, ARC),
  ];
  return { parts, idle: 'float', yaw: 0.4, scale: 0.8, aura: 'thunder' };
}

/** 背中に雷のコイルを立てた、鋼鉄の巨人。 */
function thunderGolem(): ActorModel {
  const base = golem(STEEL, {
    glow: SPARK,
    rocky: false,
    extras: [
      gear([0, -0.15, 0.28], 0.16, BRASS, { spin: true }),
      ...teslaCoil([0.55, 0.12, -0.05]),
      ...teslaCoil([-0.55, 0.12, -0.05]),
      ...lightning([0.55, 0.55, -0.05], 0.3, ARC, 2),
      ...lightning([-0.55, 0.55, -0.05], 0.3, ARC, 2),
      box([0.2, 0.08, 0.06], BRASS, [0, 0.6, 0]),
      box([0.94, 0.06, 0.54], BRASS, [0, -0.52, 0]),
      ...[0.3, -0.3].map((x) => cylinder(0.04, 0.12, BRASS_DARK, [x, -0.05, 0.27], { rotation: [Math.PI / 2, 0, 0] })),
    ],
  });
  return { ...base, scale: 1.15, aura: 'thunder' };
}

/** 背に巨大な歯車の光輪を背負う、歯車塔の機皇。 */
function gearEmperor(): ActorModel {
  const robe = '#3A2E4A';
  const parts: ModelPart[] = [
    gear([0, 0.3, -0.4], 0.72, BRASS, { spin: true, teeth: 18, thickness: 0.06 }),
    gear([0.62, 0.72, -0.45], 0.28, BRASS_DARK, { spin: true, reverse: true, teeth: 10 }),
    gear([-0.66, -0.05, -0.45], 0.24, BRASS_DARK, { spin: true, reverse: true, teeth: 9 }),
    sphere(0.1, ARC, [0, 0.3, -0.36], { glow: true }),
    taper(0.3, 0.55, 0.7, robe, [0, -0.65, 0], { segments: 12 }),
    torus(0.54, 0.03, BRASS, [0, -0.98, 0], { rotation: [Math.PI / 2, 0, 0] }),
    taper(0.34, 0.26, 0.55, STEEL, [0, -0.1, 0], { segments: 8, scale: [1, 1, 0.75] }),
    box([0.4, 0.4, 0.06], BRASS, [0, -0.08, 0.2], { rotation: [0, 0, Math.PI / 4] }),
    sphere(0.12, SPARK, [0, -0.08, 0.25], { glow: true, scale: [1, 1, 0.5] }),
    ...lightning([0, -0.2, 0.26], 0.3, SPARK, 2),
    sphere(0.17, BRASS, [0.38, 0.12, 0], { scale: [1.2, 0.8, 1] }),
    sphere(0.17, BRASS, [-0.38, 0.12, 0], { scale: [1.2, 0.8, 1] }),
    cylinder(0.07, 0.36, STEEL_LIGHT, [0.46, -0.12, 0.02], { rotation: [0, 0, 0.15] }),
    cylinder(0.07, 0.36, STEEL_LIGHT, [-0.46, -0.12, 0.02], { rotation: [0, 0, -0.15] }),
    gear([0.46, 0.04, 0.08], 0.07, BRASS, { spin: true }),
    gear([-0.46, 0.04, 0.08], 0.07, BRASS, { spin: true, reverse: true }),
    box([0.14, 0.14, 0.14], STEEL, [0.5, -0.38, 0.06]),
    box([0.14, 0.14, 0.14], STEEL, [-0.5, -0.38, 0.06]),
    ...[-0.04, 0.04].map((dz) => cone(0.03, 0.12, STEEL_LIGHT, [0.52, -0.5, 0.06 + dz], { rotation: [Math.PI, 0, 0] })),
    cylinder(0.035, 1.25, BRASS_DARK, [0.56, -0.15, 0.12]),
    sphere(0.12, ARC, [0.56, 0.55, 0.12], { glow: true }),
    torus(0.15, 0.02, BRASS, [0.56, 0.55, 0.12], { animation: 'spin' }),
    box([0.42, 0.42, 0.4], STEEL, [0, 0.38, 0]),
    box([0.34, 0.07, 0.04], ARC, [0, 0.4, 0.21], { glow: true }),
    box([0.46, 0.06, 0.44], BRASS, [0, 0.2, 0]),
    ...crown(0.6, BRASS, 0.24),
    sphere(0.05, ARC, [0, 0.82, 0.04], { glow: true }),
    box([0.7, 0.9, 0.04], robe, [0, -0.25, -0.24], { rotation: [0.12, 0, 0] }),
  ];
  return { parts, idle: 'bob', yaw: 0.35, scale: 1.2, aura: 'thunder' };
}

/** 雷をためた甲羅の甲虫（正面向き）。 */
function thunderBeetle(): ActorModel {
  const shell = '#E0C040';
  const leg = (side: 1 | -1, index: number): ModelPart =>
    capsule(0.03, 0.28, '#2A2A2A', [side * 0.38, -0.78, 0.15 - index * 0.2], { rotation: [0, 0, side * 1.0] });
  const parts: ModelPart[] = [
    sphere(0.36, shell, [0.17, -0.45, -0.05], { scale: [0.5, 0.75, 1.1] }),
    sphere(0.36, shell, [-0.17, -0.45, -0.05], { scale: [0.5, 0.75, 1.1] }),
    box([0.03, 0.5, 0.7], '#2A2A2A', [0, -0.3, -0.05]),
    box([0.42, 0.04, 0.5], '#2A2A2A', [0, -0.25, -0.05], { opacity: 0.6 }),
    sphere(0.22, '#2A2A2A', [0, -0.5, 0.38]),
    cone(0.06, 0.38, '#2A2A2A', [0, -0.18, 0.48], { rotation: [-0.5, 0, 0] }),
    sphere(0.04, ARC, [0, 0.0, 0.58], { glow: true }),
    ...[1, -1].map((side) => sphere(0.045, ARC, [side * 0.1, -0.44, 0.56], { glow: true })),
    ...[1, -1].map((side) =>
      capsule(0.012, 0.3, '#2A2A2A', [side * 0.12, -0.25, 0.5], { rotation: [-0.6, 0, -side * 0.5], animation: 'sway', phase: side > 0 ? 0 : 0.5 }),
    ),
    ...[0, 1, 2].flatMap((index) => [leg(1, index), leg(-1, index)]),
    ...lightning([0.15, 0.0, -0.1], 0.3, SPARK, 2),
    ...lightning([-0.2, -0.05, 0.1], 0.25, SPARK, 2),
  ];
  return { parts, idle: 'bob', yaw: 0.4, scale: 0.6, aura: 'thunder' };
}

/** 檻の中に雷を閉じ込めた宝珠。 */
function teslaOrb(): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.3, ARC, [0, 0, 0], { glow: true, opacity: 0.85 }),
    sphere(0.45, '#C8F4FF', [0, 0, 0], { opacity: 0.25 }),
    torus(0.5, 0.03, BRASS, [0, 0, 0], { rotation: [Math.PI / 2, 0, 0] }),
    torus(0.5, 0.03, BRASS, [0, 0, 0], { animation: 'spin' }),
    torus(0.5, 0.03, BRASS_DARK, [0, 0, 0], { rotation: [0, Math.PI / 2, 0], animation: 'spin', phase: 0.25 }),
    cone(0.1, 0.16, BRASS, [0, 0.58, 0]),
    cone(0.1, 0.16, BRASS, [0, -0.58, 0], { rotation: [Math.PI, 0, 0] }),
    ...lightning([0.1, 0.25, 0.1], 0.5, '#FFFFFF', 3),
    sphere(0.04, SPARK, [0.7, 0, 0], { glow: true, animation: 'orbit' }),
    sphere(0.04, SPARK, [-0.7, 0.1, 0], { glow: true, animation: 'orbit', phase: 0.5 }),
  ];
  return { parts, idle: 'float', yaw: 0.3, scale: 0.65, aura: 'thunder' };
}

export const CLOCKWORK_MODELS: Record<string, ActorModel> = {
  'gear-soldier': humanoid(
    {
      skin: '#A8A8B0',
      body: STEEL,
      legs: '#3A4048',
      accent: BRASS,
      headgear: 'visor',
      weapon: 'spear',
      magic: SPARK,
      pauldrons: true,
      boots: '#2A2E36',
      emblem: SPARK,
      extras: [
        gear([0, -0.08, 0.2], 0.11, BRASS, { spin: true }),
        cylinder(0.025, 0.2, BRASS_DARK, [0, -0.1, -0.28], { rotation: [Math.PI / 2, 0, 0] }),
        torus(0.08, 0.02, BRASS, [0, -0.1, -0.4], { rotation: [0, Math.PI / 2, 0], animation: 'spin' }),
      ],
    },
    { aura: 'thunder' },
  ),
  'spark-drone': thunderEye(),
  'iron-hound': withAura(
    quadruped(STEEL, {
      belly: STEEL_LIGHT,
      eyeColor: ARC,
      snout: 0.26,
      extras: [
        gear([0.26, -0.3, 0.24], 0.13, BRASS, { spin: true }),
        gear([-0.4, -0.36, 0.22], 0.11, BRASS, { spin: true, reverse: true }),
        ...[-0.3, -0.12, 0.06].map((x) => box([0.14, 0.05, 0.3], BRASS_DARK, [x, -0.12, 0], { rotation: [0, 0, 0.2] })),
        cylinder(0.035, 0.22, STEEL_LIGHT, [-0.25, 0.0, 0.12], { rotation: [0, 0, -0.3] }),
        cylinder(0.035, 0.22, STEEL_LIGHT, [-0.25, 0.0, -0.12], { rotation: [0, 0, -0.3] }),
        sphere(0.04, ARC, [-0.22, 0.13, 0.12], { glow: true, animation: 'flicker' }),
        sphere(0.04, ARC, [-0.22, 0.13, -0.12], { glow: true, animation: 'flicker', phase: 0.5 }),
        box([0.2, 0.04, 0.2], BRASS_DARK, [0.78, -0.22, 0]),
      ],
    }),
    'thunder',
  ),
  'clockwork-knight': humanoid(
    {
      skin: '#B8B8C0',
      body: '#4A5060',
      legs: '#30343C',
      accent: BRASS,
      headgear: 'plumeHelm',
      weapon: 'lance',
      magic: ARC,
      shield: true,
      emblem: BRASS,
      eyeColor: ARC,
      cape: '#2E3A5A',
      pauldrons: true,
      boots: '#22262E',
      extras: [
        gear([-0.5, -0.2, 0.2], 0.14, BRASS, { spin: true }),
        gear([0, -0.08, 0.2], 0.09, BRASS_DARK, { spin: true, reverse: true }),
      ],
    },
    { scale: 1.1, aura: 'thunder' },
  ),
  'thunder-golem': thunderGolem(),
  'gear-emperor': gearEmperor(),
  'bolt-bug': thunderBeetle(),
  'cog-rat': withAura(
    quadruped('#8A8078', {
      belly: '#B0A898',
      ears: 'none',
      tail: 'none',
      eyeColor: '#FFB040',
      snout: 0.16,
      size: 0.6,
      extras: [
        gear([0.44, 0.12, 0.12], 0.09, BRASS, { rotation: [0, -0.4, 0], spin: true }),
        gear([0.44, 0.12, -0.12], 0.09, BRASS, { rotation: [0, 0.4, 0], spin: true, reverse: true }),
        gear([-0.1, -0.08, 0], 0.15, BRASS_DARK, { rotation: [Math.PI / 2, 0, 0], spin: true }),
        capsule(0.015, 0.6, STEEL_LIGHT, [-0.7, -0.4, 0], { rotation: [0, 0, 1.3], animation: 'sway' }),
        sphere(0.03, SPARK, [-1.0, -0.45, 0], { glow: true, animation: 'flicker' }),
        ...[0.04, -0.04].map((z) => box([0.03, 0.06, 0.02], '#FFFFFF', [0.84, -0.2, z])),
      ],
    }),
    'thunder',
  ),
  'tesla-orb': teslaOrb(),
};
