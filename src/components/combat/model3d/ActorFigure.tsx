import { type ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { CombatEvent, CombatTarget } from '../../../domain/combat';
import { useCombatEvents } from '../../../hooks/useCombatEvents';
import { ACTOR_FIGURE } from '../../../theme';
import { motionForEvent } from '../motion/motionPresets';
import { type ActorStage, createActorStage } from './actorStage';
import type { ActorModel } from './modelTypes';

type ActorFigureProps = {
  /** 未登録のキャラクターは undefined で、絵文字アイコンを表示する。 */
  model: ActorModel | undefined;
  icon: string;
  side: CombatTarget;
  events: CombatEvent[];
  agentId: string;
};

const FACING: Record<CombatTarget, 1 | -1> = { player: 1, enemy: -1 };

/** 0 → 1 → 0 と山なりに変化する値。start からの経過で決まり、duration を過ぎると 0。 */
function pulse(start: number | null, now: number, duration: number): number {
  if (start === null) return 0;
  const progress = (now - start) / duration;
  return progress >= 0 && progress < 1 ? Math.sin(progress * Math.PI) : 0;
}

/**
 * キャラクターの見た目。3D モデルがあればローポリの 3D で、無ければ絵文字で描く。
 * 自分の行動では相手の方へ体を傾け、被弾するとのけぞる。
 */
export function ActorFigure({ model, icon, side, events, agentId }: ActorFigureProps) {
  const [failed, setFailed] = useState(false);
  const stageRef = useRef<ActorStage | null>(null);
  const frameRef = useRef<number | null>(null);
  const actedAt = useRef<number | null>(null);
  const hitAt = useRef<number | null>(null);

  useCombatEvents(events, (event) => {
    if (motionForEvent(event, agentId)?.actor === side) actedAt.current = Date.now();
    if (event.kind === 'hit' && event.target === side && event.hpLoss > 0) {
      hitAt.current = Date.now();
    }
  });

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      stageRef.current?.dispose();
      stageRef.current = null;
    },
    [],
  );

  if (!model || failed) return <Text style={styles.icon}>{icon}</Text>;

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    let stage: ActorStage;
    try {
      stage = createActorStage(gl, model, FACING[side]);
    } catch (error: unknown) {
      console.warn('3D 表示を初期化できなかったため絵文字で表示します', error);
      setFailed(true);
      return;
    }
    stageRef.current = stage;
    const startedAt = Date.now();
    const loop = () => {
      const now = Date.now();
      try {
        stage.render({
          time: (now - startedAt) / 1000,
          lean: pulse(actedAt.current, now, ACTOR_FIGURE.leanDuration),
          recoil: pulse(hitAt.current, now, ACTOR_FIGURE.recoilDuration),
        });
      } catch (error: unknown) {
        console.warn('3D 表示の描画に失敗したため絵文字で表示します', error);
        setFailed(true);
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  return <GLView style={styles.view} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  view: {
    width: ACTOR_FIGURE.size,
    height: ACTOR_FIGURE.size,
    alignSelf: 'center',
  },
  icon: { fontSize: 72, textAlign: 'center' },
});
