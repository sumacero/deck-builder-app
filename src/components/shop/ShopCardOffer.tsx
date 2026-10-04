import { StyleSheet, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import type { ShopOffer } from '../../domain/shop';
import { SPACING } from '../../theme';
import { CardView } from '../cards/CardView';
import { PriceTag } from './PriceTag';

type ShopCardOfferProps = {
  offer: ShopOffer<CardDefinition>;
  affordable: boolean;
  selected: boolean;
  onPress: () => void;
};

export function ShopCardOffer({ offer, affordable, selected, onPress }: ShopCardOfferProps) {
  return (
    <View style={styles.root}>
      <CardView
        card={offer.item}
        selected={selected}
        dimmed={offer.sold}
        onPress={offer.sold ? undefined : onPress}
      />
      <PriceTag price={offer.price} affordable={affordable} sold={offer.sold} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: SPACING.sm },
});
