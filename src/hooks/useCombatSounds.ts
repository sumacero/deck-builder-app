import { useEffect } from 'react';
import { soundForEvent } from '../audio/combatSounds';
import { playSound, prepareSounds } from '../audio/soundPlayer';
import type { CombatEvent } from '../domain/combat';
import { useCombatEvents } from './useCombatEvents';

/** 戦闘イベントに合わせて効果音を鳴らす。タイミングは画面の演出と揃えてある。 */
export function useCombatSounds(events: CombatEvent[]) {
  useEffect(() => {
    void prepareSounds();
  }, []);

  useCombatEvents(events, (event) => {
    const sound = soundForEvent(event);
    if (sound) playSound(sound);
  });
}
