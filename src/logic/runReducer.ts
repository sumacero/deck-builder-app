import type { CardDefinition } from '../domain/card';
import type { CombatResult, RunSetup, RunState } from '../domain/run';
import { chooseBlessing, finishDeckEdit } from './blessing';
import { rest, smith } from './rest';
import { createRun, finishCombat, moveTo, resolveReward } from './run';
import { buyCard, buyPotion, leaveShop, removeCard } from './shop';

export type RunAction =
  | { type: 'chooseBlessing'; blessingId: string }
  | { type: 'finishDeckEdit'; cardId: string | null }
  | { type: 'moveTo'; nodeId: string }
  | { type: 'finishCombat'; result: CombatResult }
  | { type: 'resolveReward'; card: CardDefinition | null }
  | { type: 'rest' }
  | { type: 'smith'; cardId: string }
  | { type: 'buyCard'; offerId: string }
  | { type: 'buyPotion'; offerId: string }
  | { type: 'removeCard'; cardId: string }
  | { type: 'leaveShop' }
  | { type: 'newRun'; setup: RunSetup; seed: number };

export function runReducer(run: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'chooseBlessing':
      return chooseBlessing(run, action.blessingId);
    case 'finishDeckEdit':
      return finishDeckEdit(run, action.cardId);
    case 'moveTo':
      return moveTo(run, action.nodeId);
    case 'finishCombat':
      return finishCombat(run, action.result);
    case 'resolveReward':
      return resolveReward(run, action.card);
    case 'rest':
      return rest(run);
    case 'smith':
      return smith(run, action.cardId);
    case 'buyCard':
      return buyCard(run, action.offerId);
    case 'buyPotion':
      return buyPotion(run, action.offerId);
    case 'removeCard':
      return removeCard(run, action.cardId);
    case 'leaveShop':
      return leaveShop(run);
    case 'newRun':
      return createRun(action.setup, action.seed);
  }
}
