import { useEffect, useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { CardDetailSheet } from '../cards/CardDetailSheet';
import { CardView } from '../cards/CardView';
import { DRAG_LIFT_DISTANCE, type DragMoveHandlers, type Point } from './cardDrop';

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

/** 指を動かさずに押し続けてこの時間が経つと「長押し」。離したときに詳細を開く。 */
const LONG_PRESS_MS = 450;

type Gesture = {
  dragging: boolean;
  /** 長押しが成立していて、離せば詳細を開く。 */
  armed: boolean;
  /** 指がつまんだ位置から DRAG_LIFT_DISTANCE より動いた（タップでも長押しでもない）。 */
  moved: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

/**
 * 手札の 1 枚。触れた瞬間につまみ、そのまま指についてくる。
 * - 動かして離す: 離した場所で使う（使えない場所なら手札に戻る）。
 * - 動かさずに離す: タップ（タップで使えるかは親が決める）。
 * - 動かさずに押し続ける: カードを手札に戻して金枠で知らせ、離したときに詳細を開く（そこから動かせば再びつまむ）。
 * 使えないカードはつままず、タップと長押しだけ。
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
    /** つまんでいたカードを手札に戻す。 */
    const drop = () => {
      if (gesture.dragging) onDragCancel();
      gesture.dragging = false;
    };
    const reset = () => {
      disarm();
      drop();
      gesture.moved = false;
    };
    return {
      cancel: reset,
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          reset();
          if (playable) {
            gesture.dragging = true;
            onDragStart(instanceId, { x: g.x0, y: g.y0 });
          }
          gesture.timer = setTimeout(() => {
            gesture.timer = null;
            if (gesture.moved) return;
            // 詳細を見ようとしている。つまんだカードは手札に戻し、金枠で知らせる。
            drop();
            gesture.armed = true;
            setArmed(true);
          }, LONG_PRESS_MS);
        },
        onPanResponderMove: (_, g) => {
          if (!gesture.moved && Math.hypot(g.dx, g.dy) > DRAG_LIFT_DISTANCE) {
            gesture.moved = true;
            disarm();
            // 長押しのあとで動かしたら、改めてつまむ。
            if (playable && !gesture.dragging) {
              gesture.dragging = true;
              onDragStart(instanceId, { x: g.x0, y: g.y0 });
            }
          }
          if (gesture.dragging) onDragMove({ x: g.moveX, y: g.moveY });
        },
        onPanResponderRelease: (_, g) => {
          const { armed: wasArmed, dragging: wasDragging } = gesture;
          const moved = gesture.moved || Math.hypot(g.dx, g.dy) > DRAG_LIFT_DISTANCE;
          disarm();
          gesture.moved = false;
          if (moved && wasDragging) {
            gesture.dragging = false;
            onDragEnd({ x: g.moveX, y: g.moveY }, { x: g.vx, y: g.vy });
            return;
          }
          drop();
          if (moved) return;
          if (wasArmed) setDetailOpen(true);
          else onTap(instanceId);
        },
        // つまんでいる間は、ほかに指を奪わせない。
        onPanResponderTerminationRequest: () => !gesture.dragging,
        onPanResponderTerminate: reset,
      }),
    };
  }, [playable, instanceId, onDragStart, onDragMove, onDragEnd, onDragCancel, onTap]);

  useEffect(() => cancel, [cancel]);

  return (
    <>
      <View
        {...responder.panHandlers}
        style={{ opacity: dragging ? 0.25 : 1, transform: [{ translateY: selected ? LIFT : 0 }] }}
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

/** 敵を選んでいる最中のカードは少し浮かせる。 */
const LIFT = -6;
