import { humanoid } from './modelBuilders';
import type { ActorModel } from './modelTypes';
import { box, capsule, sphere } from './parts';
import { CLOCKWORK_MODELS } from './regions/clockworkModels';
import { GRASSLAND_MODELS } from './regions/grasslandModels';
import { SUNKEN_CITY_MODELS } from './regions/sunkenCityModels';
import { VOLCANO_MODELS } from './regions/volcanoModels';

/**
 * エージェント / 敵の id と 3D モデルの対応。見た目の情報なので UI 側に置き、ドメインの型には持たせない。
 * ここに無いキャラクターは絵文字アイコンで表示される。
 */

const SCARF = '#E8402A';

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
};

export const ENEMY_MODELS: Record<string, ActorModel> = {
  ...VOLCANO_MODELS,
  ...GRASSLAND_MODELS,
  ...SUNKEN_CITY_MODELS,
  ...CLOCKWORK_MODELS,
};
