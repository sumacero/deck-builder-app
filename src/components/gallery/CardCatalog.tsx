import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ALL_CARDS } from '../../data/catalog';
import type { CardDefinition } from '../../domain/card';
import { upgradeCard } from '../../logic/cards';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardDetailSheet } from '../cards/CardDetailSheet';
import { CardView } from '../cards/CardView';

/** すべてのカード。強化後の姿に切り替えられ、タップで詳細（拡大と用語解説）を開く。 */
export function CardCatalog() {
  const [upgraded, setUpgraded] = useState(false);
  const [detail, setDetail] = useState<CardDefinition | null>(null);
  const cards = upgraded ? ALL_CARDS.map(upgradeCard) : ALL_CARDS;
  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Text style={styles.hint}>タップで詳しく見る</Text>
        <Pressable
          onPress={() => setUpgraded(!upgraded)}
          style={({ pressed }) => [styles.toggle, upgraded && styles.toggleOn, pressed && styles.pressed]}
        >
          <Text style={[styles.toggleText, upgraded && styles.toggleTextOn]}>
            {upgraded ? '✓ 強化後' : '強化後を見る'}
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {cards.map((card) => (
          <CardView
            key={card.id}
            card={card}
            onPress={() => setDetail(card)}
            detailOnHold={false}
          />
        ))}
      </ScrollView>
      {detail && <CardDetailSheet card={detail} visible onClose={() => setDetail(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: SPACING.sm },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { color: COLORS.textMuted, fontSize: 12 },
  toggle: {
    borderWidth: 1,
    borderColor: COLORS.upgraded,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  toggleOn: { backgroundColor: COLORS.upgraded },
  toggleText: { color: COLORS.upgraded, fontSize: 13, fontWeight: '800' },
  toggleTextOn: { color: COLORS.onGold },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  pressed: { opacity: 0.7 },
});
