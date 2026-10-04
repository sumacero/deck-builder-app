import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { prepareSounds } from '../../audio/soundPlayer';
import { STANDARD_RUN } from '../../data/runSetups';
import { useRun } from '../../hooks/useRun';
import { buildCombatSetup, currentAct } from '../../logic/run';
import { BlessingScreen } from '../blessing/BlessingScreen';
import { DeckEditScreen } from '../blessing/DeckEditScreen';
import { CombatScreen } from '../combat/CombatScreen';
import { EventScreen } from '../event/EventScreen';
import { MapScreen } from '../map/MapScreen';
import { RestScreen } from '../rest/RestScreen';
import { ShopScreen } from '../shop/ShopScreen';
import { TreasureScreen } from '../treasure/TreasureScreen';
import { BossRelicScreen } from './BossRelicScreen';
import { MOTION } from '../../theme';
import { FadeOverlay } from '../effects/FadeOverlay';
import { RunEventLayer } from './effects/RunEventLayer';
import { RewardScreen } from './RewardScreen';

type RunRootProps = {
  /** ランが終わった画面から、タイトルに戻る。 */
  onExitToTitle: () => void;
};

/**
 * ラン全体の画面切り替え。マップから各マスの画面へ。
 * 画面が変わるたびに暗転から明け、回復・強化などの演出はどの画面の上にも重ねて出す。
 */
export function RunRoot({ onExitToTitle }: RunRootProps) {
  const {
    run,
    currentEvent,
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
  } = useRun(STANDARD_RUN);

  useEffect(() => {
    void prepareSounds();
  }, []);

  let screen: ReactNode;
  switch (run.phase.kind) {
    case 'blessing':
      screen = <BlessingScreen run={run} options={run.phase.options} actions={blessingActions} />;
      break;
    case 'deckEdit':
      screen = <DeckEditScreen run={run} mode={run.phase.mode} actions={blessingActions} />;
      break;
    case 'reward':
      screen = (
        <RewardScreen
          choices={run.phase.choices}
          gold={run.phase.gold}
          relic={run.phase.relic}
          toBossRelic={run.phase.next === 'bossRelic'}
          deck={run.deck}
          onPick={resolveReward}
        />
      );
      break;
    case 'bossRelic':
      screen = <BossRelicScreen run={run} choices={run.phase.choices} onChoose={chooseBossRelic} />;
      break;
    case 'combat':
      screen = (
        <CombatScreen
          key={`${run.actIndex}-${run.phase.nodeId}-${run.phase.seed}`}
          setup={buildCombatSetup(run, run.phase.encounter)}
          seed={run.phase.seed}
          actId={currentAct(run).id}
          onFinish={finishCombat}
        />
      );
      break;
    case 'rest':
      screen = <RestScreen run={run} actions={restActions} />;
      break;
    case 'shop':
      screen = <ShopScreen run={run} stock={run.phase.stock} actions={shopActions} />;
      break;
    case 'event':
      screen = (
        <EventScreen
          key={run.phase.event.id}
          run={run}
          event={run.phase.event}
          outcome={run.phase.outcome}
          actions={eventActions}
        />
      );
      break;
    case 'treasure':
      screen = (
        <TreasureScreen
          run={run}
          opened={run.phase.opened}
          relic={run.phase.relic}
          gold={run.phase.gold}
          actions={treasureActions}
        />
      );
      break;
    case 'map':
    case 'gameOver':
    case 'cleared':
      screen = (
        <MapScreen
          key={run.actIndex}
          run={run}
          onMove={moveTo}
          onNewRun={newRun}
          onExitToTitle={onExitToTitle}
        />
      );
      break;
  }

  return (
    <View style={styles.root}>
      {screen}
      <FadeOverlay
        key={`${run.actIndex}-${run.phase.kind}`}
        from={1}
        to={0}
        duration={MOTION.phaseFadeIn}
      />
      <RunEventLayer queued={currentEvent} onDone={dismissEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
