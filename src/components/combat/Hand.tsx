import { useState } from 'react';
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
  /** カードを離した位置が手札より上かを判定するため、外枠の View を渡す。 */
  viewRef: (node: View | null) => void;
  /** カード幅が決まったら知らせる（持ち上げたカードを同じ大きさで描くため）。 */
  onCardWidth: (width: number) => void;
  style?: StyleProp<ViewStyle>;
};

/** 5 枚でちょうど画面幅に収まるカード幅にし、それ以上は横にスクロールして見る。 */
export function Hand({
  cards,
  isPlayable,
  draggingId,
  viewRef,
  onCardWidth,
  style,
  ...handlers
}: HandProps) {
  const [width, setWidth] = useState(0);
  const cardWidth = handCardWidth(width);
  const overflowing = cards.length > HAND_LAYOUT.visibleCards;

  return (
    <View
      ref={viewRef}
      style={[styles.container, { minHeight: cardWidth * HAND_LAYOUT.aspectRatio }, style]}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        setWidth(next);
        onCardWidth(handCardWidth(next));
      }}
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
});
