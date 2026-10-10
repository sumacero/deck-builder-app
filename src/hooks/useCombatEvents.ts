import { useEffect, useEffectEvent } from 'react';
import type { CombatEvent } from '../domain/combat';
import { MOTION } from '../theme';

/** そのイベントのあと、次のイベントまで空ける時間。秘奥義はカットインを見せる分だけ長い。 */
const gapAfter = (event: CombatEvent) => {
  if (event.kind === 'mysticArte') return MOTION.eventStagger + MOTION.arteCutIn;
  // 手札の波紋はカードが消える瞬間に出す。打撃の演出を遅らせない。
  if (event.kind === 'marksFused') return 0;
  return MOTION.eventStagger;
};

/** 各イベントを再生し始める時刻（最初のイベントが 0）。 */
function eventStartTimes(events: CombatEvent[]): number[] {
  let time = 0;
  return events.map((event) => {
    const start = time;
    time += gapAfter(event);
    return start;
  });
}

/** イベントが全て再生し終わるまでの時間。 */
export const eventsDuration = (events: CombatEvent[]) =>
  events.reduce((total, event) => total + gapAfter(event), 0);

/** 新しいイベントの配列が来るたびに、1 件ずつ時間差で handler を呼ぶ。 */
export function useCombatEvents(events: CombatEvent[], handler: (event: CombatEvent) => void) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    const starts = eventStartTimes(events);
    const timers = events.map((event, index) => setTimeout(() => onEvent(event), starts[index]));
    return () => timers.forEach(clearTimeout);
  }, [events]);
}
