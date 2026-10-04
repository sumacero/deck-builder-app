import type { ActConfig } from '../domain/act';
import type { CardDefinition } from '../domain/card';
import type { CombatSetup } from '../domain/combat';
import type { EnemyDefinition } from '../domain/enemy';
import type { GameMap, MapNode } from '../domain/map';
import type { CombatResult, RunSetup, RunState } from '../domain/run';
import { generateBlessingOptions } from './blessing';
import { MAP_NODE_LABEL } from './describe';
import { grantRandomRelic } from './loot';
import { generateMap } from './map';
import { nextRandom, pickOne, pickUnique, randomInt } from './random';
import { generateShopStock } from './shop';

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

export function createRun(setup: RunSetup, seed: number): RunState {
  const firstAct = setup.acts[0];
  const base: RunState = {
    phase: { kind: 'map' },
    acts: setup.acts,
    actIndex: 0,
    map: { floorCount: 0, columns: 0, nodes: [], bossId: '' },
    boss: firstAct.bossPool[0],
    currentNodeId: null,
    visitedNodeIds: [],
    agent: setup.agent,
    player: { hp: setup.playerMaxHp, maxHp: setup.playerMaxHp },
    gold: setup.economy.startingGold,
    deck: setup.deck,
    relics: setup.relics,
    potions: [...setup.potions],
    energyPerTurn: setup.energyPerTurn,
    drawPerTurn: setup.drawPerTurn,
    rewardPool: setup.rewardPool,
    potionPool: setup.potionPool,
    relicPool: setup.relicPool,
    blessingPool: setup.blessingPool,
    guide: setup.guide,
    economy: setup.economy,
    restHealRatio: setup.restHealRatio,
    removalCount: 0,
    rngSeed: seed,
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

function startCombat(run: RunState, nodeId: string, enemy: EnemyDefinition): RunState {
  const seedRoll = nextRandom(run.rngSeed);
  return {
    ...run,
    rngSeed: seedRoll.seed,
    phase: { kind: 'combat', nodeId, enemy, seed: Math.floor(seedRoll.value * 2 ** 31) },
  };
}

function startRandomCombat(run: RunState, nodeId: string, pool: EnemyDefinition[]): RunState {
  const picked = pickOne(pool, run.rngSeed);
  if (!picked.item) return run;
  return startCombat({ ...run, rngSeed: picked.seed }, nodeId, picked.item);
}

function openShop(run: RunState): RunState {
  const generated = generateShopStock(
    run.rewardPool,
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
      return startCombat(moved, nodeId, run.boss);
    case 'rest':
      return { ...moved, phase: { kind: 'rest' } };
    case 'shop':
      return openShop(moved);
    case 'event':
    case 'treasure':
      return moved;
  }
}

/** 勝てばゴールドとカード 3 択。エリート・ボスはレリックも。最後の章のボスならクリア。 */
export function finishCombat(run: RunState, result: CombatResult): RunState {
  if (run.phase.kind !== 'combat') return run;
  if (result.status === 'lost') {
    return { ...run, player: { ...run.player, hp: 0 }, phase: { kind: 'gameOver' } };
  }
  const { rank } = run.phase.enemy;
  const survived: RunState = {
    ...run,
    player: { ...run.player, hp: result.playerHp },
    potions: result.potions,
  };
  if (rank === 'boss' && isFinalAct(run)) return { ...survived, phase: { kind: 'cleared' } };

  const { min, max } = run.economy.encounterGold[rank];
  const gold = randomInt(min, max, survived.rngSeed);
  const withGold: RunState = { ...survived, gold: survived.gold + gold.value, rngSeed: gold.seed };
  const looted = rank === 'normal' ? { run: withGold, relic: null } : grantRandomRelic(withGold);
  const offered = pickUnique(looted.run.rewardPool, 3, looted.run.rngSeed);
  return {
    ...looted.run,
    rngSeed: offered.seed,
    phase: {
      kind: 'reward',
      choices: offered.items,
      gold: gold.value,
      relic: looted.relic,
      next: rank === 'boss' ? 'nextAct' : 'map',
    },
  };
}

/** card が null ならスキップ。ボスの報酬なら HP を全回復して次の章へ。 */
export function resolveReward(run: RunState, card: CardDefinition | null): RunState {
  if (run.phase.kind !== 'reward') return run;
  const picked: RunState = { ...run, deck: card ? [...run.deck, card] : run.deck };
  if (run.phase.next === 'map') return { ...picked, phase: { kind: 'map' } };
  return startAct(
    { ...picked, player: { ...picked.player, hp: picked.player.maxHp } },
    run.actIndex + 1,
  );
}

/** マップ画面の案内文。未実装マスでは「何も起きない」ことを明示する。 */
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
    case 'treasure':
      return `${MAP_NODE_LABEL[node.type]}（未実装）。次のマスを選ぼう。`;
  }
}

export function buildCombatSetup(run: RunState, enemy: EnemyDefinition): CombatSetup {
  return {
    agent: run.agent,
    deck: run.deck,
    enemy,
    playerHp: run.player.hp,
    playerMaxHp: run.player.maxHp,
    energyPerTurn: run.energyPerTurn,
    drawPerTurn: run.drawPerTurn,
    relics: run.relics,
    potions: run.potions,
  };
}
