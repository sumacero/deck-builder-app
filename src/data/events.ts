import type { EventDefinition } from '../domain/event';
import { DEFEND, STRIKE, ULTIMATE_DEFEND, ULTIMATE_STRIKE } from './cards';

const LEAVE = { id: 'leave', label: '立ち去る', effects: [], outcome: 'あなたは先を急いだ。' };

/** 「？」マスのイベント。1 ランの中では、候補が残っている間は同じものが出ない。 */
export const STANDARD_EVENTS: EventDefinition[] = [
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
      LEAVE,
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
      LEAVE,
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
      LEAVE,
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
      LEAVE,
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
      LEAVE,
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
      LEAVE,
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
      LEAVE,
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
];
