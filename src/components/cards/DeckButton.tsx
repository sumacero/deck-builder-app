import { useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { stackCards } from '../../logic/cards';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { MODAL_ORIENTATIONS } from '../layout/modalOrientations';
import { slotKey } from '../run/acquire/AcquireContext';
import { useAcquireSlot } from '../run/acquire/useAcquireSlot';
import { CardPileModal } from './CardPileModal';

type DeckButtonProps = {
  deck: CardDefinition[];
};

/**
 * 「デッキ N」ボタン。押すとラン全体のデッキを一覧で見られる。
 * RN の Modal で開くので、どの画面のどこに置いても画面全体に重なる。
 * 手に入れたカードはここへ飛んできて、収まると弾む。
 */
export function DeckButton({ deck }: DeckButtonProps) {
  const [open, setOpen] = useState(false);
  const { bindView, scale } = useAcquireSlot(slotKey.deck);
  const close = () => setOpen(false);
  return (
    <>
      <View ref={bindView} collapsable={false}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            onPress={() => setOpen(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.text}>🃏 デッキ {deck.length}</Text>
          </Pressable>
        </Animated.View>
      </View>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        supportedOrientations={MODAL_ORIENTATIONS}
      >
        <CardPileModal title="デッキ" stacks={stackCards(deck)} onClose={close} offerAbandon />
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
