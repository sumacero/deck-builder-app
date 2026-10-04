import type { CombatState } from '../domain/combat';
import { clearEvents, drinkPotion, endTurn, playCard } from './combat';

export type CombatAction =
  | { type: 'playCard'; instanceId: string }
  | { type: 'drinkPotion'; slot: number }
  | { type: 'endTurn' };

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  switch (action.type) {
    case 'playCard':
      return playCard(clearEvents(state), action.instanceId);
    case 'drinkPotion':
      return drinkPotion(clearEvents(state), action.slot);
    case 'endTurn':
      return endTurn(clearEvents(state));
  }
}
