import type { Attribute } from '../domain/attribute';
import type { CardDefinition } from '../domain/card';
import type { EnemyAction, EnemyDefinition } from '../domain/enemy';
import type { DebuffId } from '../domain/status';
import { BURN, HEX_BIND, ICE_SHARD, OMEN, REGRET, SCRAP, TANGLING_VINE } from './statusCards';

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
/** 章の攻撃倍率も、一周で上がる火力も受けない。ギミック側の小ダメージ。 */
const flat = (damage: number, hits = 1): EnemyAction => ({ kind: 'attack', damage, hits, flat: true });
const blk = (amount: number): EnemyAction => ({ kind: 'block', amount });
const buff = (strength: number): EnemyAction => ({ kind: 'buff', strength });
const heal = (amount: number): EnemyAction => ({ kind: 'heal', amount });
const healAll = (amount: number): EnemyAction => ({ kind: 'heal', amount, allies: true });
const paralyze = (amount = 1): EnemyAction => ({ kind: 'paralyze', amount });
const chill = (amount = 1): EnemyAction => ({ kind: 'chill', amount });
const SEAL: EnemyAction = { kind: 'seal' };
/** スキル以外を charges 枚使うまで解けない封印。 */
const sealFor = (charges: number): EnemyAction => ({ kind: 'seal', charges });
const BIND: EnemyAction = { kind: 'bind' };
const CHARGE: EnemyAction = { kind: 'charge' };
const debuff = (status: DebuffId, turns = 1): EnemyAction => ({ kind: 'debuff', status, turns });
const addCard = (card: CardDefinition, count = 1): EnemyAction => ({ kind: 'addCard', card, count });
const INTANGIBLE: EnemyAction = { kind: 'intangible' };
/** プレイヤーのターン turns 回のあいだ、受けるダメージが 1 ヒットにつき最大 1。 */
const intangibleFor = (turns: number): EnemyAction => ({ kind: 'intangible', turns });
const DETONATE: EnemyAction = { kind: 'detonateBurns' };
const LOCK_CHILL: EnemyAction = { kind: 'lockChill' };
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
    { id: 'sparks', name: '火の粉', actions: [atk(4, 2), addCard(BURN, 2)] },
    { id: 'crouch', name: '身構え', actions: [blk(6), atk(4)] },
  ],
};

export const ROCK_SOLDIER: EnemyDefinition = {
  id: 'rock-soldier',
  name: '岩の兵士',
  icon: '🪨',
  rank: 'normal',
  maxHp: 54,
  attribute: 'fire',
  moves: [
    { id: 'shield-up', name: '盾構え', actions: [blk(12), atk(7)] },
    { id: 'cleave', name: '叩き斬り', actions: [atk(16), addCard(BURN)] },
    { id: 'stomp', name: '踏み込み', actions: [atk(6, 2)] },
  ],
  traits: [
    { kind: 'artifact', charges: 1 },
    { kind: 'stun', threshold: 12 },
  ],
};

/** 殻が厚く、攻撃 1 ヒットは 6 まで。大剣のような一撃は頭打ちになり、多段攻撃はヒット数だけ通る。 */
export const OBSIDIAN_KNIGHT: EnemyDefinition = {
  id: 'obsidian-knight',
  name: '黒曜の甲騎士',
  icon: '🛡️',
  rank: 'normal',
  maxHp: 58,
  attribute: 'fire',
  moves: [
    { id: 'shell-guard', name: '殻の構え', actions: [blk(12), atk(6)] },
    { id: 'shell-break', name: '殻割り', actions: [atk(16), addCard(BURN)] },
    { id: 'drill', name: '連打', actions: [atk(5, 2)] },
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
  traits: [{ kind: 'deathThroes', action: addCard(BURN, 3) }],
};

/** 群れでも出る。多頭竜が呼ぶ個体でもある。 */
export const CINDER_IMP: EnemyDefinition = {
  id: 'cinder-imp',
  name: '火の小鬼',
  icon: '😈',
  rank: 'normal',
  maxHp: 14,
  attribute: 'fire',
  moves: [
    { id: 'claw', name: '火の爪', actions: [atk(4), addCard(REGRET)] },
    { id: 'guard', name: '構え', actions: [blk(4), atk(3)] },
  ],
  traits: [{ kind: 'vengeance', strength: 2 }],
};

/** スキルを使うたびに激昂する。守りを重ねるほど噛みが重くなるので、攻撃で早く倒す。空いた場には小鬼を呼ぶ。 */
export const MAGMA_HYDRA: EnemyDefinition = {
  id: 'magma-hydra',
  name: '溶岩の多頭竜',
  icon: '🐲',
  rank: 'elite',
  maxHp: 62,
  attribute: 'fire',
  moves: [
    { id: 'spit', name: '火を吐く', actions: [flat(4, 2), addCard(BURN, 2)] },
    { id: 'grow-heads', name: '頭を増やす', actions: [buff(1), blk(8)] },
    { id: 'crunch', name: '噛み砕き', actions: [flat(5)] },
  ],
  traits: [
    { kind: 'enrage', strength: 1 },
    { kind: 'call', summon: CINDER_IMP, limit: 1 },
  ],
};

/** 2 ターン眠る。起きてから一周ごとに筋力が残る。ダメージそのものは小さい。 */
export const BASALT_COLOSSUS: EnemyDefinition = {
  id: 'basalt-colossus',
  name: '玄武岩の巨像',
  icon: '🗿',
  rank: 'elite',
  maxHp: 69,
  attribute: 'fire',
  moves: [
    { id: 'rock-wall', name: '岩壁', actions: [blk(12), flat(4)] },
    { id: 'settle', name: '地を溜める', actions: [buff(1), blk(8)] },
    { id: 'tremor', name: '地鳴り', actions: [flat(5), addCard(BURN, 2)] },
  ],
  traits: [{ kind: 'sleep', turns: 2, wakeStrength: 2 }, { kind: 'artifact', charges: 2 }],
};

/**
 * 前半は息で火傷をデッキに積む。HP が半分を切ると、積んだ火傷を一気に燃やし、新しい火傷は足さない。
 * HP は止まらない。倒し切ればそのまま終わる。
 */
export const FLAME_DRAGON: EnemyDefinition = {
  id: 'flame-dragon',
  name: '紅蓮竜',
  icon: '🐉',
  rank: 'boss',
  maxHp: 74,
  attribute: 'fire',
  moves: [
    { id: 'roar', name: '咆哮', actions: [buff(1), blk(10)] },
    { id: 'breath', name: '炎の息', actions: [flat(3, 3), addCard(BURN, 3)] },
  ],
  traits: [
    {
      kind: 'phase',
      threshold: 0.5,
      moves: [
        { id: 'detonate', name: '燃え上がり', actions: [DETONATE] },
        { id: 'ember-claw', name: '残り火', actions: [flat(5)] },
      ],
    },
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
    { id: 'blinding-wings', name: '目くらましの羽ばたき', actions: [blk(5), debuff('weak'), addCard(TANGLING_VINE)] },
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
    { id: 'leaf-storm', name: '木の葉吹雪', actions: [atk(2, 4), addCard(TANGLING_VINE, 2)] },
  ],
};

export const GRASS_WOLF: EnemyDefinition = {
  id: 'grass-wolf',
  name: '草原の狼',
  icon: '🐺',
  rank: 'normal',
  maxHp: 52,
  attribute: 'grass',
  moves: [
    { id: 'growl', name: '威嚇の唸り', actions: [atk(6), debuff('vulnerable')] },
    { id: 'pounce', name: '飛びかかり', actions: [atk(15)] },
    { id: 'rest', name: '草陰で休む', actions: [heal(8), blk(8), addCard(TANGLING_VINE, 2)] },
  ],
  traits: [{ kind: 'leech' }],
};

/** 回復しながら蔦でデッキを埋め、次のターンのアタックを絡める。殴りは無い。蔦を放置すると手が止まる。 */
export const BRIAR_MAW: EnemyDefinition = {
  id: 'briar-maw',
  name: '茨の大花',
  icon: '🌺',
  rank: 'elite',
  maxHp: 42,
  attribute: 'grass',
  moves: [
    { id: 'bud', name: '蕾', actions: [heal(8), blk(6)] },
    { id: 'vines', name: '蔦', actions: [addCard(TANGLING_VINE, 4)] },
    { id: 'snare', name: '絡め取り', actions: [BIND] },
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
    { id: 'root-whip', name: '根の鞭', actions: [flat(4, 2), addCard(HEX_BIND)] },
  ],
  traits: [
    { kind: 'guardian' },
    { kind: 'plague', card: TANGLING_VINE, count: 1 },
  ],
};

/**
 * 2 ターン霊体化し、そのあいだの旋回では殴らない。衣のあいだに積んだブロックが、次の急降下まで残る。
 * 急降下そのものは小さい。削れないあいだに守るかが勝負。
 */
export const STORM_GRIFFIN: EnemyDefinition = {
  id: 'storm-griffin',
  name: '嵐のグリフォン',
  icon: '🌀',
  rank: 'boss',
  maxHp: 70,
  attribute: 'grass',
  moves: [
    { id: 'wind-veil', name: '風の衣', actions: [intangibleFor(2), debuff('weak')] },
    { id: 'circle', name: '旋回', actions: [blk(8), addCard(TANGLING_VINE, 2)] },
    { id: 'dive', name: '急降下', actions: [flat(8)] },
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
    { id: 'cold-tentacle', name: '冷たい触手', actions: [atk(7), chill(), addCard(ICE_SHARD)] },
    { id: 'sting', name: '刺す', actions: [atk(4, 2)] },
    { id: 'drift', name: '漂う', actions: [blk(6), atk(4)] },
  ],
  traits: [
    { kind: 'deathThroes', action: chill() },
    { kind: 'link' },
  ],
};

export const DROWNED_GUARD: EnemyDefinition = {
  id: 'drowned-guard',
  name: '沈都の衛兵',
  icon: '🔱',
  rank: 'normal',
  maxHp: 54,
  attribute: 'water',
  moves: [
    { id: 'thrust', name: '突き', actions: [atk(15)] },
    { id: 'water-shield', name: '水の盾', actions: [blk(10), atk(6)] },
    { id: 'sealing-spear', name: '封水の槍', actions: [atk(8), SEAL, addCard(ICE_SHARD, 2)] },
  ],
  traits: [
    { kind: 'artifact', charges: 1 },
    { kind: 'devour' },
  ],
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
    { id: 'freezing-song', name: '凍える歌', actions: [atk(5), chill(), addCard(ICE_SHARD, 2)] },
  ],
  traits: [{ kind: 'plague', card: ICE_SHARD, count: 1 }],
};

/** 灯で誘い、スキル以外を 4 枚使うまで封印し、使えない氷をデッキに混ぜる。火力より、打てる札を奪う。 */
export const FROST_ANGLER: EnemyDefinition = {
  id: 'frost-angler',
  name: '深氷のアンコウ',
  icon: '🐟',
  rank: 'elite',
  maxHp: 59,
  attribute: 'water',
  moves: [
    { id: 'lure', name: '灯', actions: [blk(8), flat(4)] },
    { id: 'sealing-light', name: '封印の光', actions: [sealFor(4), addCard(ICE_SHARD, 4)] },
  ],
  traits: [{ kind: 'artifact', charges: 2 }],
};

/** 一周ごとに凍えと筋力が残る。殴りは小さく、放置すると引けないまま筋力が伸びる。 */
export const ABYSS_SERPENT: EnemyDefinition = {
  id: 'abyss-serpent',
  name: '深淵の水竜',
  icon: '🐍',
  rank: 'elite',
  maxHp: 69,
  attribute: 'water',
  moves: [
    { id: 'water-armor', name: '水の鎧', actions: [blk(12)] },
    { id: 'whirlpool', name: '渦潮', actions: [flat(4, 2), chill(2), addCard(ICE_SHARD, 2)] },
    { id: 'coil', name: '締め上げ', actions: [buff(1), chill(2)] },
  ],
  traits: [{ kind: 'devour' }],
};

/**
 * 前半は次のターンだけの凍えと封印。HP が半分を切ると凍えが戦闘の終わりまで残り、
 * 封印はスキル以外を数枚使うまで解けない。大技の一撃は無い。
 */
export const ICE_LEVIATHAN: EnemyDefinition = {
  id: 'ice-leviathan',
  name: '氷冠のレヴィアタン',
  icon: '🐋',
  rank: 'boss',
  maxHp: 72,
  attribute: 'water',
  moves: [
    { id: 'tide', name: '凍てつく潮', actions: [flat(4), chill(2), blk(8)] },
    { id: 'seal-sea', name: '封印の海', actions: [SEAL, addCard(ICE_SHARD, 4)] },
    { id: 'icicle-rain', name: '氷柱の雨', actions: [flat(3, 4)] },
  ],
  traits: [
    { kind: 'artifact', charges: 3 },
    {
      kind: 'phase',
      threshold: 0.5,
      moves: [
        { id: 'lock', name: '冠氷', actions: [LOCK_CHILL] },
        { id: 'deep-seal', name: '底の封印', actions: [sealFor(4), addCard(ICE_SHARD, 4)] },
        { id: 'icicle-rain', name: '氷柱の雨', actions: [flat(4), chill(2)] },
      ],
    },
  ],
};

/** 霊体化 → 攻撃 → 攻撃の順なので、1 体目に置くと最初のターンに霊体化する。 */
export const ANCIENT_PHANTOM: EnemyDefinition = {
  id: 'ancient-phantom',
  name: '古都の亡霊',
  icon: '👻',
  rank: 'normal',
  maxHp: 48,
  attribute: 'water',
  moves: [
    { id: 'fade', name: '霧に溶ける', actions: [INTANGIBLE] },
    { id: 'chilling-touch', name: '凍える手', actions: [atk(10), debuff('weak')] },
    { id: 'wail', name: '嘆きの声', actions: [atk(6, 2), addCard(ICE_SHARD)] },
  ],
  traits: [{ kind: 'spite' }],
};

// ==================== 電・機械（雷鳴の歯車塔） ====================

export const GEAR_SOLDIER: EnemyDefinition = {
  id: 'gear-soldier',
  name: '歯車の兵',
  icon: '🤖',
  rank: 'normal',
  maxHp: 54,
  moves: [
    { id: 'thrust', name: '突き', actions: [atk(14)] },
    { id: 'armor', name: '装甲展開', actions: [blk(12), atk(6), addCard(SCRAP)] },
    { id: 'shock-spear', name: '放電の槍', actions: [atk(7), paralyze()] },
  ],
  traits: [{ kind: 'artifact', charges: 1 }],
};

/** 死ぬと麻痺させて爆発する。雷眼が呼ぶ個体でもある。 */
export const BOLT_BUG: EnemyDefinition = {
  id: 'bolt-bug',
  name: '雷甲虫',
  icon: '🐞',
  rank: 'normal',
  maxHp: 12,
  moves: [
    { id: 'tackle', name: '体当たり', actions: [atk(3, 2)] },
    { id: 'spark', name: '火花', actions: [atk(5), addCard(SCRAP)] },
  ],
  traits: [
    { kind: 'deathThroes', action: paralyze() },
    { kind: 'burst', damage: 4 },
  ],
};

/** チャージ → 大技の順なので、群れでは行動の開始位置がずれないよう先頭に置く。空いた場には雷甲虫を呼ぶ。 */
export const SPARK_DRONE: EnemyDefinition = {
  id: 'spark-drone',
  name: 'からくり雷眼',
  icon: '👁️',
  rank: 'normal',
  maxHp: 32,
  moves: [
    { id: 'charge', name: 'チャージ', actions: [CHARGE, blk(5)] },
    { id: 'thunderbolt', name: '雷撃', actions: [atk(15)] },
    { id: 'static', name: '静電気', actions: [atk(3, 2), addCard(SCRAP)] },
  ],
  traits: [{ kind: 'call', summon: BOLT_BUG, limit: 1 }],
};

export const IRON_HOUND: EnemyDefinition = {
  id: 'iron-hound',
  name: '鉄の猟犬',
  icon: '🐕',
  rank: 'normal',
  maxHp: 38,
  moves: [
    { id: 'bite', name: '噛みつき', actions: [atk(9)] },
    { id: 'shock-fang', name: '電撃の牙', actions: [atk(5), paralyze(), addCard(OMEN)] },
    { id: 'drive', name: '駆動', actions: [blk(6), atk(3, 2)] },
  ],
  traits: [
    { kind: 'vengeance', strength: 3 },
    { kind: 'leech' },
  ],
};

/** 噛むときはガラクタだけ。チャージの次の放電だけが殴りで、麻痺もする。 */
export const GEAR_BEETLE: EnemyDefinition = {
  id: 'gear-beetle',
  name: '歯車の大甲虫',
  icon: '🪲',
  rank: 'elite',
  maxHp: 63,
  moves: [
    { id: 'gnaw', name: '噛む', actions: [addCard(SCRAP, 2)] },
    { id: 'recharge', name: '充電', actions: [CHARGE, blk(8)] },
    { id: 'discharge', name: '放電', actions: [atk(8), paralyze(2)] },
  ],
};

/** 2 ターンは眠って動かない。起きたあとの放電は麻痺とガラクタ。雷鎚は蓄電の次。 */
export const THUNDER_GOLEM: EnemyDefinition = {
  id: 'thunder-golem',
  name: '雷鳴のゴーレム',
  icon: '⚡',
  rank: 'elite',
  maxHp: 71,
  moves: [
    { id: 'discharge', name: '放電', actions: [paralyze(2), addCard(SCRAP)] },
    { id: 'store', name: '蓄電', actions: [CHARGE, blk(10)] },
    { id: 'thunder-hammer', name: '雷鎚', actions: [atk(10)] },
  ],
  traits: [{ kind: 'sleep', turns: 2, wakeStrength: 2 }],
};

/** 短路は麻痺、歯車の嵐はガラクタ。雷神砲はフルチャージの次だけで、ここを止めないと当たる。 */
export const ENGINE_BEAST: EnemyDefinition = {
  id: 'engine-beast',
  name: '炉心獣',
  icon: '⚙️',
  rank: 'boss',
  maxHp: 78,
  moves: [
    { id: 'boot', name: '起動', actions: [blk(10), addCard(SCRAP, 2)] },
    { id: 'short', name: '短路', actions: [paralyze(2)] },
    { id: 'gear-storm', name: '歯車の嵐', actions: [addCard(SCRAP, 2)] },
    { id: 'full-charge', name: 'フルチャージ', actions: [CHARGE, blk(12)] },
    { id: 'thunder-cannon', name: '雷神砲', actions: [atk(10)] },
  ],
  traits: [
    { kind: 'artifact', charges: 2 },
    { kind: 'weight', energy: 1 },
  ],
};

// ==================== ラスボス（3 つの章を終えたあと） ====================

/**
 * 各地の魔力を奪った三つの旗（火・水・草）を掲げ替えて戦う。旗を掲げるたびに属性と弱点が変わるので、
 * どの属性のデッキにも突ける番と突かれる番がある。HP が半分になると覚醒し、筋力を得て封印が重くなる。
 * 殴りは小さく、章の攻撃倍率では増えない。増えるのは覚醒の筋力と、旗がかける火傷・凍え・封印。
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
    { id: 'crimson-blade', name: '紅蓮の剣', actions: [flat(6), addCard(BURN, 2)] },
    { id: 'azure-banner', name: '蒼の旗', actions: [shift('water'), SEAL, blk(12)] },
    { id: 'ice-lance', name: '氷の槍', actions: [flat(6), chill(2), addCard(ICE_SHARD, 2)] },
    { id: 'verdant-banner', name: '翠の旗', actions: [shift('grass'), heal(8), debuff('weak')] },
    { id: 'gale-flurry', name: '疾風の連撃', actions: [flat(6), addCard(TANGLING_VINE, 2)] },
  ],
  traits: [
    { kind: 'artifact', charges: 2 },
    {
      kind: 'awaken',
      threshold: 0.5,
      strength: 3,
      block: 20,
      moves: [
        { id: 'crimson-storm', name: '紅蓮の旗', actions: [shift('fire'), flat(6), addCard(BURN, 2)] },
        { id: 'azure-frost', name: '蒼氷の旗', actions: [shift('water'), flat(6), sealFor(4), addCard(ICE_SHARD, 2)] },
        { id: 'verdant-gale', name: '翠嵐の旗', actions: [shift('grass'), flat(6), chill(2), addCard(TANGLING_VINE, 2)] },
        { id: 'devour-light', name: '星を喰らう', actions: [CHARGE, blk(16)] },
        { id: 'star-eater', name: '星喰み', actions: [flat(6), sealFor(4)] },
      ],
    },
  ],
};

// ==================== 群れで出てくる小型の敵（1 体ずつは弱い） ====================

// ---- 火・岩 ----

export const PEBBLE_GOLEM: EnemyDefinition = {
  id: 'pebble-golem',
  name: '小石のゴーレム',
  icon: '⛰️',
  rank: 'normal',
  maxHp: 14,
  attribute: 'fire',
  moves: [
    { id: 'stone-wall', name: '石の壁', actions: [blk(5), atk(2)] },
    { id: 'tackle', name: '体当たり', actions: [atk(4), addCard(BURN)] },
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
    { id: 'fire-wing', name: '火の羽', actions: [atk(2, 2)] },
    { id: 'bite', name: '噛みつき', actions: [atk(4), addCard(BURN)] },
  ],
  traits: [{ kind: 'spite' }],
};

// ---- 草・風 ----

/** 種の芽が割れて出る。これ以上は分裂しない。 */
export const SPROUT_BIT: EnemyDefinition = {
  id: 'sprout-bit',
  name: '切れ芽',
  icon: '🌿',
  rank: 'normal',
  maxHp: 8,
  attribute: 'grass',
  moves: [
    { id: 'nip', name: 'つつき', actions: [atk(3)] },
    { id: 'root', name: '根を張る', actions: [blk(3)] },
  ],
};

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
  traits: [
    { kind: 'deathThroes', action: addCard(TANGLING_VINE, 2) },
    { kind: 'split', into: SPROUT_BIT, count: 2 },
  ],
};

export const GUST_SPRITE: EnemyDefinition = {
  id: 'gust-sprite',
  name: 'つむじ風の精',
  icon: '🌪️',
  rank: 'normal',
  maxHp: 12,
  attribute: 'grass',
  moves: [
    { id: 'whirlwind', name: 'つむじ風', actions: [atk(2, 2)] },
    { id: 'wind-blade', name: '風の刃', actions: [atk(3), addCard(TANGLING_VINE)] },
  ],
  traits: [{ kind: 'molt', threshold: 0.5, heal: 3 }],
};

export const HORN_RABBIT: EnemyDefinition = {
  id: 'horn-rabbit',
  name: '角ウサギ',
  icon: '🐇',
  rank: 'normal',
  maxHp: 13,
  attribute: 'grass',
  moves: [
    { id: 'horn', name: '角突き', actions: [atk(4)] },
    { id: 'hop', name: '跳ね回る', actions: [atk(2, 2), addCard(TANGLING_VINE)] },
  ],
  traits: [
    { kind: 'vengeance', strength: 2 },
    { kind: 'riposte', damage: 2 },
  ],
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
    { id: 'cold-air', name: '冷気', actions: [atk(2), chill(), addCard(ICE_SHARD)] },
    { id: 'ice-pebble', name: '氷のつぶて', actions: [atk(4)] },
  ],
  traits: [{ kind: 'molt', threshold: 0.5, heal: 3 }],
};

export const BUBBLE_SLIME: EnemyDefinition = {
  id: 'bubble-slime',
  name: '泡スライム',
  icon: '🫧',
  rank: 'normal',
  maxHp: 14,
  attribute: 'water',
  moves: [
    { id: 'bump', name: 'ぶつかる', actions: [atk(5), addCard(ICE_SHARD)] },
    { id: 'bubble', name: '泡の膜', actions: [blk(5), atk(2)] },
  ],
  traits: [
    { kind: 'deathThroes', action: debuff('weak') },
    { kind: 'burst', damage: 5 },
  ],
};

export const RUIN_CRAB: EnemyDefinition = {
  id: 'ruin-crab',
  name: '遺跡ガニ',
  icon: '🦀',
  rank: 'normal',
  maxHp: 14,
  attribute: 'water',
  moves: [
    { id: 'pinch', name: 'はさみ', actions: [atk(2, 2), addCard(ICE_SHARD)] },
    { id: 'shell', name: '甲羅', actions: [blk(5), atk(2)] },
  ],
  traits: [
    { kind: 'guardian' },
    { kind: 'hitCap', amount: 6 },
    { kind: 'riposte', damage: 3 },
  ],
};

// ---- 電・機械 ----

export const COG_RAT: EnemyDefinition = {
  id: 'cog-rat',
  name: '歯車ネズミ',
  icon: '🐀',
  rank: 'normal',
  maxHp: 14,
  moves: [
    { id: 'gnaw', name: 'かじる', actions: [atk(5)] },
    { id: 'junk-toss', name: 'ガラクタ投げ', actions: [blk(5), addCard(SCRAP, 2)] },
  ],
  traits: [{ kind: 'spines', card: SCRAP, count: 1 }],
};

/** チャージ → 大技の 2 手。群れでは偶数番目に置くと、チャージから始まる。 */
export const TESLA_ORB: EnemyDefinition = {
  id: 'tesla-orb',
  name: '雷の宝珠',
  icon: '🔮',
  rank: 'normal',
  maxHp: 13,
  moves: [
    { id: 'store', name: '蓄電', actions: [CHARGE, blk(3), addCard(SCRAP)] },
    { id: 'flash', name: '雷光', actions: [atk(6)] },
  ],
};

/** 草原の終盤。狼より重く、突進の前に一度地を蹴って予告する。 */
export const MOSS_BOAR: EnemyDefinition = {
  id: 'moss-boar',
  name: '苔の猪',
  icon: '🐗',
  rank: 'normal',
  maxHp: 58,
  attribute: 'grass',
  moves: [
    { id: 'brace', name: '地を蹴る', actions: [blk(12), addCard(TANGLING_VINE, 2)] },
    { id: 'charge', name: '突進', actions: [atk(17)] },
    { id: 'trample', name: '踏み荒らし', actions: [atk(8, 2)] },
  ],
  traits: [{ kind: 'weight', energy: 1 }],
};

/** 歯車塔の終盤。構えと蓄電のあとに、大きな雷槌を落とす。 */
export const BRONZE_SENTRY: EnemyDefinition = {
  id: 'bronze-sentry',
  name: '青銅の歩哨',
  icon: '🗿',
  rank: 'normal',
  maxHp: 60,
  moves: [
    { id: 'plate', name: '青銅の構え', actions: [blk(14)] },
    { id: 'wind', name: '蓄電', actions: [CHARGE, blk(6), addCard(SCRAP)] },
    { id: 'slam', name: '雷槌', actions: [atk(18)] },
  ],
  traits: [
    { kind: 'artifact', charges: 1 },
    { kind: 'stun', threshold: 12 },
  ],
};

/** 火山の中盤。数ターンで爆発する。先に割れば爆発しない。 */
export const CINDER_POD: EnemyDefinition = {
  id: 'cinder-pod',
  name: '火種の瘤',
  icon: '💣',
  rank: 'normal',
  maxHp: 22,
  attribute: 'fire',
  moves: [
    { id: 'sizzle', name: '焦げる', actions: [atk(5)] },
    { id: 'swell', name: '膨らむ', actions: [blk(6)] },
  ],
  traits: [{ kind: 'wick', turns: 3, damage: 8 }],
};

/** 水の古都の中盤。片方だけ倒しても、もう片方が生きていれば起き上がる。 */
export const TWIN_BUBBLE: EnemyDefinition = {
  id: 'twin-bubble',
  name: '対の泡',
  icon: '🫧',
  rank: 'normal',
  maxHp: 24,
  attribute: 'water',
  moves: [
    { id: 'pop-slap', name: '泡の平手', actions: [atk(7)] },
    { id: 'chill-mist', name: '冷たい霧', actions: [atk(4), chill()] },
    { id: 'film', name: '膜', actions: [blk(8)] },
  ],
  traits: [{ kind: 'pact', turns: 2, hpRatio: 0.5 }],
};
