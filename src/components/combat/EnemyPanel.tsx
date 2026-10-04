import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent, DamagePreview, EnemyState } from '../../domain/combat';
import { currentIntent, isAlive } from '../../logic/combat';
import { describeIntent, ENEMY_RANK_LABEL } from '../../logic/describe';
import { enemyStatuses, keywordsForIntent } from '../../logic/glossary';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { DamagePreviewBadge } from './DamagePreviewBadge';
import { FighterEffects } from './effects/FighterEffects';
import { FighterInfoSheet } from './FighterInfoSheet';
import { HpBar } from './HpBar';
import { IntentBadge } from './IntentBadge';
import { ActorFigure } from './model3d/ActorFigure';
import { ENEMY_MODELS } from './model3d/actorModels';
import { ActorMotion } from './motion/ActorMotion';
import { StatusRow } from './StatusRow';

type EnemyPanelProps = {
  enemy: EnemyState;
  events: CombatEvent[];
  defeatDelay: number;
  agentId: string;
  figureSize: number;
  /** カードをこの敵に向けているときの実ダメージ。 */
  preview: DamagePreview | undefined;
  /** カードやポーションの対象として選ばれている（狙われている）。 */
  highlighted: boolean;
  /** 指定するとタップで状態の解説ではなくこちらを呼ぶ（ポーションの対象選び）。 */
  onSelect?: () => void;
  /** カードを離した位置がこの敵の上かを判定するため、外枠の View を渡す。 */
  viewRef: (node: View | null) => void;
};

/** 舞台の上側に並ぶ敵 1 体。上に次の行動、中央に敵、下に HP。タップで状態と次の行動の解説。 */
export function EnemyPanel({
  enemy,
  events,
  defeatDelay,
  agentId,
  figureSize,
  preview,
  highlighted,
  onSelect,
  viewRef,
}: EnemyPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const alive = isAlive(enemy);
  const move = currentIntent(enemy);
  const rankLabel = ENEMY_RANK_LABEL[enemy.rank];
  const statuses = enemyStatuses(enemy);
  return (
    <View ref={viewRef} style={styles.slot}>
      <Pressable
        style={[styles.column, highlighted && styles.highlighted]}
        disabled={!alive}
        onPress={onSelect ?? (() => setInfoOpen(true))}
      >
        <View style={[styles.intent, !alive && styles.hidden]}>
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
          target={enemy.uid}
          events={events}
          defeated={!alive}
          defeatDelay={defeatDelay}
          style={styles.body}
        >
          <ActorMotion actorId={enemy.uid} events={events} agentId={agentId}>
            <ActorFigure
              key={enemy.uid}
              model={ENEMY_MODELS[enemy.id]}
              icon={enemy.icon}
              actorId={enemy.uid}
              events={events}
              agentId={agentId}
              size={figureSize}
            />
          </ActorMotion>
          {rankLabel && <Text style={styles.rank}>{rankLabel}</Text>}
          <Text style={styles.name} numberOfLines={1}>
            {enemy.name}
          </Text>
          <StatusRow statuses={statuses} />
          <HpBar hp={enemy.hp} maxHp={enemy.maxHp} block={enemy.block} />
        </FighterEffects>
        {preview && (
          <View style={styles.previewLayer}>
            <DamagePreviewBadge preview={preview} />
          </View>
        )}
      </Pressable>
      {infoOpen && (
        <FighterInfoSheet
          name={enemy.name}
          statuses={statuses}
          intent={{ moveName: move.name, keywords: keywordsForIntent(move) }}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, maxWidth: 220 },
  column: {
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  highlighted: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  intent: { alignItems: 'center', gap: SPACING.xs },
  hidden: { opacity: 0 },
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
  previewLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    alignItems: 'center',
    pointerEvents: 'none',
  },
});
