import {
  dragon,
  floatingEye,
  ghost,
  golem,
  hourglass,
  humanoid,
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
  'wandering-swordsman': humanoid({
    skin: '#F0C9A0',
    body: '#3E6B4A',
    legs: '#4A3A2A',
    accent: '#2C4A34',
    headgear: 'hood',
    weapon: 'sword',
    cape: '#7A2E2E',
  }),
};

export const ENEMY_MODELS: Record<string, ActorModel> = {
  // 第 1 章: 苔むす洞窟
  'cave-slime': slime('#5FCB5A'),
  'fang-rat': quadruped('#8A8078', {
    belly: '#B8ADA2',
    ears: 'round',
    size: 0.8,
  }),
  'rotting-soldier': humanoid({
    skin: '#8FA27A',
    body: '#5A4A3A',
    legs: '#3E352C',
    accent: '#6E5E48',
    weapon: 'sword',
    eyeColor: '#E8F060',
  }),
  'cave-hound': quadruped('#3A3A44', {
    eyeColor: '#FF4A3A',
    belly: '#55555F',
    size: 1.15,
  }),
  'stone-guardian': golem('#8C8A84', '#5AD0FF'),
  'slime-king': slime('#9A5FCB', { crowned: true, scale: 1.2 }),

  // 第 2 章: 錆びた城塞
  'rusted-knight': humanoid({
    skin: '#C9A88A',
    body: '#8A5A3A',
    legs: '#5A3E2A',
    accent: '#A0683E',
    headgear: 'helmet',
    weapon: 'sword',
    shield: true,
  }),
  'hex-mage': humanoid({
    skin: '#C8B8D8',
    body: '#4A2E6B',
    legs: '#2E1E44',
    accent: '#5E3A88',
    headgear: 'wizardHat',
    weapon: 'staff',
    eyeColor: '#C890FF',
  }),
  'castle-bat': winged('#3A2A4A', '#5A3A6E', {
    ears: true,
    eyeColor: '#FF5050',
  }),
  'iron-executioner': humanoid(
    {
      skin: '#B89880',
      body: '#2A2A30',
      legs: '#1E1E22',
      accent: '#1A1A1E',
      headgear: 'hood',
      weapon: 'axe',
      eyeColor: '#FF4A3A',
    },
    { scale: 1.1 },
  ),
  'will-o-warden': humanoid(
    {
      skin: '#C0483D',
      body: '#5A2A22',
      legs: '#3A1E1A',
      accent: '#E0A030',
      headgear: 'horns',
      weapon: 'club',
      eyeColor: '#FFE04A',
    },
    { scale: 1.1 },
  ),
  'castle-phantom': ghost('#A8C8E8', { crowned: true, scale: 1.15 }),

  // 第 3 章: 星の頂
  'stardust-soldier': humanoid({
    skin: '#D8D0E8',
    body: '#2A3A6B',
    legs: '#1E2A4A',
    accent: '#E2B53E',
    headgear: 'helmet',
    weapon: 'spear',
  }),
  'void-eye': floatingEye('#5A3A7A', '#E05AFF'),
  'sky-eagle': winged('#7A5A3A', '#8A6A44', { head: '#F0F0F0', beak: true }),
  'star-eater': dragon('#4A5CB8', '#A8B4E8', '#6A44B8'),
  'time-keeper': hourglass('#C9A227', '#BFE6FF', '#FFE08A'),
  'void-king': voidLord('#2A1A3E', '#9A6CFF'),
};
