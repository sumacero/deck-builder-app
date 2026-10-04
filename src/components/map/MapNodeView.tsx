import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
  onPress: () => void;
};

/** 進めるマスは脈打つ。今いるマスは金枠。 */
export function MapNodeView({
  node,
  position,
  current,
  reachable,
  visited,
  onPress,
}: MapNodeViewProps) {
  const [pulse] = useState(() => new Animated.Value(0));
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
      <View
        style={[
          styles.node,
          {
            backgroundColor: COLORS.panel,
            borderColor: current ? COLORS.gold : reachable ? COLORS.gold : color,
            borderWidth: current || reachable ? 3 : 2,
            opacity: visited && !current && !reachable ? 0.55 : 1,
          },
        ]}
      >
        <Text style={[styles.icon, node.type === 'boss' && styles.bossIcon]}>
          {MAP_NODE_ICON[node.type]}
        </Text>
      </View>
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
