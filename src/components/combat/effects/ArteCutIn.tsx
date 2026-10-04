import { useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import type { CombatEvent } from '../../../domain/combat';
import { useCombatEvents } from '../../../hooks/useCombatEvents';
import { COLORS, MOTION, SPACING } from '../../../theme';

type ArteCutInProps = {
  events: CombatEvent[];
  agentName: string;
};

/** 出入りの動きに使う、カットイン全体の時間に対する割合。 */
const ENTER_RATIO = 0.18;
const EXIT_RATIO = 0.2;
const SLIDE_DISTANCE = 400;

/** 秘奥義を放ったとき、画面中央に帯を走らせてキャラ名と技名を見せる。 */
export function ArteCutIn({ events, agentName }: ArteCutInProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const [name, setName] = useState<string | null>(null);

  useCombatEvents(events, (event) => {
    if (event.kind !== 'mysticArte') return;
    setName(event.name);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: MOTION.arteCutIn,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setName(null);
    });
  });

  if (!name) return null;
  const enterEnd = ENTER_RATIO;
  const exitStart = 1 - EXIT_RATIO;
  const opacity = progress.interpolate({
    inputRange: [0, enterEnd, exitStart, 1],
    outputRange: [0, 1, 1, 0],
  });
  const translateX = progress.interpolate({
    inputRange: [0, enterEnd, exitStart, 1],
    outputRange: [SLIDE_DISTANCE, 0, 0, -SLIDE_DISTANCE],
  });
  const titleScale = progress.interpolate({
    inputRange: [0, enterEnd, enterEnd * 2, 1],
    outputRange: [1.6, 1.6, 1, 1],
  });

  return (
    <Animated.View style={[styles.layer, { opacity }]}>
      <Animated.View style={[styles.band, { transform: [{ translateX }] }]}>
        <Text style={styles.caption}>秘奥義</Text>
        <Animated.Text style={[styles.title, { transform: [{ scale: titleScale }] }]} numberOfLines={1}>
          {name}
        </Animated.Text>
        <Text style={styles.agent}>{agentName}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  band: {
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.arteBand,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.arte,
  },
  caption: { color: COLORS.gold, fontSize: 14, fontWeight: '800', letterSpacing: 8 },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: COLORS.arte,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  agent: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
});
