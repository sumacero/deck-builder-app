import type { CardInstance } from '../domain/card';
import type {
  CombatEventBody,
  CombatLogEntry,
  CombatSetup,
  CombatState,
  EnemyState,
  Fighter,
} from '../domain/combat';
import type { Effect } from '../domain/effect';
import type { EnemyAction, EnemyMove } from '../domain/enemy';
import type { RelicCondition, RelicTrigger } from '../domain/relic';
import { cardMotion } from './motion';
import { shuffle } from './random';

type DamageResult<T extends Fighter> = {
  target: T;
  blocked: number;
  hpLoss: number;
};

export function applyDamage<T extends Fighter>(target: T, amount: number): DamageResult<T> {
  const blocked = Math.min(target.block, amount);
  const hpLoss = amount - blocked;
  return {
    target: { ...target, block: target.block - blocked, hp: Math.max(0, target.hp - hpLoss) },
    blocked,
    hpLoss,
  };
}

export function gainBlock<T extends Fighter>(target: T, amount: number): T {
  return { ...target, block: target.block + amount };
}

export function currentIntent(enemy: EnemyState): EnemyMove {
  return enemy.moves[enemy.moveIndex % enemy.moves.length];
}

function withLog(state: CombatState, text: string): CombatState {
  const entry: CombatLogEntry = { id: state.log.length, turn: state.turn, text };
  return { ...state, log: [...state.log, entry] };
}

function withEvent(state: CombatState, event: CombatEventBody): CombatState {
  return {
    ...state,
    events: [...state.events, { ...event, id: state.nextEventId }],
    nextEventId: state.nextEventId + 1,
  };
}

/** 次の操作の前に、前回分のイベントを捨てる。 */
export function clearEvents(state: CombatState): CombatState {
  return state.events.length === 0 ? state : { ...state, events: [] };
}

function formatHit(targetName: string, result: { blocked: number; hpLoss: number }): string {
  const blockedText = result.blocked > 0 ? `（${result.blocked} ブロック）` : '';
  return `${targetName}に ${result.hpLoss} ダメージ${blockedText}`;
}

/** 山札から引く。山札が尽きたら捨て札をシャッフルして山札に戻してから引き続ける。 */
export function drawCards(state: CombatState, count: number): CombatState {
  let drawPile = state.drawPile;
  let discardPile = state.discardPile;
  let rngSeed = state.rngSeed;
  let reshuffled = false;
  const drawn: CardInstance[] = [];

  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break;
      const result = shuffle(discardPile, rngSeed);
      drawPile = result.items;
      rngSeed = result.seed;
      discardPile = [];
      reshuffled = true;
    }
    const [top, ...rest] = drawPile;
    drawn.push(top);
    drawPile = rest;
  }

  const next: CombatState = {
    ...state,
    drawPile,
    discardPile,
    rngSeed,
    hand: [...state.hand, ...drawn],
  };
  return reshuffled ? withLog(next, '捨て札をシャッフルして山札に戻した') : next;
}

export function startPlayerTurn(state: CombatState): CombatState {
  const turn = state.turn + 1;
  const started: CombatState = {
    ...state,
    turn,
    status: 'playerTurn',
    player: {
      ...state.player,
      block: 0,
      energy: state.player.maxEnergy,
      tempStrength: 0,
    },
  };
  return drawCards(withLog(started, `ターン ${turn} 開始`), state.drawPerTurn);
}

export function createCombat(setup: CombatSetup, seed: number): CombatState {
  const instances: CardInstance[] = setup.deck.map((card, index) => ({
    instanceId: `card-${index}`,
    card,
  }));
  const shuffled = shuffle(instances, seed);

  const initial: CombatState = {
    status: 'playerTurn',
    turn: 0,
    player: {
      hp: Math.min(setup.playerHp, setup.playerMaxHp),
      maxHp: setup.playerMaxHp,
      block: 0,
      energy: 0,
      maxEnergy: setup.energyPerTurn,
      strength: 0,
      tempStrength: 0,
      endTurnBlock: 0,
    },
    enemy: {
      id: setup.enemy.id,
      name: setup.enemy.name,
      icon: setup.enemy.icon,
      rank: setup.enemy.rank,
      strength: 0,
      hp: setup.enemy.maxHp,
      maxHp: setup.enemy.maxHp,
      block: 0,
      moves: setup.enemy.moves,
      moveIndex: 0,
    },
    drawPerTurn: setup.drawPerTurn,
    drawPile: shuffled.items,
    hand: [],
    discardPile: [],
    exhaustPile: [],
    relics: setup.relics,
    potions: [...setup.potions],
    rngSeed: shuffled.seed,
    log: [],
    events: [],
    nextEventId: 0,
  };
  const firstTurn = startPlayerTurn(withLog(initial, `${setup.enemy.name}が現れた！`));
  return triggerRelics(firstTurn, 'combatStart');
}

export function canPlayCard(state: CombatState, instanceId: string): boolean {
  if (state.status !== 'playerTurn') return false;
  const instance = state.hand.find((c) => c.instanceId === instanceId);
  return instance !== undefined && instance.card.cost <= state.player.energy;
}

function attackDamage(state: CombatState, base: number): number {
  return Math.max(0, base + state.player.strength + state.player.tempStrength);
}

function applyEffect(state: CombatState, effect: Effect): CombatState {
  switch (effect.kind) {
    case 'gainEnergy':
      return withLog(
        { ...state, player: { ...state.player, energy: state.player.energy + effect.amount } },
        `エナジー +${effect.amount}`,
      );
    case 'draw':
      return withLog(drawCards(state, effect.amount), `カードを ${effect.amount} 枚引いた`);
    case 'heal': {
      const healed = Math.min(effect.amount, state.player.maxHp - state.player.hp);
      if (healed === 0) return state;
      return withEvent(
        withLog({ ...state, player: { ...state.player, hp: state.player.hp + healed } }, `HP +${healed}`),
        { kind: 'heal', target: 'player', amount: healed },
      );
    }
    case 'loseHp': {
      const hp = Math.max(0, state.player.hp - effect.amount);
      return withEvent(
        withLog({ ...state, player: { ...state.player, hp } }, `HP -${effect.amount}`),
        { kind: 'hit', target: 'player', hpLoss: effect.amount, blocked: 0 },
      );
    }
    case 'gainStrength': {
      const key = effect.duration === 'turn' ? 'tempStrength' : 'strength';
      return withLog(
        { ...state, player: { ...state.player, [key]: state.player[key] + effect.amount } },
        `筋力 +${effect.amount}`,
      );
    }
    case 'gainEndTurnBlock':
      return withLog(
        {
          ...state,
          player: { ...state.player, endTurnBlock: state.player.endTurnBlock + effect.amount },
        },
        `ターン終了時ブロック +${effect.amount}`,
      );
    case 'damage': {
      const hits = effect.hits ?? 1;
      const amount = attackDamage(state, effect.amount);
      let next = state;
      for (let i = 0; i < hits && next.enemy.hp > 0; i++) {
        const result = applyDamage(next.enemy, amount);
        next = withEvent(
          withLog({ ...next, enemy: result.target }, formatHit(next.enemy.name, result)),
          { kind: 'hit', target: 'enemy', hpLoss: result.hpLoss, blocked: result.blocked },
        );
      }
      return next;
    }
    case 'block':
      return withEvent(
        withLog(
          { ...state, player: gainBlock(state.player, effect.amount) },
          `ブロック +${effect.amount}`,
        ),
        { kind: 'blockGain', target: 'player', amount: effect.amount },
      );
  }
}

const applyEffects = (state: CombatState, effects: Effect[]): CombatState =>
  effects.reduce(applyEffect, state);

function conditionMet(state: CombatState, condition: RelicCondition | undefined): boolean {
  switch (condition) {
    case undefined:
      return true;
    case 'noBlock':
      return state.player.block === 0;
  }
}

function triggerRelics(state: CombatState, trigger: RelicTrigger): CombatState {
  return state.relics.reduce((current, relic) => {
    if (relic.trigger !== trigger || !conditionMet(current, relic.condition)) return current;
    const announced = withEvent(withLog(current, `${relic.name}が発動`), {
      kind: 'relicTriggered',
      target: 'player',
      relicId: relic.id,
    });
    return applyEffects(announced, relic.effects);
  }, state);
}

function finishIfWon(state: CombatState): CombatState {
  if (state.status !== 'playerTurn' || state.enemy.hp > 0) return state;
  const won = withEvent(withLog({ ...state, status: 'won' }, `${state.enemy.name}を倒した！`), {
    kind: 'defeated',
    target: 'enemy',
  });
  return triggerRelics(won, 'combatWon');
}

function finishIfLost(state: CombatState): CombatState {
  if (state.status !== 'playerTurn' || state.player.hp > 0) return state;
  return withEvent(withLog({ ...state, status: 'lost' }, 'あなたは力尽きた…'), {
    kind: 'defeated',
    target: 'player',
  });
}

function settle(state: CombatState): CombatState {
  return finishIfWon(finishIfLost(state));
}

export function canDrinkPotion(state: CombatState, slot: number): boolean {
  return state.status === 'playerTurn' && Boolean(state.potions[slot]);
}

export function drinkPotion(state: CombatState, slot: number): CombatState {
  const potion = state.potions[slot];
  if (!potion || !canDrinkPotion(state, slot)) return state;
  const used = withEvent(
    withLog(
      { ...state, potions: state.potions.map((p, i) => (i === slot ? null : p)) },
      `${potion.name}を使用`,
    ),
    { kind: 'potionUsed', target: 'player', potionId: potion.id },
  );
  return settle(applyEffects(used, potion.effects));
}

export function playCard(state: CombatState, instanceId: string): CombatState {
  const instance = state.hand.find((c) => c.instanceId === instanceId);
  if (!instance || !canPlayCard(state, instanceId)) return state;

  const spent = {
    ...state,
    hand: state.hand.filter((c) => c.instanceId !== instanceId),
    player: { ...state.player, energy: state.player.energy - instance.card.cost },
    ...(instance.card.exhaust
      ? { exhaustPile: [...state.exhaustPile, instance] }
      : { discardPile: [...state.discardPile, instance] }),
  };
  const copied = instance.card.addCopyToDiscard
    ? {
        ...spent,
        discardPile: [...spent.discardPile, { instanceId: `copy-${state.nextEventId}`, card: instance.card }],
      }
    : spent;
  const played = withEvent(withLog(copied, `${instance.card.name}を使用`), {
    kind: 'cardPlayed',
    target: 'player',
    cardType: instance.card.type,
    motion: cardMotion(instance.card),
  });
  return settle(applyEffects(played, instance.card.effects));
}

/** 敵の攻撃 1 回分のダメージ（筋力込み）。インテント表示でも使う。 */
export function enemyAttackDamage(enemy: EnemyState, base: number): number {
  return Math.max(0, base + enemy.strength);
}

function applyEnemyAction(state: CombatState, action: EnemyAction): CombatState {
  switch (action.kind) {
    case 'attack': {
      const amount = enemyAttackDamage(state.enemy, action.damage);
      let next = state;
      for (let i = 0; i < action.hits && next.player.hp > 0; i++) {
        next = withEvent(next, { kind: 'enemyAct', target: 'enemy', action: 'attack' });
        const result = applyDamage(next.player, amount);
        next = withEvent(
          withLog({ ...next, player: result.target }, formatHit('あなた', result)),
          { kind: 'hit', target: 'player', hpLoss: result.hpLoss, blocked: result.blocked },
        );
      }
      return next;
    }
    case 'block':
      return withEvent(
        withLog(
          {
            ...withEvent(state, { kind: 'enemyAct', target: 'enemy', action: 'block' }),
            enemy: gainBlock(state.enemy, action.amount),
          },
          `${state.enemy.name}はブロック +${action.amount}`,
        ),
        { kind: 'blockGain', target: 'enemy', amount: action.amount },
      );
    case 'buff':
      return withLog(
        {
          ...withEvent(state, { kind: 'enemyAct', target: 'enemy', action: 'buff' }),
          enemy: { ...state.enemy, strength: state.enemy.strength + action.strength },
        },
        `${state.enemy.name}の筋力 +${action.strength}`,
      );
  }
}

/** 敵のブロックは敵自身のターン開始時に消える。 */
function runEnemyTurn(state: CombatState): CombatState {
  const move = currentIntent(state.enemy);
  let next = withLog(
    { ...state, enemy: { ...state.enemy, block: 0 } },
    `${state.enemy.name}の「${move.name}」`,
  );
  for (const action of move.actions) {
    next = applyEnemyAction(next, action);
    if (next.player.hp <= 0) {
      return withEvent(withLog({ ...next, status: 'lost' }, 'あなたは力尽きた…'), {
        kind: 'defeated',
        target: 'player',
      });
    }
  }
  return { ...next, enemy: { ...next.enemy, moveIndex: next.enemy.moveIndex + 1 } };
}

export function endTurn(state: CombatState): CombatState {
  if (state.status !== 'playerTurn') return state;
  const afterRelics = triggerRelics(state, 'turnEnd');
  const afterMetal =
    afterRelics.player.endTurnBlock > 0
      ? applyEffect(afterRelics, { kind: 'block', amount: afterRelics.player.endTurnBlock })
      : afterRelics;
  const discarded = withLog(
    {
      ...afterMetal,
      hand: [],
      discardPile: [...afterMetal.discardPile, ...afterMetal.hand],
    },
    'ターン終了',
  );
  const afterEnemy = runEnemyTurn(discarded);
  return afterEnemy.status === 'lost' ? afterEnemy : startPlayerTurn(afterEnemy);
}
