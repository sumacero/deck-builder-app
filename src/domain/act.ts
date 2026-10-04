import type { EnemyDefinition, Encounter } from './enemy';
import type { MapConfig } from './map';

/**
 * 章の舞台になる地域。背景画像と BGM はこれで決まる。
 * 属性の仕組みは無いが、イメージは 草 / 毒 / 水 / 火 / 氷。
 */
export type Region = 'grassland' | 'swamp' | 'sunkenCity' | 'desert' | 'snowfield';

/** 1 つの章。マップの形と、出てくる敵の候補を持つ。 */
export type ActConfig = {
  id: string;
  name: string;
  region: Region;
  map: MapConfig;
  enemyPool: Encounter[];
  elitePool: Encounter[];
  /** 章の開始時に 1 体選ばれ、その章のボスになる。 */
  bossPool: EnemyDefinition[];
  /** 章の最初に案内役がかける言葉。 */
  greeting: string;
};
