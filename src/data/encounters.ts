import type { Region } from '../domain/act';
import type { EnemyDefinition, EnemyTrait, Encounter, RoadTier } from '../domain/enemy';
import { soloEncounter } from '../logic/encounter';
import {
  ABYSS_SERPENT,
  ANCIENT_PHANTOM,
  BASALT_COLOSSUS,
  BOLT_BUG,
  BUBBLE_SLIME,
  CINDER_IMP,
  CINDER_POD,
  GEAR_BEETLE,
  COG_RAT,
  DROWNED_GUARD,
  EMBER_LIZARD,
  FIRE_BAT,
  FLAME_DRAGON,
  BRIAR_MAW,
  FROST_JELLY,
  ICE_LEVIATHAN,
  ENGINE_BEAST,
  BRONZE_SENTRY,
  GEAR_SOLDIER,
  GRASS_WOLF,
  MOSS_BOAR,
  GREAT_TREANT,
  GUST_SPRITE,
  HORN_RABBIT,
  ICE_WISP,
  FROST_ANGLER,
  IRON_HOUND,
  MAGMA_HYDRA,
  LEAF_FAIRY,
  MAGMA_SLIME,
  OBSIDIAN_KNIGHT,
  MIST_SIREN,
  PEBBLE_GOLEM,
  ROCK_SOLDIER,
  RUIN_CRAB,
  SEED_SPROUT,
  SPARK_DRONE,
  STORM_GRIFFIN,
  TESLA_ORB,
  TWIN_BUBBLE,
  THUNDER_GOLEM,
  WIND_HAWK,
} from './enemies';

/**
 * 地域ごとの敵の顔ぶれ（第 1 章の強さ）。章ごとの強さは acts.ts で倍率をかける。
 * エリート・ボスは HP の近い相方と組んで出る（HP の比は 1:1〜1:2）。取り巻きを 1 ターンで倒して終わりにせず、
 * 敵全体への攻撃が最後まで効くようにする。名前の表示には encounterLeader を使う。
 */
export type RegionEnemies = {
  /** 序盤・中盤・終盤で別の敵。同じ敵を強さ違いでは出さない。 */
  normal: Record<RoadTier, Encounter[]>;
  elite: Encounter[];
  boss: Encounter[];
};

/** 戦闘画面は 4 体まで並べても収まるように作っているので、それより多くは出さない。 */
const group = (
  id: string,
  enemies: EnemyDefinition[],
  rank: Encounter['rank'] = 'normal',
  tier?: RoadTier,
): Encounter => ({
  id,
  rank,
  enemies,
  ...(tier ? { tier } : {}),
});

/** 通常戦。時期の印を付ける。 */
const road = (encounter: Encounter, tier: RoadTier): Encounter => ({ ...encounter, tier });
const pair = (id: string, enemy: EnemyDefinition, tier: RoadTier): Encounter =>
  group(id, [enemy, enemy], 'normal', tier);

/** 組んで出るときの HP。相方がいるぶん、単体で出るときより HP を下げる。 */
const withHp = (enemy: EnemyDefinition, maxHp: number): EnemyDefinition => ({ ...enemy, maxHp });

/** 道中の個体はそのままに、ボス戦のコピーだけ特性を足す。 */
const withTraits = (enemy: EnemyDefinition, extra: readonly EnemyTrait[]): EnemyDefinition => ({
  ...enemy,
  traits: [...(enemy.traits ?? []), ...extra],
});

/** 1 発の大きい攻撃を止める。多段は素通りする。 */
const BIG_HIT: EnemyTrait = { kind: 'stun', threshold: 12 };
/** 1 発の上限。回数で削る札が通る。 */
const MANY_HITS: EnemyTrait = { kind: 'hitCap', amount: 6 };

export const REGION_ENEMIES: Record<Region, RegionEnemies> = {
  volcano: {
    normal: {
      early: [
        pair('imp-pair', CINDER_IMP, 'early'),
        pair('bat-pair', FIRE_BAT, 'early'),
        pair('pebble-pair', PEBBLE_GOLEM, 'early'),
      ],
      mid: [
        road(soloEncounter(EMBER_LIZARD), 'mid'),
        road(soloEncounter(MAGMA_SLIME), 'mid'),
        pair('pod-pair', CINDER_POD, 'mid'),
      ],
      late: [road(soloEncounter(ROCK_SOLDIER), 'late'), road(soloEncounter(OBSIDIAN_KNIGHT), 'late')],
    },
    elite: [
      group('hydra-and-lizard', [EMBER_LIZARD, withHp(MAGMA_HYDRA, 44)], 'elite'),
      // 巨像が眠っている間に岩の兵士を倒すか、まとめて削るか。起きたあとは一周ごとに強くなる。
      // 兵士の単体は終盤用に強くしたので、エリートの取り巻きは以前の HP のままにする。
      group('colossus-and-soldier', [withHp(ROCK_SOLDIER, 42), withHp(BASALT_COLOSSUS, 50)], 'elite'),
      group('hydra-and-colossus', [withHp(MAGMA_HYDRA, 34), withHp(BASALT_COLOSSUS, 36)], 'elite'),
    ],
    boss: [
      group('dragon-and-slime', [
        withTraits(withHp(MAGMA_SLIME, 34), [BIG_HIT]),
        withTraits(withHp(FLAME_DRAGON, 70), [MANY_HITS]),
      ], 'boss'),
    ],
  },
  grassland: {
    normal: {
      early: [
        pair('sprout-pair', SEED_SPROUT, 'early'),
        pair('rabbit-pair', HORN_RABBIT, 'early'),
        pair('gust-pair', GUST_SPRITE, 'early'),
      ],
      mid: [road(soloEncounter(WIND_HAWK), 'mid'), road(soloEncounter(LEAF_FAIRY), 'mid')],
      late: [road(soloEncounter(GRASS_WOLF), 'late'), road(soloEncounter(MOSS_BOAR), 'late')],
    },
    // 大樹はかばう性質で、木の葉の精への攻撃を引き受ける。
    elite: [
      group('maw-and-wolf', [withHp(GRASS_WOLF, 36), withHp(BRIAR_MAW, 32)], 'elite'),
      group('treant-grove', [LEAF_FAIRY, withHp(GREAT_TREANT, 60)], 'elite'),
      group('maw-pair', [withHp(BRIAR_MAW, 28), withHp(BRIAR_MAW, 28)], 'elite'),
    ],
    boss: [
      group('griffin-and-hawk', [
        withTraits(withHp(WIND_HAWK, 32), [BIG_HIT]),
        withTraits(withHp(STORM_GRIFFIN, 48), [MANY_HITS]),
      ], 'boss'),
    ],
  },
  sunkenCity: {
    normal: {
      early: [
        pair('wisp-pair', ICE_WISP, 'early'),
        pair('bubble-pair', BUBBLE_SLIME, 'early'),
        pair('crab-pair', RUIN_CRAB, 'early'),
      ],
      mid: [
        group('jelly-pair', [withHp(FROST_JELLY, 26), withHp(FROST_JELLY, 26)], 'normal', 'mid'),
        road(soloEncounter(MIST_SIREN), 'mid'),
        pair('twin-bubble-pair', TWIN_BUBBLE, 'mid'),
      ],
      // 亡霊は 1 体だけなので、最初のターンに霊体化する。
      late: [road(soloEncounter(DROWNED_GUARD), 'late'), road(soloEncounter(ANCIENT_PHANTOM), 'late')],
    },
    elite: [
      group('angler-and-siren', [MIST_SIREN, withHp(FROST_ANGLER, 42)], 'elite'),
      group('serpent-and-guard', [withHp(DROWNED_GUARD, 44), withHp(ABYSS_SERPENT, 49)], 'elite'),
      group('angler-and-serpent', [withHp(FROST_ANGLER, 34), withHp(ABYSS_SERPENT, 36)], 'elite'),
    ],
    boss: [
      group('leviathan-and-guard', [
        withTraits(withHp(DROWNED_GUARD, 34), [BIG_HIT]),
        withTraits(withHp(ICE_LEVIATHAN, 68), [MANY_HITS]),
      ], 'boss'),
    ],
  },
  clockwork: {
    normal: {
      early: [
        pair('bug-pair', BOLT_BUG, 'early'),
        pair('rat-pair', COG_RAT, 'early'),
        // 2 体とも先頭と同じ手から始める。蓄電の次が雷光。
        pair('orb-pair', TESLA_ORB, 'early'),
      ],
      mid: [road(soloEncounter(SPARK_DRONE), 'mid'), road(soloEncounter(IRON_HOUND), 'mid')],
      late: [road(soloEncounter(GEAR_SOLDIER), 'late'), road(soloEncounter(BRONZE_SENTRY), 'late')],
    },
    elite: [
      group('beetle-and-hound', [IRON_HOUND, withHp(GEAR_BEETLE, 44)], 'elite'),
      group('golem-and-soldier', [withHp(GEAR_SOLDIER, 42), withHp(THUNDER_GOLEM, 51)], 'elite'),
      group('beetle-and-golem', [withHp(GEAR_BEETLE, 34), withHp(THUNDER_GOLEM, 36)], 'elite'),
    ],
    boss: [
      group('engine-and-soldier', [
        withTraits(withHp(GEAR_SOLDIER, 34), [BIG_HIT]),
        withTraits(withHp(ENGINE_BEAST, 72), [MANY_HITS]),
      ], 'boss'),
    ],
  },
};
