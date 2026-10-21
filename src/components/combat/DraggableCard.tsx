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
  /** 手札から捨てる・廃棄する札を選んでいる。タップでもその札を選ぶ。 */
  choosing?: boolean;
  /**
   * 持ち上げている最中。元の位置は消す。
   * 薄く残すと、10 枚近く重なった手札ではその 1 枚の向こうが透けて、手札全体が透明に見える。
   * 指についてくるカードは別の場所に描く。
   */
  dragging: boolean;
  /** 少し浮かしている札。 */
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
};

/**
 * 手札の 1 枚。触れた瞬間につまみ、そのまま指についてくる。
 * - 動かして離す: 離した場所で使う（使えない場所なら手札に戻る）。
 * - 動かさずに離す: 詳細を開く。タップでは使わない。
 * 使えないカードはつままず、タップで詳細だけ開く。
 */
export function DraggableCard({
  instanceId,
  card,
  width,
  playable,
  choosing = false,
  dragging,
  selected,
  linkColor,
  description,
  stack,
  ...handlers
}: DraggableCardProps) {
  const { onDragStart, onDragMove, onDragEnd, onDragCancel } = handlers;
  const [detailOpen, setDetailOpen] = useState(false);

  // PanResponder は指の動きの途中経過を内部に持つ。ドラッグ中に作り直すと途切れるので、
  // 渡す関数は親で同じものを使い続けてもらう（作り直しは使えるかどうかが変わったときだけ）。
  const { responder, cancel } = useMemo(() => {
    const gesture: Gesture = { dragging: false, moved: false };
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
          if (playable || choosing) {
            gesture.dragging = true;
            onDragStart(instanceId, { x: g.x0, y: g.y0 });
          }
        },
        onPanResponderMove: (_, g) => {
          if (!gesture.moved && Math.hypot(g.dx, g.dy) > DRAG_LIFT_DISTANCE) gesture.moved = true;
          if (gesture.dragging) onDragMove({ x: g.moveX, y: g.moveY });
        },
        onPanResponderRelease: (_, g) => {
          const wasDragging = gesture.dragging;
          const moved = gesture.moved || Math.hypot(g.dx, g.dy) > DRAG_LIFT_DISTANCE;
          gesture.moved = false;
          if (wasDragging && (moved || choosing)) {
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
  }, [playable, choosing, instanceId, onDragStart, onDragMove, onDragEnd, onDragCancel]);

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
          dimmed={!playable && !choosing}
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
