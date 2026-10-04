import type { EnemyDefinition, Encounter } from './enemy';
import type { MapConfig } from './map';

/** 章の舞台になる地域。背景画像と BGM はこれで決まる。 */
export type Region =
  | 'grassland'
  | 'swamp'
  | 'cave'
  | 'desert'
  | 'snowfield'
  | 'castle'
  | 'volcano'
  | 'shadow'
  | 'stars';

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
