import type { CardDefinition, CardInstance } from '../domain/card';
import type { Attribute } from '../domain/attribute';
import type {
  ActorId,
  CombatEventBody,
  CombatStats,
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
import type { DebuffId, PowerId } from '../domain/status';
import {
  affinityMultiplier,
  cardAttributes,
  ENEMY_AFFINITY_MULTIPLIER,
  enemyAffinity,
  hasAdvantage,
  weaknessesOf,
} from './attribute';
import { arrowDamage, forgeArrow } from './arrows';
import { baseCardId, growCard } from './cards';
import { ATTRIBUTE_LABEL, POWER_LABEL, STATUS_LABEL } from './describe';
import { SLEEP_MOVE, traitOf } from './enemyTraits';
import { cardMotion } from './motion';
import { shuffle } from './random';
import {
  addStatus,
  BUFF_IDS,
  DEBUFF_IDS,
  extendStatuses,
  hasStatus,
  INTANGIBLE_CAP,
  modifiedDamage,
  statusTurns,
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

const powerOf = (state: CombatState, power: PowerId): number => state.player.powers[power] ?? 0;

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
  const retains = hasStatus(state.player.statuses, 'retainBlock') || powerOf(state, 'barricade') > 0;
  const keepBlock = turn > 1 && retains && state.player.block > 0;
  const demonForm = turn > 1 ? powerOf(state, 'demonForm') : 0;
  const started: CombatState = {
    ...state,
    turn,
    status: 'playerTurn',
    player: {
      ...state.player,
      block: keepBlock ? state.player.block : 0,
      energy: Math.max(0, state.player.maxEnergy - hindrance.paralysis),
      strength: state.player.strength + demonForm,
      tempStrength: 0,
      enchant: [],
      cardsThisTurn: 0,
      lashSeedThisTurn: 0,
      hindrance,
      pendingHindrance: NO_HINDRANCE,
      statuses: turn > 1 ? tickStatuses(state.player.statuses) : state.player.statuses,
    },
  };
  const logs = [
    ...(keepBlock ? [`ブロック ${state.player.block} を引き継いだ`] : []),
    ...(demonForm > 0 ? [`紅蓮の化身で筋力 +${demonForm}`] : []),
    ...hindranceLogs(hindrance),
  ];
  const logged = logs.reduce(withLog, withLog(started, `ターン ${turn} 開始`));
  return grantArteIfReady(drawCards(logged, Math.max(0, state.drawPerTurn - hindrance.chill)));
}

export const EMPTY_STATS: CombatStats = {
  maxHit: 0,
  enemiesDefeated: 0,
  weakHits: 0,
  artes: 0,
  cardsPlayed: {},
};

/** 秘奥義ゲージの最大値と、溜まり方。 */
export const ARTE_GAUGE_MAX = 20;
const ARTE_PER_CARD = 1;
const ARTE_PER_WEAK_CARD = 1;

function gainArte(state: CombatState, amount: number): CombatState {
  const arteGauge = Math.min(ARTE_GAUGE_MAX, state.player.arteGauge + amount);
  return { ...state, player: { ...state.player, arteGauge } };
}

/** ゲージが満タンなら秘奥義カードを手札に加えてゲージを空にする。手札がいっぱいなら空くまで待つ。 */
function grantArteIfReady(state: CombatState): CombatState {
  if (state.player.arteGauge < ARTE_GAUGE_MAX || isHandFull(state)) return state;
  const arte: CardInstance = { instanceId: `arte-${state.nextEventId}`, card: state.mysticArte };
  const granted: CombatState = {
    ...state,
    hand: [...state.hand, arte],
    player: { ...state.player, arteGauge: 0 },
  };
  return callout(withLog(granted, `秘奥義「${state.mysticArte.name}」が使える！`), 'player', '秘奥義解放！');
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
      powers: {},
      attribute: setup.agent.attribute,
      enchant: [],
      cardsThisTurn: 0,
      lashSeedThisTurn: 0,
      arrowsSpent: 0,
      arrowsForged: 0,
      selfHpLost: 0,
      arteGauge: 0,
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
      attribute: enemy.attribute ?? null,
      weaknesses: weaknessesOf(enemy.attribute),
      artifact: traitOf(enemy, 'artifact')?.charges ?? 0,
      awakened: false,
    })),
    drawPerTurn: setup.drawPerTurn,
    mysticArte: setup.agent.mysticArte,
    stats: EMPTY_STATS,
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
  return triggerRelics(triggerRelics(firstTurn, 'combatStart'), 'turnStart');
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

/** strengthMultiplier は大剣のように筋力が何倍で乗るか。 */
function attackDamage(state: CombatState, base: number, strengthMultiplier = 1): number {
  return Math.max(0, base + (state.player.strength + state.player.tempStrength) * strengthMultiplier);
}

/**
 * 攻撃の種類。attributes は相性の判定に使う属性（敵の弱点を突くとダメージ ×1.25）。
 * fixed（パワーの追加ダメージ）は倍率をかけず、霊体化の上限だけ効く。
 */
type HitKind = { attributes: readonly Attribute[]; fixed?: boolean };

const FIXED_HIT: HitKind = { attributes: [], fixed: true };
/** レリック・ポーションなど、属性の無い攻撃。 */
const NO_ATTRIBUTE: HitKind = { attributes: [] };

/** base は筋力込みの値。熱血・衰弱・弱体・相性の倍率は敵ごとにここでかける。 */
function hitEnemy(state: CombatState, uid: EnemyUid, base: number, kind: HitKind): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || !isAlive(enemy)) return state;
  const weak = !kind.fixed && hasAdvantage(kind.attributes, enemy.attribute);
  const raw = kind.fixed
    ? hasStatus(enemy.statuses, 'intangible')
      ? Math.min(base, INTANGIBLE_CAP)
      : base
    : modifiedDamage(base, state.player.statuses, enemy.statuses, affinityMultiplier(kind.attributes, enemy.attribute));
  // 鉄鱗は攻撃ヒットだけを頭打ちにする。宿り木などの固定ダメージは通す。
  const cap = kind.fixed ? undefined : traitOf(enemy, 'hitCap')?.amount;
  const scaled = cap !== undefined && raw > cap;
  const amount = cap === undefined ? raw : Math.min(raw, cap);
  const result = holdUntilAwakened(enemy, applyDamage(enemy, amount));
  const recorded: CombatState = {
    ...updateEnemy(state, uid, () => result.target),
    stats: {
      ...state.stats,
      maxHit: Math.max(state.stats.maxHit, Math.min(result.hpLoss, enemy.hp)),
      enemiesDefeated: state.stats.enemiesDefeated + (isAlive(result.target) ? 0 : 1),
      weakHits: state.stats.weakHits + (weak ? 1 : 0),
    },
  };
  const hit = withEvent(
    withLog(recorded, formatHit(enemy.name, result) + (weak ? '（弱点）' : '') + (scaled ? '（鉄鱗）' : '')),
    {
      kind: 'hit',
      target: uid,
      hpLoss: result.hpLoss,
      blocked: result.blocked,
      before: vitalsOf(enemy),
      after: vitalsOf(result.target),
      weak,
    },
  );
  if (isAlive(result.target)) {
    const threshold = awakeningThreshold(result.target);
    if (threshold !== null && result.target.hp <= threshold) return awakenEnemy(hit, uid);
    return result.hpLoss > 0 && enemy.asleep > 0 ? wakeEnemy(hit, uid) : hit;
  }
  const defeated = withEvent(withLog(hit, `${enemy.name}を倒した！`), { kind: 'defeated', target: uid });
  return onEnemyDefeated(defeated, uid);
}

function callout(state: CombatState, target: ActorId, text: string): CombatState {
  return withEvent(state, { kind: 'callout', target, text });
}

/** まだ覚醒していない敵の、覚醒する HP。覚醒の性質が無いか、覚醒済みなら null。 */
function awakeningThreshold(enemy: EnemyState): number | null {
  const awaken = traitOf(enemy, 'awaken');
  if (!awaken || enemy.awakened) return null;
  return Math.floor(enemy.maxHp * awaken.threshold);
}

/** 覚醒する前の敵は、覚醒する HP より下がらない。 */
function holdUntilAwakened(
  before: EnemyState,
  result: DamageResult<EnemyState>,
): DamageResult<EnemyState> {
  const threshold = awakeningThreshold(before);
  if (threshold === null || result.target.hp >= threshold) return result;
  const floor = Math.min(before.hp, threshold);
  return {
    ...result,
    target: { ...result.target, hp: floor },
    hpLoss: before.hp - floor,
  };
}

/** 覚醒: 筋力とブロックを得て、行動パターンが第二形態に替わる（次の行動は第二形態の先頭から）。 */
function awakenEnemy(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  const awaken = enemy ? traitOf(enemy, 'awaken') : undefined;
  if (!enemy || !awaken) return state;
  const awakened = updateEnemy(state, uid, (e) => ({
    ...gainBlock(e, awaken.block),
    awakened: true,
    asleep: 0,
    strength: e.strength + awaken.strength,
    moves: awaken.moves,
    moveIndex: 0,
  }));
  const after = findEnemy(awakened, uid);
  const logged = withLog(
    awakened,
    `${enemy.name}が真の姿を現した！（筋力 +${awaken.strength}・ブロック +${awaken.block}）`,
  );
  const withBlock = after
    ? withEvent(logged, { kind: 'blockGain', target: uid, amount: awaken.block, after: vitalsOf(after) })
    : logged;
  return callout(withBlock, uid, '覚醒！');
}

/**
 * 行動の中で旗を掲げる（属性が変わる）なら、変わったあとの敵。攻撃の予告ダメージを、実際に当たる属性で出すのに使う。
 */
export function attackerFor(enemy: EnemyState, move: EnemyMove): EnemyState {
  const shift = move.actions.find(
    (action): action is Extract<EnemyAction, { kind: 'shiftAttribute' }> => action.kind === 'shiftAttribute',
  );
  return shift ? withAttribute(enemy, shift.attribute) : enemy;
}

const withAttribute = (enemy: EnemyState, attribute: Attribute): EnemyState => ({
  ...enemy,
  attribute,
  weaknesses: weaknessesOf(attribute),
});

/** 眠りから覚めて筋力が上がる（攻撃で起こされても、時間で起きても同じ）。 */
function wakeEnemy(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy) return state;
  const gain = traitOf(enemy, 'sleep')?.wakeStrength ?? 0;
  const woken = updateEnemy(state, uid, (e) => ({ ...e, asleep: 0, strength: e.strength + gain }));
  const text = gain > 0 ? `${enemy.name}が目を覚ました！（筋力 +${gain}）` : `${enemy.name}が目を覚ました！`;
  return callout(withLog(woken, text), uid, '目覚めた！');
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
  if (enemy.artifact > 0) return consumeArtifact(state, enemy);
  const debuffed = withLog(
    updateEnemy(state, uid, (e) => ({
      ...e,
      statuses: addStatus(e.statuses, status, turns),
    })),
    `${enemy.name}に${STATUS_LABEL[status]} ${turns} ターン`,
  );
  const verdure = status === 'seed' ? powerOf(debuffed, 'verdure') : 0;
  const sprouted = verdure > 0 ? gainPlayerBlock(debuffed, verdure) : debuffed;
  const sadistic = powerOf(sprouted, 'sadistic');
  return sadistic > 0 ? hitEnemy(sprouted, uid, sadistic, FIXED_HIT) : sprouted;
}

/** 宿り木の発動: 残りターン数と同じ固定ダメージ。ターン数は減らさない（減るのは敵のターンの終わり）。 */
function bloomEnemySeed(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  const seed = enemy && isAlive(enemy) ? statusTurns(enemy.statuses, 'seed') : 0;
  if (seed === 0) return state;
  return hitEnemy(withLog(state, `${enemy?.name ?? '敵'}の宿り木が芽吹いた`), uid, seed, FIXED_HIT);
}

/**
 * ターンを終えたとき、宿り木でこの敵が失う HP。
 * 敵のターンの始めにブロックが消えてから発動するので、今ついているブロックは数に入れない。
 * 霊体化なら 1 で頭打ち。覚醒する前は、覚醒する HP より下がらない。
 */
export function pendingSeedLoss(enemy: EnemyState): number {
  if (!isAlive(enemy)) return 0;
  const seed = statusTurns(enemy.statuses, 'seed');
  if (seed <= 0) return 0;
  const amount = hasStatus(enemy.statuses, 'intangible') ? Math.min(seed, INTANGIBLE_CAP) : seed;
  const unblocked = { ...enemy, block: 0 };
  const result = holdUntilAwakened(unblocked, applyDamage(unblocked, amount));
  return unblocked.hp - result.target.hp;
}

function multiplyEnemyDebuff(state: CombatState, uid: EnemyUid, status: DebuffId, factor: number): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || !hasStatus(enemy.statuses, status)) return state;
  if (enemy.artifact > 0) return consumeArtifact(state, enemy);
  const turns = statusTurns(enemy.statuses, status) * factor;
  return callout(
    withLog(
      updateEnemy(state, uid, (e) => ({ ...e, statuses: { ...e.statuses, [status]: turns } })),
      `${enemy.name}の${STATUS_LABEL[status]}が ${turns} に`,
    ),
    uid,
    `${STATUS_LABEL[status]} ×${factor}`,
  );
}

const totalDebuffTurns = (enemy: EnemyState) =>
  DEBUFF_IDS.reduce((sum, id) => sum + statusTurns(enemy.statuses, id), 0);

/** HP が一番低い生きている敵（同じなら左）。パワーの追加ダメージの的。 */
function weakestEnemy(state: CombatState): EnemyState | undefined {
  return livingEnemies(state).reduce<EnemyState | undefined>(
    (lowest, enemy) => (!lowest || enemy.hp < lowest.hp ? enemy : lowest),
    undefined,
  );
}

function extendEnemyDebuffs(state: CombatState, uid: EnemyUid, turns: number): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy || !DEBUFF_IDS.some((id) => hasStatus(enemy.statuses, id))) return state;
  if (enemy.artifact > 0) return consumeArtifact(state, enemy);
  return withLog(
    updateEnemy(state, uid, (e) => ({ ...e, statuses: extendStatuses(e.statuses, DEBUFF_IDS, turns) })),
    `${enemy.name}のデバフのターン数 +${turns}`,
  );
}

/** アーティファクトを 1 消費して、今回のデバフ（付与・延長・倍化）を丸ごと無効にする。 */
function consumeArtifact(state: CombatState, enemy: EnemyState): CombatState {
  const left = enemy.artifact - 1;
  const consumed = updateEnemy(state, enemy.uid, (e) => ({ ...e, artifact: left }));
  return callout(
    withLog(consumed, `${enemy.name}のアーティファクトがデバフを防いだ（残り ${left}）`),
    enemy.uid,
    '無効！',
  );
}

function applyEffect(state: CombatState, effect: Effect, aim: Aim, hitKind: HitKind = NO_ATTRIBUTE): CombatState {
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
      const rupture = powerOf(state, 'rupture');
      const player = {
        ...state.player,
        hp: Math.max(0, state.player.hp - effect.amount),
        strength: state.player.strength + rupture,
        selfHpLost: state.player.selfHpLost + effect.amount,
      };
      const lost = withEvent(withLog({ ...state, player }, `HP -${effect.amount}`), {
        kind: 'hit',
        target: 'player',
        hpLoss: effect.amount,
        blocked: 0,
        before: vitalsOf(state.player),
        after: vitalsOf(player),
      });
      return rupture > 0 ? withLog(lost, `燃える血潮で筋力 +${rupture}`) : lost;
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
      // 連閃は 2 ヒット目から乗るので、1 ヒットだけの大剣には効かない。
      const amount = attackDamage(state, effect.amount, effect.strengthMultiplier);
      const flurry = powerOf(state, 'flurry');
      let next = state;
      const hits = effect.hits ?? 1;
      for (let i = 0; i < hits; i++) {
        const hitAmount = amount + (i > 0 ? flurry : 0);
        next = aimedUids(next, aim).reduce((current, uid) => hitEnemy(current, uid, hitAmount, hitKind), next);
      }
      return next;
    }
    case 'damagePerSelfHpLost': {
      const amount = attackDamage(state, effect.base + state.player.selfHpLost * effect.perHp);
      return aimedUids(state, aim).reduce((current, uid) => hitEnemy(current, uid, amount, hitKind), state);
    }
    case 'damageFromBlock': {
      const amount = attackDamage(state, state.player.block);
      return aimedUids(state, aim).reduce((current, uid) => hitEnemy(current, uid, amount, hitKind), state);
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
    case 'gainPower': {
      const powers = { ...state.player.powers, [effect.power]: powerOf(state, effect.power) + effect.amount };
      const powered = withLog({ ...state, player: { ...state.player, powers } }, `${POWER_LABEL[effect.power]}を得た`);
      return effect.power === 'arrowEdge' || effect.power === 'arrowSpread' ? reforgeArrows(powered) : powered;
    }
    case 'damagePerDebuff':
      return aimedUids(state, aim).reduce((current, uid) => {
        const enemy = findEnemy(current, uid);
        if (!enemy) return current;
        const base = effect.base + totalDebuffTurns(enemy) * effect.perTurn;
        return hitEnemy(current, uid, attackDamage(current, base), hitKind);
      }, state);
    case 'detonateDebuffs':
      return aimedUids(state, aim).reduce((current, uid) => {
        const enemy = findEnemy(current, uid);
        const turns = enemy ? totalDebuffTurns(enemy) : 0;
        if (turns === 0) return withLog(current, '消せるデバフが無かった');
        const hit = hitEnemy(current, uid, attackDamage(current, turns * effect.perTurn), hitKind);
        const cleared = updateEnemy(hit, uid, (e) => ({
          ...e,
          statuses: Object.fromEntries(
            Object.entries(e.statuses).filter(([id]) => !(DEBUFF_IDS as readonly string[]).includes(id)),
          ),
        }));
        return callout(cleared, uid, `烙印 ${turns}`);
      }, state);
    case 'addArrows':
      return addArrows(state, effect.amount);
    case 'volleySpentArrows': {
      const hits = state.player.arrowsSpent;
      if (hits === 0) return withLog(state, 'まだ矢を放っていない');
      const amount = attackDamage(state, arrowDamage(state.player.powers));
      let next = state;
      for (let i = 0; i < hits; i++) {
        next = aimedUids(next, aim).reduce((current, uid) => hitEnemy(current, uid, amount, hitKind), next);
      }
      return next;
    }
    case 'detonateSeed':
      return aimedUids(state, aim).reduce((current, uid) => {
        const enemy = findEnemy(current, uid);
        const seed = enemy ? statusTurns(enemy.statuses, 'seed') : 0;
        if (seed === 0) return current;
        const hit = hitEnemy(current, uid, attackDamage(current, seed * effect.perTurn), hitKind);
        const cleared = updateEnemy(hit, uid, (e) => ({
          ...e,
          statuses: Object.fromEntries(Object.entries(e.statuses).filter(([id]) => id !== 'seed')),
        }));
        return callout(cleared, uid, `宿り木 ${seed}`);
      }, state);
    case 'ifTargetHas': {
      const met = aimedUids(state, aim).some((uid) => {
        const enemy = findEnemy(state, uid);
        return enemy !== undefined && hasStatus(enemy.statuses, effect.status);
      });
      return met ? applyEffects(state, effect.effects, aim, hitKind) : state;
    }
    case 'consumeBlock': {
      const block = state.player.block;
      if (block === 0) return withLog(state, 'ブロックが無かった');
      const spent = withLog({ ...state, player: { ...state.player, block: 0 } }, `ブロック ${block} を失った`);
      const amount = attackDamage(spent, block * effect.multiplier);
      return aimedUids(spent, aim).reduce((current, uid) => hitEnemy(current, uid, amount, hitKind), spent);
    }
    case 'feed':
      return aimedUids(state, aim).reduce((current, uid) => {
        const before = findEnemy(current, uid);
        const hit = hitEnemy(current, uid, attackDamage(current, effect.damage), hitKind);
        const after = findEnemy(hit, uid);
        if (!before || !isAlive(before) || !after || isAlive(after)) return hit;
        const player = {
          ...hit.player,
          maxHp: hit.player.maxHp + effect.maxHp,
          hp: hit.player.hp + effect.maxHp,
        };
        return callout(
          withLog({ ...hit, player }, `最大 HP +${effect.maxHp}`),
          'player',
          `最大HP +${effect.maxHp}`,
        );
      }, state);
    case 'enchant': {
      const enchant = state.player.enchant.includes(effect.attribute)
        ? state.player.enchant
        : [...state.player.enchant, effect.attribute];
      return withLog(
        { ...state, player: { ...state.player, enchant } },
        `このターン、アタックに${ATTRIBUTE_LABEL[effect.attribute]}属性が加わる`,
      );
    }
    case 'multiplyDebuff':
      return aimedUids(state, aim).reduce(
        (current, uid) => multiplyEnemyDebuff(current, uid, effect.status, effect.factor),
        state,
      );
    case 'bloomSeed':
      return aimedUids(state, aim).reduce(bloomEnemySeed, state);
    case 'damagePerCardPlayed': {
      const amount = attackDamage(state, effect.base + state.player.cardsThisTurn * effect.perCard);
      return aimedUids(state, aim).reduce((current, uid) => hitEnemy(current, uid, amount, hitKind), state);
    }
    case 'gainLashSeed':
      return withLog(
        {
          ...state,
          player: { ...state.player, lashSeedThisTurn: state.player.lashSeedThisTurn + effect.amount },
        },
        `このターン、ムチの攻撃に宿り木 ${effect.amount}`,
      );
  }
}

function gainPlayerBlock(state: CombatState, amount: number): CombatState {
  const player = gainBlock(state.player, amount);
  const gained = withEvent(withLog({ ...state, player }, `ブロック +${amount}`), {
    kind: 'blockGain',
    target: 'player',
    amount,
    after: vitalsOf(player),
  });
  const juggernaut = powerOf(gained, 'juggernaut');
  const target = juggernaut > 0 ? weakestEnemy(gained) : undefined;
  return target ? hitEnemy(gained, target.uid, juggernaut, FIXED_HIT) : gained;
}

/** カードが廃棄されたとき（灰より立つ）。 */
function onExhausted(state: CombatState, count: number): CombatState {
  const block = powerOf(state, 'feelNoPain') * count;
  return block > 0 ? gainPlayerBlock(state, block) : state;
}

const applyEffects = (
  state: CombatState,
  effects: Effect[],
  aim: Aim,
  hitKind: HitKind = NO_ATTRIBUTE,
): CombatState => effects.reduce((current, effect) => applyEffect(current, effect, aim, hitKind), state);

function conditionMet(state: CombatState, condition: RelicCondition | undefined): boolean {
  switch (condition) {
    case undefined:
      return true;
    case 'noBlock':
      return state.player.block === 0;
    case 'lowHp':
      return state.player.hp * 2 <= state.player.maxHp;
    case 'eliteOrBoss':
      return state.enemies.some((enemy) => enemy.rank !== 'normal');
    case 'everyThirdTurn':
      return state.turn % 3 === 0;
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
  const announced = card.mysticArte
    ? withEvent(withLog(played, `秘奥義「${card.name}」！`), {
        kind: 'mysticArte',
        target: 'player',
        name: card.name,
      })
    : played;
  const chosen = target ? findEnemy(state, target) : undefined;
  const guarded =
    aim !== 'all' && chosen && isAlive(chosen) && chosen.uid !== aim
      ? callout(withLog(announced, `${findEnemy(state, aim)?.name ?? '敵'}がかばった！`), aim, 'かばう！')
      : announced;
  const eventsBefore = guarded.events.length;
  const resolved = applyEffects(guarded, card.effects, aim, { attributes: playedAttributes(state, card) });
  const exhausted = card.exhaust ? onExhausted(resolved, 1) : resolved;
  const grown = growPlayedCard(exhausted, instance, livingEnemies(state).length);
  const lashed = card.whip && card.type === 'attack' ? plantLashSeed(grown, card, aim) : grown;
  const shot = quickdrawShot(lashed, powerOf(state, 'quickdraw'));
  const weakHit = shot.events.slice(eventsBefore).some((event) => event.kind === 'hit' && event.weak);
  const counted = {
    ...shot,
    player: {
      ...shot.player,
      cardsThisTurn: shot.player.cardsThisTurn + 1,
      arrowsSpent: shot.player.arrowsSpent + (card.arrow ? 1 : 0),
    },
  };
  return settle(grantArteIfReady(recordPlay(counted, card, weakHit)));
}

/** カードのダメージの回数（2×4 なら 4）。条件付きの追加ダメージは数えない。 */
const damageHits = (card: CardDefinition) =>
  card.effects.reduce((sum, effect) => sum + (effect.kind === 'damage' ? (effect.hits ?? 1) : 0), 0);

/**
 * ムチのアタックの後、当てた敵（倒れていない敵）に 1 ヒットにつき宿り木。このターンの分とパワーの分を足す。
 * 連打のムチほど多く植わる。
 */
function plantLashSeed(state: CombatState, card: CardDefinition, aim: Aim): CombatState {
  const amount = (state.player.lashSeedThisTurn + powerOf(state, 'lashSeed')) * damageHits(card);
  if (amount === 0) return state;
  return aimedUids(state, aim)
    .filter((uid) => {
      const enemy = findEnemy(state, uid);
      return enemy !== undefined && isAlive(enemy);
    })
    .reduce((current, uid) => debuffEnemy(current, uid, 'seed', amount), state);
}

/** 速射の構え: カードを使うたびに HP が一番低い敵へ追撃。構えを張ったカード自身では撃たない。 */
function quickdrawShot(state: CombatState, amount: number): CombatState {
  const target = amount > 0 ? weakestEnemy(state) : undefined;
  return target ? hitEnemy(state, target.uid, amount, FIXED_HIT) : state;
}

/** カードの属性に、魔法剣で加わった属性を足したもの（アタックのみ）。 */
function playedAttributes(state: CombatState, card: CardDefinition): Attribute[] {
  const own = cardAttributes(card);
  if (card.type !== 'attack') return own;
  return [...own, ...state.player.enchant.filter((attribute) => !own.includes(attribute))];
}

/** 使用回数を記録し、秘奥義ゲージを溜める（秘奥義そのものでは溜まらない）。 */
function recordPlay(state: CombatState, card: CardDefinition, weakHit: boolean): CombatState {
  const id = baseCardId(card.id);
  const stats: CombatStats = {
    ...state.stats,
    artes: state.stats.artes + (card.mysticArte ? 1 : 0),
    cardsPlayed: { ...state.stats.cardsPlayed, [id]: (state.stats.cardsPlayed[id] ?? 0) + 1 },
  };
  const recorded = { ...state, stats };
  if (card.mysticArte) return recorded;
  return gainArte(recorded, ARTE_PER_CARD + (weakHit ? ARTE_PER_WEAK_CARD : 0));
}

/** 成長するカードを、使った（または倒した）分だけ強くする。どの山に移っていても探して置き換える。 */
function growPlayedCard(state: CombatState, instance: CardInstance, livingBefore: number): CombatState {
  const { growth } = instance.card;
  if (!growth) return state;
  if (growth.when === 'kill' && livingEnemies(state).length >= livingBefore) return state;
  const grow = (pile: CardInstance[]) =>
    pile.map((c) => (c.instanceId === instance.instanceId ? { ...c, card: growCard(c.card) } : c));
  const grown: CombatState = {
    ...state,
    drawPile: grow(state.drawPile),
    hand: grow(state.hand),
    discardPile: grow(state.discardPile),
    exhaustPile: grow(state.exhaustPile),
  };
  const label = growth.stat === 'damage' ? 'ダメージ' : 'ブロック';
  const scope = growth.scope === 'run' ? '（永続）' : '';
  return callout(
    withLog(grown, `${instance.card.name}が成長した（${label} +${growth.amount}${scope}）`),
    'player',
    `成長 +${growth.amount}`,
  );
}

const DECK_INSTANCE_ID = /^card-(\d+)$/;

/**
 * 戦闘後のデッキ。ランの間ずっと成長するカードだけ、戦闘中に成長した状態を持ち帰る。
 * 戦闘開始時に deck の i 枚目へ `card-i` を振っているので、それで元の位置を探す。
 */
export function deckAfterCombat(state: CombatState, deck: readonly CardDefinition[]): CardDefinition[] {
  const grown = new Map<number, CardDefinition>();
  for (const { instanceId, card } of [
    ...state.drawPile,
    ...state.hand,
    ...state.discardPile,
    ...state.exhaustPile,
  ]) {
    const match = DECK_INSTANCE_ID.exec(instanceId);
    if (match && card.growth?.scope === 'run') grown.set(Number(match[1]), card);
  }
  return deck.map((card, index) => grown.get(index) ?? card);
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

/** 敵の攻撃 1 回分のダメージ（筋力・衰弱・あなたの弱体・相性込み）。インテント表示でも使う。 */
export function enemyAttackDamage(enemy: EnemyState, base: number, player: PlayerState): number {
  const affinity = ENEMY_AFFINITY_MULTIPLIER[enemyAffinity(enemy.attribute, player.attribute)];
  return modifiedDamage(Math.max(0, base + enemy.strength), enemy.statuses, player.statuses, affinity);
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
      const affinity = enemyAffinity(enemy.attribute, state.player.attribute);
      const weak = affinity === 'weak';
      const note = weak ? '（弱点）' : affinity === 'resist' ? '（相性で軽減）' : '';
      const thorns = powerOf(state, 'thorns');
      let next = state;
      for (let i = 0; i < action.hits && next.player.hp > 0; i++) {
        const attacker = findEnemy(next, uid);
        if (!attacker || !isAlive(attacker)) break;
        next = act(next);
        const result = applyDamage(next.player, amount);
        next = withEvent(
          withLog({ ...next, player: result.target }, formatHit('あなた', result) + note),
          {
            kind: 'hit',
            target: 'player',
            hpLoss: result.hpLoss,
            blocked: result.blocked,
            before: vitalsOf(next.player),
            after: vitalsOf(result.target),
            weak,
          },
        );
        if (thorns > 0 && next.player.hp > 0) next = hitEnemy(next, uid, thorns, FIXED_HIT);
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
    case 'shiftAttribute': {
      const acted = updateEnemy(act(state), uid, (e) => withAttribute(e, action.attribute));
      const label = ATTRIBUTE_LABEL[action.attribute];
      return callout(withLog(acted, `${enemy.name}が${label}の旗を掲げた（${label}属性になった）`), uid, `${label}の旗`);
    }
    case 'idle':
      return withLog(
        act(state),
        `${enemy.name}は眠っている…`,
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

/**
 * 生きている敵が左から順に行動する。敵のブロックは敵のターン開始時に消え、そのあと宿り木が発動する。
 * 宿り木や茨の鎧で全員倒れたら、その場で勝利。
 */
function runEnemyTurn(state: CombatState): CombatState {
  const unblocked: CombatState = {
    ...state,
    enemies: state.enemies.map((enemy) => (isAlive(enemy) ? { ...enemy, block: 0 } : enemy)),
  };
  let next = livingEnemies(unblocked).reduce((current, { uid }) => bloomEnemySeed(current, uid), unblocked);
  if (livingEnemies(next).length === 0) return finishIfWon(next);
  for (const { uid } of livingEnemies(next)) {
    const enemy = findEnemy(next, uid);
    if (!enemy || !isAlive(enemy)) continue;
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
    // 行動中に（茨の鎧などで）覚醒したら、第二形態の先頭の行動から始めるため順番を進めない。
    if (findEnemy(next, uid)?.moves === enemy.moves) next = advanceEnemy(next, uid);
    if (livingEnemies(next).length === 0) return finishIfWon(next);
  }
  // 敵のバフ・デバフは敵のターンの終わりに 1 ターン進む（かけたターンの敵の行動までは効く）。
  return {
    ...next,
    enemies: next.enemies.map((enemy) => ({ ...enemy, statuses: tickStatuses(enemy.statuses) })),
  };
}

/** 行動を終えた敵を次へ進める。眠り中は行動パターンの順番を進めない。 */
function advanceEnemy(state: CombatState, uid: EnemyUid): CombatState {
  const enemy = findEnemy(state, uid);
  if (!enemy) return state;
  if (enemy.asleep > 1) return updateEnemy(state, uid, (e) => ({ ...e, asleep: e.asleep - 1 }));
  if (enemy.asleep === 1) return wakeEnemy(state, uid);
  return updateEnemy(state, uid, (e) => ({ ...e, moveIndex: e.moveIndex + 1 }));
}

/** 手札に残ったお邪魔カードの効果をかけ、消えるカードは廃棄する。残りは捨て札へ。 */
function discardHand(state: CombatState): CombatState {
  const afterEffects = state.hand.reduce((current, { card }) => {
    if (!card.turnEndInHand) return current;
    return applyEffects(withLog(current, `手札の${card.name}`), card.turnEndInHand, 'all');
  }, state);
  const retainArrows = powerOf(afterEffects, 'arrowRetain') > 0;
  const isRetained = ({ card }: CardInstance) => retainArrows && card.arrow === true;
  const retained = afterEffects.hand.filter(isRetained);
  const rest = afterEffects.hand.filter((c) => !isRetained(c));
  const vanishing = rest.filter(({ card }) => card.ethereal);
  const kept = rest.filter(({ card }) => !card.ethereal);
  return onExhausted(
    {
      ...afterEffects,
      hand: retained,
      discardPile: [...afterEffects.discardPile, ...kept],
      exhaustPile: [...afterEffects.exhaustPile, ...vanishing],
    },
    vanishing.length,
  );
}

export function endTurn(state: CombatState): CombatState {
  if (state.status !== 'playerTurn') return state;
  const afterRelics = triggerRelics(state, 'turnEnd');
  const afterMetal =
    afterRelics.player.endTurnBlock > 0
      ? applyEffect(afterRelics, { kind: 'block', amount: afterRelics.player.endTurnBlock }, 'all')
      : afterRelics;
  const discarded = settle(withLog(discardHand(afterMetal), 'ターン終了'));
  if (discarded.status !== 'playerTurn') return discarded;
  const afterEnemy = runEnemyTurn(discarded);
  if (afterEnemy.status !== 'playerTurn') return afterEnemy;
  const started = triggerRelics(startPlayerTurn(afterEnemy), 'turnStart');
  return finishIfWon(spreadOvergrowth(supplyArrows(started)));
}

/** 無限の矢筒: ターンの始めに矢を手札へ。 */
function supplyArrows(state: CombatState): CombatState {
  const amount = powerOf(state, 'arrowSupply');
  return amount > 0 ? addArrows(withLog(state, '無限の矢筒から矢を取り出した'), amount) : state;
}

/** 矢を手札に加える。手札がいっぱいなら残りは捨て札へ。 */
function addArrows(state: CombatState, amount: number): CombatState {
  const arrow = forgeArrow(state.player.powers);
  const made: CardInstance[] = Array.from({ length: amount }, (_, i) => ({
    instanceId: `arrow-${state.player.arrowsForged + i}`,
    card: arrow,
  }));
  const room = Math.max(0, MAX_HAND_SIZE - state.hand.length);
  return withLog(
    {
      ...state,
      hand: [...state.hand, ...made.slice(0, room)],
      discardPile: [...state.discardPile, ...made.slice(room)],
      player: { ...state.player, arrowsForged: state.player.arrowsForged + amount },
    },
    `矢を ${amount} 本作った`,
  );
}

/** 矢のパワーが変わったら、手札・山札・捨て札の矢を今のパワーで作り直す。 */
function reforgeArrows(state: CombatState): CombatState {
  const arrow = forgeArrow(state.player.powers);
  const reforge = (pile: CardInstance[]) => pile.map((c) => (c.card.arrow ? { ...c, card: arrow } : c));
  return {
    ...state,
    hand: reforge(state.hand),
    drawPile: reforge(state.drawPile),
    discardPile: reforge(state.discardPile),
  };
}

/** 森の侵蝕: ターンの始めに敵全体へ宿り木。 */
function spreadOvergrowth(state: CombatState): CombatState {
  const amount = powerOf(state, 'overgrowth');
  if (amount === 0) return state;
  return livingEnemies(state).reduce(
    (current, { uid }) => debuffEnemy(current, uid, 'seed', amount),
    withLog(state, '森の侵蝕が広がる'),
  );
}
