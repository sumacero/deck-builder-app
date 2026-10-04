import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS, MAP_LAYOUT, MOTION, RADIUS } from '../../theme';
import type { Point } from './mapLayout';

type MapCurrentMarkerProps = {
  position: Point;
  /** 今いるマスの大きさ（ボスは大きい）。 */
  nodeSize: number;
  /** エージェントのアイコン。ピンに載せる。 */
  icon: string;
};

/**
 * 今いるマスの目印。マスを囲む金の輪と、上で弾む「現在地」のピン。
 * ほかのマスや道より手前に出すため、マスとは別にすべてのマスの後に描く。
 */
export function MapCurrentMarker({ position, nodeSize, icon }: MapCurrentMarkerProps) {
  const [bob] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: MOTION.mapMarkerBob,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: MOTION.mapMarkerBob,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const ringSize = nodeSize + MAP_LAYOUT.markerRingPadding * 2;
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -MAP_LAYOUT.markerBob] });

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            left: position.x - ringSize / 2,
            top: position.y - ringSize / 2,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pinAnchor,
          {
            left: position.x - MAP_LAYOUT.markerWidth / 2,
            top: position.y - nodeSize / 2 - MAP_LAYOUT.markerHeight - MAP_LAYOUT.markerGap,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.pin}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>現在地</Text>
        </View>
        <View style={styles.tail} />
      </Animated.View>
    </>
  );
}

const TAIL = 6;

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderRadius: RADIUS.round,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  pinAnchor: {
    position: 'absolute',
    width: MAP_LAYOUT.markerWidth,
    height: MAP_LAYOUT.markerHeight,
    alignItems: 'center',
  },
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: MAP_LAYOUT.markerHeight - TAIL,
    paddingHorizontal: 6,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.gold,
    borderWidth: 1.5,
    borderColor: COLORS.text,
  },
  icon: { fontSize: 12 },
  label: { color: COLORS.onGold, fontSize: 11, fontWeight: '900' },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: TAIL,
    borderRightWidth: TAIL,
    borderTopWidth: TAIL,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.gold,
  },
});
