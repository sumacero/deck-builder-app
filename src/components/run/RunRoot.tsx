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
 * 演出と画面の切り替わりが重なるときは、演出が終わってから次の画面と BGM に進む。
 */
export function RunRoot({ setup, onExitToTitle }: RunRootProps) {
  const {
    run,
    events,
    shown,
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

  // 演出が残っているあいだは、切り替わる前の画面と曲を保つ。ロジック上の run は先に進んでいる。
  const visible = shown ?? run;

  // 戦闘とショップは自分の画面で曲を流す。ラスボス戦の前は静かにする。
  // それ以外（マップ・休憩所・イベントなど）は地域のフィールド曲。
  const kind = visible.phase.kind;
  // 踏破・敗北は、振り返り画面に「タイトルへ」がある。上端のボタンはそこに被せない。
  const ended = kind === 'gameOver' || kind === 'cleared';
  const ownMusic =
    kind === 'combat' || kind === 'shop' || kind === 'gameOver' || kind === 'cleared' || kind === 'finale';
  useMusic(ownMusic ? null : fieldMusicFor(currentAct(visible).region));

  let screen: ReactNode;
  switch (visible.phase.kind) {
    case 'blessing':
      screen = <BlessingScreen run={visible} options={visible.phase.options} actions={blessingActions} />;
      break;
    case 'deckEdit':
      screen = <DeckEditScreen run={visible} mode={visible.phase.mode} actions={blessingActions} />;
      break;
    case 'reward':
      screen = (
        <RewardScreen
          choices={visible.phase.choices}
          gold={visible.phase.gold}
          relic={visible.phase.relic}
          toBossRelic={visible.phase.next === 'bossRelic'}
          deck={visible.deck}
          onPick={resolveReward}
        />
      );
      break;
    case 'bossRelic':
      screen = <BossRelicScreen run={visible} choices={visible.phase.choices} onChoose={chooseBossRelic} />;
      break;
    case 'finale':
      screen = <FinaleScreen run={visible} onStart={startFinalBattle} />;
      break;
    case 'combat':
      screen = (
        <CombatScreen
          key={`${visible.actIndex}-${visible.phase.nodeId}-${visible.phase.seed}`}
          setup={buildCombatSetup(visible, visible.phase.encounter)}
          seed={visible.phase.seed}
          region={currentAct(visible).region}
          onFinish={finishCombat}
        />
      );
      break;
    case 'rest':
      screen = <RestScreen run={visible} actions={restActions} />;
      break;
    case 'shop':
      screen = <ShopScreen run={visible} stock={visible.phase.stock} actions={shopActions} />;
      break;
    case 'event':
      screen = (
        <EventScreen
          key={visible.phase.event.id}
          run={visible}
          event={visible.phase.event}
          outcome={visible.phase.outcome}
          actions={eventActions}
        />
      );
      break;
    case 'treasure':
      screen = (
        <TreasureScreen
          run={visible}
          opened={visible.phase.opened}
          relic={visible.phase.relic}
          gold={visible.phase.gold}
          actions={treasureActions}
        />
      );
      break;
    case 'map':
    case 'gameOver':
    case 'cleared':
      screen = (
        <MapScreen
          key={visible.actIndex}
          run={visible}
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
          <View style={styles.play}>
            {screen}
            {shown && <View style={styles.hold} />}
          </View>
          <FadeOverlay
            key={`${visible.actIndex}-${visible.phase.kind}`}
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
  /** 演出が終わるまで、切り替わる前の画面のボタンを押せないようにする。演出自体は上に重ねる。 */
  hold: { ...StyleSheet.absoluteFill },
});
