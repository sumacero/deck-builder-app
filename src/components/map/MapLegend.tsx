import { StyleSheet, Text, View } from 'react-native';
import type { MapNodeType } from '../../domain/map';
import { MAP_NODE_LABEL } from '../../logic/describe';
import { COLORS, SPACING } from '../../theme';
import { MAP_NODE_ICON } from './nodeIcons';

const ITEMS: MapNodeType[] = ['enemy', 'elite', 'rest', 'shop', 'event', 'treasure', 'boss'];

type MapLegendProps = {
  /** 横向きの左の列に置くとき。余白を詰めて左寄せにする。 */
  compact?: boolean;
};

export function MapLegend({ compact = false }: MapLegendProps) {
  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      {ITEMS.map((type) => (
        <Text key={type} style={styles.item}>
          {MAP_NODE_ICON[type]} {MAP_NODE_LABEL[type]}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  compactRow: { justifyContent: 'flex-start', paddingHorizontal: 0, paddingVertical: 0 },
  item: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
});
