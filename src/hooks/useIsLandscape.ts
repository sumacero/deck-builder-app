import { useWindowDimensions } from 'react-native';

/** 画面が横長か。端末を回すと再描画される。 */
export function useIsLandscape(): boolean {
  const { width, height } = useWindowDimensions();
  return width > height;
}
