import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RunState } from '../../domain/run';
import type { ShopStock } from '../../domain/shop';
import { useMusic } from '../../hooks/useMusic';
import type { ShopActions } from '../../hooks/useRun';
import { stackCards } from '../../logic/cards';
import { describeCard, describePotion, describeRelic } from '../../logic/describe';
import { canAfford, hasEmptyPotionSlot } from '../../logic/shop';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardPickerModal } from '../cards/CardPickerModal';
import { DeckButton } from '../cards/DeckButton';
import { ItemBar } from '../items/ItemBar';
import { GoldBadge } from '../run/GoldBadge';
import { ShopCardOffer } from './ShopCardOffer';
import { ShopRow } from './ShopRow';

type ShopScreenProps = {
  run: RunState;
  stock: ShopStock;
  actions: ShopActions;
};

type Selection = { kind: 'card' | 'relic' | 'potion'; offerId: string };

type Purchase = { name: string; detail: string; price: number; blocked: string | null };

/** ショップ。商品をタップで選び、下のバーの「購入」で買う。 */
export function ShopScreen({ run, stock, actions }: ShopScreenProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [removing, setRemoving] = useState(false);
  useMusic('shop');
  const purchase = selection ? describePurchase(selection) : null;

  const buy = () => {
    if (!selection) return;
    if (selection.kind === 'card') actions.buyCard(selection.offerId);
    else if (selection.kind === 'relic') actions.buyRelic(selection.offerId);
    else actions.buyPotion(selection.offerId);
    setSelection(null);
  };

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <ItemBar relics={run.relics} potions={run.potions} />
        <View style={styles.header}>
          <Text style={styles.title}>ショップ</Text>
          <View style={styles.headerRight}>
            <GoldBadge gold={run.gold} />
            <DeckButton deck={run.deck} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>カード</Text>
        <View style={styles.cards}>
          {stock.cards.map((offer) => (
            <ShopCardOffer
              key={offer.offerId}
              offer={offer}
              affordable={canAfford(run, offer.price)}
              selected={selection?.offerId === offer.offerId}
              onPress={() => setSelection({ kind: 'card', offerId: offer.offerId })}
            />
          ))}
        </View>

        {stock.relics.length > 0 && <Text style={styles.section}>レリック</Text>}
        {stock.relics.map((offer) => (
          <ShopRow
            key={offer.offerId}
            icon={offer.item.icon}
            name={offer.item.name}
            description={describeRelic(offer.item)}
            price={offer.price}
            affordable={canAfford(run, offer.price)}
            sold={offer.sold}
            selected={selection?.offerId === offer.offerId}
            onPress={() => setSelection({ kind: 'relic', offerId: offer.offerId })}
          />
        ))}

        <Text style={styles.section}>ポーション</Text>
        {stock.potions.map((offer) => (
          <ShopRow
            key={offer.offerId}
            icon={offer.item.icon}
            name={offer.item.name}
            description={describePotion(offer.item)}
            price={offer.price}
            affordable={canAfford(run, offer.price)}
            sold={offer.sold}
            selected={selection?.offerId === offer.offerId}
            onPress={() => setSelection({ kind: 'potion', offerId: offer.offerId })}
          />
        ))}

        <Text style={styles.section}>サービス</Text>
        <ShopRow
          icon="✂️"
          name="カード削除"
          description="デッキからカードを 1 枚取り除く。"
          price={stock.removal.price}
          affordable={canAfford(run, stock.removal.price)}
          sold={stock.removal.used}
          onPress={() => {
            setSelection(null);
            if (canAfford(run, stock.removal.price)) setRemoving(true);
          }}
        />
      </ScrollView>

      <View style={styles.bar}>
        {purchase && (
          <View style={styles.purchase}>
            <View style={styles.purchaseText}>
              <Text style={styles.purchaseName}>{purchase.name}</Text>
              <Text style={styles.purchaseDetail} numberOfLines={2}>
                {purchase.blocked ?? purchase.detail}
              </Text>
            </View>
            <Pressable
              onPress={buy}
              disabled={purchase.blocked !== null}
              style={({ pressed }) => [
                styles.buyButton,
                purchase.blocked !== null && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buyText}>購入 🪙{purchase.price}</Text>
            </Pressable>
          </View>
        )}
        <Pressable
          onPress={actions.leave}
          style={({ pressed }) => [styles.leave, pressed && styles.pressed]}
        >
          <Text style={styles.leaveText}>立ち去る</Text>
        </Pressable>
      </View>

      {removing && (
        <CardPickerModal
          title={`削除するカードを選ぶ（🪙${stock.removal.price}）`}
          stacks={stackCards(run.deck)}
          confirmLabel="削除する"
          onConfirm={(card) => {
            actions.removeCard(card.id);
            setRemoving(false);
          }}
          onCancel={() => setRemoving(false)}
        />
      )}
    </View>
  );

  function describePurchase(sel: Selection): Purchase | null {
    if (sel.kind === 'card') {
      const offer = stock.cards.find((o) => o.offerId === sel.offerId);
      if (!offer || offer.sold) return null;
      return {
        name: offer.item.name,
        detail: describeCard(offer.item),
        price: offer.price,
        blocked: canAfford(run, offer.price) ? null : 'ゴールドが足りない',
      };
    }
    if (sel.kind === 'relic') {
      const offer = stock.relics.find((o) => o.offerId === sel.offerId);
      if (!offer || offer.sold) return null;
      return {
        name: offer.item.name,
        detail: describeRelic(offer.item),
        price: offer.price,
        blocked: canAfford(run, offer.price) ? null : 'ゴールドが足りない',
      };
    }
    const offer = stock.potions.find((o) => o.offerId === sel.offerId);
    if (!offer || offer.sold) return null;
    const blocked = !canAfford(run, offer.price)
      ? 'ゴールドが足りない'
      : !hasEmptyPotionSlot(run)
        ? 'ポーション枠に空きがない'
        : null;
    return { name: offer.item.name, detail: describePotion(offer.item), price: offer.price, blocked };
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hud: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, gap: SPACING.sm, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  title: { color: COLORS.gold, fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  content: { padding: SPACING.lg, gap: SPACING.md },
  section: { color: COLORS.textMuted, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.sm,
  },
  bar: {
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.panelBorder,
    backgroundColor: COLORS.panel,
  },
  purchase: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  purchaseText: { flex: 1, gap: 2 },
  purchaseName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  purchaseDetail: { color: COLORS.textMuted, fontSize: 12 },
  buyButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  buyText: { color: COLORS.onGold, fontSize: 15, fontWeight: '800' },
  leave: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  leaveText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
