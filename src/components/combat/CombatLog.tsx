import { StyleSheet, Text, View } from 'react-native';
import type { CombatLogEntry } from '../../domain/combat';
import { COLORS, RADIUS, SPACING } from '../../theme';

type CombatLogProps = {
  entries: CombatLogEntry[];
};

const VISIBLE_ENTRIES = 3;

export function CombatLog({ entries }: CombatLogProps) {
  const visible = entries.slice(-VISIBLE_ENTRIES);
  return (
    <View style={styles.container}>
      {visible.map((entry, index) => (
        <Text
          key={entry.id}
          style={[styles.line, { opacity: 0.55 + (0.45 * (index + 1)) / visible.length }]}
          numberOfLines={1}
        >
          {entry.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    overflow: 'hidden',
    backgroundColor: COLORS.panelTranslucent,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
  },
  line: { color: COLORS.text, fontSize: 12, lineHeight: 18, fontWeight: '600' },
});
