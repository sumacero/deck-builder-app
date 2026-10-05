import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RelicDefinition } from '../../domain/relic';
import type { RunState } from '../../domain/run';
import { isFinalAct } from '../../logic/run';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { RelicCard } from '../items/RelicCard';
import { ScreenScroll } from '../layout/ScreenScroll';
import { RunHud } from './RunHud';

type BossRelicScreenProps = {
  run: RunState;
  choices: RelicDefinition[];
  /** null なら何も取らずに次の章へ。 */
  onChoose: (relicId: string | null) => void;
};

/** ボス撃破後の宝箱。ボスレリックを 3 つの中から 1 つ選び、次の章へ進む。 */
export function BossRelicScreen({ run, choices, onChoose }: BossRelicScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ScreenScroll contentStyle={styles.root}>
      <RunHud run={run} />

      <View style={styles.body}>
        <Text style={styles.chest}>👑</Text>
        <Text style={styles.title}>ボスの宝箱</Text>
        <Text style={styles.subtitle}>強力なレリックを 1 つ選ぶ</Text>
        <View style={styles.choices}>
          {choices.map((relic) => (
            <RelicCard
              key={relic.id}
              relic={relic}
              selected={relic.id === selectedId}
              onPress={() => setSelectedId(relic.id)}
            />
          ))}
        </View>
        <Text style={styles.note}>
          {isFinalAct(run) ? '選ぶと HP が全回復し、最終決戦へ' : '選ぶと HP が全回復し、次の章へ進む'}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={() => selectedId && onChoose(selectedId)}
          disabled={!selectedId}
          style={({ pressed }) => [
            styles.confirm,
            !selectedId && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.confirmText}>これを持っていく</Text>
        </Pressable>
        <Pressable
          onPress={() => onChoose(null)}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <Text style={styles.skipText}>何も取らない</Text>
        </Pressable>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  root: { padding: SPACING.lg, gap: SPACING.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  chest: { fontSize: 56 },
  title: { color: COLORS.gold, fontSize: 24, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  choices: { alignSelf: 'stretch', gap: SPACING.sm, marginTop: SPACING.md },
  note: { color: COLORS.textMuted, fontSize: 12, marginTop: SPACING.sm },
  buttons: { gap: SPACING.sm },
  confirm: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  skip: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  skipText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
