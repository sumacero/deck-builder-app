import type { CardDefinition } from '../domain/card';
import type { RunState } from '../domain/run';
import type { QueuedRunEvent, RunEvent, UpgradedCard } from '../domain/runEvent';
import { canUpgrade, upgradeCard } from './cards';
import { type RunAction, runReducer } from './runReducer';

function countById(deck: readonly CardDefinition[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const card of deck) counts.set(card.id, (counts.get(card.id) ?? 0) + 1);
  return counts;
}

/** 強化前のカードが減り、その強化後のカードが同じ数だけ増えていたら「強化された」とみなす。 */
export function findUpgrades(
  before: readonly CardDefinition[],
  after: readonly CardDefinition[],
): UpgradedCard[] {
  const prevCounts = countById(before);
  const nextCounts = countById(after);
  const upgrades: UpgradedCard[] = [];
  for (const [id, nextCount] of nextCounts) {
    const gained = nextCount - (prevCounts.get(id) ?? 0);
    if (gained <= 0) continue;
    const base = before.find((card) => canUpgrade(card) && upgradeCard(card).id === id);
    const upgraded = after.find((card) => card.id === id);
    if (!base || !upgraded) continue;
    const lost = (prevCounts.get(base.id) ?? 0) - (nextCounts.get(base.id) ?? 0);
    for (let i = 0; i < Math.min(gained, lost); i++) upgrades.push({ before: base, after: upgraded });
  }
  return upgrades;
}

/** before にあって after に無いカード。強化で消えた元の札は除く。 */
export function findRemovedCards(
  before: readonly CardDefinition[],
  after: readonly CardDefinition[],
  upgraded: readonly UpgradedCard[],
): CardDefinition[] {
  const nextCounts = countById(after);
  const upgradedBases = countById(upgraded.map((pair) => pair.before));
  const removed: CardDefinition[] = [];
  for (const card of before) {
    const stillThere = nextCounts.get(card.id) ?? 0;
    if (stillThere > 0) {
      nextCounts.set(card.id, stillThere - 1);
      continue;
    }
    const becameUpgrade = upgradedBases.get(card.id) ?? 0;
    if (becameUpgrade > 0) {
      upgradedBases.set(card.id, becameUpgrade - 1);
      continue;
    }
    removed.push(card);
  }
  return removed;
}

/**
 * 減った札と増えた札を交換にまとめる。
 * 増えた札が 1 枚なら、減った札は全部その 1 枚への交換（祭壇の 2 枚 → 1 枚）。
 * 枚数が揃うときは 1 対 1。減っただけで増えていない削除は交換にしない。
 */
export function cardFlowEvents(
  before: readonly CardDefinition[],
  after: readonly CardDefinition[],
): RunEvent[] {
  const upgraded = findUpgrades(before, after);
  const removed = findRemovedCards(before, after, upgraded);
  const gained = findGainedCards(before, after, upgraded);
  const events: RunEvent[] = [];
  if (removed.length > 0 && gained.length > 0) {
    if (gained.length === 1) {
      const gainedCard = gained[0];
      if (gainedCard) events.push({ kind: 'exchange', lost: removed, gained: gainedCard });
    } else {
      const count = Math.min(removed.length, gained.length);
      for (let index = 0; index < count; index++) {
        const lost = removed[index];
        const next = gained[index];
        if (lost && next) events.push({ kind: 'exchange', lost: [lost], gained: next });
      }
      for (const card of gained.slice(count)) events.push({ kind: 'cardGain', card });
    }
  } else {
    for (const card of gained) events.push({ kind: 'cardGain', card });
  }
  return events;
}

/** after にあって before に無いカード（同じカードは枚数で比べる）。強化で増えたカードは除く。 */
export function findGainedCards(
  before: readonly CardDefinition[],
  after: readonly CardDefinition[],
  upgraded: readonly UpgradedCard[],
): CardDefinition[] {
  const remaining = countById(before);
  for (const { after: card } of upgraded) remaining.set(card.id, (remaining.get(card.id) ?? 0) + 1);
  const gained: CardDefinition[] = [];
  for (const card of after) {
    const left = remaining.get(card.id) ?? 0;
    if (left > 0) remaining.set(card.id, left - 1);
    else gained.push(card);
  }
  return gained;
}

/**
 * 操作の前後を比べて、知らせたい出来事を並べる。入手（レリック・ポーション・カード）を先に、
 * そのあと回復・強化。
 * 戦闘の決着で変わった HP・レリックは戦闘画面と報酬画面が見せるので、ここでは出さない。
 * 新しいランを始めたときも出さない。
 */
export function diffRunEvents(prev: RunState, next: RunState): RunEvent[] {
  if (prev === next) return [];
  if (prev.phase.kind === 'gameOver' || prev.phase.kind === 'cleared') return [];
  const fromCombat = prev.phase.kind === 'combat';
  const events: RunEvent[] = [];

  if (!fromCombat) {
    const owned = new Set(prev.relics.map((relic) => relic.id));
    for (const relic of next.relics) {
      if (!owned.has(relic.id)) events.push({ kind: 'relicGain', relic });
    }
    next.potions.forEach((potion, slot) => {
      if (potion && prev.potions[slot] !== potion) events.push({ kind: 'potionGain', slot, potion });
    });
  }
  const upgraded = findUpgrades(prev.deck, next.deck);
  events.push(...cardFlowEvents(prev.deck, next.deck));
  if (!fromCombat && next.player.hp > prev.player.hp) {
    events.push({
      kind: 'heal',
      hpBefore: prev.player.hp,
      hpAfter: next.player.hp,
      maxHpBefore: prev.player.maxHp,
      maxHpAfter: next.player.maxHp,
    });
  }
  if (upgraded.length > 0) events.push({ kind: 'upgrade', cards: upgraded });
  return events;
}

/** ラン本体と、まだ見せていない出来事の順番待ち。 */
export type RunStore = {
  run: RunState;
  events: QueuedRunEvent[];
  nextEventId: number;
  /**
   * 演出が終わるまで画面に出しているラン。null なら run を出す。
   * 回復・強化・入手と、次の画面とその BGM が同時に来ると見づらいので、
   * 画面が変わる操作では順番待ちが空になるまで前の画面を保つ。
   */
  shown: RunState | null;
};

export type RunStoreAction = RunAction | { type: 'dismissEvent'; id: number };

export function createRunStore(run: RunState): RunStore {
  return { run, events: [], nextEventId: 0, shown: null };
}

/**
 * 暗転と BGM が付く画面の単位。同じ種類の画面のまま（ショップで買う、イベントの結末を読む）なら
 * 演出はそこへ着地させる。章が変わるとフィールド曲も変わるので、章も分ける。
 */
function screenKey(run: RunState): string {
  return `${run.actIndex}:${run.phase.kind}`;
}

/**
 * 出来事が残っていて、いま見えている画面と次の画面が違うときだけ前の画面を保つ。
 * 出来事が無い移動はすぐ切り替える。
 */
function screenWhileEvents(
  previous: RunState,
  next: RunState,
  held: RunState | null,
  events: readonly QueuedRunEvent[],
): RunState | null {
  if (events.length === 0) return null;
  const visible = held ?? previous;
  if (screenKey(visible) !== screenKey(next)) return visible;
  return held;
}

/** ランの操作をかけ、起きた出来事を順番待ちに足す。演出が終わったら dismissEvent で取り除く。 */
export function runStoreReducer(store: RunStore, action: RunStoreAction): RunStore {
  if (action.type === 'dismissEvent') {
    const events = store.events.filter((queued) => queued.id !== action.id);
    return { ...store, events, shown: events.length === 0 ? null : store.shown };
  }
  const run = runReducer(store.run, action);
  if (run === store.run) return store;
  const added = diffRunEvents(store.run, run).map((event, i) => ({
    id: store.nextEventId + i,
    event,
  }));
  const events = [...store.events, ...added];
  return {
    run,
    events,
    nextEventId: store.nextEventId + added.length,
    shown: screenWhileEvents(store.run, run, store.shown, events),
  };
}
