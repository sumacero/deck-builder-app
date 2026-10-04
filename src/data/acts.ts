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

export const ACT1: ActConfig = {
  id: 'act-1',
  name: '第 1 章　苔むす洞窟',
  map: STANDARD_ACT_MAP,
  enemyPool: ACT1_ENCOUNTERS,
  elitePool: ACT1_ELITES,
  bossPool: [SLIME_KING],
  greeting: 'ようこそ、旅の人。この先は暗い洞窟。灯りの代わりに、ひとつ贈り物を選んで。',
};

export const ACT2: ActConfig = {
  id: 'act-2',
  name: '第 2 章　錆びた城塞',
  map: STANDARD_ACT_MAP,
  enemyPool: ACT2_ENCOUNTERS,
  elitePool: ACT2_ELITES,
  bossPool: [CASTLE_PHANTOM],
  greeting: '洞窟を抜けたのね。城塞の亡霊たちは手強いわ。さあ、また選んで。',
};

export const ACT3: ActConfig = {
  id: 'act-3',
  name: '第 3 章　星の頂',
  map: STANDARD_ACT_MAP,
  enemyPool: ACT3_ENCOUNTERS,
  elitePool: ACT3_ELITES,
  bossPool: [VOID_KING],
  greeting: 'ここが最後の道。頂で待つ王を倒せば、旅は終わる。私の灯りを持っていって。',
};

export const STANDARD_ACTS: ActConfig[] = [ACT1, ACT2, ACT3];
