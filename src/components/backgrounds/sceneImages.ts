import type { ImageSourcePropType } from 'react-native';
import type { Region } from '../../domain/act';

export type Scene = 'map' | 'combat';

type SceneImages = Record<Scene, ImageSourcePropType>;

/** 地域ごとの背景。ドメインの ActConfig は画像を知らないよう、UI 側で対応付ける。 */
const REGION_SCENES: Record<Region, SceneImages> = {
  cave: {
    map: require('../../../assets/backgrounds/map-act1.jpg'),
    combat: require('../../../assets/backgrounds/combat-act1.jpg'),
  },
  grassland: {
    map: require('../../../assets/backgrounds/map-grassland.jpg'),
    combat: require('../../../assets/backgrounds/combat-grassland.jpg'),
  },
  swamp: {
    map: require('../../../assets/backgrounds/map-swamp.jpg'),
    combat: require('../../../assets/backgrounds/combat-swamp.jpg'),
  },
  castle: {
    map: require('../../../assets/backgrounds/map-act2.jpg'),
    combat: require('../../../assets/backgrounds/combat-act2.jpg'),
  },
  desert: {
    map: require('../../../assets/backgrounds/map-desert.jpg'),
    combat: require('../../../assets/backgrounds/combat-desert.jpg'),
  },
  snowfield: {
    map: require('../../../assets/backgrounds/map-snowfield.jpg'),
    combat: require('../../../assets/backgrounds/combat-snowfield.jpg'),
  },
  stars: {
    map: require('../../../assets/backgrounds/map-act3.jpg'),
    combat: require('../../../assets/backgrounds/combat-act3.jpg'),
  },
  volcano: {
    map: require('../../../assets/backgrounds/map-volcano.jpg'),
    combat: require('../../../assets/backgrounds/combat-volcano.jpg'),
  },
  shadow: {
    map: require('../../../assets/backgrounds/map-shadow.jpg'),
    combat: require('../../../assets/backgrounds/combat-shadow.jpg'),
  },
};

export function sceneImage(region: Region, scene: Scene): ImageSourcePropType {
  return REGION_SCENES[region][scene];
}
