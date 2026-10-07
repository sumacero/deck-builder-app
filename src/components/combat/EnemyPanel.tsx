import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent, DamagePreview, EnemyState, PlayerState } from '../../domain/combat';
import { useDisplayedVitals } from '../../hooks/useDisplayedVitals';
import { attackerFor, currentIntent, enemyAttackDamage, isAlive, pendingSeedLoss } from '../../logic/combat';
import {
  ATTRIBUTE_ICON,
  describeEnemyAttribute,
  describeIntent,
  describeTrait,
  ENEMY_RANK_LABEL,
} from '../../logic/describe';
import { enemyStatuses, keywordsForIntent } from '../../logic/glossary';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
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
  /** 攻撃予告の数値に、あなたの弱体などを反映するため。 */
  player: PlayerState;
  events: CombatEvent[];
  defeatDelay: number;
  agentId: string;
  figureSize: number;
  /** 敵が多い・横向きのときの詰めた表示（技名を省き、文字を小さくする）。 */
  compact: boolean;
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
  player,
  events,
  defeatDelay,
  agentId,
  figureSize,
  compact,
  preview,
  highlighted,
  onSelect,
  viewRef,
}: EnemyPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const alive = isAlive(enemy);
  const move = currentIntent(enemy);
  const attacker = attackerFor(enemy, move);
  const rankLabel = ENEMY_RANK_LABEL[enemy.rank];
  const statuses = enemyStatuses(enemy);
  const vitals = useDisplayedVitals(enemy.uid, events, enemy);
  return (
    <View ref={viewRef} style={styles.slot}>
      <Pressable
        style={[styles.column, highlighted && styles.highlighted]}
        disabled={!alive}
        onPress={onSelect ?? (() => setInfoOpen(true))}
      >
        <View style={[styles.intent, !alive && styles.hidden]}>
          {!compact && (
            <Text style={styles.caption} numberOfLines={1}>
              「{move.name}」
            </Text>
          )}
          <View style={styles.badges}>
            {describeIntent(move, (base) => enemyAttackDamage(attacker, base, player)).map((intent) => (
              <IntentBadge key={intent.key} intent={intent} compact={compact} />
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
            {figureSize > 0 ? (
              <ActorFigure
                // GL の描画バッファは作成時の大きさのままなので、大きさが変わったら作り直す。
                key={`${enemy.uid}-${figureSize}`}
                model={ENEMY_MODELS[enemy.id]}
                icon={enemy.icon}
                actorId={enemy.uid}
                events={events}
                agentId={agentId}
                size={figureSize}
              />
            ) : (
              <View style={styles.unmeasured} />
            )}
          </ActorMotion>
          {rankLabel && <Text style={styles.rank}>{rankLabel}</Text>}
          <Text style={[styles.name, compact && styles.compactName]} numberOfLines={1}>
            {enemy.name}
          </Text>
          <View style={styles.weaknesses}>
            <Text style={[styles.weakIcon, compact && styles.compactWeakIcon]}>
              {enemy.attribute ? ATTRIBUTE_ICON[enemy.attribute] : '⚙️'}
            </Text>
            <Text style={styles.weakLabel}>弱点</Text>
            {enemy.weaknesses.map((attribute) => (
              <Text key={attribute} style={[styles.weakIcon, compact && styles.compactWeakIcon]}>
                {ATTRIBUTE_ICON[attribute]}
              </Text>
            ))}
          </View>
          <StatusRow statuses={statuses} />
          <HpBar
            hp={vitals.hp}
            maxHp={enemy.maxHp}
            block={vitals.block}
            compact={compact}
            incoming={alive && vitals.hp === enemy.hp && vitals.block === enemy.block ? pendingSeedLoss(enemy) : 0}
          />
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
          traits={[
            describeEnemyAttribute(enemy.attribute, enemy.weaknesses),
            ...enemy.traits
              .filter((trait) => !(trait.kind === 'awaken' && enemy.awakened))
              .map(describeTrait),
          ]}
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
  compactName: { fontSize: 11 },
  weaknesses: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 },
  weakLabel: { color: COLORS.weakness, fontSize: 10, fontWeight: '800', marginHorizontal: 2 },
  weakIcon: { fontSize: 14 },
  compactWeakIcon: { fontSize: 11 },
  unmeasured: { height: ACTOR_FIGURE.minSize },
  previewLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    alignItems: 'center',
    pointerEvents: 'none',
  },
});
