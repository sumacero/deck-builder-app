import type { CardDefinition, CardRarity } from './card';
import type { EnemyRank } from './enemy';
import type { PotionDefinition } from './potion';
import type { RelicDefinition, RelicTier } from './relic';

/** ショップに並ぶ 1 品。買うと sold になり、同じ店では二度と買えない。 */
export type ShopOffer<T> = {
  offerId: string;
  item: T;
  price: number;
  sold: boolean;
};

export type ShopStock = {
  cards: ShopOffer<CardDefinition>[];
  relics: ShopOffer<RelicDefinition>[];
  potions: ShopOffer<PotionDefinition>[];
  /** カード削除サービス。1 店につき 1 回。 */
  removal: { price: number; used: boolean };
};

/** ゴールドの入手量と値段の設定。 */
export type EconomyConfig = {
  startingGold: number;
  /** 戦闘に勝ったときのゴールド。敵の格で変わる。 */
  encounterGold: Record<EnemyRank, { min: number; max: number }>;
  /** レリックの候補が尽きていたとき、代わりにもらえるゴールド。 */
  relicFallbackGold: number;
  /** カードの値段（レア度ごと）。 */
  cardPrice: Record<CardRarity, number>;
  /** カードのレア度の出現しやすさ（重み）。戦闘報酬・カード選択・ショップで共通。 */
  cardTierWeight: Record<CardRarity, number>;
  /** レリックの値段（レア度ごと）。 */
  relicPrice: Record<RelicTier, number>;
  /** レリックのレア度の出現しやすさ（重み）。エリート・宝箱・ショップ・イベントで共通。 */
  relicTierWeight: Record<RelicTier, number>;
  potionPrice: number;
  /** 以前の通常戦報酬（強化の代わりのゴールド）。新しい戦闘では出さない。進行中のその画面だけが読む。 */
  growthGold: number;
  /** 0.1 なら基準価格の ±10% の範囲でばらつく。 */
  priceVariance: number;
  /** カード削除は使うたびに removalPriceStep ずつ値上がりする（ランを通して）。 */
  removalBasePrice: number;
  removalPriceStep: number;
  shopCardCount: number;
  shopRelicCount: number;
  shopPotionCount: number;
  /** 宝箱に入っているゴールド（レリックと一緒にもらえる）。 */
  treasureGold: { min: number; max: number };
  /**
   * 戦闘に勝ったとき、カード報酬のあとにポーションの 3 択が出る確率。
   * 0.3 なら 10 戦中およそ 3 戦。通常戦・エリート・ボスで同じ。外れた戦闘はカードだけで終わる。
   */
  potionDropChance: number;
};
