import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BlessingDefinition } from '../../domain/blessing';
import type { RunState } from '../../domain/run';
import type { BlessingActions } from '../../hooks/useRun';
import { describeBlessing } from '../../logic/describe';
import { currentAct } from '../../logic/run';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { DeckButton } from '../cards/DeckButton';
import { ItemBar } from '../items/ItemBar';
import { ScreenScroll } from '../layout/ScreenScroll';
import { GoldBadge } from '../run/GoldBadge';

type BlessingScreenProps = {
  run: RunState;
  options: BlessingDefinition[];
  actions: BlessingActions;
};

/** 章の最初に案内役が現れ、恩恵を 3 つの中から 1 つ授ける。 */
export function BlessingScreen({ run, options, actions }: BlessingScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const act = currentAct(run);

  return (
    <ScreenScroll contentStyle={styles.root}>
      <View style={styles.hud}>
        <ItemBar relics={run.relics} potions={run.potions} />
        <View style={styles.status}>
          <Text style={styles.hp}>
            ❤️ {run.player.hp} / {run.player.maxHp}
          </Text>
          <View style={styles.statusRight}>
            <GoldBadge gold={run.gold} />
            <DeckButton deck={run.deck} />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.actName}>{act.name}</Text>
        <Text style={styles.guideIcon}>{run.guide.icon}</Text>
        <Text style={styles.guideName}>{run.guide.name}</Text>
        <View style={styles.bubble}>
          <Text style={styles.greeting}>{act.greeting}</Text>
        </View>

        <View style={styles.options}>
          {options.map((option) => (
            <BlessingOption
              key={option.id}
              blessing={option}
              selected={option.id === selectedId}
              onPress={() => setSelectedId(option.id)}
            />
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => selectedId && actions.choose(selectedId)}
        disabled={!selectedId}
        style={({ pressed }) => [
          styles.confirm,
          !selectedId && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.confirmText}>この恩恵を受ける</Text>
      </Pressable>
    </ScreenScroll>
  );
}

type BlessingOptionProps = {
  blessing: BlessingDefinition;
  selected: boolean;
  onPress: () => void;
};

function BlessingOption({ blessing, selected, onPress }: BlessingOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
    >
      {describeBlessing(blessing).map((line, index) => (
        <Text key={index} style={[styles.line, line.negative && styles.negative]}>
          {line.negative ? '▼ ' : '◆ '}
          {line.text}
        </Text>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { padding: SPACING.lg, gap: SPACING.md },
  hud: { gap: SPACING.sm, zIndex: 10 },
  status: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  hp: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  actName: { color: COLORS.gold, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  guideIcon: { fontSize: 64, marginTop: SPACING.sm },
  guideName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  bubble: {
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  greeting: { color: COLORS.text, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  options: { alignSelf: 'stretch', gap: SPACING.sm, marginTop: SPACING.md },
  option: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 2,
  },
  selected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  line: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  negative: { color: COLORS.damageText },
  confirm: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
