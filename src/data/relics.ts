import type { RelicDefinition } from '../domain/relic';

export const RUSTY_ANCHOR: RelicDefinition = {
  id: 'rusty-anchor',
  name: 'ふるい錨',
  icon: '⚓',
  rarity: 'common',
  trigger: 'combatStart',
  effects: [{ kind: 'block', amount: 10 }],
};

export const EMBER_LANTERN: RelicDefinition = {
  id: 'ember-lantern',
  name: '灯火のランタン',
  icon: '🏮',
  rarity: 'common',
  trigger: 'combatStart',
  effects: [{ kind: 'gainEnergy', amount: 1 }],
};

export const STEADFAST_STONE: RelicDefinition = {
  id: 'steadfast-stone',
  name: '不動の石',
  icon: '🪨',
  rarity: 'common',
  trigger: 'turnEnd',
  condition: 'noBlock',
  effects: [{ kind: 'block', amount: 6 }],
};

export const FIGHTING_SPIRIT: RelicDefinition = {
  id: 'fighting-spirit',
  name: '闘志のハート',
  icon: '❤️‍🔥',
  rarity: 'common',
  trigger: 'combatWon',
  effects: [{ kind: 'heal', amount: 6 }],
};

/** エリート・宝箱・ショップ・恩恵で手に入る。 */
export const RELIC_POOL: RelicDefinition[] = [
  {
    id: 'migrant-feather',
    name: '渡り鳥の羽',
    icon: '🪶',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'draw', amount: 2 }],
  },
  {
    id: 'warrior-headband',
    name: '戦士の鉢巻',
    icon: '🎗️',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 1, duration: 'combat' }],
  },
  {
    id: 'thorn-armor',
    name: '茨の鎧',
    icon: '🌵',
    rarity: 'common',
    trigger: 'turnEnd',
    effects: [{ kind: 'block', amount: 3 }],
  },
  {
    id: 'herb-pouch',
    name: '薬草袋',
    icon: '🌿',
    rarity: 'common',
    trigger: 'combatWon',
    effects: [{ kind: 'heal', amount: 4 }],
  },
  {
    id: 'chain-mail',
    name: '鎖帷子',
    icon: '⛓️',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'block', amount: 6 }],
  },
  {
    id: 'star-fragment',
    name: '星のかけら',
    icon: '✨',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'gainEnergy', amount: 1 }],
  },
  {
    id: 'powder-pouch',
    name: '火薬袋',
    icon: '💣',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  {
    id: 'hunter-horn',
    name: '狩人の角笛',
    icon: '📯',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 3, duration: 'turn' }],
  },
  {
    id: 'warding-bell',
    name: '魔除けの鈴',
    icon: '🔔',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [
      { kind: 'block', amount: 4 },
      { kind: 'draw', amount: 1 },
    ],
  },
];

/** ボス撃破後の 3 択。強力だが代償つきのものもある。 */
export const BOSS_RELIC_POOL: RelicDefinition[] = [
  {
    id: 'sun-crown',
    name: '太陽の王冠',
    icon: '👑',
    rarity: 'boss',
    effects: [],
    onObtain: [
      { kind: 'changeEnergyPerTurn', amount: 1 },
      { kind: 'loseMaxHp', amount: 8 },
    ],
  },
  {
    id: 'void-shard',
    name: '夜空のかけら',
    icon: '🌀',
    rarity: 'boss',
    effects: [],
    onObtain: [
      { kind: 'changeEnergyPerTurn', amount: 1 },
      { kind: 'changeDrawPerTurn', amount: -1 },
    ],
  },
  {
    id: 'sage-hourglass',
    name: '賢者の砂時計',
    icon: '⌛',
    rarity: 'boss',
    effects: [],
    onObtain: [{ kind: 'changeDrawPerTurn', amount: 1 }],
  },
  {
    id: 'giant-heart',
    name: '巨人の心臓',
    icon: '❤️‍🔥',
    rarity: 'boss',
    effects: [],
    onObtain: [{ kind: 'gainMaxHp', amount: 20 }],
  },
  {
    id: 'obsidian-shield',
    name: '黒曜の盾',
    icon: '🛡️',
    rarity: 'boss',
    trigger: 'combatStart',
    effects: [{ kind: 'block', amount: 14 }],
  },
  {
    id: 'dragon-fang',
    name: '竜の牙',
    icon: '🦷',
    rarity: 'boss',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
  },
];
