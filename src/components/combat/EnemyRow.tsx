import { StyleSheet, View } from 'react-native';
import type { CombatEvent, DamagePreview, EnemyState, EnemyUid } from '../../domain/combat';
import { SPACING } from '../../theme';
import { EnemyPanel } from './EnemyPanel';

type EnemyRowProps = {
  enemies: EnemyState[];
  events: CombatEvent[];
  defeatDelay: number;
  agentId: string;
  /** 3D の一辺（`stageLayout` で舞台の大きさと敵の数から決める）。0 なら測り終わるまで描かない。 */
  figureSize: number;
  compact: boolean;
  /** 1 体だけのとき、行の幅のどれだけを使うか（右に寄せる）。 */
  soloWidthRatio: number;
  previews: DamagePreview[];
  highlighted: readonly EnemyUid[];
  /** ポーションの対象を選んでいる間だけ渡す。 */
  onSelect?: (uid: EnemyUid) => void;
  registerView: (uid: EnemyUid, node: View | null) => void;
};

/** 敵を左から順に横一列に並べる。1 体なら右に寄せ、自分と斜めに向かい合う。 */
export function EnemyRow({
  enemies,
  events,
  defeatDelay,
  agentId,
  figureSize,
  compact,
  soloWidthRatio,
  previews,
  highlighted,
  onSelect,
  registerView,
}: EnemyRowProps) {
  const solo = enemies.length === 1;
  return (
    <View style={[styles.row, solo && { alignSelf: 'flex-end', width: `${soloWidthRatio * 100}%` }]}>
      {enemies.map((enemy) => (
        <EnemyPanel
          key={enemy.uid}
          enemy={enemy}
          events={events}
          defeatDelay={defeatDelay}
          agentId={agentId}
          figureSize={figureSize}
          compact={compact}
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
});
