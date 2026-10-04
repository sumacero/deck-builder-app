import type { ModalProps } from 'react-native';

/** iOS の Modal は指定しないと縦向きでしか開かないので、横向きプレイ中も同じ向きで開くようにする。 */
export const MODAL_ORIENTATIONS: ModalProps['supportedOrientations'] = [
  'portrait',
  'landscape-left',
  'landscape-right',
];
