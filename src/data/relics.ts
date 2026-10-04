import type { RelicDefinition } from '../domain/relic';

export const RUSTY_ANCHOR: RelicDefinition = {
  id: 'rusty-anchor',
  name: '錆びた錨',
  icon: '⚓',
  trigger: 'combatStart',
  effects: [{ kind: 'block', amount: 10 }],
};

export const EMBER_LANTERN: RelicDefinition = {
  id: 'ember-lantern',
  name: '灯火のランタン',
  icon: '🏮',
  trigger: 'combatStart',
  effects: [{ kind: 'gainEnergy', amount: 1 }],
};

export const STEADFAST_STONE: RelicDefinition = {
  id: 'steadfast-stone',
  name: '不動の石',
  icon: '🪨',
  trigger: 'turnEnd',
  condition: 'noBlock',
  effects: [{ kind: 'block', amount: 6 }],
};

export const FIGHTING_SPIRIT: RelicDefinition = {
  id: 'fighting-spirit',
  name: '闘志の血潮',
  icon: '🩸',
  trigger: 'combatWon',
  effects: [{ kind: 'heal', amount: 6 }],
};

/** エリート・ボス・恩恵で手に入る。 */
export const RELIC_POOL: RelicDefinition[] = [
  {
    id: 'migrant-feather',
    name: '渡り鳥の羽',
    icon: '🪶',
    trigger: 'combatStart',
    effects: [{ kind: 'draw', amount: 2 }],
  },
  {
    id: 'warrior-headband',
    name: '戦士の鉢巻',
    icon: '🎗️',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 1, duration: 'combat' }],
  },
  {
    id: 'thorn-armor',
    name: '茨の鎧',
    icon: '🌵',
    trigger: 'turnEnd',
    effects: [{ kind: 'block', amount: 3 }],
  },
  {
    id: 'herb-pouch',
    name: '薬草袋',
    icon: '🌿',
    trigger: 'combatWon',
    effects: [{ kind: 'heal', amount: 4 }],
  },
  {
    id: 'chain-mail',
    name: '鎖帷子',
    icon: '⛓️',
    trigger: 'combatStart',
    effects: [{ kind: 'block', amount: 6 }],
  },
  {
    id: 'star-fragment',
    name: '星のかけら',
    icon: '✨',
    trigger: 'combatStart',
    effects: [{ kind: 'gainEnergy', amount: 1 }],
  },
];
