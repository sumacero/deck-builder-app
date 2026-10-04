import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { MODAL_ORIENTATIONS } from '../layout/modalOrientations';
import { Encyclopedia } from './Encyclopedia';

type GalleryButtonProps = {
  /** タイトル画面用の大きいボタン。 */
  large?: boolean;
};

/** 「図鑑」ボタン。押すとキャラ・カード・レリックなどすべてを見られる図鑑を全画面で開く。 */
export function GalleryButton({ large = false }: GalleryButtonProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={({ pressed }) => [
          styles.button,
          large && styles.largeButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.text, large && styles.largeText]}>📖 図鑑</Text>
      </Pressable>
      <Modal
        visible={open}
        animationType="fade"
        onRequestClose={close}
        supportedOrientations={MODAL_ORIENTATIONS}
      >
        <SafeAreaView style={styles.safeArea}>
          {open && <Encyclopedia onClose={close} />}
        </SafeAreaView>
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
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  pressed: { opacity: 0.7 },
});
