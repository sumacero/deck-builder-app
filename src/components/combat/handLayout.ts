import { HAND_LAYOUT } from '../../theme';

/** 手札の表示幅から、visibleCards 枚がちょうど収まるカード幅を求める。 */
export function handCardWidth(containerWidth: number): number {
  const { visibleCards, gap, edgePadding } = HAND_LAYOUT;
  const available = containerWidth - edgePadding * 2 - gap * (visibleCards - 1);
  return Math.max(0, Math.floor(available / visibleCards));
}
