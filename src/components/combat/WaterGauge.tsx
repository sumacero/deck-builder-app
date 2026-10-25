import { StyleSheet, Text, View } from 'react-native';
import { ATTRIBUTE_COLORS, COLORS, RADIUS } from '../../theme';

type WaterGaugeProps = {
  water: number;
};

/** 水力。戦闘のあいだ残り、水札を重ねると増え、水力を要する札で減る。 */
export function WaterGauge({ water }: WaterGaugeProps) {
  return (
    <View style={styles.orb}>
      <Text style={styles.label}>水力</Text>
      <Text style={styles.text}>{water}</Text>
    </View>
  );
}

const ORB_SIZE = 52;

const styles = StyleSheet.create({
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
