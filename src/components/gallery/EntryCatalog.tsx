import { ScrollView, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../../theme';
import { CatalogEntry } from './CatalogEntry';
import type { CatalogItem } from './catalogEntries';

type EntryCatalogProps = {
  items: CatalogItem[];
  /** 一覧の上に添える説明。 */
  note?: string;
};

/** レリック・ポーション・イベント・恩恵の一覧（縦に並べてスクロール）。 */
export function EntryCatalog({ items, note }: EntryCatalogProps) {
  return (
    <ScrollView contentContainerStyle={styles.list}>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {items.map(({ key, ...item }) => (
        <CatalogEntry key={key} {...item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.sm, paddingVertical: SPACING.sm },
  note: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
});
