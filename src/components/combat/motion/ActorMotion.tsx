import { type ReactNode, useCallback, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { ActorId, CombatEvent, CombatSide } from '../../../domain/combat';
import { useCombatEvents } from '../../../hooks/useCombatEvents';
import { sideOf } from '../../../logic/combat';
import { CombatVfx } from '../effects/CombatVfx';
import {
  burstsOn,
  type Keyframe,
  motionForEvent,
  PLAYER_FLINCH,
  type VfxKind,
} from './motionPresets';

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

type BurstState = { id: number; kind: VfxKind };

/**
 * キャラクターの絵を包み、カードや敵の行動に合わせて動かす。
 * 斬撃などのアニメ風 VFX も、当たる側の位置に重ねて出す。
 */
export function ActorMotion({ actorId, events, agentId, children }: ActorMotionProps) {
  const [x] = useState(() => new Animated.Value(0));
  const [y] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [rotate] = useState(() => new Animated.Value(0));
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

  const showBurst = useCallback((id: number, kind: VfxKind, delay: number) => {
    setTimeout(() => setBurst({ id, kind }), delay);
  }, []);

  const clearBurst = useCallback(() => setBurst(null), []);

  useCombatEvents(events, (event) => {
    const plan = motionForEvent(event, agentId);
    if (!plan) return;
    const { preset } = plan;
    if (plan.actor === actorId) Animated.sequence(preset.keyframes.map(toKeyframe)).start();
    if (preset.burst && burstsOn(plan, actorId)) {
      showBurst(event.id, preset.burst.kind, preset.burst.delay);
    }
    // 敵の攻撃を受けたプレイヤーはのけぞる。
    if (
      actorId === 'player' &&
      event.kind === 'enemyAct' &&
      event.action === 'attack' &&
      plan.opponents.includes('player')
    ) {
      Animated.sequence(PLAYER_FLINCH.keyframes.map(toKeyframe)).start();
      if (PLAYER_FLINCH.burst) {
        showBurst(event.id + 10_000, PLAYER_FLINCH.burst.kind, PLAYER_FLINCH.burst.delay);
      }
    }
  });

  const rotateDeg = rotate.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateX: x }, { translateY: y }, { scale }, { rotate: rotateDeg }],
      }}
    >
      {children}
      {burst && (
        <View style={styles.vfxLayer} pointerEvents="none">
          <CombatVfx key={burst.id} kind={burst.kind} playId={burst.id} onDone={clearBurst} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  vfxLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'visible',
  },
});
