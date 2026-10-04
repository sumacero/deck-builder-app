import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type ItemInfoProps = {
  icon: string;
  name: string;
  description: string;
  /** ポーションのときだけ渡す。 */
  action?: { label: string; enabled: boolean; onPress: () => void };
  onClose: () => void;
};

/** レリック・ポーションをタップしたときに出す説明。 */
export function ItemInfo({ icon, name, description, action, onClose }: ItemInfoProps) {
  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.buttons}>
        {action && (
          <Pressable
            onPress={action.onPress}
            disabled={!action.enabled}
            style={({ pressed }) => [
              styles.button,
              styles.primary,
              !action.enabled && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>{action.label}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>閉じる</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.panel,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  icon: { fontSize: 20 },
  name: { color: COLORS.gold, fontSize: 15, fontWeight: '800' },
  description: { color: COLORS.text, fontSize: 13, lineHeight: 19 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm },
  button: { borderRadius: RADIUS.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  primary: { backgroundColor: COLORS.gold },
  primaryText: { color: COLORS.onGold, fontSize: 14, fontWeight: '800' },
  secondary: { borderWidth: 1, borderColor: COLORS.panelBorder },
  secondaryText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
