import type { ImageSourcePropType } from 'react-native';

/**
 * 敵 id → Style B（切り紙）立ち絵。
 * 画像を足したらここに 1 行追加する（ドメインの EnemyDefinition は画像を知らない）。
 */
const ENEMY_ART: Record<string, ImageSourcePropType> = {
  'ember-lizard': require('../../../assets/enemies/ember-lizard.png'),
  'rock-soldier': require('../../../assets/enemies/rock-soldier.png'),
  'obsidian-knight': require('../../../assets/enemies/obsidian-knight.png'),
  'magma-slime': require('../../../assets/enemies/magma-slime.png'),
  'magma-hydra': require('../../../assets/enemies/magma-hydra.png'),
  'basalt-colossus': require('../../../assets/enemies/basalt-colossus.png'),
  'flame-dragon': require('../../../assets/enemies/flame-dragon.png'),
  'wind-hawk': require('../../../assets/enemies/wind-hawk.png'),
  'leaf-fairy': require('../../../assets/enemies/leaf-fairy.png'),
  'grass-wolf': require('../../../assets/enemies/grass-wolf.png'),
  'briar-maw': require('../../../assets/enemies/briar-maw.png'),
  'great-treant': require('../../../assets/enemies/great-treant.png'),
  'storm-griffin': require('../../../assets/enemies/storm-griffin.png'),
  'frost-jelly': require('../../../assets/enemies/frost-jelly.png'),
  'drowned-guard': require('../../../assets/enemies/drowned-guard.png'),
  'mist-siren': require('../../../assets/enemies/mist-siren.png'),
  'frost-angler': require('../../../assets/enemies/frost-angler.png'),
  'abyss-serpent': require('../../../assets/enemies/abyss-serpent.png'),
  'ice-leviathan': require('../../../assets/enemies/ice-leviathan.png'),
  'ancient-phantom': require('../../../assets/enemies/ancient-phantom.png'),
  'gear-soldier': require('../../../assets/enemies/gear-soldier.png'),
  'spark-drone': require('../../../assets/enemies/spark-drone.png'),
  'iron-hound': require('../../../assets/enemies/iron-hound.png'),
  'gear-beetle': require('../../../assets/enemies/gear-beetle.png'),
  'thunder-golem': require('../../../assets/enemies/thunder-golem.png'),
  'engine-beast': require('../../../assets/enemies/engine-beast.png'),
  'star-devourer': require('../../../assets/enemies/star-devourer.png'),
  'cinder-imp': require('../../../assets/enemies/cinder-imp.png'),
  'pebble-golem': require('../../../assets/enemies/pebble-golem.png'),
  'fire-bat': require('../../../assets/enemies/fire-bat.png'),
  'seed-sprout': require('../../../assets/enemies/seed-sprout.png'),
  'gust-sprite': require('../../../assets/enemies/gust-sprite.png'),
  'horn-rabbit': require('../../../assets/enemies/horn-rabbit.png'),
  'ice-wisp': require('../../../assets/enemies/ice-wisp.png'),
  'bubble-slime': require('../../../assets/enemies/bubble-slime.png'),
  'ruin-crab': require('../../../assets/enemies/ruin-crab.png'),
  'bolt-bug': require('../../../assets/enemies/bolt-bug.png'),
  'cog-rat': require('../../../assets/enemies/cog-rat.png'),
  'tesla-orb': require('../../../assets/enemies/tesla-orb.png'),
  'moss-boar': require('../../../assets/enemies/moss-boar.png'),
  'bronze-sentry': require('../../../assets/enemies/bronze-sentry.png'),
};

export function enemyArt(enemyId: string): ImageSourcePropType | undefined {
  return ENEMY_ART[enemyId];
}
