import type { CardDefinition } from '../domain/card';

/** 敵が捨て札に混ぜるお邪魔カード。その戦闘の間だけデッキに入る。 */

/** 火・岩: 手札に残すと焼ける。 */
export const BURN: CardDefinition = {
  id: 'burn',
  name: '火傷',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [],
  unplayable: true,
  turnEndInHand: [{ kind: 'loseHp', amount: 2 }],
};

/** 草・風: 1 エナジー払えば振りほどける。 */
export const TANGLING_VINE: CardDefinition = {
  id: 'tangling-vine',
  name: '絡みつく蔦',
  rarity: 'common',
  type: 'status',
  cost: 1,
  target: 'self',
  effects: [],
  exhaust: true,
};

/** 水・氷: 使えないが、ターンの終わりに溶けて消える。 */
export const ICE_SHARD: CardDefinition = {
  id: 'ice-shard',
  name: '氷のかけら',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [],
  unplayable: true,
  ethereal: true,
};

/** 電・機械: 使えず、消えもしない。戦闘の間ずっと手札を圧迫する。 */
export const SCRAP: CardDefinition = {
  id: 'scrap',
  name: 'ガラクタ',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [],
  unplayable: true,
};

export const STATUS_CARDS: CardDefinition[] = [BURN, TANGLING_VINE, ICE_SHARD, SCRAP];
