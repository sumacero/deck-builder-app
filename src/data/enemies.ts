import type { EnemyDefinition } from '../domain/enemy';

// ---- 第 1 章 ----

export const CAVE_SLIME: EnemyDefinition = {
  id: 'cave-slime',
  name: '洞窟スライム',
  icon: '🟢',
  rank: 'normal',
  maxHp: 44,
  moves: [
    { id: 'tackle', name: '体当たり', actions: [{ kind: 'attack', damage: 11, hits: 1 }] },
    {
      id: 'harden',
      name: '硬化',
      actions: [
        { kind: 'block', amount: 6 },
        { kind: 'attack', damage: 5, hits: 1 },
      ],
    },
    { id: 'flurry', name: '連打', actions: [{ kind: 'attack', damage: 4, hits: 2 }] },
  ],
};

export const FANG_RAT: EnemyDefinition = {
  id: 'fang-rat',
  name: '牙ネズミ',
  icon: '🐀',
  rank: 'normal',
  maxHp: 30,
  moves: [
    { id: 'bite', name: '噛みつき', actions: [{ kind: 'attack', damage: 7, hits: 1 }] },
    { id: 'frenzy', name: '乱れ噛み', actions: [{ kind: 'attack', damage: 3, hits: 3 }] },
    {
      id: 'crouch',
      name: '身構え',
      actions: [
        { kind: 'block', amount: 5 },
        { kind: 'attack', damage: 4, hits: 1 },
      ],
    },
  ],
};

export const ROTTING_SOLDIER: EnemyDefinition = {
  id: 'rotting-soldier',
  name: '朽ちた兵士',
  icon: '🧟',
  rank: 'normal',
  maxHp: 40,
  moves: [
    {
      id: 'shield-up',
      name: '盾構え',
      actions: [
        { kind: 'block', amount: 8 },
        { kind: 'attack', damage: 6, hits: 1 },
      ],
    },
    { id: 'cleave', name: '叩き斬り', actions: [{ kind: 'attack', damage: 13, hits: 1 }] },
    { id: 'stomp', name: '踏みつけ', actions: [{ kind: 'attack', damage: 5, hits: 2 }] },
  ],
};

export const CAVE_HOUND: EnemyDefinition = {
  id: 'cave-hound',
  name: '洞窟の番犬',
  icon: '🐺',
  rank: 'elite',
  maxHp: 72,
  moves: [
    { id: 'crunch', name: '噛み砕き', actions: [{ kind: 'attack', damage: 14, hits: 1 }] },
    {
      id: 'howl',
      name: '遠吠え',
      actions: [
        { kind: 'buff', strength: 2 },
        { kind: 'block', amount: 6 },
      ],
    },
    { id: 'double-bite', name: '連続噛み', actions: [{ kind: 'attack', damage: 6, hits: 2 }] },
  ],
};

export const STONE_GUARDIAN: EnemyDefinition = {
  id: 'stone-guardian',
  name: '石の守護者',
  icon: '🗿',
  rank: 'elite',
  maxHp: 85,
  moves: [
    {
      id: 'rock-wall',
      name: '岩壁',
      actions: [
        { kind: 'block', amount: 12 },
        { kind: 'attack', damage: 6, hits: 1 },
      ],
    },
    { id: 'giant-fist', name: '巨拳', actions: [{ kind: 'attack', damage: 16, hits: 1 }] },
    { id: 'tremor', name: '地鳴り', actions: [{ kind: 'attack', damage: 4, hits: 3 }] },
  ],
};

export const SLIME_KING: EnemyDefinition = {
  id: 'slime-king',
  name: 'スライムキング',
  icon: '🦠',
  rank: 'boss',
  maxHp: 110,
  moves: [
    {
      id: 'swell',
      name: '膨張',
      actions: [
        { kind: 'block', amount: 12 },
        { kind: 'buff', strength: 2 },
      ],
    },
    { id: 'crush', name: '押し潰し', actions: [{ kind: 'attack', damage: 14, hits: 1 }] },
    { id: 'acid-rain', name: '酸の雨', actions: [{ kind: 'attack', damage: 4, hits: 3 }] },
    { id: 'engulf', name: '飲み込み', actions: [{ kind: 'attack', damage: 20, hits: 1 }] },
  ],
};

// ---- 第 2 章 ----

export const RUSTED_KNIGHT: EnemyDefinition = {
  id: 'rusted-knight',
  name: '錆びた騎士',
  icon: '🤺',
  rank: 'normal',
  maxHp: 55,
  moves: [
    { id: 'thrust', name: '突き', actions: [{ kind: 'attack', damage: 12, hits: 1 }] },
    {
      id: 'guard',
      name: '構え',
      actions: [
        { kind: 'block', amount: 10 },
        { kind: 'attack', damage: 7, hits: 1 },
      ],
    },
    { id: 'combo', name: '連撃', actions: [{ kind: 'attack', damage: 6, hits: 3 }] },
  ],
};

export const HEX_MAGE: EnemyDefinition = {
  id: 'hex-mage',
  name: '呪術師',
  icon: '🧙',
  rank: 'normal',
  maxHp: 48,
  moves: [
    {
      id: 'hex-mark',
      name: '呪いの印',
      actions: [
        { kind: 'buff', strength: 2 },
        { kind: 'block', amount: 6 },
      ],
    },
    { id: 'dark-bolt', name: '闇の矢', actions: [{ kind: 'attack', damage: 10, hits: 1 }] },
    { id: 'dark-rain', name: '闇の雨', actions: [{ kind: 'attack', damage: 4, hits: 3 }] },
  ],
};

export const CASTLE_BAT: EnemyDefinition = {
  id: 'castle-bat',
  name: '城の吸血蝙蝠',
  icon: '🦇',
  rank: 'normal',
  maxHp: 45,
  moves: [
    { id: 'drain', name: '吸血', actions: [{ kind: 'attack', damage: 9, hits: 1 }] },
    { id: 'whirl', name: '乱舞', actions: [{ kind: 'attack', damage: 3, hits: 4 }] },
    {
      id: 'flap',
      name: '羽ばたき',
      actions: [
        { kind: 'block', amount: 8 },
        { kind: 'attack', damage: 5, hits: 1 },
      ],
    },
  ],
};

export const IRON_EXECUTIONER: EnemyDefinition = {
  id: 'iron-executioner',
  name: '黒鉄の処刑人',
  icon: '🪓',
  rank: 'elite',
  maxHp: 110,
  moves: [
    {
      id: 'sharpen',
      name: '研ぎ',
      actions: [
        { kind: 'buff', strength: 3 },
        { kind: 'block', amount: 10 },
      ],
    },
    { id: 'execute', name: '処刑', actions: [{ kind: 'attack', damage: 20, hits: 1 }] },
    { id: 'sweep', name: '薙ぎ払い', actions: [{ kind: 'attack', damage: 8, hits: 2 }] },
  ],
};

export const WILL_O_WARDEN: EnemyDefinition = {
  id: 'will-o-warden',
  name: '鬼火の番人',
  icon: '👹',
  rank: 'elite',
  maxHp: 100,
  moves: [
    { id: 'wisp', name: '鬼火', actions: [{ kind: 'attack', damage: 5, hits: 3 }] },
    {
      id: 'roar',
      name: '怒号',
      actions: [
        { kind: 'buff', strength: 2 },
        { kind: 'block', amount: 8 },
      ],
    },
    { id: 'flame-strike', name: '炎撃', actions: [{ kind: 'attack', damage: 18, hits: 1 }] },
  ],
};

export const CASTLE_PHANTOM: EnemyDefinition = {
  id: 'castle-phantom',
  name: '城主の亡霊',
  icon: '👻',
  rank: 'boss',
  maxHp: 150,
  moves: [
    {
      id: 'dread',
      name: '威圧',
      actions: [
        { kind: 'buff', strength: 2 },
        { kind: 'block', amount: 12 },
      ],
    },
    { id: 'soul-reap', name: '魂刈り', actions: [{ kind: 'attack', damage: 16, hits: 1 }] },
    { id: 'grudge', name: '怨嗟', actions: [{ kind: 'attack', damage: 4, hits: 4 }] },
    { id: 'underworld', name: '冥府の一撃', actions: [{ kind: 'attack', damage: 21, hits: 1 }] },
  ],
};

// ---- 第 3 章 ----

export const STARDUST_SOLDIER: EnemyDefinition = {
  id: 'stardust-soldier',
  name: '星屑の兵',
  icon: '⭐',
  rank: 'normal',
  maxHp: 70,
  moves: [
    { id: 'star-strike', name: '星撃', actions: [{ kind: 'attack', damage: 15, hits: 1 }] },
    {
      id: 'barrier',
      name: '防壁',
      actions: [
        { kind: 'block', amount: 14 },
        { kind: 'attack', damage: 8, hits: 1 },
      ],
    },
    { id: 'meteor', name: '流星', actions: [{ kind: 'attack', damage: 5, hits: 4 }] },
  ],
};

export const VOID_EYE: EnemyDefinition = {
  id: 'void-eye',
  name: '虚空の目',
  icon: '👁️',
  rank: 'normal',
  maxHp: 62,
  moves: [
    { id: 'gaze', name: '凝視', actions: [{ kind: 'buff', strength: 3 }] },
    { id: 'beam', name: '光線', actions: [{ kind: 'attack', damage: 16, hits: 1 }] },
    { id: 'barrage', name: '光線乱射', actions: [{ kind: 'attack', damage: 6, hits: 3 }] },
  ],
};

export const SKY_EAGLE: EnemyDefinition = {
  id: 'sky-eagle',
  name: '天翔ける鷲',
  icon: '🦅',
  rank: 'normal',
  maxHp: 66,
  moves: [
    { id: 'dive', name: '急降下', actions: [{ kind: 'attack', damage: 18, hits: 1 }] },
    {
      id: 'circle',
      name: '旋回',
      actions: [
        { kind: 'block', amount: 10 },
        { kind: 'attack', damage: 6, hits: 1 },
      ],
    },
    { id: 'talons', name: '爪の連撃', actions: [{ kind: 'attack', damage: 4, hits: 5 }] },
  ],
};

export const STAR_EATER: EnemyDefinition = {
  id: 'star-eater',
  name: '星を喰らう竜',
  icon: '🐉',
  rank: 'elite',
  maxHp: 150,
  moves: [
    {
      id: 'roar',
      name: '咆哮',
      actions: [
        { kind: 'buff', strength: 3 },
        { kind: 'block', amount: 15 },
      ],
    },
    { id: 'breath', name: '炎の息', actions: [{ kind: 'attack', damage: 10, hits: 3 }] },
    { id: 'devour', name: '噛み砕き', actions: [{ kind: 'attack', damage: 26, hits: 1 }] },
  ],
};

export const TIME_KEEPER: EnemyDefinition = {
  id: 'time-keeper',
  name: '時の番人',
  icon: '⌛',
  rank: 'elite',
  maxHp: 135,
  moves: [
    {
      id: 'rewind',
      name: '巻き戻し',
      actions: [
        { kind: 'block', amount: 20 },
        { kind: 'buff', strength: 2 },
      ],
    },
    { id: 'time-blade', name: '時の刃', actions: [{ kind: 'attack', damage: 8, hits: 3 }] },
    { id: 'final-bell', name: '終焉の鐘', actions: [{ kind: 'attack', damage: 24, hits: 1 }] },
  ],
};

export const VOID_KING: EnemyDefinition = {
  id: 'void-king',
  name: '虚無の王',
  icon: '🌑',
  rank: 'boss',
  maxHp: 190,
  moves: [
    {
      id: 'abyss-stance',
      name: '深淵の構え',
      actions: [
        { kind: 'buff', strength: 2 },
        { kind: 'block', amount: 15 },
      ],
    },
    { id: 'void-wave', name: '虚無の波', actions: [{ kind: 'attack', damage: 5, hits: 4 }] },
    { id: 'star-break', name: '星砕き', actions: [{ kind: 'attack', damage: 23, hits: 1 }] },
    {
      id: 'inhale',
      name: '吸い込み',
      actions: [
        { kind: 'attack', damage: 12, hits: 1 },
        { kind: 'block', amount: 12 },
      ],
    },
  ],
};
