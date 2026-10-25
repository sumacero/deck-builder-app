import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent, DamagePreview, EnemyState, PlayerState } from '../../domain/combat';
import { useDisplayedVitals } from '../../hooks/useDisplayedVitals';
import { useHeldWhile } from '../../hooks/useHeldWhile';
import { attackerFor, currentIntent, enemyAttackDamage, isAlive, pendingSeedLoss } from '../../logic/combat';
import {
  ATTRIBUTE_ICON,
  describeEnemyAttribute,
  describeIntent,
  describeRoutine,
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
  const rawMove = currentIntent(enemy);
  const move =
    enemy.hitCut > 0
      ? {
          ...rawMove,
          actions: rawMove.actions.map((action) =>
            action.kind === 'attack'
              ? { ...action, hits: Math.max(0, action.hits - enemy.hitCut) }
              : action,
          ),
        }
      : rawMove;
  const attacker = attackerFor(enemy, move);
  const routine = describeRoutine(enemy.rank);
  const rankLabel = ENEMY_RANK_LABEL[enemy.rank];
  const statuses = enemyStatuses(enemy);
  const vitals = useDisplayedVitals(enemy.uid, events, enemy);
  // 被弾や倒れる演出の再生中は、直前の緑のまま見せる（赤に戻すとちらつく）。
  // 再生中に新しい値へ切り替えないのは、宿り木の発動中に「次の宿り木」を今のゲージへ重ねないため。
  const settled = vitals.hp === enemy.hp && vitals.block === enemy.block;
  const incoming = useHeldWhile(!settled, pendingSeedLoss(enemy));
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
          style={[styles.body, figureSize > 0 && { minHeight: figureSize * 0.85 }]}
        >
          {/* 体は名前・HP の背景。重なってよい。 */}
          <View pointerEvents="none" style={styles.figureLayer}>
            <View style={figureSize > 0 ? { width: figureSize, height: figureSize } : undefined}>
              <ActorMotion actorId={enemy.uid} events={events} agentId={agentId}>
                {figureSize > 0 ? (
                  <ActorFigure
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
            </View>
          </View>
          {/* 名前はプレイヤーと同じく HP のすぐ上・左寄せ。 */}
          <View style={styles.chrome}>
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
            <View style={styles.hpWrap}>
              <HpBar
                hp={vitals.hp}
                maxHp={enemy.maxHp}
                block={vitals.block}
                compact={compact}
                incoming={incoming}
              />
            </View>
          </View>
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
            ...(routine ? [routine] : []),
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
  slot: { flex: 1, maxWidth: 300, overflow: 'visible' },
  column: {
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'visible',
  },
  highlighted: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  intent: { alignItems: 'center', gap: SPACING.xs, zIndex: 2 },
  hidden: { opacity: 0 },
  caption: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs },
  body: { padding: SPACING.xs, overflow: 'visible' },
  figureLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 0,
  },
  chrome: {
    zIndex: 1,
    gap: SPACING.xs,
    marginTop: 'auto',
    paddingTop: SPACING.lg,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  rank: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'left',
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 4,
  },
  name: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'left',
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 4,
  },
  compactName: { fontSize: 11 },
  weaknesses: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 2 },
  weakLabel: { color: COLORS.weakness, fontSize: 10, fontWeight: '800', marginHorizontal: 2 },
  weakIcon: { fontSize: 14 },
  compactWeakIcon: { fontSize: 11 },
  /** alignItems:flex-start でもバーは枠いっぱいに伸ばす。 */
  hpWrap: { alignSelf: 'stretch' },
  unmeasured: { height: ACTOR_FIGURE.minSize },
  previewLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 3,
  },
});
