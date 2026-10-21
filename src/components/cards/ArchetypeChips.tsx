import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Archetype } from '../../domain/card';
import { ARCHETYPE_LABEL } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';

type ArchetypeChipsProps = {
  archetypes: readonly Archetype[];
  /** デッキの軸。一致するチップを強調する。 */
  highlight?: Archetype | null;
  /** 雨・波・氷のチップを押したとき。それ以外の軸はラベルのまま。 */
  onSelect?: (archetype: Archetype) => void;
};

const isMark = (archetype: Archetype): boolean =>
  archetype === 'ice' || archetype === 'drop' || archetype === 'mist';

export function ArchetypeChips({ archetypes, highlight = null, onSelect }: ArchetypeChipsProps) {
  if (archetypes.length === 0) return null;
  return (
    <View style={styles.row}>
      {archetypes.map((archetype) => {
        const matched = archetype === highlight;
        const label = `${matched ? '★' : ''}${ARCHETYPE_LABEL[archetype]}`;
        const chipStyle = [styles.chip, matched && styles.matched];
        const text = <Text style={[styles.text, matched && styles.matchedText]}>{label}</Text>;
        if (!onSelect || !isMark(archetype)) {
          return (
            <View key={archetype} style={chipStyle}>
              {text}
            </View>
          );
        }
        return (
          <Pressable
            key={archetype}
            onPress={() => onSelect(archetype)}
            hitSlop={8}
            style={({ pressed }) => [...chipStyle, pressed && styles.pressed]}
          >
            {text}
          </Pressable>
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
  pressed: { opacity: 0.7 },
});
