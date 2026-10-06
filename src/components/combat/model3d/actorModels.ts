import { humanoid } from './modelBuilders';
import type { ActorModel } from './modelTypes';
import { box, capsule, cone, cylinder, sphere, taper, torus } from './parts';
import { CLOCKWORK_MODELS } from './regions/clockworkModels';
import { FINAL_MODELS } from './regions/finalModels';
import { GRASSLAND_MODELS } from './regions/grasslandModels';
import { SUNKEN_CITY_MODELS } from './regions/sunkenCityModels';
import { VOLCANO_MODELS } from './regions/volcanoModels';

/**
 * エージェント / 敵の id と 3D モデルの対応。見た目の情報なので UI 側に置き、ドメインの型には持たせない。
 * ここに無いキャラクターは絵文字アイコンで表示される。
 */

const SCARF = '#E8402A';
const LEAF = '#6FD38A';
const LEATHER = '#6A4A2E';
const WHIP = '#5A3A22';

export const AGENT_MODELS: Record<string, ActorModel> = {
  'crimson-hero': humanoid({
    skin: '#F2CBA4',
    body: '#B8322A',
    legs: '#3A3448',
    accent: '#E2B84A',
    headgear: 'spikyHair',
    weapon: 'sword',
    magic: '#FFE6A0',
    cape: '#7A1E1E',
    hair: '#D8352A',
    pauldrons: true,
    boots: '#4A3428',
    extras: [
      box([0.36, 0.08, 0.3], SCARF, [0, 0.13, 0.02]),
      capsule(0.05, 0.32, SCARF, [-0.16, 0.0, -0.2], { rotation: [0.5, 0, 0.9], animation: 'sway' }),
      box([0.1, 0.12, 0.08], '#6A4A2E', [-0.18, -0.48, 0.15]),
      sphere(0.04, '#E2B84A', [0, -0.04, 0.2], { glow: true }),
    ],
  }),
  'verdant-archer': humanoid(
    {
      skin: '#F5D6B8',
      body: '#3E8A4E',
      legs: '#2F4A3A',
      accent: '#C9A86A',
      headgear: 'longHair',
      weapon: 'bow',
      magic: '#9CFFB0',
      cape: '#24553A',
      hair: '#4FB487',
      boots: '#6A4A2E',
      extras: [
        // とがった耳と、若葉の冠。
        cone(0.05, 0.2, '#F5D6B8', [0.27, 0.42, 0], { rotation: [0, 0, -1.25] }),
        cone(0.05, 0.2, '#F5D6B8', [-0.27, 0.42, 0], { rotation: [0, 0, 1.25] }),
        torus(0.25, 0.022, LEAF, [0, 0.55, 0], { rotation: [Math.PI / 2 - 0.15, 0, 0] }),
        ...[-0.14, 0, 0.14].map((x) =>
          sphere(0.05, LEAF, [x, 0.6, 0.2], { scale: [0.6, 1.2, 0.3], rotation: [0, 0, -x * 3] }),
        ),
        sphere(0.035, '#FFF4D6', [0, 0.6, 0.23], { glow: true }),
        // 狩人の装い: 背中に下ろしたフード、胸を斜めに渡る革帯、革の籠手、腰の小物入れ、毛皮の肩当て。
        sphere(0.2, '#24553A', [0, 0.2, -0.22], { scale: [1.25, 0.7, 0.8] }),
        box([0.06, 0.64, 0.04], LEATHER, [0, -0.12, 0.19], { rotation: [0, 0, 0.7] }),
        cylinder(0.08, 0.14, LEATHER, [0.375, -0.33, 0.01]),
        cylinder(0.08, 0.14, LEATHER, [-0.375, -0.33, 0.01]),
        box([0.12, 0.12, 0.08], LEATHER, [0.2, -0.5, 0.15]),
        sphere(0.14, '#B89A72', [-0.3, 0.06, 0], { scale: [1.15, 0.65, 1.05] }),
        // 左腰のムチ: ベルトに差した握りと、腰の横に巻いて吊るした革ひも、少しだけ垂れる先端。
        cylinder(0.028, 0.18, '#3A2618', [-0.24, -0.42, 0.15], { rotation: [0.9, 0, 0.15] }),
        sphere(0.034, '#C9A86A', [-0.235, -0.37, 0.22]),
        ...[0, 1, 2].map((i) =>
          torus(0.1 - i * 0.014, 0.018, WHIP, [-0.3 - i * 0.008, -0.58 - i * 0.012, 0.08 + i * 0.01], {
            rotation: [0.12 * i, -0.6, 0],
          }),
        ),
        capsule(0.012, 0.1, WHIP, [-0.33, -0.72, 0.1], { rotation: [0.3, 0, 0.15], animation: 'sway' }),
        // 背中の矢筒。
        cylinder(0.07, 0.5, '#6A4A2E', [-0.16, 0.0, -0.24], { rotation: [0.15, 0, 0.45] }),
        ...[0, 1, 2].map((i) =>
          cone(0.03, 0.12, '#EDE3C8', [-0.28 + i * 0.03, 0.27, -0.27 + i * 0.02], { rotation: [0.15, 0, 0.45] }),
        ),
        // 胸元の葉の留め具と、腰の短いスカート。
        sphere(0.045, '#9CFFB0', [0, 0.12, 0.2], { glow: true }),
        taper(0.27, 0.36, 0.2, '#2E6B3C', [0, -0.5, 0], { segments: 10 }),
        // まわりを舞う木の葉。
        ...[0, 0.33, 0.66].map((phase) =>
          sphere(0.05, LEAF, [0.55, 0.1 + phase * 0.3, 0], {
            scale: [0.5, 1.1, 0.25],
            animation: 'orbit',
            phase,
          }),
        ),
      ],
    },
    { aura: 'grass' },
  ),
};

export const ENEMY_MODELS: Record<string, ActorModel> = {
  ...VOLCANO_MODELS,
  ...GRASSLAND_MODELS,
  ...SUNKEN_CITY_MODELS,
  ...CLOCKWORK_MODELS,
  ...FINAL_MODELS,
};
