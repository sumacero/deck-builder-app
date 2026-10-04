import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RelicDefinition } from '../../domain/relic';
import { describeRelic } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';

type RelicCardProps = {
  relic: RelicDefinition;
  /** 名前の前に付ける見出し（「レリック獲得」など）。 */
  caption?: string;
  selected?: boolean;
  /** 渡すと選べるカードになる。 */
  onPress?: () => void;
};

/** レリックのアイコン・名前・効果を 1 枚にまとめた表示。 */
export function RelicCard({ relic, caption, selected = false, onPress }: RelicCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        relic.rarity === 'boss' && styles.boss,
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
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  boss: { borderColor: COLORS.danger },
  selected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  pressed: { opacity: 0.7 },
  icon: { fontSize: 30 },
  body: { flex: 1, gap: 2 },
  name: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  text: { color: COLORS.textMuted, fontSize: 12 },
});
