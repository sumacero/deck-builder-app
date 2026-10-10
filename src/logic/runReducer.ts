import type { CardDefinition, CardMark } from '../domain/card';
import type { CombatResult, RunSetup, RunState } from '../domain/run';
import { chooseBlessing, finishDeckEdit } from './blessing';
import { chooseEventOption, leaveEvent } from './event';
import { rest, smith } from './rest';
import {
  chooseBossRelic,
  createRun,
  discardPotion,
  finishCombat,
  moveTo,
  resolveReward,
  startFinalBattle,
} from './run';
import { buyCard, buyPotion, buyRelic, leaveShop, remarkCard, removeCard } from './shop';
import { leaveTreasure, openTreasure } from './treasure';

export type RunAction =
  | { type: 'chooseBlessing'; blessingId: string }
  | { type: 'finishDeckEdit'; card: CardDefinition | null }
  | { type: 'moveTo'; nodeId: string }
  | { type: 'finishCombat'; result: CombatResult }
  | { type: 'resolveReward'; card: CardDefinition | null }
  | { type: 'chooseBossRelic'; relicId: string | null }
  | { type: 'startFinalBattle' }
  | { type: 'rest' }
  | { type: 'smith'; card: CardDefinition }
  | { type: 'buyCard'; offerId: string }
  | { type: 'buyRelic'; offerId: string }
  | { type: 'buyPotion'; offerId: string }
  | { type: 'removeCard'; card: CardDefinition }
  | { type: 'remarkCard'; card: CardDefinition; mark: CardMark }
  | { type: 'leaveShop' }
  | { type: 'chooseEventOption'; optionId: string }
  | { type: 'leaveEvent' }
  | { type: 'openTreasure' }
  | { type: 'leaveTreasure' }
  | { type: 'discardPotion'; slot: number }
  | { type: 'newRun'; setup: RunSetup; seed: number };

export function runReducer(run: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'chooseBlessing':
      return chooseBlessing(run, action.blessingId);
    case 'finishDeckEdit':
      return finishDeckEdit(run, action.card);
    case 'moveTo':
      return moveTo(run, action.nodeId);
    case 'finishCombat':
      return finishCombat(run, action.result);
    case 'resolveReward':
      return resolveReward(run, action.card);
    case 'chooseBossRelic':
      return chooseBossRelic(run, action.relicId);
    case 'startFinalBattle':
      return startFinalBattle(run);
    case 'rest':
      return rest(run);
    case 'smith':
      return smith(run, action.card);
    case 'buyCard':
      return buyCard(run, action.offerId);
    case 'buyRelic':
      return buyRelic(run, action.offerId);
    case 'buyPotion':
      return buyPotion(run, action.offerId);
    case 'removeCard':
      return removeCard(run, action.card);
    case 'remarkCard':
      return remarkCard(run, action.card, action.mark);
    case 'leaveShop':
      return leaveShop(run);
    case 'chooseEventOption':
      return chooseEventOption(run, action.optionId);
    case 'leaveEvent':
      return leaveEvent(run);
    case 'openTreasure':
      return openTreasure(run);
    case 'leaveTreasure':
      return leaveTreasure(run);
    case 'discardPotion':
      return discardPotion(run, action.slot);
    case 'newRun':
      return createRun(action.setup, action.seed);
  }
}
