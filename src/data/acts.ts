import type { ActConfig, Region } from '../domain/act';
import { scaleEncounter, scaleEnemy, type ChapterScale } from '../logic/scaling';
import { STAR_DEVOURER } from './enemies';
import { REGION_ENEMIES } from './encounters';
import { STANDARD_ACT_MAP } from './mapConfigs';

/**
 * 章（敵の強さ）と地域（景色・BGM・敵の顔ぶれ）は独立している。どの章にもどの地域も出られ、
 * ランの開始時に章ごとに 1 つ、同じ地域が重ならないように選ばれる（pickActs）。
 * 第 1 章だけ、エージェント属性に不利な地域は出さない（カイル→水の古都、リーネ→火山、ノア→草原）。
 */
type ChapterDef = {
  number: number;
  /** 通常の敵とエリートの強さ。 */
  road: ChapterScale;
  /** ボスの強さ。道中とは別に決め、ボスだけが壁にならないようにする。 */
  boss: ChapterScale;
  /** 案内役のセリフの前後。間に地域の一言が入る。 */
  greetingBefore: string;
  greetingAfter: string;
};

type RegionDef = {
  region: Region;
  name: string;
  /** 案内役が地域について言う一言。 */
  greeting: string;
};

/** 1 階目は章の強さの 80%、1 階ごとに +2% で、ボスの階（11 階目）でちょうど 100%。 */
const FLOOR_SCALING = { start: 0.8, perFloor: 0.02 };

/**
 * 章が進むほど敵だけ強くする（プレイヤー側の自動強化は無し）。
 * 2026-10-18: 「到達した章の通過率」が揃うよう調整（カイル any・上手い自動プレイで各章おおむね 24〜28%）。
 * 以前は 2・3 章の道中が急に跳ねて、到達分母の通過率が 23% → 17% → 6% と落ちていた。
 */
const CHAPTERS: ChapterDef[] = [
  {
    number: 1,
    road: { hp: 1.15, power: 1.12 },
    boss: { hp: 1, power: 1 },
    greetingBefore: 'ようこそ、旅の人。',
    greetingAfter: '出発の前に、ひとつ贈り物を選んで。',
  },
  {
    number: 2,
    road: { hp: 1.55, power: 1.35 },
    boss: { hp: 1.3, power: 1.2 },
    greetingBefore: '最初の地を抜けたのね。',
    greetingAfter: 'さあ、また選んで。',
  },
  {
    number: 3,
    road: { hp: 2.3, power: 1.85 },
    boss: { hp: 1.62, power: 1.4 },
    greetingBefore: 'ここが最後の道。',
    greetingAfter: 'この地の主の先で、星を喰らう魔皇が待っている。私の灯りを持っていって。',
  },
];

/** ラスボスの倍率（素の数値が章のボスより一段強い）。 */
const FINAL_SCALE: ChapterScale = { hp: 1.95, power: 1.52 };
export const FINAL_BOSS = scaleEnemy(STAR_DEVOURER, FINAL_SCALE);

const REGIONS: RegionDef[] = [
  {
    region: 'volcano',
    name: '紅蓮の火山',
    greeting: '燃える山よ。ここの魔物は力と守りだけで押してくる。正面から受け止めて。',
  },
  {
    region: 'grassland',
    name: '風わたる草原',
    greeting: '風の気持ちいい草原ね。すばしこくて傷の治りも早い相手が多いわ。',
  },
  {
    region: 'sunkenCity',
    name: '水の古都',
    greeting: '水の底に沈んだ幻の都。冷たい魔力で動きを封じてくるから気をつけて。',
  },
  {
    region: 'clockwork',
    name: '雷鳴の歯車塔',
    greeting: '雷の鳴りやまない歯車の塔よ。光を溜め始めたら、大技の合図。',
  },
];

function buildAct(chapter: ChapterDef, region: RegionDef): ActConfig {
  const enemies = REGION_ENEMIES[region.region];
  return {
    id: `act-${chapter.number}-${region.region}`,
    name: `第 ${chapter.number} 章　${region.name}`,
    region: region.region,
    map: STANDARD_ACT_MAP,
    enemyPool: enemies.normal.map((encounter) => scaleEncounter(encounter, chapter.road)),
    elitePool: enemies.elite.map((encounter) => scaleEncounter(encounter, chapter.road)),
    bossPool: enemies.boss.map((encounter) => scaleEncounter(encounter, chapter.boss)),
    greeting: `${chapter.greetingBefore}${region.greeting}${chapter.greetingAfter}`,
    floorScaling: FLOOR_SCALING,
  };
}

/** この順に進む。各章は全地域が候補。 */
export const STANDARD_ACT_CHOICES: ActConfig[][] = CHAPTERS.map((chapter) =>
  REGIONS.map((region) => buildAct(chapter, region)),
);
