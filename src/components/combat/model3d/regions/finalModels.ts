import { humanoid, orbitingShards } from '../modelBuilders';
import type { ActorModel, ModelPart } from '../modelTypes';
import { box, cone, crown, cylinder, octahedron, sphere, torus } from '../parts';

/**
 * ラスボス（3 つの章のあと）。夜空のような黒紫の鎧と、各地から奪った三つの旗（火・水・草）を背負う魔皇。
 */

const NIGHT = '#2A1E44';
const STARLIGHT = '#C9A8FF';
const GOLD = '#E2B84A';

/** 背中に立てた旗。竿の先に属性の色の宝玉、布は風に揺れる。 */
function banner(x: number, tilt: number, cloth: string, phase: number): ModelPart[] {
  return [
    cylinder(0.02, 1.2, '#3A2A1E', [x, 0.25, -0.32], { rotation: [0, 0, tilt] }),
    sphere(0.045, cloth, [x - tilt * 0.6, 0.86, -0.32], { glow: true }),
    box([0.3, 0.38, 0.02], cloth, [x - tilt * 0.5 + 0.16, 0.6, -0.33], {
      rotation: [0, 0, tilt],
      animation: 'sway',
      phase,
    }),
    box([0.3, 0.04, 0.025], GOLD, [x - tilt * 0.5 + 0.16, 0.41, -0.33], {
      rotation: [0, 0, tilt],
      animation: 'sway',
      phase,
    }),
  ];
}

/** 左手に握る旗（体の前、布は外側へなびく）。 */
function heldBanner(cloth: string): ModelPart[] {
  const x = -0.46;
  return [
    cylinder(0.022, 1.5, '#3A2A1E', [x, -0.2, 0.1]),
    sphere(0.05, cloth, [x, 0.57, 0.1], { glow: true }),
    box([0.3, 0.34, 0.02], cloth, [x - 0.16, 0.3, 0.1], { animation: 'sway', phase: 0.33 }),
    box([0.3, 0.04, 0.025], GOLD, [x - 0.16, 0.12, 0.1], { animation: 'sway', phase: 0.33 }),
  ];
}

function starDevourer(): ActorModel {
  return humanoid(
    {
      skin: '#D8CCE8',
      body: NIGHT,
      legs: '#1A1430',
      accent: GOLD,
      headgear: 'horns',
      hair: '#E8E0F8',
      weapon: 'flameSword',
      magic: STARLIGHT,
      eyeColor: '#FF5A8A',
      cape: '#4A1E5A',
      pauldrons: true,
      robe: '#1E1636',
      extras: [
        ...crown(0.58),
        // 胸の中で光る、喰らった星。
        octahedron(0.08, STARLIGHT, [0, -0.04, 0.2], { glow: true, animation: 'spin' }),
        ...banner(-0.5, 0.25, '#4CC27A', 0),
        ...banner(0.5, -0.25, '#E8402A', 0.66),
        ...heldBanner('#3A8AE0'),
        torus(0.62, 0.02, STARLIGHT, [0, -0.98, 0], { rotation: [Math.PI / 2, 0, 0], glow: true, opacity: 0.7 }),
        ...orbitingShards('#6A4AA8', 5, 0.85, -0.3, true),
        ...[0, 0.5].map((phase) =>
          cone(0.03, 0.1, STARLIGHT, [0.7, 0.5, 0.1], { glow: true, animation: 'orbit', phase, segments: 4 }),
        ),
      ],
    },
    { scale: 1.3, idle: 'float', aura: 'arcane' },
  );
}

export const FINAL_MODELS: Record<string, ActorModel> = {
  'star-devourer': starDevourer(),
};
