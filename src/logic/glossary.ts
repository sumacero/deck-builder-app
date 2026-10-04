import type { CardDefinition } from '../domain/card';
import type { EnemyState, PlayerState } from '../domain/combat';
import type { Effect } from '../domain/effect';
import type { EnemyAction, EnemyMove } from '../domain/enemy';
import type { KeywordId, StatusView } from '../domain/glossary';
import type { StatusId, Statuses } from '../domain/status';
import { BUFF_IDS, DEBUFF_IDS, statusTurns } from './status';

function keywordsForEffect(effect: Effect): KeywordId[] {
  switch (effect.kind) {
    case 'damage':
      return ['damage'];
    case 'damageFromBlock':
      return ['damage', 'block'];
    case 'block':
    case 'doubleBlock':
      return ['block'];
    case 'gainEnergy':
      return ['energy'];
    case 'draw':
      return ['draw'];
    case 'heal':
      return ['heal'];
    case 'loseHp':
      return ['loseHp'];
    case 'gainStrength':
      return [effect.duration === 'turn' ? 'tempStrength' : 'strength'];
    case 'gainEndTurnBlock':
      return ['endTurnBlock'];
    case 'applyDebuff':
    case 'gainBuff':
      return [effect.status, 'statusTurns'];
    case 'extendDebuffs':
      return ['vulnerable', 'weak', 'statusTurns'];
    case 'extendBuffs':
      return ['retainBlock', 'blazing', 'statusTurns'];
  }
}

/** 状態のターン数（0 は表示しない）。 */
function statusViews(statuses: Statuses, ids: readonly StatusId[]): StatusView[] {
  return ids.map((id) => ({ keyword: id, value: statusTurns(statuses, id) }));
}

const unique = (ids: KeywordId[]): KeywordId[] => [...new Set(ids)];

/** カードの説明文に出てくる用語。種類 → 効果の順 → 廃棄などの特性。 */
export function keywordsForCard(card: CardDefinition): KeywordId[] {
  return unique([
    card.type,
    ...(card.target === 'allEnemies' ? (['areaAttack'] as const) : []),
    ...card.effects.flatMap(keywordsForEffect),
    ...(card.addCopyToDiscard ? (['copyToDiscard'] as const) : []),
    ...(card.exhaust ? (['exhaust'] as const) : []),
  ]);
}

const nonZero = (statuses: StatusView[]) => statuses.filter((status) => status.value !== 0);

export function playerStatuses(player: PlayerState): StatusView[] {
  return nonZero([
    { keyword: 'block', value: player.block },
    { keyword: 'strength', value: player.strength },
    { keyword: 'tempStrength', value: player.tempStrength },
    { keyword: 'endTurnBlock', value: player.endTurnBlock },
    { keyword: 'paralysis', value: player.hindrance.paralysis },
    { keyword: 'chill', value: player.hindrance.chill },
    { keyword: 'seal', value: player.hindrance.seal ? 1 : 0, flag: true },
    ...statusViews(player.statuses, [...BUFF_IDS, ...DEBUFF_IDS]),
  ]);
}

export function enemyStatuses(enemy: EnemyState): StatusView[] {
  return nonZero([
    { keyword: 'block', value: enemy.block },
    { keyword: 'strength', value: enemy.strength },
    ...statusViews(enemy.statuses, [...DEBUFF_IDS, ...BUFF_IDS]),
  ]);
}

function keywordForIntent(action: EnemyAction): KeywordId {
  switch (action.kind) {
    case 'attack':
      return 'intentAttack';
    case 'block':
      return 'intentBlock';
    case 'buff':
      return 'intentBuff';
    case 'heal':
      return action.allies ? 'intentAllyHeal' : 'intentHeal';
    case 'paralyze':
      return 'intentParalyze';
    case 'chill':
      return 'intentChill';
    case 'seal':
      return 'intentSeal';
    case 'charge':
      return 'intentCharge';
  }
}

/** 敵の次の行動に出ているアイコンの意味。 */
export function keywordsForIntent(move: EnemyMove): KeywordId[] {
  return unique(move.actions.map(keywordForIntent));
}
