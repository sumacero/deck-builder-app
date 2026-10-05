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

export const HEALING_POTION: PotionDefinition = {
  id: 'healing-potion',
  name: '癒しのポーション',
  icon: '💖',
  target: 'self',
  effects: [{ kind: 'heal', amount: 15 }],
};

export const STRENGTH_POTION: PotionDefinition = {
  id: 'strength-potion',
  name: '剛力のポーション',
  icon: '💪',
  target: 'self',
  effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
};

export const ENERGY_POTION: PotionDefinition = {
  id: 'energy-potion',
  name: '雷光のポーション',
  icon: '⚡',
  target: 'self',
  effects: [{ kind: 'gainEnergy', amount: 2 }],
};

export const WEAKNESS_POTION: PotionDefinition = {
  id: 'weakness-potion',
  name: '萎えの霧瓶',
  icon: '🌫️',
  target: 'enemy',
  effects: [{ kind: 'applyDebuff', status: 'weak', turns: 3 }],
};

export const VULNERABLE_POTION: PotionDefinition = {
  id: 'vulnerable-potion',
  name: '看破の水晶瓶',
  icon: '🔮',
  target: 'enemy',
  effects: [{ kind: 'applyDebuff', status: 'vulnerable', turns: 3 }],
};

export const SEED_POTION: PotionDefinition = {
  id: 'seed-potion',
  name: '宿り木の種瓶',
  icon: '🍀',
  target: 'allEnemies',
  effects: [{ kind: 'applyDebuff', status: 'seed', turns: 5 }],
};

export const BLAZING_POTION: PotionDefinition = {
  id: 'blazing-potion',
  name: '熱血のポーション',
  icon: '♨️',
  target: 'self',
  effects: [{ kind: 'gainBuff', status: 'blazing', turns: 2 }],
};

export const FORTRESS_POTION: PotionDefinition = {
  id: 'fortress-potion',
  name: '城壁の秘薬',
  icon: '🧱',
  target: 'self',
  effects: [
    { kind: 'block', amount: 8 },
    { kind: 'gainBuff', status: 'retainBlock', turns: 2 },
  ],
};

export const THORN_POTION: PotionDefinition = {
  id: 'thorn-potion',
  name: '薔薇棘のポーション',
  icon: '🌹',
  target: 'self',
  effects: [{ kind: 'gainPower', power: 'thorns', amount: 3 }],
};

export const STORM_POTION: PotionDefinition = {
  id: 'storm-potion',
  name: '嵐のポーション',
  icon: '🌪️',
  target: 'allEnemies',
  effects: [{ kind: 'damage', amount: 3, hits: 3 }],
};

export const FIRE_SPIRIT_POTION: PotionDefinition = {
  id: 'fire-spirit-potion',
  name: '火霊の小瓶',
  icon: '🌋',
  target: 'self',
  effects: [{ kind: 'enchant', attribute: 'fire' }],
};

export const WATER_SPIRIT_POTION: PotionDefinition = {
  id: 'water-spirit-potion',
  name: '水霊の小瓶',
  icon: '🌊',
  target: 'self',
  effects: [{ kind: 'enchant', attribute: 'water' }],
};

export const GRASS_SPIRIT_POTION: PotionDefinition = {
  id: 'grass-spirit-potion',
  name: '草霊の小瓶',
  icon: '🍃',
  target: 'self',
  effects: [{ kind: 'enchant', attribute: 'grass' }],
};

export const ALL_POTIONS: PotionDefinition[] = [
  FIRE_POTION,
  IRON_POTION,
  SWIFT_POTION,
  EXPLOSIVE_POTION,
  HEALING_POTION,
  STRENGTH_POTION,
  ENERGY_POTION,
  WEAKNESS_POTION,
  VULNERABLE_POTION,
  SEED_POTION,
  BLAZING_POTION,
  FORTRESS_POTION,
  THORN_POTION,
  STORM_POTION,
  FIRE_SPIRIT_POTION,
  WATER_SPIRIT_POTION,
  GRASS_SPIRIT_POTION,
];
