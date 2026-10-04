import { humanoid, quadruped, sideWings, winged, withAura } from '../modelBuilders';
import type { ActorModel, ModelPart, Vec3 } from '../modelTypes';
import { box, capsule, cone, cylinder, eyes, sphere, taper, torus } from '../parts';

/**
 * 風わたる草原（草属性）。若葉の緑・木肌の茶・白い花、吹き抜ける風の輪で統一する。
 */

const LEAF = '#5FBF4A';
const LEAF_DARK = '#3E8A34';
const LEAF_LIGHT = '#9AE07A';
const BARK = '#6A4E2E';
const WIND = '#D8FFE8';
const SPIRIT = '#C8FF6A';

/** 平たい木の葉。 */
const leaf = (size: number, color: string, position: Vec3, extra?: Partial<ModelPart>): ModelPart =>
  sphere(size, color, position, { scale: [0.45, 0.06, 1], ...extra });

/** 小さな白い花。 */
const blossom = (position: Vec3, color = '#FFF4F8'): ModelPart[] => [
  ...[0, 1, 2, 3, 4].map((index) => {
    const angle = (index / 5) * Math.PI * 2;
    return sphere(0.035, color, [position[0] + Math.cos(angle) * 0.04, position[1] + Math.sin(angle) * 0.04, position[2]], {
      scale: [1, 1, 0.4],
    });
  }),
  sphere(0.025, '#FFD84A', [position[0], position[1], position[2] + 0.01], { glow: true }),
];

/** 体のまわりを流れる風の輪。 */
const windRing = (radius: number, y: number, tilt: number, phase: number): ModelPart =>
  torus(radius, 0.012, WIND, [0, y, 0], {
    rotation: [Math.PI / 2 + tilt, 0, 0],
    glow: true,
    opacity: 0.55,
    animation: 'hover',
    phase,
  });

/** 木の葉の羽を持つ小さな妖精。 */
function leafFairy(): ActorModel {
  const skin = '#F5E0C0';
  const wing = (side: 1 | -1, y: number, size: number, phase: number): ModelPart =>
    sphere(size, LEAF_LIGHT, [0.24 * side, y, -0.12], {
      scale: [1, 0.05, 0.42],
      rotation: [0.3, 0, (y > 0 ? 0.6 : -0.3) * side],
      glow: true,
      opacity: 0.6,
      animation: side === 1 ? 'flapRight' : 'flapLeft',
      phase,
    });
  const parts: ModelPart[] = [
    taper(0.1, 0.3, 0.5, LEAF, [0, -0.38, 0], { segments: 8 }),
    ...[0, 1, 2, 3, 4, 5].map((index) => {
      const angle = (index / 6) * Math.PI * 2;
      return leaf(0.14, LEAF_DARK, [Math.cos(angle) * 0.26, -0.62, Math.sin(angle) * 0.26], {
        rotation: [0, -angle, 0.9],
      });
    }),
    capsule(0.03, 0.18, skin, [0.05, -0.8, 0]),
    capsule(0.03, 0.18, skin, [-0.05, -0.8, 0]),
    capsule(0.035, 0.22, skin, [0.16, -0.18, 0.02], { rotation: [0, 0, 0.6] }),
    capsule(0.035, 0.22, skin, [-0.16, -0.18, 0.02], { rotation: [0, 0, -0.6] }),
    sphere(0.22, skin, [0, 0.08, 0]),
    sphere(0.235, '#7ACB4A', [0, 0.14, -0.04], { scale: [1, 0.9, 1] }),
    ...[-0.12, -0.04, 0.04, 0.12].map((x, index) =>
      leaf(0.07, '#7ACB4A', [x, 0.2, 0.17], { rotation: [1.2, 0, (index - 1.5) * 0.3] }),
    ),
    ...eyes(0.075, 0.08, 0.2, 0.04),
    ...blossom([0.14, 0.3, 0.1], '#FFB8D0'),
    wing(1, 0.05, 0.3, 0),
    wing(-1, 0.05, 0.3, 0),
    wing(1, -0.2, 0.22, 0.15),
    wing(-1, -0.2, 0.22, 0.15),
    sphere(0.035, SPIRIT, [0.45, 0.3, 0.1], { glow: true, animation: 'hover', phase: 0.2 }),
    sphere(0.03, SPIRIT, [-0.4, -0.1, 0.15], { glow: true, animation: 'hover', phase: 0.6 }),
  ];
  return { parts, idle: 'float', yaw: 0.35, scale: 0.85, aura: 'grass' };
}

/** 苔むした幹に枝の腕、葉の冠を戴く大樹の巨人。 */
function greatTreant(): ActorModel {
  const root = (angle: number): ModelPart =>
    cone(0.12, 0.5, BARK, [Math.cos(angle) * 0.38, -0.88, Math.sin(angle) * 0.3], {
      rotation: [Math.sin(angle) * 1.2, 0, -Math.cos(angle) * 1.2],
    });
  const canopy: [Vec3, number, string][] = [
    [[0, 0.62, -0.05], 0.42, LEAF_DARK],
    [[0.32, 0.5, 0.05], 0.3, LEAF],
    [[-0.34, 0.52, 0.0], 0.3, LEAF],
    [[0.12, 0.85, 0.05], 0.28, LEAF],
    [[-0.18, 0.8, 0.12], 0.24, LEAF_LIGHT],
    [[0.2, 0.62, 0.3], 0.18, LEAF_LIGHT],
  ];
  const parts: ModelPart[] = [
    taper(0.3, 0.4, 1.0, BARK, [0, -0.42, 0], { segments: 9 }),
    ...[0.6, 2.2, 3.8, 5.0].map(root),
    ...[-0.18, 0.02, 0.2].map((x, index) =>
      box([0.035, 0.7 - index * 0.1, 0.03], '#4A3420', [x, -0.45, 0.33 - Math.abs(x) * 0.3], { rotation: [0, 0, x * 0.3] }),
    ),
    box([0.1, 0.05, 0.04], SPIRIT, [0.1, 0.0, 0.33], { glow: true, rotation: [0, 0, -0.2] }),
    box([0.1, 0.05, 0.04], SPIRIT, [-0.1, 0.0, 0.33], { glow: true, rotation: [0, 0, 0.2] }),
    sphere(0.08, '#2A1A10', [0, -0.18, 0.33], { scale: [1.4, 0.6, 0.5] }),
    capsule(0.09, 0.42, BARK, [0.48, -0.0, 0], { rotation: [0, 0, -1.0] }),
    capsule(0.08, 0.38, BARK, [0.7, -0.32, 0.05], { rotation: [0, 0, -0.2] }),
    capsule(0.09, 0.42, BARK, [-0.48, -0.0, 0], { rotation: [0, 0, 1.0] }),
    capsule(0.08, 0.38, BARK, [-0.7, -0.32, 0.05], { rotation: [0, 0, 0.2] }),
    ...[-0.1, 0, 0.1].map((dz, index) =>
      cone(0.035, 0.18, BARK, [0.74 + dz * 0.5, -0.58, 0.05 + dz], { rotation: [Math.PI, 0, (index - 1) * 0.3] }),
    ),
    ...[-0.1, 0, 0.1].map((dz, index) =>
      cone(0.035, 0.18, BARK, [-0.74 - dz * 0.5, -0.58, 0.05 + dz], { rotation: [Math.PI, 0, (index - 1) * 0.3] }),
    ),
    sphere(0.14, LEAF, [0.55, 0.15, 0.05]),
    sphere(0.14, LEAF, [-0.55, 0.15, 0.05]),
    ...canopy.map(([position, radius, color]) => sphere(radius, color, position)),
    sphere(0.12, '#4E9A3A', [0.25, -0.75, 0.32], { scale: [1.3, 0.5, 0.8] }),
    sphere(0.1, '#4E9A3A', [-0.3, -0.3, 0.33], { scale: [1, 0.6, 0.5] }),
    ...blossom([0.3, 0.7, 0.35]),
    ...blossom([-0.3, 0.6, 0.3]),
    ...blossom([0.05, 0.98, 0.25], '#FFB8D0'),
  ];
  return { parts, idle: 'bob', yaw: 0.4, scale: 1.15, aura: 'grass' };
}

/** 鷲の頭と翼に獅子の体。嵐をまとう草原の王者（横向き、頭が +x）。 */
function stormGriffin(): ActorModel {
  const fur = '#C8A060';
  const feather = '#F4F0E4';
  const talon = '#E8B530';
  const parts: ModelPart[] = [
    capsule(0.24, 0.6, fur, [-0.12, -0.36, 0], { rotation: [0, 0, Math.PI / 2] }),
    sphere(0.28, feather, [0.25, -0.24, 0], { scale: [1, 1.1, 0.95] }),
    sphere(0.2, feather, [0.48, 0.08, 0]),
    cone(0.07, 0.22, talon, [0.7, 0.04, 0], { rotation: [0, 0, -Math.PI / 2 - 0.4] }),
    box([0.1, 0.04, 0.08], talon, [0.64, -0.03, 0]),
    sphere(0.035, '#1E2A3A', [0.58, 0.14, 0.13], { glow: false }),
    sphere(0.035, '#1E2A3A', [0.58, 0.14, -0.13]),
    ...[0, 1, 2].map((index) =>
      cone(0.05, 0.26, feather, [0.34 - index * 0.06, 0.2 - index * 0.06, 0], { rotation: [0, 0, 1.3 + index * 0.15] }),
    ),
    // 前脚は鷲のかぎ爪、後ろ脚は獅子の脚。
    capsule(0.06, 0.26, talon, [0.28, -0.7, 0.12]),
    capsule(0.06, 0.26, talon, [0.28, -0.7, -0.12]),
    ...[0.12, -0.12].flatMap((z) =>
      [-0.04, 0.04].map((dz) => cone(0.02, 0.08, '#3A2A1A', [0.36, -0.95, z + dz], { rotation: [0, 0, -Math.PI / 2] })),
    ),
    capsule(0.08, 0.24, fur, [-0.45, -0.7, 0.12]),
    capsule(0.08, 0.24, fur, [-0.45, -0.7, -0.12]),
    capsule(0.04, 0.5, fur, [-0.7, -0.15, 0], { rotation: [0, 0, 0.6], animation: 'sway' }),
    sphere(0.08, '#8A6A3A', [-0.86, 0.06, 0], { animation: 'sway' }),
    ...sideWings({ membrane: feather, bone: '#D8D0BC', tip: '#8A9AB8', root: [0.05, -0.1, 0], span: 1.05 }),
    windRing(0.75, -0.2, 0.2, 0),
    windRing(0.6, 0.15, -0.25, 0.5),
    box([0.03, 0.22, 0.03], '#FFF6A0', [0.0, 0.62, 0.1], { glow: true, rotation: [0, 0, 0.5] }),
    box([0.03, 0.18, 0.03], '#FFF6A0', [0.06, 0.45, 0.1], { glow: true, rotation: [0, 0, -0.5] }),
  ];
  return { parts, idle: 'float', yaw: -0.45, scale: 1.3, aura: 'grass' };
}

/** 双葉を揺らす種の子ども。 */
function seedSprout(): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.5, '#B08A4A', [0, -0.55, 0], { scale: [1, 0.85, 1] }),
    sphere(0.42, '#C8A060', [0, -0.5, 0.12], { scale: [0.9, 0.75, 0.8] }),
    ...eyes(0.16, -0.45, 0.48, 0.07),
    sphere(0.05, '#FF9AA8', [0.28, -0.56, 0.42], { opacity: 0.7 }),
    sphere(0.05, '#FF9AA8', [-0.28, -0.56, 0.42], { opacity: 0.7 }),
    cylinder(0.04, 0.35, LEAF_DARK, [0, 0.0, 0]),
    leaf(0.26, LEAF, [0.2, 0.18, 0], { rotation: [0, 0, 0.5], scale: [1, 0.06, 0.5], animation: 'sway' }),
    leaf(0.26, LEAF, [-0.2, 0.18, 0], { rotation: [0, 0, -0.5], scale: [1, 0.06, 0.5], animation: 'sway', phase: 0.5 }),
    sphere(0.09, '#FFB8D0', [0, 0.25, 0], { scale: [1, 1.3, 1] }),
    ...[-0.25, 0, 0.25].map((x) => cone(0.04, 0.16, '#8A6A3A', [x, -0.98, 0.1], { rotation: [Math.PI, 0, x] })),
  ];
  return { parts, idle: 'squish', yaw: 0.35, scale: 0.65, aura: 'grass' };
}

/** 葉を巻き上げる小さなつむじ風。 */
function gustSprite(): ActorModel {
  const rings = [0, 1, 2, 3, 4].map((index) =>
    torus(0.14 + index * 0.09, 0.03, WIND, [0, -0.8 + index * 0.24, 0], {
      rotation: [Math.PI / 2 + (index % 2 ? 0.15 : -0.15), 0, 0],
      opacity: 0.6,
      glow: true,
      animation: 'hover',
      phase: index * 0.2,
    }),
  );
  const leaves = [0, 1, 2, 3].map((index) => {
    const angle = (index / 4) * Math.PI * 2;
    return leaf(0.08, index % 2 ? LEAF : LEAF_LIGHT, [Math.cos(angle) * 0.5, -0.5 + index * 0.25, Math.sin(angle) * 0.5], {
      animation: 'orbit',
      phase: index / 4,
    });
  });
  const parts: ModelPart[] = [
    ...rings,
    ...leaves,
    sphere(0.2, '#F4FFF8', [0, 0.3, 0.05], { glow: true, opacity: 0.85 }),
    ...eyes(0.07, 0.32, 0.22, 0.035),
    box([0.06, 0.02, 0.02], '#3A5A4A', [0, 0.24, 0.24]),
  ];
  return { parts, idle: 'float', yaw: 0.3, scale: 0.75, aura: 'grass' };
}

export const GRASSLAND_MODELS: Record<string, ActorModel> = {
  'wind-hawk': withAura(winged('#8A6A44', '#C8B070', {
    head: '#F0F0F0',
    beak: true,
    wingTip: '#5A4A30',
    span: 1.1,
    extras: [
      ...[-0.15, 0, 0.15].map((x) => cone(0.07, 0.4, '#6A5034', [x, -0.62, -0.12], { rotation: [Math.PI - 0.5, 0, x * 2] })),
      cone(0.04, 0.2, '#F0F0F0', [0, 0.52, -0.05], { rotation: [-0.6, 0, 0] }),
      windRing(0.7, -0.1, 0.2, 0),
    ],
  }), 'grass'),
  'leaf-fairy': leafFairy(),
  'grass-wolf': withAura(quadruped('#5E7A44', {
    belly: '#A8C080',
    eyeColor: '#E8FF6A',
    tail: 'bushy',
    extras: [
      ...[0, 1, 2, 3, 4].map((index) =>
        cone(0.07, 0.3, index % 2 ? LEAF : LEAF_DARK, [0.32 - index * 0.06, -0.06 + (index % 2) * 0.06, (index - 2) * 0.08], {
          rotation: [0, 0, 1.4],
        }),
      ),
      leaf(0.1, LEAF, [-0.84, 0.08, 0.04], { rotation: [0, 0, 0.8] }),
      ...[0.1, -0.1].map((z) => cone(0.025, 0.07, '#FFFFFF', [0.78, -0.2, z], { rotation: [Math.PI, 0, 0] })),
    ],
  }), 'grass'),
  'forest-ranger': humanoid({
    skin: '#F0C9A0',
    body: '#3E7A3A',
    legs: '#4A3A2A',
    accent: '#2C5A2A',
    headgear: 'hood',
    weapon: 'bow',
    magic: SPIRIT,
    cape: '#4A7A34',
    boots: '#4A3420',
    extras: [
      cylinder(0.07, 0.42, '#6A4A2A', [-0.15, -0.05, -0.22], { rotation: [0, 0, 0.5] }),
      ...[-0.02, 0.03, 0.08].map((dx) =>
        cone(0.025, 0.08, '#F0F0F0', [-0.26 + dx, 0.19, -0.22], { rotation: [0, 0, 0.5] }),
      ),
      leaf(0.06, LEAF_LIGHT, [0.14, 0.02, 0.18], { rotation: [1.2, 0, 0.5] }),
    ],
  }, { aura: 'grass' }),
  'great-treant': greatTreant(),
  'storm-griffin': stormGriffin(),
  'seed-sprout': seedSprout(),
  'gust-sprite': gustSprite(),
  'horn-rabbit': withAura(quadruped('#EDE6D6', {
    belly: '#FFFFFF',
    ears: 'long',
    tail: 'puff',
    snout: 0.05,
    size: 0.55,
    extras: [
      cone(0.05, 0.3, '#E2C27A', [0.62, 0.2, 0], { rotation: [0, 0, -0.6], segments: 6 }),
      sphere(0.04, '#FF9AA8', [0.71, -0.1, 0]),
      ...blossom([0.44, 0.2, 0.12], '#FFB8D0'),
    ],
  }), 'grass'),
};
