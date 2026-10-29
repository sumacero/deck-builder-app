import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition, CardStack } from '../../domain/card';
import { cardStackKey } from '../../logic/cards';
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
  /** 無いときは、選ばずに戻るボタンを出さない。 */
  onCancel?: () => void;
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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = stacks.find((stack) => cardStackKey(stack.card) === selectedKey)?.card;
  const listRef = useRef<{ scrollToEnd: (options?: { animated?: boolean }) => void } | null>(null);

  // 強化前と強化後を一覧の下に出す。ボタンは一覧の外に固定し、選んでも画面の外へ押し出さない。
  useEffect(() => {
    if (selectedKey === null) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [selectedKey]);

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <ScrollView
          ref={(node) => {
            listRef.current = node;
          }}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {stacks.length === 0 ? (
            <Text style={styles.empty}>選べるカードがありません</Text>
          ) : (
            <View style={styles.grid}>
              {stacks.map((stack) => {
                const key = cardStackKey(stack.card);
                return (
                  <CardView
                    key={key}
                    card={stack.card}
                    count={stack.count}
                    selected={key === selectedKey}
                    onPress={() => setSelectedKey((current) => (current === key ? null : key))}
                  />
                );
              })}
            </View>
          )}
          {selected && preview && (
            <View style={styles.preview}>
              <CardView card={selected} detailOnHold={false} />
              <Text style={styles.arrow}>→</Text>
              <CardView card={preview(selected)} detailOnHold={false} />
            </View>
          )}
        </ScrollView>

        <View style={styles.buttons}>
          {onCancel && (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
          )}
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
    overflow: 'hidden',
    backgroundColor: COLORS.panel,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  title: { color: COLORS.gold, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  note: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  list: { flex: 1, minHeight: 0 },
  listContent: { gap: SPACING.md, paddingVertical: SPACING.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
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
  buttons: { flexDirection: 'row', flexShrink: 0, gap: SPACING.md },
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
