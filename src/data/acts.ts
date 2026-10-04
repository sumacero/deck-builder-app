import type { ActConfig } from '../domain/act';
import {
  CASTLE_BAT,
  CASTLE_PHANTOM,
  CAVE_HOUND,
  CAVE_SLIME,
  FANG_RAT,
  HEX_MAGE,
  IRON_EXECUTIONER,
  ROTTING_SOLDIER,
  RUSTED_KNIGHT,
  SKY_EAGLE,
  SLIME_KING,
  STAR_EATER,
  STARDUST_SOLDIER,
  STONE_GUARDIAN,
  TIME_KEEPER,
  VOID_EYE,
  VOID_KING,
  WILL_O_WARDEN,
} from './enemies';
import { STANDARD_ACT_MAP } from './mapConfigs';

export const ACT1: ActConfig = {
  id: 'act-1',
  name: '第 1 章　苔むす洞窟',
  map: STANDARD_ACT_MAP,
  enemyPool: [CAVE_SLIME, FANG_RAT, ROTTING_SOLDIER],
  elitePool: [CAVE_HOUND, STONE_GUARDIAN],
  bossPool: [SLIME_KING],
  greeting: 'ようこそ、旅の人。この先は暗い洞窟。灯りの代わりに、ひとつ贈り物を選んで。',
};

export const ACT2: ActConfig = {
  id: 'act-2',
  name: '第 2 章　錆びた城塞',
  map: STANDARD_ACT_MAP,
  enemyPool: [RUSTED_KNIGHT, HEX_MAGE, CASTLE_BAT],
  elitePool: [IRON_EXECUTIONER, WILL_O_WARDEN],
  bossPool: [CASTLE_PHANTOM],
  greeting: '洞窟を抜けたのね。城塞の亡霊たちは手強いわ。さあ、また選んで。',
};

export const ACT3: ActConfig = {
  id: 'act-3',
  name: '第 3 章　星の頂',
  map: STANDARD_ACT_MAP,
  enemyPool: [STARDUST_SOLDIER, VOID_EYE, SKY_EAGLE],
  elitePool: [STAR_EATER, TIME_KEEPER],
  bossPool: [VOID_KING],
  greeting: 'ここが最後の道。頂で待つ王を倒せば、旅は終わる。私の灯りを持っていって。',
};

export const STANDARD_ACTS: ActConfig[] = [ACT1, ACT2, ACT3];
