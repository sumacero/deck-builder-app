import type { ActConfig } from '../domain/act';
import type { CardDefinition } from '../domain/card';
import type { CombatSetup } from '../domain/combat';
import type { Encounter } from '../domain/enemy';
import type { GameMap, MapNode } from '../domain/map';
import type { CombatResult, RunSetup, RunState } from '../domain/run';
import { generateBlessingOptions } from './blessing';
import { soloEncounter, startCombat, startRandomCombat } from './encounter';
import { startEvent } from './event';
import { generateMap } from './map';
import { draftPool, pickRewardChoices } from './archetype';
import { attuneDeck, isDraftable } from './attribute';
import { pickOne, pickUnique, randomInt } from './random';
import { grantRandomRelic, obtainRelic, unownedRelics } from './runEffects';
import { generateShopStock } from './shop';
import { EMPTY_RUN_STATS, mergeStats } from './stats';

export function currentAct(run: RunState): ActConfig {
  return run.acts[run.actIndex];
}

export const isFinalAct = (run: RunState) => run.actIndex >= run.acts.length - 1;

/** 章を始める: マップを作り、ボスを決め、案内役の 3 択を出す。 */
function startAct(run: RunState, actIndex: number): RunState {
  const act = run.acts[actIndex];
  const generated = generateMap(act.map, run.rngSeed);
  const boss = pickOne(act.bossPool, generated.seed);
  const entered: RunState = {
    ...run,
    actIndex,
    map: generated.map,
    boss: boss.item ?? act.bossPool[0],
    currentNodeId: null,
    visitedNodeIds: [],
    rngSeed: boss.seed,
  };
  const blessing = generateBlessingOptions(entered);
  return { ...entered, rngSeed: blessing.seed, phase: { kind: 'blessing', options: blessing.options } };
}

/** 章ごとに地域の候補から 1 つ選ぶ。前の章で選ばれた地域は避ける（候補が尽きたら重複を許す）。 */
export function pickActs(choices: ActConfig[][], seed: number): { acts: ActConfig[]; seed: number } {
  let current = seed;
  const acts: ActConfig[] = [];
  for (const options of choices) {
    const fresh = options.filter((option) => !acts.some((act) => act.region === option.region));
    const pool = fresh.length > 0 ? fresh : options;
    const picked = pickOne(pool, current);
    current = picked.seed;
    acts.push(picked.item ?? pool[0]);
  }
  return { acts, seed: current };
}

export function createRun(setup: RunSetup, seed: number): RunState {
  const { acts, seed: afterActs } = pickActs(setup.actChoices, seed);
  const firstAct = acts[0];
  const base: RunState = {
    phase: { kind: 'map' },
    acts,
    actIndex: 0,
    map: { floorCount: 0, columns: 0, nodes: [], bossId: '' },
    boss: firstAct.bossPool[0],
    finalBoss: setup.finalBoss,
    currentNodeId: null,
    visitedNodeIds: [],
    agent: setup.agent,
    player: { hp: setup.playerMaxHp, maxHp: setup.playerMaxHp },
    gold: setup.economy.startingGold,
    deck: attuneDeck(setup.deck, setup.agent.attribute),
    relics: setup.relics,
    potions: [...setup.potions],
    energyPerTurn: setup.energyPerTurn,
    drawPerTurn: setup.drawPerTurn,
    rewardPool: setup.rewardPool,
    potionPool: setup.potionPool,
    relicPool: setup.relicPool,
    bossRelicPool: setup.bossRelicPool,
    eventPool: setup.eventPool,
    seenEventIds: [],
    blessingPool: setup.blessingPool,
    guide: setup.guide,
    economy: setup.economy,
    restHealRatio: setup.restHealRatio,
    removalCount: 0,
    stats: EMPTY_RUN_STATS,
    rngSeed: afterActs,
  };
  return startAct(base, 0);
}

export function findNode(map: GameMap, id: string | null): MapNode | undefined {
  return id === null ? undefined : map.nodes.find((node) => node.id === id);
}

/** 今いるマスから進めるマス。スタート前は最下階の全マス。 */
export function reachableNodeIds(run: RunState): string[] {
  if (run.phase.kind !== 'map') return [];
  const current = findNode(run.map, run.currentNodeId);
  if (!current) return run.map.nodes.filter((node) => node.floor === 0).map((node) => node.id);
  return current.next;
}

/** 到達した階（1 始まり）。スタート前は 0。 */
export function reachedFloor(run: RunState): number {
  const current = findNode(run.map, run.currentNodeId);
  return current ? current.floor + 1 : 0;
}

function openShop(run: RunState): RunState {
  const generated = generateShopStock(
    draftPool(run),
    run.rewardPool.filter((card) => !isDraftable(card, run.agent)),
    unownedRelics(run, run.relicPool),
    run.potionPool,
    run.economy,
    run.removalCount,
    run.rngSeed,
  );
  return { ...run, rngSeed: generated.seed, phase: { kind: 'shop', stock: generated.stock } };
}

export function moveTo(run: RunState, nodeId: string): RunState {
  const node = findNode(run.map, nodeId);
  if (!node || !reachableNodeIds(run).includes(nodeId)) return run;

  const moved: RunState = {
    ...run,
    currentNodeId: nodeId,
    visitedNodeIds: [...run.visitedNodeIds, nodeId],
  };
  const act = currentAct(run);
  switch (node.type) {
    case 'enemy':
      return startRandomCombat(moved, nodeId, act.enemyPool);
    case 'elite':
      return startRandomCombat(moved, nodeId, act.elitePool);
    case 'boss':
      return startCombat(moved, nodeId, soloEncounter(run.boss));
    case 'rest':
      return { ...moved, phase: { kind: 'rest' } };
    case 'shop':
      return openShop(moved);
    case 'event':
      return startEvent(moved);
    case 'treasure':
      return { ...moved, phase: { kind: 'treasure', opened: false, relic: null, gold: 0 } };
  }
}

/**
 * 勝てばゴールドとカード 3 択。エリートはレリックも、ボスはそのあとボスレリックの 3 択。
 * ラスボスを倒したらクリア。
 */
export function finishCombat(run: RunState, result: CombatResult): RunState {
  if (run.phase.kind !== 'combat') return run;
  const stats = mergeStats(run.stats, result.stats, result.status === 'won');
  const { rank } = run.phase.encounter;
  if (result.status === 'lost') {
    return {
      ...run,
      stats,
      player: { ...run.player, hp: 0 },
      phase: { kind: 'gameOver', atFinale: rank === 'final' },
    };
  }
  const survived: RunState = {
    ...run,
    stats,
    player: { hp: result.playerHp, maxHp: result.playerMaxHp },
    potions: result.potions,
    deck: result.deck,
  };
  if (rank === 'final') return { ...survived, phase: { kind: 'cleared' } };

  const { min, max } = run.economy.encounterGold[rank];
  const gold = randomInt(min, max, survived.rngSeed);
  const withGold: RunState = { ...survived, gold: survived.gold + gold.value, rngSeed: gold.seed };
  const looted = rank === 'elite' ? grantRandomRelic(withGold) : { run: withGold, relic: null };
  const offered = pickRewardChoices(draftPool(looted.run), looted.run.deck, 3, looted.run.rngSeed);
  return {
    ...looted.run,
    rngSeed: offered.seed,
    phase: {
      kind: 'reward',
      choices: offered.items,
      gold: gold.value,
      relic: looted.relic,
      next: rank === 'boss' ? 'bossRelic' : 'map',
    },
  };
}

/** HP を全回復して次の章へ。最後の章のあとはラスボスとの決戦の前へ。 */
function advanceAct(run: RunState): RunState {
  const healed: RunState = { ...run, player: { ...run.player, hp: run.player.maxHp } };
  if (isFinalAct(run)) return { ...healed, phase: { kind: 'finale' } };
  return startAct(healed, run.actIndex + 1);
}

/** ラスボスと戦う。マップのマスではないので、階による倍率はかけない（強さはデータの時点で決まっている）。 */
export function startFinalBattle(run: RunState): RunState {
  if (run.phase.kind !== 'finale') return run;
  return startCombat(run, FINAL_BATTLE_NODE_ID, soloEncounter(run.finalBoss), 1);
}

export const FINAL_BATTLE_NODE_ID = 'final';

const BOSS_RELIC_CHOICES = 3;

/** card が null ならスキップ。ボスの報酬ならボスレリックの 3 択へ（候補が無ければ次の章へ）。 */
export function resolveReward(run: RunState, card: CardDefinition | null): RunState {
  if (run.phase.kind !== 'reward') return run;
  const picked: RunState = { ...run, deck: card ? [...run.deck, card] : run.deck };
  if (run.phase.next === 'map') return { ...picked, phase: { kind: 'map' } };
  const offered = pickUnique(
    unownedRelics(picked, picked.bossRelicPool),
    BOSS_RELIC_CHOICES,
    picked.rngSeed,
  );
  if (offered.items.length === 0) return advanceAct({ ...picked, rngSeed: offered.seed });
  return { ...picked, rngSeed: offered.seed, phase: { kind: 'bossRelic', choices: offered.items } };
}

/** ボスレリックを 1 つ選んで（null なら取らずに）次の章へ。 */
export function chooseBossRelic(run: RunState, relicId: string | null): RunState {
  if (run.phase.kind !== 'bossRelic') return run;
  const relic = run.phase.choices.find((r) => r.id === relicId);
  return advanceAct(relic ? obtainRelic(run, relic) : run);
}

/** マップ画面の案内文。 */
export function mapHint(run: RunState): string {
  const node = findNode(run.map, run.currentNodeId);
  if (!node) return '光っているマスを選んで出発しよう。';
  switch (node.type) {
    case 'enemy':
      return '戦闘に勝利した。次のマスを選ぼう。';
    case 'elite':
      return '強敵を退けた。次のマスを選ぼう。';
    case 'boss':
      return '章のボスを倒した。';
    case 'rest':
      return '焚き火を後にした。次のマスを選ぼう。';
    case 'shop':
      return 'ショップを後にした。次のマスを選ぼう。';
    case 'event':
      return '不思議な出来事を後にした。次のマスを選ぼう。';
    case 'treasure':
      return '宝箱を開けた。次のマスを選ぼう。';
  }
}

export function buildCombatSetup(run: RunState, encounter: Encounter): CombatSetup {
  return {
    agent: run.agent,
    deck: run.deck,
    enemies: encounter.enemies,
    rank: encounter.rank,
    playerHp: run.player.hp,
    playerMaxHp: run.player.maxHp,
    energyPerTurn: run.energyPerTurn,
    drawPerTurn: run.drawPerTurn,
    relics: run.relics,
    potions: run.potions,
  };
}

/** ポーションを使わずに捨てる（戦闘の外。いつでもできる）。 */
export function discardPotion(run: RunState, slot: number): RunState {
  if (!run.potions[slot]) return run;
  return { ...run, potions: run.potions.map((p, i) => (i === slot ? null : p)) };
}
