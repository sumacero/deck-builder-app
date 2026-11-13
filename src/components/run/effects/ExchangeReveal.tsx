import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { playSound } from '../../../audio/soundPlayer';
import type { CombatEvent } from '../../../domain/combat';
import type { CardDefinition } from '../../../domain/card';
import { COLORS, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';

export type ExchangePair = {
  lost: CardDefinition[];
  gained: CardDefinition;
};

type ExchangeRevealProps = {
  pairs: ExchangePair[];
  onDone: () => void;
};

/** 交換前と交換後を並べる。タップで閉じる。 */
export function ExchangeReveal({ pairs, onDone }: ExchangeRevealProps) {
  useEffect(() => {
    playSound('exchange');
  }, []);

  return (
    <Pressable style={styles.root} onPress={onDone}>
      <Text style={styles.title}>カードを交換した</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pairs}>
        {pairs.map((pair, index) => (
          <View key={`${pair.gained.id}-${index}`} style={styles.pair}>
            <View style={styles.side}>
              <Text style={styles.label}>交換前</Text>
              <View style={styles.cards}>
                {pair.lost.map((card, cardIndex) => (
                  <View key={`${card.id}-${cardIndex}`} style={styles.before}>
                    <CardView card={card} size="md" detailOnHold={false} />
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.side}>
              <Text style={styles.label}>交換後</Text>
              <CardView card={pair.gained} size="md" selected detailOnHold={false} />
            </View>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.hint}>タップで閉じる</Text>
    </Pressable>
  );
}

/** 戦闘中に呪いを変えたとき。しばらく見せて、タップでも閉じる。 */
export function CombatExchange({ events }: { events: readonly CombatEvent[] }) {
  const pairs = events.flatMap((event) =>
    event.kind === 'cardExchanged' ? [{ lost: [event.before], gained: event.after }] : [],
  );
  const token = events
    .filter((event) => event.kind === 'cardExchanged')
    .map((event) => event.id)
    .join(',');
  const [hidden, setHidden] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => setHidden(token), 2600);
    return () => clearTimeout(timer);
  }, [token]);

  if (!token || pairs.length === 0 || hidden === token) return null;
  return <ExchangeReveal pairs={pairs} onDone={() => setHidden(token)} />;
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: { color: COLORS.gold, fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  scroll: { flexGrow: 0, alignSelf: 'stretch' },
  pairs: { gap: SPACING.lg, paddingVertical: SPACING.md },
  pair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  side: { alignItems: 'center', gap: SPACING.xs },
  label: { color: COLORS.keyword, fontSize: 12, fontWeight: '800' },
  cards: { flexDirection: 'row', gap: SPACING.sm },
  before: { opacity: 0.72 },
  arrow: { color: COLORS.gold, fontSize: 26, fontWeight: '800' },
  hint: { color: COLORS.textMuted, fontSize: 13 },
});
