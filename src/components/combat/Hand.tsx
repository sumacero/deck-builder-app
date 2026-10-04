import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { CardInstance } from '../../domain/card';
import { COLORS, HAND_LAYOUT, SPACING } from '../../theme';
import { type CardDragHandlers, DraggableCard } from './DraggableCard';
import { handCardWidth } from './handLayout';

type HandProps = CardDragHandlers & {
  cards: CardInstance[];
  isPlayable: (instanceId: string) => boolean;
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

/** 5 枚でちょうど画面幅に収まるカード幅にし、それ以上は横にスクロールして見る。 */
export function Hand({
  cards,
  isPlayable,
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
  const fitting = Math.floor(
    (width - HAND_LAYOUT.edgePadding * 2 + HAND_LAYOUT.gap) / (cardWidth + HAND_LAYOUT.gap),
  );
  const overflowing = cards.length > fitting;
  useEffect(() => {
    onCardWidth(cardWidth);
  }, [cardWidth, onCardWidth]);

  return (
    <View
      ref={viewRef}
      style={[styles.container, { minHeight: cardWidth * HAND_LAYOUT.aspectRatio }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {cards.length === 0 ? (
        <Text style={styles.emptyText}>手札がありません</Text>
      ) : (
        cardWidth > 0 && (
          <ScrollView
            horizontal
            scrollEnabled={draggingId === null}
            showsHorizontalScrollIndicator={overflowing}
            contentContainerStyle={[styles.row, { minWidth: width }]}
          >
            {cards.map(({ instanceId, card }) => (
              <DraggableCard
                key={instanceId}
                instanceId={instanceId}
                card={card}
                width={cardWidth}
                playable={isPlayable(instanceId)}
                dragging={draggingId === instanceId}
                selected={selectedId === instanceId}
                {...handlers}
              />
            ))}
          </ScrollView>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: HAND_LAYOUT.gap,
    paddingHorizontal: HAND_LAYOUT.edgePadding,
    paddingTop: HAND_LAYOUT.topPadding,
    paddingBottom: SPACING.xs,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
});
