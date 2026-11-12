import type { CardDefinition } from '../domain/card';

/**
 * 敵が捨て札に混ぜるお邪魔カードと、出来事でデッキに残る呪い。
 * お邪魔は戦闘が終わると消える。呪いはデッキに残り、ショップや出来事で削除できる。
 * エナジーを 2 払わせるお邪魔は置かない。困り方は「使えない」「捨てると暴れる」「出して消す」「手札に居座る」。
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

/**
 * 草・風: 0 コストで出して廃棄できる。放置すると痛み、捨て札に戻ってまた来る。
 * エナジーは奪わない。手札の 1 枚を使って振りほどく。
 */
export const TANGLING_VINE: CardDefinition = {
  id: 'tangling-vine',
  name: '絡みつく蔦',
  rarity: 'common',
  type: 'status',
  cost: 0,
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
  art: 'frost-chip',
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

/**
 * 使えない昇華。自分では出せない。捨てられたとき（ターンの終わりを含む）に痛み、その戦闘から消える。
 */
export const REGRET: CardDefinition = {
  id: 'regret',
  name: '悔恨',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [{ kind: 'loseHp', amount: 3 }],
  unplayable: true,
  sly: true,
  exhaust: true,
};

/** 使えないまま手札に居座る。ターンの終わりに痛み、次の手札にも残る。 */
export const HEX_BIND: CardDefinition = {
  id: 'hex-bind',
  name: '呪縛',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [],
  unplayable: true,
  retain: true,
  turnEndInHand: [{ kind: 'loseHp', amount: 2 }],
};

/**
 * 手札にあるあいだ、これ以外は使えない。0 コストで出して廃棄できるが、出すと痛む。
 */
export const OMEN: CardDefinition = {
  id: 'omen',
  name: '先触れ',
  rarity: 'common',
  type: 'status',
  cost: 0,
  target: 'self',
  effects: [{ kind: 'loseHp', amount: 2 }],
  priority: true,
  exhaust: true,
};

/**
 * デッキに残る呪い。毎戦闘、最初の手札に入り、ターンの終わりに痛んで消える。
 * その戦闘の山札には戻らない。
 */
export const HOLLOW: CardDefinition = {
  id: 'hollow',
  name: '虚ろ',
  rarity: 'common',
  type: 'skill',
  cost: 0,
  target: 'self',
  effects: [],
  curse: true,
  unplayable: true,
  innate: true,
  ethereal: true,
  turnEndInHand: [{ kind: 'loseHp', amount: 2 }],
};

export const STATUS_CARDS: CardDefinition[] = [
  BURN,
  TANGLING_VINE,
  ICE_SHARD,
  SCRAP,
  REGRET,
  HEX_BIND,
  OMEN,
];

export const CURSE_CARDS: CardDefinition[] = [HOLLOW];
