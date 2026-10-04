import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../theme';

type PriceTagProps = {
  price: number;
  affordable: boolean;
  sold?: boolean;
};

export function PriceTag({ price, affordable, sold = false }: PriceTagProps) {
  if (sold) return <Text style={[styles.text, styles.sold]}>売り切れ</Text>;
  return <Text style={[styles.text, !affordable && styles.short]}>🪙 {price}</Text>;
}

const styles = StyleSheet.create({
  text: { color: COLORS.gold, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  short: { color: COLORS.danger },
  sold: { color: COLORS.textMuted },
});
