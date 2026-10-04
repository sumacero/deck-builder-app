import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type RunEndOverlayProps = {
  kind: 'gameOver' | 'cleared';
  onNewRun: () => void;
};

export function RunEndOverlay({ kind, onNewRun }: RunEndOverlayProps) {
  const cleared = kind === 'cleared';
  return (
    <View style={styles.overlay}>
      <Text style={[styles.title, { color: cleared ? COLORS.gold : COLORS.danger }]}>
        {cleared ? '踏破' : '敗北'}
      </Text>
      <Text style={styles.subtitle}>
        {cleared ? 'すべての章を踏破した！' : 'あなたは力尽きた…'}
      </Text>
      <Pressable
        onPress={onNewRun}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>新しいラン</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  title: { fontSize: 44, fontWeight: '900', letterSpacing: 8 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  button: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
