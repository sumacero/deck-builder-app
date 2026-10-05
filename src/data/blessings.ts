import type { BlessingDefinition, GuideCharacter } from '../domain/blessing';

export const LANTERN_SPIRIT: GuideCharacter = {
  name: '灯守りのルーメ',
  icon: '🕯️',
  finaleLine:
    '三つの地の主を倒したのね。でも、彼らに魔力を与えていたのは星喰みの魔皇ノクス。火・水・草の三つの旗を掲げ替えて、弱点を変えてくる。旗の色を見て、突ける番を逃さないで。傷はすっかり癒やしておいたわ。さあ、最後の戦いへ。',
};

/** 各章の最初の 3 択。グループごとに 1 つずつ出る。 */
export const STANDARD_BLESSINGS: BlessingDefinition[] = [
  // デッキ
  { id: 'choose-upgrade', group: 'deck', effects: [], choice: 'upgradeCard' },
  { id: 'choose-remove', group: 'deck', effects: [], choice: 'removeCard' },
  { id: 'pick-card', group: 'deck', effects: [], choice: 'pickCard' },
  { id: 'upgrade-two', group: 'deck', effects: [{ kind: 'upgradeRandom', count: 2 }] },
  // 資源
  { id: 'max-hp', group: 'resource', effects: [{ kind: 'gainMaxHp', amount: 8 }] },
  { id: 'gold', group: 'resource', effects: [{ kind: 'gainGold', amount: 100 }] },
  { id: 'relic', group: 'resource', effects: [{ kind: 'gainRelic' }] },
  { id: 'potions', group: 'resource', effects: [{ kind: 'fillPotions' }] },
  // 代償つき（大きな見返り）
  {
    id: 'two-relics',
    group: 'tradeoff',
    effects: [{ kind: 'loseMaxHp', amount: 8 }, { kind: 'gainRelic' }, { kind: 'gainRelic' }],
  },
  {
    id: 'big-gold',
    group: 'tradeoff',
    effects: [
      { kind: 'loseMaxHp', amount: 6 },
      { kind: 'gainGold', amount: 250 },
    ],
  },
  {
    id: 'mass-upgrade',
    group: 'tradeoff',
    effects: [
      { kind: 'loseMaxHp', amount: 6 },
      { kind: 'upgradeRandom', count: 4 },
    ],
  },
];
