import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CombatEvent, EnemyState } from '../../domain/combat';
import { currentIntent } from '../../logic/combat';
import { describeIntent, ENEMY_RANK_LABEL } from '../../logic/describe';
import { enemyStatuses, keywordsForIntent } from '../../logic/glossary';
import { COLORS, SPACING } from '../../theme';
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
};

/** 舞台の右上。上に次の行動、中央に敵、下に HP。タップで状態と次の行動の解説。 */
export function EnemyPanel({ enemy, events, defeatDelay, agentId }: EnemyPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const move = currentIntent(enemy);
  const rankLabel = ENEMY_RANK_LABEL[enemy.rank];
  const statuses = enemyStatuses(enemy);
  return (
    <>
      <Pressable style={styles.column} onPress={() => setInfoOpen(true)}>
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
          <StatusRow statuses={statuses} />
          <HpBar hp={enemy.hp} maxHp={enemy.maxHp} block={enemy.block} />
        </FighterEffects>
      </Pressable>
      {infoOpen && (
        <FighterInfoSheet
          name={enemy.name}
          statuses={statuses}
          intent={{ moveName: move.name, keywords: keywordsForIntent(move) }}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </>
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
});
