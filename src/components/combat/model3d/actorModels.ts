import { humanoid } from './modelBuilders';
import type { ActorModel } from './modelTypes';
import { box, capsule, cone, cylinder, flame, onBone, sphere, taper, torus } from './parts';
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
const GOLD = '#E2B84A';
const LEAF = '#6FD38A';
const LEATHER = '#6A4A2E';
const BOOT = '#5A3A22';
const WHIP = '#5A3A22';

/** 膝まである長靴と、上端の折り返し。 */
const tallBoots = (color: string, cuff: string) =>
  [0.12, -0.12].flatMap((x) => [
    capsule(0.093, 0.16, color, [x, -0.78, 0.01]),
    torus(0.092, 0.018, cuff, [x, -0.68, 0.01], { rotation: [Math.PI / 2, 0, 0] }),
  ]);

/** 腕の籠手（手首の少し上）と、上端の縁取り。 */
const bracers = (color: string, trim: string) =>
  ([[0.375, 'arm'], [-0.375, 'offArm']] as const).flatMap(([x, bone]) =>
    onBone(bone, [
      cylinder(0.08, 0.14, color, [x, -0.33, 0.01]),
      torus(0.08, 0.012, trim, [x, -0.26, 0.01], { rotation: [Math.PI / 2, 0, 0] }),
    ]),
  );

/** 左手に握って振るうムチ。振っている間だけ見え、腕の延長として先へ伸びる。 */
const heldWhip = () =>
  onBone('offArm', [
    cylinder(0.026, 0.18, '#3A2618', [-0.38, -0.5, 0.04]),
    ...[0, 1, 2, 3].map((i) =>
      capsule(0.022 - i * 0.003, 0.17, WHIP, [-0.38 - i * 0.022, -0.68 - i * 0.19, 0.04], {
        rotation: [0, 0, -0.08 - i * 0.04],
      }),
    ),
    sphere(0.035, LEAF, [-0.48, -1.35, 0.04], { glow: true }),
  ]).map((part) => ({ ...part, showWith: 'whip' as const }));

/** 瞳の色（黒目の下半分に重ねる）。 */
const irises = (color: string) =>
  [0.08, -0.08].map((x) => box([0.056, 0.045, 0.02], color, [x, 0.38, 0.235]));

export const AGENT_MODELS: Record<string, ActorModel> = {
  // イラスト（2026-10-07）に寄せた姿: 赤い逆立ち髪・琥珀の瞳、紅の上着に金の縁と角ばった金の肩当て、
  // 首に巻いて二本たなびく赤いマフラー、紺のズボンと膝までの長靴、炎をまとった金の鍔の長剣。
  'crimson-hero': humanoid({
    skin: '#F2CBA4',
    body: '#B8322A',
    legs: '#2A2F4A',
    accent: GOLD,
    headgear: 'spikyHair',
    weapon: 'sword',
    magic: '#FFB347',
    cape: '#A82A24',
    hair: '#D8352A',
    pauldrons: true,
    boots: BOOT,
    extras: [
      // 前に跳ねる髪の房。
      cone(0.07, 0.22, '#D8352A', [0.1, 0.66, 0.1], { rotation: [0.6, 0, -0.4] }),
      cone(0.07, 0.22, '#D8352A', [-0.1, 0.66, 0.1], { rotation: [0.6, 0, 0.4] }),
      ...irises('#F0A030'),
      box([0.09, 0.022, 0.02], '#FFFFFF', [0, 0.29, 0.235]),
      // 首に巻いたマフラーと、結び目から背中へたなびく二本の端。
      torus(0.13, 0.055, SCARF, [0, 0.15, 0], { rotation: [Math.PI / 2, 0, 0] }),
      sphere(0.06, SCARF, [0.08, 0.12, 0.13]),
      capsule(0.05, 0.34, SCARF, [-0.16, 0.02, -0.22], { rotation: [0.5, 0, 0.9], animation: 'sway' }),
      capsule(0.045, 0.28, SCARF, [0.1, -0.02, -0.24], { rotation: [0.6, 0, -0.7], animation: 'sway', phase: 0.4 }),
      // 角ばった金の肩当て（丸い肩当ての上に板を重ねる）。
      box([0.26, 0.05, 0.24], GOLD, [0.31, 0.14, 0], { rotation: [0, 0, -0.35] }),
      box([0.26, 0.05, 0.24], GOLD, [-0.31, 0.14, 0], { rotation: [0, 0, 0.35] }),
      // 胸の金の星章。
      sphere(0.04, GOLD, [0, -0.04, 0.2], { glow: true }),
      box([0.16, 0.025, 0.02], GOLD, [0, -0.04, 0.2]),
      box([0.025, 0.16, 0.02], GOLD, [0, -0.04, 0.2]),
      // 上着の裾（金の縁取り）、茶色の革ベルトと金の留め金、腰の小物入れ。
      taper(0.27, 0.33, 0.22, '#B8322A', [0, -0.52, 0], { segments: 10 }),
      torus(0.33, 0.016, GOLD, [0, -0.63, 0], { rotation: [Math.PI / 2, 0, 0] }),
      box([0.52, 0.075, 0.34], LEATHER, [0, -0.42, 0]),
      box([0.09, 0.08, 0.04], GOLD, [0, -0.42, 0.18]),
      box([0.1, 0.12, 0.08], LEATHER, [-0.18, -0.48, 0.17]),
      // 紺の袖（上着の下に着た肌着）。
      ...onBone('arm', [capsule(0.076, 0.3, '#2A2F4A', [0.35, -0.18, 0], { rotation: [0, 0, 0.12] })]),
      ...onBone('offArm', [capsule(0.076, 0.3, '#2A2F4A', [-0.35, -0.18, 0], { rotation: [0, 0, -0.12] })]),
      ...bracers('#9A2620', GOLD),
      ...tallBoots(BOOT, GOLD),
      // マントの裾の金の縁取り。
      box([0.62, 0.025, 0.045], GOLD, [0, -0.76, -0.275], { rotation: [0.14, 0, 0] }),
      // 刃にまとう炎。
      ...onBone('weapon', [
        ...flame([0.44, -0.3, 0.17], 0.75, 0),
        ...flame([0.4, -0.02, 0.18], 0.7, 0.4),
        ...flame([0.44, 0.24, 0.17], 0.6, 0.8),
        ...flame([0.42, 0.46, 0.16], 0.45, 1.2),
        sphere(0.09, '#FFB347', [0.42, 0.1, 0.15], { glow: true, opacity: 0.35, scale: [1, 4.5, 1] }),
      ]),
    ],
  }),
  // イラスト（2026-10-07）に寄せた姿: 薄緑の長い髪・緑の瞳、若葉の冠に白い花、毛皮の肩当てと革の籠手、
  // 胸の革帯、膝までの長靴、ツタの巻いた弓に光る矢、腰に巻いたムチと背中の矢筒。
  'verdant-archer': humanoid(
    {
      skin: '#F5D6B8',
      body: '#3E7A46',
      legs: '#22382C',
      accent: LEATHER,
      emblem: '#C9A86A',
      headgear: 'longHair',
      weapon: 'bow',
      magic: '#9CFFB0',
      cape: '#24553A',
      hair: '#86D9AE',
      boots: BOOT,
      extras: [
        // とがった耳と、若葉の冠と、左に挿した白い花。
        cone(0.05, 0.2, '#F5D6B8', [0.27, 0.42, 0], { rotation: [0, 0, -1.25] }),
        cone(0.05, 0.2, '#F5D6B8', [-0.27, 0.42, 0], { rotation: [0, 0, 1.25] }),
        torus(0.25, 0.022, LEAF, [0, 0.55, 0], { rotation: [Math.PI / 2 - 0.15, 0, 0] }),
        ...[-0.14, 0, 0.14].map((x) =>
          sphere(0.05, LEAF, [x, 0.6, 0.2], { scale: [0.6, 1.2, 0.3], rotation: [0, 0, -x * 3] }),
        ),
        ...[0, 1, 2, 3, 4].map((i) =>
          sphere(0.035, '#FFFFFF', [
            -0.18 + Math.cos((i * 2 * Math.PI) / 5) * 0.045,
            0.6 + Math.sin((i * 2 * Math.PI) / 5) * 0.045,
            0.17,
          ], { scale: [1, 1, 0.5] }),
        ),
        sphere(0.025, '#FFF4A0', [-0.18, 0.6, 0.19], { glow: true }),
        ...irises('#4FC77A'),
        box([0.06, 0.018, 0.02], '#C0605A', [0, 0.29, 0.235]),
        // 狩人の装い: 背中に下ろしたフード、胸で交差する革帯、革の籠手、腰の小物入れ、毛皮の肩当て。
        sphere(0.2, '#24553A', [0, 0.2, -0.22], { scale: [1.25, 0.7, 0.8] }),
        box([0.06, 0.64, 0.04], LEATHER, [0, -0.12, 0.19], { rotation: [0, 0, 0.7] }),
        box([0.05, 0.5, 0.035], LEATHER, [0, -0.16, 0.185], { rotation: [0, 0, -0.7] }),
        ...tallBoots(BOOT, '#8A6A44'),
        // ツタの巻いた弓と、つがえた光る矢。
        ...onBone('weapon', [
          ...([
            [0.389, 0.221],
            [0.491, -0.061],
            [0.491, -0.279],
            [0.389, -0.561],
          ] as const).map(([x, y], i) =>
            sphere(0.035, LEAF, [x, y, 0.17], { scale: [0.6, 1.1, 0.3], rotation: [0, 0, i % 2 === 0 ? 0.6 : -0.6] }),
          ),
          box([0.012, 0.012, 0.46], '#9CFFB0', [0.4, -0.17, 0.33], { glow: true }),
          cone(0.03, 0.08, '#9CFFB0', [0.4, -0.17, 0.6], { rotation: [Math.PI / 2, 0, 0], glow: true, segments: 4 }),
        ]),
        ...bracers(LEATHER, '#8A6A44'),
        box([0.12, 0.12, 0.08], LEATHER, [0.2, -0.5, 0.15]),
        sphere(0.14, '#8A6648', [-0.3, 0.06, 0], { scale: [1.15, 0.65, 1.05] }),
        sphere(0.09, '#A8845E', [-0.32, 0.12, 0.04], { scale: [1.1, 0.5, 1] }),
        // 左腰のムチ: ベルトに差した握りと、腰の横に巻いて吊るした革ひも、少しだけ垂れる先端。
        // ムチを振るう間は手に移るので隠す。
        ...[
          cylinder(0.028, 0.18, '#3A2618', [-0.24, -0.42, 0.15], { rotation: [0.9, 0, 0.15] }),
          sphere(0.034, '#C9A86A', [-0.235, -0.37, 0.22]),
          ...[0, 1, 2].map((i) =>
            torus(0.1 - i * 0.014, 0.018, WHIP, [-0.3 - i * 0.008, -0.58 - i * 0.012, 0.08 + i * 0.01], {
              rotation: [0.12 * i, -0.6, 0],
            }),
          ),
          capsule(0.012, 0.1, WHIP, [-0.33, -0.72, 0.1], { rotation: [0.3, 0, 0.15], animation: 'sway' }),
        ].map((part) => ({ ...part, hideWith: 'whip' as const })),
        ...heldWhip(),
        // 背中の矢筒。
        cylinder(0.07, 0.5, '#6A4A2E', [-0.16, 0.0, -0.24], { rotation: [0.15, 0, 0.45] }),
        ...[0, 1, 2].map((i) =>
          cone(0.03, 0.12, '#EDE3C8', [-0.28 + i * 0.03, 0.27, -0.27 + i * 0.02], { rotation: [0.15, 0, 0.45] }),
        ),
        // 胸元の葉の留め具と、腰の短いスカート。
        sphere(0.045, '#9CFFB0', [0, 0.12, 0.2], { glow: true }),
        taper(0.27, 0.36, 0.26, '#2E6B3C', [0, -0.53, 0], { segments: 10 }),
        torus(0.36, 0.014, '#C9A86A', [0, -0.66, 0], { rotation: [Math.PI / 2, 0, 0] }),
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
