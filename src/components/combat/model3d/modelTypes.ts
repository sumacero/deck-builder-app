/**
 * ローポリ 3D キャラクターの設計図。three.js に依存しない純粋なデータで、
 * 球・箱などの部品を並べてキャラクターを組み立てる。
 *
 * 座標系: 足元が y = -1、頭頂が y = 1 くらい。正面（カメラ側）が +z。
 * 武器など「相手に向ける側」は +x に置く（敵は描画側で左右反転する）。
 */
export type Vec3 = readonly [number, number, number];

export type PartShape =
  | { kind: 'box'; size: Vec3 }
  /** 低ポリの球（正二十面体を 1 回分割したもの）。 */
  | { kind: 'sphere'; radius: number }
  | { kind: 'cone'; radius: number; height: number; segments?: number }
  | {
      kind: 'cylinder';
      radiusTop: number;
      radiusBottom: number;
      height: number;
      segments?: number;
    }
  | { kind: 'torus'; radius: number; tube: number }
  | { kind: 'octahedron'; radius: number };

/** 部品ごとの小さな動き。flap は翼のはばたき、spin は y 軸まわりの回転。 */
export type PartAnimation = 'flapLeft' | 'flapRight' | 'spin';

export type ModelPart = {
  shape: PartShape;
  color: string;
  position?: Vec3;
  /** ラジアン。 */
  rotation?: Vec3;
  scale?: Vec3;
  /** 自ら光る（目・魔法の光など）。 */
  glow?: boolean;
  /** 1 未満で半透明。 */
  opacity?: number;
  animation?: PartAnimation;
};

/** 待機中の動き。bob は呼吸、float は浮遊、squish は伸び縮み。 */
export type IdleStyle = 'bob' | 'float' | 'squish';

export type ActorModel = {
  parts: ModelPart[];
  idle: IdleStyle;
  /** 全体の大きさ（ボスを大きく見せるなど）。 */
  scale?: number;
  /** 相手の方へ向ける y 軸の回転（ラジアン）。正面向きの人型は正、横向きの獣は負。 */
  yaw?: number;
};
