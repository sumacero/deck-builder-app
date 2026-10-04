import { useCallback, useMemo, useReducer } from 'react';
import type { CardDefinition } from '../domain/card';
import type { CombatResult, RunSetup } from '../domain/run';
import { createRun } from '../logic/run';
import { createRunStore, runStoreReducer } from '../logic/runEvents';

const createSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * ラン全体（マップ・現在地・HP・所持品・今の画面）を管理する。
 * 回復・強化などの出来事は events に順番に積まれ、演出が終わったら dismissEvent で消す。
 */
export function useRun(setup: RunSetup) {
  const [{ run, events }, dispatch] = useReducer(runStoreReducer, setup, (s) =>
    createRunStore(createRun(s, createSeed())),
  );

  const dismissEvent = useCallback((id: number) => dispatch({ type: 'dismissEvent', id }), []);
  const moveTo = useCallback((nodeId: string) => dispatch({ type: 'moveTo', nodeId }), []);
  const finishCombat = useCallback(
    (result: CombatResult) => dispatch({ type: 'finishCombat', result }),
    [],
  );
  const resolveReward = useCallback(
    (card: CardDefinition | null) => dispatch({ type: 'resolveReward', card }),
    [],
  );
  const chooseBossRelic = useCallback(
    (relicId: string | null) => dispatch({ type: 'chooseBossRelic', relicId }),
    [],
  );
  const newRun = useCallback(
    () => dispatch({ type: 'newRun', setup, seed: createSeed() }),
    [setup],
  );

  const blessingActions = useMemo(
    () => ({
      choose: (blessingId: string) => dispatch({ type: 'chooseBlessing', blessingId }),
      finishDeckEdit: (cardId: string | null) => dispatch({ type: 'finishDeckEdit', cardId }),
    }),
    [],
  );

  const restActions = useMemo(
    () => ({
      rest: () => dispatch({ type: 'rest' }),
      smith: (cardId: string) => dispatch({ type: 'smith', cardId }),
    }),
    [],
  );

  const shopActions = useMemo(
    () => ({
      buyCard: (offerId: string) => dispatch({ type: 'buyCard', offerId }),
      buyRelic: (offerId: string) => dispatch({ type: 'buyRelic', offerId }),
      buyPotion: (offerId: string) => dispatch({ type: 'buyPotion', offerId }),
      removeCard: (cardId: string) => dispatch({ type: 'removeCard', cardId }),
      leave: () => dispatch({ type: 'leaveShop' }),
    }),
    [],
  );

  const eventActions = useMemo(
    () => ({
      choose: (optionId: string) => dispatch({ type: 'chooseEventOption', optionId }),
      leave: () => dispatch({ type: 'leaveEvent' }),
    }),
    [],
  );

  const treasureActions = useMemo(
    () => ({
      open: () => dispatch({ type: 'openTreasure' }),
      leave: () => dispatch({ type: 'leaveTreasure' }),
    }),
    [],
  );

  return {
    run,
    /** 次に見せる出来事（無ければ undefined）。 */
    currentEvent: events[0],
    dismissEvent,
    moveTo,
    finishCombat,
    resolveReward,
    chooseBossRelic,
    newRun,
    blessingActions,
    restActions,
    shopActions,
    eventActions,
    treasureActions,
  };
}

export type BlessingActions = ReturnType<typeof useRun>['blessingActions'];
export type RestActions = ReturnType<typeof useRun>['restActions'];
export type ShopActions = ReturnType<typeof useRun>['shopActions'];
export type EventActions = ReturnType<typeof useRun>['eventActions'];
export type TreasureActions = ReturnType<typeof useRun>['treasureActions'];
