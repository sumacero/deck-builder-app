import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { COLORS, MOTION } from '../../../theme';

export type FloatingTextTone = 'damage' | 'guard' | 'heal';

type FloatingTextProps = {
  text: string;
  tone: FloatingTextTone;
  offsetX: number;
  large: boolean;
  onDone: () => void;
};

const TONE_COLOR: Record<FloatingTextTone, string> = {
  damage: COLORS.damageText,
  guard: COLORS.block,
  heal: COLORS.heal,
};

/** ポップして浮き上がりながら消える文字（ダメージ数値など）。 */
export function FloatingText({ text, tone, offsetX, large, onDone }: FloatingTextProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const finish = useEffectEvent(onDone);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: MOTION.floatingText,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) finish();
    });
    return () => animation.stop();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const scale = progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.5, 1.3, 1] });
  const opacity = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.Text
      style={[
        styles.text,
        large && styles.large,
        {
          color: TONE_COLOR[tone],
          opacity,
          transform: [{ translateX: offsetX }, { translateY }, { scale }],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: COLORS.textOutline,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  large: { fontSize: 38 },
});
