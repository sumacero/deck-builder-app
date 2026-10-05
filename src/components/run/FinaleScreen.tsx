import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent } from '../../domain/combat';
import type { RunState } from '../../domain/run';
import { currentAct } from '../../logic/run';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { ActorFigure } from '../combat/model3d/ActorFigure';
import { ENEMY_MODELS } from '../combat/model3d/actorModels';
import { ScreenScroll } from '../layout/ScreenScroll';
import { RunHud } from './RunHud';

type FinaleScreenProps = {
  run: RunState;
  onStart: () => void;
};

const NO_EVENTS: CombatEvent[] = [];

/** 最後の章を終えたあと。案内役がラスボスのことを告げ、決戦に挑む。 */
export function FinaleScreen({ run, onStart }: FinaleScreenProps) {
  const boss = run.finalBoss;
  return (
    <SceneBackground region={currentAct(run).region} scene="combat">
      <ScreenScroll contentStyle={styles.root}>
        <RunHud run={run} />

        <View style={styles.body}>
          <Text style={styles.heading}>最終決戦</Text>
          <View style={styles.guide}>
            <Text style={styles.guideIcon}>{run.guide.icon}</Text>
            <Text style={styles.guideName}>{run.guide.name}</Text>
          </View>
          <View style={styles.bubble}>
            <Text style={styles.line}>{run.guide.finaleLine}</Text>
          </View>
          <ActorFigure
            model={ENEMY_MODELS[boss.id]}
            icon={boss.icon}
            actorId="enemy-0"
            events={NO_EVENTS}
            agentId={run.agent.id}
            size={ACTOR_FIGURE.finaleSize}
          />
          <Text style={styles.bossName}>{boss.name}</Text>
        </View>

        <Pressable onPress={onStart} style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}>
          <Text style={styles.confirmText}>決戦に挑む</Text>
        </Pressable>
      </ScreenScroll>
    </SceneBackground>
  );
}

const styles = StyleSheet.create({
  root: { padding: SPACING.lg, gap: SPACING.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  heading: { color: COLORS.gold, fontSize: 24, fontWeight: '800', letterSpacing: 6 },
  guide: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  guideIcon: { fontSize: 32 },
  guideName: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  bubble: {
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  line: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  bossName: { color: COLORS.danger, fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  confirm: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
