import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CombatEvent, PotionSlot } from '../../domain/combat';
import type { RelicDefinition } from '../../domain/relic';
import { describePotion, describeRelic } from '../../logic/describe';
import { useIsLandscape } from '../../hooks/useIsLandscape';
import { ITEM_BAR, SPACING } from '../../theme';
import { ItemInfo } from './ItemInfo';
import { PotionSlotView } from './PotionSlotView';
import { RelicIcon } from './RelicIcon';

type Selection = { kind: 'relic'; id: string } | { kind: 'potion'; slot: number };

const isSameSelection = (a: Selection, b: Selection) =>
  a.kind === 'relic' ? b.kind === 'relic' && a.id === b.id : b.kind === 'potion' && a.slot === b.slot;

const NO_EVENTS: CombatEvent[] = [];

type ItemBarProps = {
  relics: RelicDefinition[];
  potions: PotionSlot[];
  events?: CombatEvent[];
  /** 渡さなければポーションは説明を見るだけ（戦闘外）。 */
  potionUse?: {
    isDrinkable: (slot: number) => boolean;
    onDrink: (slot: number) => void;
  };
};

/** 画面上部の所持品欄。左にレリック、右にポーション。タップで説明を開く。 */
export function ItemBar({
  relics,
  potions,
  events = NO_EVENTS,
  potionUse,
}: ItemBarProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const landscape = useIsLandscape();

  const toggle = (next: Selection) =>
    setSelection((prev) => (prev && isSameSelection(prev, next) ? null : next));
  const close = () => setSelection(null);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.group, styles.relics]}>
          {relics.map((relic) => (
            <RelicIcon
              key={relic.id}
              relic={relic}
              events={events}
              selected={selection?.kind === 'relic' && selection.id === relic.id}
              onPress={() => toggle({ kind: 'relic', id: relic.id })}
            />
          ))}
        </View>
        <View style={styles.group}>
          {potions.map((potion, slot) => (
            <PotionSlotView
              key={slot}
              potion={potion}
              selected={selection?.kind === 'potion' && selection.slot === slot}
              onPress={() => toggle({ kind: 'potion', slot })}
            />
          ))}
        </View>
      </View>
      <View style={[styles.popover, landscape && styles.landscapePopover]}>
        {renderInfo()}
      </View>
    </View>
  );

  function renderInfo() {
    if (!selection) return null;
    if (selection.kind === 'relic') {
      const relic = relics.find((r) => r.id === selection.id);
      if (!relic) return null;
      return (
        <ItemInfo
          icon={relic.icon}
          name={relic.name}
          description={describeRelic(relic)}
          onClose={close}
        />
      );
    }
    const potion = potions[selection.slot];
    if (!potion) return null;
    return (
      <ItemInfo
        icon={potion.icon}
        name={potion.name}
        description={describePotion(potion)}
        action={
          potionUse && {
            label: '使う',
            enabled: potionUse.isDrinkable(selection.slot),
            onPress: () => {
              potionUse.onDrink(selection.slot);
              close();
            },
          }
        }
        onClose={close}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { zIndex: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  group: { flexDirection: 'row', gap: SPACING.sm },
  /** レリックが増えたら折り返す。 */
  relics: { flex: 1, flexWrap: 'wrap' },
  popover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: SPACING.sm,
    zIndex: 20,
    elevation: 20,
  },
  landscapePopover: { minWidth: ITEM_BAR.landscapePopoverWidth },
});
