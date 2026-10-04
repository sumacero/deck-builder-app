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

/**
 * 隣のカードとの間隔（カードの左端どうしの距離からカード幅を引いた値）。
 * 収まる枚数ならふつうの隙間、多いときは負の値になり、カードを重ねて全部を幅に収める。
 */
export function handCardSpacing(containerWidth: number, cardWidth: number, count: number): number {
  const { gap, edgePadding } = HAND_LAYOUT;
  if (count <= 1) return gap;
  const available = containerWidth - edgePadding * 2;
  const step = Math.min(cardWidth + gap, (available - cardWidth) / (count - 1));
  return step - cardWidth;
}
