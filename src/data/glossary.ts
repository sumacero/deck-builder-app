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
  status: {
    id: 'status',
    name: 'お邪魔カード',
    icon: '💢',
    description: '敵に捨て札へ混ぜられるカード。手札を圧迫する。この戦闘が終わるとデッキから消える。',
  },
  unplayable: {
    id: 'unplayable',
    name: '使用不可',
    icon: '🚫',
    description: 'このカードは使えない。手札に来たら、ほかのカードで戦おう。',
  },
  ethereal: {
    id: 'ethereal',
    name: '消える',
    icon: '💨',
    description: 'ターン終了時に手札にあると、廃棄されて戦闘中は戻ってこない。',
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
  vulnerable: {
    id: 'vulnerable',
    name: '弱体',
    icon: '🎯',
    description: '受けるダメージが 1.5 倍になる。数値は残りターン数で、重ねてかけると加算される。',
  },
  weak: {
    id: 'weak',
    name: '衰弱',
    icon: '🥀',
    description: '攻撃で与えるダメージが半分になる。数値は残りターン数で、重ねてかけると加算される。',
  },
  retainBlock: {
    id: 'retainBlock',
    name: 'ブロック保持',
    icon: '🏰',
    description: '自分のターンが始まってもブロックが消えず、次のターンに引き継がれる。数値は残りターン数。',
  },
  blazing: {
    id: 'blazing',
    name: '熱血',
    icon: '♨️',
    description: '攻撃で与えるダメージが 1.5 倍になる。数値は残りターン数で、重ねてかけると加算される。',
  },
  statusTurns: {
    id: 'statusTurns',
    name: 'ターン数',
    icon: '⏳',
    description:
      'バフ・デバフの数値は残りターン数。敵にかけたものは敵のターンの終わりに、自分にかけたものは次の自分のターンの始めに 1 減る。カードで増やして長く効かせられる。',
  },
  barricade: {
    id: 'barricade',
    name: '不動',
    icon: '🏯',
    description: 'この戦闘の間ずっと、自分のターンが始まってもブロックが消えない。盾撃ち・盾砕きと組み合わせよう。',
  },
  demonForm: {
    id: 'demonForm',
    name: '紅蓮の化身',
    icon: '🌋',
    description: '自分のターンの始めに、その数値の分だけ筋力を得る。戦闘が長引くほど強くなる。',
  },
  juggernaut: {
    id: 'juggernaut',
    name: '鉄壁の闘気',
    icon: '🗡️',
    description: 'ブロックを得るたびに、HP が一番低い敵にその数値のダメージ（筋力や弱体の影響を受けない）。',
  },
  sadistic: {
    id: 'sadistic',
    name: '弱点看破',
    icon: '👁️',
    description: '敵に弱体・衰弱を与えるたびに、その敵にその数値のダメージ（筋力や弱体の影響を受けない）。敵全体にかけると全員に当たる。',
  },
  rupture: {
    id: 'rupture',
    name: '燃える血潮',
    icon: '❤️‍🔥',
    description: 'HP を失うたびに（ダメージは除く）、その数値の分だけ筋力を得る。紅蓮の刃や生命転換と相性がよい。',
  },
  feelNoPain: {
    id: 'feelNoPain',
    name: '灰より立つ',
    icon: '🔆',
    description: 'カードが廃棄されるたびに、その数値の分だけブロックを得る。',
  },
  growth: {
    id: 'growth',
    name: '成長',
    icon: '🌱',
    description:
      '使ったり敵を倒したりするたびに数値が増えるカード。「この戦闘中」はその戦闘の間だけ、「ランの間ずっと」はデッキのカード自体が強くなる。',
  },
  attribute: {
    id: 'attribute',
    name: '属性',
    icon: '🗡️',
    description:
      'アタックの属性。🗡️斬・🔨打・🔥炎・❄️氷・⚡雷の 5 種類。カードの種類の横に出ている。敵の弱点の属性で攻撃すると、ダウンゲージを削れる。',
  },
  weakness: {
    id: 'weakness',
    name: '弱点',
    icon: '💥',
    description:
      '敵の名前の下に出ている属性。弱点の属性の攻撃は 1 ヒットごとにダウンゲージを 1 削る（連続攻撃ほど削れる）。弱点以外の攻撃ではゲージは減らない。',
  },
  enchant: {
    id: 'enchant',
    name: '魔法剣',
    icon: '✨',
    description: 'このターンの間、使うアタックすべてに属性が加わる。弱点が合わない敵にも、ダウンを狙えるようになる。',
  },
  mysticArte: {
    id: 'mysticArte',
    name: '秘奥義',
    icon: '🌟',
    description:
      'カードを使うと秘奥義ゲージが溜まる（弱点を突くと多め、敵をダウンさせるとさらに多め）。満タンになると、キャラ固有の必殺技カードが手札に来る。全属性を持ち、どんな敵の弱点も突ける。',
  },
  maxHp: {
    id: 'maxHp',
    name: '最大 HP',
    icon: '💗',
    description: 'HP の上限。増えた分だけ HP も回復し、ランの間ずっと続く。',
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
  intangible: {
    id: 'intangible',
    name: '霊体化',
    icon: '👻',
    description:
      '体が透けていて、攻撃 1 回で受けるダメージが最大 1 になる。数値は残りターン数。強い一撃より、連続攻撃で削るか、守りを固めて切れるのを待とう。',
  },
  down: {
    id: 'down',
    name: 'ダウン',
    icon: '😵',
    description:
      'よろめきゲージが尽きて体勢を崩している。次の行動を休み、受けるダメージが 1.5 倍になる。数値は残りターン数。明けるとゲージが元に戻る。',
  },
  stagger: {
    id: 'stagger',
    name: 'ダウンゲージ',
    icon: '🌀',
    description:
      '数値は「あと何回弱点を突けばダウンするか」。ブロックで防がれても 1 回に数える。0 になると敵はダウンして次の行動を休み、2 ターンの間受けるダメージが 1.5 倍になる。ダウンが明けるとゲージは元に戻る。',
  },
  sleep: {
    id: 'sleep',
    name: '眠り',
    icon: '💤',
    description:
      '数値のターン数だけ眠っていて何もしない。HP にダメージを与えると目を覚ます。起きると筋力が上がるので、眠っているうちに準備を整えるか、一気に倒しきろう。',
  },
  vengeance: {
    id: 'vengeance',
    name: '仇討ち',
    icon: '😡',
    description: '仲間が倒れるたびに、数値の分だけ筋力が上がる。倒す順番に気をつけよう。',
  },
  resolute: {
    id: 'resolute',
    name: '不屈',
    icon: '🗿',
    description: '同じ種類のデバフは戦闘中 1 回しか受け付けない。2 回目以降やターン数の延長は効かない。',
  },
  ward: {
    id: 'ward',
    name: '加護',
    icon: '💧',
    description: '数値の回数だけ、受けたデバフ（延長を含む）を無効にする。弱いデバフで先に加護をはがそう。',
  },
  guardian: {
    id: 'guardian',
    name: 'かばう',
    icon: '🛡️',
    description: '生きている間、仲間 1 体を狙った攻撃やデバフを代わりに受ける。全体攻撃は防げない。',
  },
  deathThroes: {
    id: 'deathThroes',
    name: '死に際',
    icon: '☠️',
    description: '倒れたときに最後の悪あがきをする（敵の詳細の行動を見よう）。',
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
  intentDebuff: {
    id: 'intentDebuff',
    name: 'デバフ',
    icon: '🎯',
    description: 'あなたに弱体（🎯 受けるダメージ 1.5 倍）か衰弱（🥀 与えるダメージ半分）をかける。数値はターン数。',
  },
  intentAddCard: {
    id: 'intentAddCard',
    name: 'お邪魔カード',
    icon: '🃏',
    description: 'あなたの捨て札にお邪魔カードを数値の枚数だけ混ぜる。',
  },
  intentIntangible: {
    id: 'intentIntangible',
    name: '霊体化',
    icon: '👻',
    description: '霊体化する。次のあなたのターンの間、攻撃 1 回で受けるダメージが最大 1 になる。',
  },
  intentSleep: {
    id: 'intentSleep',
    name: '眠っている',
    icon: '💤',
    description: '眠っていて何もしない。HP にダメージを与えると目を覚ます。',
  },
  intentDown: {
    id: 'intentDown',
    name: 'ダウン中',
    icon: '😵',
    description: 'ダウンしていて、このターンは何もできない。',
  },
};
