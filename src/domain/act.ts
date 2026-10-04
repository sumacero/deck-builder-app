import type { EnemyDefinition } from './enemy';
import type { MapConfig } from './map';

/** 1 つの章。マップの形と、出てくる敵の候補を持つ。 */
export type ActConfig = {
  id: string;
  name: string;
  map: MapConfig;
  enemyPool: EnemyDefinition[];
  elitePool: EnemyDefinition[];
  /** 章の開始時に 1 体選ばれ、その章のボスになる。 */
  bossPool: EnemyDefinition[];
  /** 章の最初に案内役がかける言葉。 */
  greeting: string;
};
