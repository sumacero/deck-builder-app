import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
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
  /** この戦闘でもらったポーション（もう空き枠に入っている）。 */
  potion: PotionDefinition | null;
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
      {potion && (
        <View style={styles.potion}>
          <Text style={styles.potionIcon}>{potion.icon}</Text>
          <View style={styles.potionBody}>
            <Text style={styles.potionName}>ポーション獲得: {potion.name}</Text>
            <Text style={styles.potionText}>{describePotion(potion)}</Text>
          </View>
        </View>
      )}
      <Text style={styles.title}>カード報酬</Text>
      <Text style={styles.subtitle}>1 枚選んでデッキに加える</Text>
      {archetype && (
        <Text style={styles.archetype}>今のデッキの軸: {ARCHETYPE_LABEL[archetype]}</Text>
      )}
      <View style={styles.row}>
        {choices.map((card) => (
          <View key={card.id} style={styles.choice}>
            <CardView card={card} size="md" onPress={() => onPick(card)} />
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
        style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
      >
        <Text style={styles.skipText}>スキップ</Text>
      </Pressable>
      {toBossRelic && <Text style={styles.note}>このあとボスの宝箱からレリックを選べる</Text>}
      <MarkPreviewSheet card={preview} onClose={() => setPreview(null)} />
    </ScreenScroll>
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
  title: { color: COLORS.gold, fontSize: 26, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  archetype: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' },
  choice: { alignItems: 'center', gap: SPACING.xs },
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
