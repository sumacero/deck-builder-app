import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { RelicDefinition } from '../../domain/relic';
import { describeRelic } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardView } from '../cards/CardView';
import { DeckButton } from '../cards/DeckButton';

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
  return (
    <View style={styles.root}>
      <View style={styles.corner}>
        <DeckButton deck={deck} />
      </View>
      {gold > 0 && <Text style={styles.gold}>🪙 +{gold} ゴールド</Text>}
      {relic && (
        <View style={styles.relic}>
          <Text style={styles.relicIcon}>{relic.icon}</Text>
          <View style={styles.relicBody}>
            <Text style={styles.relicName}>レリック獲得: {relic.name}</Text>
            <Text style={styles.relicText}>{describeRelic(relic)}</Text>
          </View>
        </View>
      )}
      <Text style={styles.title}>カード報酬</Text>
      <Text style={styles.subtitle}>1 枚選んでデッキに加える</Text>
      <View style={styles.row}>
        {choices.map((card) => (
          <CardView key={card.id} card={card} size="md" onPress={() => onPick(card)} />
        ))}
      </View>
      <Pressable
        onPress={() => onPick(null)}
        style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
      >
        <Text style={styles.skipText}>スキップ</Text>
      </Pressable>
      {toBossRelic && <Text style={styles.note}>このあとボスの宝箱からレリックを選べる</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  corner: { position: 'absolute', top: SPACING.lg, right: SPACING.lg },
  gold: { color: COLORS.gold, fontSize: 18, fontWeight: '800' },
  relic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    alignSelf: 'stretch',
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  relicIcon: { fontSize: 30 },
  relicBody: { flex: 1, gap: 2 },
  relicName: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  relicText: { color: COLORS.textMuted, fontSize: 12 },
  title: { color: COLORS.gold, fontSize: 26, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' },
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
