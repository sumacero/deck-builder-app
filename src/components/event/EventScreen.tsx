import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { EventDefinition, EventOption } from '../../domain/event';
import type { RunState } from '../../domain/run';
import type { EventActions } from '../../hooks/useRun';
import type { CardDefinition } from '../../domain/card';
import { describeEventOption } from '../../logic/describe';
import { canChooseEventOption, optionPreviewCards, shownEventOptions } from '../../logic/event';
import { useSceneCue } from '../../hooks/useSceneCue';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { PlaceBanner } from '../backgrounds/PlaceBanner';
import { placeImage } from '../backgrounds/sceneImages';
import { CardView } from '../cards/CardView';
import { CardGlossaryPopover, useGlossaryAnchor, type WindowRect } from '../glossary/CardGlossaryPopover';
import { GuardedPressable, KeywordText } from '../glossary/KeywordText';
import { RunHud } from '../run/RunHud';

type EventScreenProps = {
  run: RunState;
  event: EventDefinition;
  /** 選んだあとの結末。null ならまだ選んでいない。 */
  outcome: string | null;
  actions: EventActions;
};

/** 「？」マスの出来事。選択肢を決めたあとは、その画面には戻れない。 */
export function EventScreen({ run, event, outcome, actions }: EventScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [cardAnchors, setCardAnchors] = useState<Record<string, WindowRect>>({});
  const cardMeasures = useRef<Record<string, () => void>>({});
  const options = shownEventOptions(run, event);
  const review = outcome === null ? options.find((option) => option.id === reviewId) : undefined;
  const previewCards = review ? optionPreviewCards(review) : [];
  const art = placeImage(event.id);
  useSceneCue(event.id);

  const selectOption = (option: EventOption) => {
    const preview = optionPreviewCards(option).length > 0;
    // 札をもらわない選択肢は、2 回目のタップで決める。1 回目は用語を読める。
    if (selectedId === option.id && !preview) {
      actions.choose(option.id);
      return;
    }
    setSelectedId(option.id);
    setCardAnchors({});
    // もらう札が決まっている選択肢は、選んだ時点でカードの詳細を出す。
    setReviewId(preview ? option.id : null);
  };

  const confirmSelection = () => {
    if (!selectedId) return;
    const option = options.find((candidate) => candidate.id === selectedId);
    if (!option) return;
    if (optionPreviewCards(option).length > 0) {
      setCardAnchors({});
      setReviewId(option.id);
      return;
    }
    actions.choose(selectedId);
  };

  return (
    <View style={styles.root}>
      <RunHud run={run} />

      <ScrollView
        contentContainerStyle={styles.body}
        onScroll={() => {
          for (const measure of Object.values(cardMeasures.current)) measure();
        }}
        scrollEventThrottle={16}
      >
        {art ? <PlaceBanner source={art} /> : <Text style={styles.icon}>{event.icon}</Text>}
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.bubble}>
          <Text style={styles.text}>{outcome ?? event.text}</Text>
        </View>

        {outcome === null && review && previewCards.length > 0 ? (
          <EventChoiceDetail
            option={review}
            cards={previewCards}
            onAnchor={(id, rect) =>
              setCardAnchors((prev) => {
                const current = prev[id];
                if (
                  current &&
                  current.x === rect.x &&
                  current.y === rect.y &&
                  current.width === rect.width &&
                  current.height === rect.height
                ) {
                  return prev;
                }
                return { ...prev, [id]: rect };
              })
            }
            onMeasure={(id, measure) => {
              cardMeasures.current[id] = measure;
            }}
          />
        ) : (
          outcome === null && (
            <View style={styles.options}>
              {options.map((option) => (
                <EventOptionView
                  key={option.id}
                  option={option}
                  enabled={canChooseEventOption(run, option)}
                  selected={option.id === selectedId}
                  onPress={() => selectOption(option)}
                />
              ))}
            </View>
          )
        )}
      </ScrollView>

      {outcome === null && review && previewCards.length > 0 ? (
        <View style={styles.detailActions}>
          <Pressable
            onPress={() => {
              setCardAnchors({});
              setReviewId(null);
            }}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>戻る</Text>
          </Pressable>
          <Pressable
            onPress={() => actions.choose(review.id)}
            style={({ pressed }) => [styles.confirm, styles.detailConfirm, pressed && styles.pressed]}
          >
            <Text style={styles.confirmText}>この選択にする</Text>
          </Pressable>
        </View>
      ) : outcome === null ? (
        <Pressable
          onPress={confirmSelection}
          disabled={!selectedId}
          style={({ pressed }) => [
            styles.confirm,
            !selectedId && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.confirmText}>決定</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={actions.leave}
          style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
        >
          <Text style={styles.confirmText}>先へ進む</Text>
        </Pressable>
      )}
      {previewCards.map((card) => {
        const anchor = cardAnchors[card.id];
        return anchor ? <CardGlossaryPopover key={card.id} card={card} anchor={anchor} /> : null;
      })}
    </View>
  );
}

type EventOptionViewProps = {
  option: EventOption;
  enabled: boolean;
  selected: boolean;
  onPress: () => void;
};

function EventChoiceDetail({
  option,
  cards,
  onAnchor,
  onMeasure,
}: {
  option: EventOption;
  cards: CardDefinition[];
  onAnchor: (id: string, rect: WindowRect) => void;
  onMeasure: (id: string, measure: () => void) => void;
}) {
  const lines = describeEventOption(option);
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{option.label}</Text>
      {lines.map((line, index) => (
        <KeywordText
          key={index}
          text={`${line.negative ? '▼ ' : '◆ '}${line.text}`}
          style={[styles.line, line.negative && styles.negative]}
        />
      ))}
      <Text style={styles.detailNote}>決めると、この出来事には戻れない。</Text>
      {cards.map((card) => (
        <EventPreviewCard key={card.id} card={card} onAnchor={onAnchor} onMeasure={onMeasure} />
      ))}
    </View>
  );
}

function EventPreviewCard({
  card,
  onAnchor,
  onMeasure,
}: {
  card: CardDefinition;
  onAnchor: (id: string, rect: WindowRect) => void;
  onMeasure: (id: string, measure: () => void) => void;
}) {
  const report = (rect: WindowRect) => onAnchor(card.id, rect);
  const { ref, measure } = useGlossaryAnchor(true, report);
  useEffect(() => {
    if (measure) onMeasure(card.id, measure);
  }, [card.id, measure, onMeasure]);
  return (
    <View ref={ref} collapsable={false} onLayout={() => measure?.()} style={styles.cardBlock}>
      <CardView card={card} size="md" />
    </View>
  );
}

function EventOptionView({ option, enabled, selected, onPress }: EventOptionViewProps) {
  const lines = describeEventOption(option);
  return (
    <GuardedPressable
      onPress={onPress}
      disabled={!enabled}
      style={({ pressed }) => [
        styles.option,
        selected && styles.selected,
        !enabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{option.label}</Text>
      {lines.map((line, index) => (
        <KeywordText
          key={index}
          text={`${line.negative ? '▼ ' : '◆ '}${line.text}`}
          style={[styles.line, line.negative && styles.negative]}
        />
      ))}
      {selected && enabled && optionPreviewCards(option).length === 0 && (
        <Text style={styles.again}>もう一度タップで決める</Text>
      )}
      {!enabled && <Text style={styles.blocked}>今は選べない</Text>}
    </GuardedPressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  body: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  icon: { fontSize: 64 },
  title: { color: COLORS.gold, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  bubble: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  text: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  options: { alignSelf: 'stretch', gap: SPACING.sm, marginTop: SPACING.sm },
  option: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 2,
  },
  selected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  line: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  negative: { color: COLORS.damageText },
  again: { color: COLORS.keyword, fontSize: 11, fontWeight: '700', marginTop: 2 },
  blocked: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  detail: { alignSelf: 'stretch', gap: SPACING.sm, marginTop: SPACING.sm },
  detailLabel: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  detailNote: { color: COLORS.textMuted, fontSize: 12 },
  cardBlock: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  cardText: { alignSelf: 'stretch', color: COLORS.text, fontSize: 13, lineHeight: 20 },
  detailActions: { flexDirection: 'row', gap: SPACING.md },
  back: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '700' },
  detailConfirm: { flex: 1.4 },
  confirm: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
