import type { ImageSourcePropType } from 'react-native';

export type Scene = 'map' | 'combat';

type SceneImages = Record<Scene, ImageSourcePropType>;

/** 章 id ごとの背景。ドメインの ActConfig は画像を知らないよう、UI 側で対応付ける。 */
const ACT_SCENES: Record<string, SceneImages> = {
  'act-1': {
    map: require('../../../assets/backgrounds/map-act1.jpg'),
    combat: require('../../../assets/backgrounds/combat-act1.jpg'),
  },
  'act-2': {
    map: require('../../../assets/backgrounds/map-act2.jpg'),
    combat: require('../../../assets/backgrounds/combat-act2.jpg'),
  },
  'act-3': {
    map: require('../../../assets/backgrounds/map-act3.jpg'),
    combat: require('../../../assets/backgrounds/combat-act3.jpg'),
  },
};

/** 画像が無い章は undefined（背景色だけになる）。 */
export function sceneImage(actId: string, scene: Scene): ImageSourcePropType | undefined {
  return ACT_SCENES[actId]?.[scene];
}
