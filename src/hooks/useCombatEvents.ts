import { useEffect, useEffectEvent, useState } from 'react';
import type { CombatEvent } from '../domain/combat';
import { enemyActionDuration } from '../components/combat/motion/motionPresets';
import { MOTION } from '../theme';

/** そのイベントのあと、次のイベントまで空ける時間。秘奥義はカットインを見せる分だけ長い。 */
const gapAfter = (event: CombatEvent) => {
  if (event.kind === 'mysticArte') return MOTION.eventStagger + MOTION.arteCutIn;
  // 手札の波紋と、山札・捨て札への移動はカードの上に重ねる。打撃の演出を遅らせない。
  // 敵ターンの区切りは印だけで、再生の間隔は空けない。
  if (
    event.kind === 'marksFused' ||
    event.kind === 'pileTravel' ||
    event.kind === 'enemyTurnStart' ||
    event.kind === 'enemyTurnEnd'
  ) {
    return 0;
  }
  return MOTION.eventStagger;
};

/** 各イベントを再生し始める時刻（最初のイベントが 0）。 */
function eventStartTimes(events: readonly CombatEvent[]): number[] {
  let time = 0;
  return events.map((event) => {
    const start = time;
    time += gapAfter(event);
    return start;
  });
}

/** イベントが全て再生し終わるまでの時間。 */
export const eventsDuration = (events: readonly CombatEvent[]) =>
  events.reduce((total, event) => total + gapAfter(event), 0);

/** この出来事の絵が、再生し始めてから消えるまで。 */
function performanceMs(event: CombatEvent): number {
  switch (event.kind) {
    case 'enemyAct':
      return enemyActionDuration(event.action);
    case 'hit':
    case 'blockGain':
    case 'heal':
    case 'callout':
      return MOTION.floatingText;
    case 'defeated':
      return MOTION.defeat;
    default:
      return 0;
  }
}

/**
 * 敵のターンの演出が終わるまで、手札を触れなくする時間。
 * 敵のターンを含まない操作（カードを使う、重ねる）は 0。
 * 倒れた敵のフェードは、バッチ全体の時間差のあとに始まるので、そこまで待つ。
 */
export function enemyTurnLockMs(events: readonly CombatEvent[]): number {
  const startAt = events.findIndex((event) => event.kind === 'enemyTurnStart');
  if (startAt < 0) return 0;
  const endAt = events.findIndex((event, index) => index > startAt && event.kind === 'enemyTurnEnd');
  const last = endAt < 0 ? events.length - 1 : endAt;
  const starts = eventStartTimes(events);
  let end = 0;
  for (let index = startAt; index <= last; index++) {
    end = Math.max(end, starts[index] + performanceMs(events[index]));
  }
  const slice = events.slice(startAt, last + 1);
  if (slice.some((event) => event.kind === 'defeated')) {
    end = Math.max(end, eventsDuration(events) + MOTION.defeat);
  }
  return end;
}

/** 敵のターンの演出が終わるまで true。カードを使う操作のあいだは false。 */
export function useEnemyTurnBusy(events: CombatEvent[]): boolean {
  const [released, setReleased] = useState<CombatEvent[] | null>(null);
  const lockMs = enemyTurnLockMs(events);
  useEffect(() => {
    if (lockMs <= 0) return;
    const timer = setTimeout(() => setReleased(events), lockMs);
    return () => clearTimeout(timer);
  }, [events, lockMs]);
  return lockMs > 0 && released !== events;
}

/** 新しいイベントの配列が来るたびに、1 件ずつ時間差で handler を呼ぶ。 */
export function useCombatEvents(events: CombatEvent[], handler: (event: CombatEvent) => void) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    const starts = eventStartTimes(events);
    const timers = events.map((event, index) => setTimeout(() => onEvent(event), starts[index]));
    return () => timers.forEach(clearTimeout);
  }, [events]);
}
