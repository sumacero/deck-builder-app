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
import { CardView } from '../cards/CardView';
import { handCardWidth } from './handLayout';

type HandProps = {
  cards: CardInstance[];
  isPlayable: (instanceId: string) => boolean;
  onPlay: (instanceId: string) => void;
  style?: StyleProp<ViewStyle>;
};

/** 5 枚でちょうど画面幅に収まるカード幅にし、それ以上は横にスクロールして見る。 */
export function Hand({ cards, isPlayable, onPlay, style }: HandProps) {
  const [width, setWidth] = useState(0);
  const cardWidth = handCardWidth(width);
  const overflowing = cards.length > HAND_LAYOUT.visibleCards;

  return (
    <View
      style={[styles.container, { minHeight: cardWidth * HAND_LAYOUT.aspectRatio }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {cards.length === 0 ? (
        <Text style={styles.emptyText}>手札がありません</Text>
      ) : (
        cardWidth > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={overflowing}
            contentContainerStyle={[styles.row, { minWidth: width }]}
          >
            {cards.map(({ instanceId, card }) => (
              <CardView
                key={instanceId}
                card={card}
                width={cardWidth}
                dimmed={!isPlayable(instanceId)}
                onPress={isPlayable(instanceId) ? () => onPlay(instanceId) : undefined}
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
