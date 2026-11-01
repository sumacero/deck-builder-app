import { StyleSheet, Text, View } from 'react-native';
import { ATTRIBUTE_COLORS, COLORS, RADIUS, SPACING } from '../../theme';

type WaterGaugeProps = {
  attackWater: number;
  guardWater: number;
};

/** 攻撃の水力と守りの水力。戦闘のあいだ残り、重ねた札の種類で増える。 */
export function WaterGauge({ attackWater, guardWater }: WaterGaugeProps) {
  return (
    <View style={styles.row}>
      <Pool label="攻" value={attackWater} />
      <Pool label="守" value={guardWater} />
    </View>
  );
}

function Pool({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.orb}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.text}>{value}</Text>
    </View>
  );
}

const ORB_SIZE = 44;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.panel,
    borderWidth: 2,
    borderColor: ATTRIBUTE_COLORS.water,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: ATTRIBUTE_COLORS.water, fontSize: 10, fontWeight: '800' },
  text: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
});
