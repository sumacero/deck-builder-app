import { humanoid, orbitingShards, slime, withAura } from '../modelBuilders';
import type { ActorModel, ModelPart, Vec3 } from '../modelTypes';
import { box, capsule, cone, crystals, cylinder, eyes, octahedron, rock, sphere, taper, torus } from '../parts';

/**
 * 水の古都（水属性）。澄んだ水色・氷の結晶・苔むした古い石材とサンゴで統一する。
 */

const ICE = '#BFF0FF';
const ICE_GLOW = '#7AF0FF';
const DEEP = '#2A6A8A';
const CORAL = '#FF8AA0';
const SEAWEED = '#3E8A6A';
const RUIN_STONE = '#A8A090';

/** 水面の波紋（足元の輪）。 */
const ripple = (radius: number, phase: number): ModelPart =>
  torus(radius, 0.015, ICE_GLOW, [0, -0.95, 0], {
    rotation: [Math.PI / 2, 0, 0],
    glow: true,
    opacity: 0.5,
    animation: 'hover',
    phase,
  });

/** 揺れる海藻。 */
const seaweed = (position: Vec3, length: number, phase: number): ModelPart =>
  capsule(0.025, length, SEAWEED, position, { animation: 'sway', phase });

/** 氷の傘から触手を垂らすクラゲ。 */
function frostJelly(): ActorModel {
  const tentacles = [0, 1, 2, 3, 4, 5].map((index) => {
    const angle = (index / 6) * Math.PI * 2;
    return capsule(0.03, 0.5, '#A8E0F8', [Math.cos(angle) * 0.28, -0.42, Math.sin(angle) * 0.22], {
      opacity: 0.75,
      animation: 'sway',
      phase: index / 6,
    });
  });
  const parts: ModelPart[] = [
    sphere(0.5, '#A8E0F8', [0, 0.12, 0], { scale: [1, 0.68, 1], opacity: 0.72 }),
    sphere(0.3, '#E8FCFF', [0, 0.1, 0], { glow: true, opacity: 0.55, scale: [1, 0.7, 1] }),
    torus(0.46, 0.04, '#D8F6FF', [0, -0.08, 0], { rotation: [Math.PI / 2, 0, 0], opacity: 0.8 }),
    ...tentacles,
    capsule(0.07, 0.4, '#D8F6FF', [0.06, -0.4, 0.05], { opacity: 0.7, animation: 'sway', phase: 0.3 }),
    capsule(0.07, 0.36, '#D8F6FF', [-0.06, -0.38, -0.02], { opacity: 0.7, animation: 'sway', phase: 0.8 }),
    ...eyes(0.13, 0.08, 0.44, 0.05),
    ...crystals([0, 0.42, 0], ICE, 0.7),
  ];
  return { parts, idle: 'float', yaw: 0.35, scale: 0.85, aura: 'water' };
}

/** 長い髪と人魚の尾を持つ、霧の中で歌う魔物。 */
function mistSiren(): ActorModel {
  const tail = '#3A8AA8';
  const fin = '#8AD0F0';
  return humanoid(
    {
      skin: '#D8EEF8',
      body: '#3A6AA8',
      legs: tail,
      accent: '#8AD0F0',
      headgear: 'longHair',
      hair: '#5AC8E0',
      weapon: 'staff',
      magic: '#E8FCFF',
      lowerBody: [
        taper(0.2, 0.16, 0.36, tail, [0, -0.6, 0], { segments: 10 }),
        taper(0.16, 0.08, 0.32, tail, [0.06, -0.86, 0.06], { rotation: [0.3, 0, 0.25], segments: 10 }),
        sphere(0.22, fin, [0.16, -1.0, 0.18], { scale: [1, 0.08, 0.5], rotation: [0.3, 0.6, 0.4], opacity: 0.85, animation: 'sway' }),
        sphere(0.22, fin, [0.0, -1.0, 0.22], { scale: [1, 0.08, 0.5], rotation: [0.3, -0.6, -0.4], opacity: 0.85, animation: 'sway', phase: 0.4 }),
        ...[-0.45, -0.65, -0.82].map((y) => torus(0.17 - (y + 0.45) * -0.15, 0.015, fin, [0, y, 0], { rotation: [Math.PI / 2, 0, 0] })),
      ],
      extras: [
        sphere(0.07, CORAL, [0.08, -0.04, 0.17], { scale: [1, 0.8, 0.5] }),
        sphere(0.07, CORAL, [-0.08, -0.04, 0.17], { scale: [1, 0.8, 0.5] }),
        sphere(0.05, '#FFFFFF', [0.2, 0.52, 0.12], { glow: true }),
        sphere(0.03, ICE_GLOW, [0.6, 0.6, 0.1], { glow: true, animation: 'hover', phase: 0.3 }),
        sphere(0.025, ICE_GLOW, [0.7, 0.3, 0.1], { glow: true, animation: 'hover', phase: 0.7 }),
      ],
    },
    { idle: 'float', aura: 'water' },
  );
}

/** 海面から鎌首をもたげる大海蛇（横向き、頭が +x）。 */
function abyssSerpent(): ActorModel {
  const scaleColor = DEEP;
  const belly = '#8AD0E0';
  const segments: [Vec3, number][] = [
    [[-0.55, -0.82, 0], 0.22],
    [[-0.3, -0.7, 0], 0.25],
    [[-0.1, -0.48, 0], 0.24],
    [[0.02, -0.22, 0], 0.22],
    [[0.06, 0.04, 0], 0.2],
    [[0.14, 0.28, 0], 0.18],
  ];
  const parts: ModelPart[] = [
    ...segments.map(([position, radius]) => sphere(radius, scaleColor, position)),
    ...segments.slice(1).map(([[x, y, z], radius]) => sphere(radius * 0.8, belly, [x + radius * 0.35, y, z + 0.03], { scale: [0.6, 1, 0.9] })),
    ...segments.map(([[x, y], radius], index) =>
      cone(0.06, 0.2 + radius * 0.3, '#1E4A6A', [x - radius * 0.6, y + radius * 0.6, 0], {
        rotation: [0, 0, 0.8 - index * 0.05],
        segments: 4,
      }),
    ),
    sphere(0.22, scaleColor, [0.36, 0.46, 0], { scale: [1.5, 0.8, 0.95] }),
    box([0.26, 0.08, 0.2], belly, [0.5, 0.36, 0], { rotation: [0, 0, -0.2] }),
    sphere(0.045, ICE_GLOW, [0.46, 0.53, 0.14], { glow: true }),
    sphere(0.045, ICE_GLOW, [0.46, 0.53, -0.14], { glow: true }),
    sphere(0.18, '#5AB8D8', [0.22, 0.58, 0.16], { scale: [1, 0.08, 0.6], rotation: [0.5, 0, 0.6], opacity: 0.85, animation: 'sway' }),
    sphere(0.18, '#5AB8D8', [0.22, 0.58, -0.16], { scale: [1, 0.08, 0.6], rotation: [-0.5, 0, 0.6], opacity: 0.85, animation: 'sway', phase: 0.5 }),
    cone(0.04, 0.3, '#EDE3C8', [0.24, 0.66, 0.07], { rotation: [0, 0, 1.9] }),
    cone(0.04, 0.3, '#EDE3C8', [0.24, 0.66, -0.07], { rotation: [0, 0, 1.9] }),
    capsule(0.012, 0.35, '#CFEFF0', [0.58, 0.32, 0.1], { rotation: [0, 0, 1.2], animation: 'sway' }),
    capsule(0.012, 0.35, '#CFEFF0', [0.58, 0.32, -0.1], { rotation: [0, 0, 1.2], animation: 'sway', phase: 0.5 }),
    ripple(0.5, 0),
    ripple(0.75, 0.5),
    sphere(0.12, '#E8FCFF', [-0.75, -0.92, 0.1], { opacity: 0.6 }),
    sphere(0.08, '#E8FCFF', [-0.2, -0.95, 0.25], { opacity: 0.6 }),
  ];
  return { parts, idle: 'bob', yaw: -0.45, scale: 1.1, aura: 'water' };
}

/** 氷の冠とドレスの女王。まわりを氷片が回る。 */
function frozenEmpress(): ActorModel {
  const gown = '#BFE6FF';
  return humanoid(
    {
      skin: '#EAF4FF',
      body: '#7AB8E8',
      legs: gown,
      accent: '#E8F8FF',
      headgear: 'iceCrown',
      hair: '#F0FAFF',
      weapon: 'staff',
      magic: ICE_GLOW,
      eyeColor: ICE_GLOW,
      cape: '#CFEFFF',
      lowerBody: [
        taper(0.26, 0.58, 0.72, gown, [0, -0.64, 0], { segments: 16 }),
        taper(0.27, 0.48, 0.5, '#7AB8E8', [0, -0.56, 0.06], { segments: 16, opacity: 0.7 }),
        torus(0.56, 0.03, ICE_GLOW, [0, -0.99, 0], { rotation: [Math.PI / 2, 0, 0], glow: true }),
      ],
      extras: [
        sphere(0.265, '#F0FAFF', [0, 0.44, -0.05], { scale: [1, 0.9, 1] }),
        taper(0.22, 0.3, 0.7, '#F0FAFF', [0, 0.05, -0.18], { rotation: [0.12, 0, 0], scale: [1, 1, 0.5] }),
        ...[-0.3, -0.15, 0, 0.15, 0.3].map((x) =>
          cone(0.05, 0.36 - Math.abs(x) * 0.4, ICE, [x, 0.42 + (0.3 - Math.abs(x)) * 0.3, -0.22], {
            rotation: [-0.3, 0, -x * 1.6],
            opacity: 0.85,
            glow: true,
            segments: 4,
          }),
        ),
        ...crystals([0.42, 0.52, 0.14], ICE, 0.5),
        ...orbitingShards(ICE, 5, 0.8, -0.45, true),
      ],
    },
    { scale: 1.2, idle: 'float', aura: 'water' },
  );
}

/** 氷の結晶の核を持つ小さな精霊。 */
function iceWisp(): ActorModel {
  const parts: ModelPart[] = [
    octahedron(0.36, ICE, [0, 0, 0], { scale: [0.8, 1.3, 0.8], opacity: 0.8, animation: 'spin' }),
    sphere(0.18, '#FFFFFF', [0, 0, 0], { glow: true, opacity: 0.85 }),
    ...eyes(0.07, 0.02, 0.18, 0.035),
    ...orbitingShards(ICE, 4, 0.55, -0.15, true),
    torus(0.5, 0.012, ICE_GLOW, [0, -0.1, 0], { rotation: [Math.PI / 2 + 0.3, 0, 0], glow: true, opacity: 0.6, animation: 'hover' }),
  ];
  return { parts, idle: 'float', yaw: 0.3, scale: 0.7, aura: 'water' };
}

/** 背中に崩れた石柱を背負う、遺跡に棲むカニ（正面向き）。 */
function ruinCrab(): ActorModel {
  const shell = '#3A8A8A';
  const belly = '#7AC0B8';
  const leg = (side: 1 | -1, index: number): ModelPart =>
    capsule(0.04, 0.3, shell, [side * (0.42 + index * 0.04), -0.78, 0.1 - index * 0.15], {
      rotation: [0, 0, side * (0.9 + index * 0.1)],
    });
  const claw = (side: 1 | -1): ModelPart[] => [
    capsule(0.07, 0.28, shell, [side * 0.55, -0.42, 0.2], { rotation: [0.4, 0, side * 0.9] }),
    sphere(0.17, shell, [side * 0.72, -0.2, 0.32], { scale: [1, 0.7, 0.8] }),
    cone(0.08, 0.26, belly, [side * 0.8, 0.0, 0.36], { rotation: [0, 0, -side * 0.3] }),
    cone(0.06, 0.2, shell, [side * 0.64, 0.0, 0.36], { rotation: [0, 0, side * 0.3] }),
  ];
  const parts: ModelPart[] = [
    sphere(0.48, shell, [0, -0.55, 0], { scale: [1.25, 0.58, 1] }),
    sphere(0.4, belly, [0, -0.62, 0.12], { scale: [1.2, 0.45, 0.9] }),
    ...[0, 1, 2].flatMap((index) => [leg(1, index), leg(-1, index)]),
    ...claw(1),
    ...claw(-1),
    cylinder(0.02, 0.18, shell, [0.12, -0.24, 0.3]),
    cylinder(0.02, 0.18, shell, [-0.12, -0.24, 0.3]),
    sphere(0.055, '#111111', [0.12, -0.13, 0.31]),
    sphere(0.055, '#111111', [-0.12, -0.13, 0.31]),
    sphere(0.018, '#FFFFFF', [0.135, -0.11, 0.36], { glow: true }),
    sphere(0.018, '#FFFFFF', [-0.105, -0.11, 0.36], { glow: true }),
    // 背中の遺跡: 崩れた石柱と苔。
    cylinder(0.13, 0.36, RUIN_STONE, [0.08, -0.08, -0.15], { rotation: [0, 0, 0.25], segments: 8 }),
    box([0.34, 0.08, 0.3], RUIN_STONE, [0.03, -0.27, -0.15]),
    rock(0.08, RUIN_STONE, [-0.25, -0.25, -0.1]),
    sphere(0.1, SEAWEED, [0.12, 0.1, -0.13], { scale: [1.3, 0.4, 1.2] }),
    seaweed([-0.2, -0.05, -0.2], 0.25, 0.2),
    seaweed([0.3, -0.1, -0.15], 0.2, 0.7),
    sphere(0.04, CORAL, [-0.32, -0.32, 0.2]),
    sphere(0.035, CORAL, [0.34, -0.36, 0.22]),
  ];
  return { parts, idle: 'bob', yaw: 0.35, scale: 0.68, aura: 'water' };
}

/** 水没した古都をさまよう、ランタンを提げた亡霊。 */
function ancientPhantom(): ActorModel {
  const robe = '#7FA8C8';
  const glow = '#9FF0FF';
  const parts: ModelPart[] = [
    cone(0.5, 1.15, robe, [0, -0.35, 0], { opacity: 0.7 }),
    ...[-0.3, -0.1, 0.1, 0.3].map((x, index) =>
      cone(0.1, 0.3, robe, [x, -0.95, 0.15 - Math.abs(x) * 0.2], { rotation: [Math.PI, 0, 0], opacity: 0.6, animation: 'sway', phase: index * 0.25 }),
    ),
    torus(0.32, 0.03, '#5A7A9A', [0, 0.05, 0], { rotation: [Math.PI / 2, 0, 0], opacity: 0.85 }),
    sphere(0.3, robe, [0, 0.32, 0], { opacity: 0.78 }),
    cone(0.26, 0.38, robe, [0, 0.64, -0.08], { rotation: [-0.45, 0, 0], opacity: 0.78 }),
    sphere(0.2, '#0E1426', [0, 0.3, 0.14], { scale: [1, 1.1, 0.6] }),
    sphere(0.045, glow, [0.07, 0.32, 0.26], { glow: true }),
    sphere(0.045, glow, [-0.07, 0.32, 0.26], { glow: true }),
    capsule(0.06, 0.38, robe, [0.36, -0.05, 0.05], { rotation: [0, 0, 0.5], opacity: 0.75 }),
    capsule(0.06, 0.34, robe, [-0.34, -0.1, 0.05], { rotation: [0, 0, -0.4], opacity: 0.75 }),
    cylinder(0.012, 0.22, '#B8B0A0', [0.52, -0.3, 0.1]),
    box([0.16, 0.2, 0.16], '#5A6A7A', [0.52, -0.5, 0.1], { opacity: 0.5 }),
    cone(0.11, 0.08, '#5A6A7A', [0.52, -0.36, 0.1], { segments: 4 }),
    sphere(0.08, glow, [0.52, -0.5, 0.1], { glow: true, animation: 'hover' }),
    seaweed([-0.2, -0.4, 0.3], 0.3, 0.3),
    sphere(0.03, glow, [-0.5, 0.3, 0.1], { glow: true, animation: 'orbit', phase: 0.2 }),
  ];
  return { parts, idle: 'float', yaw: 0.35, scale: 0.95, aura: 'water' };
}

export const SUNKEN_CITY_MODELS: Record<string, ActorModel> = {
  'frost-jelly': frostJelly(),
  'drowned-guard': humanoid(
    {
      skin: '#8AB8B0',
      body: '#2E5A6A',
      legs: '#1E3A44',
      accent: '#4A9AA8',
      headgear: 'helmet',
      weapon: 'trident',
      magic: ICE_GLOW,
      shield: true,
      emblem: ICE_GLOW,
      eyeColor: ICE_GLOW,
      pauldrons: true,
      boots: '#1E2A30',
      extras: [
        ...crystals([0.3, 0.1, 0], CORAL, 0.5, false),
        seaweed([-0.2, -0.3, 0.18], 0.3, 0.1),
        seaweed([0.15, -0.55, 0.18], 0.25, 0.6),
        sphere(0.035, RUIN_STONE, [0.1, -0.05, 0.19]),
        sphere(0.03, RUIN_STONE, [-0.12, -0.2, 0.19]),
      ],
    },
    { aura: 'water' },
  ),
  'mist-siren': mistSiren(),
  'ice-witch': humanoid(
    {
      skin: '#E0EEF8',
      body: '#4A7AB8',
      legs: '#2E4A7A',
      accent: '#2E4A7A',
      headgear: 'wizardHat',
      hair: '#E8F4FF',
      weapon: 'staff',
      magic: ICE_GLOW,
      robe: '#3A6AA8',
      extras: [
        capsule(0.07, 0.4, '#E8F4FF', [0.2, 0.15, -0.05], { rotation: [0, 0, 0.1] }),
        capsule(0.07, 0.4, '#E8F4FF', [-0.2, 0.15, -0.05], { rotation: [0, 0, -0.1] }),
        ...crystals([0.42, 0.55, 0.14], ICE, 0.45),
        ...orbitingShards(ICE, 3, 0.7, -0.2, true),
      ],
    },
    { scale: 1.05, aura: 'water' },
  ),
  'abyss-serpent': abyssSerpent(),
  'frozen-empress': frozenEmpress(),
  'ice-wisp': iceWisp(),
  'bubble-slime': withAura(
    slime('#6AC8F0', {
      extras: [
        sphere(0.1, '#FFFFFF', [0.2, -0.6, 0.2], { opacity: 0.35 }),
        sphere(0.07, '#FFFFFF', [-0.25, -0.7, 0.1], { opacity: 0.35 }),
        sphere(0.09, '#E8FCFF', [0.3, 0.35, 0], { opacity: 0.5, animation: 'hover', phase: 0.1 }),
        sphere(0.06, '#E8FCFF', [-0.2, 0.25, 0.1], { opacity: 0.5, animation: 'hover', phase: 0.5 }),
        sphere(0.04, '#E8FCFF', [0.05, 0.45, -0.1], { opacity: 0.5, animation: 'hover', phase: 0.8 }),
      ],
    }),
    'water',
    { scale: 0.65 },
  ),
  'ruin-crab': ruinCrab(),
  'ancient-phantom': ancientPhantom(),
};
