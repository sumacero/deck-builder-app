import { StyleSheet, Text, View } from 'react-native';
import { ARTE_GAUGE_MAX } from '../../logic/combat';
import { COLORS, RADIUS, SPACING } from '../../theme';

type ArteGaugeProps = {
  value: number;
};

const BAR_HEIGHT = 6;

/** 自分の HP の下に出す秘奥義ゲージ。満タンで秘奥義カードが手札に来る。 */
export function ArteGauge({ value }: ArteGaugeProps) {
  const ratio = Math.min(1, value / ARTE_GAUGE_MAX);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>秘奥義</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.value}>
        {value}/{ARTE_GAUGE_MAX}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  label: { color: COLORS.arte, fontSize: 10, fontWeight: '800' },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.arteTrack,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: RADIUS.round, backgroundColor: COLORS.arte },
  value: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
});
