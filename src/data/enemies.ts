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

// ---- 群れで出てくる小型の敵（1 体ずつは弱い） ----

export const SMALL_SLIME: EnemyDefinition = {
  id: 'small-slime',
  name: '小スライム',
  icon: '🟢',
  rank: 'normal',
  maxHp: 15,
  moves: [
    { id: 'bump', name: 'ぶつかる', actions: [{ kind: 'attack', damage: 5, hits: 1 }] },
    {
      id: 'wobble',
      name: 'ぷるぷる',
      actions: [
        { kind: 'block', amount: 4 },
        { kind: 'attack', damage: 3, hits: 1 },
      ],
    },
    { id: 'spit', name: '粘液飛ばし', actions: [{ kind: 'attack', damage: 3, hits: 2 }] },
  ],
};

export const CAVE_BAT: EnemyDefinition = {
  id: 'cave-bat',
  name: '洞窟コウモリ',
  icon: '🦇',
  rank: 'normal',
  maxHp: 12,
  moves: [
    { id: 'peck', name: 'ついばみ', actions: [{ kind: 'attack', damage: 3, hits: 2 }] },
    { id: 'swoop', name: '急襲', actions: [{ kind: 'attack', damage: 6, hits: 1 }] },
    {
      id: 'hover',
      name: '旋回',
      actions: [
        { kind: 'block', amount: 3 },
        { kind: 'attack', damage: 2, hits: 1 },
      ],
    },
  ],
};

export const BONE_ARCHER: EnemyDefinition = {
  id: 'bone-archer',
  name: '骸骨弓兵',
  icon: '💀',
  rank: 'normal',
  maxHp: 26,
  moves: [
    { id: 'aimed-shot', name: '狙い撃ち', actions: [{ kind: 'attack', damage: 9, hits: 1 }] },
    { id: 'volley', name: '連射', actions: [{ kind: 'attack', damage: 4, hits: 2 }] },
    {
      id: 'take-cover',
      name: '物陰へ',
      actions: [
        { kind: 'block', amount: 6 },
        { kind: 'attack', damage: 4, hits: 1 },
      ],
    },
  ],
};

export const CURSED_CANDLE: EnemyDefinition = {
  id: 'cursed-candle',
  name: '呪いの燭台',
  icon: '🕯️',
  rank: 'normal',
  maxHp: 22,
  moves: [
    {
      id: 'flare',
      name: '燃え上がり',
      actions: [
        { kind: 'buff', strength: 2 },
        { kind: 'block', amount: 4 },
      ],
    },
    { id: 'wax-drip', name: '蝋垂らし', actions: [{ kind: 'attack', damage: 7, hits: 1 }] },
    { id: 'embers', name: '火の粉', actions: [{ kind: 'attack', damage: 3, hits: 3 }] },
  ],
};

export const STAR_WISP: EnemyDefinition = {
  id: 'star-wisp',
  name: '星の精',
  icon: '💫',
  rank: 'normal',
  maxHp: 30,
  moves: [
    { id: 'twinkle', name: 'またたき', actions: [{ kind: 'attack', damage: 11, hits: 1 }] },
    { id: 'shower', name: '星の雨', actions: [{ kind: 'attack', damage: 4, hits: 3 }] },
    {
      id: 'glow',
      name: '光の膜',
      actions: [
        { kind: 'block', amount: 8 },
        { kind: 'attack', damage: 5, hits: 1 },
      ],
    },
  ],
};

export const VOID_MOTE: EnemyDefinition = {
  id: 'void-mote',
  name: '虚空の粒',
  icon: '⚫',
  rank: 'normal',
  maxHp: 22,
  moves: [
    { id: 'absorb', name: '吸収', actions: [{ kind: 'buff', strength: 2 }] },
    { id: 'pierce', name: '貫き', actions: [{ kind: 'attack', damage: 10, hits: 1 }] },
    { id: 'scatter', name: '飛散', actions: [{ kind: 'attack', damage: 4, hits: 2 }] },
  ],
};

// ---- 群れの敵（第 1 章） ----

export const MOSS_SPROUT: EnemyDefinition = {
  id: 'moss-sprout',
  name: '苔の芽',
  icon: '🌱',
  rank: 'normal',
  maxHp: 13,
  moves: [
    { id: 'lash', name: 'つるの鞭', actions: [{ kind: 'attack', damage: 4, hits: 1 }] },
    { id: 'grow', name: '根を張る', actions: [{ kind: 'block', amount: 4 }] },
    { id: 'spores', name: '胞子', actions: [{ kind: 'attack', damage: 2, hits: 2 }] },
  ],
};

export const CAVE_SPIDER: EnemyDefinition = {
  id: 'cave-spider',
  name: '洞窟グモ',
  icon: '🕷️',
  rank: 'normal',
  maxHp: 16,
  moves: [
    { id: 'bite', name: '噛みつき', actions: [{ kind: 'attack', damage: 5, hits: 1 }] },
    {
      id: 'web',
      name: '糸を張る',
      actions: [
        { kind: 'block', amount: 5 },
        { kind: 'attack', damage: 2, hits: 1 },
      ],
    },
    { id: 'skitter', name: '素早い連撃', actions: [{ kind: 'attack', damage: 2, hits: 3 }] },
  ],
};

export const GOBLIN_SCOUT: EnemyDefinition = {
  id: 'goblin-scout',
  name: 'ゴブリン斥候',
  icon: '👺',
  rank: 'normal',
  maxHp: 22,
  moves: [
    { id: 'stab', name: '突き', actions: [{ kind: 'attack', damage: 6, hits: 1 }] },
    {
      id: 'war-cry',
      name: '雄叫び',
      actions: [
        { kind: 'buff', strength: 1 },
        { kind: 'block', amount: 3 },
      ],
    },
    { id: 'jab', name: '小突き', actions: [{ kind: 'attack', damage: 3, hits: 2 }] },
  ],
};

// ---- 群れの敵（第 2 章） ----

export const RUST_MITE: EnemyDefinition = {
  id: 'rust-mite',
  name: '錆ダニ',
  icon: '🪲',
  rank: 'normal',
  maxHp: 15,
  moves: [
    { id: 'gnaw', name: 'かじる', actions: [{ kind: 'attack', damage: 5, hits: 1 }] },
    { id: 'nibble', name: 'かじり続ける', actions: [{ kind: 'attack', damage: 2, hits: 3 }] },
    {
      id: 'shell',
      name: '殻にこもる',
      actions: [
        { kind: 'block', amount: 5 },
        { kind: 'attack', damage: 3, hits: 1 },
      ],
    },
  ],
};

export const SHIELD_BEARER: EnemyDefinition = {
  id: 'shield-bearer',
  name: '盾持ちの兵',
  icon: '🛡️',
  rank: 'normal',
  maxHp: 34,
  moves: [
    {
      id: 'shield-up',
      name: '盾を構える',
      actions: [
        { kind: 'block', amount: 10 },
        { kind: 'attack', damage: 4, hits: 1 },
      ],
    },
    { id: 'shield-bash', name: '盾殴り', actions: [{ kind: 'attack', damage: 10, hits: 1 }] },
    { id: 'hold-line', name: '戦列維持', actions: [{ kind: 'block', amount: 14 }] },
  ],
};

export const GARGOYLE_PUP: EnemyDefinition = {
  id: 'gargoyle-pup',
  name: '小ガーゴイル',
  icon: '🗿',
  rank: 'normal',
  maxHp: 26,
  moves: [
    { id: 'claw', name: '石の爪', actions: [{ kind: 'attack', damage: 8, hits: 1 }] },
    {
      id: 'petrify',
      name: '石化',
      actions: [
        { kind: 'block', amount: 8 },
        { kind: 'attack', damage: 3, hits: 1 },
      ],
    },
    { id: 'dive', name: '急降下', actions: [{ kind: 'attack', damage: 4, hits: 2 }] },
  ],
};

// ---- 群れの敵（第 3 章） ----

export const STAR_FRAGMENT: EnemyDefinition = {
  id: 'star-fragment',
  name: '星の欠片',
  icon: '⭐',
  rank: 'normal',
  maxHp: 20,
  moves: [
    { id: 'shard', name: '破片', actions: [{ kind: 'attack', damage: 7, hits: 1 }] },
    { id: 'shine', name: '輝き', actions: [{ kind: 'buff', strength: 2 }] },
    { id: 'splinter', name: '砕け散る光', actions: [{ kind: 'attack', damage: 3, hits: 3 }] },
  ],
};

export const NEBULA_JELLY: EnemyDefinition = {
  id: 'nebula-jelly',
  name: '星雲クラゲ',
  icon: '🪼',
  rank: 'normal',
  maxHp: 28,
  moves: [
    { id: 'sting', name: '刺胞', actions: [{ kind: 'attack', damage: 3, hits: 3 }] },
    {
      id: 'drift',
      name: '漂う',
      actions: [
        { kind: 'block', amount: 9 },
        { kind: 'attack', damage: 4, hits: 1 },
      ],
    },
    { id: 'pulse', name: '脈動', actions: [{ kind: 'attack', damage: 10, hits: 1 }] },
  ],
};

export const COMET_HOUND: EnemyDefinition = {
  id: 'comet-hound',
  name: '彗星の猟犬',
  icon: '🐺',
  rank: 'normal',
  maxHp: 38,
  moves: [
    { id: 'pounce', name: '飛びかかり', actions: [{ kind: 'attack', damage: 13, hits: 1 }] },
    { id: 'howl', name: '遠吠え', actions: [{ kind: 'buff', strength: 3 }] },
    { id: 'rend', name: '引き裂き', actions: [{ kind: 'attack', damage: 5, hits: 2 }] },
  ],
};
