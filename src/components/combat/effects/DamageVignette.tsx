import { useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { CombatEvent } from '../../../domain/combat';
import { COLORS, MOTION } from '../../../theme';
import { useCombatEvents } from '../../../hooks/useCombatEvents';

type DamageVignetteProps = {
  events: CombatEvent[];
};

/** プレイヤーが HP を削られたとき、画面全体を赤く光らせる。 */
export function DamageVignette({ events }: DamageVignetteProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useCombatEvents(events, (event) => {
    if (event.target !== 'player' || event.kind !== 'hit' || event.hpLoss === 0) return;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.3, duration: MOTION.flashIn, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: MOTION.flashOut * 2, useNativeDriver: true }),
    ]).start();
  });

  return <Animated.View style={[styles.vignette, { opacity }]} />;
}

const styles = StyleSheet.create({
  vignette: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 24,
    borderColor: COLORS.hp,
    backgroundColor: `${COLORS.hp}40`,
    pointerEvents: 'none',
  },
});
