import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PotionSlot } from '../../domain/combat';
import { COLORS, RADIUS } from '../../theme';

type PotionSlotViewProps = {
  potion: PotionSlot;
  selected: boolean;
  onPress: () => void;
};

export function PotionSlotView({ potion, selected, onPress }: PotionSlotViewProps) {
  if (!potion) return <View style={[styles.slot, styles.empty]} />;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.slot, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{potion.icon}</Text>
    </Pressable>
  );
}

const SIZE = 34;

const styles = StyleSheet.create({
  slot: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { borderStyle: 'dashed', borderColor: COLORS.panelBorder, backgroundColor: 'transparent' },
  selected: { borderColor: COLORS.gold },
  pressed: { opacity: 0.7 },
  emoji: { fontSize: 18 },
});
