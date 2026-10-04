import type { ActConfig } from '../domain/act';
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
 * 章ごとに、舞台になる地域の候補がある。ランの開始時に章ごとに 1 つ選ばれる。
 * 同じ章の地域は敵・ボスが共通で、景色・BGM・案内役のセリフだけが違う。
 */
const ACT1_BASE = {
  map: STANDARD_ACT_MAP,
  enemyPool: ACT1_ENCOUNTERS,
  elitePool: ACT1_ELITES,
  bossPool: [SLIME_KING],
};

const ACT2_BASE = {
  map: STANDARD_ACT_MAP,
  enemyPool: ACT2_ENCOUNTERS,
  elitePool: ACT2_ELITES,
  bossPool: [CASTLE_PHANTOM],
};

const ACT3_BASE = {
  map: STANDARD_ACT_MAP,
  enemyPool: ACT3_ENCOUNTERS,
  elitePool: ACT3_ELITES,
  bossPool: [VOID_KING],
};

// ---------- 第 1 章 ----------

export const ACT1: ActConfig = {
  ...ACT1_BASE,
  id: 'act-1',
  name: '第 1 章　苔むす洞窟',
  region: 'cave',
  greeting: 'ようこそ、旅の人。この先は暗い洞窟。灯りの代わりに、ひとつ贈り物を選んで。',
};

export const ACT1_GRASSLAND: ActConfig = {
  ...ACT1_BASE,
  id: 'act-1-grassland',
  name: '第 1 章　風わたる草原',
  region: 'grassland',
  greeting: 'ようこそ、旅の人。風の気持ちいい草原ね。でも油断は禁物。出発の前に、ひとつ選んで。',
};

export const ACT1_SWAMP: ActConfig = {
  ...ACT1_BASE,
  id: 'act-1-swamp',
  name: '第 1 章　霧の沼湿原',
  region: 'swamp',
  greeting: 'ようこそ、旅の人。霧が深くて足元も悪い沼地よ。迷わないよう、ひとつ贈り物を選んで。',
};

// ---------- 第 2 章 ----------

export const ACT2: ActConfig = {
  ...ACT2_BASE,
  id: 'act-2',
  name: '第 2 章　黄昏の城塞',
  region: 'castle',
  greeting: '最初の地を抜けたのね。城塞の亡霊たちは手強いわ。さあ、また選んで。',
};

export const ACT2_DESERT: ActConfig = {
  ...ACT2_BASE,
  id: 'act-2-desert',
  name: '第 2 章　灼熱の砂海',
  region: 'desert',
  greeting: '最初の地を抜けたのね。ここは果てしない砂の海。陽炎に惑わされないで。さあ、また選んで。',
};

export const ACT2_SNOWFIELD: ActConfig = {
  ...ACT2_BASE,
  id: 'act-2-snowfield',
  name: '第 2 章　白銀の氷原',
  region: 'snowfield',
  greeting: '最初の地を抜けたのね。吐く息も凍る氷原よ。私の灯りで温まって。さあ、また選んで。',
};

// ---------- 第 3 章 ----------

export const ACT3: ActConfig = {
  ...ACT3_BASE,
  id: 'act-3',
  name: '第 3 章　星の頂',
  region: 'stars',
  greeting: 'ここが最後の道。頂で待つ王を倒せば、旅は終わる。私の灯りを持っていって。',
};

export const ACT3_VOLCANO: ActConfig = {
  ...ACT3_BASE,
  id: 'act-3-volcano',
  name: '第 3 章　紅蓮の火山',
  region: 'volcano',
  greeting: 'ここが最後の道。燃える山の奥で王が待っている。炎に負けない灯りを持っていって。',
};

export const ACT3_SHADOW: ActConfig = {
  ...ACT3_BASE,
  id: 'act-3-shadow',
  name: '第 3 章　影の深淵',
  region: 'shadow',
  greeting: 'ここが最後の道。光の届かない影の世界よ。私の灯りだけは、決して消さないで。',
};

/** この順に進む。各章は候補の中から 1 つの地域が選ばれる。 */
export const STANDARD_ACT_CHOICES: ActConfig[][] = [
  [ACT1, ACT1_GRASSLAND, ACT1_SWAMP],
  [ACT2, ACT2_DESERT, ACT2_SNOWFIELD],
  [ACT3, ACT3_VOLCANO, ACT3_SHADOW],
];
