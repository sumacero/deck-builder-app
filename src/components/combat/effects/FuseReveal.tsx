import { type ReactNode, useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { CardInstance } from '../../../domain/card';
import type { PlayerState } from '../../../domain/combat';
import { describeHandCard } from '../../../logic/describe';
import { stackOf } from '../../../logic/marks';
import { ATTRIBUTE_COLORS, COLORS, HAND_LAYOUT, MOTION, RADIUS } from '../../../theme';
import { CardView } from '../../cards/CardView';

type FuseRevealProps = {
  /** 捨て札になった下の札。残った札の下から、水に溶けて引き上げられる。 */
  consumed: CardInstance;
  /** 残った札。摘んでいた札で、位置も本文も動かさない。 */
  kept: CardInstance;
  player: PlayerState;
  cardWidth: number;
  onDone: () => void;
  children: ReactNode;
};

type RingSpec = {
  color: string;
  start: number;
  end: number;
  from: number;
  to: number;
  /** 一番濃いときの不透明度。 */
  peak: number;
};

/**
 * 重ねた直後。残る札はその場のまま。
 * 下の札は下端だけ覗いていて、その場で水に溶けながら札の中へ引き込まれる。
 * 位置を飛ばして別の札に差し替えない。
 */
export function FuseReveal({ consumed, kept, player, cardWidth, onDone, children }: FuseRevealProps) {
  const [clock] = useState(() => new Animated.Value(0));
  const finish = useEffectEvent(onDone);
  const cardHeight = cardWidth * HAND_LAYOUT.aspectRatio;
  const peek = cardHeight * 0.14;
  const rings: readonly RingSpec[] = [
    { color: ATTRIBUTE_COLORS.water, start: 0.04, end: 0.7, from: 0.18, to: 1.25, peak: 0.32 },
    {
      color: kept.card.water ? ATTRIBUTE_COLORS.water : COLORS.gold,
      start: 0.16,
      end: 0.86,
      from: 0.22,
      to: 1.6,
      peak: 0.28,
    },
    { color: COLORS.gold, start: 0.3, end: 1, from: 0.3, to: 1.9, peak: 0.2 },
  ];

  useEffect(() => {
    clock.setValue(0);
    const animation = Animated.timing(clock, {
      toValue: 1,
      duration: MOTION.fuseReveal,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) finish();
    });
    return () => animation.stop();
  }, [clock, consumed.instanceId, kept.instanceId]);

  const ghostY = clock.interpolate({
    inputRange: [0, 0.78],
    outputRange: [peek, 0],
    extrapolate: 'clamp',
  });
  const ghostOpacity = clock.interpolate({
    inputRange: [0, 0.12, 0.78],
    outputRange: [0, 0.85, 0],
    extrapolate: 'clamp',
  });
  const ghostScale = clock.interpolate({
    inputRange: [0, 0.78],
    outputRange: [1, 0.94],
    extrapolate: 'clamp',
  });
  const washOpacity = clock.interpolate({
    inputRange: [0, 0.22, 0.48, 0.9],
    outputRange: [0, 0.34, 0.22, 0],
    extrapolate: 'clamp',
  });

  return (
    <View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ghost,
          { opacity: ghostOpacity, transform: [{ translateY: ghostY }, { scale: ghostScale }] },
        ]}
      >
        <CardView
          card={consumed.card}
          width={cardWidth}
          description={describeHandCard(consumed, player)}
          stack={stackOf(consumed)}
          detailOnHold={false}
        />
        <Animated.View
          style={[styles.wash, { width: cardWidth, height: cardHeight, opacity: ghostOpacity }]}
        />
      </Animated.View>
      {children}
      <View pointerEvents="none" style={styles.front}>
        {rings.map((ring) => (
          <WaterRing key={`${ring.color}-${ring.start}`} clock={clock} ring={ring} cardWidth={cardWidth} cardHeight={cardHeight} />
        ))}
        <Animated.View style={[styles.wash, { width: cardWidth, height: cardHeight, opacity: washOpacity }]} />
      </View>
    </View>
  );
}

function WaterRing({
  clock,
  ring,
  cardWidth,
  cardHeight,
}: {
  clock: Animated.Value;
  ring: RingSpec;
  cardWidth: number;
  cardHeight: number;
}) {
  const size = cardWidth * 0.86;
  const mid = ring.start + (ring.end - ring.start) * 0.4;
  const scale = clock.interpolate({
    inputRange: [0, ring.start, ring.end, 1],
    outputRange: [ring.from, ring.from, ring.to, ring.to],
    extrapolate: 'clamp',
  });
  const opacity = clock.interpolate({
    inputRange: [0, ring.start, mid, ring.end, 1],
    outputRange: [0, 0, ring.peak, 0, 0],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: (cardWidth - size) / 2,
        top: (cardHeight - size) / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: ring.color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  ghost: { position: 'absolute', top: 0, left: 0 },
  front: { position: 'absolute', top: 0, left: 0, right: 0 },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: RADIUS.md,
    backgroundColor: ATTRIBUTE_COLORS.water,
  },
});
