import { StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { ShopOffer } from '../../domain/shop';
import { COLORS, SPACING } from '../../theme';
import { CardView } from '../cards/CardView';
import { PriceTag } from './PriceTag';

type ShopCardOfferProps = {
  offer: ShopOffer<CardDefinition>;
  affordable: boolean;
  selected: boolean;
  /** エージェントと違う属性のカード（報酬には出ず、ここでしか買えない）。 */
  exclusive: boolean;
  onPress: () => void;
};

export function ShopCardOffer({ offer, affordable, selected, exclusive, onPress }: ShopCardOfferProps) {
  return (
    <View style={styles.root}>
      <CardView
        card={offer.item}
        selected={selected}
        dimmed={offer.sold}
        onPress={offer.sold ? undefined : onPress}
      />
      {exclusive && <Text style={styles.exclusive}>ショップ限定</Text>}
      <PriceTag price={offer.price} affordable={affordable} sold={offer.sold} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: SPACING.sm },
  exclusive: { color: COLORS.weakness, fontSize: 11, fontWeight: '800' },
});
