import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { playSound } from '../../../audio/soundPlayer';
import type { UpgradedCard } from '../../../domain/runEvent';
import { COLORS, MOTION, RADIUS, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';

type UpgradeRevealProps = {
  cards: UpgradedCard[];
  onDone: () => void;
};

/** 強化後のカードのまわりできらめく「✨」の位置（カードに対する割合）と、一周のうち一番光る時点。 */
const SPARKLES = [
  { x: -0.12, y: 0.05, peak: 0.2 },
  { x: 0.92, y: 0.15, peak: 0.45 },
  { x: 0.85, y: 0.82, peak: 0.7 },
  { x: -0.08, y: 0.7, peak: 0.9 },
] as const;

const CARD_WIDTH = 108;
const CARD_HEIGHT = 168;

/**
 * カード強化の演出。槌が振り下ろされ、光ったあとに「強化前 → 強化後」を並べて見せる。
 * 違いを読めるよう自動では閉じず、出きったらタップで閉じる。
 */
export function UpgradeReveal({ cards, onDone }: UpgradeRevealProps) {
  const [strike] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));
  const [twinkle] = useState(() => new Animated.Value(0));
  const [revealed, setRevealed] = useState(false);
  const [closable, setClosable] = useState(false);
  const onStruck = useEffectEvent(() => {
    playSound('upgrade');
    setRevealed(true);
  });

  useEffect(() => {
    const strikeAnimation = Animated.timing(strike, {
      toValue: 1,
      duration: MOTION.upgradeStrike,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    strikeAnimation.start(({ finished }) => {
      if (finished) onStruck();
    });
    return () => strikeAnimation.stop();
  }, [strike]);

  useEffect(() => {
    if (!revealed) return;
    const revealAnimation = Animated.timing(reveal, {
      toValue: 1,
      duration: MOTION.upgradeReveal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const twinkleLoop = Animated.loop(
      Animated.timing(twinkle, {
        toValue: 1,
        duration: MOTION.sparkle,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    revealAnimation.start(({ finished }) => {
      if (finished) setClosable(true);
    });
    twinkleLoop.start();
    return () => {
      revealAnimation.stop();
      twinkleLoop.stop();
    };
  }, [revealed, reveal, twinkle]);

  const hammerRotate = strike.interpolate({ inputRange: [0, 1], outputRange: ['-70deg', '15deg'] });
  const hammerOpacity = strike.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] });
  const flash = reveal.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0.9, 0.7, 0] });
  const popScale = reveal.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1.35, 0.95, 1] });
  const arrowOpacity = reveal.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <Pressable style={styles.root} onPress={closable ? onDone : undefined}>
      <Text style={styles.title}>{revealed ? 'カードを強化した！' : '鍛えている…'}</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pairs}>
        {cards.map((pair, i) => (
          <View key={`${pair.after.id}-${i}`} style={styles.pair}>
            {revealed ? (
              <>
                <View style={styles.before}>
                  <CardView card={pair.before} size="md" detailOnHold={false} />
                </View>
                <Animated.Text style={[styles.arrow, { opacity: arrowOpacity }]}>→</Animated.Text>
                <Animated.View style={[styles.after, { transform: [{ scale: popScale }] }]}>
                  <CardView card={pair.after} size="md" selected detailOnHold={false} />
                  {SPARKLES.map((sparkle, j) => (
                    <Animated.Text
                      key={j}
                      style={[
                        styles.sparkle,
                        {
                          left: sparkle.x * CARD_WIDTH,
                          top: sparkle.y * CARD_HEIGHT,
                          opacity: twinkle.interpolate({
                            inputRange: [0, sparkle.peak, 1],
                            outputRange: [0.15, 1, 0.15],
                          }),
                        },
                      ]}
                    >
                      ✨
                    </Animated.Text>
                  ))}
                </Animated.View>
              </>
            ) : (
              <View style={styles.anvil}>
                <CardView card={pair.before} size="md" detailOnHold={false} />
                <Animated.Text
                  style={[
                    styles.hammer,
                    { opacity: hammerOpacity, transform: [{ rotate: hammerRotate }] },
                  ]}
                >
                  🔨
                </Animated.Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <Text style={[styles.hint, !closable && styles.hidden]}>タップで閉じる</Text>
      {revealed && <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: { color: COLORS.gold, fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  scroll: { flexGrow: 0 },
  pairs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  pair: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  before: { opacity: 0.6 },
  arrow: { color: COLORS.gold, fontSize: 26, fontWeight: '800' },
  after: {
    borderRadius: RADIUS.md,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  sparkle: { position: 'absolute', fontSize: 18 },
  anvil: { alignItems: 'center', justifyContent: 'center' },
  hammer: { position: 'absolute', top: -SPACING.xl, right: -SPACING.xl, fontSize: 44 },
  hint: { color: COLORS.textMuted, fontSize: 13 },
  hidden: { opacity: 0 },
  flash: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.flash,
  },
});
