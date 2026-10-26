import { StyleSheet, Text, View } from 'react-native';
import type { Archetype } from '../../domain/card';
import { ARCHETYPE_LABEL } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';

type ArchetypeChipsProps = {
  archetypes: readonly Archetype[];
  /** デッキの軸。一致するチップを強調する。 */
  highlight?: Archetype | null;
};

export function ArchetypeChips({ archetypes, highlight = null }: ArchetypeChipsProps) {
  if (archetypes.length === 0) return null;
  return (
    <View style={styles.row}>
      {archetypes.map((archetype) => {
        const matched = archetype === highlight;
        return (
          <View key={archetype} style={[styles.chip, matched && styles.matched]}>
            <Text style={[styles.text, matched && styles.matchedText]}>
              {matched ? '★' : ''}
              {ARCHETYPE_LABEL[archetype]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    backgroundColor: COLORS.panel,
  },
  matched: { borderColor: COLORS.gold },
  text: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  matchedText: { color: COLORS.gold },
});
