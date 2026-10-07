import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { MODAL_ORIENTATIONS } from '../layout/modalOrientations';
import { SettingsScreen } from './SettingsScreen';

type SettingsButtonProps = {
  /** タイトル画面用の大きいボタン。 */
  large?: boolean;
};

/** 「設定」ボタン。押すと BGM と効果音の音量を変える画面を開く。 */
export function SettingsButton({ large = false }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={({ pressed }) => [styles.button, large && styles.largeButton, pressed && styles.pressed]}
      >
        <Text style={[styles.text, large && styles.largeText]}>⚙ 設定</Text>
      </Pressable>
      <Modal visible={open} animationType="fade" onRequestClose={close} supportedOrientations={MODAL_ORIENTATIONS}>
        <SafeAreaView style={styles.safeArea}>{open && <SettingsScreen onClose={close} />}</SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.panelTranslucent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  largeButton: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  text: { color: COLORS.gold, fontSize: 12, fontWeight: '800' },
  largeText: { fontSize: 15, letterSpacing: 2 },
  safeArea: { flex: 1, width: '100%', backgroundColor: COLORS.bg, overflow: 'hidden' },
  pressed: { opacity: 0.7 },
});
