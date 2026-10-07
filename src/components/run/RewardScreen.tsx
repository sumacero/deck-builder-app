import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { RelicDefinition } from '../../domain/relic';
import { mainArchetype } from '../../logic/archetype';
import { ARCHETYPE_LABEL } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { ArchetypeChips } from '../cards/ArchetypeChips';
import { CardView } from '../cards/CardView';
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
  toBossRelic,
  deck,
  onPick,
}: RewardScreenProps) {
  const archetype = mainArchetype(deck);
  return (
    <ScreenScroll contentStyle={styles.root}>
      <View style={styles.corner}>
        <SettingsButton />
        <DeckButton deck={deck} />
      </View>
      {gold > 0 && <Text style={styles.gold}>🪙 +{gold} ゴールド</Text>}
      {relic && <RelicCard relic={relic} caption="レリック獲得" />}
      <Text style={styles.title}>カード報酬</Text>
      <Text style={styles.subtitle}>1 枚選んでデッキに加える</Text>
      {archetype && (
        <Text style={styles.archetype}>今のデッキの軸: {ARCHETYPE_LABEL[archetype]}</Text>
      )}
      <View style={styles.row}>
        {choices.map((card) => (
          <View key={card.id} style={styles.choice}>
            <CardView card={card} size="md" onPress={() => onPick(card)} />
            <ArchetypeChips archetypes={card.archetypes ?? []} highlight={archetype} />
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
