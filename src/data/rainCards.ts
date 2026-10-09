import type { CardDefinition } from '../domain/card';
import { DEFEND, STRIKE } from './cards';

/**
 * 蒼雨のノエル（水属性）のためのカード。水属性なので、ノエルは戦闘報酬で、ほかのエージェントはショップでだけ手に入る。
 * 軸は潮: 敵の次の行動にかけ、攻撃と守り・強化・回復の数値を削る。0 になった行動と封印は流れる。
 * 潮を割るカードは、弱めるのをやめて今ダメージにする。ブロックは水鏡と氷で、盾や蔦は使わない。
 */

/** ノエルの初期カード。潮の入口。 */
export const RAINDROP: CardDefinition = {
  id: 'raindrop',
  name: '雨粒',
  rarity: 'common',
  type: 'skill',
  attribute: 'water',
  archetypes: ['debuff'],
  cost: 1,
  target: 'enemy',
  effects: [{ kind: 'applyDebuff', status: 'tide', turns: 2 }],
  upgrade: { effects: [{ kind: 'applyDebuff', status: 'tide', turns: 3 }] },
};

/** 蒼雨のノエルの秘奥義。ゲージが溜まると手札に来る。報酬には出ない。 */
export const WHITE_WAVE: CardDefinition = {
  id: 'white-wave',
  name: '蒼雨・白波',
  rarity: 'rare',
  type: 'attack',
  cost: 0,
  target: 'allEnemies',
  effects: [
    { kind: 'damage', amount: 6 },
    { kind: 'applyDebuff', status: 'tide', turns: 3 },
  ],
  mysticArte: true,
  exhaust: true,
  motion: 'heavy',
};

const copies = (card: CardDefinition, count: number): CardDefinition[] =>
  Array.from({ length: count }, () => card);

/** ノエルの初期デッキ。ストライクはラン開始時に水属性になる。絵は杖と水鏡。 */
export const RAIN_STARTER_DECK: CardDefinition[] = [
  ...copies({ ...STRIKE, art: 'strike-azure' }, 4),
  ...copies({ ...DEFEND, art: 'defend-azure' }, 4),
  RAINDROP,
];

export const RAIN_CARDS: CardDefinition[] = [
  RAINDROP,
  {
    id: 'spray',
    name: 'しぶき',
    rarity: 'common',
    type: 'attack',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 5 },
      { kind: 'applyDebuff', status: 'tide', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 7 },
        { kind: 'applyDebuff', status: 'tide', turns: 2 },
      ],
    },
  },
  {
    id: 'water-mirror',
    name: '水鏡',
    rarity: 'common',
    type: 'skill',
    attribute: 'water',
    archetypes: ['block'],
    cost: 1,
    target: 'self',
    effects: [{ kind: 'block', amount: 8 }],
    upgrade: { effects: [{ kind: 'block', amount: 11 }] },
  },
  {
    id: 'shoreline',
    name: '波打ち際',
    rarity: 'common',
    type: 'skill',
    attribute: 'water',
    archetypes: ['block', 'debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'block', amount: 5 },
      { kind: 'applyDebuff', status: 'tide', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 7 },
        { kind: 'applyDebuff', status: 'tide', turns: 2 },
      ],
    },
  },
  {
    id: 'rain-steps',
    name: '雨脚',
    rarity: 'common',
    type: 'attack',
    attribute: 'water',
    archetypes: ['tempo', 'debuff'],
    cost: 0,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 3 },
      { kind: 'applyDebuff', status: 'tide', turns: 1 },
    ],
    exhaust: true,
    upgrade: {
      effects: [
        { kind: 'damage', amount: 5 },
        { kind: 'applyDebuff', status: 'tide', turns: 1 },
      ],
    },
  },
  {
    id: 'ebb',
    name: '引き潮',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 1,
    target: 'allEnemies',
    effects: [{ kind: 'applyDebuff', status: 'tide', turns: 1 }],
    upgrade: { effects: [{ kind: 'applyDebuff', status: 'tide', turns: 2 }] },
  },
  {
    id: 'crack-tide',
    name: '潮割れ',
    rarity: 'uncommon',
    type: 'attack',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'crackTide', per: 4 }],
    upgrade: { effects: [{ kind: 'crackTide', per: 6 }] },
  },
  {
    id: 'drizzle',
    name: '霧雨',
    rarity: 'uncommon',
    type: 'attack',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 1,
    target: 'allEnemies',
    effects: [
      { kind: 'damage', amount: 4 },
      { kind: 'applyDebuff', status: 'tide', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 6 },
        { kind: 'applyDebuff', status: 'tide', turns: 1 },
      ],
    },
  },
  {
    id: 'twin-drops',
    name: '双つの雫',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['tempo', 'debuff'],
    cost: 0,
    target: 'enemy',
    effects: [
      { kind: 'applyDebuff', status: 'tide', turns: 1 },
      { kind: 'draw', amount: 1 },
    ],
    exhaust: true,
    upgrade: {
      effects: [
        { kind: 'applyDebuff', status: 'tide', turns: 2 },
        { kind: 'draw', amount: 1 },
      ],
    },
  },
  {
    id: 'undertow',
    name: '水底',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'applyDebuff', status: 'tide', turns: 3 },
      { kind: 'applyDebuff', status: 'weak', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'applyDebuff', status: 'tide', turns: 4 },
        { kind: 'applyDebuff', status: 'weak', turns: 2 },
      ],
    },
  },
  {
    id: 'frost-veil',
    name: '氷の帳',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['block'],
    cost: 2,
    target: 'self',
    effects: [{ kind: 'block', amount: 13 }],
    upgrade: { effects: [{ kind: 'block', amount: 17 }] },
  },
  {
    id: 'tide-sense',
    name: '潮読み',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['tempo', 'debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'draw', amount: 2 },
      { kind: 'applyDebuff', status: 'tide', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'draw', amount: 3 },
        { kind: 'applyDebuff', status: 'tide', turns: 1 },
      ],
    },
  },
  {
    id: 'droplet-chain',
    name: '重ねる雫',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'ifTargetHas', status: 'tide', effects: [{ kind: 'damage', amount: 8 }] },
      { kind: 'applyDebuff', status: 'tide', turns: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'ifTargetHas', status: 'tide', effects: [{ kind: 'damage', amount: 12 }] },
        { kind: 'applyDebuff', status: 'tide', turns: 2 },
      ],
    },
  },
  {
    id: 'rain-shelter',
    name: '雨宿り',
    rarity: 'uncommon',
    type: 'skill',
    attribute: 'water',
    archetypes: ['block', 'tempo'],
    cost: 1,
    target: 'self',
    effects: [
      { kind: 'block', amount: 5 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 8 },
        { kind: 'draw', amount: 1 },
      ],
    },
  },
  {
    id: 'ice-step',
    name: '氷の歩み',
    rarity: 'uncommon',
    type: 'attack',
    attribute: 'water',
    archetypes: ['element'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 7 },
      { kind: 'block', amount: 4 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 9 },
        { kind: 'block', amount: 6 },
      ],
    },
  },
  {
    id: 'high-tide',
    name: '満潮',
    rarity: 'rare',
    type: 'power',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 2,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'highTide', amount: 1 }],
    exhaust: true,
    upgrade: { cost: 1 },
  },
  {
    id: 'still-waters',
    name: '凪',
    rarity: 'rare',
    type: 'skill',
    attribute: 'water',
    archetypes: ['debuff'],
    cost: 2,
    target: 'allEnemies',
    effects: [{ kind: 'applyDebuff', status: 'tide', turns: 4 }],
    upgrade: { effects: [{ kind: 'applyDebuff', status: 'tide', turns: 6 }] },
  },
];
