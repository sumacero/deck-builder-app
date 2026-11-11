import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition, CardStack } from '../../domain/card';
import { cardStackKey } from '../../logic/cards';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardGlossaryPopover, useGlossaryAnchor, type WindowRect } from '../glossary/CardGlossaryPopover';
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
  const [anchor, setAnchor] = useState<WindowRect | null>(null);
  const remeasure = useRef<(() => void) | null>(null);
  const rememberMeasure = useCallback((measure: () => void) => {
    remeasure.current = measure;
  }, []);
  const selected = stacks.find((stack) => cardStackKey(stack.card) === selectedKey)?.card;

  // 強化のように変化を見せるときは、一覧と確認を分ける。確認の取り消しは一覧へ戻す。
  if (selected && preview) {
    const after = preview(selected);
    return (
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView horizontal contentContainerStyle={styles.preview}>
            <PickerCard
              card={selected}
              armed
              onAnchor={setAnchor}
              onMeasure={rememberMeasure}
            />
            <Text style={styles.arrow}>→</Text>
            <CardView card={after} size="md" />
          </ScrollView>
          <View style={styles.buttons}>
            <Pressable
              onPress={() => setSelectedKey(null)}
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>戻る</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(selected)}
              style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
        {anchor && <CardGlossaryPopover card={selected} anchor={anchor} />}
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <ScrollView
          contentContainerStyle={styles.grid}
          onScroll={() => remeasure.current?.()}
          scrollEventThrottle={16}
        >
          {stacks.length === 0 ? (
            <Text style={styles.empty}>選べるカードがありません</Text>
          ) : (
            stacks.map((stack) => {
              const key = cardStackKey(stack.card);
              const armed = !preview && key === selectedKey;
              return (
                <PickerCard
                  key={key}
                  card={stack.card}
                  count={stack.count}
                  armed={armed}
                  onPress={() => {
                    if (armed) onConfirm(stack.card);
                    else {
                      setAnchor(null);
                      setSelectedKey(key);
                    }
                  }}
                  onAnchor={armed ? setAnchor : undefined}
                  onMeasure={armed ? rememberMeasure : undefined}
                />
              );
            })
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
          {!preview && (
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
          )}
        </View>
      </View>
      {selected && anchor && <CardGlossaryPopover card={selected} anchor={anchor} />}
    </View>
  );
}

function PickerCard({
  card,
  count,
  armed,
  onPress,
  onAnchor,
  onMeasure,
}: {
  card: CardDefinition;
  count?: number;
  armed: boolean;
  onPress?: () => void;
  onAnchor?: (rect: WindowRect) => void;
  onMeasure?: (measure: () => void) => void;
}) {
  const { ref, measure } = useGlossaryAnchor(armed && onAnchor !== undefined, onAnchor ?? (() => {}));
  useEffect(() => {
    if (measure && onMeasure) onMeasure(measure);
  }, [measure, onMeasure]);
  return (
    <View ref={ref} collapsable={false} onLayout={() => measure?.()}>
      <CardView card={card} count={count} selected={armed} onPress={onPress} />
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
