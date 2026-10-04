import { type ReactNode, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent } from '../../../domain/combat';
import { useCombatEvents } from '../../../hooks/useCombatEvents';
import { MAX_HAND_SIZE } from '../../../logic/combat';
import { COLORS, MOTION, RADIUS, SPACING } from '../../../theme';

type HandFullEffectProps = {
  events: CombatEvent[];
  handSize: number;
  children: ReactNode;
};

type Notice = { id: number; blocked: number };

const timing = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, { toValue, duration, useNativeDriver: true });

/**
 * 手札を包み、上限で引けなかったときに手札を揺らして「手札がいっぱい！」の帯を出す。
 * 上限に達している間は、右上に枚数（10/10）を出して、引くカードを使う前に気づけるようにする。
 */
export function HandFullEffect({ events, handSize, children }: HandFullEffectProps) {
  const [shakeX] = useState(() => new Animated.Value(0));
  const [banner] = useState(() => new Animated.Value(0));
  const [notice, setNotice] = useState<Notice | null>(null);

  useCombatEvents(events, (event) => {
    if (event.kind !== 'handFull') return;
    setNotice({ id: event.id, blocked: event.blocked });
    banner.setValue(0);
    Animated.parallel([
      Animated.sequence(
        [1, -1, 0.7, -0.7, 0.4, -0.4, 0].map((k) => timing(shakeX, k * 10, MOTION.shakeStep)),
      ),
      Animated.sequence([
        Animated.spring(banner, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
        Animated.delay(MOTION.handFullHold),
        timing(banner, 0, MOTION.flashOut * 2),
      ]),
    ]).start(({ finished }) => {
      if (finished) setNotice((current) => (current?.id === event.id ? null : current));
    });
  });

  const bannerScale = banner.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const full = handSize >= MAX_HAND_SIZE;

  return (
    <View>
      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>{children}</Animated.View>
      {full && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {handSize}/{MAX_HAND_SIZE}
          </Text>
        </View>
      )}
      {notice && (
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.banner, { opacity: banner, transform: [{ scale: bannerScale }] }]}
          >
            <Text style={styles.bannerTitle}>手札がいっぱい！</Text>
            <Text style={styles.bannerNote}>{notice.blocked} 枚引けなかった</Text>
          </Animated.View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  banner: {
    backgroundColor: COLORS.overlay,
    borderColor: COLORS.danger,
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  bannerTitle: { color: COLORS.damageText, fontSize: 18, fontWeight: '800' },
  bannerNote: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  counter: {
    position: 'absolute',
    top: 0,
    right: SPACING.xs,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 1,
    pointerEvents: 'none',
  },
  counterText: { color: COLORS.text, fontSize: 11, fontWeight: '800' },
});
