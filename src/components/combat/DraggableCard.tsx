import { useMemo } from 'react';
import { PanResponder, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
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

/** 上方向に指を動かしたら、ScrollView や長押しからタッチを奪ってドラッグにする。 */
const DRAG_START_DISTANCE = 8;

/**
 * 手札の 1 枚。上へスワイプすると持ち上がり、指を離した場所で使われる（タップで使えるかは親が決める）。
 * 横方向の動きは手札のスクロールに、長押しは用語の解説に任せる。
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
  // PanResponder は指の動きの途中経過を内部に持つ。ドラッグ中に作り直すと途切れるので、
  // 渡す関数は親で同じものを使い続けてもらう（作り直しは使えるかどうかが変わったときだけ）。
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, g) =>
          playable && g.dy < -DRAG_START_DISTANCE && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: (_, g) => onDragStart(instanceId, { x: g.moveX, y: g.moveY }),
        onPanResponderMove: (_, g) => onDragMove({ x: g.moveX, y: g.moveY }),
        onPanResponderRelease: (_, g) => onDragEnd({ x: g.moveX, y: g.moveY }),
        onPanResponderTerminate: onDragCancel,
        onPanResponderTerminationRequest: () => false,
      }),
    [playable, instanceId, onDragStart, onDragMove, onDragEnd, onDragCancel],
  );

  return (
    <View {...responder.panHandlers} style={{ opacity: dragging ? 0.25 : 1 }}>
      <CardView card={card} width={width} dimmed={!playable} onPress={() => onTap(instanceId)} />
    </View>
  );
}
