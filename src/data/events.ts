import type { CardDefinition } from '../domain/card';
import type { EventDefinition } from '../domain/event';
import {
  CINDER_BLADE,
  DEFEND,
  DOUBLE_REFLECTION,
  EBB_TIDE,
  FALLING_EMBER,
  LINGERING_FLAME,
  MIST_MIRROR,
  MORNING_DEW,
  OPENING_FLAME,
  RESTRING,
  RETURNING_WAVE,
  ROOTED_GUARD,
  SPRAY_STRIKE,
  STRIKE,
  THORN_FORT,
  ULTIMATE_DEFEND,
  ULTIMATE_STRIKE,
  WILDFIRE,
  ARROW_MEASURE,
} from './cards';
import { MIRROR_CARDS } from './mirrorCards';
import { HOLLOW, ICE_SHARD, SCRAP, TANGLING_VINE } from './statusCards';

const mirrorCard = (id: string): CardDefinition => {
  const card = MIRROR_CARDS.find((item) => item.id === id);
  if (!card) throw new Error(`missing mirror card ${id}`);
  return card;
};

/**
 * 「？」マスの出来事。1 ランの中では、その章の候補が残っている間は同じものが出ない。
 * chapters が無いものは全章。あるものは、その章だけで出る。
 */
const EVENT_LIST: EventDefinition[] = [
  {
    id: 'old-shrine',
    title: '古の祠',
    icon: '⛩️',
    text: '苔に覆われた小さな祠がある。賽銭箱の奥で、何かが鈍く光っている。',
    options: [
      {
        id: 'offer',
        label: '金貨を捧げる',
        effects: [{ kind: 'loseGold', amount: 60 }, { kind: 'gainRelic' }],
        outcome: '金貨が箱の底に落ちる音がして、光るものが手の中に転がり込んだ。',
      },
      {
        id: 'pray',
        label: '祈る',
        effects: [{ kind: 'upgradeRandom', count: 1 }],
        outcome: '静かに手を合わせると、技が少しだけ研ぎ澄まされた気がした。',
      },
    ],
  },
  {
    id: 'healing-spring',
    title: '癒しの泉',
    icon: '⛲',
    text: '澄んだ水が湧き出る泉。水面に映る自分の顔は、ひどく疲れて見える。',
    options: [
      {
        id: 'drink',
        label: '水を飲む',
        effects: [{ kind: 'heal', amount: 20 }],
        outcome: '冷たい水が体に染みわたり、傷が癒えていく。',
      },
      {
        id: 'cleanse',
        label: '身を清める',
        effects: [],
        choice: 'removeCard',
        outcome: '迷いを一つ、水に流した。',
      },
    ],
  },
  {
    id: 'blood-merchant',
    title: '影の商人',
    icon: '🧛',
    text: '「金でも、宝でも。代価はあなたの生命力で結構」 フードの奥で、青白い男が微笑む。',
    options: [
      {
        id: 'sell-blood',
        label: '生命力を売る',
        effects: [
          { kind: 'loseHp', amount: 10 },
          { kind: 'gainGold', amount: 120 },
        ],
        outcome: '男は満足げに金貨の袋を差し出した。',
      },
      {
        id: 'trade-vitality',
        label: '生命力と引き換えに宝を',
        effects: [{ kind: 'loseMaxHp', amount: 6 }, { kind: 'gainRelic' }],
        outcome: '体の芯が少し冷えた。代わりに、見慣れない宝が手に残る。',
      },
    ],
  },
  {
    id: 'wandering-smith',
    title: '流れの鍛冶屋',
    icon: '⚒️',
    text: '道端で火を焚く鍛冶屋が、あなたの剣をじっと見ている。「腕がうずくねえ」',
    options: [
      {
        id: 'forge',
        label: '1 枚じっくり鍛えてもらう',
        effects: [],
        choice: 'upgradeCard',
        outcome: '鍛冶屋は満足げに頷いた。',
      },
      {
        id: 'quick-forge',
        label: '金貨を払って 2 枚まとめて',
        effects: [
          { kind: 'loseGold', amount: 40 },
          { kind: 'upgradeRandom', count: 2 },
        ],
        outcome: '手早い仕事だった。どれが鍛えられたのかは、使ってのお楽しみだ。',
      },
    ],
  },
  {
    id: 'sleeping-guardian',
    title: '眠る守護者',
    icon: '💤',
    text: '宝の山にもたれて、巨大な守護者が眠っている。寝息のたびに地面が揺れる。',
    options: [
      {
        id: 'fight',
        label: '叩き起こして戦う',
        effects: [],
        fight: 'elite',
        outcome: '守護者が目を覚ました！',
      },
      {
        id: 'sneak',
        label: 'こっそり金貨をくすねる',
        effects: [
          { kind: 'loseHp', amount: 12 },
          { kind: 'gainGold', amount: 75 },
        ],
        outcome: '寝返りに巻き込まれて痛い目を見たが、金貨はしっかり握っていた。',
      },
    ],
  },
  {
    id: 'wandering-bard',
    title: '旅の吟遊詩人',
    icon: '🎻',
    text: '焚き火のそばで吟遊詩人が竪琴を鳴らしている。「一曲どうだい、旅の人」',
    options: [
      {
        id: 'listen',
        label: '歌を聴く',
        effects: [{ kind: 'gainMaxHp', amount: 5 }],
        outcome: '勇ましい英雄の歌に、体の底から力が湧いてきた。',
      },
      {
        id: 'learn',
        label: '戦いの技を教わる',
        effects: [],
        choice: 'pickCard',
        outcome: '詩人は意外にも腕が立った。',
      },
    ],
  },
  {
    id: 'cursed-tome',
    title: '封印された魔導書',
    icon: '📕',
    text: '祭壇の上に、鎖で封じられた魔導書が置かれている。表紙に触れると、指先がちりちりと痛む。',
    options: [
      {
        id: 'read',
        label: '読み解く',
        effects: [{ kind: 'loseHp', amount: 8 }],
        choice: 'pickCard',
        outcome: '頭が割れるように痛むが、禁じられた技が流れ込んでくる。',
      },
      {
        id: 'burn',
        label: '燃やして過去を断つ',
        effects: [],
        choice: 'removeCard',
        outcome: '炎の中で、何かが一つ消えていった。',
      },
    ],
  },
  {
    id: 'fusion-altar',
    title: '融合の祭壇',
    icon: '🔮',
    text: '二つの窪みが刻まれた古い祭壇。手をかざすと、身につけた技が共鳴して熱を帯びる。「二つの技を一つに束ねよ」と声が響いた。',
    options: [
      {
        id: 'fuse-strike',
        label: 'ストライクを束ねる',
        effects: [{ kind: 'fuseCards', from: STRIKE, count: 2, into: ULTIMATE_STRIKE }],
        outcome: '二つの剣筋が重なり、一撃必殺の技へと生まれ変わった。',
      },
      {
        id: 'fuse-defend',
        label: '防御を束ねる',
        effects: [{ kind: 'fuseCards', from: DEFEND, count: 2, into: ULTIMATE_DEFEND }],
        outcome: '二つの構えが溶け合い、揺るがぬ守りの型となった。',
      },
    ],
  },
  {
    id: 'pitfall',
    title: '落とし穴',
    icon: '🕳️',
    text: '足元が崩れ、穴の底に落ちてしまった。暗がりの奥で何かが光っている。',
    options: [
      {
        id: 'search',
        label: '奥を探ってから登る',
        effects: [{ kind: 'loseHp', amount: 12 }, { kind: 'gainRelic' }],
        outcome: '手探りで拾い上げたのは、古いレリックだった。',
      },
      {
        id: 'climb',
        label: 'すぐによじ登る',
        effects: [{ kind: 'loseHp', amount: 4 }],
        outcome: '擦り傷だらけになったが、なんとか這い上がった。',
      },
    ],
  },
  {
    id: 'fairy-ring',
    title: '妖精の輪',
    icon: '🧚',
    text: 'キノコが輪になって生えている。中から、鈴を転がすような笑い声が聞こえる。',
    options: [
      {
        id: 'dance',
        label: '輪の中で踊る',
        effects: [
          { kind: 'gainMaxHp', amount: 3 },
          { kind: 'heal', amount: 10 },
        ],
        outcome: '夢中で踊るうちに、体が羽のように軽くなっていた。',
      },
      {
        id: 'gift',
        label: '小瓶をねだる',
        effects: [{ kind: 'fillPotions' }],
        outcome: '妖精たちはくすくす笑いながら、色とりどりの小瓶を置いていった。',
      },
    ],
  },
  {
    id: 'abandoned-camp',
    title: '打ち捨てられた野営地',
    icon: '🏕️',
    text: '焚き火の跡がまだ温かい。慌てて逃げ出したのか、荷物が散らばっている。',
    options: [
      {
        id: 'rest',
        label: 'ひと休みする',
        effects: [{ kind: 'heal', amount: 15 }],
        outcome: '焚き火に薪をくべ、しばし体を休めた。',
      },
      {
        id: 'scavenge',
        label: '荷物を漁る',
        effects: [
          { kind: 'gainGold', amount: 60 },
          { kind: 'addCard', card: SCRAP },
        ],
        outcome: '金貨を見つけたが、余計なガラクタまで鞄に紛れ込んだ。',
      },
    ],
  },
  {
    id: 'dragon-hoard',
    title: '竜の寝床',
    icon: '🐉',
    text: '眠る竜の腹の下で、財宝の山がまばゆく輝いている。熱い寝息が肌を焦がす。',
    options: [
      {
        id: 'treasure',
        label: '一番奥の宝を持ち出す',
        effects: [
          { kind: 'gainRelic', tier: 'rare' },
          { kind: 'addCard', card: HOLLOW },
        ],
        outcome: '宝を抱えて逃げ出した。胸の奥に、空っぽの呪いが残っている。',
      },
      {
        id: 'coins',
        label: '手前の金貨だけ拾う',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'gainGold', amount: 90 },
        ],
        outcome: '竜が寝返りを打った。尻尾に打たれたが、金貨は手放さなかった。',
      },
    ],
  },
  {
    id: 'mirror-lake',
    title: '鏡の湖',
    icon: '🪞',
    text: '風ひとつない湖面に、もう一人の自分が映っている。その目は、何かを問いかけている。',
    options: [
      {
        id: 'runes',
        label: '湖底のルーンを刻む',
        effects: [
          { kind: 'loseMaxHp', amount: 5 },
          { kind: 'upgradeRandom', count: 3 },
        ],
        outcome: '冷たい水に体温を奪われたが、技がいくつも冴えわたった。',
      },
      {
        id: 'reflect',
        label: '映る自分と向き合う',
        effects: [],
        choice: 'removeCard',
        outcome: '湖面の自分が、迷いを一つ持ち去っていった。',
      },
    ],
  },
  {
    id: 'knight-trial',
    title: '騎士の試練',
    icon: '🏇',
    text: '古びた鎧の騎士が道をふさいでいる。「我を越えてゆけ。さもなくば、教えを請え」',
    options: [
      {
        id: 'duel',
        label: '一騎打ちを挑む',
        effects: [],
        fight: 'elite',
        outcome: '騎士が剣を抜いた！',
      },
      {
        id: 'lesson',
        label: '金貨を払って指南を受ける',
        effects: [{ kind: 'loseGold', amount: 35 }],
        choice: 'pickCard',
        outcome: '騎士は厳しく、しかし丁寧に技を授けてくれた。',
      },
    ],
  },
  {
    id: 'wishing-well',
    title: '願いの井戸',
    icon: '🪙',
    text: '底の見えない古井戸。水面のあたりで、投げ込まれた金貨がきらきらと光っている。',
    options: [
      {
        id: 'coin',
        label: '金貨を 1 枚投げる',
        effects: [
          { kind: 'loseGold', amount: 30 },
          { kind: 'gainMaxHp', amount: 4 },
        ],
        outcome: '小さな願いは、ささやかに叶えられた。',
      },
      {
        id: 'purse',
        label: '財布ごと投げ込む',
        effects: [
          { kind: 'loseGold', amount: 100 },
          { kind: 'gainRelic', tier: 'uncommon' },
        ],
        outcome: '井戸の底から、ひとつの宝が浮かび上がってきた。',
      },
    ],
  },
  {
    id: 'ancient-library',
    title: '古の書庫',
    icon: '📚',
    text: '崩れかけた塔の中に、天井まで届く書架が並んでいる。最奥の一冊だけが鎖で縛られている。',
    options: [
      {
        id: 'study',
        label: '戦術書を読みふける',
        effects: [],
        choice: 'pickCard',
        outcome: '夜が明けるまで読みふけり、新しい戦い方を身につけた。',
      },
      {
        id: 'forbidden',
        label: '鎖の禁書を開く',
        effects: [
          { kind: 'loseMaxHp', amount: 12 },
          { kind: 'changeDrawPerTurn', amount: 1 },
        ],
        outcome: '生命を吸われる感覚と引き換えに、戦場が一手先まで見えるようになった。',
      },
    ],
  },
  {
    id: 'traveling-alchemist',
    title: '旅の錬金術師',
    icon: '⚗️',
    text: '「新薬の実験台を探していてね。もちろん、普通に買ってくれてもいいんだよ」',
    options: [
      {
        id: 'buy',
        label: '薬を買う',
        effects: [
          { kind: 'loseGold', amount: 40 },
          { kind: 'fillPotions' },
        ],
        outcome: '鞄の中で、小瓶がかちゃりと鳴った。',
      },
      {
        id: 'test',
        label: '実験台になる',
        effects: [
          { kind: 'loseHp', amount: 10 },
          { kind: 'gainMaxHp', amount: 6 },
          { kind: 'addCard', card: ICE_SHARD },
        ],
        outcome: '体の芯が凍えたが、なぜか前より丈夫になった気がする。',
      },
    ],
  },
  {
    id: 'grasping-tree',
    title: '絡みつく大樹',
    icon: '🌳',
    text: '道を覆う大樹の枝が、生き物のようにうねっている。根元には旅人の荷物が埋もれている。',
    options: [
      {
        id: 'force',
        label: '枝を払いのけて荷物を掘り出す',
        effects: [
          { kind: 'loseHp', amount: 7 },
          { kind: 'gainGold', amount: 50 },
        ],
        outcome: '枝に打たれながらも、金貨の袋を掘り当てた。',
      },
      {
        id: 'sneak',
        label: '枝の間をすり抜ける',
        effects: [{ kind: 'addCard', card: TANGLING_VINE }],
        outcome: 'うまく抜けたと思ったが、蔦が一本ついてきていた。',
      },
    ],
  },
];

/** 章が進むほど代償が重くなる出来事。絵の無い呪い札は外し、代償は体力にした。 */
const CHAPTER_EVENTS: EventDefinition[] = [
  {
    id: 'wayside-fortune',
    title: '道端の占い',
    icon: '🌙',
    chapters: [1],
    text: '路傍で、占い師が札を並べている。「凶と吉、どちらを引きますか」',
    options: [
      {
        id: 'blessing',
        label: '吉を引く',
        effects: [{ kind: 'heal', amount: 12 }],
        outcome: '札は穏やかな絵だった。肩の力が抜けていく。',
      },
      {
        id: 'omen',
        label: '傷を負って、金貨を受け取る',
        effects: [
          { kind: 'loseHp', amount: 10 },
          { kind: 'gainGold', amount: 70 },
        ],
        outcome: '凶の札は胸をえぐった。代わりに、暖かい金貨の袋が渡された。',
      },
    ],
  },
  {
    id: 'roadside-stone',
    title: '路傍の石碑',
    icon: '🪨',
    chapters: [1],
    text: '苔むした石碑に、旅人の誓いが刻まれている。触れると、石がわずかに温かい。',
    options: [
      {
        id: 'offer',
        label: '金貨を供えて技を磨く',
        effects: [{ kind: 'loseGold', amount: 25 }],
        choice: 'upgradeCard',
        outcome: '石碑の文字が一度光り、技の輪郭がくっきりした。',
      },
      {
        id: 'vow',
        label: '血を誓って、生命を得る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'gainMaxHp', amount: 6 },
        ],
        outcome: '誓いの痛みが走り、体の底に静かな力が宿った。',
      },
    ],
  },
  {
    id: 'sealed-reliquary',
    title: '封じの聖櫃',
    icon: '📦',
    chapters: [2],
    text: '道の中央に、鎖で巻かれた小さな聖櫃がある。隙から、冷たい光が漏れている。',
    options: [
      {
        id: 'break',
        label: '封を破って中を取る',
        effects: [
          { kind: 'loseHp', amount: 14 },
          { kind: 'gainRelic', tier: 'uncommon' },
        ],
        outcome: '光とともに宝が転がり出た。封の反動で、腕に痛みが残っている。',
      },
      {
        id: 'buy',
        label: '金貨で、封を解かずに買う',
        effects: [
          { kind: 'loseGold', amount: 70 },
          { kind: 'gainRelic' },
        ],
        outcome: '鎖は解けなかった。櫃の脇に置かれた宝だけを、静かに受け取った。',
      },
    ],
  },
  {
    id: 'abandoned-banner',
    title: '捨てられた陣幕',
    icon: '🚩',
    chapters: [2],
    text: '風に鳴る陣幕の下に、武具と、読みかけの戦術書が残されている。',
    options: [
      {
        id: 'arm',
        label: '傷を負って武具を受け取る',
        effects: [{ kind: 'loseHp', amount: 8 }],
        choice: 'pickCard',
        outcome: '新しい技を得たが、陣幕の縁で腕を切った。',
      },
      {
        id: 'rest',
        label: '幕の陰で休む',
        effects: [{ kind: 'heal', amount: 18 }],
        outcome: '風の音を聞きながら、傷を休めた。',
      },
    ],
  },
  {
    id: 'abyss-whisper',
    title: '深淵の囁き',
    icon: '🌑',
    chapters: [3],
    text: '足元の割れ目から、名前を呼ぶ声がする。耳を貸すと、次の一手が見える気がした。',
    options: [
      {
        id: 'listen',
        label: '耳を貸す',
        effects: [
          { kind: 'loseMaxHp', amount: 8 },
          { kind: 'changeDrawPerTurn', amount: 1 },
        ],
        outcome: '視界が一段広くなった。その代わり、体の芯が細くなった。',
      },
      {
        id: 'refuse',
        label: '耳を塞いで離れる',
        effects: [{ kind: 'loseHp', amount: 6 }],
        outcome: '声は追いかけてこなかった。ただ、耳の奥がまだ痛い。',
      },
    ],
  },
  {
    id: 'fallen-crown',
    title: '落ちた冠',
    icon: '👑',
    chapters: [3],
    text: '石畳に、誰かの冠が転がっている。かぶれば王の力、溶かせば金になる。',
    options: [
      {
        id: 'wear',
        label: 'かぶる',
        effects: [
          { kind: 'loseHp', amount: 16 },
          { kind: 'gainMaxHp', amount: 10 },
        ],
        outcome: '冠は頭に吸いつき、体が強くなった。今の傷だけが、深く残っている。',
      },
      {
        id: 'melt',
        label: '溶かして金にする',
        effects: [
          { kind: 'loseHp', amount: 10 },
          { kind: 'gainGold', amount: 120 },
        ],
        outcome: '冠は熱を持って崩れ、金貨の山になった。手のひらがまだ熱い。',
      },
    ],
  },
];

/**
 * 全章に残すのは、回復・強化・少額の取引。
 * 第 1 章は穏やかな出会い、第 2 章は代償のある取引、第 3 章は重い決断。
 */
const CHAPTER_ONLY: Record<string, readonly number[]> = {
  'fairy-ring': [1],
  'wandering-bard': [1],
  'abandoned-camp': [1],
  'fusion-altar': [1],
  'grasping-tree': [1],
  'blood-merchant': [2],
  'sleeping-guardian': [2],
  'cursed-tome': [2],
  'knight-trial': [2],
  'traveling-alchemist': [2],
  pitfall: [2],
  'dragon-hoard': [3],
  'mirror-lake': [3],
  'ancient-library': [3],
};

/**
 * 手札の札を教える出来事。共通の出来事に戻すと、他のキャラの属性札が混ざるので、
 * そのキャラの候補だけに足す。
 */
export const KYLE_TECHNIQUE_EVENTS: readonly EventDefinition[] = [
  {
    id: 'cinder-practice',
    title: '火蓋の稽古',
    icon: '🔥',
    chapters: [1],
    text: '焼けた石の広場で、剣士が炎の素振りをしている。「最初の一振りは、考える前に出せ」',
    options: [
      {
        id: 'blade',
        label: 'HP を 6 払い、燼刃を受け取る',
        effects: [
          { kind: 'loseHp', amount: 6 },
          { kind: 'addCard', card: CINDER_BLADE },
        ],
        outcome: '炎の刃は、振らなければその場で消えると教わった。',
      },
      {
        id: 'open',
        label: 'HP を 6 払い、火蓋を受け取る',
        effects: [
          { kind: 'loseHp', amount: 6 },
          { kind: 'addCard', card: OPENING_FLAME },
        ],
        outcome: '戦いの最初に出す炎の一撃を、体が覚えた。',
      },
      {
        id: 'leave',
        label: '傷を癒して離れる',
        effects: [{ kind: 'heal', amount: 8 }],
        outcome: '炎の熱を背に、息を整えた。',
      },
    ],
  },
  {
    id: 'wildfire-stage',
    title: '燎原の舞台',
    icon: '🎭',
    chapters: [2],
    text: '誰もいない舞台の床が、まだ熱い。炎の型を書いた台本が、端から焦げている。',
    options: [
      {
        id: 'sweep',
        label: 'HP を 8 払い、燎原を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: WILDFIRE },
        ],
        outcome: '残した力の分だけ、炎が舞台いっぱいに走る型を覚えた。',
      },
      {
        id: 'echo',
        label: 'HP を 8 払い、残焔を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: LINGERING_FLAME },
        ],
        outcome: '一度振った炎が、もう一度だけ燃え残る打ち方を覚えた。',
      },
      {
        id: 'leave',
        label: '金貨を 25 受け取って離れる',
        effects: [{ kind: 'gainGold', amount: 25 }],
        outcome: '客席に落ちていた金貨を拾い、熱い舞台を後にした。',
      },
    ],
  },
  {
    id: 'falling-ember-wing',
    title: '落ち火の合図',
    icon: '✨',
    chapters: [3],
    text: '幕の袖で、小さな火の粉が床に落ちても、まだ赤く光っている。',
    options: [
      {
        id: 'ember',
        label: 'HP を 8 払い、落ち火を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: FALLING_EMBER },
        ],
        outcome: '手放した火の粉が、落ちた先でもう一度燃える型を覚えた。',
      },
      {
        id: 'leave',
        label: '傷を癒して離れる',
        effects: [{ kind: 'heal', amount: 10 }],
        outcome: '袖の暗がりで息を整え、舞台には上がらなかった。',
      },
    ],
  },
];

export const RINE_TECHNIQUE_EVENTS: readonly EventDefinition[] = [
  {
    id: 'dew-footing',
    title: '朝露の足場',
    icon: '🌿',
    chapters: [1],
    text: '森の入り口で、狩人が葉の上の露を指で弾いている。「残す露と、すぐ消える露がある」',
    options: [
      {
        id: 'dew',
        label: 'HP を 6 払い、朝露を受け取る',
        effects: [
          { kind: 'loseHp', amount: 6 },
          { kind: 'addCard', card: MORNING_DEW },
        ],
        outcome: '朝いちばんの露の受けを教わった。使わなければ、その場で消える。',
      },
      {
        id: 'roots',
        label: 'HP を 6 払い、根張りを受け取る',
        effects: [
          { kind: 'loseHp', amount: 6 },
          { kind: 'addCard', card: ROOTED_GUARD },
        ],
        outcome: '打ち終えたあとも根を解かない構えを覚えた。',
      },
      {
        id: 'leave',
        label: '傷を癒して離れる',
        effects: [{ kind: 'heal', amount: 8 }],
        outcome: '葉の匂いを吸っているうちに、息が整った。',
      },
    ],
  },
  {
    id: 'thorn-stage',
    title: '茨の舞台',
    icon: '🎭',
    chapters: [2],
    text: '茨に囲まれた空き地に、弓と、厚さの違う枝の壁が残されている。',
    options: [
      {
        id: 'fort',
        label: 'HP を 8 払い、茨砦を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: THORN_FORT },
        ],
        outcome: '残した力の分だけ厚くなる、茨の壁の型を覚えた。',
      },
      {
        id: 'measure',
        label: 'HP を 8 払い、矢尺を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: ARROW_MEASURE },
        ],
        outcome: '一本を外して、次の矢を番える間合いを教わった。',
      },
      {
        id: 'leave',
        label: '金貨を 25 受け取って離れる',
        effects: [{ kind: 'gainGold', amount: 25 }],
        outcome: '茨の根元に落ちていた金貨を拾い、空き地を出た。',
      },
    ],
  },
  {
    id: 'restring-signal',
    title: '弦の合図',
    icon: '🍃',
    chapters: [3],
    text: '木の陰で、予備の弦が風に鳴っている。今の弦を捨てて、張り直せという合図だ。',
    options: [
      {
        id: 'restring',
        label: 'HP を 8 払い、弦替えを受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: RESTRING },
        ],
        outcome: '手元の矢を二本外し、新しい矢を三本番える手順を覚えた。',
      },
      {
        id: 'leave',
        label: '傷を癒して離れる',
        effects: [{ kind: 'heal', amount: 10 }],
        outcome: '木陰で息を整え、弦には触れなかった。',
      },
    ],
  },
];

export const NOAH_TECHNIQUE_EVENTS: readonly EventDefinition[] = [
  {
    id: 'mist-basin',
    title: '霧の水鏡',
    icon: '💧',
    chapters: [1],
    text: '朝の水盤に霧がかかっている。占い師が水面を一度だけ叩く。「残すと、霧は消える」',
    options: [
      {
        id: 'mirror',
        label: 'HP を 6 払い、霧鏡を受け取る',
        effects: [
          { kind: 'loseHp', amount: 6 },
          { kind: 'addCard', card: MIST_MIRROR },
        ],
        outcome: '霧の受けを教わった。手に残したままにすると、その霧は消える。',
      },
      {
        id: 'spray',
        label: 'HP を 6 払い、しぶき打ちを受け取る',
        effects: [
          { kind: 'loseHp', amount: 6 },
          { kind: 'addCard', card: SPRAY_STRIKE },
        ],
        outcome: '一枚を水面へ落としてから、しぶきを飛ばす打ち方を覚えた。',
      },
      {
        id: 'leave',
        label: '傷を癒して離れる',
        effects: [{ kind: 'heal', amount: 8 }],
        outcome: '霧の冷たさで熱が引き、軽い傷が閉じた。',
      },
    ],
  },
  {
    id: 'returning-stage',
    title: '返し波の舞台',
    icon: '🎭',
    chapters: [2],
    text: '水を張った舞台で、一度引いた波が、岸へ戻ってきている。',
    options: [
      {
        id: 'ward',
        label: 'HP を 8 払い、返し波を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: RETURNING_WAVE },
        ],
        outcome: '手放した水が、戻るときに身を守る型を覚えた。',
      },
      {
        id: 'ebb',
        label: 'HP を 8 払い、引き潮を受け取る',
        effects: [
          { kind: 'loseHp', amount: 8 },
          { kind: 'addCard', card: EBB_TIDE },
        ],
        outcome: '引いていく潮が、次の札を二枚連れて戻る読み方を覚えた。',
      },
      {
        id: 'leave',
        label: '金貨を 25 受け取って離れる',
        effects: [{ kind: 'gainGold', amount: 25 }],
        outcome: '水底で光っていた金貨を拾い、舞台を後にした。',
      },
    ],
  },
  {
    id: 'double-reflection-wing',
    title: '映しの合図',
    icon: '🔮',
    chapters: [3],
    text: '幕の袖の水盤が、同じ波紋を二つ映している。次の一手を、水面がもう一度なぞれという合図だ。',
    options: [
      {
        id: 'reflect',
        label: '最大 HP を 4 払い、二重映しを受け取る',
        effects: [
          { kind: 'loseMaxHp', amount: 4 },
          { kind: 'addCard', card: DOUBLE_REFLECTION },
        ],
        outcome: '体の芯が細くなった代わりに、次の一手を水面がもう一度映す札が残った。',
      },
      {
        id: 'leave',
        label: '傷を癒して離れる',
        effects: [{ kind: 'heal', amount: 10 }],
        outcome: '袖の暗がりで息を整え、水盤には触れなかった。',
      },
    ],
  },
];

export const STANDARD_EVENTS: EventDefinition[] = [...EVENT_LIST, ...CHAPTER_EVENTS].map((event) => {
  const chapters = CHAPTER_ONLY[event.id];
  return chapters ? { ...event, chapters } : event;
});

/**
 * 水鏡のノアの出来事だけ。カイルとリーネの候補（STANDARD_EVENTS）には入れない。
 * 水力を使う札を一枚受け取るか、持っている札を一枚磨ける。
 */
export const BASIN_ORACLE: EventDefinition = {
  id: 'basin-oracle',
  title: '水面の籤',
  icon: '🔮',
  text: '浅い水盤に、透けた札が浮かんでいる。水力を要する札を一枚受け取るか、持っている札を一枚磨ける。',
  options: [
    {
      id: 'take-surge',
      label: 'HP を 6 払い、大波を受け取る',
      effects: [
        { kind: 'loseHp', amount: 6 },
        { kind: 'addCard', card: mirrorCard('ice-lance') },
      ],
      outcome: '水盤から大きな波の札が、手の中へ流れ込んだ。',
    },
    {
      id: 'take-gathering',
      label: '金貨 30 を払い、寄せ波を受け取る',
      effects: [
        { kind: 'loseGold', amount: 30 },
        { kind: 'addCard', card: mirrorCard('drop-rain') },
      ],
      outcome: '水面が揺れて、敵全体を洗う札が残った。',
    },
    {
      id: 'polish',
      label: 'HP を 8 払い、カードを 1 枚強化する',
      effects: [{ kind: 'loseHp', amount: 8 }],
      choice: 'upgradeCard',
      outcome: '水が札の縁を磨き、文字が濃くなった。',
    },
  ],
};
