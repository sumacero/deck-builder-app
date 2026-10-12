import { useEffect, useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { CardDetailSheet } from '../cards/CardDetailSheet';
import { CardView } from '../cards/CardView';
import { DRAG_LIFT_DISTANCE, type DragMoveHandlers, type Point } from './cardDrop';

export type CardDragHandlers = DragMoveHandlers & {
  onDragStart: (instanceId: string, point: Point) => void;
};

type DraggableCardProps = CardDragHandlers & {
  instanceId: string;
  card: CardDefinition;
  width: number;
  playable: boolean;
  /**
   * 持ち上げている最中。元の位置は消す。
   * 薄く残すと、10 枚近く重なった手札ではその 1 枚の向こうが透けて、手札全体が透明に見える。
   * 指についてくるカードは別の場所に描く。
   */
  dragging: boolean;
  /** タップして、狙う敵を選んでいる最中のカード。 */
  selected: boolean;
  /** この札が融合の相手になっているとき、印の色で枠を光らせる。 */
  linkColor?: string;
  /** 重ねたあとの数字。省略すると、カードに書かれた効果。 */
  description?: string;
  /** 札の段。 */
  stack?: number;
};

/** 敵を選んでいる最中のカードを浮かべる量。波紋の起点も同じだけ上げる。 */
export const CARD_SELECT_LIFT = -6;

type Gesture = {
  dragging: boolean;
  /** 指がつまんだ位置から DRAG_LIFT_DISTANCE より動いた。 */
  moved: boolean;
  origin: Point;
};

/**
 * 手札の 1 枚。動かしたときだけつまみ、指についてくる。
 * - 動かして離す: 離した場所で使うか、もう一枚の上に重ねる。
 * - 動かさずに離す: 詳細を開く。タップでは使わない。
 * 使えないカードはつままず、タップで詳細だけ開く。
 */
export function DraggableCard({
  instanceId,
  card,
  width,
  playable,
  dragging,
  selected,
  linkColor,
  description,
  stack,
  ...handlers
}: DraggableCardProps) {
  const { onPressIn, onDragStart, onDragMove, onDragEnd, onDragCancel } = handlers;
  const [detailOpen, setDetailOpen] = useState(false);

  // PanResponder は指の動きの途中経過を内部に持つ。ドラッグ中に作り直すと途切れるので、
  // 渡す関数は親で同じものを使い続けてもらう（作り直しは使えるかどうかが変わったときだけ）。
  const { responder, cancel } = useMemo(() => {
    const gesture: Gesture = { dragging: false, moved: false, origin: { x: 0, y: 0 } };
    /** つまんでいたカードを手札に戻す。 */
    const drop = () => {
      if (gesture.dragging) onDragCancel();
      gesture.dragging = false;
    };
    const reset = () => {
      drop();
      gesture.moved = false;
    };
    return {
      cancel: reset,
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          reset();
          gesture.origin = { x: g.x0, y: g.y0 };
          onPressIn();
        },
        onPanResponderMove: (_, g) => {
          if (!gesture.moved && Math.hypot(g.dx, g.dy) > DRAG_LIFT_DISTANCE) {
            gesture.moved = true;
            if (playable) {
              gesture.dragging = true;
              onDragStart(instanceId, gesture.origin);
            }
          }
          if (gesture.dragging) onDragMove({ x: g.moveX, y: g.moveY });
        },
        onPanResponderRelease: (_, g) => {
          const moved = gesture.moved || Math.hypot(g.dx, g.dy) > DRAG_LIFT_DISTANCE;
          const wasDragging = gesture.dragging;
          gesture.moved = false;
          if (moved && wasDragging) {
            gesture.dragging = false;
            onDragEnd({ x: g.moveX, y: g.moveY }, { x: g.vx, y: g.vy });
            return;
          }
          drop();
          if (!moved) setDetailOpen(true);
        },
        // つまんでいる間は、ほかに指を奪わせない。
        onPanResponderTerminationRequest: () => !gesture.dragging,
        onPanResponderTerminate: reset,
      }),
    };
  }, [playable, instanceId, onPressIn, onDragStart, onDragMove, onDragEnd, onDragCancel]);

  useEffect(() => cancel, [cancel]);

  return (
    <>
      <View
        {...responder.panHandlers}
        style={{ opacity: dragging ? 0 : 1, transform: [{ translateY: selected ? CARD_SELECT_LIFT : 0 }] }}
      >
        <CardView
          card={card}
          width={width}
          dimmed={!playable}
          selected={selected}
          linkColor={linkColor}
          description={description}
          stack={stack}
          detailOnHold={false}
        />
      </View>
      {/* Modal 内のタッチも React の親へ伝わるので、ジェスチャーを受ける View の外に置く。 */}
      {detailOpen && (
        <CardDetailSheet
          card={card}
          description={description}
          stack={stack}
          visible
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
