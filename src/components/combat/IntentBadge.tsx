import { StyleSheet, Text, View } from 'react-native';
import type { IntentView } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';

type IntentBadgeProps = {
  intent: IntentView;
};

const TONE_COLOR: Record<IntentView['tone'], string> = {
  attack: COLORS.hp,
  block: COLORS.block,
  buff: COLORS.energy,
};

export function IntentBadge({ intent }: IntentBadgeProps) {
  const color = TONE_COLOR[intent.tone];
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}33` }]}>
      <Text style={styles.text}>
        {intent.icon} {intent.label}
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
  text: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
});
