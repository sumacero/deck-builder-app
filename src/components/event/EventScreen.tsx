import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { EventDefinition, EventOption } from '../../domain/event';
import type { RunState } from '../../domain/run';
import type { EventActions } from '../../hooks/useRun';
import { describeEventOption } from '../../logic/describe';
import { canChooseEventOption } from '../../logic/event';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { RunHud } from '../run/RunHud';

type EventScreenProps = {
  run: RunState;
  event: EventDefinition;
  /** 選んだあとの結末。null ならまだ選んでいない。 */
  outcome: string | null;
  actions: EventActions;
};

/** 「？」マスのイベント。選択肢を選んで決定し、結末を読んだら先へ進む。 */
export function EventScreen({ run, event, outcome, actions }: EventScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <RunHud run={run} />

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.icon}>{event.icon}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.bubble}>
          <Text style={styles.text}>{outcome ?? event.text}</Text>
        </View>

        {outcome === null && (
          <View style={styles.options}>
            {event.options.map((option) => (
              <EventOptionView
                key={option.id}
                option={option}
                enabled={canChooseEventOption(run, option)}
                selected={option.id === selectedId}
                onPress={() => setSelectedId(option.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {outcome === null ? (
        <Pressable
          onPress={() => selectedId && actions.choose(selectedId)}
          disabled={!selectedId}
          style={({ pressed }) => [
            styles.confirm,
            !selectedId && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.confirmText}>決定</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={actions.leave}
          style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
        >
          <Text style={styles.confirmText}>先へ進む</Text>
        </Pressable>
      )}
    </View>
  );
}

type EventOptionViewProps = {
  option: EventOption;
  enabled: boolean;
  selected: boolean;
  onPress: () => void;
};

function EventOptionView({ option, enabled, selected, onPress }: EventOptionViewProps) {
  const lines = describeEventOption(option);
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      style={({ pressed }) => [
        styles.option,
        selected && styles.selected,
        !enabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{option.label}</Text>
      {lines.map((line, index) => (
        <Text key={index} style={[styles.line, line.negative && styles.negative]}>
          {line.negative ? '▼ ' : '◆ '}
          {line.text}
        </Text>
      ))}
      {!enabled && <Text style={styles.blocked}>今は選べない</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  body: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  icon: { fontSize: 64 },
  title: { color: COLORS.gold, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  bubble: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  text: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  options: { alignSelf: 'stretch', gap: SPACING.sm, marginTop: SPACING.sm },
  option: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 2,
  },
  selected: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  label: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  line: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  negative: { color: COLORS.damageText },
  blocked: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
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
