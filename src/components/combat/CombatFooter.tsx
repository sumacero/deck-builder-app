import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type CombatFooterProps = {
  drawCount: number;
  discardCount: number;
  canEndTurn: boolean;
  onEndTurn: () => void;
  onOpenDraw: () => void;
  onOpenDiscard: () => void;
  /** 横向きでは手札の横に置くので、ボタンの下に山札・捨て札を並べる。 */
  vertical?: boolean;
};

export function CombatFooter({
  drawCount,
  discardCount,
  canEndTurn,
  onEndTurn,
  onOpenDraw,
  onOpenDiscard,
  vertical = false,
}: CombatFooterProps) {
  const endTurn = (
    <Pressable
      onPress={onEndTurn}
      disabled={!canEndTurn}
      style={({ pressed }) => [
        styles.endTurn,
        vertical ? styles.endTurnVertical : styles.endTurnRow,
        !canEndTurn && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.endTurnText}>ターン終了</Text>
    </Pressable>
  );
  const draw = <PileCounter label="山札" count={drawCount} onPress={onOpenDraw} />;
  const discard = <PileCounter label="捨て札" count={discardCount} onPress={onOpenDiscard} />;

  if (vertical) {
    return (
      <View style={styles.column}>
        {endTurn}
        <View style={styles.row}>
          {draw}
          {discard}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {draw}
      {endTurn}
      {discard}
    </View>
  );
}

function PileCounter({
  label,
  count,
  onPress,
}: {
  label: string;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pile, pressed && styles.pressed]}>
      <Text style={styles.pileCount}>{count}</Text>
      <Text style={styles.pileLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  column: { gap: SPACING.xs, justifyContent: 'center' },
  pile: { width: 64, alignItems: 'center', paddingVertical: SPACING.xs },
  pileCount: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  pileLabel: { color: COLORS.textMuted, fontSize: 11 },
  endTurn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  endTurnRow: { flex: 1, marginHorizontal: SPACING.md },
  endTurnVertical: { alignSelf: 'stretch' },
  endTurnText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
