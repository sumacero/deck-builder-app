import type { CombatState, EnemyUid } from '../domain/combat';
import { clearEvents, discardPotion, drinkPotion, endTurn, playCard } from './combat';

export type CombatAction =
  | { type: 'playCard'; instanceId: string; target?: EnemyUid }
  | { type: 'drinkPotion'; slot: number; target?: EnemyUid }
  | { type: 'discardPotion'; slot: number }
  | { type: 'endTurn' };

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  switch (action.type) {
    case 'playCard':
      return playCard(clearEvents(state), action.instanceId, action.target);
    case 'drinkPotion':
      return drinkPotion(clearEvents(state), action.slot, action.target);
    case 'discardPotion':
      return discardPotion(clearEvents(state), action.slot);
    case 'endTurn':
      return endTurn(clearEvents(state));
  }
}
