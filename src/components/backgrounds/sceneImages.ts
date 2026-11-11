import type { ImageSourcePropType } from 'react-native';
import type { Region } from '../../domain/act';

export type Scene = 'map' | 'combat';

type SceneImages = Record<Scene, ImageSourcePropType>;

/** 地域ごとの背景。ドメインの ActConfig は画像を知らないよう、UI 側で対応付ける。 */
const REGION_SCENES: Record<Region, SceneImages> = {
  volcano: {
    map: require('../../../assets/backgrounds/map-volcano.jpg'),
    combat: require('../../../assets/backgrounds/combat-volcano.jpg'),
  },
  grassland: {
    map: require('../../../assets/backgrounds/map-grassland.jpg'),
    combat: require('../../../assets/backgrounds/combat-grassland.jpg'),
  },
  sunkenCity: {
    map: require('../../../assets/backgrounds/map-sunken-city.jpg'),
    combat: require('../../../assets/backgrounds/combat-sunken-city.jpg'),
  },
  clockwork: {
    map: require('../../../assets/backgrounds/map-clockwork.jpg'),
    combat: require('../../../assets/backgrounds/combat-clockwork.jpg'),
  },
};

export function sceneImage(region: Region, scene: Scene): ImageSourcePropType {
  return REGION_SCENES[region][scene];
}

/**
 * 出来事・店・休憩所・宝箱・案内役の絵。
 * 画面の上部に出す。ドメインの id は画像を知らない。
 */
const PLACE_SCENES: Record<string, ImageSourcePropType> = {
  shop: require('../../../assets/scenes/shop.jpg'),
  rest: require('../../../assets/scenes/rest.jpg'),
  treasure: require('../../../assets/scenes/treasure.jpg'),
  blessing: require('../../../assets/scenes/blessing.jpg'),
  'old-shrine': require('../../../assets/scenes/old-shrine.jpg'),
  'healing-spring': require('../../../assets/scenes/healing-spring.jpg'),
  'blood-merchant': require('../../../assets/scenes/blood-merchant.jpg'),
  'wandering-smith': require('../../../assets/scenes/wandering-smith.jpg'),
  'sleeping-guardian': require('../../../assets/scenes/sleeping-guardian.jpg'),
  'wandering-bard': require('../../../assets/scenes/wandering-bard.jpg'),
  'cursed-tome': require('../../../assets/scenes/cursed-tome.jpg'),
  'fusion-altar': require('../../../assets/scenes/fusion-altar.jpg'),
  pitfall: require('../../../assets/scenes/pitfall.jpg'),
  'fairy-ring': require('../../../assets/scenes/fairy-ring.jpg'),
  'abandoned-camp': require('../../../assets/scenes/abandoned-camp.jpg'),
  'dragon-hoard': require('../../../assets/scenes/dragon-hoard.jpg'),
  'mirror-lake': require('../../../assets/scenes/mirror-lake.jpg'),
  'knight-trial': require('../../../assets/scenes/knight-trial.jpg'),
  'wishing-well': require('../../../assets/scenes/wishing-well.jpg'),
  'ancient-library': require('../../../assets/scenes/ancient-library.jpg'),
  'traveling-alchemist': require('../../../assets/scenes/traveling-alchemist.jpg'),
  'grasping-tree': require('../../../assets/scenes/grasping-tree.jpg'),
  'wayside-fortune': require('../../../assets/scenes/wayside-fortune.jpg'),
  'roadside-stone': require('../../../assets/scenes/roadside-stone.jpg'),
  'sealed-reliquary': require('../../../assets/scenes/sealed-reliquary.jpg'),
  'abandoned-banner': require('../../../assets/scenes/abandoned-banner.jpg'),
  'abyss-whisper': require('../../../assets/scenes/abyss-whisper.jpg'),
  'fallen-crown': require('../../../assets/scenes/fallen-crown.jpg'),
  'cinder-practice': require('../../../assets/scenes/cinder-practice.jpg'),
  'wildfire-stage': require('../../../assets/scenes/wildfire-stage.jpg'),
  'falling-ember-wing': require('../../../assets/scenes/falling-ember-wing.jpg'),
  'dew-footing': require('../../../assets/scenes/dew-footing.jpg'),
  'thorn-stage': require('../../../assets/scenes/thorn-stage.jpg'),
  'restring-signal': require('../../../assets/scenes/restring-signal.jpg'),
  'mist-basin': require('../../../assets/scenes/mist-basin.jpg'),
  'returning-stage': require('../../../assets/scenes/returning-stage.jpg'),
  'double-reflection-wing': require('../../../assets/scenes/double-reflection-wing.jpg'),
  'basin-oracle': require('../../../assets/scenes/basin-oracle.jpg'),
};

/** その場所の絵。未登録なら null（絵文字の見出しを残す）。 */
export function placeImage(id: string): ImageSourcePropType | null {
  return PLACE_SCENES[id] ?? null;
}
