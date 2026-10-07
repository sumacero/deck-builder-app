import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition, CardStack } from '../../domain/card';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { AbandonRunConfirm, AbandonRunPressable, useAbandonPrompt } from '../run/AbandonRun';
import { CardDetailSheet } from './CardDetailSheet';
import { CardView } from './CardView';

type CardPileModalProps = {
  title: string;
  note?: string;
  stacks: CardStack[];
  onClose: () => void;
  /**
   * デッキ一覧は画面全体を覆う小窓なので、上端の「あきらめる」が隠れる。
   * 戦闘中の山札・捨て札は小窓の外にボタンが残るので、こちらでは出さない。
   */
  offerAbandon?: boolean;
};

/** 山札・捨て札・デッキ全体の中身を見るオーバーレイ。カードをタップすると詳細（拡大と用語解説）を開く。 */
export function CardPileModal({ title, note, stacks, onClose, offerAbandon = false }: CardPileModalProps) {
  const [detail, setDetail] = useState<CardDefinition | null>(null);
  const abandon = useAbandonPrompt();
  const showAbandon = offerAbandon && abandon.available;
  const total = stacks.reduce((sum, stack) => sum + stack.count, 0);
  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>
          {title}（{total}）
        </Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <ScrollView contentContainerStyle={styles.grid}>
          {stacks.length === 0 ? (
            <Text style={styles.empty}>カードがありません</Text>
          ) : (
            stacks.map((stack) => (
              <CardView
                key={stack.card.id}
                card={stack.card}
                count={stack.count}
                onPress={() => setDetail(stack.card)}
                detailOnHold={false}
              />
            ))
          )}
        </ScrollView>
        {showAbandon && <AbandonRunPressable onPress={abandon.ask} />}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>閉じる</Text>
        </Pressable>
      </View>
      {detail && <CardDetailSheet card={detail} visible onClose={() => setDetail(null)} />}
      {showAbandon && abandon.asking && (
        <AbandonRunConfirm onStay={abandon.stay} onLeave={abandon.leave} />
      )}
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
    maxHeight: '88%',
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
  close: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  closeText: { color: COLORS.onGold, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
