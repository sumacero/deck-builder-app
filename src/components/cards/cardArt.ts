import type { ImageSourcePropType } from 'react-native';
import type { CardDefinition, CardType } from '../../domain/card';
import { baseCardId } from '../../logic/cards';

/**
 * カード id（強化前）ごとのイラスト。ドメインの CardDefinition は画像を知らないよう、UI 側で対応付ける。
 * 画像は AI 画像生成で作り、scripts/resize-card-art.mjs で 320×240 に縮小している。
 */
const CARD_ART: Record<string, ImageSourcePropType> = {
  strike: require('../../../assets/cards/strike.jpg'),
  defend: require('../../../assets/cards/defend.jpg'),
  'twin-strike': require('../../../assets/cards/twin-strike.jpg'),
  'pommel-strike': require('../../../assets/cards/pommel-strike.jpg'),
  'iron-wave': require('../../../assets/cards/iron-wave.jpg'),
  'heavy-blade': require('../../../assets/cards/heavy-blade.jpg'),
  'sword-boomerang': require('../../../assets/cards/sword-boomerang.jpg'),
  clothesline: require('../../../assets/cards/clothesline.jpg'),
  hemokinesis: require('../../../assets/cards/hemokinesis.jpg'),
  anger: require('../../../assets/cards/anger.jpg'),
  cleave: require('../../../assets/cards/cleave.jpg'),
  thunderclap: require('../../../assets/cards/thunderclap.jpg'),
  whirlwind: require('../../../assets/cards/whirlwind.jpg'),
  'shrug-it-off': require('../../../assets/cards/shrug-it-off.jpg'),
  'seeing-red': require('../../../assets/cards/seeing-red.jpg'),
  bloodletting: require('../../../assets/cards/bloodletting.jpg'),
  'battle-trance': require('../../../assets/cards/battle-trance.jpg'),
  offering: require('../../../assets/cards/offering.jpg'),
  flex: require('../../../assets/cards/flex.jpg'),
  inflame: require('../../../assets/cards/inflame.jpg'),
  metallicize: require('../../../assets/cards/metallicize.jpg'),
};

/** イラストの隅に重ねる種類の紋章。小さな手札でも種類がひと目で分かるように。 */
export const CARD_TYPE_EMBLEM: Record<CardType, string> = {
  attack: '⚔️',
  skill: '🛡️',
  power: '✨',
};

/** 強化後のカードも強化前と同じ絵。絵が無いカードは undefined（種類の色だけの枠になる）。 */
export function cardArt(card: CardDefinition): ImageSourcePropType | undefined {
  return CARD_ART[baseCardId(card.id)];
}
