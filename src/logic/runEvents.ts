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

/**
 * 操作の前後を比べて、知らせたい出来事を並べる。効果音だけのもの（ゴールド・カード入手）を先に置き、
 * 画面を覆う演出（回復・強化）はそのあとに続ける。
 * 戦闘の決着で変わった HP・ゴールドは戦闘画面と報酬画面が見せるので、ここでは出さない。
 * 新しいランを始めたときも出さない。
 */
export function diffRunEvents(prev: RunState, next: RunState): RunEvent[] {
  if (prev === next) return [];
  if (prev.phase.kind === 'gameOver' || prev.phase.kind === 'cleared') return [];
  const fromCombat = prev.phase.kind === 'combat';
  const events: RunEvent[] = [];

  if (!fromCombat && next.gold !== prev.gold) {
    events.push({ kind: 'goldChange', amount: next.gold - prev.gold });
  }
  const gained = next.deck.length - prev.deck.length;
  if (gained > 0) events.push({ kind: 'cardGain', count: gained });
  if (!fromCombat && next.player.hp > prev.player.hp) {
    events.push({
      kind: 'heal',
      hpBefore: prev.player.hp,
      hpAfter: next.player.hp,
      maxHpBefore: prev.player.maxHp,
      maxHpAfter: next.player.maxHp,
    });
  }
  const upgraded = findUpgrades(prev.deck, next.deck);
  if (upgraded.length > 0) events.push({ kind: 'upgrade', cards: upgraded });
  return events;
}

/** ラン本体と、まだ見せていない出来事の順番待ち。 */
export type RunStore = { run: RunState; events: QueuedRunEvent[]; nextEventId: number };

export type RunStoreAction = RunAction | { type: 'dismissEvent'; id: number };

export function createRunStore(run: RunState): RunStore {
  return { run, events: [], nextEventId: 0 };
}

/** ランの操作をかけ、起きた出来事を順番待ちに足す。演出が終わったら dismissEvent で取り除く。 */
export function runStoreReducer(store: RunStore, action: RunStoreAction): RunStore {
  if (action.type === 'dismissEvent') {
    return { ...store, events: store.events.filter((queued) => queued.id !== action.id) };
  }
  const run = runReducer(store.run, action);
  if (run === store.run) return store;
  const added = diffRunEvents(store.run, run).map((event, i) => ({
    id: store.nextEventId + i,
    event,
  }));
  return {
    run,
    events: [...store.events, ...added],
    nextEventId: store.nextEventId + added.length,
  };
}
