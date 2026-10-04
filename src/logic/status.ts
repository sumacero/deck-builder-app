import type { BuffId, DebuffId, StatusId, Statuses } from '../domain/status';

export const DEBUFF_IDS: readonly DebuffId[] = ['vulnerable', 'weak'];
export const BUFF_IDS: readonly BuffId[] = ['retainBlock', 'blazing'];

/** 弱体・熱血のダメージ倍率と、衰弱の倍率。 */
export const VULNERABLE_MULTIPLIER = 1.5;
export const BLAZING_MULTIPLIER = 1.5;
export const WEAK_MULTIPLIER = 0.5;

export const statusTurns = (statuses: Statuses, id: StatusId): number => statuses[id] ?? 0;

export const hasStatus = (statuses: Statuses, id: StatusId): boolean => statusTurns(statuses, id) > 0;

/** ターン数を加算する。かかっていなければ新しくかける。 */
export function addStatus(statuses: Statuses, id: StatusId, turns: number): Statuses {
  return { ...statuses, [id]: statusTurns(statuses, id) + turns };
}

/** かかっているものだけターン数を加算する（かかっていないものは増やさない）。 */
export function extendStatuses(statuses: Statuses, ids: readonly StatusId[], turns: number): Statuses {
  return ids.reduce(
    (current, id) => (hasStatus(current, id) ? addStatus(current, id, turns) : current),
    statuses,
  );
}

/** 1 ターン経過。0 になったものは消す。 */
export function tickStatuses(statuses: Statuses): Statuses {
  const next: Statuses = {};
  for (const [id, turns] of Object.entries(statuses) as [StatusId, number][]) {
    if (turns > 1) next[id] = turns - 1;
  }
  return next;
}

/**
 * 攻撃 1 回分の最終ダメージ。base は筋力込みの値。
 * 攻撃側の熱血・衰弱と、受ける側の弱体をかけ、最後に切り捨てる。
 */
export function modifiedDamage(base: number, attacker: Statuses, defender: Statuses): number {
  let amount = base;
  if (hasStatus(attacker, 'blazing')) amount *= BLAZING_MULTIPLIER;
  if (hasStatus(attacker, 'weak')) amount *= WEAK_MULTIPLIER;
  if (hasStatus(defender, 'vulnerable')) amount *= VULNERABLE_MULTIPLIER;
  return Math.max(0, Math.floor(amount));
}
