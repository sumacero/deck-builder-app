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
  /** 低ポリの球（正二十面体を 2 回分割したもの）。 */
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
  | { kind: 'octahedron'; radius: number }
  /** 両端の丸い円柱（手足・尾など）。length は丸みを除いた胴の長さ。 */
  | { kind: 'capsule'; radius: number; length: number }
  /** 角ばった岩・結晶（分割しない正二十面体）。 */
  | { kind: 'rock'; radius: number }
  /** 歯車。xy 平面に置かれ、正面（+z）を向く。 */
  | { kind: 'gear'; radius: number; teeth: number; thickness: number };

/**
 * 部品ごとの小さな動き。
 * - flapLeft / flapRight: 翼のはばたき
 * - spin: y 軸まわりの回転（浮かぶ結晶・コマのように回るもの）
 * - roll: 部品自身の z 軸まわりの回転（歯車・光の輪）
 * - sway: z 軸まわりにゆっくり揺れる（尾・ひれ・触手・葉）
 * - flicker: 炎のように伸び縮みする
 * - orbit: モデルの中心（y 軸）のまわりを回る（浮かぶ岩・氷片）
 * - hover: その場で上下にふわふわ浮く
 */
export type PartAnimation =
  | 'flapLeft'
  | 'flapRight'
  | 'spin'
  | 'roll'
  | 'sway'
  | 'flicker'
  | 'orbit'
  | 'hover';

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
  /**
   * 動きの支点（モデル座標）。翼の付け根など。省略すると部品の中心で回る。
   */
  pivot?: Vec3;
  /** はばたきの回転軸。正面向きの翼は z（既定）、横向きの獣の翼は x。 */
  flapAxis?: 'x' | 'z';
  /**
   * 動きの位相（0〜1）。同じ動きの部品をずらして、揃いすぎないようにする。
   * roll では 0.5 以上で逆回転になる（噛み合う歯車を逆に回すため）。
   */
  phase?: number;
  /** 動く関節にぶら下げる（腕・武器）。モデルに rig が無ければ無視される。 */
  bone?: Bone;
  /** whip: ムチを振るっている間だけ見える（手に持つムチ）。 */
  showWith?: 'whip';
  /** whip: ムチを振るっている間は隠す（腰に吊るしたムチ）。 */
  hideWith?: 'whip';
};

/**
 * 攻撃の動きで回す関節。arm = 武器を持つ腕（肩が支点）、weapon = 武器（手首が支点、arm と一緒に動く）、
 * offArm = 反対の腕（肩が支点）。
 */
export type Bone = 'arm' | 'weapon' | 'offArm';

/** 関節の支点（モデル座標）。 */
export type Rig = Record<Bone, Vec3>;

/** 待機中の動き。bob は呼吸、float は浮遊、squish は伸び縮み。 */
export type IdleStyle = 'bob' | 'float' | 'squish';

/**
 * 足元の魔法陣と、まわりを漂う粒の種類。属性・地域に合わせる。
 * fire = 舞い上がる火の粉 / grass = 舞い落ちる木の葉 / water = 立ちのぼる泡 /
 * thunder = 瞬く火花 / arcane = 紫の光の粒（属性なし）。
 */
export type AuraStyle = 'fire' | 'grass' | 'water' | 'thunder' | 'arcane';

export type ActorModel = {
  parts: ModelPart[];
  idle: IdleStyle;
  /** 全体の大きさ（ボスを大きく見せるなど）。 */
  scale?: number;
  /** 相手の方へ向ける y 軸の回転（ラジアン）。正面向きの人型は正、横向きの獣は負。 */
  yaw?: number;
  /** 省略時はプレイヤー = 金、敵 = arcane。 */
  aura?: AuraStyle;
  /** 腕と武器を動かせる人型。攻撃・被弾の動きで使う。 */
  rig?: Rig;
};
