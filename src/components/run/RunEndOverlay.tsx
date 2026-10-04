import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RunState } from '../../domain/run';
import { mainArchetype } from '../../logic/archetype';
import { ARCHETYPE_LABEL } from '../../logic/describe';
import { currentAct, reachedFloor } from '../../logic/run';
import { favoriteCards } from '../../logic/stats';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardView } from '../cards/CardView';

type RunEndOverlayProps = {
  kind: 'gameOver' | 'cleared';
  run: RunState;
  onNewRun: () => void;
  onExitToTitle: () => void;
};

const FAVORITE_COUNT = 3;

export function RunEndOverlay({ kind, run, onNewRun, onExitToTitle }: RunEndOverlayProps) {
  const cleared = kind === 'cleared';
  const { stats } = run;
  const favorites = favoriteCards(stats, [...run.deck, run.agent.mysticArte], FAVORITE_COUNT);
  const archetype = mainArchetype(run.deck);
  const records: { label: string; value: string }[] = [
    {
      label: '到達',
      value: `第 ${run.actIndex + 1} 章「${currentAct(run).name}」${reachedFloor(run)} 階`,
    },
    { label: '勝利した戦闘', value: `${stats.combatsWon} 回` },
    { label: '倒した敵', value: `${stats.enemiesDefeated} 体` },
    { label: '最大ダメージ', value: `${stats.maxHit}` },
    { label: 'ダウンさせた回数', value: `${stats.downs} 回` },
    { label: '秘奥義', value: `${stats.artes} 回` },
    { label: 'デッキの軸', value: archetype ? ARCHETYPE_LABEL[archetype] : 'なし（万能型）' },
  ];

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: cleared ? COLORS.gold : COLORS.danger }]}>
          {cleared ? '踏破' : '敗北'}
        </Text>
        <Text style={styles.subtitle}>
          {cleared ? 'すべての章を踏破した！' : 'あなたは力尽きた…'}
        </Text>

        <View style={styles.panel}>
          <Text style={styles.heading}>冒険の記録</Text>
          {records.map((record) => (
            <View key={record.label} style={styles.record}>
              <Text style={styles.recordLabel}>{record.label}</Text>
              <Text style={styles.recordValue}>{record.value}</Text>
            </View>
          ))}
        </View>

        {favorites.length > 0 && (
          <View style={styles.favorites}>
            <Text style={styles.heading}>よく使ったカード</Text>
            <View style={styles.cards}>
              {favorites.map(({ card, count }) => (
                <View key={card.id} style={styles.favorite}>
                  <CardView card={card} size="sm" />
                  <Text style={styles.count}>{count} 回</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Pressable
          onPress={onNewRun}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>新しいラン</Text>
        </Pressable>
        <Pressable
          onPress={onExitToTitle}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>タイトルへ</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.overlay,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  title: { fontSize: 44, fontWeight: '900', letterSpacing: 8 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  panel: {
    alignSelf: 'stretch',
    maxWidth: 420,
    width: '100%',
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  heading: { color: COLORS.gold, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  record: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md },
  recordLabel: { color: COLORS.textMuted, fontSize: 13 },
  recordValue: { color: COLORS.text, fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  favorites: { alignItems: 'center', gap: SPACING.sm },
  cards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  favorite: { alignItems: 'center', gap: SPACING.xs },
  count: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  button: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  secondary: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  secondaryText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
