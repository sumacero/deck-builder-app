import { StyleSheet, View } from 'react-native';
import { COLORS, MAP_LAYOUT, RADIUS } from '../../theme';
import type { Point } from './mapLayout';

type MapEdgeProps = {
  from: Point;
  to: Point;
  /** 実際に通った道。 */
  traveled: boolean;
};

/** 2 つのマスを結ぶ点線。マスに重なる部分には点を打たない。 */
export function MapEdge({ from, to, traveled }: MapEdgeProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const count = Math.floor(length / MAP_LAYOUT.dotSpacing);
  const margin = MAP_LAYOUT.nodeSize / 2 + 2;

  const dots: Point[] = [];
  for (let i = 1; i < count; i++) {
    const t = i / count;
    if (t * length < margin || (1 - t) * length < margin) continue;
    dots.push({ x: from.x + dx * t, y: from.y + dy * t });
  }

  return (
    <>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            traveled && styles.traveled,
            { left: dot.x - MAP_LAYOUT.dotSize / 2, top: dot.y - MAP_LAYOUT.dotSize / 2 },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: MAP_LAYOUT.dotSize,
    height: MAP_LAYOUT.dotSize,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.panelBorder,
  },
  traveled: { backgroundColor: COLORS.gold },
});
