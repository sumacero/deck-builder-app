import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../theme';

type FadeOverlayProps = {
  /** 不透明度をこの値から to へ変える（1 で真っ暗）。 */
  from: number;
  to: number;
  duration: number;
  delay?: number;
};

/** 画面全体を覆う暗幕。暗転・暗転明けに使う。タッチは下の画面に通す。 */
export function FadeOverlay({ from, to, duration, delay = 0 }: FadeOverlayProps) {
  const [opacity] = useState(() => new Animated.Value(from));

  useEffect(() => {
    const animation = Animated.timing(opacity, { toValue: to, duration, delay, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [opacity, to, duration, delay]);

  return <Animated.View pointerEvents="none" style={[styles.fill, { opacity }]} />;
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: COLORS.fade },
});
