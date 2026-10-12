import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { PotionSlot } from '../../domain/combat';
import type { PotionDefinition } from '../../domain/potion';
import type { RelicDefinition } from '../../domain/relic';
import { mainArchetype } from '../../logic/archetype';
import { ARCHETYPE_LABEL, describePotion } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { ArchetypeChips } from '../cards/ArchetypeChips';
import { CardView } from '../cards/CardView';
import { MarkPreviewSheet } from '../cards/MarkPreviewSheet';
import { DeckButton } from '../cards/DeckButton';
import { SettingsButton } from '../settings/SettingsButton';
import { RelicCard } from '../items/RelicCard';
import { ScreenScroll } from '../layout/ScreenScroll';

type RewardScreenProps = {
  choices: CardDefinition[];
  /** この戦闘で得たゴールド（もう所持金に入っている）。0 なら表示しない。 */
  gold: number;
  /** 手に入れたレリック（もう所持品に入っている）。 */
  relic: RelicDefinition | null;
  /** この戦闘のポーション。pending のあいだはまだ枠に入っていない。 */
  potion: PotionDefinition | null;
  /** 枠が埋まっていて、使う・入れ替える・置いていくを選ぶ。 */
  potionPending: boolean;
  /** 入れ替え先になる、今持っているポーション。 */
  potions: PotionSlot[];
  /** 今飲んで増える HP。null なら戦闘の外では効かない。0 なら HP が満タン。 */
  potionHeal: number | null;
  onUsePotion: () => void;
  onSwapPotion: (slot: number) => void;
  onDeclinePotion: () => void;
  /** ボス撃破後は、選んだあとボスレリックの 3 択へ進む。 */
  toBossRelic: boolean;
  /** 今のデッキ。選ぶ前に見比べられるように。 */
  deck: CardDefinition[];
  onPick: (card: CardDefinition | null) => void;
};

export function RewardScreen({
  choices,
  gold,
  relic,
  potion,
  potionPending,
  potions,
  potionHeal,
  onUsePotion,
  onSwapPotion,
  onDeclinePotion,
  toBossRelic,
  deck,
  onPick,
}: RewardScreenProps) {
  const archetype = mainArchetype(deck);
  const [preview, setPreview] = useState<CardDefinition | null>(null);
  return (
    <ScreenScroll contentStyle={styles.root}>
      <View style={styles.corner}>
        <SettingsButton />
        <DeckButton deck={deck} />
      </View>
      {gold > 0 && <Text style={styles.gold}>🪙 +{gold} ゴールド</Text>}
      {relic && <RelicCard relic={relic} caption="レリック獲得" />}
      {potion && !potionPending && (
        <View style={styles.potion}>
          <Text style={styles.potionIcon}>{potion.icon}</Text>
          <View style={styles.potionBody}>
            <Text style={styles.potionName}>ポーション獲得: {potion.name}</Text>
            <Text style={styles.potionText}>{describePotion(potion)}</Text>
          </View>
        </View>
      )}
      {potion && potionPending && (
        <PendingPotion
          potion={potion}
          potions={potions}
          heal={potionHeal}
          onUse={onUsePotion}
          onSwap={onSwapPotion}
          onDecline={onDeclinePotion}
        />
      )}
      <Text style={styles.title}>カード報酬</Text>
      <Text style={styles.subtitle}>1 枚選んでデッキに加える</Text>
      {archetype && (
        <Text style={styles.archetype}>今のデッキの軸: {ARCHETYPE_LABEL[archetype]}</Text>
      )}
      {potionPending && <Text style={styles.note}>ポーションを先に決めよう</Text>}
      <View style={[styles.row, potionPending && styles.locked]} pointerEvents={potionPending ? 'none' : 'auto'}>
        {choices.map((card) => (
          <View key={card.id} style={styles.choice}>
            <CardView card={card} size="md" onPress={potionPending ? undefined : () => onPick(card)} />
            <ArchetypeChips
              archetypes={card.archetypes ?? []}
              highlight={archetype}
              onSelect={(selected) => {
                if (card.mark === selected) setPreview(card);
              }}
            />
          </View>
        ))}
      </View>
      <Pressable
        onPress={() => onPick(null)}
        disabled={potionPending}
        style={({ pressed }) => [styles.skip, potionPending && styles.locked, pressed && styles.pressed]}
      >
        <Text style={styles.skipText}>スキップ</Text>
      </Pressable>
      {toBossRelic && <Text style={styles.note}>このあとボスの宝箱からレリックを選べる</Text>}
      <MarkPreviewSheet card={preview} onClose={() => setPreview(null)} />
    </ScreenScroll>
  );
}

type PendingPotionProps = {
  potion: PotionDefinition;
  potions: PotionSlot[];
  heal: number | null;
  onUse: () => void;
  onSwap: (slot: number) => void;
  onDecline: () => void;
};

/** 枠が埋まっているときのポーション。回復できるときだけその場で飲めて、持っているものと入れ替えられる。 */
function PendingPotion({ potion, potions, heal, onUse, onSwap, onDecline }: PendingPotionProps) {
  const [replacing, setReplacing] = useState(false);
  const held = potions.flatMap((current, slot) => (current ? [{ current, slot }] : []));
  return (
    <View style={styles.potionColumn}>
      <View style={styles.potion}>
        <Text style={styles.potionIcon}>{potion.icon}</Text>
        <View style={styles.potionBody}>
          <Text style={styles.potionName}>{potion.name}</Text>
          <Text style={styles.potionText}>{describePotion(potion)}</Text>
          <Text style={styles.potionText}>枠がいっぱいです</Text>
          {heal === 0 && <Text style={styles.potionText}>HPは満タン</Text>}
        </View>
      </View>
      {replacing ? (
        <View style={styles.swapList}>
          <Text style={styles.note}>どれと入れ替える</Text>
          {held.map(({ current, slot }) => (
            <Pressable
              key={slot}
              onPress={() => onSwap(slot)}
              style={({ pressed }) => [styles.swapRow, pressed && styles.pressed]}
            >
              <Text style={styles.potionIcon}>{current.icon}</Text>
              <View style={styles.potionBody}>
                <Text style={styles.potionName}>{current.name}</Text>
                <Text style={styles.potionText}>{describePotion(current)}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable onPress={() => setReplacing(false)} style={({ pressed }) => [styles.decline, pressed && styles.pressed]}>
            <Text style={styles.skipText}>やめる</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          {heal !== null && heal > 0 && (
            <Pressable
              onPress={onUse}
              style={({ pressed }) => [styles.action, styles.useAction, pressed && styles.pressed]}
            >
              <Text style={[styles.actionText, styles.useActionText]}>その場で使う（HP +{heal}）</Text>
            </Pressable>
          )}
          {held.length > 0 && (
            <Pressable
              onPress={() => setReplacing(true)}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Text style={styles.actionText}>入れ替え</Text>
            </Pressable>
          )}
          <Pressable onPress={onDecline} style={({ pressed }) => [styles.decline, pressed && styles.pressed]}>
            <Text style={styles.skipText}>置いていく</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  corner: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gold: { color: COLORS.gold, fontSize: 18, fontWeight: '800' },
  potionColumn: { alignSelf: 'stretch', alignItems: 'center', gap: SPACING.sm },
  potion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    alignSelf: 'stretch',
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  potionIcon: { fontSize: 30 },
  potionBody: { flex: 1, gap: 2 },
  potionName: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  potionText: { color: COLORS.textMuted, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  action: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  useAction: { borderColor: COLORS.heal },
  actionText: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  useActionText: { color: COLORS.heal },
  swapList: { alignSelf: 'stretch', gap: SPACING.sm },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  locked: { opacity: 0.4 },
  title: { color: COLORS.gold, fontSize: 26, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  archetype: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' },
  choice: { alignItems: 'center', gap: SPACING.xs },
  decline: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  skip: {
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  skipText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  note: { color: COLORS.textMuted, fontSize: 12 },
  pressed: { opacity: 0.7 },
});
