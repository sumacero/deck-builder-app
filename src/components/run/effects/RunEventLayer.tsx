import type { QueuedRunEvent } from '../../../domain/runEvent';
import { describeRelic } from '../../../logic/describe';
import { slotKey } from '../acquire/AcquireContext';
import { AcquireFlyer } from '../acquire/AcquireFlyer';
import { HealBurst } from './HealBurst';
import { UpgradeReveal } from './UpgradeReveal';

type RunEventLayerProps = {
  queued: QueuedRunEvent | undefined;
  onDone: (id: number) => void;
};

/** ラン中の出来事（回復・強化・レリック / ポーション / カードの入手）を 1 件ずつ、どの画面の上にも重ねて見せる。 */
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
    case 'relicGain':
      return (
        <AcquireFlyer
          key={queued.id}
          item={{ kind: 'icon', icon: event.relic.icon, label: event.relic.name, description: describeRelic(event.relic) }}
          targetKey={slotKey.relic(event.relic.id)}
          sound="relic"
          onDone={done}
        />
      );
    case 'potionGain':
      return (
        <AcquireFlyer
          key={queued.id}
          item={{ kind: 'icon', icon: event.potion.icon, label: event.potion.name }}
          targetKey={slotKey.potion(event.slot)}
          sound="potion"
          onDone={done}
        />
      );
    case 'cardGain':
      return (
        <AcquireFlyer
          key={queued.id}
          item={{ kind: 'card', card: event.card }}
          targetKey={slotKey.deck}
          sound="cardPlay"
          onDone={done}
        />
      );
  }
}
