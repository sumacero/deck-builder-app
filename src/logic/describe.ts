import type { Attribute } from '../domain/attribute';
import type { BlessingDefinition } from '../domain/blessing';
import type { Archetype, CardDefinition, CardGrowth, CardType } from '../domain/card';
import type { Effect, EffectTarget } from '../domain/effect';
import type { EnemyAction, EnemyMove, EnemyRank, EnemyTrait } from '../domain/enemy';
import type { EventOption } from '../domain/event';
import type { MapNodeType } from '../domain/map';
import type { PotionDefinition } from '../domain/potion';
import type { RelicCondition, RelicDefinition, RelicRarity } from '../domain/relic';
import type { RunChoice, RunEffect } from '../domain/runEffect';
import type { DebuffId, PowerId, StatusId } from '../domain/status';
import { ALL_ATTRIBUTES } from './attribute';

export const MAP_NODE_LABEL: Record<MapNodeType, string> = {
  enemy: '敵',
  elite: 'エリート',
  rest: '休憩所',
  shop: 'ショップ',
  event: 'イベント',
  treasure: '宝箱',
  boss: 'ボス',
};

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  debuff: 'デバフ軸',
  block: 'ブロック軸',
  strength: '筋力軸',
  sacrifice: '自傷軸',
  growth: '成長軸',
  element: '属性軸',
  tempo: '手数軸',
};

export const CARD_TYPE_LABEL: Record<CardType, string> = {
  attack: 'アタック',
  skill: 'スキル',
  power: 'パワー',
  status: 'お邪魔',
};

function describeEffect(effect: Effect, target: EffectTarget): string {
  switch (effect.kind) {
    case 'damage': {
      const whom = target === 'allEnemies' ? '敵全体に' : '';
      const scaling =
        effect.strengthMultiplier && effect.strengthMultiplier > 1 ? `筋力が ${effect.strengthMultiplier} 倍で乗る。` : '';
      return effect.hits && effect.hits > 1
        ? `${whom}${effect.amount} ダメージを ${effect.hits} 回与える。${scaling}`
        : `${whom}${effect.amount} ダメージを与える。${scaling}`;
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
    case 'damageFromBlock':
      return target === 'allEnemies' ? '敵全体に、今のブロック値と同じダメージを与える。' : '今のブロック値と同じダメージを与える。';
    case 'doubleBlock':
      return '今のブロック値を 2 倍にする。';
    case 'applyDebuff':
      return `${target === 'allEnemies' ? '敵全体に' : ''}${STATUS_LABEL[effect.status]} ${effect.turns} を与える。`;
    case 'gainBuff':
      return `${STATUS_LABEL[effect.status]} ${effect.turns} を得る。`;
    case 'extendDebuffs':
      return `${target === 'allEnemies' ? '敵全体の' : '敵の'}デバフのターン数を ${effect.turns} 増やす。`;
    case 'extendBuffs':
      return `自分のバフのターン数を ${effect.turns} 増やす。`;
    case 'gainPower':
      return describePower(effect.power, effect.amount);
    case 'damagePerSelfHpLost':
      return `${effect.base} ダメージ。この戦闘でカードの効果で失った HP 1 につき +${effect.perHp}。`;
    case 'damagePerDebuff':
      return `${effect.base} ダメージ。敵のデバフ 1 ターンにつき +${effect.perTurn}。`;
    case 'detonateDebuffs':
      return `敵のデバフをすべて消し、消したターン数 × ${effect.perTurn} のダメージを与える。`;
    case 'ifTargetHas':
      return `敵が${STATUS_LABEL[effect.status]}なら、${describeEffects(effect.effects, target)}`;
    case 'consumeBlock':
      return `ブロックをすべて失い、その ${effect.multiplier} 倍のダメージを与える。`;
    case 'feed':
      return `${effect.damage} ダメージを与える。これで敵を倒すと最大 HP +${effect.maxHp}（ランの間ずっと）。`;
    case 'enchant':
      return `このターン、アタックに${ATTRIBUTE_LABEL[effect.attribute]}属性が加わる。`;
    case 'multiplyDebuff':
      return `${target === 'allEnemies' ? '敵全体の' : '敵の'}${STATUS_LABEL[effect.status]}を ${effect.factor} 倍にする。`;
    case 'bloomSeed':
      return `${target === 'allEnemies' ? '敵全体の' : '敵の'}宿り木を今すぐ発動させる（数値は減らない）。`;
    case 'damagePerCardPlayed':
      return `${effect.base} ダメージ。このターンに先に使ったカード 1 枚につき +${effect.perCard}。`;
  }
}

export const ATTRIBUTE_LABEL: Record<Attribute, string> = {
  grass: '草',
  fire: '火',
  water: '水',
};

export const ATTRIBUTE_ICON: Record<Attribute, string> = {
  grass: '🌿',
  fire: '🔥',
  water: '💧',
};

export const attributeText = (attribute: Attribute) =>
  `${ATTRIBUTE_ICON[attribute]}${ATTRIBUTE_LABEL[attribute]}`;

/** 敵の詳細に出す属性と弱点の説明。 */
export function describeEnemyAttribute(attribute: Attribute | null, weaknesses: readonly Attribute[]): string {
  const own = attribute ? `${attributeText(attribute)}属性` : '無属性';
  if (!attribute) return `${own}（相性なし）`;
  return `${own}。弱点: ${weaknesses.map(attributeText).join('・')}（弱点を突くとダメージ 1.25 倍）`;
}

/** カードの属性の短い表記（秘奥義のように全属性なら「全属性」）。iconOnly は狭い手札用。 */
export function describeAttributes(attributes: readonly Attribute[], iconOnly = false): string {
  if (ALL_ATTRIBUTES.every((attribute) => attributes.includes(attribute))) return iconOnly ? '🌈' : '🌈全属性';
  return attributes.map((attribute) => (iconOnly ? ATTRIBUTE_ICON[attribute] : attributeText(attribute))).join('');
}

export const POWER_LABEL: Record<PowerId, string> = {
  barricade: '不動',
  demonForm: '紅蓮の化身',
  juggernaut: '鉄壁の闘気',
  sadistic: '弱点看破',
  rupture: '燃える血潮',
  feelNoPain: '灰より立つ',
  thorns: '茨の鎧',
  overgrowth: '森の侵蝕',
  verdure: '命の芽吹き',
  quickdraw: '速射の構え',
  flurry: '連閃',
};

/** パワーの効果（amount は 1 枚分の量）。 */
export function describePower(power: PowerId, amount: number): string {
  switch (power) {
    case 'barricade':
      return 'この戦闘中、ブロックがターンの始めに消えなくなる。';
    case 'demonForm':
      return `この戦闘中、ターンの始めに筋力 ${amount} を得る。`;
    case 'juggernaut':
      return `この戦闘中、ブロックを得るたびに HP が一番低い敵に ${amount} ダメージ。`;
    case 'sadistic':
      return `この戦闘中、敵にデバフを与えるたびにその敵に ${amount} ダメージ。`;
    case 'rupture':
      return `この戦闘中、HP を失うたびに筋力 ${amount} を得る。`;
    case 'feelNoPain':
      return `この戦闘中、カードが廃棄されるたびにブロック ${amount} を得る。`;
    case 'thorns':
      return `この戦闘中、敵の攻撃を受けるたびにその敵に ${amount} ダメージ。`;
    case 'overgrowth':
      return `この戦闘中、ターンの始めに敵全体に宿り木 ${amount} を与える。`;
    case 'verdure':
      return `この戦闘中、敵に宿り木を与えるたびにブロック ${amount} を得る。`;
    case 'quickdraw':
      return `この戦闘中、カードを使うたびに HP が一番低い敵に ${amount} ダメージ。`;
    case 'flurry':
      return `この戦闘中、同じ攻撃の 2 ヒット目から 1 ヒットごとにダメージ +${amount}。`;
  }
}

function describeGrowth(growth: CardGrowth): string {
  const when = growth.when === 'play' ? '使うたびに' : 'これで敵を倒すたびに';
  const stat = growth.stat === 'damage' ? 'ダメージ' : 'ブロック';
  const scope = growth.scope === 'run' ? '（ランの間ずっと）' : '（この戦闘中）';
  return `${when}${stat} +${growth.amount}${scope}。`;
}

/** 説明文での状態の名前（数値はターン数）。 */
export const STATUS_LABEL: Record<StatusId, string> = {
  vulnerable: '弱体',
  weak: '衰弱',
  seed: '宿り木',
  retainBlock: 'ブロック保持',
  blazing: '熱血',
  intangible: '霊体化',
};

/** インテントに出す、デバフのアイコン。 */
export const DEBUFF_ICON: Record<DebuffId, string> = {
  vulnerable: '🎯',
  weak: '🥀',
  seed: '🌱',
};

const describeEffects = (effects: Effect[], target: EffectTarget) =>
  effects.map((effect) => describeEffect(effect, target)).join('');

export function describeCard(card: CardDefinition): string {
  const extras = [
    card.unplayable ? '使用できない。' : '',
    card.turnEndInHand
      ? `ターン終了時に手札にあると、${describeEffects(card.turnEndInHand, 'self')}`
      : '',
    card.ethereal ? 'ターン終了時に手札にあると消える。' : '',
    card.growth ? describeGrowth(card.growth) : '',
    card.timesGrown ? `（${card.timesGrown} 回成長）` : '',
    card.addCopyToDiscard ? 'このカードのコピーを捨て札に加える。' : '',
    card.exhaust ? '廃棄。' : '',
  ].join('');
  return describeEffects(card.effects, card.target) + extras;
}

export function describePotion(potion: PotionDefinition): string {
  return describeEffects(potion.effects, potion.target);
}

const RELIC_CONDITION_TEXT: Record<RelicCondition, string> = {
  noBlock: 'ブロックが 0 なら',
  lowHp: 'HP が半分以下なら',
  eliteOrBoss: 'エリート・ボス戦なら',
  everyThirdTurn: '3 ターンごとに',
};

function relicTiming(relic: RelicDefinition): string {
  const condition = relic.condition ? RELIC_CONDITION_TEXT[relic.condition] : '';
  switch (relic.trigger) {
    case 'combatStart':
      return condition ? `${condition}戦闘開始時、` : '戦闘開始時、';
    case 'turnStart':
      if (relic.condition === 'everyThirdTurn') return '3 ターンごとのターン開始時、';
      return condition ? `ターン開始時に${condition}、` : 'ターン開始時、';
    case 'turnEnd':
      return condition ? `ターン終了時に${condition}、` : 'ターン終了時、';
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

export const RELIC_RARITY_LABEL: Record<RelicRarity, string> = {
  starter: '初期',
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
  boss: 'ボス',
};

export type IntentView = {
  key: string;
  tone: EnemyAction['kind'];
  icon: string;
  label: string;
};

/** damageOf は攻撃 1 回分の実ダメージ（筋力・衰弱・弱体込み）を求める関数。攻撃の数値は実ダメージで見せる。 */
export function describeIntent(move: EnemyMove, damageOf: (base: number) => number): IntentView[] {
  return move.actions.map((action, index) => {
    const key = `${move.id}-${index}`;
    switch (action.kind) {
      case 'attack': {
        const damage = damageOf(action.damage);
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
      case 'heal':
        return { key, tone: action.kind, icon: action.allies ? '💞' : '💚', label: `+${action.amount}` };
      case 'paralyze':
        return { key, tone: action.kind, icon: '💫', label: `${action.amount}` };
      case 'chill':
        return { key, tone: action.kind, icon: '❄️', label: `${action.amount}` };
      case 'seal':
        return { key, tone: action.kind, icon: '🔒', label: '' };
      case 'charge':
        return { key, tone: action.kind, icon: '🔋', label: '' };
      case 'debuff':
        return { key, tone: action.kind, icon: DEBUFF_ICON[action.status], label: `${action.turns}` };
      case 'addCard':
        return { key, tone: action.kind, icon: '🃏', label: `${action.count}` };
      case 'intangible':
        return { key, tone: action.kind, icon: '👻', label: '' };
      case 'shiftAttribute':
        return { key, tone: action.kind, icon: '🚩', label: ATTRIBUTE_ICON[action.attribute] };
      case 'idle':
        return { key, tone: action.kind, icon: '💤', label: '' };
    }
  });
}

/** 敵の行動を文章で（死に際の行動の説明に使う）。 */
function describeEnemyAction(action: EnemyAction): string {
  switch (action.kind) {
    case 'attack':
      return action.hits > 1 ? `${action.damage} ダメージを ${action.hits} 回` : `${action.damage} ダメージ`;
    case 'block':
      return `ブロック ${action.amount} を得る`;
    case 'buff':
      return `筋力 +${action.strength}`;
    case 'heal':
      return action.allies ? `仲間全員の HP を ${action.amount} 回復` : `HP を ${action.amount} 回復`;
    case 'paralyze':
      return `次のターン、麻痺 ${action.amount}`;
    case 'chill':
      return `次のターン、凍え ${action.amount}`;
    case 'seal':
      return '次のターン、スキルを封印';
    case 'charge':
      return '力を溜める';
    case 'debuff':
      return `あなたに${STATUS_LABEL[action.status]} ${action.turns} ターン`;
    case 'addCard':
      return `捨て札に「${action.card.name}」を ${action.count} 枚混ぜる`;
    case 'intangible':
      return '霊体化する';
    case 'shiftAttribute':
      return `${ATTRIBUTE_LABEL[action.attribute]}属性になる`;
    case 'idle':
      return '何もしない';
  }
}

/** 敵の詳細に出す、性質ごとの具体的な説明。 */
export function describeTrait(trait: EnemyTrait): string {
  switch (trait.kind) {
    case 'vengeance':
      return `仇討ち: 仲間が倒れるたびに筋力 +${trait.strength}`;
    case 'sleep':
      return `眠り: 最初の ${trait.turns} ターンは眠っている。目覚めると筋力 +${trait.wakeStrength}`;
    case 'artifact':
      return `アーティファクト: デバフを ${trait.charges} 回無効にする。使い切ると同じデバフも重ねられる`;
    case 'hitCap':
      return `鉄鱗: 攻撃 1 ヒットのダメージは ${trait.amount} まで。多段攻撃はヒットごとに通る`;
    case 'guardian':
      return 'かばう: 仲間を狙った攻撃・デバフを代わりに受ける';
    case 'deathThroes':
      return `死に際: 倒れると${describeEnemyAction(trait.action)}`;
    case 'awaken':
      return `覚醒: HP が ${Math.round(trait.threshold * 100)}% になると真の姿を現し、筋力 +${trait.strength}・ブロック +${trait.block}。それまでは HP がそれより減らない`;
  }
}

export const ENEMY_RANK_LABEL: Record<EnemyRank, string | null> = {
  normal: null,
  elite: 'エリート',
  boss: 'ボス',
  final: 'ラスボス',
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
      return effect.tier
        ? `ランダムな${RELIC_RARITY_LABEL[effect.tier]}のレリックを得る`
        : 'ランダムなレリックを得る';
    case 'addCard':
      return `「${effect.card.name}」をデッキに加える`;
    case 'upgradeRandom':
      return `ランダムなカード ${effect.count} 枚を強化`;
    case 'fillPotions':
      return '空いているポーション枠をすべて埋める';
    case 'changeEnergyPerTurn':
      return `毎ターンのエナジー ${signed(effect.amount)}`;
    case 'changeDrawPerTurn':
      return `毎ターン引く枚数 ${signed(effect.amount)}`;
    case 'fuseCards':
      return `${effect.from.name} ${effect.count} 枚を融合し「${effect.into.name}」にする（コスト ${effect.into.cost}：${describeCard(effect.into)}）`;
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
    case 'addCard':
      return effect.card.type === 'status';
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
