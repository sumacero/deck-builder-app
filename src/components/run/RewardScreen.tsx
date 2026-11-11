import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { PotionSlot } from '../../domain/combat';
import type { PotionDefinition } from '../../domain/potion';
import type { RelicDefinition } from '../../domain/relic';
import { mainArchetype } from '../../logic/archetype';
import { canUpgrade, stackCards, upgradeCard } from '../../logic/cards';
import { ARCHETYPE_LABEL, describePotion } from '../../logic/describe';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { ArchetypeChips } from '../cards/ArchetypeChips';
import { CardPickerModal } from '../cards/CardPickerModal';
import { CardView } from '../cards/CardView';
import { GuardedPressable, KeywordText } from '../glossary/KeywordText';
import { MarkPreviewSheet } from '../cards/MarkPreviewSheet';
import { DeckButton } from '../cards/DeckButton';
import { SettingsButton } from '../settings/SettingsButton';
import { ItemBar } from '../items/ItemBar';
import { RelicCard } from '../items/RelicCard';
import { ScreenScroll } from '../layout/ScreenScroll';

type PotionChoice = { potion: PotionDefinition; slot: number };

type RewardScreenProps = {
  step: 'card' | 'potion' | 'growth';
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
  /** 通常戦で、強化の代わりにもらえるゴールド。 */
  growthGold: number;
  /** この章のボスがカード選びの前に見せる困らせ方。無ければ出さない。 */
  bossLine: string | null;
  /** 第3章は、1枠がボスに通る多段の札になる。 */
  lateAct: boolean;
  onPick: (card: CardDefinition | null) => void;
  /** null はポーションを受け取らない。 */
  onPickPotion: (choice: PotionChoice | null) => void;
  onUpgrade: (card: CardDefinition) => void;
  onTakeGold: () => void;
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
  growthGold,
  bossLine,
  lateAct,
  onPick,
  onPickPotion,
  onUpgrade,
  onTakeGold,
}: RewardScreenProps) {
  const archetype = mainArchetype(deck);
  const [preview, setPreview] = useState<CardDefinition | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [frontId, setFrontId] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<PotionDefinition | null>(null);
  const [pickingUpgrade, setPickingUpgrade] = useState(false);
  const emptySlot = potions.findIndex((slot) => slot === null);
  const upgradable = deck.some(canUpgrade);
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
      {step === 'growth' ? (
        <>
          <Text style={styles.title}>戦果</Text>
          <Text style={styles.subtitle}>カードは増えない。1 枚強化するか、ゴールドをもらう</Text>
          {upgradable ? (
            <Pressable
              onPress={() => setPickingUpgrade(true)}
              style={({ pressed }) => [styles.potion, pressed && styles.pressed]}
            >
              <Text style={styles.potionIcon}>⚒️</Text>
              <View style={styles.potionBody}>
                <Text style={styles.potionName}>カードを強化する</Text>
                <Text style={styles.potionText}>デッキから 1 枚選ぶ</Text>
              </View>
            </Pressable>
          ) : (
            <Text style={styles.note}>強化できるカードがない</Text>
          )}
          <Pressable
            onPress={onTakeGold}
            style={({ pressed }) => [styles.potion, pressed && styles.pressed]}
          >
            <Text style={styles.potionIcon}>🪙</Text>
            <View style={styles.potionBody}>
              <Text style={styles.potionName}>ゴールド +{growthGold}</Text>
              <Text style={styles.potionText}>強化の代わりに受け取る</Text>
            </View>
          </Pressable>
          {pickingUpgrade && (
            <CardPickerModal
              title="強化するカードを選ぶ"
              stacks={stackCards(deck.filter(canUpgrade))}
              confirmLabel="強化する"
              preview={upgradeCard}
              onConfirm={onUpgrade}
              onCancel={() => setPickingUpgrade(false)}
            />
          )}
        </>
      ) : step === 'card' ? (
        <>
          <Text style={styles.title}>カード報酬</Text>
          <Text style={styles.subtitle}>
            {lateAct
              ? canSkip
                ? '1枚は、このボスに通る多段の札です。合わなければスキップできます。'
                : '1枚は、このボスに通る多段の札です。'
              : '1 枚選んでデッキに加える'}
          </Text>
          {bossLine && <Text style={styles.boss}>{bossLine}</Text>}
          {archetype && (
            <Text style={styles.archetype}>今のデッキの軸: {ARCHETYPE_LABEL[archetype]}</Text>
          )}
          <View style={styles.row}>
            {choices.map((card) => (
              <View key={card.id} style={[styles.choice, frontId === card.id && styles.choiceFront]}>
                <CardView
                  card={card}
                  size="md"
                  selected={armedId === card.id}
                  onTipChange={(open) =>
                    setFrontId((current) => (open ? card.id : current === card.id ? null : current))
                  }
                  onPress={() => {
                    if (armedId === card.id) onPick(card);
                    else setArmedId(card.id);
                  }}
                />
                {armedId === card.id && <Text style={styles.again}>もう一度タップで加える</Text>}
                <ArchetypeChips archetypes={card.archetypes ?? []} highlight={archetype} />
                {card.water && (
                  <Pressable onPress={() => setPreview(card)} hitSlop={8}>
                    <Text style={styles.stackLink}>段の数字</Text>
                  </Pressable>
                )}
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
  const [armedId, setArmedId] = useState<string | null>(null);
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
              <GuardedPressable
                key={slot}
                onPress={() => onReplace(slot)}
                style={({ pressed }) => [styles.potion, pressed && styles.pressed]}
              >
                <Text style={styles.potionIcon}>{held.icon}</Text>
                <View style={styles.potionBody}>
                  <Text style={styles.potionName}>{held.name} と入れ替え</Text>
                  <KeywordText text={describePotion(held)} style={styles.potionText} />
                </View>
              </GuardedPressable>
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
            <PotionRow
              key={potion.id}
              potion={potion}
              selected={armedId === potion.id}
              onPress={() => {
                if (armedId === potion.id) onChoose(potion);
                else setArmedId(potion.id);
              }}
            />
          ))}
          <Pressable onPress={onSkip} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <Text style={styles.skipText}>スキップ</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

function PotionRow({
  potion,
  onPress,
  selected = false,
}: {
  potion: PotionDefinition;
  onPress: (() => void) | undefined;
  selected?: boolean;
}) {
  return (
    <GuardedPressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.potion, selected && styles.potionSelected, pressed && styles.pressed]}
    >
      <Text style={styles.potionIcon}>{potion.icon}</Text>
      <View style={styles.potionBody}>
        <Text style={styles.potionName}>{potion.name}</Text>
        <KeywordText text={describePotion(potion)} style={styles.potionText} />
        {selected && <Text style={styles.again}>もう一度タップで加える</Text>}
      </View>
    </GuardedPressable>
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
  subtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  boss: { color: COLORS.text, fontSize: 13, lineHeight: 18, textAlign: 'center', maxWidth: 520 },
  archetype: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' },
  choice: { alignItems: 'center', gap: SPACING.xs },
  choiceFront: { zIndex: 5 },
  again: { color: COLORS.keyword, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  stackLink: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
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
  potionSelected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
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
