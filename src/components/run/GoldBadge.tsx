import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../theme';

type GoldBadgeProps = {
  gold: number;
};

export function GoldBadge({ gold }: GoldBadgeProps) {
  return <Text style={styles.text}>🪙 {gold}</Text>;
}

const styles = StyleSheet.create({
  text: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
});
