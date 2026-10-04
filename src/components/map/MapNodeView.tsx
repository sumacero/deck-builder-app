import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import type { MapNode } from '../../domain/map';
import { COLORS, MAP_LAYOUT, MAP_NODE_COLORS, MOTION, RADIUS } from '../../theme';
import type { Point } from './mapLayout';
import { MAP_NODE_ICON } from './nodeIcons';

type MapNodeViewProps = {
  node: MapNode;
  position: Point;
  current: boolean;
  reachable: boolean;
  visited: boolean;
  /** 押されて移動を待っているマス。大きく弾み、光の輪が広がる。 */
  selected: boolean;
  onPress: () => void;
};

/** 光の輪がどこまで広がるか（マスの大きさに対する倍率）。 */
const RIPPLE_SCALE = 2.8;

/** 進めるマスは脈打つ。今いるマスは金色の下地（目印は MapCurrentMarker）。 */
export function MapNodeView({
  node,
  position,
  current,
  reachable,
  visited,
  selected,
  onPress,
}: MapNodeViewProps) {
  const [pulse] = useState(() => new Animated.Value(0));
  const [burst] = useState(() => new Animated.Value(0));
  const size = node.type === 'boss' ? MAP_LAYOUT.bossSize : MAP_LAYOUT.nodeSize;
  const color = MAP_NODE_COLORS[node.type];

  useEffect(() => {
    if (!reachable) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: MOTION.mapPulse,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: MOTION.mapPulse,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reachable]);

  useEffect(() => {
    if (!selected) return;
    const animation = Animated.timing(burst, {
      toValue: 1,
      duration: MOTION.mapSelect,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [burst, selected]);

  const nodeScale = burst.interpolate({ inputRange: [0, 0.25, 1], outputRange: [1, 1.4, 1.2] });
  const rippleScale = burst.interpolate({ inputRange: [0, 1], outputRange: [1, RIPPLE_SCALE] });
  const rippleOpacity = burst.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.9, 0] });
  const lateRippleScale = burst.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 1, RIPPLE_SCALE * 0.7],
  });
  const lateRippleOpacity = burst.interpolate({
    inputRange: [0, 0.3, 0.4, 1],
    outputRange: [0, 0, 0.8, 0],
  });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] });

  return (
    <Pressable
      onPress={onPress}
      disabled={!reachable}
      hitSlop={8}
      style={[
        styles.anchor,
        {
          width: size,
          height: size,
          left: position.x - size / 2,
          top: position.y - size / 2,
        },
      ]}
    >
      {selected && (
        <>
          <Animated.View
            style={[
              styles.glow,
              styles.ripple,
              { opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.glow,
              styles.ripple,
              { opacity: lateRippleOpacity, transform: [{ scale: lateRippleScale }] },
            ]}
          />
        </>
      )}
      {reachable && (
        <Animated.View
          style={[
            styles.glow,
            {
              borderColor: COLORS.gold,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.node,
          {
            backgroundColor: selected || current ? COLORS.goldDark : COLORS.panel,
            borderColor: current || reachable || selected ? COLORS.gold : color,
            borderWidth: current || reachable || selected ? 3 : 2,
            opacity: visited && !current && !reachable && !selected ? 0.55 : 1,
            transform: [{ scale: nodeScale }],
          },
        ]}
      >
        <Text style={[styles.icon, node.type === 'boss' && styles.bossIcon]}>
          {MAP_NODE_ICON[node.type]}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS.round,
    borderWidth: 2,
  },
  ripple: { borderColor: COLORS.gold, borderWidth: 3 },
  node: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  bossIcon: { fontSize: 32 },
});
