/**
 * ターン数つきの状態。値は残りターン数で、0 になると消える。重ねてかけるとターン数が加算される。
 * - vulnerable（弱体）: 受けるダメージが 1.5 倍
 * - weak（衰弱）: 与えるダメージが半分
 * - retainBlock（ブロック保持）: ターンの始めにブロックが消えない
 * - blazing（熱血）: 与えるダメージが 1.5 倍
 */
export type DebuffId = 'vulnerable' | 'weak';
export type BuffId = 'retainBlock' | 'blazing';
export type StatusId = DebuffId | BuffId;

export type Statuses = Partial<Record<StatusId, number>>;
