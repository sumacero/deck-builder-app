import type { EnemyAction, EnemyDefinition } from '../domain/enemy';

/**
 * 敵は地域（属性）ごとに作る。数値は第 1 章の強さで書き、後の章では logic/scaling.ts の倍率で強くなる。
 * - 火・岩: 攻撃と防御だけのシンプルな性質
 * - 草・風: 手数が多い連続攻撃と回復
 * - 水・氷: 凍え（引く枚数 -）や封印（スキル使用不可）で行動を制限する
 * - 電・機械: 麻痺（エナジー -）とチャージからの大技
 */

const atk = (damage: number, hits = 1): EnemyAction => ({ kind: 'attack', damage, hits });
const blk = (amount: number): EnemyAction => ({ kind: 'block', amount });
const buff = (strength: number): EnemyAction => ({ kind: 'buff', strength });
const heal = (amount: number): EnemyAction => ({ kind: 'heal', amount });
const healAll = (amount: number): EnemyAction => ({ kind: 'heal', amount, allies: true });
const paralyze = (amount = 1): EnemyAction => ({ kind: 'paralyze', amount });
const chill = (amount = 1): EnemyAction => ({ kind: 'chill', amount });
const SEAL: EnemyAction = { kind: 'seal' };
const CHARGE: EnemyAction = { kind: 'charge' };

// ==================== 火・岩（紅蓮の火山） ====================

export const EMBER_LIZARD: EnemyDefinition = {
  id: 'ember-lizard',
  name: '火トカゲ',
  icon: '🦎',
  rank: 'normal',
  maxHp: 34,
  moves: [
    { id: 'bite', name: '噛みつき', actions: [atk(8)] },
    { id: 'sparks', name: '火の粉', actions: [atk(4, 2)] },
    { id: 'crouch', name: '身構え', actions: [blk(6), atk(4)] },
  ],
};

export const ROCK_SOLDIER: EnemyDefinition = {
  id: 'rock-soldier',
  name: '岩の兵士',
  icon: '🪨',
  rank: 'normal',
  maxHp: 42,
  moves: [
    { id: 'shield-up', name: '盾構え', actions: [blk(9), atk(6)] },
    { id: 'cleave', name: '叩き斬り', actions: [atk(13)] },
    { id: 'stomp', name: '踏み込み', actions: [atk(5, 2)] },
  ],
};

export const MAGMA_SLIME: EnemyDefinition = {
  id: 'magma-slime',
  name: '溶岩スライム',
  icon: '🔥',
  rank: 'normal',
  maxHp: 40,
  moves: [
    { id: 'tackle', name: '体当たり', actions: [atk(11)] },
    { id: 'harden', name: '冷え固まる', actions: [blk(8), atk(4)] },
    { id: 'erupt', name: '噴き出し', actions: [atk(4, 3)] },
  ],
};

export const LAVA_KNIGHT: EnemyDefinition = {
  id: 'lava-knight',
  name: '溶岩の騎士',
  icon: '⚔️',
  rank: 'elite',
  maxHp: 82,
  moves: [
    { id: 'temper', name: '鍛え直し', actions: [buff(2), blk(8)] },
    { id: 'flame-blade', name: '炎の大剣', actions: [atk(17)] },
    { id: 'lava-slash', name: '溶岩斬り', actions: [atk(7, 2)] },
  ],
};

export const BASALT_COLOSSUS: EnemyDefinition = {
  id: 'basalt-colossus',
  name: '玄武岩の巨像',
  icon: '🗿',
  rank: 'elite',
  maxHp: 92,
  moves: [
    { id: 'rock-wall', name: '岩壁', actions: [blk(14), atk(6)] },
    { id: 'giant-fist', name: '巨拳', actions: [atk(17)] },
    { id: 'tremor', name: '地鳴り', actions: [atk(5, 3)] },
  ],
};

export const FLAME_DRAGON: EnemyDefinition = {
  id: 'flame-dragon',
  name: '紅蓮竜',
  icon: '🐉',
  rank: 'boss',
  maxHp: 120,
  moves: [
    { id: 'roar', name: '咆哮', actions: [buff(2), blk(12)] },
    { id: 'breath', name: '炎の息', actions: [atk(5, 3)] },
    { id: 'crunch', name: '噛み砕き', actions: [atk(16)] },
    { id: 'volcanic-bomb', name: '火山弾', actions: [atk(20)] },
  ],
};

// ==================== 草・風（風わたる草原） ====================

export const WIND_HAWK: EnemyDefinition = {
  id: 'wind-hawk',
  name: '疾風の鷹',
  icon: '🦅',
  rank: 'normal',
  maxHp: 30,
  moves: [
    { id: 'talons', name: '爪の連撃', actions: [atk(3, 3)] },
    { id: 'dive', name: '急降下', actions: [atk(9)] },
    { id: 'circle', name: '旋回', actions: [blk(5), atk(2, 2)] },
  ],
};

export const LEAF_FAIRY: EnemyDefinition = {
  id: 'leaf-fairy',
  name: '木の葉の精',
  icon: '🧚',
  rank: 'normal',
  maxHp: 32,
  moves: [
    { id: 'healing-breeze', name: '癒しの風', actions: [healAll(7), blk(4)] },
    { id: 'leaf-blade', name: '葉の刃', actions: [atk(4, 2)] },
    { id: 'leaf-storm', name: '木の葉吹雪', actions: [atk(2, 4)] },
  ],
};

export const GRASS_WOLF: EnemyDefinition = {
  id: 'grass-wolf',
  name: '草原の狼',
  icon: '🐺',
  rank: 'normal',
  maxHp: 36,
  moves: [
    { id: 'double-bite', name: '連続噛み', actions: [atk(4, 2)] },
    { id: 'pounce', name: '飛びかかり', actions: [atk(10)] },
    { id: 'rest', name: '草陰で休む', actions: [heal(6), blk(5)] },
  ],
};

export const FOREST_RANGER: EnemyDefinition = {
  id: 'forest-ranger',
  name: '森の狩人',
  icon: '🏹',
  rank: 'elite',
  maxHp: 74,
  moves: [
    { id: 'arrow-rain', name: '矢の雨', actions: [atk(4, 4)] },
    { id: 'snipe', name: '狙い撃ち', actions: [atk(15)] },
    { id: 'herbs', name: '薬草', actions: [heal(12), blk(6)] },
  ],
};

export const GREAT_TREANT: EnemyDefinition = {
  id: 'great-treant',
  name: '大樹の守り手',
  icon: '🌳',
  rank: 'elite',
  maxHp: 90,
  moves: [
    { id: 'root-whip', name: '根の鞭', actions: [atk(5, 3)] },
    { id: 'blessing', name: '大地の恵み', actions: [heal(14), blk(8)] },
    { id: 'branch-sweep', name: '枝の薙ぎ払い', actions: [atk(15)] },
  ],
};

export const STORM_GRIFFIN: EnemyDefinition = {
  id: 'storm-griffin',
  name: '嵐のグリフォン',
  icon: '🌀',
  rank: 'boss',
  maxHp: 112,
  moves: [
    { id: 'wind-grace', name: '風の加護', actions: [heal(10), buff(1)] },
    { id: 'storm-claws', name: '嵐の爪', actions: [atk(4, 4)] },
    { id: 'tornado', name: '竜巻', actions: [atk(6, 3)] },
    { id: 'dive', name: '急降下', actions: [atk(18)] },
  ],
};

// ==================== 水・氷（水の古都） ====================

export const FROST_JELLY: EnemyDefinition = {
  id: 'frost-jelly',
  name: '氷のクラゲ',
  icon: '🪼',
  rank: 'normal',
  maxHp: 34,
  moves: [
    { id: 'cold-tentacle', name: '冷たい触手', actions: [atk(7), chill()] },
    { id: 'sting', name: '刺す', actions: [atk(4, 2)] },
    { id: 'drift', name: '漂う', actions: [blk(6), atk(4)] },
  ],
};

export const DROWNED_GUARD: EnemyDefinition = {
  id: 'drowned-guard',
  name: '水没した衛兵',
  icon: '🔱',
  rank: 'normal',
  maxHp: 44,
  moves: [
    { id: 'thrust', name: '突き', actions: [atk(11)] },
    { id: 'water-shield', name: '水の盾', actions: [blk(8), atk(5)] },
    { id: 'sealing-spear', name: '封水の槍', actions: [atk(6), SEAL] },
  ],
};

export const MIST_SIREN: EnemyDefinition = {
  id: 'mist-siren',
  name: '霧の歌姫',
  icon: '🧜',
  rank: 'normal',
  maxHp: 36,
  moves: [
    { id: 'binding-song', name: '封じの歌', actions: [SEAL, blk(6)] },
    { id: 'water-arrow', name: '水の矢', actions: [atk(9)] },
    { id: 'freezing-song', name: '凍える歌', actions: [atk(5), chill()] },
  ],
};

export const ICE_WITCH: EnemyDefinition = {
  id: 'ice-witch',
  name: '氷の魔女',
  icon: '🧊',
  rank: 'elite',
  maxHp: 78,
  moves: [
    { id: 'sealing-ice', name: '封印の氷', actions: [SEAL, blk(10)] },
    { id: 'ice-lance', name: '氷の槍', actions: [atk(16)] },
    { id: 'blizzard', name: '吹雪', actions: [atk(4, 3), chill()] },
  ],
};

export const ABYSS_SERPENT: EnemyDefinition = {
  id: 'abyss-serpent',
  name: '深淵の水竜',
  icon: '🐍',
  rank: 'elite',
  maxHp: 92,
  moves: [
    { id: 'whirlpool', name: '渦潮', actions: [atk(6, 2), chill()] },
    { id: 'crunch', name: '噛み砕き', actions: [atk(17)] },
    { id: 'water-armor', name: '水の鎧', actions: [blk(14), buff(1)] },
  ],
};

export const FROZEN_EMPRESS: EnemyDefinition = {
  id: 'frozen-empress',
  name: '凍れる女王',
  icon: '👑',
  rank: 'boss',
  maxHp: 118,
  moves: [
    { id: 'permafrost', name: '永久凍土', actions: [SEAL, chill(), blk(10)] },
    { id: 'absolute-zero', name: '絶対零度', actions: [atk(20)] },
    { id: 'icicle-rain', name: '氷柱の雨', actions: [atk(4, 4)] },
    { id: 'frost-wave', name: '凍てつく波', actions: [atk(9), chill()] },
  ],
};

// ==================== 電・機械（雷鳴の歯車塔） ====================

export const GEAR_SOLDIER: EnemyDefinition = {
  id: 'gear-soldier',
  name: '歯車の兵',
  icon: '🤖',
  rank: 'normal',
  maxHp: 42,
  moves: [
    { id: 'thrust', name: '突き', actions: [atk(10)] },
    { id: 'armor', name: '装甲展開', actions: [blk(8), atk(5)] },
    { id: 'shock-spear', name: '放電の槍', actions: [atk(5), paralyze()] },
  ],
};

/** チャージ → 大技の順なので、群れでは行動の開始位置がずれないよう先頭に置く。 */
export const SPARK_DRONE: EnemyDefinition = {
  id: 'spark-drone',
  name: '雷のドローン',
  icon: '🛸',
  rank: 'normal',
  maxHp: 32,
  moves: [
    { id: 'charge', name: 'チャージ', actions: [CHARGE, blk(5)] },
    { id: 'thunderbolt', name: '雷撃', actions: [atk(15)] },
    { id: 'static', name: '静電気', actions: [atk(3, 2)] },
  ],
};

export const IRON_HOUND: EnemyDefinition = {
  id: 'iron-hound',
  name: '鉄の猟犬',
  icon: '🐕',
  rank: 'normal',
  maxHp: 38,
  moves: [
    { id: 'bite', name: '噛みつき', actions: [atk(9)] },
    { id: 'shock-fang', name: '電撃の牙', actions: [atk(5), paralyze()] },
    { id: 'drive', name: '駆動', actions: [blk(6), atk(3, 2)] },
  ],
};

export const CLOCKWORK_KNIGHT: EnemyDefinition = {
  id: 'clockwork-knight',
  name: '機巧騎士',
  icon: '⚙️',
  rank: 'elite',
  maxHp: 84,
  moves: [
    { id: 'recharge', name: '充電', actions: [CHARGE, blk(12)] },
    { id: 'lightning-slash', name: '雷光斬り', actions: [atk(21)] },
    { id: 'twin-slash', name: '連続斬り', actions: [atk(6, 2), paralyze()] },
  ],
};

export const THUNDER_GOLEM: EnemyDefinition = {
  id: 'thunder-golem',
  name: '雷鳴のゴーレム',
  icon: '⚡',
  rank: 'elite',
  maxHp: 94,
  moves: [
    { id: 'discharge', name: '放電', actions: [atk(4, 3), paralyze()] },
    { id: 'store', name: '蓄電', actions: [CHARGE, blk(10)] },
    { id: 'thunder-hammer', name: '雷鎚', actions: [atk(22)] },
  ],
};

export const GEAR_EMPEROR: EnemyDefinition = {
  id: 'gear-emperor',
  name: '歯車の機皇',
  icon: '🏭',
  rank: 'boss',
  maxHp: 125,
  moves: [
    { id: 'boot', name: '起動', actions: [buff(2), blk(12)] },
    { id: 'thunderclap', name: '雷鳴', actions: [atk(7), paralyze()] },
    { id: 'full-charge', name: 'フルチャージ', actions: [CHARGE, blk(14)] },
    { id: 'thunder-cannon', name: '雷神砲', actions: [atk(25)] },
    { id: 'gear-storm', name: '歯車の嵐', actions: [atk(4, 4)] },
  ],
};

// ==================== 群れで出てくる小型の敵（1 体ずつは弱い） ====================

// ---- 火・岩 ----

export const CINDER_IMP: EnemyDefinition = {
  id: 'cinder-imp',
  name: '火の小鬼',
  icon: '😈',
  rank: 'normal',
  maxHp: 14,
  moves: [
    { id: 'claw', name: '火の爪', actions: [atk(5)] },
    { id: 'guard', name: '構え', actions: [blk(4), atk(3)] },
  ],
};

export const PEBBLE_GOLEM: EnemyDefinition = {
  id: 'pebble-golem',
  name: '小石のゴーレム',
  icon: '⛰️',
  rank: 'normal',
  maxHp: 17,
  moves: [
    { id: 'stone-wall', name: '石の壁', actions: [blk(6), atk(2)] },
    { id: 'tackle', name: '体当たり', actions: [atk(6)] },
  ],
};

export const FIRE_BAT: EnemyDefinition = {
  id: 'fire-bat',
  name: '火蝙蝠',
  icon: '🦇',
  rank: 'normal',
  maxHp: 12,
  moves: [
    { id: 'fire-wing', name: '火の羽', actions: [atk(3, 2)] },
    { id: 'bite', name: '噛みつき', actions: [atk(5)] },
  ],
};

// ---- 草・風 ----

export const SEED_SPROUT: EnemyDefinition = {
  id: 'seed-sprout',
  name: '種の芽',
  icon: '🌱',
  rank: 'normal',
  maxHp: 13,
  moves: [
    { id: 'photosynthesis', name: '光合成', actions: [heal(4), blk(3)] },
    { id: 'seed-shot', name: '種飛ばし', actions: [atk(2, 2)] },
  ],
};

export const GUST_SPRITE: EnemyDefinition = {
  id: 'gust-sprite',
  name: 'つむじ風の精',
  icon: '🌪️',
  rank: 'normal',
  maxHp: 12,
  moves: [
    { id: 'whirlwind', name: 'つむじ風', actions: [atk(2, 3)] },
    { id: 'wind-blade', name: '風の刃', actions: [atk(3, 2)] },
  ],
};

export const HORN_RABBIT: EnemyDefinition = {
  id: 'horn-rabbit',
  name: '角ウサギ',
  icon: '🐇',
  rank: 'normal',
  maxHp: 13,
  moves: [
    { id: 'horn', name: '角突き', actions: [atk(5)] },
    { id: 'hop', name: '跳ね回る', actions: [atk(2, 3)] },
  ],
};

// ---- 水・氷 ----

export const ICE_WISP: EnemyDefinition = {
  id: 'ice-wisp',
  name: '氷の精',
  icon: '❄️',
  rank: 'normal',
  maxHp: 13,
  moves: [
    { id: 'cold-air', name: '冷気', actions: [atk(2), chill()] },
    { id: 'ice-pebble', name: '氷のつぶて', actions: [atk(4)] },
  ],
};

export const BUBBLE_SLIME: EnemyDefinition = {
  id: 'bubble-slime',
  name: '泡スライム',
  icon: '🫧',
  rank: 'normal',
  maxHp: 14,
  moves: [
    { id: 'bump', name: 'ぶつかる', actions: [atk(5)] },
    { id: 'bubble', name: '泡の膜', actions: [blk(5), atk(2)] },
  ],
};

export const RUIN_CRAB: EnemyDefinition = {
  id: 'ruin-crab',
  name: '遺跡ガニ',
  icon: '🦀',
  rank: 'normal',
  maxHp: 16,
  moves: [
    { id: 'pinch', name: 'はさみ', actions: [atk(3, 2)] },
    { id: 'shell', name: '甲羅', actions: [blk(6), atk(2)] },
  ],
};

// ---- 電・機械 ----

export const BOLT_BUG: EnemyDefinition = {
  id: 'bolt-bug',
  name: '雷虫',
  icon: '🐞',
  rank: 'normal',
  maxHp: 12,
  moves: [
    { id: 'tackle', name: '体当たり', actions: [atk(3, 2)] },
    { id: 'spark', name: '火花', actions: [atk(5)] },
  ],
};

export const COG_RAT: EnemyDefinition = {
  id: 'cog-rat',
  name: '歯車ネズミ',
  icon: '🐀',
  rank: 'normal',
  maxHp: 14,
  moves: [
    { id: 'gnaw', name: 'かじる', actions: [atk(5)] },
    { id: 'cog-shield', name: '歯車の盾', actions: [blk(5), atk(2)] },
  ],
};

/** チャージ → 大技の 2 手。群れでは偶数番目に置くと、チャージから始まる。 */
export const TESLA_ORB: EnemyDefinition = {
  id: 'tesla-orb',
  name: '雷の宝珠',
  icon: '🔮',
  rank: 'normal',
  maxHp: 13,
  moves: [
    { id: 'store', name: '蓄電', actions: [CHARGE, blk(3)] },
    { id: 'flash', name: '雷光', actions: [atk(9)] },
  ],
};
