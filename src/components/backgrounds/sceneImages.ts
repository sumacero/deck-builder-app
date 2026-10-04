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
