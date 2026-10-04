import { StyleSheet, Text } from 'react-native';
import type { AgentDefinition } from '../../domain/agent';
import type { CombatEvent, PlayerState } from '../../domain/combat';
import { COLORS, SPACING } from '../../theme';
import { FighterEffects } from './effects/FighterEffects';
import { HpBar } from './HpBar';
import { ActorFigure } from './model3d/ActorFigure';
import { AGENT_MODELS } from './model3d/actorModels';
import { ActorMotion } from './motion/ActorMotion';

type PlayerPanelProps = {
  agent: AgentDefinition;
  player: PlayerState;
  events: CombatEvent[];
  defeatDelay: number;
};

/** 舞台の左下。エージェントと HP。 */
export function PlayerPanel({ agent, player, events, defeatDelay }: PlayerPanelProps) {
  const strength = player.strength + player.tempStrength;
  return (
    <FighterEffects
      target="player"
      events={events}
      defeated={player.hp <= 0}
      defeatDelay={defeatDelay}
      style={styles.body}
    >
      <ActorMotion side="player" events={events} agentId={agent.id}>
        <ActorFigure
          key={agent.id}
          model={AGENT_MODELS[agent.id]}
          icon={agent.icon}
          side="player"
          events={events}
          agentId={agent.id}
        />
      </ActorMotion>
      <Text style={styles.name} numberOfLines={1}>
        {agent.name}
      </Text>
      {strength > 0 && <Text style={styles.strength}>💪 筋力 {strength}</Text>}
      <HpBar hp={player.hp} maxHp={player.maxHp} block={player.block} />
    </FighterEffects>
  );
}

const styles = StyleSheet.create({
  body: { gap: SPACING.xs, padding: SPACING.xs },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  strength: { color: COLORS.gold, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
