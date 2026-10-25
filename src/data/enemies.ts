import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';
import type { EnemyAction, EnemyDefinition } from '../domain/enemy';
import type { DebuffId } from '../domain/status';
import { BURN, ICE_SHARD, SCRAP, TANGLING_VINE } from './statusCards';

/**
 * 敵は地域ごとに作る。数値は第 1 章の強さで書き、後の章では logic/scaling.ts の倍率で強くなる。
 * 属性: 火山 = 火 / 草原 = 草 / 水の古都 = 水 / 歯車塔 = 無属性（相性なし）。
 * - 火・岩: 攻撃と防御が中心。火傷を混ぜる、かばう、眠れる巨像、鉄鱗の甲騎士。エリートはスキルで激昂する多頭竜
 * - 草・風: 手数が多い連続攻撃と回復。仇討ちの群れ、蔦を混ぜる、風の衣（霊体化）。エリートは絡めと回復の大花
 * - 水・氷: 凍え・封印・衰弱で行動を制限し、アーティファクトでデバフを無効にする。霊体化する亡霊、鉄鱗の遺跡ガニ
 * - 電・機械: 麻痺とチャージからの大技。ガラクタを混ぜる、アーティファクトを持つ機械、休眠中のゴーレム
 * エリートとボスは人型の英雄ではなく魔物。強さは大ダメージより、行動を縛る・放置すると積み上がる個性。
 * 行動は 3〜5 手で一周し、先頭が弱く最後が強い（logic/routine.ts）。筋力の上昇だけは一周しても戻らない。
 */

const atk = (damage: number, hits = 1): EnemyAction => ({ kind: 'attack', damage, hits });
const blk = (amount: number): EnemyAction => ({ kind: 'block', amount });
const buff = (strength: number): EnemyAction => ({ kind: 'buff', strength });
const heal = (amount: number): EnemyAction => ({ kind: 'heal', amount });
const healAll = (amount: number): EnemyAction => ({ kind: 'heal', amount, allies: true });
const paralyze = (amount = 1): EnemyAction => ({ kind: 'paralyze', amount });
const chill = (amount = 1): EnemyAction => ({ kind: 'chill', amount });
const SEAL: EnemyAction = { kind: 'seal' };
const BIND: EnemyAction = { kind: 'bind' };
const CHARGE: EnemyAction = { kind: 'charge' };
const debuff = (status: DebuffId, turns = 1): EnemyAction => ({ kind: 'debuff', status, turns });
const addCard = (card: CardDefinition, count = 1): EnemyAction => ({ kind: 'addCard', card, count });
const INTANGIBLE: EnemyAction = { kind: 'intangible' };
const shift = (attribute: Attribute): EnemyAction => ({ kind: 'shiftAttribute', attribute });

// ==================== 火・岩（紅蓮の火山） ====================

export const EMBER_LIZARD: EnemyDefinition = {
  id: 'ember-lizard',
  name: 'サラマンダー',
  icon: '🦎',
  rank: 'normal',
  maxHp: 34,
  attribute: 'fire',
  moves: [
    { id: 'bite', name: '噛みつき', actions: [atk(8)] },
    { id: 'sparks', name: '火の粉', actions: [atk(4, 2), addCard(BURN)] },
    { id: 'crouch', name: '身構え', actions: [blk(6), atk(4)] },
  ],
};

export const ROCK_SOLDIER: EnemyDefinition = {
  id: 'rock-soldier',
  name: '岩の兵士',
  icon: '🪨',
  rank: 'normal',
  maxHp: 42,
  attribute: 'fire',
  moves: [
    { id: 'shield-up', name: '盾構え', actions: [blk(9), atk(6)] },
    { id: 'cleave', name: '叩き斬り', actions: [atk(13)] },
    { id: 'stomp', name: '踏み込み', actions: [atk(5, 2)] },
  ],
  traits: [{ kind: 'artifact', charges: 1 }],
};

/** 殻が厚く、攻撃 1 ヒットは 6 まで。大剣のような一撃は頭打ちになり、多段攻撃はヒット数だけ通る。 */
export const OBSIDIAN_KNIGHT: EnemyDefinition = {
  id: 'obsidian-knight',
  name: '黒曜の甲騎士',
  icon: '🛡️',
  rank: 'normal',
  maxHp: 46,
  attribute: 'fire',
  moves: [
    { id: 'shell-guard', name: '殻の構え', actions: [blk(10), atk(5)] },
    { id: 'shell-break', name: '殻割り', actions: [atk(13)] },
    { id: 'drill', name: '連打', actions: [atk(4, 2)] },
  ],
  traits: [{ kind: 'hitCap', amount: 6 }],
};

export const MAGMA_SLIME: EnemyDefinition = {
  id: 'magma-slime',
  name: '溶岩スライム',
  icon: '🔥',
  rank: 'normal',
  maxHp: 40,
  attribute: 'fire',
  moves: [
    { id: 'tackle', name: '体当たり', actions: [atk(11)] },
    { id: 'harden', name: '冷え固まる', actions: [blk(8), atk(4)] },
    { id: 'erupt', name: '噴き出し', actions: [atk(4, 3)] },
  ],
  traits: [{ kind: 'deathThroes', action: addCard(BURN, 2) }],
};

/** スキルを使うたびに激昂する。守りを重ねるほど噛みが重くなるので、攻撃で早く倒す。 */
export const MAGMA_HYDRA: EnemyDefinition = {
  id: 'magma-hydra',
  name: '溶岩の多頭竜',
  icon: '🐲',
  rank: 'elite',
  maxHp: 62,
  attribute: 'fire',
  moves: [
    { id: 'spit', name: '火を吐く', actions: [atk(4, 2), addCard(BURN)] },
    { id: 'grow-heads', name: '頭を増やす', actions: [buff(1), blk(8)] },
    { id: 'crunch', name: '噛み砕き', actions: [atk(11)] },
  ],
  traits: [{ kind: 'enrage', strength: 1 }],
};

/** 2 ターン眠る。起きてから一周ごとに筋力が残り、放置すると巨拳が止まらなくなる。 */
export const BASALT_COLOSSUS: EnemyDefinition = {
  id: 'basalt-colossus',
  name: '玄武岩の巨像',
  icon: '🗿',
  rank: 'elite',
  maxHp: 69,
  attribute: 'fire',
  moves: [
    { id: 'rock-wall', name: '岩壁', actions: [blk(12), atk(4)] },
    { id: 'settle', name: '地を溜める', actions: [buff(1), blk(8)] },
    { id: 'giant-fist', name: '巨拳', actions: [atk(13)] },
  ],
  traits: [{ kind: 'sleep', turns: 2, wakeStrength: 2 }, { kind: 'artifact', charges: 2 }],
};

/** 咆哮のたびに筋力が残り、息で火傷がデッキに積もる。長引くほど手が焼け、殴りが重くなる。 */
export const FLAME_DRAGON: EnemyDefinition = {
  id: 'flame-dragon',
  name: '紅蓮竜',
  icon: '🐉',
  rank: 'boss',
  maxHp: 74,
  attribute: 'fire',
  moves: [
    { id: 'roar', name: '咆哮', actions: [buff(1), blk(10)] },
    { id: 'breath', name: '炎の息', actions: [atk(3, 3), addCard(BURN)] },
    { id: 'crunch', name: '噛み砕き', actions: [atk(10)] },
    { id: 'volcanic-bomb', name: '火山弾', actions: [atk(14)] },
  ],
};

// ==================== 草・風（風わたる草原） ====================

export const WIND_HAWK: EnemyDefinition = {
  id: 'wind-hawk',
  name: '疾風の鷹',
  icon: '🦅',
  rank: 'normal',
  maxHp: 30,
  attribute: 'grass',
  moves: [
    { id: 'talons', name: '爪の連撃', actions: [atk(3, 3)] },
    { id: 'dive', name: '急降下', actions: [atk(9)] },
    { id: 'blinding-wings', name: '目くらましの羽ばたき', actions: [blk(5), debuff('weak')] },
  ],
};

export const LEAF_FAIRY: EnemyDefinition = {
  id: 'leaf-fairy',
  name: '木の葉の精',
  icon: '🧚',
  rank: 'normal',
  maxHp: 32,
  attribute: 'grass',
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
  attribute: 'grass',
  moves: [
    { id: 'growl', name: '威嚇の唸り', actions: [atk(4), debuff('vulnerable')] },
    { id: 'pounce', name: '飛びかかり', actions: [atk(10)] },
    { id: 'rest', name: '草陰で休む', actions: [heal(6), blk(5)] },
  ],
};

/** 回復しながら蔦でデッキを埋め、次のターンのアタックを絡める。殴れないあいだに花が戻る。 */
export const BRIAR_MAW: EnemyDefinition = {
  id: 'briar-maw',
  name: '茨の大花',
  icon: '🌺',
  rank: 'elite',
  maxHp: 56,
  attribute: 'grass',
  moves: [
    { id: 'bud', name: '蕾', actions: [heal(8), blk(6)] },
    { id: 'vines', name: '蔦', actions: [atk(4), addCard(TANGLING_VINE, 2)] },
    { id: 'snare', name: '絡め取り', actions: [BIND, atk(5)] },
    { id: 'bloom', name: '花弁', actions: [atk(8)] },
  ],
};

/** 仲間をかばい、一周ごとに全員を回復する。木を残すと戦いが終わらない。 */
export const GREAT_TREANT: EnemyDefinition = {
  id: 'great-treant',
  name: '大樹の守り手',
  icon: '🌳',
  rank: 'elite',
  maxHp: 90,
  attribute: 'grass',
  moves: [
    { id: 'blessing', name: '大地の恵み', actions: [healAll(10), blk(6)] },
    { id: 'root-whip', name: '根の鞭', actions: [atk(4, 2)] },
    { id: 'branch-sweep', name: '枝の薙ぎ払い', actions: [atk(12)] },
  ],
  traits: [{ kind: 'guardian' }],
};

/** 霊体化しているターンはほぼ削れない。衣が切れたあとの急降下が本番なので、そこを守って殴る。 */
export const STORM_GRIFFIN: EnemyDefinition = {
  id: 'storm-griffin',
  name: '嵐のグリフォン',
  icon: '🌀',
  rank: 'boss',
  maxHp: 70,
  attribute: 'grass',
  moves: [
    { id: 'wind-grace', name: '風の加護', actions: [heal(8)] },
    { id: 'wind-veil', name: '風の衣', actions: [INTANGIBLE, debuff('weak')] },
    { id: 'storm-claws', name: '嵐の爪', actions: [atk(3, 3)] },
    { id: 'tornado', name: '竜巻', actions: [atk(4, 3)] },
    { id: 'dive', name: '急降下', actions: [atk(14)] },
  ],
};

// ==================== 水・氷（水の古都） ====================

export const FROST_JELLY: EnemyDefinition = {
  id: 'frost-jelly',
  name: '氷のクラゲ',
  icon: '🪼',
  rank: 'normal',
  maxHp: 34,
  attribute: 'water',
  moves: [
    { id: 'cold-tentacle', name: '冷たい触手', actions: [atk(7), chill()] },
    { id: 'sting', name: '刺す', actions: [atk(4, 2)] },
    { id: 'drift', name: '漂う', actions: [blk(6), atk(4)] },
  ],
  traits: [{ kind: 'deathThroes', action: chill() }],
};

export const DROWNED_GUARD: EnemyDefinition = {
  id: 'drowned-guard',
  name: '沈都の衛兵',
  icon: '🔱',
  rank: 'normal',
  maxHp: 44,
  attribute: 'water',
  moves: [
    { id: 'thrust', name: '突き', actions: [atk(11)] },
    { id: 'water-shield', name: '水の盾', actions: [blk(8), atk(5)] },
    { id: 'sealing-spear', name: '封水の槍', actions: [atk(6), SEAL] },
  ],
  traits: [{ kind: 'artifact', charges: 1 }],
};

export const MIST_SIREN: EnemyDefinition = {
  id: 'mist-siren',
  name: '霧の歌姫',
  icon: '🧜',
  rank: 'normal',
  maxHp: 36,
  attribute: 'water',
  moves: [
    { id: 'binding-song', name: '封じの歌', actions: [SEAL, blk(6)] },
    { id: 'bewildering-arrow', name: '惑わしの水矢', actions: [atk(7), debuff('weak')] },
    { id: 'freezing-song', name: '凍える歌', actions: [atk(5), chill()] },
  ],
};

/** 灯で誘い、スキルを封印し、使えない氷をデッキに混ぜる。火力より、打てる札を奪う。 */
export const FROST_ANGLER: EnemyDefinition = {
  id: 'frost-angler',
  name: '深氷のアンコウ',
  icon: '🐟',
  rank: 'elite',
  maxHp: 59,
  attribute: 'water',
  moves: [
    { id: 'lure', name: '灯', actions: [blk(8), atk(4)] },
    { id: 'sealing-light', name: '封印の光', actions: [SEAL, addCard(ICE_SHARD, 2)] },
    { id: 'gulp', name: '丸呑み', actions: [atk(12)] },
  ],
  traits: [{ kind: 'artifact', charges: 2 }],
};

/** 一周ごとに凍えと筋力が残る。引ける枚数が減ったまま放置すると、締め上げが止まらなくなる。 */
export const ABYSS_SERPENT: EnemyDefinition = {
  id: 'abyss-serpent',
  name: '深淵の水竜',
  icon: '🐍',
  rank: 'elite',
  maxHp: 69,
  attribute: 'water',
  moves: [
    { id: 'water-armor', name: '水の鎧', actions: [blk(12)] },
    { id: 'whirlpool', name: '渦潮', actions: [atk(4, 2), chill()] },
    { id: 'coil', name: '締め上げ', actions: [atk(11), buff(1)] },
  ],
};

/** 引く枚数とスキルを交互に奪い、氷をデッキに混ぜる。絶対零度は一周の最後で、最初からは来ない。 */
export const ICE_LEVIATHAN: EnemyDefinition = {
  id: 'ice-leviathan',
  name: '氷冠のレヴィアタン',
  icon: '🐋',
  rank: 'boss',
  maxHp: 72,
  attribute: 'water',
  moves: [
    { id: 'tide', name: '凍てつく潮', actions: [atk(4), chill(), blk(8)] },
    { id: 'seal-sea', name: '封印の海', actions: [SEAL, addCard(ICE_SHARD, 2)] },
    { id: 'icicle-rain', name: '氷柱の雨', actions: [atk(3, 4)] },
    { id: 'absolute-zero', name: '絶対零度', actions: [atk(14)] },
  ],
  traits: [{ kind: 'artifact', charges: 3 }],
};

/** 霊体化 → 攻撃 → 攻撃の順なので、1 体目に置くと最初のターンに霊体化する。 */
export const ANCIENT_PHANTOM: EnemyDefinition = {
  id: 'ancient-phantom',
  name: '古都の亡霊',
  icon: '👻',
  rank: 'normal',
  maxHp: 30,
  attribute: 'water',
  moves: [
    { id: 'fade', name: '霧に溶ける', actions: [INTANGIBLE] },
    { id: 'chilling-touch', name: '凍える手', actions: [atk(7), debuff('weak')] },
    { id: 'wail', name: '嘆きの声', actions: [atk(4, 2)] },
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
  traits: [{ kind: 'artifact', charges: 1 }],
};

/** チャージ → 大技の順なので、群れでは行動の開始位置がずれないよう先頭に置く。 */
export const SPARK_DRONE: EnemyDefinition = {
  id: 'spark-drone',
  name: 'からくり雷眼',
  icon: '👁️',
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
  traits: [{ kind: 'vengeance', strength: 3 }],
};

/** ガラクタでデッキを埋め、チャージの次に麻痺させる。大技の前に予告がある。 */
export const GEAR_BEETLE: EnemyDefinition = {
  id: 'gear-beetle',
  name: '歯車の大甲虫',
  icon: '🪲',
  rank: 'elite',
  maxHp: 63,
  moves: [
    { id: 'gnaw', name: '噛む', actions: [atk(5), addCard(SCRAP)] },
    { id: 'recharge', name: '充電', actions: [CHARGE, blk(8)] },
    { id: 'discharge', name: '放電', actions: [atk(12), paralyze()] },
  ],
};

/** 2 ターンは眠って動かない。起きたあとは麻痺させ、チャージの次に雷鎚を振る。眠っているうちに削る。 */
export const THUNDER_GOLEM: EnemyDefinition = {
  id: 'thunder-golem',
  name: '雷鳴のゴーレム',
  icon: '⚡',
  rank: 'elite',
  maxHp: 71,
  moves: [
    { id: 'discharge', name: '放電', actions: [atk(3, 3), paralyze()] },
    { id: 'store', name: '蓄電', actions: [CHARGE, blk(10)] },
    { id: 'thunder-hammer', name: '雷鎚', actions: [atk(14)] },
  ],
  traits: [{ kind: 'sleep', turns: 2, wakeStrength: 2 }],
};

/** エナジーを奪い、ガラクタを混ぜ続ける。雷神砲はフルチャージの次、一周の最後にだけ撃つ。 */
export const ENGINE_BEAST: EnemyDefinition = {
  id: 'engine-beast',
  name: '炉心獣',
  icon: '⚙️',
  rank: 'boss',
  maxHp: 78,
  moves: [
    { id: 'boot', name: '起動', actions: [blk(10), addCard(SCRAP)] },
    { id: 'short', name: '短路', actions: [atk(5), paralyze()] },
    { id: 'gear-storm', name: '歯車の嵐', actions: [atk(3, 4), addCard(SCRAP)] },
    { id: 'full-charge', name: 'フルチャージ', actions: [CHARGE, blk(12)] },
    { id: 'thunder-cannon', name: '雷神砲', actions: [atk(16)] },
  ],
  traits: [{ kind: 'artifact', charges: 2 }],
};

// ==================== ラスボス（3 つの章を終えたあと） ====================

/**
 * 各地の魔力を奪った三つの旗（火・水・草）を掲げ替えて戦う。旗を掲げるたびに属性と弱点が変わるので、
 * どの属性のデッキにも突ける番と突かれる番がある。HP が半分になると覚醒し、旗を掲げながら殴ってくる。
 * 数値は他の敵と同じく第 1 章の強さで書き、data/acts.ts で第 3 章の倍率をかける。
 */
export const STAR_DEVOURER: EnemyDefinition = {
  id: 'star-devourer',
  name: '星喰みの魔皇ノクス',
  icon: '🌑',
  rank: 'final',
  maxHp: 150,
  attribute: 'fire',
  moves: [
    { id: 'crimson-banner', name: '紅の旗', actions: [shift('fire'), blk(12)] },
    { id: 'crimson-blade', name: '紅蓮の剣', actions: [atk(6, 2), addCard(BURN)] },
    { id: 'azure-banner', name: '蒼の旗', actions: [shift('water'), SEAL, blk(12)] },
    { id: 'ice-lance', name: '氷の槍', actions: [atk(12), chill()] },
    { id: 'verdant-banner', name: '翠の旗', actions: [shift('grass'), heal(8), debuff('weak')] },
    { id: 'gale-flurry', name: '疾風の連撃', actions: [atk(4, 4)] },
  ],
  traits: [
    { kind: 'artifact', charges: 2 },
    {
      kind: 'awaken',
      threshold: 0.5,
      strength: 3,
      block: 20,
      moves: [
        { id: 'crimson-storm', name: '紅蓮の旗', actions: [shift('fire'), atk(5, 3), addCard(BURN)] },
        { id: 'azure-frost', name: '蒼氷の旗', actions: [shift('water'), atk(10), SEAL] },
        { id: 'verdant-gale', name: '翠嵐の旗', actions: [shift('grass'), atk(4, 3), heal(8)] },
        { id: 'devour-light', name: '星を喰らう', actions: [CHARGE, blk(16)] },
        { id: 'star-eater', name: '星喰み', actions: [atk(18)] },
      ],
    },
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
  attribute: 'fire',
  moves: [
    { id: 'claw', name: '火の爪', actions: [atk(5)] },
    { id: 'guard', name: '構え', actions: [blk(4), atk(3)] },
  ],
  traits: [{ kind: 'vengeance', strength: 2 }],
};

export const PEBBLE_GOLEM: EnemyDefinition = {
  id: 'pebble-golem',
  name: '小石のゴーレム',
  icon: '⛰️',
  rank: 'normal',
  maxHp: 17,
  attribute: 'fire',
  moves: [
    { id: 'stone-wall', name: '石の壁', actions: [blk(6), atk(2)] },
    { id: 'tackle', name: '体当たり', actions: [atk(6)] },
  ],
  traits: [{ kind: 'guardian' }],
};

export const FIRE_BAT: EnemyDefinition = {
  id: 'fire-bat',
  name: '火蝙蝠',
  icon: '🦇',
  rank: 'normal',
  maxHp: 12,
  attribute: 'fire',
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
  attribute: 'grass',
  moves: [
    { id: 'photosynthesis', name: '光合成', actions: [heal(4), blk(3)] },
    { id: 'seed-shot', name: '種飛ばし', actions: [atk(2, 2)] },
  ],
  traits: [{ kind: 'deathThroes', action: addCard(TANGLING_VINE) }],
};

export const GUST_SPRITE: EnemyDefinition = {
  id: 'gust-sprite',
  name: 'つむじ風の精',
  icon: '🌪️',
  rank: 'normal',
  maxHp: 12,
  attribute: 'grass',
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
  attribute: 'grass',
  moves: [
    { id: 'horn', name: '角突き', actions: [atk(5)] },
    { id: 'hop', name: '跳ね回る', actions: [atk(2, 3)] },
  ],
  traits: [{ kind: 'vengeance', strength: 2 }],
};

// ---- 水・氷 ----

export const ICE_WISP: EnemyDefinition = {
  id: 'ice-wisp',
  name: '氷の精',
  icon: '❄️',
  rank: 'normal',
  maxHp: 13,
  attribute: 'water',
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
  attribute: 'water',
  moves: [
    { id: 'bump', name: 'ぶつかる', actions: [atk(5)] },
    { id: 'bubble', name: '泡の膜', actions: [blk(5), atk(2)] },
  ],
  traits: [{ kind: 'deathThroes', action: debuff('weak') }],
};

export const RUIN_CRAB: EnemyDefinition = {
  id: 'ruin-crab',
  name: '遺跡ガニ',
  icon: '🦀',
  rank: 'normal',
  maxHp: 16,
  attribute: 'water',
  moves: [
    { id: 'pinch', name: 'はさみ', actions: [atk(3, 2)] },
    { id: 'shell', name: '甲羅', actions: [blk(6), atk(2)] },
  ],
  traits: [{ kind: 'guardian' }, { kind: 'hitCap', amount: 6 }],
};

// ---- 電・機械 ----

export const BOLT_BUG: EnemyDefinition = {
  id: 'bolt-bug',
  name: '雷甲虫',
  icon: '🐞',
  rank: 'normal',
  maxHp: 12,
  moves: [
    { id: 'tackle', name: '体当たり', actions: [atk(3, 2)] },
    { id: 'spark', name: '火花', actions: [atk(5)] },
  ],
  traits: [{ kind: 'deathThroes', action: paralyze() }],
};

export const COG_RAT: EnemyDefinition = {
  id: 'cog-rat',
  name: '歯車ネズミ',
  icon: '🐀',
  rank: 'normal',
  maxHp: 14,
  moves: [
    { id: 'gnaw', name: 'かじる', actions: [atk(5)] },
    { id: 'junk-toss', name: 'ガラクタ投げ', actions: [blk(5), addCard(SCRAP)] },
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
