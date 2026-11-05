import type { RelicDefinition } from '../domain/relic';

/** カイルの初期レリック。 */
export const FIGHTING_SPIRIT: RelicDefinition = {
  id: 'fighting-spirit',
  name: '闘志の炎',
  icon: '❤️‍🔥',
  rarity: 'starter',
  trigger: 'combatWon',
  effects: [{ kind: 'heal', amount: 6 }],
};

/**
 * ノアの初期レリック。戦闘の最初から水力があり、廃棄するたびに盾になる。
 * 重ねて消した下の札も廃棄なので、水札を重ねる戦いそのものが守りになる。
 */
export const CRYSTAL_WEIGHT: RelicDefinition = {
  id: 'crystal-weight',
  name: '水晶の文鎮',
  icon: '💎',
  rarity: 'starter',
  trigger: 'combatStart',
  effects: [
    { kind: 'gainWater', pool: 'attack', amount: 1 },
    { kind: 'gainWater', pool: 'guard', amount: 1 },
  ],
  summary:
    '戦闘開始時、攻撃の水力と守りの水力を 1 ずつ得る。カードが廃棄されるたび、ブロック 2 を得る。重ねて消した下の札も廃棄なので、重ねるたびに盾になる。',
};

/** リーネの初期レリック。戦闘開始時に宿り木を植える。 */
export const WORLD_TREE_SPROUT: RelicDefinition = {
  id: 'world-tree-sprout',
  name: '世界樹の若葉',
  icon: '🌱',
  rarity: 'starter',
  trigger: 'combatStart',
  effects: [{ kind: 'applyDebuff', status: 'seed', turns: 3 }],
};

/**
 * エリート・宝箱・ショップ・恩恵・イベントで手に入る。レア度の重み（economy の relicTierWeight）で抽選する。
 * コモン = 小さな底上げ / アンコモン = 毎ターン効く・条件つきで大きい / レア = デッキの軸を決定づける。
 */
export const RELIC_POOL: RelicDefinition[] = [
  // --- コモン ---
  {
    id: 'migrant-feather',
    name: '渡り鳥の羽',
    icon: '🪶',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'draw', amount: 2 }],
  },
  {
    id: 'herb-pouch',
    name: '薬草袋',
    icon: '🌿',
    rarity: 'common',
    trigger: 'combatWon',
    effects: [{ kind: 'heal', amount: 4 }],
  },
  {
    id: 'chain-mail',
    name: '鎖帷子',
    icon: '⛓️',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'block', amount: 6 }],
  },
  {
    id: 'star-fragment',
    name: '星のかけら',
    icon: '✨',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'gainEnergy', amount: 1 }],
  },
  {
    id: 'powder-pouch',
    name: '火薬袋',
    icon: '💣',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'damage', amount: 8 }],
  },
  {
    id: 'hunter-horn',
    name: '狩人の角笛',
    icon: '📯',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 3, duration: 'turn' }],
  },
  {
    id: 'warding-bell',
    name: '魔除けの鈴',
    icon: '🔔',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [
      { kind: 'block', amount: 4 },
      { kind: 'draw', amount: 1 },
    ],
  },
  {
    id: 'steadfast-stone',
    name: '不動の石',
    icon: '🪨',
    rarity: 'common',
    trigger: 'turnEnd',
    condition: 'noBlock',
    effects: [{ kind: 'block', amount: 6 }],
  },
  {
    id: 'hunter-snare',
    name: '狩人の罠',
    icon: '🪤',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'applyDebuff', status: 'vulnerable', turns: 1 }],
  },
  {
    id: 'drowsy-incense',
    name: '眠り草の香',
    icon: '🌾',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'applyDebuff', status: 'weak', turns: 1 }],
  },
  {
    id: 'moon-sand',
    name: '月の砂',
    icon: '🌙',
    rarity: 'common',
    trigger: 'turnStart',
    condition: 'everyThirdTurn',
    effects: [{ kind: 'draw', amount: 2 }],
  },
  {
    id: 'lily-charm',
    name: '鈴蘭のお守り',
    icon: '💮',
    rarity: 'common',
    trigger: 'combatStart',
    effects: [{ kind: 'heal', amount: 3 }],
  },
  {
    id: 'guardian-ring',
    name: '守り手の指輪',
    icon: '💍',
    rarity: 'common',
    trigger: 'turnStart',
    condition: 'lowHp',
    effects: [{ kind: 'block', amount: 4 }],
  },
  // --- アンコモン ---
  {
    id: 'warrior-headband',
    name: '戦士の鉢巻',
    icon: '🎗️',
    rarity: 'uncommon',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 1, duration: 'combat' }],
  },
  {
    id: 'thorn-armor',
    name: '茨の鎧',
    icon: '🌵',
    rarity: 'uncommon',
    trigger: 'turnEnd',
    effects: [{ kind: 'block', amount: 3 }],
  },
  {
    id: 'rusty-anchor',
    name: '錆びた錨',
    icon: '⚓',
    rarity: 'uncommon',
    trigger: 'combatStart',
    effects: [{ kind: 'block', amount: 10 }],
  },
  {
    id: 'ember-lantern',
    name: '灯火のランタン',
    icon: '🏮',
    rarity: 'uncommon',
    trigger: 'turnStart',
    condition: 'everyThirdTurn',
    effects: [{ kind: 'gainEnergy', amount: 1 }],
  },
  {
    id: 'war-banner',
    name: '戦旗',
    icon: '🚩',
    rarity: 'uncommon',
    trigger: 'combatStart',
    condition: 'eliteOrBoss',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
  },
  {
    id: 'adversity-amulet',
    name: '逆境の護符',
    icon: '🧿',
    rarity: 'uncommon',
    trigger: 'turnStart',
    condition: 'lowHp',
    effects: [{ kind: 'gainEnergy', amount: 1 }],
  },
  {
    id: 'war-drum',
    name: '戦太鼓',
    icon: '🥁',
    rarity: 'uncommon',
    trigger: 'combatStart',
    effects: [{ kind: 'gainBuff', status: 'blazing', turns: 1 }],
  },
  {
    id: 'bastion-crest',
    name: '守りの紋章',
    icon: '🔰',
    rarity: 'uncommon',
    trigger: 'combatStart',
    effects: [{ kind: 'gainBuff', status: 'retainBlock', turns: 2 }],
  },
  {
    id: 'life-sapling',
    name: '生命の苗木',
    icon: '🌱',
    rarity: 'uncommon',
    trigger: 'turnEnd',
    effects: [{ kind: 'heal', amount: 1 }],
  },
  // --- レア（デッキの軸を決定づける） ---
  {
    id: 'champion-belt',
    name: '王者の剣帯',
    icon: '🏅',
    rarity: 'rare',
    trigger: 'turnStart',
    condition: 'everyThirdTurn',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
  },
  {
    id: 'hero-mantle',
    name: '英雄の外套',
    icon: '🧣',
    rarity: 'rare',
    trigger: 'turnEnd',
    effects: [{ kind: 'block', amount: 6 }],
  },
  {
    id: 'fortress-stone',
    name: '城塞の礎石',
    icon: '🏰',
    rarity: 'rare',
    trigger: 'combatStart',
    effects: [{ kind: 'gainPower', power: 'barricade', amount: 1 }],
  },
  {
    id: 'insight-eye',
    name: '看破の魔眼',
    icon: '👁️',
    rarity: 'rare',
    trigger: 'combatStart',
    effects: [{ kind: 'gainPower', power: 'sadistic', amount: 3 }],
  },
  {
    id: 'crimson-core',
    name: '紅蓮の心核',
    icon: '💎',
    rarity: 'rare',
    trigger: 'combatStart',
    effects: [{ kind: 'gainPower', power: 'rupture', amount: 1 }],
  },
  {
    id: 'iron-sigil',
    name: '鉄壁の印章',
    icon: '🪬',
    rarity: 'rare',
    trigger: 'combatStart',
    effects: [{ kind: 'gainPower', power: 'juggernaut', amount: 3 }],
  },
];

/** ボス撃破後の 3 択。強力だが代償つきのものもある。 */
export const BOSS_RELIC_POOL: RelicDefinition[] = [
  {
    id: 'sun-crown',
    name: '太陽の王冠',
    icon: '👑',
    rarity: 'boss',
    effects: [],
    onObtain: [
      { kind: 'changeEnergyPerTurn', amount: 1 },
      { kind: 'loseMaxHp', amount: 8 },
    ],
  },
  {
    id: 'void-shard',
    name: '虚空の欠片',
    icon: '🌀',
    rarity: 'boss',
    effects: [],
    onObtain: [
      { kind: 'changeEnergyPerTurn', amount: 1 },
      { kind: 'changeDrawPerTurn', amount: -1 },
    ],
  },
  {
    id: 'sage-hourglass',
    name: '賢者の砂時計',
    icon: '⌛',
    rarity: 'boss',
    effects: [],
    onObtain: [{ kind: 'changeDrawPerTurn', amount: 1 }],
  },
  {
    id: 'giant-heart',
    name: '巨人の心臓',
    icon: '🫀',
    rarity: 'boss',
    effects: [],
    onObtain: [{ kind: 'gainMaxHp', amount: 20 }],
  },
  {
    id: 'obsidian-shield',
    name: '黒曜の盾',
    icon: '🛡️',
    rarity: 'boss',
    trigger: 'combatStart',
    effects: [{ kind: 'block', amount: 14 }],
  },
  {
    id: 'dragon-fang',
    name: '竜の牙',
    icon: '🦷',
    rarity: 'boss',
    trigger: 'combatStart',
    effects: [{ kind: 'gainStrength', amount: 2, duration: 'combat' }],
  },
  {
    id: 'crimson-scepter',
    name: '紅蓮の王笏',
    icon: '🔱',
    rarity: 'boss',
    trigger: 'combatStart',
    effects: [{ kind: 'loseHp', amount: 3 }],
    onObtain: [{ kind: 'changeEnergyPerTurn', amount: 1 }],
  },
  {
    id: 'dragon-chalice',
    name: '竜血の杯',
    icon: '🏆',
    rarity: 'boss',
    trigger: 'combatWon',
    effects: [{ kind: 'heal', amount: 8 }],
    onObtain: [{ kind: 'gainMaxHp', amount: 10 }],
  },
  {
    id: 'storm-orb',
    name: '嵐の宝玉',
    icon: '🌪️',
    rarity: 'boss',
    trigger: 'combatStart',
    effects: [
      { kind: 'damage', amount: 12 },
      { kind: 'applyDebuff', status: 'vulnerable', turns: 2 },
    ],
  },
];

/**
 * 章の開始の贈り物だけで渡すレリック。ショップやエリートの抽選には入れない。
 */
export const FINALE_LAMP: RelicDefinition = {
  id: 'finale-lamp',
  name: '終幕の灯',
  icon: '🏮',
  rarity: 'rare',
  effects: [],
  upgradeBossOpeningHand: true,
  summary: 'ボス戦と、最後の決戦で、戦闘開始時の手札をすべて強化する。強化はその後も残る。',
};

export const OPENING_FANFARE: RelicDefinition = {
  id: 'opening-fanfare',
  name: '開幕のラッパ',
  icon: '🎺',
  rarity: 'rare',
  trigger: 'combatStart',
  effects: [
    { kind: 'draw', amount: 1 },
    { kind: 'gainEnergy', amount: 1 },
  ],
  summary: '戦闘開始時、カードを 1 枚多く引き、エナジーを 1 得る。',
};

export const BLOOD_PULSE: RelicDefinition = {
  id: 'blood-pulse',
  name: '血の拍動',
  icon: '💓',
  rarity: 'rare',
  trigger: 'turnStart',
  effects: [
    { kind: 'loseHp', amount: 2 },
    { kind: 'gainEnergy', amount: 1 },
  ],
  summary: '毎ターンの開始時、HP を 2 失い、エナジーを 1 得る。HP が尽きると、その場で倒れる。',
};

export const TWIN_PULSE: RelicDefinition = {
  id: 'twin-pulse',
  name: '二重の鼓動',
  icon: '💞',
  rarity: 'rare',
  effects: [],
  onObtain: [
    { kind: 'loseMaxHp', amount: 12 },
    { kind: 'changeEnergyPerTurn', amount: 1 },
    { kind: 'changeDrawPerTurn', amount: 1 },
  ],
  summary: '最大 HP が 12 減る。その代わり、毎ターンのエナジーと引く枚数が 1 ずつ増える。',
};

export const ACT_RELICS: RelicDefinition[] = [FINALE_LAMP, OPENING_FANFARE, BLOOD_PULSE, TWIN_PULSE];
