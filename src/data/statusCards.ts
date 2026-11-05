import type { CardDefinition } from '../domain/card';

/**
 * 敵が捨て札に混ぜるお邪魔カード。その戦闘の間だけデッキに入る。
 * 火力ではなく、手札と山札を汚すための札。数値を上げるときは、ここを強くする。
 */

/** 火・岩: 使えないまま残り、手札にあるあいだ毎ターン焼ける。山札に戻る。 */
export const BURN: CardDefinition = {
  id: 'burn',
  name: '火傷',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [],
  unplayable: true,
  turnEndInHand: [{ kind: 'loseHp', amount: 4 }],
};

/** 草・風: 2 エナジーで振りほどける。放置すると痛み、捨て札に戻ってまた来る。 */
export const TANGLING_VINE: CardDefinition = {
  id: 'tangling-vine',
  name: '絡みつく蔦',
  rarity: 'common',
  type: 'status',
  cost: 2,
  target: 'self',
  effects: [],
  exhaust: true,
  turnEndInHand: [{ kind: 'loseHp', amount: 2 }],
};

/** 水・氷: 使えない。ターンの終わりに痛みを残して消える。戦闘中は戻ってこない。 */
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
  turnEndInHand: [{ kind: 'loseHp', amount: 3 }],
};

/**
 * 電・機械: 使えず、消えもしない。手札の終わりに、手札から無作為に 1 枚をその戦闘から消す。
 * 自分自身が消えることもある。
 */
export const SCRAP: CardDefinition = {
  id: 'scrap',
  name: 'ガラクタ',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [],
  unplayable: true,
  turnEndInHand: [{ kind: 'exhaustFromHand', amount: 1 }],
};

export const STATUS_CARDS: CardDefinition[] = [BURN, TANGLING_VINE, ICE_SHARD, SCRAP];
