import { HAND_LAYOUT } from '../../theme';

/**
 * 手札の表示幅から、visibleCards 枚がちょうど収まるカード幅を求める。
 * 高さに上限があれば（横向き）、それを超えない幅に抑える。
 */
export function handCardWidth(
  containerWidth: number,
  maxCardHeight = Number.POSITIVE_INFINITY,
): number {
  const { visibleCards, gap, edgePadding, aspectRatio } = HAND_LAYOUT;
  const available = containerWidth - edgePadding * 2 - gap * (visibleCards - 1);
  return Math.max(0, Math.floor(Math.min(available / visibleCards, maxCardHeight / aspectRatio)));
}
