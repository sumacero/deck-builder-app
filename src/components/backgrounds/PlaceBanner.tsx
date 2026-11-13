import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { COLORS, RADIUS } from '../../theme';

type PlaceBannerProps = {
  source: ImageSourcePropType;
};

/** 出来事や店の絵。文章の上に置き、背景ごと見せる。全面の暗い幕は掛けない。 */
export function PlaceBanner({ source }: PlaceBannerProps) {
  return <Image source={source} resizeMode="cover" style={styles.banner} />;
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'stretch',
    height: 240,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    backgroundColor: COLORS.panel,
  },
});
