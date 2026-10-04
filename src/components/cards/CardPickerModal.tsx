import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition, CardStack } from '../../domain/card';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardView } from './CardView';

type CardPickerModalProps = {
  title: string;
  note?: string;
  stacks: CardStack[];
  confirmLabel: string;
  cancelLabel?: string;
  /** 渡すと、選んだカードがどう変わるか（変更前 → 変更後）を表示する。 */
  preview?: (card: CardDefinition) => CardDefinition;
  onConfirm: (card: CardDefinition) => void;
  onCancel: () => void;
};

/** デッキから 1 枚選ばせるオーバーレイ。誤タップ防止のため、選んでから決定ボタンで確定する。 */
export function CardPickerModal({
  title,
  note,
  stacks,
  confirmLabel,
  cancelLabel = 'やめる',
  preview,
  onConfirm,
  onCancel,
}: CardPickerModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = stacks.find((stack) => stack.card.id === selectedId)?.card;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <ScrollView contentContainerStyle={styles.grid}>
          {stacks.length === 0 ? (
            <Text style={styles.empty}>選べるカードがありません</Text>
          ) : (
            stacks.map((stack) => (
              <CardView
                key={stack.card.id}
                card={stack.card}
                count={stack.count}
                selected={stack.card.id === selectedId}
                onPress={() => setSelectedId(stack.card.id)}
              />
            ))
          )}
        </ScrollView>

        {selected && preview && (
          <View style={styles.preview}>
            <CardView card={selected} />
            <Text style={styles.arrow}>→</Text>
            <CardView card={preview(selected)} />
          </View>
        )}

        <View style={styles.buttons}>
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => selected && onConfirm(selected)}
            disabled={!selected}
            style={({ pressed }) => [
              styles.button,
              styles.confirm,
              !selected && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
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
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  sheet: {
    flex: 1,
    maxHeight: '92%',
    backgroundColor: COLORS.panel,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  title: { color: COLORS.gold, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  note: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  empty: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.xl },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.panelBorder,
  },
  arrow: { color: COLORS.gold, fontSize: 22, fontWeight: '800' },
  buttons: { flexDirection: 'row', gap: SPACING.md },
  button: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancel: { borderWidth: 1, borderColor: COLORS.panelBorder },
  cancelText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  confirm: { backgroundColor: COLORS.gold },
  confirmText: { color: COLORS.onGold, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
