import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RelicDefinition } from '../../domain/relic';
import type { RunState } from '../../domain/run';
import type { TreasureActions } from '../../hooks/useRun';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { RelicCard } from '../items/RelicCard';
import { RunHud } from '../run/RunHud';

type TreasureScreenProps = {
  run: RunState;
  opened: boolean;
  /** 開けたときに手に入れたもの（もう所持品に入っている）。 */
  relic: RelicDefinition | null;
  gold: number;
  actions: TreasureActions;
};

/** 宝箱。開けるとレリックとゴールドが手に入る。 */
export function TreasureScreen({ run, opened, relic, gold, actions }: TreasureScreenProps) {
  const [pop] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!opened) return;
    Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [opened, pop]);

  const scale = pop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1.1] });

  return (
    <View style={styles.root}>
      <RunHud run={run} />

      <View style={styles.body}>
        <Animated.Text style={[styles.chest, { transform: [{ scale }] }]}>
          {opened ? '✨' : '🎁'}
        </Animated.Text>
        <Text style={styles.title}>宝箱</Text>
        {opened ? (
          <View style={styles.loot}>
            {gold > 0 && <Text style={styles.gold}>🪙 +{gold} ゴールド</Text>}
            {relic ? (
              <RelicCard relic={relic} caption="レリック獲得" />
            ) : (
              <Text style={styles.note}>
                新しいレリックは無かった。代わりにゴールドを {run.economy.relicFallbackGold} 得た。
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.note}>古びた宝箱がある。何が入っているだろう。</Text>
        )}
      </View>

      <Pressable
        onPress={opened ? actions.leave : actions.open}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{opened ? '先へ進む' : '宝箱を開ける'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  chest: { fontSize: 80 },
  title: { color: COLORS.gold, fontSize: 24, fontWeight: '800', letterSpacing: 4 },
  loot: { alignSelf: 'stretch', alignItems: 'center', gap: SPACING.md },
  gold: { color: COLORS.gold, fontSize: 18, fontWeight: '800' },
  note: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  button: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
