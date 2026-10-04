import { StyleSheet, Text, View } from 'react-native';
import type { MapNodeType } from '../../domain/map';
import { MAP_NODE_LABEL } from '../../logic/describe';
import { COLORS, SPACING } from '../../theme';
import { MAP_NODE_ICON } from './nodeIcons';

const ITEMS: MapNodeType[] = ['enemy', 'elite', 'rest', 'shop', 'event', 'treasure', 'boss'];

export function MapLegend() {
  return (
    <View style={styles.row}>
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
  item: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
});
