import type { CardInstance } from '../domain/card';
import type {
  ActorId,
  CombatEventBody,
  CombatLogEntry,
  CombatSetup,
  CombatSide,
  CombatState,
  DamagePreview,
  EnemyState,
  EnemyUid,
  Fighter,
  Hindrance,
  PlayerState,
  Vitals,
} from '../domain/combat';
import type { Effect, EffectTarget } from '../domain/effect';
import type { EnemyAction, EnemyMove } from '../domain/enemy';
import type { RelicCondition, RelicTrigger } from '../domain/relic';
import type { DebuffId } from '../domain/status';
import { STATUS_LABEL } from './describe';
import { DOWN_MOVE, SLEEP_MOVE, traitOf } from './enemyTraits';
import { cardMotion } from './motion';
import { shuffle } from './random';
import {
  addStatus,
  BUFF_IDS,
  DEBUFF_IDS,
  extendStatuses,
  hasStatus,
  modifiedDamage,
  tickStatuses,
} from './status';

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

const vitalsOf = (fighter: Fighter): Vitals => ({ hp: fighter.hp, block: fighter.block });

export function gainBlock<T extends Fighter>(target: T, amount: number): T {
  return { ...target, block: target.block + amount };
}

export function currentIntent(enemy: EnemyState): EnemyMove {
  if (enemy.asleep > 0) return SLEEP_MOVE;
  if (enemy.stunned) return DOWN_MOVE;
  return enemy.moves[enemy.moveIndex % enemy.moves.length];
}

export const sideOf = (actor: ActorId): CombatSide => (actor === 'player' ? 'player' : 'enemy');

export const isAlive = (enemy: EnemyState) => enemy.hp > 0;

export const livingEnemies = (state: CombatState) => state.enemies.filter(isAlive);

const enemyUid = (index: number): EnemyUid => `enemy-${index}`;

function findEnemy(state: CombatState, uid: EnemyUid): EnemyState | undefined {
  return state.enemies.find((enemy) => enemy.uid === uid);
}

function updateEnemy(
  state: CombatState,
  uid: EnemyUid,
  update: (enemy: EnemyState) => EnemyState,
): CombatState {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => (enemy.uid === uid ? update(enemy) : enemy)),
  };
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

/** 手札の上限。超えて引こうとした分は山札に残る。 */
export const MAX_HAND_SIZE = 10;

export const isHandFull = (state: CombatState) => state.hand.length >= MAX_HAND_SIZE;

/**
 * 山札から引く。山札が尽きたら捨て札をシャッフルして山札に戻してから引き続ける。
 * 手札が上限に達したらそこで止め、引けなかった枚数を handFull イベントで知らせる。
 */
export function drawCards(state: CombatState, count: number): CombatState {
  let drawPile = state.drawPile;
  let discardPile = state.discardPile;
  let rngSeed = state.rngSeed;
  let reshuffled = false;
  let blocked = 0;
  const drawn: CardInstance[] = [];

  for (let i = 0; i < count; i++) {
    if (state.hand.length + drawn.length >= MAX_HAND_SIZE) {
      blocked = count - i;
      break;
    }
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
  const shuffledLog = reshuffled ? withLog(next, '捨て札をシャッフルして山札に戻した') : next;
  const drawnLog =
    drawn.length > 0 ? withLog(shuffledLog, `カードを ${drawn.length} 枚引いた`) : shuffledLog;
  if (blocked === 0) return drawnLog;
  return withEvent(withLog(drawnLog, `手札がいっぱいで ${blocked} 枚引けなかった`), {
    kind: 'handFull',
    target: 'player',
    blocked,
  });
}

export const NO_HINDRANCE: Hindrance = { paralysis: 0, chill: 0, seal: false };

/** 麻痺・凍えは重ねがけしても、1 ターンにこの値までしか効かない。 */
export const MAX_HINDRANCE_STACK = 2;

function hindranceLogs(hindrance: Hindrance): string[] {
  return [
    ...(hindrance.paralysis > 0 ? [`麻痺でエナジー -${hindrance.paralysis}`] : []),
    ...(hindrance.chill > 0 ? [`凍えで引く枚数 -${hindrance.chill}`] : []),
    ...(hindrance.seal ? ['封印でスキルを使えない'] : []),
  ];
}

/**
 * 自分のターンの開始。ブロック保持があればブロックを残す。
 * 自分のバフ・デバフはここで 1 ターン進む（かけたターンと、その次の敵の行動までは効く）。
 */
export function startPlayerTurn(state: CombatState): CombatState {
  const turn = state.turn + 1;
  const hindrance = state.player.pendingHindrance;
  const keepBlock = turn > 1 && hasStatus(state.player.statuses, 'retainBlock') && state.player.block > 0;
  const started: CombatState = {
    ...state,
    turn,
    status: 'playerTurn',
    player: {
      ...state.player,
      block: keepBlock ? state.player.block : 0,
      energy: Math.max(0, state.player.maxEnergy - hindrance.paralysis),
      tempStrength: 0,
      hindrance,
      pendingHindrance: NO_HINDRANCE,
      statuses: turn > 1 ? tickStatuses(state.player.statuses) : state.player.statuses,
    },
  };
  const logs = [
    ...(keepBlock ? [`ブロック保持でブロック ${state.player.block} を引き継いだ`] : []),
    ...hindranceLogs(hindrance),
  ];
  const logged = logs.reduce(withLog, withLog(started, `ターン ${turn} 開始`));
  return drawCards(logged, Math.max(0, state.drawPerTurn - hindrance.chill));
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
      hindrance: NO_HINDRANCE,
      pendingHindrance: NO_HINDRANCE,
      statuses: {},
    },
    enemies: setup.enemies.map((enemy, index) => ({
      uid: enemyUid(index),
      id: enemy.id,
      name: enemy.name,
      icon: enemy.icon,
      rank: enemy.rank,
      strength: 0,
      hp: enemy.maxHp,
      maxHp: enemy.maxHp,
      block: 0,
      statuses: {},
      moves: enemy.moves,
      // 群れで同じ行動を一斉にしないよう、並び順で行動パターンの開始位置をずらす。
      moveIndex: index % enemy.moves.length,
      traits: enemy.traits ?? [],
      asleep: traitOf(enemy, 'sleep')?.turns ?? 0,
      stunned: false,
      stagger: traitOf(enemy, 'stagger')?.hits ?? 0,
      ward: traitOf(enemy, 'ward')?.charges ?? 0,
      debuffsTaken: [],
    })),
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
  const names = groupedNames(setup.enemies.map((enemy) => enemy.name));
  const firstTurn = startPlayerTurn(withLog(initial, `${names}が現れた！`));
  return triggerRelics(firstTurn, 'combatStart');
}

/** ["小スライム", "苔の芽", "小スライム"] → "小スライム×2と苔の芽" */
function groupedNames(names: string[]): string {
  const counts = new Map<string, number>();
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1);
  return [...counts]
    .map(([name, count]) => (count > 1 ? `${name}×${count}` : name))
    .join('と');
}

/** damage が当たる先。敵 1 体か、生きている敵全員。 */
type Aim = EnemyUid | 'all';

/**
 * 選ばれた敵が倒れていたり未指定だったりしたら、生きている先頭の敵を狙う。
 * 狙った敵とは別に「かばう」敵が生きていれば、そちらに当たる。
 */
function resolveAim(state: CombatState, target: EffectTarget, chosen: EnemyUid | undefined): Aim {
  if (target === 'allEnemies') return 'all';
  const picked = chosen ? findEnemy(state, chosen) : undefined;
  const aimed = picked && isAlive(picked) ? picked : livingEnemies(state)[0];
  if (!aimed) return enemyUid(0);
  if (traitOf(aimed, 'guardian')) return aimed.uid;
  return livingEnemies(state).find((enemy) => traitOf(enemy, 'guardian'))?.uid ?? aimed.uid;
}

const aimedUids = (state: CombatState, aim: Aim): EnemyUid[] =>
  aim === 'all' ? livingEnemies(state).map((enemy) => enemy.uid) : [aim];

/** enemy のカード・ポーションは、生きている敵が 2 体以上なら対象を選ぶ必要がある。 */
export const needsTargetChoice = (state: CombatState, target: EffectTarget) =>
  target === 'enemy' && livingEnemies(state).length > 1;

export function canPlayCard(state: CombatState, instanceId: string): boolean {
  if (state.status !== 'playerTurn') return false;
  const instance = state.hand.find((c) => c.instanceId === instanceId);
  if (!instance || instance.card.unplayable || instance.card.cost > state.player.energy) return false;
  return !(state.player.hindrance.seal && instance.card.type === 'skill');
}

function attackDamage(state: CombatState, base: number): number {
  return Math.max(0, base + state.player.strength + state.player.tempStrength);
}

/** base は筋力込みの値。熱血・衰弱・弱体の倍率は敵ごとにここでかける。 */
function hitEnemy(state: CombatState, uid: EnemyUid, base: number): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || !isAlive(enemy)) return state;
  const result = applyDamage(enemy, modifiedDamage(base, state.player.statuses, enemy.statuses));
  const hit = withEvent(
    withLog(updateEnemy(state, uid, () => result.target), formatHit(enemy.name, result)),
    {
      kind: 'hit',
      target: uid,
      hpLoss: result.hpLoss,
      blocked: result.blocked,
      before: vitalsOf(enemy),
      after: vitalsOf(result.target),
    },
  );
  if (isAlive(result.target)) {
    const woken = result.hpLoss > 0 && enemy.asleep > 0 ? wakeEnemy(hit, uid) : hit;
    return staggerEnemy(woken, uid);
  }
  const defeated = withEvent(withLog(hit, `${enemy.name}を倒した！`), { kind: 'defeated', target: uid });
  return onEnemyDefeated(defeated, uid);
}

function callout(state: CombatState, target: ActorId, text: string): CombatState {
  return withEvent(state, { kind: 'callout', target, text });
}

/** 眠りから覚めて筋力が上がる（攻撃で起こされても、時間で起きても同じ）。 */
function wakeEnemy(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy) return state;
  const gain = traitOf(enemy, 'sleep')?.wakeStrength ?? 0;
  const woken = updateEnemy(state, uid, (e) => ({ ...e, asleep: 0, strength: e.strength + gain }));
  const text = gain > 0 ? `${enemy.name}が目を覚ました！（筋力 +${gain}）` : `${enemy.name}が目を覚ました！`;
  return callout(withLog(woken, text), uid, '目覚めた！');
}

/** ダウン中の被ダメージ倍率がかかるターン数（このターンの残りと、次の自分のターン）。 */
const DOWN_TURNS = 2;

/** よろめきゲージを 1 減らし、尽きたらダウンさせる。ダウン中は減らない。 */
function staggerEnemy(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || enemy.stagger <= 0 || hasStatus(enemy.statuses, 'down')) return state;
  const stagger = enemy.stagger - 1;
  if (stagger > 0) return updateEnemy(state, uid, (e) => ({ ...e, stagger }));
  const downed = updateEnemy(state, uid, (e) => ({
    ...e,
    stagger,
    stunned: true,
    statuses: addStatus(e.statuses, 'down', DOWN_TURNS),
  }));
  return callout(withLog(downed, `${enemy.name}はダウンした！`), uid, 'ダウン！');
}

/** 仇討ち（残った仲間の筋力が上がる）と、倒れた敵の死に際の行動。 */
function onEnemyDefeated(state: CombatState, uid: EnemyUid): CombatState {
  const avenged = livingEnemies(state).reduce((current, ally) => {
    const vengeance = traitOf(ally, 'vengeance');
    if (!vengeance) return current;
    const angered = updateEnemy(current, ally.uid, (e) => ({ ...e, strength: e.strength + vengeance.strength }));
    return callout(
      withLog(angered, `${ally.name}は仲間の仇に燃えている（筋力 +${vengeance.strength}）`),
      ally.uid,
      '怒り！',
    );
  }, state);
  const dead = findEnemy(avenged, uid);
  const throes = dead ? traitOf(dead, 'deathThroes') : undefined;
  if (!dead || !throes) return avenged;
  return applyEnemyAction(withLog(avenged, `${dead.name}の死に際の一撃！`), uid, throes.action, false);
}

function debuffEnemy(state: CombatState, uid: EnemyUid, status: DebuffId, turns: number): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy) return state;
  if (enemy.ward > 0) return consumeWard(state, enemy);
  if (traitOf(enemy, 'resolute') && enemy.debuffsTaken.includes(status)) {
    return callout(withLog(state, `${enemy.name}は不屈で${STATUS_LABEL[status]}を受け付けない`), uid, '無効！');
  }
  return withLog(
    updateEnemy(state, uid, (e) => ({
      ...e,
      statuses: addStatus(e.statuses, status, turns),
      debuffsTaken: e.debuffsTaken.includes(status) ? e.debuffsTaken : [...e.debuffsTaken, status],
    })),
    `${enemy.name}に${STATUS_LABEL[status]} ${turns} ターン`,
  );
}

function extendEnemyDebuffs(state: CombatState, uid: EnemyUid, turns: number): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || !DEBUFF_IDS.some((id) => hasStatus(enemy.statuses, id))) return state;
  if (enemy.ward > 0) return consumeWard(state, enemy);
  if (traitOf(enemy, 'resolute')) {
    return callout(withLog(state, `${enemy.name}は不屈でデバフを延ばせない`), uid, '無効！');
  }
  return withLog(
    updateEnemy(state, uid, (e) => ({ ...e, statuses: extendStatuses(e.statuses, DEBUFF_IDS, turns) })),
    `${enemy.name}のデバフのターン数 +${turns}`,
  );
}

function consumeWard(state: CombatState, enemy: EnemyState): CombatState {
  const warded = updateEnemy(state, enemy.uid, (e) => ({ ...e, ward: e.ward - 1 }));
  return callout(withLog(warded, `${enemy.name}の加護がデバフを防いだ`), enemy.uid, '無効！');
}

function applyEffect(state: CombatState, effect: Effect, aim: Aim): CombatState {
  switch (effect.kind) {
    case 'gainEnergy':
      return withLog(
        { ...state, player: { ...state.player, energy: state.player.energy + effect.amount } },
        `エナジー +${effect.amount}`,
      );
    case 'draw':
      return drawCards(state, effect.amount);
    case 'heal': {
      const healed = Math.min(effect.amount, state.player.maxHp - state.player.hp);
      if (healed === 0) return state;
      const player = { ...state.player, hp: state.player.hp + healed };
      return withEvent(withLog({ ...state, player }, `HP +${healed}`), {
        kind: 'heal',
        target: 'player',
        amount: healed,
        after: vitalsOf(player),
      });
    }
    case 'loseHp': {
      const player = { ...state.player, hp: Math.max(0, state.player.hp - effect.amount) };
      return withEvent(withLog({ ...state, player }, `HP -${effect.amount}`), {
        kind: 'hit',
        target: 'player',
        hpLoss: effect.amount,
        blocked: 0,
        before: vitalsOf(state.player),
        after: vitalsOf(player),
      });
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
      // 全体攻撃の連撃は、1 発目を全員に当ててから 2 発目へ。
      const amount = attackDamage(state, effect.amount);
      let next = state;
      for (let i = 0; i < (effect.hits ?? 1); i++) {
        next = aimedUids(next, aim).reduce((current, uid) => hitEnemy(current, uid, amount), next);
      }
      return next;
    }
    case 'damageFromBlock': {
      const amount = attackDamage(state, state.player.block);
      return aimedUids(state, aim).reduce((current, uid) => hitEnemy(current, uid, amount), state);
    }
    case 'block':
      return gainPlayerBlock(state, effect.amount);
    case 'doubleBlock':
      return state.player.block > 0 ? gainPlayerBlock(state, state.player.block) : state;
    case 'applyDebuff':
      return aimedUids(state, aim).reduce(
        (current, uid) => debuffEnemy(current, uid, effect.status, effect.turns),
        state,
      );
    case 'gainBuff':
      return withLog(
        { ...state, player: { ...state.player, statuses: addStatus(state.player.statuses, effect.status, effect.turns) } },
        `${STATUS_LABEL[effect.status]} +${effect.turns} ターン`,
      );
    case 'extendDebuffs':
      return aimedUids(state, aim).reduce(
        (current, uid) => extendEnemyDebuffs(current, uid, effect.turns),
        state,
      );
    case 'extendBuffs':
      return withLog(
        {
          ...state,
          player: { ...state.player, statuses: extendStatuses(state.player.statuses, BUFF_IDS, effect.turns) },
        },
        `自分のバフのターン数 +${effect.turns}`,
      );
  }
}

function gainPlayerBlock(state: CombatState, amount: number): CombatState {
  const player = gainBlock(state.player, amount);
  return withEvent(withLog({ ...state, player }, `ブロック +${amount}`), {
    kind: 'blockGain',
    target: 'player',
    amount,
    after: vitalsOf(player),
  });
}

const applyEffects = (state: CombatState, effects: Effect[], aim: Aim): CombatState =>
  effects.reduce((current, effect) => applyEffect(current, effect, aim), state);

function conditionMet(state: CombatState, condition: RelicCondition | undefined): boolean {
  switch (condition) {
    case undefined:
      return true;
    case 'noBlock':
      return state.player.block === 0;
  }
}

/** レリックは対象を選べないので、ダメージは敵全員に当たる。 */
function triggerRelics(state: CombatState, trigger: RelicTrigger): CombatState {
  return state.relics.reduce((current, relic) => {
    if (relic.trigger !== trigger || !conditionMet(current, relic.condition)) return current;
    const announced = withEvent(withLog(current, `${relic.name}が発動`), {
      kind: 'relicTriggered',
      target: 'player',
      relicId: relic.id,
    });
    return applyEffects(announced, relic.effects, 'all');
  }, state);
}

function finishIfWon(state: CombatState): CombatState {
  if (state.status !== 'playerTurn' || livingEnemies(state).length > 0) return state;
  const won = withEvent(withLog({ ...state, status: 'won' }, '敵を全て倒した！'), {
    kind: 'won',
    target: 'player',
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

export function drinkPotion(state: CombatState, slot: number, target?: EnemyUid): CombatState {
  const potion = state.potions[slot];
  if (!potion || !canDrinkPotion(state, slot)) return state;
  const used = withEvent(
    withLog(
      { ...state, potions: state.potions.map((p, i) => (i === slot ? null : p)) },
      `${potion.name}を使用`,
    ),
    { kind: 'potionUsed', target: 'player', potionId: potion.id },
  );
  return settle(applyEffects(used, potion.effects, resolveAim(state, potion.target, target)));
}

/** ポーションを使わずに捨てる。枠を空けて新しいポーションを受け取れるようにするため、いつでもできる。 */
export function discardPotion(state: CombatState, slot: number): CombatState {
  const potion = state.potions[slot];
  if (!potion) return state;
  return withLog(
    { ...state, potions: state.potions.map((p, i) => (i === slot ? null : p)) },
    `${potion.name}を捨てた`,
  );
}

/** target は敵 1 体を狙うカードのときに、どの敵の上で離したか。 */
export function playCard(state: CombatState, instanceId: string, target?: EnemyUid): CombatState {
  const instance = state.hand.find((c) => c.instanceId === instanceId);
  if (!instance || !canPlayCard(state, instanceId)) return state;
  const { card } = instance;
  const aim = resolveAim(state, card.target, target);

  const spent = {
    ...state,
    hand: state.hand.filter((c) => c.instanceId !== instanceId),
    player: { ...state.player, energy: state.player.energy - card.cost },
    ...(card.exhaust
      ? { exhaustPile: [...state.exhaustPile, instance] }
      : { discardPile: [...state.discardPile, instance] }),
  };
  const copied = card.addCopyToDiscard
    ? {
        ...spent,
        discardPile: [...spent.discardPile, { instanceId: `copy-${state.nextEventId}`, card }],
      }
    : spent;
  const played = withEvent(withLog(copied, `${card.name}を使用`), {
    kind: 'cardPlayed',
    target: 'player',
    targets: card.target === 'self' ? [] : aimedUids(state, aim),
    cardType: card.type,
    motion: cardMotion(card),
  });
  const chosen = target ? findEnemy(state, target) : undefined;
  const guarded =
    aim !== 'all' && chosen && isAlive(chosen) && chosen.uid !== aim
      ? callout(withLog(played, `${findEnemy(state, aim)?.name ?? '敵'}がかばった！`), aim, 'かばう！')
      : played;
  return settle(applyEffects(guarded, card.effects, aim));
}

/**
 * カードを使ったら各敵が受ける実ダメージ（筋力・ブロック込み）。実際に使った結果と比べて求めるので、
 * 連撃や全体攻撃、途中で倒れる場合も本番と同じになる。ダメージを受けない敵は含めない。
 */
export function previewCardDamage(
  state: CombatState,
  instanceId: string,
  target?: EnemyUid,
): DamagePreview[] {
  const after = playCard(state, instanceId, target);
  if (after === state) return [];
  return state.enemies.flatMap((before) => {
    const now = findEnemy(after, before.uid);
    if (!now || !isAlive(before)) return [];
    const hpLoss = before.hp - now.hp;
    const blocked = before.block - now.block;
    if (hpLoss <= 0 && blocked <= 0) return [];
    return [{ uid: before.uid, hpLoss, blocked, lethal: !isAlive(now) }];
  });
}

/** 敵の攻撃 1 回分のダメージ（筋力・衰弱・あなたの弱体込み）。インテント表示でも使う。 */
export function enemyAttackDamage(enemy: EnemyState, base: number, player: PlayerState): number {
  return modifiedDamage(Math.max(0, base + enemy.strength), enemy.statuses, player.statuses);
}

/**
 * プレイヤーに付ける状態は自分のターンの始めに 1 減るので、敵のターンにかけるときは 1 多くかけ、
 * 「N ターン」が自分のターン N 回分になるようにする。敵自身の状態も敵のターンの終わりに減るので同じ。
 */
const ACROSS_TICK = 1;

/** 霊体化が続く、プレイヤーのターン数。 */
const INTANGIBLE_TURNS = 1;

/** announce が false なら動きの演出を出さない（倒れた敵の死に際の行動など）。 */
function applyEnemyAction(
  state: CombatState,
  uid: EnemyUid,
  action: EnemyAction,
  announce = true,
): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy) return state;
  const act = (current: CombatState): CombatState =>
    announce ? withEvent(current, { kind: 'enemyAct', target: uid, action: action.kind }) : current;
  switch (action.kind) {
    case 'attack': {
      const amount = enemyAttackDamage(enemy, action.damage, state.player);
      let next = state;
      for (let i = 0; i < action.hits && next.player.hp > 0; i++) {
        next = act(next);
        const result = applyDamage(next.player, amount);
        next = withEvent(
          withLog({ ...next, player: result.target }, formatHit('あなた', result)),
          {
            kind: 'hit',
            target: 'player',
            hpLoss: result.hpLoss,
            blocked: result.blocked,
            before: vitalsOf(next.player),
            after: vitalsOf(result.target),
          },
        );
      }
      return next;
    }
    case 'block': {
      const acted = act(state);
      const guarded = gainBlock(enemy, action.amount);
      return withEvent(
        withLog(
          updateEnemy(acted, uid, () => guarded),
          `${enemy.name}はブロック +${action.amount}`,
        ),
        { kind: 'blockGain', target: uid, amount: action.amount, after: vitalsOf(guarded) },
      );
    }
    case 'buff': {
      const acted = act(state);
      return withLog(
        updateEnemy(acted, uid, (e) => ({ ...e, strength: e.strength + action.strength })),
        `${enemy.name}の筋力 +${action.strength}`,
      );
    }
    case 'heal': {
      const acted = act(state);
      const targets = action.allies ? livingEnemies(acted).map((e) => e.uid) : [uid];
      return targets.reduce((current, targetUid) => healEnemy(current, targetUid, action.amount), acted);
    }
    case 'paralyze':
    case 'chill':
    case 'seal': {
      const acted = act(state);
      const pending = addHindrance(acted.player.pendingHindrance, action);
      return withLog(
        { ...acted, player: { ...acted.player, pendingHindrance: pending } },
        `${enemy.name}の妨害: ${HINDRANCE_LOG[action.kind]}`,
      );
    }
    case 'charge':
      return withLog(act(state), `${enemy.name}は力を溜めている…`);
    case 'debuff': {
      const acted = act(state);
      const statuses = addStatus(acted.player.statuses, action.status, action.turns + ACROSS_TICK);
      return withLog(
        { ...acted, player: { ...acted.player, statuses } },
        `${enemy.name}があなたに${STATUS_LABEL[action.status]} ${action.turns} ターン`,
      );
    }
    case 'addCard': {
      const acted = act(state);
      const added: CardInstance[] = Array.from({ length: action.count }, (_, i) => ({
        instanceId: `junk-${acted.nextEventId}-${i}`,
        card: action.card,
      }));
      return withLog(
        { ...acted, discardPile: [...acted.discardPile, ...added] },
        `${enemy.name}が捨て札に「${action.card.name}」を ${action.count} 枚混ぜた`,
      );
    }
    case 'intangible': {
      const acted = updateEnemy(act(state), uid, (e) => ({
        ...e,
        statuses: addStatus(e.statuses, 'intangible', INTANGIBLE_TURNS + ACROSS_TICK),
      }));
      return callout(withLog(acted, `${enemy.name}は霊体化した`), uid, '霊体化');
    }
    case 'idle':
      return withLog(
        act(state),
        action.reason === 'sleep' ? `${enemy.name}は眠っている…` : `${enemy.name}はダウンしていて動けない`,
      );
  }
}

const HINDRANCE_LOG = {
  paralyze: '次のターン、麻痺でエナジーが減る',
  chill: '次のターン、凍えで引く枚数が減る',
  seal: '次のターン、スキルが封印される',
} as const;

function addHindrance(
  current: Hindrance,
  action: Extract<EnemyAction, { kind: 'paralyze' | 'chill' | 'seal' }>,
): Hindrance {
  switch (action.kind) {
    case 'paralyze':
      return { ...current, paralysis: Math.min(MAX_HINDRANCE_STACK, current.paralysis + action.amount) };
    case 'chill':
      return { ...current, chill: Math.min(MAX_HINDRANCE_STACK, current.chill + action.amount) };
    case 'seal':
      return { ...current, seal: true };
  }
}

function healEnemy(state: CombatState, uid: EnemyUid, amount: number): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || !isAlive(enemy)) return state;
  const healed = Math.min(amount, enemy.maxHp - enemy.hp);
  if (healed === 0) return state;
  const next = { ...enemy, hp: enemy.hp + healed };
  return withEvent(withLog(updateEnemy(state, uid, () => next), `${enemy.name}の HP +${healed}`), {
    kind: 'heal',
    target: uid,
    amount: healed,
    after: vitalsOf(next),
  });
}

/** 生きている敵が左から順に行動する。敵のブロックは敵のターン開始時に消える。 */
function runEnemyTurn(state: CombatState): CombatState {
  let next: CombatState = {
    ...state,
    enemies: state.enemies.map((enemy) => (isAlive(enemy) ? { ...enemy, block: 0 } : enemy)),
  };
  for (const { uid } of livingEnemies(next)) {
    const enemy = findEnemy(next, uid);
    if (!enemy) continue;
    const move = currentIntent(enemy);
    next = withLog(next, `${enemy.name}の「${move.name}」`);
    for (const action of move.actions) {
      next = applyEnemyAction(next, uid, action);
      if (next.player.hp <= 0) {
        return withEvent(withLog({ ...next, status: 'lost' }, 'あなたは力尽きた…'), {
          kind: 'defeated',
          target: 'player',
        });
      }
    }
    next = advanceEnemy(next, uid);
  }
  // 敵のバフ・デバフは敵のターンの終わりに 1 ターン進む（かけたターンの敵の行動までは効く）。
  // ダウンが明けたら、よろめきゲージが元に戻る。
  return {
    ...next,
    enemies: next.enemies.map((enemy) => {
      const statuses = tickStatuses(enemy.statuses);
      const recovered = hasStatus(enemy.statuses, 'down') && !hasStatus(statuses, 'down');
      const stagger = recovered ? (traitOf(enemy, 'stagger')?.hits ?? 0) : enemy.stagger;
      return { ...enemy, statuses, stagger };
    }),
  };
}

/** 行動を終えた敵を次へ進める。眠り・ダウン中は行動パターンの順番を進めない。 */
function advanceEnemy(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy) return state;
  if (enemy.asleep > 1) return updateEnemy(state, uid, (e) => ({ ...e, asleep: e.asleep - 1 }));
  if (enemy.asleep === 1) return wakeEnemy(state, uid);
  if (enemy.stunned) return updateEnemy(state, uid, (e) => ({ ...e, stunned: false }));
  return updateEnemy(state, uid, (e) => ({ ...e, moveIndex: e.moveIndex + 1 }));
}

/** 手札に残ったお邪魔カードの効果をかけ、消えるカードは廃棄する。残りは捨て札へ。 */
function discardHand(state: CombatState): CombatState {
  const afterEffects = state.hand.reduce((current, { card }) => {
    if (!card.turnEndInHand) return current;
    return applyEffects(withLog(current, `手札の${card.name}`), card.turnEndInHand, 'all');
  }, state);
  const vanishing = afterEffects.hand.filter(({ card }) => card.ethereal);
  const kept = afterEffects.hand.filter(({ card }) => !card.ethereal);
  return {
    ...afterEffects,
    hand: [],
    discardPile: [...afterEffects.discardPile, ...kept],
    exhaustPile: [...afterEffects.exhaustPile, ...vanishing],
  };
}

export function endTurn(state: CombatState): CombatState {
  if (state.status !== 'playerTurn') return state;
  const afterRelics = triggerRelics(state, 'turnEnd');
  const afterMetal =
    afterRelics.player.endTurnBlock > 0
      ? applyEffect(afterRelics, { kind: 'block', amount: afterRelics.player.endTurnBlock }, 'all')
      : afterRelics;
  const discarded = finishIfLost(withLog(discardHand(afterMetal), 'ターン終了'));
  if (discarded.status === 'lost') return discarded;
  const afterEnemy = runEnemyTurn(discarded);
  return afterEnemy.status === 'lost' ? afterEnemy : startPlayerTurn(afterEnemy);
}
