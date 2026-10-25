import { useEffect } from 'react';
import { soundForEvent } from '../audio/combatSounds';
import { playSound, prepareSounds } from '../audio/soundPlayer';
import type { CombatEvent } from '../domain/combat';
import { outcomeRevealMs, useCombatEvents } from './useCombatEvents';

/** 勝敗のファンファーレは、HP ゲージが 0 に着いてから。先に鳴らすと結果が分かってしまう。 */
function outcomeSound(events: readonly CombatEvent[]): 'victory' | 'defeat' | null {
  for (const event of events) {
    if (event.kind === 'won') return 'victory';
    if (event.kind === 'defeated' && event.target === 'player') return 'defeat';
  }
  return null;
}

/** 戦闘イベントに合わせて効果音を鳴らす。タイミングは画面の演出と揃えてある。 */
export function useCombatSounds(events: CombatEvent[]) {
  useEffect(() => {
    void prepareSounds();
  }, []);

  useCombatEvents(events, (event) => {
    const sound = soundForEvent(event);
    if (!sound || sound === 'victory' || sound === 'defeat') return;
    playSound(sound);
  });

  useEffect(() => {
    const sound = outcomeSound(events);
    if (!sound) return;
    const timer = setTimeout(() => playSound(sound), outcomeRevealMs(events));
    return () => clearTimeout(timer);
  }, [events]);
}
