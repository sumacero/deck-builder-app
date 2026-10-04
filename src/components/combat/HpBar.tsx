import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, MOTION, RADIUS, SPACING } from '../../theme';

type HpBarProps = {
  hp: number;
  maxHp: number;
  block: number;
};

const toWidth = (value: Animated.Value) =>
  value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

/** 減った分は明るい残像が少し遅れて追いかける。 */
export function HpBar({ hp, maxHp, block }: HpBarProps) {
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  const [fill] = useState(() => new Animated.Value(ratio));
  const [trail] = useState(() => new Animated.Value(ratio));

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fill, { toValue: ratio, duration: MOTION.hpBar, useNativeDriver: false }),
      Animated.timing(trail, {
        toValue: ratio,
        delay: MOTION.hpTrailDelay,
        duration: MOTION.hpTrail,
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [ratio, fill, trail]);

  return (
    <View style={styles.row}>
      {block > 0 && (
        <View style={styles.blockBadge}>
          <Text style={styles.blockText}>🛡️ {block}</Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.bar, styles.trail, { width: toWidth(trail) }]} />
        <Animated.View style={[styles.bar, styles.fill, { width: toWidth(fill) }]} />
        <Text style={styles.label}>
          {hp} / {maxHp}
        </Text>
      </View>
    </View>
  );
}

const BAR_HEIGHT = 18;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.hpTrack,
    overflow: 'hidden',
  },
  bar: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  trail: { backgroundColor: COLORS.hpTrail },
  fill: { backgroundColor: COLORS.hp },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: BAR_HEIGHT,
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 3,
  },
  blockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.block,
    backgroundColor: `${COLORS.block}33`,
  },
  blockText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
});
