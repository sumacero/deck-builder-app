import type { KeywordDefinition, KeywordId } from '../domain/glossary';

export const KEYWORDS: Record<KeywordId, KeywordDefinition> = {
  attack: {
    id: 'attack',
    name: 'アタック',
    icon: '⚔️',
    description: '敵を攻撃するカード。',
  },
  skill: {
    id: 'skill',
    name: 'スキル',
    icon: '🛡️',
    description: '防御や準備など、攻撃以外の行動をするカード。',
  },
  power: {
    id: 'power',
    name: 'パワー',
    icon: '✨',
    description: '使うと、その効果が戦闘の終わりまで続くカード。',
  },
  damage: {
    id: 'damage',
    name: 'ダメージ',
    icon: '💥',
    description:
      '相手の HP を減らす。相手にブロックがあれば先にブロックが削られ、残った分だけ HP が減る。筋力の分だけ 1 回ごとに増える。',
  },
  areaAttack: {
    id: 'areaAttack',
    name: '敵全体',
    icon: '🌀',
    description:
      '生きている敵全員に同じダメージを与える。ブロックは敵ごとに別々に削られる。対象を選ばないので、上にスワイプするだけで使える。',
  },
  block: {
    id: 'block',
    name: 'ブロック',
    icon: '🛡️',
    description:
      '受けるダメージを、その数値の分だけ肩代わりする盾。自分のターンが始まると 0 に戻るので、次の攻撃に備えてターン中に積んでおく。',
  },
  energy: {
    id: 'energy',
    name: 'エナジー',
    icon: '⚡',
    description: 'カードを使うためのコスト。毎ターンの始めに回復し、使い切らなかった分は持ち越せない。',
  },
  draw: {
    id: 'draw',
    name: 'ドロー',
    icon: '🃏',
    description: '山札からカードを手札に加える。山札が尽きたら捨て札をシャッフルして山札に戻す。',
  },
  heal: {
    id: 'heal',
    name: '回復',
    icon: '💚',
    description: 'HP を回復する。最大 HP を超えては回復しない。',
  },
  loseHp: {
    id: 'loseHp',
    name: 'HP を失う',
    icon: '💔',
    description: 'ダメージとは違い、ブロックでは防げずに HP が直接減る。',
  },
  strength: {
    id: 'strength',
    name: '筋力',
    icon: '💪',
    description: '攻撃のダメージが、その数値の分だけ増える。連続攻撃なら 1 回ごとに増える。戦闘の終わりまで続く。',
  },
  tempStrength: {
    id: 'tempStrength',
    name: '一時的な筋力',
    icon: '🔥',
    description: '筋力と同じく攻撃のダメージが増えるが、このターンの終わりに消える。',
  },
  endTurnBlock: {
    id: 'endTurnBlock',
    name: '鉄壁',
    icon: '🧱',
    description: '毎ターンの終わりに、その数値の分だけブロックを得る。戦闘の終わりまで続く。',
  },
  exhaust: {
    id: 'exhaust',
    name: '廃棄',
    icon: '🔥',
    description: '使うと捨て札ではなく廃棄札へ行き、この戦闘ではもう使えない。デッキからは消えない。',
  },
  copyToDiscard: {
    id: 'copyToDiscard',
    name: 'コピー',
    icon: '📄',
    description: '使うたびに同じカードが捨て札に 1 枚増える。この戦闘の間だけで、戦闘が終わると消える。',
  },
  intentAttack: {
    id: 'intentAttack',
    name: '攻撃の予告',
    icon: '⚔️',
    description: '次のターン、表示された数値のダメージで攻撃してくる（「×」は回数）。ブロックを積んで備えよう。',
  },
  intentBlock: {
    id: 'intentBlock',
    name: '防御の予告',
    icon: '🛡️',
    description: '次のターン、ブロックを得る。そのブロックは敵の次の行動の直前まで残る。',
  },
  intentBuff: {
    id: 'intentBuff',
    name: '強化の予告',
    icon: '💪',
    description: '次のターン、筋力を得て以後の攻撃が強くなる。早めに倒すのが得策。',
  },
  paralysis: {
    id: 'paralysis',
    name: '麻痺',
    icon: '💫',
    description: 'このターンのエナジーが、その数値の分だけ減っている。次のターンには元に戻る。',
  },
  chill: {
    id: 'chill',
    name: '凍え',
    icon: '❄️',
    description: 'このターンに引いたカードが、その数値の分だけ少ない。次のターンには元に戻る。',
  },
  seal: {
    id: 'seal',
    name: '封印',
    icon: '🔒',
    description: 'このターンはスキルカードを使えない。次のターンには元に戻る。',
  },
  intentHeal: {
    id: 'intentHeal',
    name: '回復の予告',
    icon: '💚',
    description: '次のターン、自分の HP を回復する。回復される前に削り切るか、大きなダメージで押し切ろう。',
  },
  intentAllyHeal: {
    id: 'intentAllyHeal',
    name: '全体回復の予告',
    icon: '💞',
    description: '次のターン、生きている敵全員の HP を回復する。回復役から先に倒すのが得策。',
  },
  intentParalyze: {
    id: 'intentParalyze',
    name: '麻痺の予告',
    icon: '💫',
    description: '次の自分のターン、エナジーが表示された数値だけ減る（重ねても 2 まで）。',
  },
  intentChill: {
    id: 'intentChill',
    name: '凍えの予告',
    icon: '❄️',
    description: '次の自分のターン、引く枚数が表示された数値だけ減る（重ねても 2 まで）。',
  },
  intentSeal: {
    id: 'intentSeal',
    name: '封印の予告',
    icon: '🔒',
    description: '次の自分のターン、スキルカードを使えなくなる。今のうちにブロックを積んでおこう。',
  },
  intentCharge: {
    id: 'intentCharge',
    name: 'チャージ',
    icon: '🔋',
    description: '力を溜めている。次の行動は強烈な大技なので、このターンのうちに備えよう。',
  },
};
