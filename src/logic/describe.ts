import type { BlessingDefinition } from '../domain/blessing';
import type { CardDefinition, CardType } from '../domain/card';
import type { Effect, EffectTarget } from '../domain/effect';
import type { EnemyAction, EnemyMove, EnemyRank } from '../domain/enemy';
import type { EventOption } from '../domain/event';
import type { MapNodeType } from '../domain/map';
import type { PotionDefinition } from '../domain/potion';
import type { RelicDefinition } from '../domain/relic';
import type { RunChoice, RunEffect } from '../domain/runEffect';

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

function describeEffect(effect: Effect, target: EffectTarget): string {
  switch (effect.kind) {
    case 'damage': {
      const whom = target === 'allEnemies' ? '敵全体に' : '';
      return effect.hits && effect.hits > 1
        ? `${whom}${effect.amount} ダメージを ${effect.hits} 回与える。`
        : `${whom}${effect.amount} ダメージを与える。`;
    }
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

const describeEffects = (effects: Effect[], target: EffectTarget) =>
  effects.map((effect) => describeEffect(effect, target)).join('');

export function describeCard(card: CardDefinition): string {
  const extras = [
    card.addCopyToDiscard ? 'このカードのコピーを捨て札に加える。' : '',
    card.exhaust ? '廃棄。' : '',
  ].join('');
  return describeEffects(card.effects, card.target) + extras;
}

export function describePotion(potion: PotionDefinition): string {
  return describeEffects(potion.effects, potion.target);
}

function relicTiming(relic: RelicDefinition): string {
  switch (relic.trigger) {
    case 'combatStart':
      return '戦闘開始時、';
    case 'turnEnd':
      return relic.condition === 'noBlock' ? 'ターン終了時にブロックが 0 なら、' : 'ターン終了時、';
    case 'combatWon':
      return '戦闘に勝利したとき、';
    case undefined:
      return '';
  }
}

export function describeRelic(relic: RelicDefinition): string {
  // レリックは対象を選べないので、ダメージは敵全体に当たる。
  const triggered = relic.trigger
    ? relicTiming(relic) + describeEffects(relic.effects, 'allEnemies')
    : '';
  const passive = (relic.onObtain ?? []).map((effect) => `${describeRunEffect(effect)}。`).join('');
  return triggered + passive;
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

const signed = (amount: number) => (amount >= 0 ? `+${amount}` : `${amount}`);

export function describeRunEffect(effect: RunEffect): string {
  switch (effect.kind) {
    case 'gainMaxHp':
      return `最大 HP +${effect.amount}`;
    case 'loseMaxHp':
      return `最大 HP -${effect.amount}`;
    case 'heal':
      return `HP を ${effect.amount} 回復`;
    case 'loseHp':
      return `HP を ${effect.amount} 失う`;
    case 'gainGold':
      return `${effect.amount} ゴールドを得る`;
    case 'loseGold':
      return `${effect.amount} ゴールドを払う`;
    case 'gainRelic':
      return 'ランダムなレリックを得る';
    case 'upgradeRandom':
      return `ランダムなカード ${effect.count} 枚を強化`;
    case 'fillPotions':
      return '空いているポーション枠をすべて埋める';
    case 'changeEnergyPerTurn':
      return `毎ターンのエナジー ${signed(effect.amount)}`;
    case 'changeDrawPerTurn':
      return `毎ターン引く枚数 ${signed(effect.amount)}`;
  }
}

function isNegative(effect: RunEffect): boolean {
  switch (effect.kind) {
    case 'loseMaxHp':
    case 'loseHp':
    case 'loseGold':
      return true;
    case 'changeEnergyPerTurn':
    case 'changeDrawPerTurn':
      return effect.amount < 0;
    default:
      return false;
  }
}

const RUN_CHOICE_TEXT: Record<RunChoice, string> = {
  upgradeCard: 'カードを 1 枚選んで強化',
  removeCard: 'カードを 1 枚選んで削除',
  pickCard: '3 枚から 1 枚を選んでデッキに加える',
};

export type EffectLine = { text: string; negative: boolean };

/** 効果を 1 行ずつ。同じ効果が重なる場合は「×2」にまとめる。代償（マイナス効果）は negative。 */
export function describeRunEffects(
  effects: readonly RunEffect[],
  choice: RunChoice | undefined,
): EffectLine[] {
  const counted = new Map<string, { negative: boolean; count: number }>();
  for (const effect of effects) {
    const text = describeRunEffect(effect);
    const existing = counted.get(text);
    if (existing) existing.count += 1;
    else counted.set(text, { negative: isNegative(effect), count: 1 });
  }
  const lines = [...counted].map(([text, { negative, count }]) => ({
    text: count > 1 ? `${text} ×${count}` : text,
    negative,
  }));
  return choice ? [...lines, { text: RUN_CHOICE_TEXT[choice], negative: false }] : lines;
}

export const describeBlessing = (blessing: BlessingDefinition): EffectLine[] =>
  describeRunEffects(blessing.effects, blessing.choice);

/** イベントの選択肢の中身。戦闘になる選択肢は、その旨を 1 行で示す。 */
export function describeEventOption(option: EventOption): EffectLine[] {
  const lines = describeRunEffects(option.effects, option.choice);
  return option.fight
    ? [{ text: 'エリートと戦闘（勝てばレリック）', negative: true }, ...lines]
    : lines;
}
