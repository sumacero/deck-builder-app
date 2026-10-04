import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type ItemInfoProps = {
  icon: string;
  name: string;
  description: string;
  /** ポーションのときだけ渡す。 */
  action?: { label: string; enabled: boolean; onPress: () => void };
  /** ポーションを捨てる。取り消せないので、1 回目は確認だけ。 */
  onDiscard?: () => void;
  onClose: () => void;
};

/** レリック・ポーションをタップしたときに出す説明。 */
export function ItemInfo({ icon, name, description, action, onDiscard, onClose }: ItemInfoProps) {
  const [confirming, setConfirming] = useState(false);
  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.buttons}>
        {onDiscard && (
          <Pressable
            onPress={confirming ? onDiscard : () => setConfirming(true)}
            style={({ pressed }) => [
              styles.button,
              styles.danger,
              confirming && styles.dangerConfirm,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.dangerText}>{confirming ? '本当に捨てる' : '捨てる'}</Text>
          </Pressable>
        )}
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
  danger: { borderWidth: 1, borderColor: COLORS.danger, marginRight: 'auto' },
  dangerConfirm: { backgroundColor: COLORS.danger },
  dangerText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
