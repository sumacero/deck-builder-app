import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ALL_AGENTS } from '../../data/agents';
import { ALL_CARDS } from '../../data/catalog';
import type { CardDefinition } from '../../domain/card';
import { upgradeCard } from '../../logic/cards';
import { cardCatalogGroup, type CardCatalogGroup } from '../../logic/cardCatalog';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardDetailSheet } from '../cards/CardDetailSheet';
import { CardView } from '../cards/CardView';

type GroupChoice = { id: CardCatalogGroup; label: string; hint: string };

const givenName = (name: string) => name.split('の').pop() ?? name;

const GROUPS: readonly GroupChoice[] = [
  { id: 'shared', label: '共通', hint: '共通のカード' },
  ...ALL_AGENTS.map((agent) => ({
    id: agent.attribute,
    label: `${agent.icon} ${givenName(agent.name)}`,
    hint: `${agent.name}のカード`,
  })),
];

/** キャラごとのカードと、共通のカードを切り替えて見る。タップで詳細を開く。 */
export function CardCatalog() {
  const [group, setGroup] = useState<CardCatalogGroup>('shared');
  const [upgraded, setUpgraded] = useState(false);
  const [detail, setDetail] = useState<CardDefinition | null>(null);
  const source = upgraded ? ALL_CARDS.map(upgradeCard) : ALL_CARDS;
  const cards = source.filter((card) => cardCatalogGroup(card) === group);
  const choice = GROUPS.find((item) => item.id === group) ?? GROUPS[0];
  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterScroll}
      >
        {GROUPS.map((item) => {
          const active = item.id === group;
          const count = source.filter((card) => cardCatalogGroup(card) === item.id).length;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setGroup(item.id);
                setDetail(null);
              }}
              style={({ pressed }) => [styles.filter, active && styles.filterOn, pressed && styles.pressed]}
            >
              <Text style={[styles.filterText, active && styles.filterTextOn]}>
                {item.label} {count}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.toolbar}>
        <Text style={styles.hint}>
          {choice.hint} {cards.length} 枚 · タップで詳しく見る
        </Text>
        <Pressable
          onPress={() => setUpgraded(!upgraded)}
          style={({ pressed }) => [styles.toggle, upgraded && styles.toggleOn, pressed && styles.pressed]}
        >
          <Text style={[styles.toggleText, upgraded && styles.toggleTextOn]}>
            {upgraded ? '✓ 強化後' : '強化後を見る'}
          </Text>
        </Pressable>
      </View>
      <ScrollView
        key={group}
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        nestedScrollEnabled
      >
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
  root: { flex: 1, minHeight: 0, gap: SPACING.sm },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filters: { gap: SPACING.sm, paddingRight: SPACING.sm },
  filter: {
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  filterOn: { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  filterText: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  filterTextOn: { color: COLORS.onGold },
  /** 親が flex:1 のとき高さ 0 に潰れてカードが消えないよう伸ばす（Web は minHeight:0 が必要）。 */
  scroll: { flex: 1, minHeight: 0 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: SPACING.sm },
  hint: { color: COLORS.textMuted, fontSize: 12, flexShrink: 1 },
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
    flexGrow: 1,
  },
  pressed: { opacity: 0.7 },
});
