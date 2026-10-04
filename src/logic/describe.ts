import type { BlessingChoice, BlessingDefinition, BlessingEffect } from '../domain/blessing';
import type { CardDefinition, CardType } from '../domain/card';
import type { Effect } from '../domain/effect';
import type { EnemyAction, EnemyMove, EnemyRank } from '../domain/enemy';
import type { MapNodeType } from '../domain/map';
import type { PotionDefinition } from '../domain/potion';
import type { RelicDefinition } from '../domain/relic';

export const MAP_NODE_LABEL: Record<MapNodeType, string> = {
  enemy: '敵',
  elite: 'エリート',
  rest: '休憩所',
  shop: 'ショップ',
  event: 'イベント',
  treasure: '宝箱',
  boss: 'ボス',
};

export const CARD_TYPE_LABEL: Record<CardType, string> = {
  attack: 'アタック',
  skill: 'スキル',
  power: 'パワー',
};

function describeEffect(effect: Effect): string {
  switch (effect.kind) {
    case 'damage':
      return effect.hits && effect.hits > 1
        ? `${effect.amount} ダメージを ${effect.hits} 回与える。`
        : `${effect.amount} ダメージを与える。`;
    case 'block':
      return `ブロック ${effect.amount} を得る。`;
    case 'gainEnergy':
      return `エナジー ${effect.amount} を得る。`;
    case 'draw':
      return `カードを ${effect.amount} 枚引く。`;
    case 'heal':
      return `HP を ${effect.amount} 回復する。`;
    case 'loseHp':
      return `HP を ${effect.amount} 失う。`;
    case 'gainStrength':
      return effect.duration === 'turn'
        ? `このターン、筋力 ${effect.amount} を得る。`
        : `筋力 ${effect.amount} を得る。`;
    case 'gainEndTurnBlock':
      return `ターン終了時、ブロック ${effect.amount} を得る。`;
  }
}

const describeEffects = (effects: Effect[]) => effects.map(describeEffect).join('');

export function describeCard(card: CardDefinition): string {
  const extras = [
    card.addCopyToDiscard ? 'このカードのコピーを捨て札に加える。' : '',
    card.exhaust ? '廃棄。' : '',
  ].join('');
  return describeEffects(card.effects) + extras;
}

export function describePotion(potion: PotionDefinition): string {
  return describeEffects(potion.effects);
}

function relicTiming(relic: RelicDefinition): string {
  switch (relic.trigger) {
    case 'combatStart':
      return '戦闘開始時、';
    case 'turnEnd':
      return relic.condition === 'noBlock' ? 'ターン終了時にブロックが 0 なら、' : 'ターン終了時、';
    case 'combatWon':
      return '戦闘に勝利したとき、';
  }
}

export function describeRelic(relic: RelicDefinition): string {
  return relicTiming(relic) + relic.effects.map(describeEffect).join('');
}

export type IntentView = {
  key: string;
  tone: EnemyAction['kind'];
  icon: string;
  label: string;
};

/** strength は敵の今の筋力。攻撃の数値は筋力込みで見せる。 */
export function describeIntent(move: EnemyMove, strength: number): IntentView[] {
  return move.actions.map((action, index) => {
    const key = `${move.id}-${index}`;
    switch (action.kind) {
      case 'attack': {
        const damage = Math.max(0, action.damage + strength);
        return {
          key,
          tone: action.kind,
          icon: '⚔️',
          label: action.hits > 1 ? `${damage}×${action.hits}` : `${damage}`,
        };
      }
      case 'block':
        return { key, tone: action.kind, icon: '🛡️', label: `${action.amount}` };
      case 'buff':
        return { key, tone: action.kind, icon: '💪', label: `+${action.strength}` };
    }
  });
}

export const ENEMY_RANK_LABEL: Record<EnemyRank, string | null> = {
  normal: null,
  elite: 'エリート',
  boss: 'ボス',
};

function describeBlessingEffect(effect: BlessingEffect): string {
  switch (effect.kind) {
    case 'gainMaxHp':
      return `最大 HP +${effect.amount}`;
    case 'loseMaxHp':
      return `最大 HP -${effect.amount}`;
    case 'gainGold':
      return `${effect.amount} ゴールドを得る`;
    case 'gainRelic':
      return 'ランダムなレリックを得る';
    case 'upgradeRandom':
      return `ランダムなカード ${effect.count} 枚を強化`;
    case 'fillPotions':
      return '空いているポーション枠をすべて埋める';
  }
}

const BLESSING_CHOICE_TEXT: Record<BlessingChoice, string> = {
  upgradeCard: 'カードを 1 枚選んで強化',
  removeCard: 'カードを 1 枚選んで削除',
  pickCard: '3 枚から 1 枚を選んでデッキに加える',
};

export type BlessingLine = { text: string; negative: boolean };

/** 恩恵の内容を 1 行ずつ。同じ効果が重なる場合は「×2」にまとめる。代償（マイナス効果）は negative。 */
export function describeBlessing(blessing: BlessingDefinition): BlessingLine[] {
  const counted = new Map<string, { negative: boolean; count: number }>();
  for (const effect of blessing.effects) {
    const text = describeBlessingEffect(effect);
    const existing = counted.get(text);
    if (existing) existing.count += 1;
    else counted.set(text, { negative: effect.kind === 'loseMaxHp', count: 1 });
  }
  const lines = [...counted].map(([text, { negative, count }]) => ({
    text: count > 1 ? `${text} ×${count}` : text,
    negative,
  }));
  return blessing.choice
    ? [...lines, { text: BLESSING_CHOICE_TEXT[blessing.choice], negative: false }]
    : lines;
}
