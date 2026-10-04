import { StyleSheet, Text, View } from 'react-native';
import type { IntentView } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';

type IntentBadgeProps = {
  intent: IntentView;
  /** 敵が多いときの小さい表示。 */
  compact?: boolean;
};

const TONE_COLOR: Record<IntentView['tone'], string> = {
  attack: COLORS.hp,
  block: COLORS.block,
  buff: COLORS.energy,
};

export function IntentBadge({ intent, compact = false }: IntentBadgeProps) {
  const color = TONE_COLOR[intent.tone];
  return (
    <View
      style={[
        styles.badge,
        compact && styles.compactBadge,
        { borderColor: color, backgroundColor: `${color}33` },
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText]}>
        {intent.icon}
        {compact ? '' : ' '}
        {intent.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  compactBadge: { paddingHorizontal: SPACING.xs, paddingVertical: 1 },
  text: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  compactText: { fontSize: 12 },
});
