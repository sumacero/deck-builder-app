import { useEffect, useEffectEvent } from 'react';
import type { CombatEvent } from '../domain/combat';
import { MOTION } from '../theme';

/** イベントが全て再生し終わるまでの時間。 */
export const eventsDuration = (events: CombatEvent[]) => events.length * MOTION.eventStagger;

/** 新しいイベントの配列が来るたびに、1 件ずつ時間差で handler を呼ぶ。 */
export function useCombatEvents(events: CombatEvent[], handler: (event: CombatEvent) => void) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    const timers = events.map((event, index) =>
      setTimeout(() => onEvent(event), index * MOTION.eventStagger),
    );
    return () => timers.forEach(clearTimeout);
  }, [events]);
}
