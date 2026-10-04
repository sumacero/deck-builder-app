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
  CLOCKWORK_KNIGHT,
  COG_RAT,
  DROWNED_GUARD,
  EMBER_LIZARD,
  FIRE_BAT,
  FLAME_DRAGON,
  FOREST_RANGER,
  FROST_JELLY,
  FROZEN_EMPRESS,
  GEAR_EMPEROR,
  GEAR_SOLDIER,
  GRASS_WOLF,
  GREAT_TREANT,
  GUST_SPRITE,
  HORN_RABBIT,
  ICE_WISP,
  ICE_WITCH,
  IRON_HOUND,
  LAVA_KNIGHT,
  LEAF_FAIRY,
  MAGMA_SLIME,
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

/** 地域ごとの敵の顔ぶれ（第 1 章の強さ）。章ごとの強さは acts.ts で倍率をかける。 */
export type RegionEnemies = {
  normal: Encounter[];
  elite: Encounter[];
  boss: EnemyDefinition[];
};

/** 戦闘画面は 4 体まで並べても収まるように作っているので、それより多くは出さない。 */
const group = (id: string, enemies: EnemyDefinition[], rank: Encounter['rank'] = 'normal'): Encounter => ({
  id,
  rank,
  enemies,
});

export const REGION_ENEMIES: Record<Region, RegionEnemies> = {
  volcano: {
    normal: [
      soloEncounter(EMBER_LIZARD),
      soloEncounter(ROCK_SOLDIER),
      soloEncounter(MAGMA_SLIME),
      group('imp-pair', [CINDER_IMP, CINDER_IMP]),
      group('fire-bat-swarm', [FIRE_BAT, FIRE_BAT, FIRE_BAT]),
      group('pebble-wall', [PEBBLE_GOLEM, CINDER_IMP, PEBBLE_GOLEM]),
      group('lizard-and-bat', [EMBER_LIZARD, FIRE_BAT]),
      group('ember-troop', [CINDER_IMP, FIRE_BAT, PEBBLE_GOLEM, CINDER_IMP]),
    ],
    elite: [soloEncounter(LAVA_KNIGHT), soloEncounter(BASALT_COLOSSUS)],
    boss: [FLAME_DRAGON],
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
    // 大樹はかばう性質で、両脇の芽への攻撃を引き受ける。
    elite: [
      soloEncounter(FOREST_RANGER),
      group('treant-grove', [SEED_SPROUT, GREAT_TREANT, SEED_SPROUT], 'elite'),
    ],
    boss: [STORM_GRIFFIN],
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
    elite: [soloEncounter(ICE_WITCH), soloEncounter(ABYSS_SERPENT)],
    boss: [FROZEN_EMPRESS],
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
    elite: [soloEncounter(CLOCKWORK_KNIGHT), soloEncounter(THUNDER_GOLEM)],
    boss: [GEAR_EMPEROR],
  },
};
