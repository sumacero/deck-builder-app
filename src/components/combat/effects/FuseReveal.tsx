import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { CardInstance } from '../../../domain/card';
import type { PlayerState } from '../../../domain/combat';
import { describeHandCard } from '../../../logic/describe';
import { stackOf } from '../../../logic/marks';
import { ATTRIBUTE_COLORS, COLORS, HAND_LAYOUT, MARK_COLORS, MOTION, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';
import { FusedBadge } from '../../cards/FusedBadge';

type FuseRevealProps = {
  /** 捨て札になった下の札。波紋になって沈む。 */
  consumed: CardInstance;
  /** 残った札。摘んでいた札で、段はすでに倍。位置は動かさない。 */
  kept: CardInstance;
  player: PlayerState;
  cardWidth: number;
  onDone: () => void;
};

type RingSpec = {
  color: string;
  /** 輪が広がり始める時刻（0〜1）。 */
  start: number;
  /** 輪が消える時刻（0〜1）。 */
  end: number;
  from: number;
  to: number;
};

const RINGS: readonly RingSpec[] = [
  { color: ATTRIBUTE_COLORS.water, start: 0.06, end: 0.62, from: 0.28, to: 1.55 },
  { color: COLORS.gold, start: 0.2, end: 0.82, from: 0.2, to: 1.85 },
];

/**
 * 重ねた直後。摘んでいた札はその場に残し、下の札だけが水の輪になって下へ沈む。
 * 沈みきったあと、段の印が跳ねて出る。指で置いた札を、もう一度上から降ろさない。
 */
export function FuseReveal({ consumed, kept, player, cardWidth, onDone }: FuseRevealProps) {
  const [clock] = useState(() => new Animated.Value(0));
  const finish = useEffectEvent(onDone);
  const cardHeight = cardWidth * HAND_LAYOUT.aspectRatio;
  const mark = kept.card.mark;

  useEffect(() => {
    clock.setValue(0);
    const animation = Animated.timing(clock, {
      toValue: 1,
      duration: MOTION.fuseReveal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) finish();
    });
    return () => animation.stop();
  }, [clock, consumed.instanceId, kept.instanceId]);

  const sinkY = clock.interpolate({
    inputRange: [0, 0.18, 0.76],
    outputRange: [cardHeight * 0.62, cardHeight * 0.62, cardHeight * 1.08],
    extrapolate: 'clamp',
  });
  const consumedOpacity = clock.interpolate({
    inputRange: [0, 0.22, 0.76],
    outputRange: [0.95, 0.95, 0],
    extrapolate: 'clamp',
  });
  const badgeScale = clock.interpolate({
    inputRange: [0, 0.58, 0.74, 0.88, 1],
    outputRange: [0.4, 0.4, 1.22, 1, 1],
    extrapolate: 'clamp',
  });
  const badgeOpacity = clock.interpolate({
    inputRange: [0, 0.58, 0.7, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="none" style={styles.stage}>
      <Animated.View style={[styles.layer, { opacity: consumedOpacity, transform: [{ translateY: sinkY }] }]}>
        <CardView
          card={consumed.card}
          width={cardWidth}
          description={describeHandCard(consumed, player)}
          stack={stackOf(consumed)}
          detailOnHold={false}
        />
      </Animated.View>
      {RINGS.map((ring) => (
        <WaterRing key={ring.color} clock={clock} ring={ring} cardWidth={cardWidth} cardHeight={cardHeight} />
      ))}
      {mark && (
        <Animated.View
          style={[
            styles.badge,
            { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
          ]}
        >
          <FusedBadge count={stackOf(kept)} color={MARK_COLORS[mark]} />
        </Animated.View>
      )}
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
  const size = cardWidth * 0.92;
  const mid = ring.start + (ring.end - ring.start) * 0.45;
  const scale = clock.interpolate({
    inputRange: [0, ring.start, ring.end, 1],
    outputRange: [ring.from, ring.from, ring.to, ring.to],
    extrapolate: 'clamp',
  });
  const opacity = clock.interpolate({
    inputRange: [0, ring.start, mid, ring.end, 1],
    outputRange: [0, 0, 0.9, 0, 0],
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
        borderWidth: 2,
        borderColor: ring.color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  stage: { position: 'absolute', top: 0, left: 0, right: 0 },
  layer: { position: 'absolute', top: 0, left: 0 },
  badge: {
    position: 'absolute',
    top: -SPACING.sm,
    right: -SPACING.xs,
  },
});
