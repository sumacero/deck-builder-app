import { ALL_BLESSINGS, ALL_EVENTS, ALL_RELICS, CATALOG_POTIONS } from '../../data/catalog';
import type { BlessingGroup } from '../../domain/blessing';
import {
  type EffectLine,
  describeBlessing,
  describeEventOption,
  describePotion,
  describeRelic,
} from '../../logic/describe';

/** 図鑑の 1 行分の表示内容。 */
export type CatalogItem = {
  key: string;
  icon?: string;
  title: string;
  badge?: string;
  text?: string;
  lines?: EffectLine[];
};

const plain = (text: string): EffectLine => ({ text, negative: false });

export const RELIC_ITEMS: CatalogItem[] = ALL_RELICS.map((relic) => ({
  key: relic.id,
  icon: relic.icon,
  title: relic.name,
  badge: relic.rarity === 'boss' ? 'ボス' : undefined,
  lines: [plain(describeRelic(relic))],
}));

export const POTION_ITEMS: CatalogItem[] = CATALOG_POTIONS.map((potion) => ({
  key: potion.id,
  icon: potion.icon,
  title: potion.name,
  lines: [plain(describePotion(potion))],
}));

/** イベントは導入文と、選択肢ごとの「ラベル: 効果」。 */
export const EVENT_ITEMS: CatalogItem[] = ALL_EVENTS.map((event) => ({
  key: event.id,
  icon: event.icon,
  title: event.title,
  text: event.text,
  lines: event.options.map((option) => {
    const effects = describeEventOption(option);
    const detail = effects.map((line) => line.text).join('、');
    return {
      text: detail ? `${option.label}: ${detail}` : option.label,
      negative: effects.some((line) => line.negative),
    };
  }),
}));

const BLESSING_GROUP_LABEL: Record<BlessingGroup, string> = {
  deck: 'デッキの恩恵',
  resource: '資源の恩恵',
  tradeoff: '代償つきの恩恵',
};

export const BLESSING_ITEMS: CatalogItem[] = ALL_BLESSINGS.map((blessing) => ({
  key: blessing.id,
  icon: '✨',
  title: BLESSING_GROUP_LABEL[blessing.group],
  lines: describeBlessing(blessing),
}));
