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
import { ItemBar } from '../items/ItemBar';
import { RelicCard } from '../items/RelicCard';
import { ScreenScroll } from '../layout/ScreenScroll';

type PotionChoice = { potion: PotionDefinition; slot: number };

type RewardScreenProps = {
  step: 'card' | 'potion';
  choices: CardDefinition[];
  potionChoices: PotionDefinition[];
  /** 今の所持品。ポーションはここへ飛び、枠が埋まっていれば入れ替える。 */
  relics: RelicDefinition[];
  potions: PotionSlot[];
  /** この戦闘で得たゴールド（もう所持金に入っている）。0 なら表示しない。 */
  gold: number;
  /** 手に入れたレリック（もう所持品に入っている）。 */
  relic: RelicDefinition | null;
  /** ボス撃破後は、選んだあとボスレリックの 3 択へ進む。 */
  toBossRelic: boolean;
  /** カードを受け取らずに進める。出来事で足すときは false。 */
  canSkip: boolean;
  /** 今のデッキ。選ぶ前に見比べられるように。 */
  deck: CardDefinition[];
  onPick: (card: CardDefinition | null) => void;
  /** null はポーションを受け取らない。 */
  onPickPotion: (choice: PotionChoice | null) => void;
};

export function RewardScreen({
  step,
  choices,
  potionChoices,
  relics,
  potions,
  gold,
  relic,
  toBossRelic,
  canSkip,
  deck,
  onPick,
  onPickPotion,
}: RewardScreenProps) {
  const archetype = mainArchetype(deck);
  const [preview, setPreview] = useState<CardDefinition | null>(null);
  const [replacing, setReplacing] = useState<PotionDefinition | null>(null);
  const emptySlot = potions.findIndex((slot) => slot === null);
  return (
    <ScreenScroll contentStyle={styles.root}>
      <View style={styles.bar}>
        <ItemBar relics={relics} potions={potions} />
      </View>
      <View style={styles.tools}>
        <SettingsButton />
        <DeckButton deck={deck} />
      </View>
      {gold > 0 && <Text style={styles.gold}>🪙 +{gold} ゴールド</Text>}
      {relic && <RelicCard relic={relic} caption="レリック獲得" />}
      {step === 'card' ? (
        <>
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
          {canSkip ? (
            <Pressable
              onPress={() => onPick(null)}
              style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
            >
              <Text style={styles.skipText}>スキップ</Text>
            </Pressable>
          ) : (
            choices.length === 0 && (
              <Pressable
                onPress={() => onPick(null)}
                style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
              >
                <Text style={styles.skipText}>先へ進む</Text>
              </Pressable>
            )
          )}
          {potionChoices.length > 0 && (
            <Text style={styles.note}>このあとポーションを 1 つ選べる</Text>
          )}
        </>
      ) : (
        <PotionReward
          choices={potionChoices}
          potions={potions}
          replacing={replacing}
          emptySlot={emptySlot}
          onChoose={(potion) => {
            if (emptySlot >= 0) onPickPotion({ potion, slot: emptySlot });
            else setReplacing(potion);
          }}
          onReplace={(slot) => {
            if (replacing) onPickPotion({ potion: replacing, slot });
          }}
          onCancelReplace={() => setReplacing(null)}
          onSkip={() => onPickPotion(null)}
        />
      )}
      {toBossRelic && <Text style={styles.note}>このあとボスの宝箱からレリックを選べる</Text>}
      <MarkPreviewSheet card={preview} onClose={() => setPreview(null)} />
    </ScreenScroll>
  );
}

type PotionRewardProps = {
  choices: PotionDefinition[];
  potions: PotionSlot[];
  replacing: PotionDefinition | null;
  emptySlot: number;
  onChoose: (potion: PotionDefinition) => void;
  onReplace: (slot: number) => void;
  onCancelReplace: () => void;
  onSkip: () => void;
};

/** カードと同じく 3 つから 1 つ。枠が埋まっていれば、持っているものと入れ替える。 */
function PotionReward({
  choices,
  potions,
  replacing,
  emptySlot,
  onChoose,
  onReplace,
  onCancelReplace,
  onSkip,
}: PotionRewardProps) {
  return (
    <>
      <Text style={styles.title}>ポーション報酬</Text>
      <Text style={styles.subtitle}>
        {replacing ? 'どの枠と入れ替える' : '1 つ選んで所持品に加える'}
      </Text>
      {replacing ? (
        <View style={styles.list}>
          <PotionRow potion={replacing} onPress={undefined} />
          {potions.map((held, slot) =>
            held ? (
              <Pressable
                key={slot}
                onPress={() => onReplace(slot)}
                style={({ pressed }) => [styles.potion, pressed && styles.pressed]}
              >
                <Text style={styles.potionIcon}>{held.icon}</Text>
                <View style={styles.potionBody}>
                  <Text style={styles.potionName}>{held.name} と入れ替え</Text>
                  <Text style={styles.potionText}>{describePotion(held)}</Text>
                </View>
              </Pressable>
            ) : null,
          )}
          <Pressable onPress={onCancelReplace} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <Text style={styles.skipText}>やめる</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {emptySlot < 0 && <Text style={styles.note}>枠がいっぱいです。選ぶと入れ替えになります</Text>}
          {choices.map((potion) => (
            <PotionRow key={potion.id} potion={potion} onPress={() => onChoose(potion)} />
          ))}
          <Pressable onPress={onSkip} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <Text style={styles.skipText}>スキップ</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

function PotionRow({ potion, onPress }: { potion: PotionDefinition; onPress: (() => void) | undefined }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.potion, pressed && styles.pressed]}
    >
      <Text style={styles.potionIcon}>{potion.icon}</Text>
      <View style={styles.potionBody}>
        <Text style={styles.potionName}>{potion.name}</Text>
        <Text style={styles.potionText}>{describePotion(potion)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  bar: { alignSelf: 'stretch' },
  tools: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gold: { color: COLORS.gold, fontSize: 18, fontWeight: '800' },
  title: { color: COLORS.gold, fontSize: 26, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  archetype: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' },
  choice: { alignItems: 'center', gap: SPACING.xs },
  list: { alignSelf: 'stretch', gap: SPACING.sm, maxWidth: 420 },
  potion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  potionIcon: { fontSize: 30 },
  potionBody: { flex: 1, gap: 2 },
  potionName: { color: COLORS.gold, fontSize: 15, fontWeight: '800' },
  potionText: { color: COLORS.text, fontSize: 13, lineHeight: 18 },
  skip: {
    marginTop: SPACING.md,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  skipText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  note: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
