import type { CardDefinition } from '../domain/card';
import type { EnemyState, PlayerState } from '../domain/combat';
import type { Effect } from '../domain/effect';
import type { EnemyAction, EnemyMove } from '../domain/enemy';
import type { KeywordId, StatusView } from '../domain/glossary';
import type { PowerId, StatusId, Statuses } from '../domain/status';
import { cardAttributes } from './attribute';
import { BUFF_IDS, DEBUFF_IDS, ENEMY_STATUS_IDS, statusTurns } from './status';

function keywordsForEffect(effect: Effect): KeywordId[] {
  switch (effect.kind) {
    case 'damage':
      return effect.strengthMultiplier ? ['damage', 'strength'] : ['damage'];
    case 'damagePerSelfHpLost':
      return ['damage', 'loseHp'];
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
      return effect.status === 'tide' ? ['tide'] : [effect.status, 'statusTurns'];
    case 'gainBuff':
      return [effect.status, 'statusTurns'];
    case 'extendDebuffs':
      return ['vulnerable', 'weak', 'seed', 'tide', 'statusTurns'];
    case 'extendBuffs':
      return ['retainBlock', 'blazing', 'statusTurns'];
    case 'gainPower':
      if (effect.power === 'lashSeed') return ['lashSeed', 'whip', 'seed'];
      return ARROW_POWERS.includes(effect.power) ? [effect.power, 'arrow'] : [effect.power];
    case 'addArrows':
    case 'volleySpentArrows':
      return ['arrow', 'damage'];
    case 'damagePerDebuff':
    case 'detonateDebuffs':
      return ['damage', 'vulnerable', 'weak', 'statusTurns'];
    case 'detonateSeed':
      return ['damage', 'seed'];
    case 'crackTide':
      return ['damage', 'tide'];
    case 'ifTargetHas':
      return [effect.status, ...effect.effects.flatMap(keywordsForEffect)];
    case 'consumeBlock':
      return ['block', 'damage'];
    case 'feed':
      return ['damage', 'maxHp'];
    case 'enchant':
      return ['enchant', 'attribute', 'weakness'];
    case 'multiplyDebuff':
      return [effect.status, 'statusTurns'];
    case 'bloomSeed':
      return ['seed'];
    case 'damagePerCardPlayed':
      return ['damage'];
    case 'gainLashSeed':
      return ['lashSeedTurn', 'whip', 'seed'];
  }
}

const POWER_IDS: readonly PowerId[] = [
  'barricade',
  'demonForm',
  'juggernaut',
  'sadistic',
  'rupture',
  'feelNoPain',
  'thorns',
  'overgrowth',
  'highTide',
  'verdure',
  'quickdraw',
  'flurry',
  'lashSeed',
  'arrowEdge',
  'arrowSpread',
  'arrowRetain',
  'arrowSupply',
];

const ARROW_POWERS: readonly PowerId[] = ['arrowEdge', 'arrowSpread', 'arrowRetain', 'arrowSupply'];

/** 状態のターン数（0 は表示しない）。 */
function statusViews(statuses: Statuses, ids: readonly StatusId[]): StatusView[] {
  return ids.map((id) => ({ keyword: id, value: statusTurns(statuses, id) }));
}

const unique = (ids: KeywordId[]): KeywordId[] => [...new Set(ids)];

/** カードの説明文に出てくる用語。種類 → 効果の順 → 廃棄などの特性。 */
export function keywordsForCard(card: CardDefinition): KeywordId[] {
  return unique([
    card.type,
    ...(card.mysticArte ? (['mysticArte'] as const) : []),
    ...(card.whip ? (['whip'] as const) : []),
    ...(card.arrow ? (['arrow'] as const) : []),
    ...(cardAttributes(card).length > 0 ? (['attribute', 'weakness'] as const) : []),
    ...(card.target === 'allEnemies' ? (['areaAttack'] as const) : []),
    ...card.effects.flatMap(keywordsForEffect),
    ...(card.unplayable ? (['unplayable'] as const) : []),
    ...(card.turnEndInHand ?? []).flatMap(keywordsForEffect),
    ...(card.growth ? (['growth'] as const) : []),
    ...(card.ethereal ? (['ethereal'] as const) : []),
    ...(card.addCopyToDiscard ? (['copyToDiscard'] as const) : []),
    ...(card.exhaust ? (['exhaust'] as const) : []),
  ]);
}

/** 敵の性質。量のある性質（眠りのターン数、アーティファクトの残り回数など）は数値も出す。 */
function traitViews(enemy: EnemyState): StatusView[] {
  return enemy.traits.flatMap((trait): StatusView[] => {
    switch (trait.kind) {
      case 'sleep':
        return [{ keyword: 'sleep', value: enemy.asleep }];
      case 'artifact':
        return [{ keyword: 'artifact', value: enemy.artifact }];
      case 'vengeance':
        return [{ keyword: 'vengeance', value: trait.strength }];
      case 'hitCap':
        return [{ keyword: 'hitCap', value: trait.amount }];
      case 'guardian':
      case 'deathThroes':
        return [{ keyword: trait.kind, value: 1, flag: true }];
      case 'awaken':
        return enemy.awakened ? [] : [{ keyword: trait.kind, value: 1, flag: true }];
    }
  });
}

const nonZero = (statuses: StatusView[]) => statuses.filter((status) => status.value !== 0);

export function playerStatuses(player: PlayerState): StatusView[] {
  return nonZero([
    { keyword: 'block', value: player.block },
    { keyword: 'strength', value: player.strength },
    { keyword: 'tempStrength', value: player.tempStrength },
    { keyword: 'lashSeedTurn', value: player.lashSeedThisTurn },
    { keyword: 'endTurnBlock', value: player.endTurnBlock },
    { keyword: 'paralysis', value: player.hindrance.paralysis },
    { keyword: 'chill', value: player.hindrance.chill },
    { keyword: 'seal', value: player.hindrance.seal ? 1 : 0, flag: true },
    ...statusViews(player.statuses, [...BUFF_IDS, ...DEBUFF_IDS]),
    ...POWER_IDS.map((id) => ({ keyword: id, value: player.powers[id] ?? 0, flag: id === 'barricade' })),
  ]);
}

export function enemyStatuses(enemy: EnemyState): StatusView[] {
  return nonZero([
    { keyword: 'block', value: enemy.block },
    { keyword: 'strength', value: enemy.strength },
    ...statusViews(enemy.statuses, [...DEBUFF_IDS, ...ENEMY_STATUS_IDS]),
    ...traitViews(enemy),
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
    case 'debuff':
      return 'intentDebuff';
    case 'addCard':
      return 'intentAddCard';
    case 'intangible':
      return 'intentIntangible';
    case 'shiftAttribute':
      return 'intentBanner';
    case 'idle':
      return 'intentSleep';
  }
}

/** 敵の次の行動に出ているアイコンの意味。 */
export function keywordsForIntent(move: EnemyMove): KeywordId[] {
  return unique(move.actions.map(keywordForIntent));
}
