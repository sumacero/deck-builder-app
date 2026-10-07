import type { Encounter } from './enemy';
import type { MapConfig } from './map';

/**
 * 章の舞台になる地域。背景画像・BGM・出てくる敵の性質はこれで決まる。
 * 火山 = 火・岩 / 草原 = 草・風 / 水の古都 = 水・氷 / 歯車塔 = 電・機械。
 */
export type Region = 'volcano' | 'grassland' | 'sunkenCity' | 'clockwork';

/** 1 つの章。マップの形と、出てくる敵の候補を持つ。 */
export type ActConfig = {
  id: string;
  name: string;
  region: Region;
  map: MapConfig;
  enemyPool: Encounter[];
  elitePool: Encounter[];
  /** 章の開始時に 1 つ選ばれ、その章のボス戦になる（ボスと取り巻き）。 */
  bossPool: Encounter[];
  /** 章の最初に案内役がかける言葉。 */
  greeting: string;
  /**
   * 章の中での強さの伸び。敵の HP・攻撃などに start + perFloor × 階（0 始まり）をかける。
   * 章の倍率（敵の候補に適用済み）はボスの階での強さにあたり、序盤はそれより弱い。
   */
  floorScaling: { start: number; perFloor: number };
};
