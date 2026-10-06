import type { CardDefinition } from '../domain/card';
import { DEFEND, STRIKE } from './cards';

/**
 * 翠風のリーネ（草属性）のためのカード。草属性なので、リーネは戦闘報酬で、ほかのエージェントはショップでだけ手に入る。
 * 軸は 3 つ: 宿り木（毎ターン削る）/ 茨（受けるほど返す）/ 芽吹き（使うほど育つ）。
 */

export const SEED_ARROW: CardDefinition = {
  id: 'seed-arrow',
  name: '宿り木の矢',
  type: 'attack',
  attribute: 'grass',
  archetypes: ['debuff'],
  cost: 1,
  target: 'enemy',
  effects: [
    { kind: 'damage', amount: 4 },
    { kind: 'applyDebuff', status: 'seed', turns: 3 },
  ],
  upgrade: {
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'applyDebuff', status: 'seed', turns: 4 },
    ],
  },
};

/** 翠風のリーネの秘奥義。ゲージが溜まると手札に来る。報酬には出ない。 */
export const THOUSAND_YEAR_TREE: CardDefinition = {
  id: 'thousand-year-tree',
  name: '翠嵐・千年樹',
  type: 'attack',
  cost: 0,
  target: 'allEnemies',
  effects: [
    { kind: 'damage', amount: 6, hits: 2 },
    { kind: 'applyDebuff', status: 'seed', turns: 6 },
  ],
  mysticArte: true,
  exhaust: true,
  motion: 'heavy',
};

const copies = (card: CardDefinition, count: number): CardDefinition[] =>
  Array.from({ length: count }, () => card);

/** リーネの初期デッキ。ストライクはラン開始時に草属性になる。ストライク・防御は効果はそのままで、絵だけ弓とムチの狩人用。 */
export const VERDANT_STARTER_DECK: CardDefinition[] = [
  ...copies({ ...STRIKE, art: 'strike-verdant' }, 3),
  ...copies({ ...DEFEND, art: 'defend-verdant' }, 2),
  SEED_ARROW,
];

export const VERDANT_CARDS: CardDefinition[] = [
  SEED_ARROW,

  // --- 宿り木: かけて、増やして、芽吹かせる ---
  {
    id: 'seed-scatter',
    name: '種子散布',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 1,
    target: 'allEnemies',
    effects: [{ kind: 'applyDebuff', status: 'seed', turns: 3 }],
    upgrade: { effects: [{ kind: 'applyDebuff', status: 'seed', turns: 5 }] },
  },
  {
    id: 'vine-bind',
    name: '蔦縛り',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'applyDebuff', status: 'weak', turns: 2 },
      { kind: 'applyDebuff', status: 'seed', turns: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'applyDebuff', status: 'weak', turns: 3 },
        { kind: 'applyDebuff', status: 'seed', turns: 3 },
      ],
    },
  },
  {
    id: 'full-bloom',
    name: '開花',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'bloomSeed' }],
    upgrade: { cost: 0 },
  },
  {
    id: 'rampant-growth',
    name: '芽吹きの呪',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'multiplyDebuff', status: 'seed', factor: 2 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'multiplyDebuff', status: 'seed', factor: 3 }] },
  },
  {
    id: 'forest-wrath',
    name: '森羅の怒り',
    type: 'attack',
    attribute: 'grass',
    archetypes: ['debuff', 'element'],
    cost: 2,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 10 },
      { kind: 'ifTargetHas', status: 'seed', effects: [{ kind: 'damage', amount: 8 }] },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 13 },
        { kind: 'ifTargetHas', status: 'seed', effects: [{ kind: 'damage', amount: 10 }] },
      ],
    },
  },
  {
    id: 'overgrowth',
    name: '森の侵蝕',
    type: 'power',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 2,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'overgrowth', amount: 2 }],
    exhaust: true,
    upgrade: { cost: 1 },
  },

  // --- 茨と守り: 受けるほど返す ---
  {
    id: 'thorn-armor',
    name: '茨の鎧',
    type: 'power',
    attribute: 'grass',
    archetypes: ['block'],
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'thorns', amount: 3 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainPower', power: 'thorns', amount: 5 }] },
  },
  {
    id: 'thorn-wall',
    name: '茨の垣根',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['block'],
    cost: 1,
    target: 'self',
    effects: [
      { kind: 'block', amount: 6 },
      { kind: 'gainPower', power: 'thorns', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 8 },
        { kind: 'gainPower', power: 'thorns', amount: 2 },
      ],
    },
  },
  {
    id: 'verdure',
    name: '命の芽吹き',
    type: 'power',
    attribute: 'grass',
    archetypes: ['debuff', 'block'],
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'verdure', amount: 2 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainPower', power: 'verdure', amount: 3 }] },
  },
  {
    id: 'great-tree-blessing',
    name: '大樹の加護',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['block'],
    cost: 2,
    target: 'self',
    effects: [
      { kind: 'block', amount: 12 },
      { kind: 'heal', amount: 3 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 15 },
        { kind: 'heal', amount: 4 },
      ],
    },
  },
  {
    id: 'sunbeam',
    name: '木漏れ日',
    type: 'skill',
    attribute: 'grass',
    cost: 0,
    target: 'self',
    effects: [
      { kind: 'block', amount: 3 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 5 },
        { kind: 'draw', amount: 1 },
      ],
    },
  },

  // --- 風の弓と、育つ種 ---
  {
    id: 'gale-arrows',
    name: '疾風の連矢',
    type: 'attack',
    attribute: 'grass',
    archetypes: ['strength', 'element'],
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 3, hits: 3 }],
    upgrade: { effects: [{ kind: 'damage', amount: 4, hits: 3 }] },
  },
  {
    id: 'world-tree-seed',
    name: '世界樹の種',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['growth', 'block'],
    cost: 1,
    target: 'self',
    effects: [{ kind: 'block', amount: 5 }],
    exhaust: true,
    growth: { stat: 'block', amount: 2, when: 'play', scope: 'run' },
    upgrade: {
      effects: [{ kind: 'block', amount: 7 }],
      growth: { stat: 'block', amount: 3, when: 'play', scope: 'run' },
    },
  },

  // --- 狩人の弓とムチ: 戦士のカードの代わりに、狙い撃ちと集中で火力を伸ばす ---
  {
    id: 'vine-lash',
    name: '蔓ムチの一撃',
    type: 'attack',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 7 },
      { kind: 'applyDebuff', status: 'vulnerable', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 9 },
        { kind: 'applyDebuff', status: 'vulnerable', turns: 2 },
      ],
    },
  },
  {
    id: 'vital-shot',
    name: '急所射ち',
    type: 'attack',
    attribute: 'grass',
    archetypes: ['debuff'],
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 6 },
      { kind: 'ifTargetHas', status: 'vulnerable', effects: [{ kind: 'damage', amount: 6 }] },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 8 },
        { kind: 'ifTargetHas', status: 'vulnerable', effects: [{ kind: 'damage', amount: 8 }] },
      ],
    },
  },
  {
    id: 'aimed-shot',
    name: '狙い澄ました一矢',
    type: 'attack',
    attribute: 'grass',
    archetypes: ['strength'],
    cost: 2,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 14, strengthMultiplier: 2 }],
    upgrade: { effects: [{ kind: 'damage', amount: 18, strengthMultiplier: 2 }] },
    motion: 'heavy',
  },
  {
    id: 'whip-storm',
    name: '鞭嵐',
    type: 'attack',
    attribute: 'grass',
    archetypes: ['strength', 'element'],
    cost: 2,
    target: 'allEnemies',
    effects: [{ kind: 'damage', amount: 5, hits: 2 }],
    upgrade: { effects: [{ kind: 'damage', amount: 7, hits: 2 }] },
  },
  {
    id: 'whip-ward',
    name: '鞭の結界',
    type: 'skill',
    attribute: 'grass',
    archetypes: ['block', 'debuff'],
    cost: 1,
    target: 'allEnemies',
    effects: [
      { kind: 'block', amount: 7 },
      { kind: 'applyDebuff', status: 'weak', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 9 },
        { kind: 'applyDebuff', status: 'weak', turns: 2 },
      ],
    },
    motion: 'guard',
  },
  {
    id: 'hunters-focus',
    name: '狩人の集中',
    type: 'power',
    attribute: 'grass',
    archetypes: ['strength'],
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainStrength', amount: 3, duration: 'combat' }] },
  },
  {
    id: 'hunting-instinct',
    name: '狩猟本能',
    type: 'power',
    attribute: 'grass',
    archetypes: ['strength'],
    cost: 2,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'demonForm', amount: 1 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainPower', power: 'demonForm', amount: 2 }] },
  },
];
