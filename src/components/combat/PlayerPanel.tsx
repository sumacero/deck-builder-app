import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AgentDefinition } from '../../domain/agent';
import type { CombatEvent, PlayerState } from '../../domain/combat';
import { useDisplayedVitals } from '../../hooks/useDisplayedVitals';
import { playerStatuses } from '../../logic/glossary';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
import { FighterEffects } from './effects/FighterEffects';
import { FighterInfoSheet } from './FighterInfoSheet';
import { HpBar } from './HpBar';
import { ActorFigure } from './model3d/ActorFigure';
import { AGENT_MODELS } from './model3d/actorModels';
import { ArteGauge } from './ArteGauge';
import { ActorMotion } from './motion/ActorMotion';
import { StatusRow } from './StatusRow';

type PlayerPanelProps = {
  agent: AgentDefinition;
  player: PlayerState;
  events: CombatEvent[];
  defeatDelay: number;
  /** 3D の一辺。0 なら測り終わるまで描かない。 */
  figureSize: number;
  /** 自分に使うカードの指が、自分の範囲にある（ここで離すと使う）。 */
  highlighted: boolean;
  /** 自分の範囲を測るため、外枠の View を渡す。 */
  viewRef: (node: View | null) => void;
};

/** 舞台の左下（横向きなら左の列）。エージェントと HP。タップでかかっている状態の解説。 */
export function PlayerPanel({
  agent,
  player,
  events,
  defeatDelay,
  figureSize,
  highlighted,
  viewRef,
}: PlayerPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const statuses = playerStatuses(player);
  const vitals = useDisplayedVitals('player', events, player);
  return (
    <>
      <View ref={viewRef} collapsable={false} style={[styles.frame, highlighted && styles.highlighted]}>
        <Pressable onPress={() => setInfoOpen(true)}>
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
            <HpBar hp={vitals.hp} maxHp={player.maxHp} block={vitals.block} />
            <ArteGauge value={player.arteGauge} />
          </FighterEffects>
        </Pressable>
      </View>
      {infoOpen && (
        <FighterInfoSheet name={agent.name} statuses={statuses} onClose={() => setInfoOpen(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: RADIUS.md, borderWidth: 2, borderColor: 'transparent' },
  highlighted: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  unmeasured: { height: ACTOR_FIGURE.minSize },
  body: { gap: SPACING.xs, padding: SPACING.xs },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
