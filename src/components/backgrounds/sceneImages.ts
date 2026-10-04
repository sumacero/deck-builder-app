import type { ImageSourcePropType } from 'react-native';
import type { Region } from '../../domain/act';

export type Scene = 'map' | 'combat';

type SceneImages = Record<Scene, ImageSourcePropType>;

/** 地域ごとの背景。ドメインの ActConfig は画像を知らないよう、UI 側で対応付ける。 */
const REGION_SCENES: Record<Region, SceneImages> = {
  grassland: {
    map: require('../../../assets/backgrounds/map-grassland.jpg'),
    combat: require('../../../assets/backgrounds/combat-grassland.jpg'),
  },
  swamp: {
    map: require('../../../assets/backgrounds/map-swamp.jpg'),
    combat: require('../../../assets/backgrounds/combat-swamp.jpg'),
  },
  sunkenCity: {
    map: require('../../../assets/backgrounds/map-sunken-city.jpg'),
    combat: require('../../../assets/backgrounds/combat-sunken-city.jpg'),
  },
  desert: {
    map: require('../../../assets/backgrounds/map-desert.jpg'),
    combat: require('../../../assets/backgrounds/combat-desert.jpg'),
  },
  snowfield: {
    map: require('../../../assets/backgrounds/map-snowfield.jpg'),
    combat: require('../../../assets/backgrounds/combat-snowfield.jpg'),
  },
};

export function sceneImage(region: Region, scene: Scene): ImageSourcePropType {
  return REGION_SCENES[region][scene];
}
