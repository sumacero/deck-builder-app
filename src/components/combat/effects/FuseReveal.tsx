import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { CardInstance } from '../../../domain/card';
import type { PlayerState } from '../../../domain/combat';
import { describeFuseBurst, describeHandCard } from '../../../logic/describe';
import { stackOf } from '../../../logic/marks';
import { COLORS, HAND_LAYOUT, MOTION, RADIUS, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';

type FuseRevealProps = {
  /** 捨て札になった下の札（消える直前）。 */
  consumed: CardInstance;
  /** 残った札。摘んでいた札で、段はすでに倍。 */
  kept: CardInstance;
  player: PlayerState;
  cardWidth: number;
  onDone: () => void;
};

/**
 * 重ねた直後の手札。下の札が見えたまま、摘んでいた札が上から降りて段の説明に代わる。
 * 札の中身だけをその場で書き換えると、何が残ったか読めない。
 */
export function FuseReveal({ consumed, kept, player, cardWidth, onDone }: FuseRevealProps) {
  const [clock] = useState(() => new Animated.Value(0));
  const finish = useEffectEvent(onDone);
  const burst = describeFuseBurst(consumed.card, stackOf(consumed));

  useEffect(() => {
    clock.setValue(0);
    const animation = Animated.timing(clock, {
      toValue: 1,
      duration: MOTION.fuseReveal,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) finish();
    });
    return () => animation.stop();
  }, [clock, consumed.instanceId, kept.instanceId]);

  const consumedOpacity = clock.interpolate({
    inputRange: [0, 0.38, 0.62],
    outputRange: [1, 1, 0],
  });
  const keptOpacity = clock.interpolate({
    inputRange: [0, 0.12, 0.32],
    outputRange: [0, 0, 1],
  });
  const keptY = clock.interpolate({
    inputRange: [0, 0.12, 0.5],
    outputRange: [-48, -48, 0],
  });
  const captionOpacity = clock.interpolate({
    inputRange: [0, 0.5, 0.62, 0.86, 1],
    outputRange: [0, 0, 1, 1, 0],
  });

  return (
    <View pointerEvents="none" style={styles.stage}>
      <Animated.View style={[styles.layer, { opacity: consumedOpacity }]}>
        <CardView
          card={consumed.card}
          width={cardWidth}
          description={describeHandCard(consumed, player)}
          stack={stackOf(consumed)}
          detailOnHold={false}
        />
      </Animated.View>
      <Animated.View style={[styles.layer, { opacity: keptOpacity, transform: [{ translateY: keptY }] }]}>
        <CardView
          card={kept.card}
          width={cardWidth}
          selected
          description={describeHandCard(kept, player)}
          stack={stackOf(kept)}
          detailOnHold={false}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.caption,
          { opacity: captionOpacity, marginLeft: (cardWidth - HAND_LAYOUT.stackForecastWidth) / 2 },
        ]}
      >
        <Text style={styles.captionTitle}>
          {kept.card.name}を{consumed.card.name}の上に
        </Text>
        <Text style={styles.captionBody}>{stackOf(kept)} 段になった</Text>
        {burst !== '' && <Text style={styles.captionBody}>{burst}</Text>}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { position: 'absolute', top: 0, left: 0, right: 0 },
  layer: { position: 'absolute', top: 0, left: 0 },
  caption: {
    position: 'absolute',
    bottom: '100%',
    width: HAND_LAYOUT.stackForecastWidth,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.overlay,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  captionTitle: { color: COLORS.gold, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  captionBody: { color: COLORS.text, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
