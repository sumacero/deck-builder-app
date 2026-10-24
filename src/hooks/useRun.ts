import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { CardDefinition, CardMark } from '../domain/card';
import type { CombatResult, RunSetup, RunState } from '../domain/run';
import { createRun } from '../logic/run';
import { createRunStore, runStoreReducer } from '../logic/runEvents';
import { saveRun } from '../services/runStorage';

const createSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * ラン全体（マップ・現在地・HP・所持品・今の画面）を管理する。
 * 回復・強化などの出来事は events に順番に積まれ、演出が終わったら dismissEvent で消す。
 * その出来事が画面の切り替わりと重なるときは、shown に前の画面を残す。
 */
export function useRun(setup: RunSetup, initial?: RunState) {
  const [{ run, events, shown }, dispatch] = useReducer(
    runStoreReducer,
    { setup, initial },
    ({ setup: nextSetup, initial: saved }) => createRunStore(saved ?? createRun(nextSetup, createSeed())),
  );

  // アプリを閉じても続きから入れるよう、画面が変わるたびに端末へ書く。
  useEffect(() => {
    saveRun(run);
  }, [run]);

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
  const startFinalBattle = useCallback(() => dispatch({ type: 'startFinalBattle' }), []);
  const discardPotion = useCallback(
    (slot: number) => dispatch({ type: 'discardPotion', slot }),
    [],
  );
  const newRun = useCallback(
    () => dispatch({ type: 'newRun', setup, seed: createSeed() }),
    [setup],
  );

  const blessingActions = useMemo(
    () => ({
      choose: (blessingId: string) => dispatch({ type: 'chooseBlessing', blessingId }),
      finishDeckEdit: (card: CardDefinition | null) => dispatch({ type: 'finishDeckEdit', card }),
    }),
    [],
  );

  const restActions = useMemo(
    () => ({
      rest: () => dispatch({ type: 'rest' }),
      smith: (card: CardDefinition) => dispatch({ type: 'smith', card }),
    }),
    [],
  );

  const shopActions = useMemo(
    () => ({
      buyCard: (offerId: string) => dispatch({ type: 'buyCard', offerId }),
      buyRelic: (offerId: string) => dispatch({ type: 'buyRelic', offerId }),
      buyPotion: (offerId: string) => dispatch({ type: 'buyPotion', offerId }),
      removeCard: (card: CardDefinition) => dispatch({ type: 'removeCard', card }),
      remarkCard: (card: CardDefinition, mark: CardMark) => dispatch({ type: 'remarkCard', card, mark }),
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
    /** まだ見せていない出来事。先頭から順に見せる。 */
    events,
    /** 演出が終わるまで出す画面。null なら run を出す。 */
    shown,
    dismissEvent,
    moveTo,
    finishCombat,
    resolveReward,
    chooseBossRelic,
    startFinalBattle,
    newRun,
    discardPotion,
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
