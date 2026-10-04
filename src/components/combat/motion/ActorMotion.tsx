import { type ReactNode, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { ActorId, CombatEvent, CombatSide } from '../../../domain/combat';
import { useCombatEvents } from '../../../hooks/useCombatEvents';
import { sideOf } from '../../../logic/combat';
import { MOTION } from '../../../theme';
import { burstsOn, type Keyframe, motionForEvent } from './motionPresets';

type ActorMotionProps = {
  actorId: ActorId;
  events: CombatEvent[];
  agentId: string;
  children: ReactNode;
};

/** 相手のいる方向。プレイヤーは左下にいるので右上へ、敵は右上にいるので左下へ踏み込む。 */
const FACING: Record<CombatSide, 1 | -1> = { player: 1, enemy: -1 };

/** 横に踏み込んだ距離に対する縦の移動量（斜めに向かい合っているため）。 */
const DIAGONAL = 0.6;

type BurstState = { id: number; emoji: string };

/**
 * キャラクターの絵（アイコン）を包み、カードや敵の行動に合わせて動かす。
 * 相手の技のエフェクト（斬撃など）が自分に当たる場合もここに表示する。
 */
export function ActorMotion({ actorId, events, agentId, children }: ActorMotionProps) {
  const [x] = useState(() => new Animated.Value(0));
  const [y] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [rotate] = useState(() => new Animated.Value(0));
  const [burstValue] = useState(() => new Animated.Value(0));
  const [burst, setBurst] = useState<BurstState | null>(null);
  const facing = FACING[sideOf(actorId)];

  const toKeyframe = (frame: Keyframe) => {
    const to = (value: Animated.Value, toValue: number) =>
      Animated.timing(value, { toValue, duration: frame.duration, useNativeDriver: true });
    const reach = frame.x ?? 0;
    return Animated.parallel([
      to(x, reach * facing),
      to(y, (frame.y ?? 0) - reach * DIAGONAL * facing),
      to(scale, frame.scale ?? 1),
      to(rotate, (frame.rotate ?? 0) * facing),
    ]);
  };

  const showBurst = (id: number, emoji: string, delay: number) => {
    setTimeout(() => {
      setBurst({ id, emoji });
      burstValue.setValue(0);
      Animated.timing(burstValue, {
        toValue: 1,
        duration: MOTION.burst,
        useNativeDriver: true,
      }).start();
    }, delay);
  };

  useCombatEvents(events, (event) => {
    const plan = motionForEvent(event, agentId);
    if (!plan) return;
    const { preset } = plan;
    if (plan.actor === actorId) Animated.sequence(preset.keyframes.map(toKeyframe)).start();
    if (preset.burst && burstsOn(plan, actorId)) {
      showBurst(event.id, preset.burst.emoji, preset.burst.delay);
    }
  });

  const rotateDeg = rotate.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });
  const burstScale = burstValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.4, 1.5, 1.2],
  });
  const burstOpacity = burstValue.interpolate({
    inputRange: [0, 0.15, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateX: x }, { translateY: y }, { scale }, { rotate: rotateDeg }],
      }}
    >
      {children}
      {burst && (
        <Animated.Text
          key={burst.id}
          style={[styles.burst, { opacity: burstOpacity, transform: [{ scale: burstScale }] }]}
        >
          {burst.emoji}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '20%',
    fontSize: 40,
    pointerEvents: 'none',
  },
});
