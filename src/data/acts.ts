import type { ActConfig, Region } from '../domain/act';
import { CASTLE_PHANTOM, SLIME_KING, VOID_KING } from './enemies';
import {
  ACT1_ELITES,
  ACT1_ENCOUNTERS,
  ACT2_ELITES,
  ACT2_ENCOUNTERS,
  ACT3_ELITES,
  ACT3_ENCOUNTERS,
} from './encounters';
import { STANDARD_ACT_MAP } from './mapConfigs';

/**
 * 章（敵の強さ）と地域（景色・BGM）は独立している。どの章にもどの地域も出られ、
 * ランの開始時に章ごとに 1 つ、同じ地域が重ならないように選ばれる（pickActs）。
 */
type ChapterDef = {
  number: number;
  base: Pick<ActConfig, 'map' | 'enemyPool' | 'elitePool' | 'bossPool'>;
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

const CHAPTERS: ChapterDef[] = [
  {
    number: 1,
    base: { map: STANDARD_ACT_MAP, enemyPool: ACT1_ENCOUNTERS, elitePool: ACT1_ELITES, bossPool: [SLIME_KING] },
    greetingBefore: 'ようこそ、旅の人。',
    greetingAfter: '出発の前に、ひとつ贈り物を選んで。',
  },
  {
    number: 2,
    base: { map: STANDARD_ACT_MAP, enemyPool: ACT2_ENCOUNTERS, elitePool: ACT2_ELITES, bossPool: [CASTLE_PHANTOM] },
    greetingBefore: '最初の地を抜けたのね。',
    greetingAfter: 'さあ、また選んで。',
  },
  {
    number: 3,
    base: { map: STANDARD_ACT_MAP, enemyPool: ACT3_ENCOUNTERS, elitePool: ACT3_ELITES, bossPool: [VOID_KING] },
    greetingBefore: 'ここが最後の道。',
    greetingAfter: '奥で待つ王を倒せば、旅は終わる。私の灯りを持っていって。',
  },
];

/** イメージは 草 / 毒 / 水 / 火 / 氷（属性の仕組みは無い）。 */
const REGIONS: RegionDef[] = [
  { region: 'grassland', name: '風わたる草原', greeting: '風の気持ちいい草原ね。でも油断は禁物。' },
  { region: 'swamp', name: '霧の沼湿原', greeting: '霧が深くて足元も悪い沼地よ。毒の水には気をつけて。' },
  { region: 'sunkenCity', name: '水の古都', greeting: '水の底に沈んだ幻の都。水面に映る街並みに見とれないで。' },
  { region: 'desert', name: '灼熱の砂海', greeting: '果てしない砂の海よ。陽炎に惑わされないで。' },
  { region: 'snowfield', name: '白銀の氷原', greeting: '吐く息も凍る氷原よ。私の灯りで温まって。' },
];

function buildAct(chapter: ChapterDef, region: RegionDef): ActConfig {
  return {
    ...chapter.base,
    id: `act-${chapter.number}-${region.region}`,
    name: `第 ${chapter.number} 章　${region.name}`,
    region: region.region,
    greeting: `${chapter.greetingBefore}${region.greeting}${chapter.greetingAfter}`,
  };
}

/** この順に進む。各章は全地域が候補。 */
export const STANDARD_ACT_CHOICES: ActConfig[][] = CHAPTERS.map((chapter) =>
  REGIONS.map((region) => buildAct(chapter, region)),
);
