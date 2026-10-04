import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { AgentDefinition } from '../../domain/agent';
import type { CombatEvent, PlayerState } from '../../domain/combat';
import { playerStatuses } from '../../logic/glossary';
import { COLORS, SPACING } from '../../theme';
import { FighterEffects } from './effects/FighterEffects';
import { FighterInfoSheet } from './FighterInfoSheet';
import { HpBar } from './HpBar';
import { ActorFigure } from './model3d/ActorFigure';
import { AGENT_MODELS } from './model3d/actorModels';
import { ActorMotion } from './motion/ActorMotion';
import { StatusRow } from './StatusRow';

type PlayerPanelProps = {
  agent: AgentDefinition;
  player: PlayerState;
  events: CombatEvent[];
  defeatDelay: number;
};

/** 舞台の左下。エージェントと HP。タップでかかっている状態の解説。 */
export function PlayerPanel({ agent, player, events, defeatDelay }: PlayerPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const statuses = playerStatuses(player);
  return (
    <>
      <Pressable onPress={() => setInfoOpen(true)}>
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
          <StatusRow statuses={statuses} />
          <HpBar hp={player.hp} maxHp={player.maxHp} block={player.block} />
        </FighterEffects>
      </Pressable>
      {infoOpen && (
        <FighterInfoSheet name={agent.name} statuses={statuses} onClose={() => setInfoOpen(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  body: { gap: SPACING.xs, padding: SPACING.xs },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
