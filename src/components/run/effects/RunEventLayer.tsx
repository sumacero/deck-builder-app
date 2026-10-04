import { useEffect, useEffectEvent } from 'react';
import type { SoundId } from '../../../audio/sounds';
import { playSound } from '../../../audio/soundPlayer';
import type { QueuedRunEvent } from '../../../domain/runEvent';
import { HealBurst } from './HealBurst';
import { UpgradeReveal } from './UpgradeReveal';

type RunEventLayerProps = {
  queued: QueuedRunEvent | undefined;
  onDone: (id: number) => void;
};

/** ラン中の出来事（回復・強化・ゴールド・カード入手）を 1 件ずつ、どの画面の上にも重ねて見せる。 */
export function RunEventLayer({ queued, onDone }: RunEventLayerProps) {
  if (!queued) return null;
  const done = () => onDone(queued.id);
  const { event } = queued;
  switch (event.kind) {
    case 'heal':
      return (
        <HealBurst
          key={queued.id}
          hpBefore={event.hpBefore}
          hpAfter={event.hpAfter}
          maxHpBefore={event.maxHpBefore}
          maxHpAfter={event.maxHpAfter}
          onDone={done}
        />
      );
    case 'upgrade':
      return <UpgradeReveal key={queued.id} cards={event.cards} onDone={done} />;
    case 'goldChange':
      return <SoundCue key={queued.id} sound="coin" onDone={done} />;
    case 'cardGain':
      return <SoundCue key={queued.id} sound="cardPlay" onDone={done} />;
  }
}

type SoundCueProps = { sound: SoundId; onDone: () => void };

/** 画面は覆わず、効果音だけ鳴らしてすぐ次へ。 */
function SoundCue({ sound, onDone }: SoundCueProps) {
  const finish = useEffectEvent(onDone);
  useEffect(() => {
    playSound(sound);
    finish();
  }, [sound]);
  return null;
}
