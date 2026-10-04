import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme';
import { sceneImage, type Scene } from './sceneImages';

type SceneBackgroundProps = {
  actId: string;
  scene: Scene;
  children: ReactNode;
};

/** 章ごとの背景画像を敷き、上に暗いフィルターを重ねて UI を読みやすくする。 */
export function SceneBackground({ actId, scene, children }: SceneBackgroundProps) {
  const source = sceneImage(actId, scene);
  if (!source) return <View style={styles.root}>{children}</View>;
  return (
    <ImageBackground source={source} resizeMode="cover" style={styles.root}>
      <View style={styles.shade} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.sceneShade,
  },
});
