import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import type { CombatEvent } from '../../domain/combat';
import type { RelicDefinition } from '../../domain/relic';
import { useCombatEvents } from '../../hooks/useCombatEvents';
import { COLORS, MOTION, RADIUS } from '../../theme';

type RelicIconProps = {
  relic: RelicDefinition;
  events: CombatEvent[];
  selected: boolean;
  onPress: () => void;
};

/** 発動したら金色に光って跳ねる。 */
export function RelicIcon({ relic, events, selected, onPress }: RelicIconProps) {
  const [glow] = useState(() => new Animated.Value(0));

  useCombatEvents(events, (event) => {
    if (event.kind !== 'relicTriggered' || event.relicId !== relic.id) return;
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: MOTION.flashIn * 2, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: MOTION.flashOut * 2, useNativeDriver: true }),
    ]).start();
  });

  const scale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  return (
    <Pressable onPress={onPress} onLongPress={onPress} hitSlop={4}>
      <Animated.View style={[styles.icon, selected && styles.selected, { transform: [{ scale }] }]}>
        <Animated.View style={[styles.glow, { opacity: glow }]} />
        <Text style={styles.emoji}>{relic.icon}</Text>
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 34;

const styles = StyleSheet.create({
  icon: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { borderColor: COLORS.gold },
  glow: {
    position: 'absolute',
    top: -3,
    right: -3,
    bottom: -3,
    left: -3,
    borderRadius: RADIUS.round,
    borderWidth: 3,
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}55`,
  },
  emoji: { fontSize: 18 },
});
