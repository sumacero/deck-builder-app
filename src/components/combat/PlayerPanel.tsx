import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AgentDefinition } from '../../domain/agent';
import type { CombatEvent, PlayerState } from '../../domain/combat';
import { useDisplayedVitals } from '../../hooks/useDisplayedVitals';
import { playerStatuses } from '../../logic/glossary';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
import { AgentPortrait } from '../agents/AgentPortrait';
import { FighterEffects } from './effects/FighterEffects';
import { FighterInfoSheet } from './FighterInfoSheet';
import { HpBar } from './HpBar';
import { ArteGauge } from './ArteGauge';
import { ActorMotion } from './motion/ActorMotion';
import { StatusRow } from './StatusRow';

type PlayerPanelProps = {
  agent: AgentDefinition;
  player: PlayerState;
  events: CombatEvent[];
  defeatDelay: number;
  /** 立ち絵の高さ。0 なら測り終わるまで描かない。 */
  figureSize: number;
  /** 自分に使うカードの指が、自分の範囲にある（ここで離すと使う）。 */
  highlighted: boolean;
  /** 自分の範囲を測るため、外枠の View を渡す（縦向きでは下段を横いっぱいに使う）。 */
  viewRef: (node: View | null) => void;
};

/** 舞台の下段。体は名前・HP の背景。タップでかかっている状態の解説。 */
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
        <Pressable onPress={() => setInfoOpen(true)} style={styles.press}>
          <FighterEffects
            target="player"
            events={events}
            defeated={player.hp <= 0}
            defeatDelay={defeatDelay}
            style={[styles.body, figureSize > 0 && { minHeight: figureSize * 0.85 }]}
          >
            <View pointerEvents="none" style={styles.figureLayer}>
              <View
                style={
                  figureSize > 0
                    ? { width: Math.round(figureSize * 0.75), height: figureSize }
                    : undefined
                }
              >
                <ActorMotion actorId="player" events={events} agentId={agent.id}>
                  {figureSize > 0 ? (
                    <AgentPortrait
                      agentId={agent.id}
                      icon={agent.icon}
                      size={figureSize}
                      events={events}
                      defeated={player.hp <= 0}
                    />
                  ) : (
                    <View style={styles.unmeasured} />
                  )}
                </ActorMotion>
              </View>
            </View>
            <View style={styles.chrome}>
              <Text style={styles.name} numberOfLines={1}>
                {agent.name}
              </Text>
              <StatusRow statuses={statuses} />
              <View style={styles.hpWrap}>
                <HpBar hp={vitals.hp} maxHp={player.maxHp} block={vitals.block} />
              </View>
              <View style={styles.hpWrap}>
                <ArteGauge value={player.arteGauge} />
              </View>
            </View>
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
  /** 判定は横いっぱい。絵は左寄りに置く。 */
  frame: {
    alignSelf: 'stretch',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'visible',
  },
  highlighted: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  press: { alignSelf: 'stretch' },
  /** overflow visible: カイルの踏み込みモーションが枠で切れないようにする。 */
  body: { padding: SPACING.xs, overflow: 'visible' },
  figureLayer: {
    position: 'absolute',
    left: SPACING.sm,
    bottom: 0,
    zIndex: 0,
    overflow: 'visible',
  },
  chrome: {
    zIndex: 1,
    gap: SPACING.xs,
    marginTop: 'auto',
    paddingTop: SPACING.lg,
    alignItems: 'flex-start',
    maxWidth: 220,
  },
  hpWrap: { alignSelf: 'stretch' },
  unmeasured: { height: ACTOR_FIGURE.minSize },
  name: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'left',
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 4,
  },
});
