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

/** 群れは隣と少し重なってよいので、枠幅より広い予算を渡す。 */
function enemyWidthBudget(slot: number, enemyCount: number, panelInset: number): number {
  const { enemyWidthOverflow } = COMBAT_LAYOUT;
  if (enemyCount <= 1) return slot - panelInset;
  return slot * enemyWidthOverflow - panelInset;
}

/**
 * 縦向き: 上に敵、下に自分。体は UI（HP・名前）の背景に重ねてよいので、
 * 舞台の高さを大きめに使って 3D を取る（今の下限より小さくしない）。
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
  // 敵は舞台の上半分強、自分は下半分。群れは横にはみ出して大きく取る。
  const enemy = fit(enemyWidthBudget(slot, enemyCount, panelInset), stage.height * 0.62 - chrome);
  const player = fit(
    stage.width * playerWidthRatio - panelInset,
    stage.height * 0.55 - playerChrome,
  );
  return { enemy, player, compact };
}

/** 横向き: 右の舞台に敵を横一列、左の列に自分。高さが限られるので常に詰めた表示にする。 */
export function landscapeFigures(enemyStage: Size, playerSlot: Size, enemyCount: number): FigureSizes {
  if (!isMeasured(enemyStage) || !isMeasured(playerSlot)) return UNMEASURED;
  const { compactEnemyChrome, playerChrome, panelInset } = COMBAT_LAYOUT;
  const slot = enemySlotWidth(enemyStage.width, enemyCount, 1 / Math.max(enemyCount, 2));
  return {
    enemy: fit(
      enemyWidthBudget(slot, enemyCount, panelInset),
      enemyStage.height - compactEnemyChrome,
    ),
    player: fit(playerSlot.width - panelInset, playerSlot.height - playerChrome),
    compact: true,
  };
}
