import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { ShopOffer } from '../../domain/shop';
import { COLORS, SPACING } from '../../theme';
import { CardView } from '../cards/CardView';
import { useGlossaryAnchor, type WindowRect } from '../glossary/CardGlossaryPopover';
import { PriceTag } from './PriceTag';

type ShopCardOfferProps = {
  offer: ShopOffer<CardDefinition>;
  affordable: boolean;
  selected: boolean;
  /** エージェントと違う属性のカード（報酬には出ず、ここでしか買えない）。 */
  exclusive: boolean;
  onPress: () => void;
  /** 選ばれているとき、カードの画面上の位置を知らせる。 */
  onAnchor?: (rect: WindowRect) => void;
  onMeasure?: (measure: () => void) => void;
};

export function ShopCardOffer({
  offer,
  affordable,
  selected,
  exclusive,
  onPress,
  onAnchor,
  onMeasure,
}: ShopCardOfferProps) {
  const { ref, measure } = useGlossaryAnchor(selected && onAnchor !== undefined, onAnchor ?? (() => {}));
  useEffect(() => {
    if (measure && onMeasure) onMeasure(measure);
  }, [measure, onMeasure]);
  return (
    <View style={styles.root}>
      <View ref={ref} collapsable={false} onLayout={() => measure?.()}>
        <CardView
          card={offer.item}
          selected={selected}
          dimmed={offer.sold}
          onPress={offer.sold ? undefined : onPress}
        />
      </View>
      {exclusive && <Text style={styles.exclusive}>ショップ限定</Text>}
      <PriceTag price={offer.price} affordable={affordable} sold={offer.sold} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: SPACING.sm },
  exclusive: { color: COLORS.weakness, fontSize: 11, fontWeight: '800' },
});
