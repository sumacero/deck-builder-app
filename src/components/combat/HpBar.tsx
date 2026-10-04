import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, MOTION, RADIUS, SPACING } from '../../theme';

type HpBarProps = {
  hp: number;
  maxHp: number;
  block: number;
  /** 敵が多いときの細い表示。 */
  compact?: boolean;
};

const toWidth = (value: Animated.Value) =>
  value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

/** 減った分は明るい残像が少し遅れて追いかける。 */
export function HpBar({ hp, maxHp, block, compact = false }: HpBarProps) {
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
    <View style={[styles.row, compact && styles.compactRow]}>
      {block > 0 && (
        <View style={[styles.blockBadge, compact && styles.compactBlockBadge]}>
          <Text style={[styles.blockText, compact && styles.compactText]}>
            🛡️{compact ? '' : ' '}
            {block}
          </Text>
        </View>
      )}
      <View style={[styles.track, compact && styles.compactTrack]}>
        <Animated.View style={[styles.bar, styles.trail, { width: toWidth(trail) }]} />
        <Animated.View style={[styles.bar, styles.fill, { width: toWidth(fill) }]} />
        <Text style={[styles.label, compact && styles.compactLabel]}>
          {compact ? `${hp}/${maxHp}` : `${hp} / ${maxHp}`}
        </Text>
      </View>
    </View>
  );
}

const BAR_HEIGHT = 18;
const COMPACT_BAR_HEIGHT = 14;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  compactRow: { gap: 2 },
  compactTrack: { height: COMPACT_BAR_HEIGHT },
  compactLabel: { fontSize: 10, lineHeight: COMPACT_BAR_HEIGHT },
  compactBlockBadge: { paddingHorizontal: 3, paddingVertical: 0 },
  compactText: { fontSize: 11 },
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
