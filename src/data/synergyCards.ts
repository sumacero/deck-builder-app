import type { CardDefinition } from '../domain/card';

/**
 * デッキ構築を強要するためのシナジー札。
 * 単体の数値は低く、捨て・廃棄・手数・スキル回数と組んで化ける。
 * （残影斬・灰燼の一撃・手数の盾・追撃の律動は下位互換／重複のため削除済み）
 */
export const SYNERGY_CARDS: CardDefinition[] = [
  {
    id: 'toss-draw',
    name: '捨て身の歩み',
    rarity: 'common',
    type: 'skill',
    archetypes: ['tempo'],
    cost: 1,
    target: 'self',
    // 無作為に 1 枚飛ぶ。ドローの対価で、良い札が消えることもある。
    effects: [
      { kind: 'discardFromHand', amount: 1 },
      { kind: 'draw', amount: 2 },
    ],
    upgrade: {
      effects: [
        { kind: 'discardFromHand', amount: 1 },
        { kind: 'draw', amount: 3 },
      ],
    },
  },
  {
    id: 'sweep-out',
    name: '掃き出し',
    rarity: 'common',
    type: 'skill',
    archetypes: ['tempo'],
    cost: 0,
    target: 'self',
    // 単体でもドローが残る。拾い集めと組むとさらに回る。
    effects: [
      { kind: 'discardFromHand', amount: 2 },
      { kind: 'gainEnergy', amount: 1 },
      { kind: 'draw', amount: 1 },
    ],
    upgrade: {
      effects: [
        { kind: 'discardFromHand', amount: 2 },
        { kind: 'gainEnergy', amount: 1 },
        { kind: 'draw', amount: 2 },
      ],
    },
  },
  {
    id: 'scatter-blade',
    name: '飛び札',
    rarity: 'common',
    type: 'attack',
    archetypes: ['tempo'],
    cost: 1,
    target: 'enemy',
    // 自分の捨て込みだけでもストライク相当になるよう底上げ。
    effects: [
      { kind: 'discardFromHand', amount: 1 },
      { kind: 'damagePerDiscard', base: 5, perCard: 4 },
    ],
    upgrade: {
      effects: [
        { kind: 'discardFromHand', amount: 1 },
        { kind: 'damagePerDiscard', base: 6, perCard: 5 },
      ],
    },
  },
  {
    id: 'offer-ember',
    name: '手放し',
    rarity: 'common',
    type: 'skill',
    archetypes: ['tempo', 'sacrifice'],
    cost: 1,
    target: 'self',
    effects: [
      { kind: 'exhaustFromHand', amount: 1 },
      { kind: 'block', amount: 7 },
    ],
    upgrade: {
      effects: [
        { kind: 'exhaustFromHand', amount: 1 },
        { kind: 'block', amount: 10 },
      ],
    },
  },
  {
    id: 'ashen-rite',
    name: '消しの儀式',
    rarity: 'uncommon',
    type: 'skill',
    archetypes: ['tempo', 'sacrifice'],
    cost: 1,
    target: 'enemy',
    // 廃棄 1 枚だけでも 9 ダメ。燃え殻と組むとさらに伸びる。
    // 選んで廃棄できる。呪い札や初期札を抜きつつダメージになる、無作為より高い効果。
    effects: [
      { kind: 'exhaustFromHand', amount: 1, choose: true },
      { kind: 'damagePerExhaust', base: 6, perCard: 3 },
    ],
    upgrade: {
      effects: [
        { kind: 'exhaustFromHand', amount: 1, choose: true },
        { kind: 'damagePerExhaust', base: 7, perCard: 4 },
      ],
    },
  },
  {
    id: 'skill-follow',
    name: '継ぎ打ち',
    rarity: 'uncommon',
    type: 'attack',
    archetypes: ['tempo'],
    cost: 1,
    target: 'enemy',
    // スキル 0 でも 6。スキルを積むほど伸びる。
    effects: [{ kind: 'damagePerSkillPlayed', base: 6, perCard: 4 }],
    upgrade: { effects: [{ kind: 'damagePerSkillPlayed', base: 7, perCard: 5 }] },
  },
  {
    id: 'momentum-form',
    name: '勢いの型',
    rarity: 'rare',
    type: 'power',
    archetypes: ['tempo', 'strength'],
    cost: 2,
    target: 'self',
    // カードを使うたび筋力。1 では勝ち筋に乗りにくかったので底上げ。
    effects: [{ kind: 'gainPower', power: 'momentum', amount: 2 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainPower', power: 'momentum', amount: 3 }] },
  },
  {
    id: 'scavenge-form',
    name: '拾い集めの術',
    rarity: 'uncommon',
    type: 'power',
    archetypes: ['tempo'],
    cost: 1,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'scavenge', amount: 1 }],
    exhaust: true,
    upgrade: {
      cost: 0,
      effects: [{ kind: 'gainPower', power: 'scavenge', amount: 1 }],
    },
  },
  {
    id: 'cinder-form',
    name: '消え際の誓い',
    rarity: 'rare',
    type: 'power',
    archetypes: ['tempo', 'sacrifice'],
    cost: 2,
    target: 'self',
    effects: [{ kind: 'gainPower', power: 'cinder', amount: 4 }],
    exhaust: true,
    upgrade: { effects: [{ kind: 'gainPower', power: 'cinder', amount: 6 }] },
  },
  {
    id: 'combo-pulse',
    name: '連撃の鼓動',
    rarity: 'rare',
    type: 'attack',
    archetypes: ['tempo'],
    cost: 2,
    target: 'enemy',
    effects: [{ kind: 'damagePerCardPlayed', base: 6, perCard: 4 }],
    upgrade: { effects: [{ kind: 'damagePerCardPlayed', base: 8, perCard: 5 }] },
    motion: 'flurry',
  },
];
