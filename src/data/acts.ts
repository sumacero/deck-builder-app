import type { ActConfig, Region } from '../domain/act';
import { scaleEncounter, scaleEnemy, type ChapterScale } from '../logic/scaling';
import { STAR_DEVOURER } from './enemies';
import { REGION_ENEMIES } from './encounters';
import { STANDARD_ACT_MAP } from './mapConfigs';

/**
 * 章（敵の強さ）と地域（景色・BGM・敵の顔ぶれ）は独立している。どの章にもどの地域も出られ、
 * ランの開始時に章ごとに 1 つ、同じ地域が重ならないように選ばれる（pickActs）。
 */
type ChapterDef = {
  number: number;
  scale: ChapterScale;
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

const CHAPTERS: ChapterDef[] = [
  {
    number: 1,
    scale: { hp: 1, power: 1 },
    greetingBefore: 'ようこそ、旅の人。',
    greetingAfter: '出発の前に、ひとつ贈り物を選んで。',
  },
  {
    number: 2,
    scale: { hp: 1.6, power: 1.4 },
    greetingBefore: '最初の地を抜けたのね。',
    greetingAfter: 'さあ、また選んで。',
  },
  {
    number: 3,
    scale: { hp: 2.4, power: 1.95 },
    greetingBefore: 'ここが最後の道。',
    greetingAfter: 'この地の主の先で、星を喰らう魔皇が待っている。私の灯りを持っていって。',
  },
];

/** ラスボスは第 3 章の倍率で強くする（素の数値がボスより一段強い）。 */
export const FINAL_BOSS = scaleEnemy(STAR_DEVOURER, CHAPTERS[CHAPTERS.length - 1].scale);

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
    enemyPool: enemies.normal.map((encounter) => scaleEncounter(encounter, chapter.scale)),
    elitePool: enemies.elite.map((encounter) => scaleEncounter(encounter, chapter.scale)),
    bossPool: enemies.boss.map((encounter) => scaleEncounter(encounter, chapter.scale)),
    greeting: `${chapter.greetingBefore}${region.greeting}${chapter.greetingAfter}`,
    floorScaling: FLOOR_SCALING,
  };
}

/** この順に進む。各章は全地域が候補。 */
export const STANDARD_ACT_CHOICES: ActConfig[][] = CHAPTERS.map((chapter) =>
  REGIONS.map((region) => buildAct(chapter, region)),
);
