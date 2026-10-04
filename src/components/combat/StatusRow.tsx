import { StyleSheet, Text, View } from 'react-native';
import { KEYWORDS } from '../../data/glossary';
import type { StatusView } from '../../domain/glossary';
import { COLORS, RADIUS, SPACING } from '../../theme';

type StatusRowProps = {
  statuses: StatusView[];
};

/** キャラの下に並べる状態アイコン。ブロックは HP バーに出ているのでここでは省く。 */
export function StatusRow({ statuses }: StatusRowProps) {
  const shown = statuses.filter((status) => status.keyword !== 'block');
  if (shown.length === 0) return null;
  return (
    <View style={styles.row}>
      {shown.map(({ keyword, value }) => (
        <View key={keyword} style={styles.chip}>
          <Text style={styles.text}>
            {KEYWORDS[keyword].icon}
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs },
  chip: {
    backgroundColor: COLORS.panelTranslucent,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 1,
  },
  text: { color: COLORS.text, fontSize: 12, fontWeight: '800' },
});
