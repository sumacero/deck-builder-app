import { useCallback, useReducer } from 'react';
import type { CombatSetup } from '../domain/combat';
import { canDrinkPotion, canPlayCard, createCombat } from '../logic/combat';
import { combatReducer } from '../logic/combatReducer';

/** 戦闘 1 回分の状態。シードはランから受け取るので、同じランなら同じ展開になる。 */
export function useCombat(setup: CombatSetup, seed: number) {
  const [state, dispatch] = useReducer(combatReducer, undefined, () => createCombat(setup, seed));

  const playCard = useCallback(
    (instanceId: string) => dispatch({ type: 'playCard', instanceId }),
    [],
  );
  const drinkPotion = useCallback((slot: number) => dispatch({ type: 'drinkPotion', slot }), []);
  const endTurn = useCallback(() => dispatch({ type: 'endTurn' }), []);
  const isPlayable = useCallback((instanceId: string) => canPlayCard(state, instanceId), [state]);
  const isDrinkable = useCallback((slot: number) => canDrinkPotion(state, slot), [state]);

  return { state, playCard, drinkPotion, endTurn, isPlayable, isDrinkable };
}
