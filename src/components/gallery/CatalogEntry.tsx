import { StyleSheet, Text, View } from 'react-native';
import type { EffectLine } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';

type CatalogEntryProps = {
  icon?: string;
  title: string;
  /** 名前の右に添える小さな札（「ボス」など）。 */
  badge?: string;
  /** 説明文（イベントの導入文など）。 */
  text?: string;
  /** 効果の行。negative は代償（赤字）。 */
  lines?: EffectLine[];
};

/** 図鑑の 1 項目（アイコン・名前・説明・効果）。レリック・ポーション・イベント・恩恵で使い回す。 */
export function CatalogEntry({ icon, title, badge, text, lines = [] }: CatalogEntryProps) {
  return (
    <View style={styles.entry}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        {text ? <Text style={styles.text}>{text}</Text> : null}
        {lines.map((line, index) => (
          <Text key={index} style={[styles.line, line.negative && styles.negative]}>
            {line.negative ? '▼ ' : '◆ '}
            {line.text}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  icon: { fontSize: 30 },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { color: COLORS.gold, fontSize: 15, fontWeight: '800' },
  badge: {
    color: COLORS.text,
    backgroundColor: COLORS.danger,
    fontSize: 10,
    fontWeight: '800',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    paddingHorizontal: SPACING.xs,
  },
  text: { color: COLORS.text, fontSize: 12, lineHeight: 18 },
  line: { color: COLORS.textMuted, fontSize: 12 },
  negative: { color: COLORS.damageText },
});
