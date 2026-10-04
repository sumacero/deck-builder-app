import type { BuffId, DebuffId, EnemyStatusId, StatusId, Statuses } from '../domain/status';

export const DEBUFF_IDS: readonly DebuffId[] = ['vulnerable', 'weak'];
export const BUFF_IDS: readonly BuffId[] = ['retainBlock', 'blazing'];
export const ENEMY_STATUS_IDS: readonly EnemyStatusId[] = ['intangible'];

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

/** 霊体化中に攻撃 1 回で受けるダメージの上限。 */
export const INTANGIBLE_CAP = 1;

/**
 * 攻撃 1 回分の最終ダメージ。base は筋力込みの値。affinity は属性相性の倍率。
 * 攻撃側の熱血・衰弱、受ける側の弱体、相性をかけて切り捨て、受ける側が霊体化なら上限で抑える。
 */
export function modifiedDamage(base: number, attacker: Statuses, defender: Statuses, affinity = 1): number {
  let amount = base * affinity;
  if (hasStatus(attacker, 'blazing')) amount *= BLAZING_MULTIPLIER;
  if (hasStatus(attacker, 'weak')) amount *= WEAK_MULTIPLIER;
  if (hasStatus(defender, 'vulnerable')) amount *= VULNERABLE_MULTIPLIER;
  const floored = Math.max(0, Math.floor(amount));
  return hasStatus(defender, 'intangible') ? Math.min(floored, INTANGIBLE_CAP) : floored;
}
