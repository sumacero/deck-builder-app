import { useContext, useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { playSound } from '../../audio/soundPlayer';
import { COLORS, MOTION } from '../../theme';
import { AcquireContext } from './acquire/AcquireContext';

type GoldBadgeProps = {
  gold: number;
};

type Delta = { amount: number; id: number };

/** 1 ゴールドあたりの数え上げ時間（ms）。MOTION.goldCountMin〜Max に収める。 */
const COUNT_MS_PER_GOLD = 12;

/**
 * 所持金。増減したら数字が数え上がり（下がり）、増減した額が浮かんで消える。
 * 画面が変わっても、前の画面で最後に見せた金額から数え始める（戦闘の報酬 → マップなど）。
 */
export function GoldBadge({ gold }: GoldBadgeProps) {
  const { recallGold, rememberGold } = useContext(AcquireContext);
  const [start] = useState(() => recallGold() ?? gold);
  const [target, setTarget] = useState(start);
  const [delta, setDelta] = useState<Delta | null>(null);
  const [shown, setShown] = useState(start);
  const [count] = useState(() => new Animated.Value(start));
  const [pop] = useState(() => new Animated.Value(0));
  const [float] = useState(() => new Animated.Value(1));
  const remember = useEffectEvent((value: number) => rememberGold(value));

  if (gold !== target) {
    setTarget(gold);
    setDelta({ amount: gold - target, id: (delta?.id ?? 0) + 1 });
  }

  useEffect(() => {
    const listener = count.addListener(({ value }) => setShown(Math.round(value)));
    return () => count.removeListener(listener);
  }, [count]);

  useEffect(() => {
    remember(target);
  }, [target]);

  useEffect(() => {
    if (!delta) return;
    playSound('coin');
    const duration = Math.min(
      MOTION.goldCountMax,
      Math.max(MOTION.goldCountMin, Math.abs(delta.amount) * COUNT_MS_PER_GOLD),
    );
    float.setValue(0);
    pop.setValue(delta.amount > 0 ? 1 : 0);
    const animation = Animated.parallel([
      Animated.timing(count, {
        toValue: target,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.spring(pop, { toValue: 0, friction: 4, useNativeDriver: false }),
      Animated.timing(float, { toValue: 1, duration: MOTION.goldDelta, useNativeDriver: false }),
    ]);
    animation.start();
    return () => animation.stop();
    // target は delta と同時に変わるので、数え直しは増減 1 回につき 1 回。
  }, [delta, target, count, pop, float]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });
  const floatOpacity = float.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  return (
    <View>
      <Animated.Text style={[styles.text, { transform: [{ scale }] }]}>🪙 {shown}</Animated.Text>
      {delta && (
        <Animated.Text
          pointerEvents="none"
          style={[
            styles.delta,
            delta.amount < 0 && styles.spent,
            { opacity: floatOpacity, transform: [{ translateY: floatY }] },
          ]}
        >
          {delta.amount > 0 ? `+${delta.amount}` : `${delta.amount}`}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  delta: {
    position: 'absolute',
    right: 0,
    top: -4,
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '900',
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 3,
  },
  spent: { color: COLORS.damageText },
});
