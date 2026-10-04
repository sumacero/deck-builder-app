import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RelicDefinition } from '../../domain/relic';
import { describeRelic, RELIC_RARITY_LABEL } from '../../logic/describe';
import { COLORS, RADIUS, RELIC_RARITY_COLORS, SPACING } from '../../theme';

type RelicCardProps = {
  relic: RelicDefinition;
  /** 名前の前に付ける見出し（「レリック獲得」など）。 */
  caption?: string;
  selected?: boolean;
  /** 渡すと選べるカードになる。 */
  onPress?: () => void;
};

/** レリックのアイコン・名前・レア度・効果を 1 枚にまとめた表示。枠はレア度の色。 */
export function RelicCard({ relic, caption, selected = false, onPress }: RelicCardProps) {
  const rarityColor = RELIC_RARITY_COLORS[relic.rarity];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: rarityColor },
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.icon}>{relic.icon}</Text>
      <View style={styles.body}>
        <Text style={styles.name}>
          {caption ? `${caption}: ` : ''}
          {relic.name}
        </Text>
        <Text style={[styles.rarity, { color: rarityColor }]}>{RELIC_RARITY_LABEL[relic.rarity]}</Text>
        <Text style={styles.text}>{describeRelic(relic)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    alignSelf: 'stretch',
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  selected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  pressed: { opacity: 0.7 },
  icon: { fontSize: 30 },
  body: { flex: 1, gap: 2 },
  name: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  rarity: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  text: { color: COLORS.textMuted, fontSize: 12 },
});
