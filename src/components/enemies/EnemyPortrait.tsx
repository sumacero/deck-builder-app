import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { ACTOR_FIGURE, COLORS, MOTION } from '../../theme';
import { enemyArt } from './enemyArt';

type EnemyPortraitProps = {
  enemyId: string;
  /** 絵が無いときの絵文字。 */
  icon: string;
  size?: number;
  /** 待機の上下揺れ（戦闘・図鑑で有効）。 */
  idle?: boolean;
};

/**
 * 敵の切り紙調立ち絵。黒縁の切り抜き PNG。
 * プレイヤーと同じく ActorMotion の外側で揺れ・被弾移動をかけられる。
 */
export function EnemyPortrait({
  enemyId,
  icon,
  size = ACTOR_FIGURE.size,
  idle = true,
}: EnemyPortraitProps) {
  const art = enemyArt(enemyId);
  const width = Math.round(size * 0.75);
  const [bob] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!idle || !art) {
      bob.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: MOTION.portraitIdle,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: MOTION.portraitIdle,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [art, bob, idle]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  if (!art) {
    return (
      <View style={[styles.fallback, { width, height: size }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ width, height: size, transform: [{ translateY }] }}>
      <Image
        source={art}
        style={styles.image}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48, color: COLORS.text },
});
