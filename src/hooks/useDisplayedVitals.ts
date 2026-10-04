import { useEffect, useState } from 'react';
import type { ActorId, CombatEvent, Vitals } from '../domain/combat';
import { eventsDuration, useCombatEvents } from './useCombatEvents';

type VitalsEvent = Extract<CombatEvent, { kind: 'hit' | 'blockGain' | 'heal' }>;

const isVitalsEventFor = (target: ActorId) => (event: CombatEvent): event is VitalsEvent =>
  (event.kind === 'hit' || event.kind === 'blockGain' || event.kind === 'heal') &&
  event.target === target;

/** イベントが起きる直前の値。after から変化量を戻して求める。 */
function vitalsBefore(event: VitalsEvent): Vitals {
  switch (event.kind) {
    case 'hit':
      return event.before;
    case 'blockGain':
      return { hp: event.after.hp, block: event.after.block - event.amount };
    case 'heal':
      return { hp: event.after.hp - event.amount, block: event.after.block };
  }
}

/**
 * HP バーに出す HP とブロック。状態は操作の直後に最終値になっているが、
 * 表示は演出（イベントの時間差再生）に合わせて 1 発ずつ進め、再生し終わったら最終値に揃える。
 */
export function useDisplayedVitals(target: ActorId, events: CombatEvent[], latest: Vitals): Vitals {
  const [stepped, setStepped] = useState<{ events: CombatEvent[]; vitals: Vitals } | null>(null);
  const [settled, setSettled] = useState<CombatEvent[] | null>(null);
  const own = events.filter(isVitalsEventFor(target));

  useCombatEvents(events, (event) => {
    if (isVitalsEventFor(target)(event)) setStepped({ events, vitals: event.after });
  });

  useEffect(() => {
    const timer = setTimeout(() => setSettled(events), eventsDuration(events));
    return () => clearTimeout(timer);
  }, [events]);

  if (own.length === 0 || settled === events) return latest;
  if (stepped?.events === events) return stepped.vitals;
  return vitalsBefore(own[0]);
}
