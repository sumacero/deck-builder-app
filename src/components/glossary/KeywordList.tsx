import { StyleSheet, Text, View } from 'react-native';
import { KEYWORDS } from '../../data/glossary';
import type { KeywordId } from '../../domain/glossary';
import { COLORS, RADIUS, SPACING } from '../../theme';

export type KeywordEntry = {
  keyword: KeywordId;
  /** 状態の量（筋力 3 など）。用語の解説だけなら省略。 */
  value?: number;
};

type KeywordListProps = {
  entries: KeywordEntry[];
};

/** 用語ごとに「アイコン・名前（量）・解説」を並べる。 */
export function KeywordList({ entries }: KeywordListProps) {
  return (
    <View style={styles.list}>
      {entries.map(({ keyword, value }) => {
        const definition = KEYWORDS[keyword];
        return (
          <View key={keyword} style={styles.item}>
            <Text style={styles.name}>
              {definition.icon} {definition.name}
              {value !== undefined && <Text style={styles.value}>  {value}</Text>}
            </Text>
            <Text style={styles.description}>{definition.description}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.sm },
  item: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  name: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  value: { color: COLORS.text, fontWeight: '800' },
  description: { color: COLORS.text, fontSize: 13, lineHeight: 19 },
});
