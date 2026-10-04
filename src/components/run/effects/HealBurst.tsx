import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { playSound } from '../../../audio/soundPlayer';
import { COLORS, MOTION, RADIUS, SPACING } from '../../../theme';
import { HpBar } from '../../combat/HpBar';

type HealBurstProps = {
  hpBefore: number;
  hpAfter: number;
  maxHpBefore: number;
  maxHpAfter: number;
  onDone: () => void;
};

/** 立ちのぼる「✚」の横位置（パネル幅に対する割合）と、出始めの遅れ（演出全体に対する割合）。 */
const PARTICLES = [
  { x: 0.12, delay: 0 },
  { x: 0.3, delay: 0.12 },
  { x: 0.5, delay: 0.04 },
  { x: 0.68, delay: 0.18 },
  { x: 0.86, delay: 0.08 },
  { x: 0.4, delay: 0.26 },
  { x: 0.6, delay: 0.32 },
] as const;

const PANEL_WIDTH = 240;
const PARTICLE_RISE = 90;

/**
 * HP 回復の演出。緑の光が広がり、回復量が弾んで出て、HP バーが伸びる。
 * 画面の操作は止めない（タッチは下に通す）。
 */
export function HealBurst({ hpBefore, hpAfter, maxHpBefore, maxHpAfter, onDone }: HealBurstProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const [shownHp, setShownHp] = useState(hpBefore);
  const finish = useEffectEvent(onDone);

  useEffect(() => {
    playSound('heal');
    const timer = setTimeout(() => setShownHp(hpAfter), MOTION.healBarDelay);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: MOTION.healBurst,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) finish();
    });
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [progress, hpAfter]);

  const glow = progress.interpolate({ inputRange: [0, 0.15, 0.6, 1], outputRange: [0, 0.3, 0.12, 0] });
  const panelOpacity = progress.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const panelY = progress.interpolate({ inputRange: [0, 0.1, 1], outputRange: [16, 0, -12] });
  const amountScale = progress.interpolate({
    inputRange: [0, 0.12, 0.22, 1],
    outputRange: [0.4, 1.35, 1, 1],
  });
  const healed = hpAfter - hpBefore;
  const maxGain = maxHpAfter - maxHpBefore;

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View style={[styles.glow, { opacity: glow }]} />
      <Animated.View
        style={[styles.panel, { opacity: panelOpacity, transform: [{ translateY: panelY }] }]}
      >
        {PARTICLES.map((particle, i) => {
          const start = particle.delay;
          const end = Math.min(1, start + 0.55);
          return (
            <Animated.Text
              key={i}
              style={[
                styles.particle,
                {
                  left: particle.x * PANEL_WIDTH,
                  opacity: progress.interpolate({
                    inputRange: [0, start, start + 0.08, end, 1],
                    outputRange: [0, 0, 1, 0, 0],
                  }),
                  transform: [
                    {
                      translateY: progress.interpolate({
                        inputRange: [0, start, end, 1],
                        outputRange: [0, 0, -PARTICLE_RISE, -PARTICLE_RISE],
                      }),
                    },
                  ],
                },
              ]}
            >
              ✚
            </Animated.Text>
          );
        })}
        <Animated.Text style={[styles.amount, { transform: [{ scale: amountScale }] }]}>
          +{healed}
        </Animated.Text>
        <Text style={styles.label}>HP 回復</Text>
        {maxGain > 0 && <Text style={styles.maxHp}>最大 HP +{maxGain}</Text>}
        <View style={styles.bar}>
          <HpBar hp={shownHp} maxHp={maxHpAfter} block={0} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.heal,
  },
  panel: {
    width: PANEL_WIDTH,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.heal,
    backgroundColor: COLORS.panelTranslucent,
  },
  particle: {
    position: 'absolute',
    bottom: SPACING.lg,
    color: COLORS.heal,
    fontSize: 18,
    fontWeight: '900',
  },
  amount: {
    color: COLORS.heal,
    fontSize: 44,
    fontWeight: '900',
    textShadowColor: COLORS.textOutline,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  maxHp: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
  bar: { alignSelf: 'stretch', marginTop: SPACING.sm },
});
