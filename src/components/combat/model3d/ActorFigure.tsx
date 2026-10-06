import { type ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { ActorId, CombatEvent, CombatSide } from '../../../domain/combat';
import { useCombatEvents } from '../../../hooks/useCombatEvents';
import { sideOf } from '../../../logic/combat';
import { ACTOR_FIGURE } from '../../../theme';
import { motionForEvent } from '../motion/motionPresets';
import {
  type ActorAction,
  combinePoses,
  type HitReaction,
  hitReactionFor,
  pulsePose,
  sampleAction,
  sampleHit,
} from './actorActions';
import { type ActorStage, createActorStage } from './actorStage';
import type { ActorModel } from './modelTypes';

/** いつ始まった動きか。 */
type Timed<Kind> = { kind: Kind; at: number };

type ActorFigureProps = {
  /** 未登録のキャラクターは undefined で、絵文字アイコンを表示する。 */
  model: ActorModel | undefined;
  icon: string;
  actorId: ActorId;
  events: CombatEvent[];
  agentId: string;
  /** 描画領域の一辺。敵が複数並ぶときは小さくする。 */
  size?: number;
};

const FACING: Record<CombatSide, 1 | -1> = { player: 1, enemy: -1 };

/** 0 → 1 → 0 と山なりに変化する値。start からの経過で決まり、duration を過ぎると 0。 */
function pulse(start: number | null, now: number, duration: number): number {
  if (start === null) return 0;
  const progress = (now - start) / duration;
  return progress >= 0 && progress < 1 ? Math.sin(progress * Math.PI) : 0;
}

/**
 * キャラクターの見た目。3D モデルがあればローポリの 3D で、無ければ絵文字で描く。
 * プレイヤーはカードと武器ごとの動き（斬る・射る・ムチを振るう）と、ダメージに応じた被弾の動きをする。
 * 敵は行動で相手の方へ体を傾け、被弾するとのけぞる。
 */
export function ActorFigure({
  model,
  icon,
  actorId,
  events,
  agentId,
  size = ACTOR_FIGURE.size,
}: ActorFigureProps) {
  const [failed, setFailed] = useState(false);
  const stageRef = useRef<ActorStage | null>(null);
  const frameRef = useRef<number | null>(null);
  const actedAt = useRef<number | null>(null);
  const hitAt = useRef<number | null>(null);
  const action = useRef<Timed<ActorAction> | null>(null);
  const reaction = useRef<Timed<HitReaction> | null>(null);
  const isPlayer = sideOf(actorId) === 'player';

  useCombatEvents(events, (event) => {
    const plan = motionForEvent(event, agentId);
    if (plan?.actor === actorId) {
      if (plan.preset.action) action.current = { kind: plan.preset.action, at: Date.now() };
      else actedAt.current = Date.now();
    }
    if (event.kind !== 'hit' || event.target !== actorId) return;
    // プレイヤーはダメージの大きさやブロックで動きを変える。敵は今までどおりのけぞるだけ。
    const hit = isPlayer ? hitReactionFor(event) : null;
    if (hit) reaction.current = { kind: hit, at: Date.now() };
    else if (event.hpLoss > 0) hitAt.current = Date.now();
  });

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      stageRef.current?.dispose();
      stageRef.current = null;
    },
    [],
  );

  if (!model || failed) {
    return <Text style={[styles.icon, { fontSize: size * 0.56 }]}>{icon}</Text>;
  }

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    let stage: ActorStage;
    try {
      stage = createActorStage(gl, model, FACING[sideOf(actorId)]);
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
        const current = action.current;
        const hit = reaction.current;
        stage.render({
          time: (now - startedAt) / 1000,
          pose: combinePoses([
            pulsePose(
              pulse(actedAt.current, now, ACTOR_FIGURE.leanDuration),
              pulse(hitAt.current, now, ACTOR_FIGURE.recoilDuration),
            ),
            current && sampleAction(current.kind, now - current.at),
            hit && sampleHit(hit.kind, now - hit.at),
          ]),
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

  return <GLView style={[styles.view, { width: size, height: size }]} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  view: { alignSelf: 'center' },
  icon: { textAlign: 'center' },
});
