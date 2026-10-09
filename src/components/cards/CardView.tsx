import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { cardAttributes } from '../../logic/attribute';
import { MARK_NAME } from '../../logic/marks';
import {
  ATTRIBUTE_ICON,
  CARD_RARITY_LABEL,
  CARD_TYPE_LABEL,
  describeAttributes,
  describeCard,
} from '../../logic/describe';
import {
  ATTRIBUTE_COLORS,
  ATTRIBUTE_TINT_ALPHA,
  CARD_ART,
  CARD_TYPE_COLORS,
  COLORS,
  HAND_LAYOUT,
  RADIUS,
  RELIC_RARITY_COLORS,
  SPACING,
} from '../../theme';
import { CardDetailSheet } from './CardDetailSheet';
import { CARD_TYPE_EMBLEM, cardArt } from './cardArt';

type CardViewProps = {
  card: CardDefinition;
  count?: number;
  dimmed?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md';
  /** 指定すると size より優先し、幅に合わせて文字も縮める（手札用）。 */
  width?: number;
  /** 印を留めて手札に残している。 */
  pinned?: boolean;
  onPress?: () => void;
  /** 長押しで用語の解説を出す。解説の中の拡大表示では false。 */
  detailOnHold?: boolean;
};

const LONG_PRESS_MS = 350;

const BASE_WIDTH = 96;
/** これより細いカードでは種類の横の属性名を省く（絵の隅の紋章で分かる）。 */
const NARROW_WIDTH = 90;
const WIDE_WIDTH = 108;
const BORDER_WIDTH = 2;
const ART_INSET = 3;

const artHeight = (width: number) => Math.round(width * CARD_ART.heightRatio);

/** 半角文字は全角のおよそ 6 割の幅。 */
const HALF_WIDTH_EM = 0.6;
const MIN_NAME_FONT = 7;

/** 文字列の幅を、全角 1 文字 = 1em として見積もる。 */
function textEm(text: string): number {
  let em = 0;
  for (const ch of text) em += (ch.codePointAt(0) ?? 0) < 0x2000 ? HALF_WIDTH_EM : 1;
  return em;
}

/**
 * 細いカードでも名前が「…」で切れないよう、1 行に収まる大きさまで縮める。
 * adjustsFontSizeToFit は Web では効かないので、文字数から計算する。
 */
function nameFontSize(name: string, width: number, base: number): number {
  const available = width - BORDER_WIDTH * 2 - NAME_LEFT_INSET - NAME_RIGHT_INSET;
  return Math.max(MIN_NAME_FONT, Math.min(base, Math.floor(available / textEm(name))));
}

/** 幅に合わせた文字サイズ。小さくなりすぎないよう下限を設ける。 */
function scaledStyles(width: number, name: string) {
  const scale = Math.min(1, width / BASE_WIDTH);
  return {
    card: {
      width,
      minHeight: Math.round(width * HAND_LAYOUT.aspectRatio),
    },
    art: { height: artHeight(width) },
    body: { paddingHorizontal: Math.max(2, SPACING.xs * scale) },
    name: {
      fontSize: nameFontSize(name, width, Math.max(9, 12 * scale)),
      paddingLeft: NAME_LEFT_INSET,
      paddingRight: NAME_RIGHT_INSET,
    },
    emblemText: { fontSize: Math.max(9, 12 * scale) },
    attributeBadge: { width: Math.max(14, 20 * scale), height: Math.max(14, 20 * scale) },
    attributeIcon: { fontSize: Math.max(8, 12 * scale) },
    type: { fontSize: Math.max(8, 10 * scale) },
    description: { fontSize: Math.max(9, 11 * scale) },
  };
}

export function CardView({
  card,
  count,
  dimmed = false,
  selected = false,
  size = 'sm',
  width,
  pinned = false,
  onPress,
  detailOnHold = true,
}: CardViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const typeColor = card.mysticArte ? COLORS.arte : CARD_TYPE_COLORS[card.type];
  const attributes = cardAttributes(card);
  const attributeColor = card.mysticArte ? COLORS.arte : card.attribute && ATTRIBUTE_COLORS[card.attribute];
  // 属性のカードは枠を属性の色に。無属性は種類の色のまま。
  const frameColor = attributeColor ?? typeColor;
  const narrow = width !== undefined && width < NARROW_WIDTH;
  // 手札（幅を指定して並べる）では種類の行が足りないので出さない。報酬・ショップ・図鑑・詳細で見せる。
  const showRarity = width === undefined && card.type !== 'status' && !card.arrow;
  const wide = size === 'md' && width === undefined;
  const scaled = width !== undefined ? scaledStyles(width, card.name) : null;
  const art = cardArt(card);
  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={detailOnHold ? () => setDetailOpen(true) : undefined}
        delayLongPress={LONG_PRESS_MS}
        disabled={!onPress && !detailOnHold}
        style={({ pressed }) => [
          styles.card,
          wide && styles.wide,
          scaled?.card,
          { borderColor: selected ? COLORS.gold : frameColor },
          selected && styles.selected,
          pressed && onPress && styles.pressed,
        ]}
      >
        <Text
          style={[styles.name, scaled?.name, card.upgraded && styles.upgradedName]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {card.name}
        </Text>
        <View
          style={[
            styles.art,
            wide && styles.wideArt,
            scaled?.art,
            { borderColor: frameColor },
            !art && { backgroundColor: `${typeColor}${CARD_ART.fallbackAlpha}` },
          ]}
        >
          {art && <Image source={art} style={styles.artImage} resizeMode="cover" />}
          {attributes.length > 0 && attributeColor !== undefined && (
            <View
              style={[styles.attributeBadge, scaled?.attributeBadge, { backgroundColor: attributeColor }]}
            >
              <Text style={[styles.attributeIcon, scaled?.attributeIcon]}>
                {describeAttributes(attributes, true) || ATTRIBUTE_ICON[attributes[0]]}
              </Text>
            </View>
          )}
          {card.mark && (
            <View style={styles.markBadge}>
              <Text style={[styles.markText, scaled?.emblemText]}>{MARK_NAME[card.mark]}</Text>
            </View>
          )}
          {pinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>留</Text>
            </View>
          )}
          <View style={styles.emblem}>
            <Text style={[styles.emblemText, scaled?.emblemText]}>
              {CARD_TYPE_EMBLEM[card.type]}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.body,
            wide && styles.wideBody,
            scaled?.body,
            attributeColor !== undefined && { backgroundColor: blend(attributeColor) },
          ]}
        >
          <Text style={[styles.type, scaled?.type, { color: typeColor }]} numberOfLines={1}>
            {CARD_TYPE_LABEL[card.type]}
            {attributes.length > 0 && !narrow && (
              <Text style={[styles.attribute, attributeColor !== undefined && { color: attributeColor }]}>
                {' '}
                {describeAttributes(attributes)}
              </Text>
            )}
          </Text>
          {showRarity && (
            <Text style={[styles.rarity, { color: RELIC_RARITY_COLORS[card.rarity] }]}>
              {CARD_RARITY_LABEL[card.rarity]}
            </Text>
          )}
          <Text style={[styles.description, scaled?.description]}>{describeCard(card)}</Text>
        </View>
        <View style={styles.costGem}>
          <Text style={styles.costText}>{card.unplayable ? '✕' : card.cost}</Text>
        </View>
        {count !== undefined && count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>×{count}</Text>
          </View>
        )}
        {dimmed && <View pointerEvents="none" style={styles.dim} />}
      </Pressable>
      {detailOpen && <CardDetailSheet card={card} visible onClose={() => setDetailOpen(false)} />}
    </>
  );
}

const GEM_SIZE = 24;
const BADGE_SIZE = 20;
/** 左上のコストの宝石がカードの内側に食い込む幅。名前はその右から始める。 */
const NAME_LEFT_INSET = GEM_SIZE - SPACING.sm - BORDER_WIDTH;
const NAME_RIGHT_INSET = 2;

/** 属性の色を本文の背景にうっすら敷く。 */
const blend = (color: string) => `${color}${ATTRIBUTE_TINT_ALPHA}`;

const styles = StyleSheet.create({
  card: {
    width: BASE_WIDTH,
    minHeight: 132,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTH,
    borderRadius: RADIUS.md,
    paddingBottom: SPACING.sm,
  },
  wide: { width: WIDE_WIDTH, minHeight: 168 },
  selected: { borderWidth: 3 },
  /** はみ出すコストの宝石まで覆う。カードの不透明度は下げない。 */
  dim: {
    position: 'absolute',
    top: -SPACING.sm,
    right: -SPACING.xs,
    bottom: 0,
    left: -SPACING.sm,
    backgroundColor: COLORS.cardDim,
    borderRadius: RADIUS.md,
  },
  pressed: { transform: [{ translateY: -8 }] },
  art: {
    height: artHeight(BASE_WIDTH),
    marginHorizontal: ART_INSET,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.panel,
  },
  wideArt: { height: artHeight(WIDE_WIDTH) },
  artImage: { width: '100%', height: '100%' },
  markBadge: {
    position: 'absolute',
    left: 2,
    bottom: 1,
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.round,
    paddingHorizontal: 3,
  },
  markText: { color: COLORS.gold, fontSize: 10, fontWeight: '800' },
  pinnedBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.round,
    paddingHorizontal: 3,
  },
  pinnedText: { color: COLORS.onGold, fontSize: 10, fontWeight: '800' },
  emblem: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    backgroundColor: COLORS.cardEmblemBg,
    borderRadius: RADIUS.round,
    paddingHorizontal: 2,
  },
  emblemText: { fontSize: 12 },
  attributeBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributeIcon: { fontSize: 12 },
  body: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs / 2,
    paddingTop: SPACING.xs / 2,
    paddingBottom: SPACING.xs / 2,
    paddingHorizontal: SPACING.xs,
    marginTop: 2,
    marginHorizontal: ART_INSET,
    borderRadius: RADIUS.sm,
  },
  wideBody: { paddingHorizontal: SPACING.sm, gap: SPACING.xs },
  costGem: {
    position: 'absolute',
    top: -SPACING.sm,
    left: -SPACING.sm,
    width: GEM_SIZE,
    height: GEM_SIZE,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.goldDark,
    borderWidth: 1.5,
    borderColor: COLORS.energy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costText: { color: COLORS.energy, fontSize: 13, fontWeight: '800' },
  countBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: { color: COLORS.onGold, fontSize: 11, fontWeight: '800' },
  name: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 2,
    paddingBottom: 1,
    paddingHorizontal: GEM_SIZE / 2,
  },
  upgradedName: { color: COLORS.upgraded },
  type: { fontSize: 10, fontWeight: '600' },
  rarity: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  attribute: { color: COLORS.text, fontWeight: '800' },
  description: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
});
