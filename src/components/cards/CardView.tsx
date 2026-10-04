import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { CARD_TYPE_LABEL, describeCard } from '../../logic/describe';
import { CARD_TYPE_COLORS, COLORS, HAND_LAYOUT, RADIUS, SPACING } from '../../theme';

type CardViewProps = {
  card: CardDefinition;
  count?: number;
  dimmed?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md';
  /** 指定すると size より優先し、幅に合わせて文字も縮める（手札用）。 */
  width?: number;
  onPress?: () => void;
};

const BASE_WIDTH = 96;

/** 幅に合わせた文字サイズ。小さくなりすぎないよう下限を設ける。 */
function scaledStyles(width: number) {
  const scale = Math.min(1, width / BASE_WIDTH);
  return {
    card: {
      width,
      minHeight: Math.round(width * HAND_LAYOUT.aspectRatio),
      paddingHorizontal: Math.max(2, SPACING.xs * scale),
    },
    name: { fontSize: Math.max(10, 13 * scale) },
    type: { fontSize: Math.max(8, 10 * scale) },
    description: { fontSize: Math.max(9, 11 * scale) },
  };
}

export function CardView({
  card,
  count,
  dimmed = false,
  selected = false,
  size = 'sm',
  width,
  onPress,
}: CardViewProps) {
  const typeColor = CARD_TYPE_COLORS[card.type];
  const wide = size === 'md' && width === undefined;
  const scaled = width !== undefined ? scaledStyles(width) : null;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        wide && styles.wide,
        scaled?.card,
        { borderColor: selected ? COLORS.gold : typeColor },
        selected && styles.selected,
        dimmed && styles.dimmed,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.costGem}>
        <Text style={styles.costText}>{card.cost}</Text>
      </View>
      {count !== undefined && count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>×{count}</Text>
        </View>
      )}
      <Text
        style={[styles.name, scaled?.name, card.upgraded && styles.upgradedName]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {card.name}
      </Text>
      <Text style={[styles.type, scaled?.type, { color: typeColor }]}>
        {CARD_TYPE_LABEL[card.type]}
      </Text>
      <Text style={[styles.description, scaled?.description]}>{describeCard(card)}</Text>
    </Pressable>
  );
}

const GEM_SIZE = 24;

const styles = StyleSheet.create({
  card: {
    width: BASE_WIDTH,
    minHeight: 132,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  wide: { width: 108, minHeight: 168, paddingHorizontal: SPACING.sm },
  selected: { borderWidth: 3 },
  dimmed: { opacity: 0.4 },
  pressed: { transform: [{ translateY: -8 }] },
  costGem: {
    position: 'absolute',
    top: -SPACING.sm,
    left: -SPACING.sm,
    width: GEM_SIZE,
    height: GEM_SIZE,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.goldDark,
    borderWidth: 1.5,
    borderColor: COLORS.energy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costText: { color: COLORS.energy, fontSize: 13, fontWeight: '800' },
  countBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: { color: COLORS.onGold, fontSize: 11, fontWeight: '800' },
  name: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  upgradedName: { color: COLORS.upgraded },
  type: { fontSize: 10, fontWeight: '600' },
  description: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
});
