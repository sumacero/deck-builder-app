import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CombatEvent, DamagePreview, EnemyState, EnemyUid } from '../../domain/combat';
import { ACTOR_FIGURE, SPACING } from '../../theme';
import { EnemyPanel } from './EnemyPanel';

type EnemyRowProps = {
  enemies: EnemyState[];
  events: CombatEvent[];
  defeatDelay: number;
  agentId: string;
  previews: DamagePreview[];
  highlighted: readonly EnemyUid[];
  /** ポーションの対象を選んでいる間だけ渡す。 */
  onSelect?: (uid: EnemyUid) => void;
  registerView: (uid: EnemyUid, node: View | null) => void;
};

/**
 * 敵を左から順に横一列に並べる。1 体なら舞台の右上に寄せ、
 * 複数なら横幅いっぱいに並べて 3D の絵を小さくする。
 */
export function EnemyRow({
  enemies,
  events,
  defeatDelay,
  agentId,
  previews,
  highlighted,
  onSelect,
  registerView,
}: EnemyRowProps) {
  const [width, setWidth] = useState(0);
  const solo = enemies.length === 1;
  const perEnemy = width / enemies.length - SPACING.sm;
  const figureSize = solo || width === 0 ? ACTOR_FIGURE.size : Math.min(ACTOR_FIGURE.size, perEnemy);

  return (
    <View
      style={[styles.row, solo && styles.solo]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {enemies.map((enemy) => (
        <EnemyPanel
          key={enemy.uid}
          enemy={enemy}
          events={events}
          defeatDelay={defeatDelay}
          agentId={agentId}
          figureSize={figureSize}
          preview={previews.find((p) => p.uid === enemy.uid)}
          highlighted={highlighted.includes(enemy.uid)}
          onSelect={onSelect ? () => onSelect(enemy.uid) : undefined}
          viewRef={(node) => registerView(enemy.uid, node)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  /** 1 体だけのときは右上に寄せ、左下のエージェントと斜めに向かい合う。 */
  solo: { alignSelf: 'flex-end', width: '60%' },
});
