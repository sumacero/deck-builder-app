import type { MapConfig } from '../domain/map';

/** 各章共通。ボスを除いて 10 階、5 列、ルート 4 本。 */
export const STANDARD_ACT_MAP: MapConfig = {
  floors: 10,
  columns: 5,
  paths: 4,
  treasureFloor: 5,
  restAndEliteFromFloor: 3,
  typeWeights: { enemy: 50, event: 22, rest: 12, shop: 8, elite: 8 },
};
