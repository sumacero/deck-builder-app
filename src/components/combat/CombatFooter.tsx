import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

export type CombatPile = 'draw' | 'discard' | 'exhaust';

type CombatFooterProps = {
  drawCount: number;
  discardCount: number;
  exhaustCount: number;
  canEndTurn: boolean;
  onEndTurn: () => void;
  onOpenDraw: () => void;
  onOpenDiscard: () => void;
  onOpenExhaust: () => void;
  /** 札が飛んでいく先を測るため、山札・捨て札・廃棄札の枠を渡す。 */
  onPileRef: (pile: CombatPile, node: View | null) => void;
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
  onPileRef,
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
  const draw = (
    <PileCounter pile="draw" label="山札" count={drawCount} onPress={onOpenDraw} fill={vertical} onPileRef={onPileRef} />
  );
  const discard = (
    <PileCounter
      pile="discard"
      label="捨て札"
      count={discardCount}
      onPress={onOpenDiscard}
      fill={vertical}
      onPileRef={onPileRef}
    />
  );
  const exhaust = (
    <PileCounter
      pile="exhaust"
      label="廃棄札"
      count={exhaustCount}
      onPress={onOpenExhaust}
      fill={vertical}
      onPileRef={onPileRef}
    />
  );

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
  pile,
  label,
  count,
  onPress,
  fill,
  onPileRef,
}: {
  pile: CombatPile;
  label: string;
  count: number;
  onPress: () => void;
  /** 横向きの狭い列では幅を固定せず、3 つで均等に分ける。 */
  fill: boolean;
  onPileRef: (pile: CombatPile, node: View | null) => void;
}) {
  const viewRef = useCallback((node: View | null) => onPileRef(pile, node), [onPileRef, pile]);
  return (
    <View ref={viewRef} collapsable={false} style={[styles.pile, fill && styles.pileFill]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pileHit, pressed && styles.pressed]}>
        <Text style={styles.pileCount}>{count}</Text>
        <Text style={styles.pileLabel} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  column: { gap: SPACING.xs, justifyContent: 'center' },
  pile: { width: 56, alignItems: 'center', paddingVertical: SPACING.xs },
  pileFill: { width: undefined, flex: 1 },
  pileHit: { alignItems: 'center', alignSelf: 'stretch' },
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
