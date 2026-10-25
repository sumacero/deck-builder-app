import type { Region } from '../domain/act';
import type { EnemyDefinition, Encounter } from '../domain/enemy';
import { soloEncounter } from '../logic/encounter';
import {
  ABYSS_SERPENT,
  ANCIENT_PHANTOM,
  BASALT_COLOSSUS,
  BOLT_BUG,
  BUBBLE_SLIME,
  CINDER_IMP,
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
  GEAR_SOLDIER,
  GRASS_WOLF,
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
  THUNDER_GOLEM,
  WIND_HAWK,
} from './enemies';

/**
 * 地域ごとの敵の顔ぶれ（第 1 章の強さ）。章ごとの強さは acts.ts で倍率をかける。
 * エリート・ボスは HP の近い相方と組んで出る（HP の比は 1:1〜1:2）。取り巻きを 1 ターンで倒して終わりにせず、
 * 敵全体への攻撃が最後まで効くようにする。名前の表示には encounterLeader を使う。
 */
export type RegionEnemies = {
  normal: Encounter[];
  elite: Encounter[];
  boss: Encounter[];
};

/** 戦闘画面は 4 体まで並べても収まるように作っているので、それより多くは出さない。 */
const group = (id: string, enemies: EnemyDefinition[], rank: Encounter['rank'] = 'normal'): Encounter => ({
  id,
  rank,
  enemies,
});

/** 組んで出るときの HP。相方がいるぶん、単体で出るときより HP を下げる。 */
const withHp = (enemy: EnemyDefinition, maxHp: number): EnemyDefinition => ({ ...enemy, maxHp });

export const REGION_ENEMIES: Record<Region, RegionEnemies> = {
  volcano: {
    normal: [
      soloEncounter(EMBER_LIZARD),
      soloEncounter(ROCK_SOLDIER),
      soloEncounter(OBSIDIAN_KNIGHT),
      soloEncounter(MAGMA_SLIME),
      group('imp-pair', [CINDER_IMP, CINDER_IMP]),
      group('fire-bat-swarm', [FIRE_BAT, FIRE_BAT, FIRE_BAT]),
      group('pebble-wall', [PEBBLE_GOLEM, CINDER_IMP, PEBBLE_GOLEM]),
      group('lizard-and-bat', [EMBER_LIZARD, FIRE_BAT]),
      group('ember-troop', [CINDER_IMP, FIRE_BAT, PEBBLE_GOLEM, CINDER_IMP]),
    ],
    elite: [
      group('hydra-and-lizard', [EMBER_LIZARD, withHp(MAGMA_HYDRA, 44)], 'elite'),
      // 巨像が眠っている間に岩の兵士を倒すか、まとめて削るか。起きたあとは一周ごとに強くなる。
      group('colossus-and-soldier', [ROCK_SOLDIER, withHp(BASALT_COLOSSUS, 50)], 'elite'),
      group('hydra-and-colossus', [withHp(MAGMA_HYDRA, 34), withHp(BASALT_COLOSSUS, 36)], 'elite'),
    ],
    boss: [group('dragon-and-slime', [withHp(MAGMA_SLIME, 34), withHp(FLAME_DRAGON, 70)], 'boss')],
  },
  grassland: {
    normal: [
      soloEncounter(WIND_HAWK),
      soloEncounter(LEAF_FAIRY),
      soloEncounter(GRASS_WOLF),
      group('sprout-patch', [SEED_SPROUT, SEED_SPROUT, SEED_SPROUT]),
      group('rabbit-pair', [HORN_RABBIT, HORN_RABBIT]),
      group('gust-flock', [GUST_SPRITE, GUST_SPRITE, GUST_SPRITE]),
      group('fairy-court', [HORN_RABBIT, LEAF_FAIRY, HORN_RABBIT]),
      group('meadow-pack', [SEED_SPROUT, GUST_SPRITE, HORN_RABBIT, SEED_SPROUT]),
    ],
    // 大樹はかばう性質で、木の葉の精への攻撃を引き受ける。
    elite: [
      group('maw-and-wolf', [GRASS_WOLF, withHp(BRIAR_MAW, 40)], 'elite'),
      group('treant-grove', [LEAF_FAIRY, withHp(GREAT_TREANT, 60)], 'elite'),
      group('maw-pair', [withHp(BRIAR_MAW, 34), withHp(BRIAR_MAW, 34)], 'elite'),
    ],
    boss: [group('griffin-and-hawk', [withHp(WIND_HAWK, 32), withHp(STORM_GRIFFIN, 66)], 'boss')],
  },
  sunkenCity: {
    normal: [
      soloEncounter(FROST_JELLY),
      soloEncounter(DROWNED_GUARD),
      soloEncounter(MIST_SIREN),
      group('wisp-pair', [ICE_WISP, ICE_WISP]),
      group('bubble-trio', [BUBBLE_SLIME, BUBBLE_SLIME, BUBBLE_SLIME]),
      group('crab-and-bubble', [RUIN_CRAB, BUBBLE_SLIME, RUIN_CRAB]),
      group('jelly-escort', [BUBBLE_SLIME, FROST_JELLY]),
      group('ruin-patrol', [RUIN_CRAB, ICE_WISP, BUBBLE_SLIME, RUIN_CRAB]),
      soloEncounter(ANCIENT_PHANTOM),
      // 亡霊は先頭に置き、最初のターンに霊体化させる。
      group('phantom-procession', [ANCIENT_PHANTOM, ICE_WISP]),
    ],
    elite: [
      group('angler-and-siren', [MIST_SIREN, withHp(FROST_ANGLER, 42)], 'elite'),
      group('serpent-and-guard', [DROWNED_GUARD, withHp(ABYSS_SERPENT, 49)], 'elite'),
      group('angler-and-serpent', [withHp(FROST_ANGLER, 34), withHp(ABYSS_SERPENT, 36)], 'elite'),
    ],
    boss: [group('leviathan-and-guard', [withHp(DROWNED_GUARD, 34), withHp(ICE_LEVIATHAN, 68)], 'boss')],
  },
  clockwork: {
    normal: [
      soloEncounter(GEAR_SOLDIER),
      soloEncounter(SPARK_DRONE),
      soloEncounter(IRON_HOUND),
      group('bug-swarm', [BOLT_BUG, BOLT_BUG, BOLT_BUG]),
      group('rat-pair', [COG_RAT, COG_RAT]),
      // チャージする宝珠は先頭に置き、チャージから始まるようにする。
      group('orb-battery', [TESLA_ORB, COG_RAT]),
      group('hound-and-bug', [IRON_HOUND, BOLT_BUG]),
      group('workshop', [TESLA_ORB, BOLT_BUG, COG_RAT, BOLT_BUG]),
    ],
    elite: [
      group('beetle-and-hound', [IRON_HOUND, withHp(GEAR_BEETLE, 44)], 'elite'),
      group('golem-and-soldier', [GEAR_SOLDIER, withHp(THUNDER_GOLEM, 51)], 'elite'),
      group('beetle-and-golem', [withHp(GEAR_BEETLE, 34), withHp(THUNDER_GOLEM, 36)], 'elite'),
    ],
    boss: [group('engine-and-soldier', [withHp(GEAR_SOLDIER, 34), withHp(ENGINE_BEAST, 72)], 'boss')],
  },
};
