import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AgentDefinition } from '../../domain/agent';
import type { CombatEvent, PlayerState } from '../../domain/combat';
import { playerStatuses } from '../../logic/glossary';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
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
  /** 3D の一辺。0 なら測り終わるまで描かない。 */
  figureSize: number;
};

/** 舞台の左下（横向きなら左の列）。エージェントと HP。タップでかかっている状態の解説。 */
export function PlayerPanel({ agent, player, events, defeatDelay, figureSize }: PlayerPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const statuses = playerStatuses(player);
  return (
    <>
      <Pressable style={styles.frame} onPress={() => setInfoOpen(true)}>
        <FighterEffects
          target="player"
          events={events}
          defeated={player.hp <= 0}
          defeatDelay={defeatDelay}
          style={styles.body}
        >
          <ActorMotion actorId="player" events={events} agentId={agent.id}>
            {figureSize > 0 ? (
              <ActorFigure
                // GL の描画バッファは作成時の大きさのままなので、大きさが変わったら作り直す。
                key={`${agent.id}-${figureSize}`}
                model={AGENT_MODELS[agent.id]}
                icon={agent.icon}
                actorId="player"
                events={events}
                agentId={agent.id}
                size={figureSize}
              />
            ) : (
              <View style={styles.unmeasured} />
            )}
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
  frame: { borderRadius: RADIUS.md, borderWidth: 2, borderColor: 'transparent' },
  unmeasured: { height: ACTOR_FIGURE.minSize },
  body: { gap: SPACING.xs, padding: SPACING.xs },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
