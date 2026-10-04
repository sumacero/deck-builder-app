import type { CardDefinition } from '../domain/card';

export const STRIKE: CardDefinition = {
  id: 'strike',
  name: 'ストライク',
  type: 'attack',
  cost: 1,
  target: 'enemy',
  effects: [{ kind: 'damage', amount: 6 }],
  upgrade: { effects: [{ kind: 'damage', amount: 9 }] },
};

export const DEFEND: CardDefinition = {
  id: 'defend',
  name: '防御',
  type: 'skill',
  cost: 1,
  target: 'self',
  effects: [{ kind: 'block', amount: 5 }],
  upgrade: { effects: [{ kind: 'block', amount: 8 }] },
};

const copies = (card: CardDefinition, count: number): CardDefinition[] =>
  Array.from({ length: count }, () => card);

/** キャラクター固有カードが決まるまでの、特性なしの初期デッキ。 */
export const PLAIN_STARTER_DECK: CardDefinition[] = [...copies(STRIKE, 5), ...copies(DEFEND, 5)];

/** 戦闘報酬・ショップ用。スレスパの鉄甲のカードに近い効果。 */
export const REWARD_CARDS: CardDefinition[] = [
  {
    id: 'twin-strike',
    name: '双撃',
    type: 'attack',
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 5, hits: 2 }],
    upgrade: { effects: [{ kind: 'damage', amount: 7, hits: 2 }] },
  },
  {
    id: 'pommel-strike',
    name: '柄撃',
    type: 'attack',
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 9 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 10 },
        { kind: 'draw', amount: 2 },
      ],
    },
  },
  {
    id: 'iron-wave',
    name: '鉄の波',
    type: 'attack',
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'block', amount: 5 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 7 },
        { kind: 'block', amount: 7 },
      ],
    },
  },
  {
    id: 'heavy-blade',
    name: '大剣',
    type: 'attack',
    cost: 2,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 14 }],
    upgrade: { effects: [{ kind: 'damage', amount: 19 }] },
  },
  {
    id: 'sword-boomerang',
    name: '剣ブーメラン',
    type: 'attack',
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 3, hits: 3 }],
    upgrade: { effects: [{ kind: 'damage', amount: 3, hits: 4 }] },
  },
  {
    id: 'clothesline',
    name: '衣桁',
    type: 'attack',
    cost: 2,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 12 }],
    upgrade: { effects: [{ kind: 'damage', amount: 14 }] },
  },
  {
    id: 'hemokinesis',
    name: '血の刃',
    type: 'attack',
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'loseHp', amount: 2 },
      { kind: 'damage', amount: 15 },
    ],
    upgrade: {
      effects: [
        { kind: 'loseHp', amount: 2 },
        { kind: 'damage', amount: 20 },
      ],
    },
  },
  {
    id: 'anger',
    name: '怒気',
    type: 'attack',
    cost: 0,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 6 }],
    addCopyToDiscard: true,
    upgrade: { effects: [{ kind: 'damage', amount: 8 }] },
  },
  {
    id: 'cleave',
    name: '薙ぎ払い',
    type: 'attack',
    cost: 1,
    target: 'allEnemies',
    effects: [{ kind: 'damage', amount: 8 }],
    upgrade: { effects: [{ kind: 'damage', amount: 11 }] },
  },
  {
    id: 'thunderclap',
    name: '雷鳴',
    type: 'attack',
    cost: 1,
    target: 'allEnemies',
    effects: [
      { kind: 'damage', amount: 4 },
      { kind: 'block', amount: 4 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 6 },
        { kind: 'block', amount: 6 },
      ],
    },
  },
  {
    id: 'whirlwind',
    name: '旋風',
    type: 'attack',
    cost: 2,
    target: 'allEnemies',
    effects: [{ kind: 'damage', amount: 5, hits: 2 }],
    upgrade: { effects: [{ kind: 'damage', amount: 7, hits: 2 }] },
  },
  {
    id: 'shrug-it-off',
    name: '肩をすくめる',
    type: 'skill',
    cost: 1,
    target: 'self',
    effects: [
      { kind: 'block', amount: 8 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 11 },
        { kind: 'draw', amount: 1 },
      ],
    },
  },
  {
    id: 'seeing-red',
    name: '見切り',
    type: 'skill',
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainEnergy', amount: 2 }],
    exhaust: true,
    upgrade: { cost: 0 },
  },
  {
    id: 'bloodletting',
    name: '放血',
    type: 'skill',
    cost: 0,
    target: 'self',
    effects: [
      { kind: 'loseHp', amount: 3 },
      { kind: 'gainEnergy', amount: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'loseHp', amount: 3 },
        { kind: 'gainEnergy', amount: 3 },
      ],
    },
  },
  {
    id: 'battle-trance',
    name: '戦闘トランス',
    type: 'skill',
    cost: 0,
    target: 'self',
    effects: [{ kind: 'draw', amount: 3 }],
    upgrade: { effects: [{ kind: 'draw', amount: 4 }] },
  },
  {
    id: 'offering',
    name: '供物',
    type: 'skill',
    cost: 0,
    target: 'self',
    effects: [
      { kind: 'loseHp', amount: 6 },
      { kind: 'gainEnergy', amount: 2 },
      { kind: 'draw', amount: 3 },
    ],
    exhaust: true,
    upgrade: {
      effects: [
        { kind: 'loseHp', amount: 6 },
        { kind: 'gainEnergy', amount: 2 },
        { kind: 'draw', amount: 5 },
      ],
    },
  },
  {
    id: 'flex',
    name: '力み',
    type: 'skill',
    cost: 0,
    target: 'self',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'turn' }],
    upgrade: { effects: [{ kind: 'gainStrength', amount: 4, duration: 'turn' }] },
  },
  {
    id: 'inflame',
    name: '憤激',
    type: 'power',
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainStrength', amount: 3, duration: 'combat' }] },
  },
  {
    id: 'metallicize',
    name: '金属化',
    type: 'power',
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainEndTurnBlock', amount: 3 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainEndTurnBlock', amount: 4 }] },
  },
];
