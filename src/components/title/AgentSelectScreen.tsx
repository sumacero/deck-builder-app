import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Region } from '../../domain/act';
import type { CombatEvent } from '../../domain/combat';
import type { RunSetup } from '../../domain/run';
import { STRONG_AGAINST, weaknessesOf } from '../../logic/attribute';
import { attributeText, describeRelic } from '../../logic/describe';
import { useMusic } from '../../hooks/useMusic';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { ActorFigure } from '../combat/model3d/ActorFigure';
import { AGENT_MODELS } from '../combat/model3d/actorModels';
import { ScreenScroll } from '../layout/ScreenScroll';

type AgentSelectScreenProps = {
  runs: readonly RunSetup[];
  onSelect: (setup: RunSetup) => void;
  onBack: () => void;
};

const BACKGROUND_REGION: Region = 'grassland';
const NO_EVENTS: CombatEvent[] = [];

/** 冒険に連れて行くエージェントを選ぶ。カードを押して選び、「この仲間で出発」で始める。 */
export function AgentSelectScreen({ runs, onSelect, onBack }: AgentSelectScreenProps) {
  const [selected, setSelected] = useState(0);
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  useMusic('title');

  return (
    <SceneBackground region={BACKGROUND_REGION} scene="map">
      <ScreenScroll contentStyle={styles.root}>
        <Text style={styles.heading}>仲間を選ぶ</Text>
        <View style={[styles.list, landscape && styles.landscapeList]}>
          {runs.map((setup, index) => (
            <AgentOption
              key={setup.agent.id}
              setup={setup}
              selected={index === selected}
              onPress={() => setSelected(index)}
            />
          ))}
        </View>
        <Pressable
          onPress={() => onSelect(runs[selected])}
          style={({ pressed }) => [styles.start, pressed && styles.pressed]}
        >
          <Text style={styles.startText}>この仲間で出発</Text>
        </Pressable>
        <Pressable onPress={onBack} hitSlop={6} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backText}>タイトルへ戻る</Text>
        </Pressable>
      </ScreenScroll>
    </SceneBackground>
  );
}

type AgentOptionProps = {
  setup: RunSetup;
  selected: boolean;
  onPress: () => void;
};

function AgentOption({ setup, selected, onPress }: AgentOptionProps) {
  const { agent } = setup;
  const strong = STRONG_AGAINST[agent.attribute];
  const weak = weaknessesOf(agent.attribute);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={styles.figure}>
        <ActorFigure
          model={AGENT_MODELS[agent.id]}
          icon={agent.icon}
          actorId="player"
          events={NO_EVENTS}
          agentId={agent.id}
          size={ACTOR_FIGURE.selectSize}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{agent.title}</Text>
        <Text style={styles.name}>{agent.name}</Text>
        <Text style={styles.meta}>
          {attributeText(agent.attribute)}属性　HP {setup.playerMaxHp}
        </Text>
        <Text style={styles.affinity}>
          {attributeText(strong)}の敵に強く、{weak.map(attributeText).join('・')}の敵に弱い
        </Text>
        <Text style={styles.style}>{agent.playStyle}</Text>
        {setup.relics.map((relic) => (
          <Text key={relic.id} style={styles.detail}>
            {relic.icon} {relic.name}: {describeRelic(relic)}
          </Text>
        ))}
        <Text style={styles.detail}>✨ 秘奥義「{agent.mysticArte.name}」</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', gap: SPACING.md, padding: SPACING.lg },
  heading: {
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 6,
  },
  list: { alignSelf: 'stretch', gap: SPACING.md },
  landscapeList: { flexDirection: 'row' },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.panelTranslucent,
    borderColor: COLORS.panelBorder,
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  selected: { borderColor: COLORS.gold, backgroundColor: COLORS.panel },
  figure: { width: ACTOR_FIGURE.selectSize, alignItems: 'center' },
  info: { flex: 1, gap: 2 },
  title: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  name: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  meta: { color: COLORS.gold, fontSize: 12, fontWeight: '800' },
  affinity: { color: COLORS.textMuted, fontSize: 11 },
  style: { color: COLORS.text, fontSize: 12, lineHeight: 17, marginTop: SPACING.xs },
  detail: { color: COLORS.textMuted, fontSize: 11, lineHeight: 15 },
  start: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
    marginTop: SPACING.sm,
  },
  startText: { color: COLORS.onGold, fontSize: 17, fontWeight: '900', letterSpacing: 3 },
  back: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  backText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
