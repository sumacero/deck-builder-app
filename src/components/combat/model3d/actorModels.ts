import {
  dragon,
  floatingEye,
  ghost,
  golem,
  humanoid,
  phantom,
  quadruped,
  slime,
  voidLord,
  winged,
} from './modelBuilders';
import type { ActorModel } from './modelTypes';

/**
 * エージェント / 敵の id と 3D モデルの対応。見た目の情報なので UI 側に置き、ドメインの型には持たせない。
 * ここに無いキャラクターは絵文字アイコンで表示される。
 */

export const AGENT_MODELS: Record<string, ActorModel> = {
  'crimson-hero': humanoid({
    skin: '#F2CBA4',
    body: '#B8322A',
    legs: '#3A3448',
    accent: '#E2B84A',
    headgear: 'spikyHair',
    weapon: 'sword',
    cape: '#7A1E1E',
    hair: '#D8352A',
  }),
};

export const ENEMY_MODELS: Record<string, ActorModel> = {
  // 火・岩（紅蓮の火山）
  'ember-lizard': quadruped('#C8502A', { belly: '#F0A040', eyeColor: '#FFE04A', size: 0.85 }),
  'rock-soldier': humanoid({
    skin: '#9A8E82',
    body: '#6A5E52',
    legs: '#4A4038',
    accent: '#E0702A',
    headgear: 'helmet',
    weapon: 'club',
    shield: true,
    eyeColor: '#FF8A3A',
  }),
  'magma-slime': slime('#E8602A'),
  'lava-knight': humanoid(
    {
      skin: '#B89880',
      body: '#3A2A2A',
      legs: '#2A1E1E',
      accent: '#E8602A',
      headgear: 'helmet',
      weapon: 'sword',
      shield: true,
      eyeColor: '#FF6A2A',
      cape: '#C8402A',
    },
    { scale: 1.1 },
  ),
  'basalt-colossus': { ...golem('#4A4448', '#FF6A2A'), scale: 1.15 },
  'flame-dragon': { ...dragon('#C8402A', '#F0B060', '#8A2A1E'), scale: 1.2 },
  'cinder-imp': humanoid(
    {
      skin: '#D8503A',
      body: '#5A2A1E',
      legs: '#3A1E16',
      headgear: 'horns',
      weapon: 'club',
      eyeColor: '#FFE04A',
    },
    { scale: 0.7 },
  ),
  'pebble-golem': { ...golem('#8A8078', '#FF9A3A'), scale: 0.65 },
  'fire-bat': {
    ...winged('#5A2A22', '#C8502A', { ears: true, eyeColor: '#FFD040' }),
    scale: 0.8,
  },

  // 草・風（風わたる草原）
  'wind-hawk': winged('#8A6A44', '#C8B070', { head: '#F0F0F0', beak: true }),
  'leaf-fairy': ghost('#9AE08A', { scale: 0.85 }),
  'grass-wolf': quadruped('#6E8A4A', { belly: '#A8C080', eyeColor: '#FFE04A' }),
  'forest-ranger': humanoid({
    skin: '#F0C9A0',
    body: '#3E7A3A',
    legs: '#4A3A2A',
    accent: '#2C5A2A',
    headgear: 'hood',
    weapon: 'spear',
    cape: '#5A8A3A',
  }),
  'great-treant': { ...golem('#6A4E2E', '#9AFF6A'), scale: 1.15 },
  'storm-griffin': {
    ...winged('#C8A060', '#E8E0C8', { head: '#F8F8F8', beak: true }),
    scale: 1.3,
  },
  'seed-sprout': slime('#7ACB4A', { scale: 0.6 }),
  'gust-sprite': ghost('#D8F0E8', { scale: 0.7 }),
  'horn-rabbit': quadruped('#E8E0D0', { belly: '#FFFFFF', ears: 'round', size: 0.55 }),

  // 水・氷（水の古都）
  'frost-jelly': ghost('#A8E0F8', { scale: 0.85 }),
  'drowned-guard': humanoid({
    skin: '#8AB8B0',
    body: '#2E5A6A',
    legs: '#1E3A44',
    accent: '#4A9AA8',
    headgear: 'helmet',
    weapon: 'spear',
    shield: true,
    eyeColor: '#7AF0FF',
  }),
  'mist-siren': humanoid({
    skin: '#C8E0F0',
    body: '#3A6AA8',
    legs: '#2A4A7A',
    accent: '#8AD0F0',
    weapon: 'staff',
    hair: '#5AC8E0',
    eyeColor: '#BFF6FF',
  }),
  'ice-witch': humanoid(
    {
      skin: '#E0EEF8',
      body: '#4A7AB8',
      legs: '#2E4A7A',
      accent: '#BFE6FF',
      headgear: 'wizardHat',
      weapon: 'staff',
      eyeColor: '#9AF0FF',
    },
    { scale: 1.05 },
  ),
  'abyss-serpent': { ...dragon('#2A6A8A', '#8AD0E0', '#1E4A6A'), scale: 1.05 },
  'frozen-empress': ghost('#CFEFFF', { crowned: true, scale: 1.2 }),
  'ice-wisp': ghost('#EAF8FF', { scale: 0.7 }),
  'bubble-slime': slime('#6AC8F0', { scale: 0.65 }),
  'ruin-crab': quadruped('#3A8A8A', { belly: '#7AC0B8', eyeColor: '#FFE04A', size: 0.6 }),
  'ancient-phantom': phantom('#7FA8C8', '#9FF0FF'),

  // 電・機械（雷鳴の歯車塔）
  'gear-soldier': humanoid({
    skin: '#A8A8B0',
    body: '#5A6070',
    legs: '#3A4048',
    accent: '#D8B040',
    headgear: 'helmet',
    weapon: 'spear',
    eyeColor: '#FFE04A',
  }),
  'spark-drone': floatingEye('#5A6070', '#FFE04A'),
  'iron-hound': quadruped('#6A707A', { belly: '#8A9098', eyeColor: '#7AE8FF' }),
  'clockwork-knight': humanoid(
    {
      skin: '#B8B8C0',
      body: '#4A5060',
      legs: '#30343C',
      accent: '#E2B84A',
      headgear: 'helmet',
      weapon: 'sword',
      shield: true,
      eyeColor: '#7AE8FF',
    },
    { scale: 1.1 },
  ),
  'thunder-golem': { ...golem('#5A6070', '#FFE04A'), scale: 1.15 },
  'gear-emperor': voidLord('#4A4A58', '#FFD84A'),
  'bolt-bug': quadruped('#E0C040', { belly: '#3A3A3A', eyeColor: '#7AE8FF', size: 0.5 }),
  'cog-rat': quadruped('#8A8078', { belly: '#B0A898', ears: 'round', eyeColor: '#FFB040', size: 0.6 }),
  'tesla-orb': { ...floatingEye('#3A3A5A', '#9AE8FF'), scale: 0.65 },
};
