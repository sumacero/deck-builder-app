import { golem, humanoid, orbitingShards, sideWings, slime, winged, wingPair } from '../modelBuilders';
import type { ActorModel, ModelPart, Vec3 } from '../modelTypes';
import { box, capsule, cone, crystals, flame, rock, sphere } from '../parts';

/**
 * 紅蓮の火山（火属性）。黒い玄武岩・赤く光る溶岩の割れ目・揺らめく炎で統一する。
 */

const LAVA = '#FF7A2B';
const LAVA_CORE = '#FFD23E';
const BASALT = '#3A3438';

/** 体の表面に走る、光る溶岩の割れ目。 */
const lavaCracks = (cracks: [Vec3, number, number][]): ModelPart[] =>
  cracks.map(([position, length, tilt]) =>
    box([0.025, length, 0.02], LAVA, position, { glow: true, rotation: [0, 0, tilt] }),
  );

/** 横向きのトカゲ。地をはう低い体に、背中の炎のとげと燃える尾。 */
function salamander(): ActorModel {
  const body = '#B8402A';
  const belly = '#F0A040';
  const leg = (x: number, z: number): ModelPart[] => [
    capsule(0.06, 0.18, body, [x, -0.8, z], { rotation: [z > 0 ? 0.7 : -0.7, 0, 0] }),
    sphere(0.06, belly, [x + 0.03, -0.92, z * 1.5], { scale: [1.4, 0.5, 1.2] }),
  ];
  const spines = [-0.45, -0.25, -0.05, 0.15, 0.35].map((x, index) =>
    cone(0.05, 0.16 + (index % 2) * 0.04, LAVA, [x, -0.42 + (x > 0 ? 0.02 : 0), 0], {
      glow: true,
      rotation: [0, 0, 0.3],
      segments: 4,
    }),
  );
  const parts: ModelPart[] = [
    capsule(0.2, 0.7, body, [-0.05, -0.62, 0], { rotation: [0, 0, Math.PI / 2] }),
    capsule(0.14, 0.62, belly, [-0.05, -0.7, 0.04], { rotation: [0, 0, Math.PI / 2] }),
    capsule(0.15, 0.22, body, [0.6, -0.54, 0], { rotation: [0, 0, Math.PI / 2 - 0.2] }),
    box([0.24, 0.06, 0.2], belly, [0.68, -0.64, 0], { rotation: [0, 0, -0.15] }),
    sphere(0.045, LAVA_CORE, [0.7, -0.44, 0.1], { glow: true }),
    sphere(0.045, LAVA_CORE, [0.7, -0.44, -0.1], { glow: true }),
    cone(0.04, 0.14, '#5A1E14', [0.58, -0.36, 0.06], { rotation: [0, 0, 0.9] }),
    cone(0.04, 0.14, '#5A1E14', [0.58, -0.36, -0.06], { rotation: [0, 0, 0.9] }),
    ...leg(0.28, 0.16),
    ...leg(0.28, -0.16),
    ...leg(-0.35, 0.16),
    ...leg(-0.35, -0.16),
    ...spines,
    capsule(0.12, 0.4, body, [-0.66, -0.58, 0], { rotation: [0, 0, Math.PI / 2 + 0.35], animation: 'sway' }),
    cone(0.09, 0.3, body, [-0.98, -0.44, 0], { rotation: [0, 0, 1.1], animation: 'sway' }),
    ...flame([-1.1, -0.42, 0], 0.9),
  ];
  return { parts, idle: 'bob', yaw: -0.45, scale: 0.9, aura: 'fire' };
}

/** 赤黒い竜。長い首・角・背のとげ・燃える尾、縁の光る皮膜の翼。 */
function flameDragon(): ActorModel {
  const scale = '#B8322A';
  const dark = '#5A1E1E';
  const belly = '#F0B060';
  const horn = '#EDE3C8';
  const leg = (x: number, z: number, front: boolean): ModelPart[] => [
    capsule(0.1, 0.22, scale, [x, -0.72, z], { rotation: [0, 0, front ? -0.2 : 0.2] }),
    box([0.2, 0.08, 0.16], dark, [x + 0.05, -0.94, z]),
    ...[-0.05, 0, 0.05].map((dz) => cone(0.025, 0.08, horn, [x + 0.16, -0.95, z + dz], { rotation: [0, 0, -Math.PI / 2] })),
  ];
  const spines = [
    [0.36, 0.32],
    [0.2, 0.08],
    [-0.05, -0.02],
    [-0.35, -0.05],
    [-0.6, -0.2],
    [-0.85, -0.38],
  ].map(([x, y], index) =>
    cone(0.06, 0.18 - index * 0.015, dark, [x, y, 0], { rotation: [0, 0, 0.4], segments: 4 }),
  );
  const parts: ModelPart[] = [
    sphere(0.48, scale, [-0.15, -0.35, 0], { scale: [1.3, 0.85, 0.85] }),
    sphere(0.36, belly, [0.0, -0.5, 0.12], { scale: [1.2, 0.7, 0.8] }),
    ...[-0.25, -0.05, 0.15].map((x) => box([0.05, 0.3, 0.3], '#D89448', [x, -0.55, 0.16])),
    capsule(0.15, 0.32, scale, [0.32, -0.02, 0], { rotation: [0, 0, -0.75] }),
    capsule(0.13, 0.22, scale, [0.48, 0.24, 0], { rotation: [0, 0, -0.3] }),
    box([0.36, 0.24, 0.28], scale, [0.66, 0.4, 0]),
    box([0.28, 0.13, 0.22], scale, [0.9, 0.36, 0]),
    box([0.3, 0.06, 0.18], dark, [0.86, 0.24, 0], { rotation: [0, 0, -0.25] }),
    ...[0.08, -0.08].map((z) => cone(0.02, 0.06, horn, [0.98, 0.29, z], { rotation: [Math.PI, 0, 0] })),
    sphere(0.06, LAVA_CORE, [1.02, 0.28, 0], { glow: true }),
    sphere(0.045, LAVA_CORE, [0.74, 0.47, 0.14], { glow: true }),
    sphere(0.045, LAVA_CORE, [0.74, 0.47, -0.14], { glow: true }),
    box([0.12, 0.03, 0.04], dark, [0.74, 0.53, 0.14], { rotation: [0, 0, -0.3] }),
    box([0.12, 0.03, 0.04], dark, [0.74, 0.53, -0.14], { rotation: [0, 0, -0.3] }),
    cone(0.05, 0.34, horn, [0.5, 0.6, 0.09], { rotation: [0, 0, 1.9] }),
    cone(0.05, 0.34, horn, [0.5, 0.6, -0.09], { rotation: [0, 0, 1.9] }),
    cone(0.035, 0.18, horn, [0.62, 0.58, 0.12], { rotation: [0.3, 0, 1.4] }),
    ...spines,
    ...sideWings({ membrane: '#8A2A1E', bone: dark, tip: LAVA, root: [-0.12, -0.05, 0], span: 1.05, glowTip: true }),
    capsule(0.15, 0.35, scale, [-0.78, -0.5, 0], { rotation: [0, 0, 1.25], animation: 'sway' }),
    cone(0.12, 0.45, scale, [-1.1, -0.62, 0], { rotation: [0, 0, 1.4], animation: 'sway' }),
    ...flame([-1.32, -0.66, 0], 1.1, 0.3),
    ...leg(0.18, 0.2, true),
    ...leg(0.18, -0.2, true),
    ...leg(-0.48, 0.2, false),
    ...leg(-0.48, -0.2, false),
  ];
  return { parts, idle: 'bob', yaw: -0.45, scale: 1.2, aura: 'fire' };
}

/** 火を噴く小鬼。小さな翼と先のとがった尾、頭に灯る炎。 */
function cinderImp(): ActorModel {
  return humanoid(
    {
      skin: '#D8503A',
      body: '#5A2A1E',
      legs: '#3A1E16',
      accent: '#8A3A1E',
      headgear: 'horns',
      weapon: 'trident',
      magic: LAVA,
      eyeColor: LAVA_CORE,
      boots: '#2A1410',
      extras: [
        ...wingPair('#5A2A1E', LAVA, [0.32, 0.1, -0.2], 0.5),
        capsule(0.035, 0.45, '#D8503A', [-0.18, -0.6, -0.25], { rotation: [0.8, 0, -0.6], animation: 'sway' }),
        cone(0.07, 0.14, '#D8503A', [-0.36, -0.42, -0.42], { rotation: [0, 0, 0.8], segments: 4 }),
        ...flame([0, 0.62, 0], 0.7),
      ],
    },
    { scale: 0.7, aura: 'fire' },
  );
}

/** 溶岩の滴る、光る芯を抱えた玄武岩の巨像。まわりを溶岩の塊が回る。 */
function basaltColossus(): ActorModel {
  const base = golem(BASALT, {
    glow: LAVA,
    extras: [
      ...lavaCracks([
        [[0.3, -0.4, 0.3], 0.3, 0.3],
        [[-0.32, -0.3, 0.3], 0.26, -0.4],
        [[0.62, -0.35, 0.2], 0.3, 0.1],
        [[-0.62, -0.4, 0.2], 0.28, -0.1],
      ]),
      ...crystals([0.5, 0.15, -0.05], LAVA, 0.7),
      ...crystals([-0.45, 0.15, -0.05], LAVA, 0.6),
      ...flame([0.58, 0.18, 0], 0.7, 0.2),
      ...flame([-0.58, 0.18, 0], 0.7, 0.7),
      ...orbitingShards('#5A3A30', 4, 0.9, -0.3),
      sphere(0.06, LAVA_CORE, [0.9, -0.2, 0], { glow: true, animation: 'orbit', phase: 0.1 }),
    ],
  });
  return { ...base, scale: 1.15, aura: 'fire' };
}

/** 炎の翼のコウモリ。 */
function fireBat(): ActorModel {
  const base = winged('#4A2420', '#C8502A', {
    ears: true,
    eyeColor: LAVA_CORE,
    wingTip: LAVA,
    extras: [
      cone(0.025, 0.07, '#FFFFFF', [0.05, 0.2, 0.25], { rotation: [Math.PI, 0, 0] }),
      cone(0.025, 0.07, '#FFFFFF', [-0.05, 0.2, 0.25], { rotation: [Math.PI, 0, 0] }),
      ...flame([0, 0.5, -0.05], 0.6, 0.4),
      sphere(0.1, LAVA, [0, -0.15, 0.28], { glow: true, scale: [1, 1.2, 0.4] }),
    ],
  });
  return { ...base, scale: 0.8, aura: 'fire' };
}

export const VOLCANO_MODELS: Record<string, ActorModel> = {
  'ember-lizard': salamander(),
  'rock-soldier': humanoid(
    {
      skin: '#8A7E72',
      body: '#5A4E46',
      legs: '#3E3630',
      accent: '#7A6A5E',
      headgear: 'helmet',
      weapon: 'club',
      shield: true,
      emblem: LAVA,
      eyeColor: LAVA,
      pauldrons: true,
      boots: '#2E2622',
      extras: [
        ...lavaCracks([
          [[0.1, -0.2, 0.18], 0.22, 0.4],
          [[-0.12, -0.28, 0.18], 0.18, -0.5],
        ]),
        rock(0.1, '#4A403A', [0.32, 0.18, -0.02]),
        rock(0.1, '#4A403A', [-0.32, 0.18, -0.02]),
        sphere(0.05, LAVA, [0.42, 0.02, 0.14], { glow: true }),
      ],
    },
    { aura: 'fire' },
  ),
  'magma-slime': {
    ...slime('#E8602A', {
      core: LAVA_CORE,
      extras: [
        rock(0.16, BASALT, [0.15, 0.05, 0.1], { scale: [1.2, 0.6, 1] }),
        rock(0.12, BASALT, [-0.3, -0.05, 0.2], { scale: [1.2, 0.6, 1] }),
        rock(0.1, BASALT, [0.4, -0.25, 0.35], { scale: [1.2, 0.6, 1] }),
        ...flame([-0.05, 0.08, -0.1], 0.8),
        ...flame([0.35, -0.02, -0.2], 0.55, 0.5),
      ],
    }),
    aura: 'fire',
  },
  'lava-knight': humanoid(
    {
      skin: '#B89880',
      body: '#2E2226',
      legs: '#22181A',
      accent: '#6A2A1E',
      headgear: 'hornedHelm',
      weapon: 'flameSword',
      magic: LAVA_CORE,
      shield: true,
      emblem: LAVA,
      eyeColor: LAVA,
      cape: '#A8301E',
      pauldrons: true,
      boots: '#1A1214',
      extras: [
        ...lavaCracks([
          [[0.1, -0.15, 0.18], 0.25, 0.3],
          [[-0.1, -0.25, 0.18], 0.2, -0.4],
        ]),
        ...flame([0.3, 0.12, 0], 0.5, 0.2),
        ...flame([-0.3, 0.12, 0], 0.5, 0.7),
      ],
    },
    { scale: 1.1, aura: 'fire' },
  ),
  'obsidian-knight': humanoid(
    {
      skin: '#C4B4A4',
      body: '#2A2428',
      legs: '#1A1618',
      accent: LAVA,
      headgear: 'visor',
      weapon: 'club',
      magic: LAVA_CORE,
      shield: true,
      emblem: LAVA,
      eyeColor: LAVA,
      pauldrons: true,
      boots: '#141012',
      extras: [
        // 背中を覆う黒曜の甲羅。中央の割れ目だけが溶岩色に光る。
        sphere(0.46, '#161216', [0, -0.02, -0.32], { scale: [1.35, 1.15, 0.55] }),
        box([0.04, 0.55, 0.03], LAVA, [0, 0.02, -0.5], { glow: true }),
        sphere(0.08, LAVA_CORE, [0, 0.22, -0.48], { glow: true }),
      ],
    },
    { scale: 1.08, aura: 'fire' },
  ),
  'basalt-colossus': basaltColossus(),
  'flame-dragon': flameDragon(),
  'cinder-imp': cinderImp(),
  'pebble-golem': {
    ...golem('#7A6E66', {
      glow: '#FF9A3A',
      extras: [...flame([0, 0.56, 0], 0.6), ...lavaCracks([[[0.05, -0.2, 0.3], 0.2, 0.4]])],
    }),
    scale: 0.65,
    aura: 'fire',
  },
  'fire-bat': fireBat(),
};
