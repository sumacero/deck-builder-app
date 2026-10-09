import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { CardInstance } from '../../domain/card';
import type { CombatEvent } from '../../domain/combat';
import { COLORS, HAND_LAYOUT, SPACING } from '../../theme';
import { type CardDragHandlers, DraggableCard } from './DraggableCard';
import { HandFullEffect } from './effects/HandFullEffect';
import { handCardSpacing, handCardWidth } from './handLayout';

type HandProps = CardDragHandlers & {
  cards: CardInstance[];
  /** 手札がいっぱいで引けなかった演出に使う。 */
  events: CombatEvent[];
  isPlayable: (instanceId: string) => boolean;
  /** 印のあるカードを、ターンをまたいで残す。 */
  onTogglePin: (instanceId: string) => void;
  /** 持ち上げている最中のカード。 */
  draggingId: string | null;
  /** タップして、狙う敵を選んでいる最中のカード。 */
  selectedId: string | null;
  /** カードを離した位置が手札より上かを判定するため、外枠の View を渡す。 */
  viewRef: (node: View | null) => void;
  /** カード幅が決まったら知らせる（持ち上げたカードを同じ大きさで描くため）。 */
  onCardWidth: (width: number) => void;
  /** カードの高さの上限（横向きで画面が低いとき）。 */
  maxCardHeight?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * 5 枚でちょうど画面幅に収まるカード幅にし、それより多いときはカードを重ねて全部を幅に収める。
 * 触れた瞬間にカードをつまむ操作と横スクロールはぶつかるので、スクロールはしない。
 */
export function Hand({
  cards,
  events,
  isPlayable,
  onTogglePin,
  draggingId,
  selectedId,
  viewRef,
  onCardWidth,
  maxCardHeight = Number.POSITIVE_INFINITY,
  style,
  ...handlers
}: HandProps) {
  const [width, setWidth] = useState(0);
  const cardWidth = handCardWidth(width, maxCardHeight);
  const spacing = handCardSpacing(width, cardWidth, cards.length);
  useEffect(() => {
    onCardWidth(cardWidth);
  }, [cardWidth, onCardWidth]);

  return (
    <View
      ref={viewRef}
      style={[styles.container, { minHeight: cardWidth * HAND_LAYOUT.aspectRatio }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <HandFullEffect events={events} handSize={cards.length}>
        {cards.length === 0 ? (
          <Text style={styles.emptyText}>手札がありません</Text>
        ) : (
          cardWidth > 0 && (
            <View style={styles.row}>
              {cards.map(({ instanceId, card, pinned }, i) => (
                <View key={instanceId} style={[styles.slot, i > 0 && { marginLeft: spacing }, { zIndex: i }]}>
                  {card.mark && (
                    <Pressable
                      onPress={() => onTogglePin(instanceId)}
                      hitSlop={6}
                      style={[styles.pin, pinned && styles.pinOn]}
                    >
                      <Text style={[styles.pinText, pinned && styles.pinTextOn]}>留</Text>
                    </Pressable>
                  )}
                  <DraggableCard
                    instanceId={instanceId}
                    card={card}
                    width={cardWidth}
                    playable={isPlayable(instanceId)}
                    dragging={draggingId === instanceId}
                    selected={selectedId === instanceId}
                    pinned={pinned === true}
                    {...handlers}
                  />
                </View>
              ))}
            </View>
          )
        )}
      </HandFullEffect>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: HAND_LAYOUT.edgePadding,
    paddingTop: HAND_LAYOUT.topPadding,
    paddingBottom: SPACING.xs,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  slot: { position: 'relative' },
  /** 次のカードは右から重なるので、留めは左上に置く。ドラッグの判定の外。 */
  pin: {
    position: 'absolute',
    top: 0,
    left: 2,
    zIndex: 20,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOn: { backgroundColor: COLORS.gold },
  pinText: { color: COLORS.gold, fontSize: 10, fontWeight: '800' },
  pinTextOn: { color: COLORS.onGold },
});
