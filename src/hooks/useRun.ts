import { useCallback, useMemo, useReducer } from 'react';
import type { CardDefinition } from '../domain/card';
import type { CombatResult, RunSetup } from '../domain/run';
import { createRun } from '../logic/run';
import { runReducer } from '../logic/runReducer';

const createSeed = () => Math.floor(Math.random() * 2 ** 31);

/** ラン全体（マップ・現在地・HP・所持品・今の画面）を管理する。 */
export function useRun(setup: RunSetup) {
  const [run, dispatch] = useReducer(runReducer, setup, (s) => createRun(s, createSeed()));

  const moveTo = useCallback((nodeId: string) => dispatch({ type: 'moveTo', nodeId }), []);
  const finishCombat = useCallback(
    (result: CombatResult) => dispatch({ type: 'finishCombat', result }),
    [],
  );
  const resolveReward = useCallback(
    (card: CardDefinition | null) => dispatch({ type: 'resolveReward', card }),
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
      buyPotion: (offerId: string) => dispatch({ type: 'buyPotion', offerId }),
      removeCard: (cardId: string) => dispatch({ type: 'removeCard', cardId }),
      leave: () => dispatch({ type: 'leaveShop' }),
    }),
    [],
  );

  return {
    run,
    moveTo,
    finishCombat,
    resolveReward,
    newRun,
    blessingActions,
    restActions,
    shopActions,
  };
}

export type BlessingActions = ReturnType<typeof useRun>['blessingActions'];
export type RestActions = ReturnType<typeof useRun>['restActions'];
export type ShopActions = ReturnType<typeof useRun>['shopActions'];
