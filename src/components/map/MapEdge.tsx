import { View } from 'react-native';
import { MAP_LAYOUT, MAP_PATH, RADIUS } from '../../theme';
import type { Point } from './mapLayout';

type MapEdgeProps = {
  from: Point;
  to: Point;
  fromRadius: number;
  toRadius: number;
  /** 今いるマスから、次に進めるマスへ。 */
  next: boolean;
  /** 実際に通った道。 */
  traveled: boolean;
};

/** 線の端を、相手へ distance だけ近づける。マスのアイコンに線を重ねない。 */
function pull(from: Point, toward: Point, distance: number): Point {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return from;
  const t = Math.min(distance, length / 2) / length;
  return { x: from.x + dx * t, y: from.y + dy * t };
}

/**
 * 2 つのマスを結ぶ実線。暗い縁取りの上に明るい線を引き、背景の絵の上でも道が途切れない。
 * 次に進める道は太く明るく、通った道は金、まだ先の道も同じ明るさで残して進路を読めるようにする。
 */
export function MapEdge({ from, to, fromRadius, toRadius, next, traveled }: MapEdgeProps) {
  const start = pull(from, to, fromRadius + MAP_LAYOUT.lineInset);
  const end = pull(to, from, toRadius + MAP_LAYOUT.lineInset);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length < 2) return null;

  const thickness = next ? MAP_LAYOUT.nextLineWidth : MAP_LAYOUT.lineWidth;
  const outline = next ? MAP_LAYOUT.nextLineOutline : MAP_LAYOUT.lineOutline;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const rotate = `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`;
  const color = next ? MAP_PATH.next : traveled ? MAP_PATH.taken : MAP_PATH.ahead;

  const bar = (height: number, backgroundColor: string) => ({
    position: 'absolute' as const,
    left: midX - length / 2,
    top: midY - height / 2,
    width: length,
    height,
    borderRadius: RADIUS.round,
    backgroundColor,
    transform: [{ rotate }],
  });

  return (
    <>
      <View pointerEvents="none" style={bar(outline, MAP_PATH.outline)} />
      <View pointerEvents="none" style={bar(thickness, color)} />
    </>
  );
}
