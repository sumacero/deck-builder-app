import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import type { Region } from '../../domain/act';
import { COLORS } from '../../theme';
import { sceneImage, type Scene } from './sceneImages';

type SceneBackgroundProps = {
  region: Region;
  scene: Scene;
  children: ReactNode;
};

/**
 * 地域ごとの背景を敷く。
 * Style B（切り紙）背景はプレイヤー立ち絵とトーンが合うので、ぼかし・霞は掛けない。
 * 文字可読性だけ薄い紺ヴェールを残す。
 */
export function SceneBackground({ region, scene, children }: SceneBackgroundProps) {
  return (
    <ImageBackground source={sceneImage(region, scene)} resizeMode="cover" style={styles.root}>
      <View style={[styles.layer, { backgroundColor: COLORS.sceneShade }]} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
