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

export type HandPoint = { x: number; y: number };

/**
 * 手札の各カードの中心。行は余白の内側で中央寄せなので、波紋の位置も同じ式で出す。
 */
export function handCardCenters(
  containerWidth: number,
  cardWidth: number,
  spacing: number,
  count: number,
): HandPoint[] {
  if (count <= 0 || cardWidth <= 0 || containerWidth <= 0) return [];
  const { edgePadding, topPadding, aspectRatio } = HAND_LAYOUT;
  const step = cardWidth + spacing;
  const rowWidth = cardWidth + Math.max(0, count - 1) * step;
  const inner = containerWidth - edgePadding * 2;
  const originX = edgePadding + (inner - rowWidth) / 2;
  const y = topPadding + (cardWidth * aspectRatio) / 2;
  return Array.from({ length: count }, (_, index) => ({
    x: originX + cardWidth / 2 + index * step,
    y,
  }));
}
