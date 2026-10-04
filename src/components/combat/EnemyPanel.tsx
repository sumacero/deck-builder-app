import { StyleSheet, Text, View } from 'react-native';
import type { CombatEvent, EnemyState } from '../../domain/combat';
import { currentIntent } from '../../logic/combat';
import { describeIntent, ENEMY_RANK_LABEL } from '../../logic/describe';
import { COLORS, SPACING } from '../../theme';
import { FighterEffects } from './effects/FighterEffects';
import { HpBar } from './HpBar';
import { IntentBadge } from './IntentBadge';
import { ActorFigure } from './model3d/ActorFigure';
import { ENEMY_MODELS } from './model3d/actorModels';
import { ActorMotion } from './motion/ActorMotion';

type EnemyPanelProps = {
  enemy: EnemyState;
  events: CombatEvent[];
  defeatDelay: number;
  agentId: string;
};

/** 舞台の右上。上に次の行動、中央に敵、下に HP。 */
export function EnemyPanel({ enemy, events, defeatDelay, agentId }: EnemyPanelProps) {
  const move = currentIntent(enemy);
  const rankLabel = ENEMY_RANK_LABEL[enemy.rank];
  return (
    <View style={styles.column}>
      <View style={styles.intent}>
        <Text style={styles.caption} numberOfLines={1}>
          「{move.name}」
        </Text>
        <View style={styles.badges}>
          {describeIntent(move, enemy.strength).map((intent) => (
            <IntentBadge key={intent.key} intent={intent} />
          ))}
        </View>
      </View>
      <FighterEffects
        target="enemy"
        events={events}
        defeated={enemy.hp <= 0}
        defeatDelay={defeatDelay}
        style={styles.body}
      >
        <ActorMotion side="enemy" events={events} agentId={agentId}>
          <ActorFigure
            key={enemy.id}
            model={ENEMY_MODELS[enemy.id]}
            icon={enemy.icon}
            side="enemy"
            events={events}
            agentId={agentId}
          />
        </ActorMotion>
        {rankLabel && <Text style={styles.rank}>{rankLabel}</Text>}
        <Text style={styles.name} numberOfLines={1}>
          {enemy.name}
        </Text>
        {enemy.strength > 0 && <Text style={styles.strength}>💪 筋力 {enemy.strength}</Text>}
        <HpBar hp={enemy.hp} maxHp={enemy.maxHp} block={enemy.block} />
      </FighterEffects>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { gap: SPACING.xs },
  intent: { alignItems: 'center', gap: SPACING.xs },
  caption: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs },
  body: { gap: SPACING.xs, padding: SPACING.xs },
  rank: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  strength: { color: COLORS.energy, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
