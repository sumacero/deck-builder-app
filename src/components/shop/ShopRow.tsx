import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { PriceTag } from './PriceTag';

type ShopRowProps = {
  icon: string;
  name: string;
  description: string;
  price: number;
  affordable: boolean;
  sold: boolean;
  selected?: boolean;
  onPress: () => void;
};

/** ポーションやサービスなど、カード以外の商品の 1 行。 */
export function ShopRow({
  icon,
  name,
  description,
  price,
  affordable,
  sold,
  selected = false,
  onPress,
}: ShopRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={sold}
      style={({ pressed }) => [
        styles.row,
        selected && styles.selected,
        sold && styles.sold,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <PriceTag price={price} affordable={affordable} sold={sold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  selected: { borderColor: COLORS.gold },
  sold: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  icon: { fontSize: 24 },
  body: { flex: 1, gap: 2 },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  description: { color: COLORS.textMuted, fontSize: 12 },
});
