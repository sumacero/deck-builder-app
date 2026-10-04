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
import { RewardScreen } from './RewardScreen';

/** ラン全体の画面切り替え。マップから各マスの画面へ。 */
export function RunRoot() {
  const {
    run,
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

  switch (run.phase.kind) {
    case 'blessing':
      return <BlessingScreen run={run} options={run.phase.options} actions={blessingActions} />;
    case 'deckEdit':
      return <DeckEditScreen run={run} mode={run.phase.mode} actions={blessingActions} />;
    case 'reward':
      return (
        <RewardScreen
          choices={run.phase.choices}
          gold={run.phase.gold}
          relic={run.phase.relic}
          toBossRelic={run.phase.next === 'bossRelic'}
          deck={run.deck}
          onPick={resolveReward}
        />
      );
    case 'bossRelic':
      return <BossRelicScreen run={run} choices={run.phase.choices} onChoose={chooseBossRelic} />;
    case 'combat':
      return (
        <CombatScreen
          key={`${run.actIndex}-${run.phase.nodeId}-${run.phase.seed}`}
          setup={buildCombatSetup(run, run.phase.enemy)}
          seed={run.phase.seed}
          actId={currentAct(run).id}
          onFinish={finishCombat}
        />
      );
    case 'rest':
      return <RestScreen run={run} actions={restActions} />;
    case 'shop':
      return <ShopScreen run={run} stock={run.phase.stock} actions={shopActions} />;
    case 'event':
      return (
        <EventScreen
          key={run.phase.event.id}
          run={run}
          event={run.phase.event}
          outcome={run.phase.outcome}
          actions={eventActions}
        />
      );
    case 'treasure':
      return (
        <TreasureScreen
          run={run}
          opened={run.phase.opened}
          relic={run.phase.relic}
          gold={run.phase.gold}
          actions={treasureActions}
        />
      );
    case 'map':
    case 'gameOver':
    case 'cleared':
      return <MapScreen key={run.actIndex} run={run} onMove={moveTo} onNewRun={newRun} />;
  }
}
