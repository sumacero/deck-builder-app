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
 * 画面上の点に重なっている手札の番号。右の札が手前なので、重なりは右から調べる。
 * skipIndex は、いま持ち上げている札。origin は手札の枠の画面座標。
 */
export function handCardAtPoint(
  point: HandPoint,
  origin: HandPoint,
  containerWidth: number,
  cardWidth: number,
  count: number,
  skipIndex: number,
): number | null {
  if (count <= 0 || cardWidth <= 0 || containerWidth <= 0) return null;
  const spacing = handCardSpacing(containerWidth, cardWidth, count);
  const centers = handCardCenters(containerWidth, cardWidth, spacing, count);
  const height = cardWidth * HAND_LAYOUT.aspectRatio;
  const localX = point.x - origin.x;
  const localY = point.y - origin.y;
  for (let index = count - 1; index >= 0; index -= 1) {
    if (index === skipIndex) continue;
    const center = centers[index];
    if (!center) continue;
    const left = center.x - cardWidth / 2;
    const top = center.y - height / 2;
    if (localX >= left && localX <= left + cardWidth && localY >= top && localY <= top + height) return index;
  }
  return null;
}

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
