import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

type CombatFooterProps = {
  drawCount: number;
  discardCount: number;
  exhaustCount: number;
  canEndTurn: boolean;
  onEndTurn: () => void;
  onOpenDraw: () => void;
  onOpenDiscard: () => void;
  onOpenExhaust: () => void;
  /** 横向きでは手札の横に置くので、ボタンの下に山札・捨て札・廃棄札を並べる。 */
  vertical?: boolean;
};

export function CombatFooter({
  drawCount,
  discardCount,
  exhaustCount,
  canEndTurn,
  onEndTurn,
  onOpenDraw,
  onOpenDiscard,
  onOpenExhaust,
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
  const draw = <PileCounter label="山札" count={drawCount} onPress={onOpenDraw} fill={vertical} />;
  const discard = <PileCounter label="捨て札" count={discardCount} onPress={onOpenDiscard} fill={vertical} />;
  const exhaust = <PileCounter label="廃棄札" count={exhaustCount} onPress={onOpenExhaust} fill={vertical} />;

  if (vertical) {
    return (
      <View style={styles.column}>
        {endTurn}
        <View style={styles.row}>
          {draw}
          {discard}
          {exhaust}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {draw}
      {endTurn}
      {discard}
      {exhaust}
    </View>
  );
}

function PileCounter({
  label,
  count,
  onPress,
  fill,
}: {
  label: string;
  count: number;
  onPress: () => void;
  /** 横向きの狭い列では幅を固定せず、3 つで均等に分ける。 */
  fill: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pile, fill && styles.pileFill, pressed && styles.pressed]}>
      <Text style={styles.pileCount}>{count}</Text>
      <Text style={styles.pileLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  column: { gap: SPACING.xs, justifyContent: 'center' },
  pile: { width: 56, alignItems: 'center', paddingVertical: SPACING.xs },
  pileFill: { width: undefined, flex: 1 },
  pileCount: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  pileLabel: { color: COLORS.textMuted, fontSize: 11 },
  endTurn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  endTurnRow: { flex: 1, marginHorizontal: SPACING.sm },
  endTurnVertical: { alignSelf: 'stretch' },
  endTurnText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
