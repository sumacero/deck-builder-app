import type { BlessingDefinition, BlessingPattern, GuideCharacter } from '../domain/blessing';
import {
  BLOOD_OATH,
  DESPERATE_FLURRY,
  LAST_BLOW,
  NOX_SHARD,
  REVERSAL_WARD,
  STAR_AFTERGLOW,
  STAR_BURDEN,
} from './actCards';
import { BLOOD_PULSE, FINALE_LAMP, OPENING_FANFARE, TWIN_PULSE } from './relics';

export const LANTERN_SPIRIT: GuideCharacter = {
  name: '灯守りのルーメ',
  icon: '🕯️',
  finaleLine:
    '三つの地の主を倒したのね。でも、彼らに魔力を与えていたのは星喰みの魔皇ノクス。火・水・草の三つの旗を掲げ替えて、弱点を変えてくる。旗の色を見て、突ける番を逃さないで。傷はすっかり癒やしておいたわ。さあ、最後の戦いへ。',
};

const blessing = (
  id: string,
  act: 1 | 2 | 3,
  group: BlessingDefinition['group'],
  effects: BlessingDefinition['effects'],
  choice?: BlessingDefinition['choice'],
): BlessingDefinition => ({ id, act, group, effects, ...(choice ? { choice } : {}) });

/**
 * 各章の開始で、4 組から 1 組が出る。1 組は 3 択。
 * 第 1 章は小さな整理と拾い物。第 2 章は札の性質とレリック。第 3 章は専用の強い札。
 */
export const BLESSING_PATTERNS: BlessingPattern[] = [
  {
    id: 'act1-unpack',
    act: 1,
    offer: '旅の荷を、少し軽くしておきましょう。',
    choices: [
      blessing('a1-remove', 1, 'deck', [], 'removeCard'),
      blessing('a1-potions', 1, 'resource', [{ kind: 'fillPotions' }]),
      blessing('a1-gold-150', 1, 'resource', [{ kind: 'gainGold', amount: 150 }]),
    ],
  },
  {
    id: 'act1-finds',
    act: 1,
    offer: '道端に、使えそうなものが落ちているわ。',
    choices: [
      blessing('a1-two-cards', 1, 'deck', [{ kind: 'addRandomCards', count: 2 }]),
      blessing('a1-relic', 1, 'resource', [{ kind: 'gainRelic' }]),
      blessing('a1-transform', 1, 'deck', [{ kind: 'transformRandom', count: 1 }]),
    ],
  },
  {
    id: 'act1-travel-light',
    act: 1,
    offer: '身軽に行くなら、いまのうちよ。',
    choices: [
      blessing('a1-drop-basics', 1, 'tradeoff', [
        { kind: 'removeBasics', strikes: 1, defends: 1 },
        { kind: 'loseMaxHp', amount: 7 },
      ]),
      blessing('a1-upgrade-one', 1, 'deck', [], 'upgradeCard'),
      blessing('a1-max-hp', 1, 'resource', [{ kind: 'gainMaxHp', amount: 8 }]),
    ],
  },
  {
    id: 'act1-luck',
    act: 1,
    offer: '小さな幸運を、一つ持っていきなさい。',
    choices: [
      blessing('a1-pick-card', 1, 'deck', [], 'pickCard'),
      blessing('a1-upgrade-two', 1, 'deck', [{ kind: 'upgradeRandom', count: 2 }]),
      blessing('a1-gold-for-hp', 1, 'tradeoff', [
        { kind: 'loseMaxHp', amount: 6 },
        { kind: 'gainGold', amount: 200 },
      ]),
    ],
  },
  {
    id: 'act2-hone',
    act: 2,
    offer: '刃を研いでおきましょう。ここから先は、初手で決まるわ。',
    choices: [
      blessing('a2-finale-lamp', 2, 'resource', [{ kind: 'gainNamedRelic', relic: FINALE_LAMP }]),
      blessing('a2-hone', 2, 'deck', [{ kind: 'honeBasics', amount: 2 }]),
      blessing('a2-upgrade-starters', 2, 'deck', [{ kind: 'upgradeStarters' }]),
    ],
  },
  {
    id: 'act2-marks',
    act: 2,
    offer: '札に、戦い方を刻めるわ。どれを残したいか、自分で選んで。',
    choices: [
      blessing('a2-replay', 2, 'deck', [{ kind: 'stampCards', stamp: 'replay', count: 1 }]),
      blessing('a2-sly', 2, 'deck', [{ kind: 'stampCards', stamp: 'sly', count: 2 }]),
      blessing('a2-innate', 2, 'deck', [{ kind: 'stampCards', stamp: 'innate', count: 1 }]),
    ],
  },
  {
    id: 'act2-habit',
    act: 2,
    offer: '手札の癖を、一つ足しておきなさい。',
    choices: [
      blessing('a2-retain', 2, 'deck', [{ kind: 'stampCards', stamp: 'retain', count: 1 }]),
      blessing('a2-draw', 2, 'resource', [{ kind: 'changeDrawPerTurn', amount: 1 }]),
      blessing('a2-cursed-upgrade', 2, 'tradeoff', [
        { kind: 'upgradeAll' },
        { kind: 'addCurses', card: STAR_BURDEN, count: 2 },
      ]),
    ],
  },
  {
    id: 'act2-berserk',
    act: 2,
    offer: '力を借りるなら、代償は覚悟して。',
    choices: [
      blessing('a2-berserk', 2, 'deck', [{ kind: 'berserkBasics' }]),
      blessing('a2-relic', 2, 'resource', [{ kind: 'gainRelic' }]),
      blessing('a2-energy', 2, 'tradeoff', [
        { kind: 'loseMaxHp', amount: 8 },
        { kind: 'changeEnergyPerTurn', amount: 1 },
      ]),
    ],
  },
  {
    id: 'act3-afterglow',
    act: 3,
    offer: '星の残り火よ。強い光ほど、身を焦がすわ。',
    choices: [
      blessing('a3-afterglow', 3, 'tradeoff', [
        { kind: 'loseMaxHp', amount: 6 },
        { kind: 'addCard', card: STAR_AFTERGLOW },
      ]),
      blessing('a3-fanfare', 3, 'resource', [{ kind: 'gainNamedRelic', relic: OPENING_FANFARE }]),
      blessing('a3-oath', 3, 'deck', [{ kind: 'addCard', card: BLOOD_OATH }]),
    ],
  },
  {
    id: 'act3-forbidden',
    act: 3,
    offer: '禁じられた技を、一つだけ渡しなさい、と星が言っているわ。',
    choices: [
      blessing('a3-last-blow', 3, 'deck', [{ kind: 'addCard', card: LAST_BLOW }]),
      blessing('a3-reversal', 3, 'deck', [{ kind: 'addCard', card: REVERSAL_WARD }]),
      blessing('a3-flurry', 3, 'deck', [{ kind: 'addCard', card: DESPERATE_FLURRY }]),
    ],
  },
  {
    id: 'act3-fate',
    act: 3,
    offer: '運命を書き換えられるのは、いまだけよ。',
    choices: [
      blessing('a3-rare-relic', 3, 'tradeoff', [
        { kind: 'upgradeRandom', count: 3 },
        { kind: 'gainRelic', tier: 'rare' },
      ]),
      blessing('a3-remove-hp', 3, 'tradeoff', [{ kind: 'gainMaxHp', amount: 12 }], 'removeCard'),
      blessing('a3-blood-pulse', 3, 'resource', [{ kind: 'gainNamedRelic', relic: BLOOD_PULSE }]),
    ],
  },
  {
    id: 'act3-nox',
    act: 3,
    offer: '魔皇の力が、まだこの道にも残っている。',
    choices: [
      blessing('a3-nox', 3, 'deck', [{ kind: 'addCard', card: NOX_SHARD }]),
      blessing('a3-twin-pulse', 3, 'tradeoff', [{ kind: 'gainNamedRelic', relic: TWIN_PULSE }]),
      blessing('a3-armory', 3, 'tradeoff', [
        { kind: 'loseMaxHp', amount: 15 },
        { kind: 'addCard', card: LAST_BLOW },
        { kind: 'addCard', card: BLOOD_OATH },
      ]),
    ],
  },
];

/** 図鑑用。章の開始で実際に出るのは、上の組から 1 組だけ。 */
export const STANDARD_BLESSINGS: BlessingDefinition[] = BLESSING_PATTERNS.flatMap(
  (pattern) => pattern.choices,
);
