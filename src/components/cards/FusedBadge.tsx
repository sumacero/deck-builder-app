import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type FusedBadgeProps = {
  /** 札の段。 */
  count: number;
  /** 印の色。札の小さな絵と縁をこの色にする。 */
  color: string;
};

const MINI_CARD_WIDTH = 7;
const MINI_CARD_HEIGHT = 9;
const MINI_CARD_OFFSET = 3;

/** 札の段。2 枚の札が重なった絵と、その数。 */
export function FusedBadge({ count, color }: FusedBadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={styles.icon}>
        <View style={[styles.miniCard, styles.back, { borderColor: color }]} />
        <View style={[styles.miniCard, styles.front, { borderColor: color, backgroundColor: color }]} />
      </View>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderRadius: RADIUS.round,
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.xs + 1,
    paddingVertical: 1,
  },
  icon: { width: MINI_CARD_WIDTH + MINI_CARD_OFFSET, height: MINI_CARD_HEIGHT + MINI_CARD_OFFSET },
  miniCard: {
    position: 'absolute',
    width: MINI_CARD_WIDTH,
    height: MINI_CARD_HEIGHT,
    borderWidth: 1,
    borderRadius: 1.5,
  },
  back: { top: 0, right: 0, backgroundColor: COLORS.panel },
  front: { bottom: 0, left: 0 },
  count: { color: COLORS.text, fontSize: 11, fontWeight: '800' },
});
