import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent } from '../../domain/combat';
import { useAgentPose } from '../../hooks/useAgentPose';
import { ACTOR_FIGURE, COLORS, MOTION } from '../../theme';
import { agentArt } from './agentArt';
import {
  agentPoseArt,
  hasAgentPoses,
  type AgentPose,
} from './agentPoses';

const ALL_POSES: readonly AgentPose[] = ['idle', 'guard', 'slash', 'downed', 'victory'];

type AgentPortraitProps = {
  agentId: string;
  /** フォールバック用（絵が無いときの絵文字）。 */
  icon: string;
  /** 表示の高さ。未指定ならテーマの戦闘上限。幅は画像比率に合わせる。 */
  size?: number;
  /** 待機の上下揺れ（戦闘・タイトルで有効）。敗北・勝利ポーズでは止める。 */
  idle?: boolean;
  /** 渡すと戦闘イベントでポーズを切り替える（盾構え・斬撃・敗北・勝利）。 */
  events?: CombatEvent[];
  defeated?: boolean;
  /** イベント無しでポーズを固定したいとき（図鑑など）。 */
  pose?: AgentPose;
};

/**
 * プレイヤーの切り紙調立ち絵。黒縁の切り抜き PNG。
 * ポーズは画像の読み込み待ちで消えないよう、全ポーズを重ねて opacity だけで切り替える。
 */
export function AgentPortrait({
  agentId,
  icon,
  size = ACTOR_FIGURE.size,
  idle = true,
  events,
  defeated = false,
  pose: poseProp,
}: AgentPortraitProps) {
  const eventPose = useAgentPose(events ?? [], { agentId, defeated });
  const pose = poseProp ?? (events ? eventPose : 'idle');
  const width = Math.round(size * 0.75);
  const [bob] = useState(() => new Animated.Value(0));
  const bobbing = idle && pose === 'idle';
  const layered = hasAgentPoses(agentId);
  const single = layered ? undefined : agentArt(agentId);

  useEffect(() => {
    if (!bobbing) {
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
  }, [bob, bobbing]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  if (!layered && !single) {
    return (
      <View style={[styles.fallback, { width, height: size }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ width, height: size, transform: [{ translateY }] }}>
      {layered
        ? ALL_POSES.map((name) => {
            const source = agentPoseArt(agentId, name);
            if (!source) return null;
            return (
              <Image
                key={name}
                source={source}
                // opacity 0 だと Android で画像がデコードされず、切替時に消えて見えることがある。
                style={[styles.image, styles.layer, { opacity: pose === name ? 1 : 0.01 }]}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            );
          })
        : single && (
            <Image
              source={single}
              style={styles.image}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 48, color: COLORS.text },
});
