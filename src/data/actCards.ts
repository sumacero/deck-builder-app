import type { CardDefinition } from '../domain/card';

/**
 * 第 3 章の開始でだけ渡すカード。報酬にもショップにも出ない。
 * 強い代わりに、廃棄か自傷か呪いと組む。
 */

export const STAR_BURDEN: CardDefinition = {
  id: 'star-burden',
  name: '星の重荷',
  rarity: 'common',
  type: 'skill',
  cost: 1,
  target: 'self',
  curse: true,
  unplayable: true,
  effects: [],
  turnEndInHand: [{ kind: 'loseHp', amount: 2 }],
};

export const STAR_AFTERGLOW: CardDefinition = {
  id: 'star-afterglow',
  name: '星喰みの残光',
  rarity: 'rare',
  type: 'attack',
  cost: 0,
  target: 'allEnemies',
  exhaust: true,
  art: 'searing-decree',
  effects: [
    { kind: 'damage', amount: 9 },
    { kind: 'loseHp', amount: 4 },
  ],
  upgrade: {
    effects: [
      { kind: 'damage', amount: 12 },
      { kind: 'loseHp', amount: 3 },
    ],
  },
};

export const LAST_BLOW: CardDefinition = {
  id: 'last-blow',
  name: '絶撃',
  rarity: 'rare',
  type: 'attack',
  cost: 1,
  target: 'enemy',
  exhaust: true,
  art: 'heavy-blade',
  effects: [
    { kind: 'damage', amount: 16 },
    { kind: 'loseHp', amount: 6 },
  ],
  upgrade: {
    effects: [
      { kind: 'damage', amount: 20 },
      { kind: 'loseHp', amount: 6 },
    ],
  },
};

export const REVERSAL_WARD: CardDefinition = {
  id: 'reversal-ward',
  name: '反転の盾',
  rarity: 'rare',
  type: 'skill',
  cost: 1,
  target: 'self',
  exhaust: true,
  art: 'steadfast-guard',
  effects: [{ kind: 'doubleBlock' }, { kind: 'block', amount: 8 }],
  upgrade: { effects: [{ kind: 'doubleBlock' }, { kind: 'block', amount: 12 }] },
};

export const DESPERATE_FLURRY: CardDefinition = {
  id: 'desperate-flurry',
  name: '捨て身の連撃',
  rarity: 'rare',
  type: 'attack',
  cost: 1,
  target: 'enemy',
  exhaust: true,
  art: 'twin-strike',
  effects: [
    { kind: 'damage', amount: 7, hits: 2 },
    { kind: 'loseHp', amount: 5 },
  ],
  upgrade: {
    effects: [
      { kind: 'damage', amount: 9, hits: 2 },
      { kind: 'loseHp', amount: 5 },
    ],
  },
};

export const NOX_SHARD: CardDefinition = {
  id: 'nox-shard',
  name: 'ノクスの欠片',
  rarity: 'rare',
  type: 'attack',
  cost: 1,
  target: 'allEnemies',
  exhaust: true,
  art: 'heat-up',
  effects: [
    { kind: 'damage', amount: 5 },
    { kind: 'applyDebuff', status: 'vulnerable', turns: 2 },
    { kind: 'applyDebuff', status: 'weak', turns: 2 },
  ],
  upgrade: {
    effects: [
      { kind: 'damage', amount: 7 },
      { kind: 'applyDebuff', status: 'vulnerable', turns: 3 },
      { kind: 'applyDebuff', status: 'weak', turns: 3 },
    ],
  },
};

export const BLOOD_OATH: CardDefinition = {
  id: 'blood-oath',
  name: '血潮の誓い',
  rarity: 'rare',
  type: 'skill',
  cost: 0,
  target: 'self',
  exhaust: true,
  art: 'seeing-red',
  effects: [
    { kind: 'loseHp', amount: 6 },
    { kind: 'draw', amount: 3 },
    { kind: 'gainEnergy', amount: 2 },
  ],
  upgrade: {
    effects: [
      { kind: 'loseHp', amount: 5 },
      { kind: 'draw', amount: 3 },
      { kind: 'gainEnergy', amount: 2 },
    ],
  },
};

export const ACT_CARDS: CardDefinition[] = [
  STAR_BURDEN,
  STAR_AFTERGLOW,
  LAST_BLOW,
  REVERSAL_WARD,
  DESPERATE_FLURRY,
  NOX_SHARD,
  BLOOD_OATH,
];
