export type MapNodeType = 'enemy' | 'elite' | 'rest' | 'shop' | 'event' | 'treasure' | 'boss';

/** 重み付き抽選で決めるマスの種類。宝箱・ボスは決まった階に置く。 */
export type RandomNodeType = Extract<MapNodeType, 'enemy' | 'elite' | 'rest' | 'shop' | 'event'>;

export type MapNode = {
  id: string;
  /** 0 が一番下（スタート側）。 */
  floor: number;
  column: number;
  type: MapNodeType;
  /** 1 つ上の階で進めるマスの id。 */
  next: string[];
};

export type GameMap = {
  /** ボスの階を含む階数。 */
  floorCount: number;
  columns: number;
  nodes: MapNode[];
  bossId: string;
};

export type MapConfig = {
  /** ボスを除く階数。 */
  floors: number;
  columns: number;
  /** 下から伸ばすルートの本数。重なった部分は合流する。 */
  paths: number;
  treasureFloor: number;
  /** この階より前には休憩所・エリートを置かない。 */
  restAndEliteFromFloor: number;
  typeWeights: Record<RandomNodeType, number>;
};
