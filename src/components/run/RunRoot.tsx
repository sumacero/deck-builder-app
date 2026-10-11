import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { fieldMusicFor } from '../../audio/music';
import { prepareSounds } from '../../audio/soundPlayer';
import { useMusic } from '../../hooks/useMusic';
import type { RunSetup } from '../../domain/run';
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
import { MOTION } from '../../theme';
import { FadeOverlay } from '../effects/FadeOverlay';
import { AbandonRunBar, AbandonRunConfirm, AbandonRunProvider } from './AbandonRun';
import { AcquireProvider } from './acquire/AcquireContext';
import { BossRelicScreen } from './BossRelicScreen';
import { FinaleScreen } from './FinaleScreen';
import { RewardScreen } from './RewardScreen';
import { RunEventLayer } from './effects/RunEventLayer';

type RunRootProps = {
  /** 選んだエージェントのラン設定。「新しいラン」も同じエージェントで始める。 */
  setup: RunSetup;
  /** タイトルに戻る。途中であきらめても、ランの終わりからでも。戻るとこのランは消える。 */
  onExitToTitle: () => void;
};

/**
 * ラン全体の画面切り替え。マップから各マスの画面へ。
 * 画面が変わるたびに暗転から明け、回復・強化などの演出はどの画面の上にも重ねて出す。
 */
export function RunRoot({ setup, onExitToTitle }: RunRootProps) {
  const {
    run,
    events,
    dismissEvent,
    discardPotion,
    moveTo,
    finishCombat,
    resolveReward,
    chooseBossRelic,
    startFinalBattle,
    newRun,
    blessingActions,
    restActions,
    shopActions,
    eventActions,
    treasureActions,
  } = useRun(setup);

  // 新しいランでは、所持金の数え上げなどの記憶を捨てる。
  const [runCount, setRunCount] = useState(0);
  const [askingToAbandon, setAskingToAbandon] = useState(false);
  const startNewRun = () => {
    setAskingToAbandon(false);
    setRunCount((count) => count + 1);
    newRun();
  };

  useEffect(() => {
    void prepareSounds();
  }, []);

  // 戦闘とショップは自分の画面で曲を流す。ラスボス戦の前は静かにする。
  // それ以外（マップ・休憩所・イベントなど）は地域のフィールド曲。
  const kind = run.phase.kind;
  // 踏破・敗北は、振り返り画面に「タイトルへ」がある。上端のボタンはそこに被せない。
  const ended = kind === 'gameOver' || kind === 'cleared';
  const ownMusic =
    kind === 'combat' || kind === 'shop' || kind === 'gameOver' || kind === 'cleared' || kind === 'finale';
  useMusic(ownMusic ? null : fieldMusicFor(currentAct(run).region));

  let screen: ReactNode;
  switch (run.phase.kind) {
    case 'blessing':
      screen = <BlessingScreen run={run} options={run.phase.options} actions={blessingActions} />;
      break;
    case 'deckEdit':
      screen = <DeckEditScreen run={run} phase={run.phase} actions={blessingActions} />;
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
    case 'finale':
      screen = <FinaleScreen run={run} onStart={startFinalBattle} />;
      break;
    case 'combat':
      screen = (
        <CombatScreen
          key={`${run.actIndex}-${run.phase.nodeId}-${run.phase.seed}`}
          setup={buildCombatSetup(run, run.phase.encounter)}
          seed={run.phase.seed}
          region={currentAct(run).region}
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
          onNewRun={startNewRun}
          onExitToTitle={onExitToTitle}
        />
      );
      break;
  }

  return (
    <AbandonRunProvider onAbandon={onExitToTitle}>
      <AcquireProvider key={runCount} queued={events} discardPotion={discardPotion}>
        <View style={styles.root}>
          {!ended && <AbandonRunBar onPress={() => setAskingToAbandon(true)} />}
          <View style={styles.play}>{screen}</View>
          <FadeOverlay
            key={`${run.actIndex}-${run.phase.kind}`}
            from={1}
            to={0}
            duration={MOTION.phaseFadeIn}
          />
          <RunEventLayer queued={events[0]} onDone={dismissEvent} />
          {askingToAbandon && !ended && (
            <AbandonRunConfirm
              onStay={() => setAskingToAbandon(false)}
              onLeave={onExitToTitle}
            />
          )}
        </View>
      </AcquireProvider>
    </AbandonRunProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  play: { flex: 1 },
});
