import type { PotionDefinition } from '../domain/potion';

export const FIRE_POTION: PotionDefinition = {
  id: 'fire-potion',
  name: '炎のポーション',
  icon: '🔥',
  target: 'enemy',
  effects: [{ kind: 'damage', amount: 20 }],
};

export const IRON_POTION: PotionDefinition = {
  id: 'iron-potion',
  name: '鉄壁のポーション',
  icon: '🛡️',
  target: 'self',
  effects: [{ kind: 'block', amount: 12 }],
};

export const SWIFT_POTION: PotionDefinition = {
  id: 'swift-potion',
  name: '俊敏のポーション',
  icon: '💨',
  target: 'self',
  effects: [{ kind: 'draw', amount: 3 }],
};

export const EXPLOSIVE_POTION: PotionDefinition = {
  id: 'explosive-potion',
  name: '爆発のポーション',
  icon: '💥',
  target: 'allEnemies',
  effects: [{ kind: 'damage', amount: 10 }],
};

export const ALL_POTIONS: PotionDefinition[] = [
  FIRE_POTION,
  IRON_POTION,
  SWIFT_POTION,
  EXPLOSIVE_POTION,
];
