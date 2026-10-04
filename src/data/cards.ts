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

export const BASH: CardDefinition = {
  id: 'bash',
  name: '強打',
  type: 'attack',
  cost: 2,
  target: 'enemy',
  effects: [
    { kind: 'damage', amount: 8 },
    { kind: 'applyDebuff', status: 'vulnerable', turns: 2 },
  ],
  upgrade: {
    effects: [
      { kind: 'damage', amount: 10 },
      { kind: 'applyDebuff', status: 'vulnerable', turns: 3 },
    ],
  },
};

const copies = (card: CardDefinition, count: number): CardDefinition[] =>
  Array.from({ length: count }, () => card);

/** 紅蓮のカイルの初期デッキ。 */
export const CRIMSON_STARTER_DECK: CardDefinition[] = [
  ...copies(STRIKE, 5),
  ...copies(DEFEND, 4),
  BASH,
];

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
    name: '剛腕撃',
    type: 'attack',
    cost: 2,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 12 },
      { kind: 'applyDebuff', status: 'weak', turns: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 14 },
        { kind: 'applyDebuff', status: 'weak', turns: 3 },
      ],
    },
  },
  {
    id: 'hemokinesis',
    name: '紅蓮の刃',
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
      { kind: 'applyDebuff', status: 'vulnerable', turns: 1 },
      { kind: 'block', amount: 4 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 6 },
        { kind: 'applyDebuff', status: 'vulnerable', turns: 1 },
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
    name: '生命転換',
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
    name: '捧げの儀',
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
  {
    id: 'intimidate',
    name: '威圧の一喝',
    type: 'skill',
    cost: 0,
    target: 'allEnemies',
    effects: [{ kind: 'applyDebuff', status: 'weak', turns: 1 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'applyDebuff', status: 'weak', turns: 2 }] },
  },
  {
    id: 'uppercut',
    name: '粉砕撃',
    type: 'attack',
    cost: 2,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 13 },
      { kind: 'applyDebuff', status: 'vulnerable', turns: 1 },
      { kind: 'applyDebuff', status: 'weak', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 13 },
        { kind: 'applyDebuff', status: 'vulnerable', turns: 2 },
        { kind: 'applyDebuff', status: 'weak', turns: 2 },
      ],
    },
  },
  {
    id: 'shockwave',
    name: '戦慄の咆哮',
    type: 'skill',
    cost: 2,
    target: 'allEnemies',
    effects: [
      { kind: 'applyDebuff', status: 'vulnerable', turns: 3 },
      { kind: 'applyDebuff', status: 'weak', turns: 3 },
    ],
    exhaust: true,
    upgrade: {
      effects: [
        { kind: 'applyDebuff', status: 'vulnerable', turns: 5 },
        { kind: 'applyDebuff', status: 'weak', turns: 5 },
      ],
    },
  },
  {
    id: 'body-slam',
    name: '盾撃ち',
    type: 'attack',
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'damageFromBlock' }],
    upgrade: { cost: 0 },
  },
  {
    id: 'steadfast-guard',
    name: '鉄壁の構え',
    type: 'skill',
    cost: 1,
    target: 'self',
    effects: [
      { kind: 'block', amount: 6 },
      { kind: 'gainBuff', status: 'retainBlock', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 9 },
        { kind: 'gainBuff', status: 'retainBlock', turns: 1 },
      ],
    },
  },
  {
    id: 'barricade',
    name: '不動の誓い',
    type: 'power',
    cost: 2,
    target: 'self',
    effects: [{ kind: 'gainBuff', status: 'retainBlock', turns: 3 }],
    exhaust: true,
    upgrade: { cost: 1 },
  },
  {
    id: 'entrench',
    name: '倍返しの盾',
    type: 'skill',
    cost: 2,
    target: 'self',
    effects: [{ kind: 'doubleBlock' }],
    upgrade: { cost: 1 },
  },
  {
    id: 'searing-decree',
    name: '灼熱の宣告',
    type: 'skill',
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'extendDebuffs', turns: 2 }],
    upgrade: { effects: [{ kind: 'extendDebuffs', turns: 3 }] },
  },
  {
    id: 'heat-up',
    name: '燃え上がれ！',
    type: 'skill',
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainBuff', status: 'blazing', turns: 1 }],
    upgrade: { effects: [{ kind: 'gainBuff', status: 'blazing', turns: 2 }] },
  },
  {
    id: 'soul-flame',
    name: '魂の炎',
    type: 'skill',
    cost: 0,
    target: 'self',
    effects: [{ kind: 'extendBuffs', turns: 2 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'extendBuffs', turns: 3 }] },
  },
];
