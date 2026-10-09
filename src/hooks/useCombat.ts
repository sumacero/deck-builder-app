import { useCallback, useReducer } from 'react';
import type { CombatSetup, EnemyUid } from '../domain/combat';
import {
  canDrinkPotion,
  canPlayCard,
  createCombat,
  needsTargetChoice,
  previewCardDamage,
} from '../logic/combat';
import { combatReducer } from '../logic/combatReducer';

/** 戦闘 1 回分の状態。シードはランから受け取るので、同じランなら同じ展開になる。 */
export function useCombat(setup: CombatSetup, seed: number) {
  const [state, dispatch] = useReducer(combatReducer, undefined, () => createCombat(setup, seed));

  const playCard = useCallback(
    (instanceId: string, target?: EnemyUid) => dispatch({ type: 'playCard', instanceId, target }),
    [],
  );
  const drinkPotion = useCallback(
    (slot: number, target?: EnemyUid) => dispatch({ type: 'drinkPotion', slot, target }),
    [],
  );
  const discardPotion = useCallback(
    (slot: number) => dispatch({ type: 'discardPotion', slot }),
    [],
  );
  const endTurn = useCallback(() => dispatch({ type: 'endTurn' }), []);
  const togglePin = useCallback(
    (instanceId: string) => dispatch({ type: 'togglePin', instanceId }),
    [],
  );
  const isPlayable = useCallback((instanceId: string) => canPlayCard(state, instanceId), [state]);
  const isDrinkable = useCallback((slot: number) => canDrinkPotion(state, slot), [state]);
  /** ポーションを使う前に、敵を 1 体選ぶ必要があるか。 */
  const potionNeedsTarget = useCallback(
    (slot: number) => {
      const potion = state.potions[slot];
      return potion ? needsTargetChoice(state, potion.target) : false;
    },
    [state],
  );
  const previewDamage = useCallback(
    (instanceId: string, target?: EnemyUid) => previewCardDamage(state, instanceId, target),
    [state],
  );

  return {
    state,
    playCard,
    drinkPotion,
    discardPotion,
    endTurn,
    togglePin,
    isPlayable,
    isDrinkable,
    potionNeedsTarget,
    previewDamage,
  };
}
