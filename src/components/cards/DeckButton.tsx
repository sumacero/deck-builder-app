import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { stackCards } from '../../logic/cards';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { MODAL_ORIENTATIONS } from '../layout/modalOrientations';
import { CardPileModal } from './CardPileModal';

type DeckButtonProps = {
  deck: CardDefinition[];
};

/**
 * 「デッキ N」ボタン。押すとラン全体のデッキを一覧で見られる。
 * RN の Modal で開くので、どの画面のどこに置いても画面全体に重なる。
 */
export function DeckButton({ deck }: DeckButtonProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.text}>🃏 デッキ {deck.length}</Text>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        supportedOrientations={MODAL_ORIENTATIONS}
      >
        <CardPileModal title="デッキ" stacks={stackCards(deck)} onClose={close} />
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
  text: { color: COLORS.gold, fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
