import type { CardDefinition } from '../domain/card';
import { DEFEND, STRIKE } from './cards';

/**
 * 水鏡のノア（水属性）のカード。印は氷・雫・霞。
 * 同じ種類（アタックどうし・スキルどうし）・同じ段の札を手札で重ねると段が上がり、残った札の数値が 2 倍・3 倍になる。
 * 氷 = 単体の高火力と大きなブロック、雫 = 全体攻撃とドロー、霞 = ブロック無視・かわす・デバフ・悪い効果を消す。
 * 1 枚の数値はストライク（6）や防御（5）より低めで、重ねて化ける。絵は消した潮のカードの絵を差し替えて使う。
 */

const copies = (card: CardDefinition, count: number): CardDefinition[] =>
  Array.from({ length: count }, () => card);

const NOA = { attribute: 'water' } as const;

export const ICICLE: CardDefinition = {
  ...NOA,
  id: 'icicle',
  name: '氷柱',
  rarity: 'common',
  type: 'attack',
  archetypes: ['ice'],
  mark: 'ice',
  cost: 1,
  target: 'enemy',
  effects: [{ kind: 'damage', amount: 5 }],
  upgrade: { effects: [{ kind: 'damage', amount: 7 }] },
  art: 'ice-step',
};

export const THIN_ICE: CardDefinition = {
  ...NOA,
  id: 'thin-ice',
  name: '薄氷',
  rarity: 'common',
  type: 'skill',
  archetypes: ['ice'],
  mark: 'ice',
  cost: 1,
  target: 'self',
  effects: [{ kind: 'block', amount: 4 }],
  upgrade: { effects: [{ kind: 'block', amount: 6 }] },
  art: 'tide-sense',
};

export const DROPLET: CardDefinition = {
  ...NOA,
  id: 'droplet',
  name: '雫',
  rarity: 'common',
  type: 'attack',
  archetypes: ['drop'],
  mark: 'drop',
  cost: 1,
  target: 'allEnemies',
  effects: [{ kind: 'damage', amount: 3 }],
  upgrade: { effects: [{ kind: 'damage', amount: 4 }] },
  art: 'raindrop',
};

export const MIST_VEIL: CardDefinition = {
  ...NOA,
  id: 'mist-veil',
  name: '霞隠れ',
  rarity: 'common',
  type: 'skill',
  archetypes: ['mist'],
  mark: 'mist',
  cost: 1,
  target: 'self',
  effects: [{ kind: 'gainEvade', amount: 1 }],
  upgrade: { cost: 0 },
  art: 'rain-steps',
};

/** ノアの秘奥義。印を待たずに、小さなダメージとブロックとドローをまとめて出す。 */
export const MIRROR_TRIAD: CardDefinition = {
  id: 'mirror-triad',
  name: '水鏡・三枚',
  rarity: 'rare',
  type: 'attack',
  cost: 0,
  target: 'allEnemies',
  effects: [
    { kind: 'damage', amount: 6 },
    { kind: 'block', amount: 6 },
    { kind: 'draw', amount: 1 },
  ],
  mysticArte: true,
  exhaust: true,
  motion: 'heavy',
  art: 'white-wave',
};

/**
 * ノアの初期デッキ。ストライクはラン開始時に水属性になる。
 * 印のアタック 2 枚（氷柱・雫）と印のスキル 2 枚（薄氷・霞隠れ）で、最初の戦闘から 1 段どうしを重ねられる。
 */
export const MIRROR_STARTER_DECK: CardDefinition[] = [
  ...copies({ ...STRIKE, art: 'strike-azure' }, 3),
  ...copies({ ...DEFEND, art: 'defend-azure' }, 2),
  ICICLE,
  DROPLET,
  THIN_ICE,
  MIST_VEIL,
];

export const MIRROR_CARDS: CardDefinition[] = [
  ICICLE,
  THIN_ICE,
  DROPLET,
  MIST_VEIL,
  // --- 氷: 単体の高火力・大きなブロック ---
  {
    ...NOA,
    id: 'ice-lance',
    name: '氷槍',
    rarity: 'uncommon',
    type: 'attack',
    archetypes: ['ice'],
    mark: 'ice',
    cost: 2,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 11 }],
    upgrade: { effects: [{ kind: 'damage', amount: 14 }] },
    art: 'crack-tide',
  },
  {
    ...NOA,
    id: 'frost-edge',
    name: '霜の刃',
    rarity: 'common',
    type: 'attack',
    archetypes: ['ice'],
    mark: 'ice',
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 4 },
      { kind: 'applyFrost', amount: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 5 },
        { kind: 'applyFrost', amount: 3 },
      ],
    },
    art: 'ice-shard',
  },
  {
    ...NOA,
    id: 'ice-wall',
    name: '氷壁',
    rarity: 'uncommon',
    type: 'skill',
    archetypes: ['ice'],
    mark: 'ice',
    cost: 2,
    target: 'self',
    effects: [{ kind: 'block', amount: 10 }],
    upgrade: { effects: [{ kind: 'block', amount: 13 }] },
    art: 'frost-veil',
  },
  {
    ...NOA,
    id: 'ice-mirror',
    name: '氷鏡',
    rarity: 'uncommon',
    type: 'skill',
    archetypes: ['ice'],
    mark: 'ice',
    cost: 1,
    target: 'allEnemies',
    effects: [
      { kind: 'block', amount: 3 },
      { kind: 'applyFrost', amount: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 4 },
        { kind: 'applyFrost', amount: 3 },
      ],
    },
    art: 'water-mirror',
  },
  // --- 雫: 全体攻撃・ドロー ---
  {
    ...NOA,
    id: 'drop-rain',
    name: '雫の雨',
    rarity: 'uncommon',
    type: 'attack',
    archetypes: ['drop'],
    mark: 'drop',
    cost: 2,
    target: 'allEnemies',
    effects: [{ kind: 'damage', amount: 7 }],
    upgrade: { effects: [{ kind: 'damage', amount: 9 }] },
    art: 'drizzle',
  },
  {
    ...NOA,
    id: 'splash',
    name: '跳ね雫',
    rarity: 'common',
    type: 'attack',
    archetypes: ['drop'],
    mark: 'drop',
    cost: 1,
    target: 'allEnemies',
    effects: [
      { kind: 'damage', amount: 3 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 4 },
        { kind: 'draw', amount: 1 },
      ],
    },
    art: 'spray',
  },
  {
    ...NOA,
    id: 'water-film',
    name: '水の膜',
    rarity: 'common',
    type: 'skill',
    archetypes: ['drop'],
    mark: 'drop',
    cost: 1,
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
    art: 'shoreline',
  },
  {
    ...NOA,
    id: 'drop-veil',
    name: '雫の帳',
    rarity: 'uncommon',
    type: 'skill',
    archetypes: ['drop'],
    mark: 'drop',
    cost: 2,
    target: 'self',
    effects: [
      { kind: 'block', amount: 7 },
      { kind: 'draw', amount: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'block', amount: 9 },
        { kind: 'draw', amount: 2 },
      ],
    },
    art: 'rain-shelter',
  },
  // --- 霞: ブロック無視・かわす・デバフ・悪い効果を消す ---
  {
    ...NOA,
    id: 'mist-cut',
    name: '霞斬り',
    rarity: 'common',
    type: 'attack',
    archetypes: ['mist'],
    mark: 'mist',
    cost: 1,
    target: 'enemy',
    effects: [{ kind: 'damage', amount: 4, pierce: true }],
    upgrade: { effects: [{ kind: 'damage', amount: 6, pierce: true }] },
    art: 'undertow',
  },
  {
    ...NOA,
    id: 'haze-thrust',
    name: '朧突き',
    rarity: 'uncommon',
    type: 'attack',
    archetypes: ['mist'],
    mark: 'mist',
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 2, hits: 2, pierce: true },
      { kind: 'applyDebuff', status: 'weak', turns: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 3, hits: 2, pierce: true },
        { kind: 'applyDebuff', status: 'weak', turns: 1 },
      ],
    },
    art: 'twin-drops',
  },
  {
    ...NOA,
    id: 'dissipate',
    name: '霧散',
    rarity: 'uncommon',
    type: 'attack',
    archetypes: ['mist'],
    mark: 'mist',
    cost: 1,
    target: 'enemy',
    effects: [
      { kind: 'damage', amount: 3 },
      { kind: 'stripStrength', amount: 3 },
    ],
    upgrade: {
      effects: [
        { kind: 'damage', amount: 5 },
        { kind: 'stripStrength', amount: 4 },
      ],
    },
    art: 'ebb',
  },
  {
    ...NOA,
    id: 'mist-clear',
    name: '霧払い',
    rarity: 'common',
    type: 'skill',
    archetypes: ['mist'],
    mark: 'mist',
    cost: 0,
    target: 'self',
    effects: [
      { kind: 'cleanse', count: 1 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'cleanse', count: 2 },
        { kind: 'draw', amount: 1 },
      ],
    },
    art: 'white-wave',
  },
  {
    ...NOA,
    id: 'dream-fog',
    name: '夢霧',
    rarity: 'uncommon',
    type: 'skill',
    archetypes: ['mist'],
    mark: 'mist',
    cost: 2,
    target: 'allEnemies',
    effects: [{ kind: 'applyDebuff', status: 'weak', turns: 1 }],
    upgrade: { cost: 1 },
    art: 'droplet-chain',
  },
  // --- パワー（印は無く、重ねられない） ---
  {
    ...NOA,
    id: 'still-surface',
    name: '水面',
    rarity: 'rare',
    type: 'power',
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'fuseEcho', amount: 1 }],
    exhaust: true,
    upgrade: { cost: 0 },
    art: 'high-tide',
  },
  {
    ...NOA,
    id: 'deep-water',
    name: '深み',
    rarity: 'rare',
    type: 'power',
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'stackDepth', amount: 1 }],
    exhaust: true,
    upgrade: { cost: 0 },
    art: 'still-waters',
  },
];
