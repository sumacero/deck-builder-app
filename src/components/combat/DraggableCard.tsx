import { useEffect, useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { CardDetailSheet } from '../cards/CardDetailSheet';
import { CardView } from '../cards/CardView';
import type { Point } from './cardDrop';

export type CardDragHandlers = {
  onDragStart: (instanceId: string, point: Point) => void;
  onDragMove: (point: Point) => void;
  onDragEnd: (point: Point) => void;
  onDragCancel: () => void;
  /** スワイプせずにタップした。 */
  onTap: (instanceId: string) => void;
};

type DraggableCardProps = CardDragHandlers & {
  instanceId: string;
  card: CardDefinition;
  width: number;
  playable: boolean;
  /** 持ち上げている最中。元の位置は薄く残す。 */
  dragging: boolean;
};

/** 上方向にこれだけ指が動いたら、カードを持ち上げる。 */
const DRAG_START_DISTANCE = 8;
/** これより指が動いたら、タップでも長押しでもない（横スクロールや指のぶれ）。 */
const MOVE_TOLERANCE = 10;
/** 押し続けてこの時間が経つと「長押し」。離したときに詳細を開く。 */
const LONG_PRESS_MS = 450;

type Gesture = {
  dragging: boolean;
  /** 長押しが成立していて、離せば詳細を開く。 */
  armed: boolean;
  moved: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

/**
 * 手札の 1 枚。タップ・長押し・スワイプを 1 つのジェスチャーで見分ける。
 * - 上へスワイプ: 持ち上げて、離した場所で使う。
 * - 長押し: 金枠で知らせ、指を離したときに詳細を開く（そのままスワイプすればドラッグになり、詳細は開かない）。
 * - タップ: 親に知らせる（タップで使えるかは親が決める）。
 * 横方向の動きは手札のスクロールに譲る。
 */
export function DraggableCard({
  instanceId,
  card,
  width,
  playable,
  dragging,
  ...handlers
}: DraggableCardProps) {
  const { onDragStart, onDragMove, onDragEnd, onDragCancel, onTap } = handlers;
  const [armed, setArmed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // PanResponder は指の動きの途中経過を内部に持つ。ドラッグ中に作り直すと途切れるので、
  // 渡す関数は親で同じものを使い続けてもらう（作り直しは使えるかどうかが変わったときだけ）。
  const { responder, cancel } = useMemo(() => {
    const gesture: Gesture = { dragging: false, armed: false, moved: false, timer: null };
    const clearTimer = () => {
      if (gesture.timer !== null) clearTimeout(gesture.timer);
      gesture.timer = null;
    };
    const disarm = () => {
      clearTimer();
      if (gesture.armed) setArmed(false);
      gesture.armed = false;
    };
    const reset = () => {
      disarm();
      gesture.dragging = false;
      gesture.moved = false;
    };
    return {
      cancel: reset,
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        // 既定（true）だと Android で手札の ScrollView が指を奪えず、横スクロールできなくなる。
        onShouldBlockNativeResponder: () => false,
        onPanResponderGrant: () => {
          reset();
          gesture.timer = setTimeout(() => {
            gesture.timer = null;
            if (gesture.dragging || gesture.moved) return;
            gesture.armed = true;
            setArmed(true);
          }, LONG_PRESS_MS);
        },
        onPanResponderMove: (_, g) => {
          const point = { x: g.moveX, y: g.moveY };
          if (gesture.dragging) {
            onDragMove(point);
            return;
          }
          const liftingUp = g.dy < -DRAG_START_DISTANCE && Math.abs(g.dy) > Math.abs(g.dx);
          if (playable && liftingUp) {
            disarm();
            gesture.dragging = true;
            onDragStart(instanceId, point);
            return;
          }
          if (Math.abs(g.dx) > MOVE_TOLERANCE || Math.abs(g.dy) > MOVE_TOLERANCE) {
            gesture.moved = true;
            disarm();
          }
        },
        onPanResponderRelease: (_, g) => {
          const { dragging: wasDragging, armed: wasArmed, moved } = gesture;
          reset();
          if (wasDragging) onDragEnd({ x: g.moveX, y: g.moveY });
          else if (wasArmed) setDetailOpen(true);
          else if (!moved) onTap(instanceId);
        },
        // 持ち上げている間は手札のスクロールに奪わせない。それ以外は横スクロールに譲る。
        onPanResponderTerminationRequest: () => !gesture.dragging,
        onPanResponderTerminate: () => {
          const wasDragging = gesture.dragging;
          reset();
          if (wasDragging) onDragCancel();
        },
      }),
    };
  }, [playable, instanceId, onDragStart, onDragMove, onDragEnd, onDragCancel, onTap]);

  useEffect(() => cancel, [cancel]);

  return (
    <>
      <View {...responder.panHandlers} style={{ opacity: dragging ? 0.25 : 1 }}>
        <CardView
          card={card}
          width={width}
          dimmed={!playable}
          selected={armed}
          detailOnHold={false}
        />
      </View>
      {/* Modal 内のタッチも React の親へ伝わるので、ジェスチャーを受ける View の外に置く。 */}
      {detailOpen && <CardDetailSheet card={card} visible onClose={() => setDetailOpen(false)} />}
    </>
  );
}
