import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import type { CombatStatus } from '../../domain/combat';
import { COLORS, MOTION, RADIUS, SPACING } from '../../theme';

type CombatResultOverlayProps = {
  status: Exclude<CombatStatus, 'playerTurn'>;
  turn: number;
  hp: number;
  maxHp: number;
  /** 最後の一撃の演出を見せてから表示するための待ち時間。 */
  appearDelay: number;
  onContinue: () => void;
};

export function CombatResultOverlay({
  status,
  turn,
  hp,
  maxHp,
  appearDelay,
  onContinue,
}: CombatResultOverlayProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const won = status === 'won';

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      delay: appearDelay,
      duration: MOTION.resultFadeIn,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [appearDelay, opacity]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Text style={[styles.title, { color: won ? COLORS.gold : COLORS.danger }]}>
        {won ? '勝利' : '敗北'}
      </Text>
      <Text style={styles.subtitle}>
        {turn} ターン{won ? ` / HP ${hp} / ${maxHp}` : ''}
      </Text>
      <Pressable
        onPress={onContinue}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{won ? '報酬を見る' : '結果を見る'}</Text>
      </Pressable>
    </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  title: { fontSize: 44, fontWeight: '900', letterSpacing: 8 },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  button: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
