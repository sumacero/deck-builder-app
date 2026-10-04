import { ACTOR_FIGURE, COMBAT_LAYOUT, SPACING } from '../../theme';

export type Size = { width: number; height: number };

export type FigureSizes = {
  /** 敵 1 体ぶんの 3D の一辺。 */
  enemy: number;
  player: number;
  /** 文字を小さくした詰めた表示にするか。 */
  compact: boolean;
};

/** 測る前（幅や高さが 0）は 0 を返し、3D は描かずに待つ。 */
const UNMEASURED: FigureSizes = { enemy: 0, player: 0, compact: false };

const isMeasured = (size: Size) => size.width > 0 && size.height > 0;

/** 上限のうち一番厳しいものに合わせ、刻みに丸めて下限・上限の範囲に収める。 */
function fit(...limits: number[]): number {
  const { size, minSize, step } = ACTOR_FIGURE;
  const raw = Math.min(size, ...limits);
  return Math.max(minSize, Math.floor(raw / step) * step);
}

/** 敵を横一列に並べたときの 1 体ぶんの幅。1 体だけなら舞台の一部（右寄せ）に置く。 */
export function enemySlotWidth(rowWidth: number, count: number, soloRatio: number): number {
  if (count <= 1) return rowWidth * soloRatio;
  return (rowWidth - SPACING.sm * (count - 1)) / count;
}

/**
 * 縦向き: 上に敵の列、左下に自分。縦に重ならないよう、高さを敵と自分で分け合う。
 * 敵が多くて横幅で小さくなったぶん、自分は大きく描ける。
 */
export function portraitFigures(stage: Size, enemyCount: number): FigureSizes {
  if (!isMeasured(stage)) return UNMEASURED;
  const {
    compactEnemyCount,
    compactEnemyChrome,
    enemyChrome,
    playerChrome,
    panelInset,
    soloEnemyWidthRatio,
    playerWidthRatio,
  } = COMBAT_LAYOUT;
  const compact = enemyCount >= compactEnemyCount;
  const chrome = compact ? compactEnemyChrome : enemyChrome;
  const slot = enemySlotWidth(stage.width, enemyCount, soloEnemyWidthRatio);
  const enemy = fit(slot - panelInset, (stage.height - chrome - playerChrome) / 2);
  const player = fit(
    stage.width * playerWidthRatio - panelInset,
    stage.height - enemy - chrome - playerChrome,
  );
  return { enemy, player, compact };
}

/** 横向き: 右の舞台に敵を横一列、左の列に自分。高さが限られるので常に詰めた表示にする。 */
export function landscapeFigures(enemyStage: Size, playerSlot: Size, enemyCount: number): FigureSizes {
  if (!isMeasured(enemyStage) || !isMeasured(playerSlot)) return UNMEASURED;
  const { compactEnemyChrome, playerChrome, panelInset } = COMBAT_LAYOUT;
  const slot = enemySlotWidth(enemyStage.width, enemyCount, 1 / Math.max(enemyCount, 2));
  return {
    enemy: fit(slot - panelInset, enemyStage.height - compactEnemyChrome),
    player: fit(playerSlot.width - panelInset, playerSlot.height - playerChrome),
    compact: true,
  };
}
