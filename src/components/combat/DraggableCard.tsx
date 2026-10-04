import { useEffect, useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { CardDetailSheet } from '../cards/CardDetailSheet';
import { CardView } from '../cards/CardView';
import type { DragMoveHandlers, Point } from './cardDrop';

export type CardDragHandlers = DragMoveHandlers & {
  onDragStart: (instanceId: string, point: Point) => void;
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
  /** タップして、狙う敵を選んでいる最中のカード。 */
  selected: boolean;
};

/** 上方向にこれだけ指が動いたら、カードを持ち上げる。 */
const DRAG_START_DISTANCE = 6;
/** 縦の動きが横の動きのこの倍率より大きければ「上へ」。斜め上へ素早く払っても持ち上がるよう少し甘くする。 */
const LIFT_SLOPE = 0.8;
/** これより指が動いたら、タップでも長押しでもない（横スクロールや指のぶれ）。 */
const MOVE_TOLERANCE = 10;
/** 押し続けてこの時間が経つと「長押し」。離したときに詳細を開く。 */
const LONG_PRESS_MS = 450;

/** 押している間、カードを少し浮かせて「つまんだ」ことを指が動く前から見せる。 */
const PRESS_LIFT = -6;

const isLiftingUp = (dx: number, dy: number) =>
  dy < -DRAG_START_DISTANCE && -dy > Math.abs(dx) * LIFT_SLOPE;

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
  selected,
  ...handlers
}: DraggableCardProps) {
  const { onPressIn, onDragStart, onDragMove, onDragEnd, onDragCancel, onTap } = handlers;
  const [armed, setArmed] = useState(false);
  const [pressed, setPressed] = useState(false);
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
      setPressed(false);
    };
    return {
      cancel: reset,
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        // 既定（true）だと Android で手札の ScrollView が指を奪えず、横スクロールできなくなる。
        onShouldBlockNativeResponder: () => false,
        onPanResponderGrant: () => {
          reset();
          onPressIn();
          setPressed(true);
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
          if (playable && isLiftingUp(g.dx, g.dy)) {
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
          const point = { x: g.moveX, y: g.moveY };
          const velocity = { x: g.vx, y: g.vy };
          if (wasDragging) {
            onDragEnd(point, velocity);
          } else if (playable && isLiftingUp(g.dx, g.dy)) {
            // 指の動きの知らせが来る前に離すほど素早いフリック。持ち上げてすぐ離したことにする。
            onDragStart(instanceId, point);
            onDragEnd(point, velocity);
          } else if (wasArmed) setDetailOpen(true);
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
  }, [playable, instanceId, onPressIn, onDragStart, onDragMove, onDragEnd, onDragCancel, onTap]);

  useEffect(() => cancel, [cancel]);

  return (
    <>
      <View
        {...responder.panHandlers}
        style={{
          opacity: dragging ? 0.25 : 1,
          transform: [{ translateY: pressed || selected ? PRESS_LIFT : 0 }],
        }}
      >
        <CardView
          card={card}
          width={width}
          dimmed={!playable}
          selected={armed || selected}
          detailOnHold={false}
        />
      </View>
      {/* Modal 内のタッチも React の親へ伝わるので、ジェスチャーを受ける View の外に置く。 */}
      {detailOpen && <CardDetailSheet card={card} visible onClose={() => setDetailOpen(false)} />}
    </>
  );
}
