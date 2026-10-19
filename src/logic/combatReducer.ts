import type { CombatState, EnemyUid } from '../domain/combat';
import {
  clearEvents,
  discardPotion,
  drinkPotion,
  endTurn,
  fuseInHand,
  playCard,
  resolveFuseAim,
} from './combat';

export type CombatAction =
  | { type: 'playCard'; instanceId: string; target?: EnemyUid }
  | { type: 'stackCards'; sourceId: string; targetId: string }
  | { type: 'resolveFuseAim'; uid: EnemyUid }
  | { type: 'drinkPotion'; slot: number; target?: EnemyUid }
  | { type: 'discardPotion'; slot: number }
  | { type: 'endTurn' };

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  switch (action.type) {
    case 'playCard':
      return playCard(clearEvents(state), action.instanceId, action.target);
    case 'stackCards': {
      const cleared = clearEvents(state);
      const next = fuseInHand(cleared, action.sourceId, action.targetId);
      return next === cleared ? state : next;
    }
    case 'resolveFuseAim': {
      const cleared = clearEvents(state);
      const next = resolveFuseAim(cleared, action.uid);
      return next === cleared ? state : next;
    }
    case 'drinkPotion':
      return drinkPotion(clearEvents(state), action.slot, action.target);
    case 'discardPotion':
      return discardPotion(clearEvents(state), action.slot);
    case 'endTurn':
      return endTurn(clearEvents(state));
  }
}
