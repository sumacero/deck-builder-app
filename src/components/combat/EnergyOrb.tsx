import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS } from '../../theme';

type EnergyOrbProps = {
  energy: number;
  maxEnergy: number;
};

export function EnergyOrb({ energy, maxEnergy }: EnergyOrbProps) {
  return (
    <View style={styles.orb}>
      <Text style={styles.text}>
        {energy}/{maxEnergy}
      </Text>
    </View>
  );
}

const ORB_SIZE = 52;

const styles = StyleSheet.create({
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.goldDark,
    borderWidth: 2,
    borderColor: COLORS.energy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: COLORS.energy, fontSize: 17, fontWeight: '800' },
});
