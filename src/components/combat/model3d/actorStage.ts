import type { ExpoWebGLRenderingContext } from 'expo-gl';
import {
  AdditiveBlending,
  BackSide,
  type BufferGeometry,
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  OctahedronGeometry,
  Path,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  Shape,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { ACTOR_FIGURE } from '../../../theme';
import type { ActorModel, AuraStyle, ModelPart, PartAnimation, PartShape } from './modelTypes';

/** 1 フレームごとに外から渡す姿勢。lean は相手への踏み込み、recoil は被弾ののけぞり（0〜1）。 */
export type ActorPose = { time: number; lean: number; recoil: number };

export type ActorStage = {
  render: (pose: ActorPose) => void;
  dispose: () => void;
};

const LEAN_ANGLE = 0.35;
const LEAN_STEP = 0.12;
const RECOIL_ANGLE = 0.3;
const FLAP_SPEED = 9;
const FLAP_ANGLE = 0.45;
const SPIN_SPEED = 0.9;
const SWAY_SPEED = 2.4;
const SWAY_ANGLE = 0.22;
const FLICKER_SPEED = 13;
const FLICKER_AMOUNT = 0.16;
const ORBIT_SPEED = 0.7;
const HOVER_SPEED = 2;
const HOVER_HEIGHT = 0.05;
/** 輪郭線の太さ（モデル座標）。 */
const OUTLINE_WIDTH = 0.022;
/** これより小さい部品（目など）には輪郭線を付けない。 */
const OUTLINE_MIN_EXTENT = 0.12;
/** 光る部品のまわりのにじみの幅（モデル座標）。 */
const HALO_WIDTH = 0.022;
/** これより小さい光る部品（目のハイライトなど）はにじませない。 */
const HALO_MIN_EXTENT = 0.05;
const MOTE_COUNT = 12;
const FLASH_STRENGTH = 0.75;
const WHITE = new Color(0xffffff);

function createGeometry(shape: PartShape): BufferGeometry {
  switch (shape.kind) {
    case 'box':
      return new BoxGeometry(...shape.size);
    case 'sphere':
      return new IcosahedronGeometry(shape.radius, 2);
    case 'cone':
      return new ConeGeometry(shape.radius, shape.height, shape.segments ?? 10);
    case 'cylinder':
      return new CylinderGeometry(
        shape.radiusTop,
        shape.radiusBottom,
        shape.height,
        shape.segments ?? 12,
      );
    case 'torus':
      return new TorusGeometry(shape.radius, shape.tube, 8, 28);
    case 'octahedron':
      return new OctahedronGeometry(shape.radius);
    case 'capsule':
      return new CapsuleGeometry(shape.radius, shape.length, 4, 10);
    case 'rock':
      return new IcosahedronGeometry(shape.radius, 0);
    case 'gear':
      return createGearGeometry(shape.radius, shape.teeth, shape.thickness);
  }
}

/** 歯車の形を押し出して作る。中心に軸の穴をあける。 */
function createGearGeometry(radius: number, teeth: number, thickness: number): BufferGeometry {
  const outline = new Shape();
  const inner = radius * 0.8;
  const steps = teeth * 4;
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    // 1 枚の歯 = 山・山・谷・谷の 4 点。
    const r = index % 4 < 2 ? radius : inner;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (index === 0) outline.moveTo(x, y);
    else outline.lineTo(x, y);
  }
  const hole = new Path();
  hole.absarc(0, 0, radius * 0.25, 0, Math.PI * 2, true);
  outline.holes.push(hole);
  const geometry = new ExtrudeGeometry(outline, { depth: thickness, bevelEnabled: false });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

const additive = (color: Color | string, opacity: number) =>
  new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
  });

/** 部品を少し太らせて裏面だけ描き、アニメ調の輪郭線にする（反転ハル法）。 */
function createOutline(
  geometry: BufferGeometry,
  extent: Vector3,
  partScale: Vector3,
  modelScale: number,
): Mesh {
  const thicken = (size: number, scale: number) =>
    1 + (2 * OUTLINE_WIDTH) / Math.max(size * Math.abs(scale) * modelScale, 0.01);
  const outline = new Mesh(
    geometry,
    new MeshBasicMaterial({ color: ACTOR_FIGURE.outline, side: BackSide }),
  );
  outline.scale.set(
    thicken(extent.x, partScale.x),
    thicken(extent.y, partScale.y),
    thicken(extent.z, partScale.z),
  );
  return outline;
}

type BuiltPart = { mesh: Mesh; material: MeshToonMaterial; halo: Mesh | null };

function createPart(part: ModelPart, modelScale: number): BuiltPart {
  const opacity = part.opacity ?? 1;
  const color = new Color(part.color);
  const material = new MeshToonMaterial({
    color,
    emissive: part.glow ? color : new Color(0x000000),
    emissiveIntensity: part.glow ? 1 : 0,
    transparent: opacity < 1,
    opacity,
  });
  const geometry = createGeometry(part.shape);
  const mesh = new Mesh(geometry, material);
  if (part.position) mesh.position.set(...part.position);
  if (part.rotation) mesh.rotation.set(...part.rotation);
  if (part.scale) mesh.scale.set(...part.scale);

  geometry.computeBoundingBox();
  const extent = new Vector3();
  geometry.boundingBox?.getSize(extent);
  if (opacity >= 1 && !part.glow && Math.max(extent.x, extent.y, extent.z) >= OUTLINE_MIN_EXTENT) {
    mesh.add(createOutline(geometry, extent, mesh.scale, modelScale));
  }
  let halo: Mesh | null = null;
  if (part.glow && Math.max(extent.x, extent.y, extent.z) >= HALO_MIN_EXTENT) {
    halo = new Mesh(geometry, additive(color, 0.35));
    const grow = (size: number) => 1 + (2 * HALO_WIDTH) / Math.max(size, 0.01);
    halo.scale.set(grow(extent.x), grow(extent.y), grow(extent.z));
    mesh.add(halo);
  }
  return { mesh, material, halo };
}

/** 足元でゆっくり回る魔法陣。 */
function createMagicCircle(color: string): Group {
  const circle = new Group();
  const material = additive(color, 0.5);
  circle.add(
    new Mesh(new RingGeometry(0.66, 0.7, 48), material),
    new Mesh(new RingGeometry(0.5, 0.52, 48), material),
    new Mesh(new RingGeometry(0.5, 0.66, 6, 1), additive(color, 0.12)),
    new Mesh(new RingGeometry(0.5, 0.66, 3, 1), additive(color, 0.18)),
  );
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = -0.99;
  return circle;
}

type Mote = { mesh: Mesh; material: MeshBasicMaterial; phase: number };

const MOTE_GEOMETRY: Record<AuraStyle, () => BufferGeometry> = {
  fire: () => new OctahedronGeometry(0.03),
  grass: () => new BoxGeometry(0.08, 0.012, 0.045),
  water: () => new IcosahedronGeometry(0.03, 1),
  thunder: () => new OctahedronGeometry(0.03).scale(0.6, 2.2, 0.6),
  arcane: () => new OctahedronGeometry(0.035),
};

/** キャラクターの周りを漂う粒。形と動きは aura の種類で変わる。 */
function createMotes(color: string, style: AuraStyle): Mote[] {
  const geometry = MOTE_GEOMETRY[style]();
  return Array.from({ length: MOTE_COUNT }, (_, index) => {
    const material = additive(color, 0);
    return { mesh: new Mesh(geometry, material), material, phase: index / MOTE_COUNT };
  });
}

/** 0〜1 の擬似乱数（粒ごとに決まった値）。 */
const hash = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

/** 粒 1 つぶんの位置・回転・濃さを、aura の種類ごとの動きで決める。 */
function placeMote({ mesh, material, phase }: Mote, style: AuraStyle, time: number): void {
  switch (style) {
    case 'fire': {
      // 足元から細かく揺れながら速く舞い上がり、上で消える火の粉。
      const progress = (time * 0.55 + phase) % 1;
      const x = (hash(phase * 7) - 0.5) * 1.3 + Math.sin(time * 6 + phase * 20) * 0.04;
      mesh.position.set(x, -0.95 + progress * 2.1, (hash(phase * 13) - 0.5) * 0.8);
      mesh.rotation.set(time * 3, time * 4 + phase * 6, 0);
      material.opacity = (1 - progress) * (0.7 + Math.sin(time * 20 + phase * 40) * 0.3);
      return;
    }
    case 'grass': {
      // 上からひらひらと舞い落ちる木の葉。
      const progress = (time * 0.18 + phase) % 1;
      const x = (hash(phase * 7) - 0.5) * 1.6 + Math.sin(time * 1.5 + phase * 9) * 0.18;
      mesh.position.set(x, 1.05 - progress * 2.05, (hash(phase * 13) - 0.5) * 0.9);
      mesh.rotation.set(Math.sin(time * 2 + phase * 5) * 1.2, time + phase * 6, Math.cos(time * 1.7) * 0.8);
      material.opacity = Math.sin(progress * Math.PI) * 0.9;
      return;
    }
    case 'water': {
      // ゆらゆらと立ちのぼって弾ける泡。
      const progress = (time * 0.22 + phase) % 1;
      const x = (hash(phase * 7) - 0.5) * 1.4 + Math.sin(time * 2.5 + phase * 11) * 0.06;
      mesh.position.set(x, -0.95 + progress * 2, (hash(phase * 13) - 0.5) * 0.8);
      mesh.scale.setScalar(0.6 + progress * 0.9);
      material.opacity = Math.sin(progress * Math.PI) * 0.75;
      return;
    }
    case 'thunder': {
      // 体のまわりのあちこちで一瞬だけ瞬く火花。
      const tick = Math.floor(time * 5 + phase * 3);
      const life = (time * 5 + phase * 3) % 1;
      const seed = tick * 1.37 + phase * 17;
      mesh.position.set((hash(seed) - 0.5) * 1.6, -0.8 + hash(seed + 1) * 1.8, (hash(seed + 2) - 0.5) * 0.8);
      mesh.rotation.set(0, 0, (hash(seed + 3) - 0.5) * 2);
      material.opacity = life < 0.35 ? 0.95 : 0;
      return;
    }
    case 'arcane': {
      // キャラクターの周りを螺旋状に立ちのぼる光の粒。
      const progress = (time * 0.3 + phase) % 1;
      const angle = phase * Math.PI * 2 + time * 0.6;
      mesh.position.set(Math.cos(angle) * 0.78, -0.95 + progress * 2, Math.sin(angle) * 0.5);
      mesh.rotation.y = time * 2 + phase * 6;
      material.opacity = Math.sin(progress * Math.PI) * 0.85;
      return;
    }
  }
}

type AnimatedPart = {
  mesh: Mesh;
  /** 支点のある部品の蝶番。はばたきはこれを回す。 */
  hinge: Group | null;
  flapAxis: 'x' | 'z';
  animation: PartAnimation;
  /** 位相のずれ（ラジアン）。 */
  offset: number;
  baseRotation: Vector3;
  basePosition: Vector3;
  baseScale: Vector3;
};

/** 部品ごとの小さな動き。置いたときの姿勢を基準に、そこからの揺れとして動かす。 */
function animatePart(part: AnimatedPart, time: number): void {
  const { mesh, hinge, flapAxis, animation, offset, baseRotation, basePosition, baseScale } = part;
  switch (animation) {
    case 'flapLeft':
    case 'flapRight': {
      const flap = Math.sin(time * FLAP_SPEED + offset) * FLAP_ANGLE * (animation === 'flapRight' ? 1 : -1);
      if (hinge) hinge.rotation[flapAxis] = flap;
      else mesh.rotation.z = baseRotation.z + flap;
      return;
    }
    case 'spin':
      mesh.rotation.y = baseRotation.y + time * SPIN_SPEED;
      return;
    case 'roll':
      mesh.rotation.z = baseRotation.z + time * SPIN_SPEED * (offset >= Math.PI ? -1 : 1);
      return;
    case 'sway':
      mesh.rotation.z = baseRotation.z + Math.sin(time * SWAY_SPEED + offset) * SWAY_ANGLE;
      return;
    case 'flicker': {
      const flicker = Math.sin(time * FLICKER_SPEED + offset) * 0.6 + Math.sin(time * 23 + offset) * 0.4;
      mesh.scale.set(
        baseScale.x * (1 - flicker * FLICKER_AMOUNT * 0.5),
        baseScale.y * (1 + flicker * FLICKER_AMOUNT),
        baseScale.z * (1 - flicker * FLICKER_AMOUNT * 0.5),
      );
      return;
    }
    case 'orbit': {
      const radius = Math.hypot(basePosition.x, basePosition.z);
      const angle = Math.atan2(basePosition.z, basePosition.x) + time * ORBIT_SPEED;
      mesh.position.set(
        Math.cos(angle) * radius,
        basePosition.y + Math.sin(time * HOVER_SPEED + offset) * HOVER_HEIGHT,
        Math.sin(angle) * radius,
      );
      mesh.rotation.y = baseRotation.y + time;
      return;
    }
    case 'hover':
      mesh.position.y = basePosition.y + Math.sin(time * HOVER_SPEED + offset) * HOVER_HEIGHT;
      return;
  }
}

/**
 * expo-gl のコンテキストを three.js に渡す。three.js はブラウザの <canvas> を前提にしているため、
 * 必要なプロパティだけを持つ代用品を渡す。
 */
function createRenderer(gl: ExpoWebGLRenderingContext): WebGLRenderer {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const canvas = {
    width,
    height,
    clientWidth: width,
    clientHeight: height,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    getContext: () => gl,
  };
  // expo-gl はテクスチャ用の一部のパラメータに未対応で、毎回警告を出すため握りつぶす。
  const pixelStorei = gl.pixelStorei.bind(gl);
  gl.pixelStorei = (pname: number, param: number | boolean) => {
    if (pname === gl.UNPACK_FLIP_Y_WEBGL) pixelStorei(pname, param);
  };
  // expo-gl の WebGL2 コンテキストは WebGLRenderingContext を継承しているため、
  // three.js の「WebGL1 は非対応」チェックに誤って引っかかる。生成の間だけ判定用のグローバルを隠す。
  const globals = globalThis as { WebGLRenderingContext?: unknown };
  const webgl1 = globals.WebGLRenderingContext;
  globals.WebGLRenderingContext = undefined;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas: canvas as unknown as HTMLCanvasElement,
      context: gl,
      alpha: true,
      antialias: true,
    });
  } finally {
    globals.WebGLRenderingContext = webgl1;
  }
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/**
 * キャラクター 1 体ぶんの小さな 3D 舞台を作る。セル塗り + 輪郭線のアニメ調で、
 * 足元の魔法陣・立ちのぼる光の粒・逆光のリムライトで RPG の戦闘らしく見せる。
 * facing は相手のいる向き（1: 右上の敵を見るプレイヤー、-1: 左下のプレイヤーを見る敵）。
 */
export function createActorStage(
  gl: ExpoWebGLRenderingContext,
  model: ActorModel,
  facing: 1 | -1,
): ActorStage {
  const renderer = createRenderer(gl);
  const scene = new Scene();
  const camera = new PerspectiveCamera(34, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 50);
  camera.position.set(0, 0.7, 4.4);
  camera.lookAt(0, -0.05, 0);

  const auraStyle: AuraStyle = model.aura ?? 'arcane';
  const auraColor = model.aura
    ? ACTOR_FIGURE.elementAura[model.aura]
    : facing === 1
      ? ACTOR_FIGURE.aura.player
      : ACTOR_FIGURE.aura.enemy;
  scene.add(new HemisphereLight(0xfff2d9, 0x2a2238, 1.2));
  const sun = new DirectionalLight(0xfff1d6, 2.2);
  sun.position.set(2 * facing, 3, 4);
  scene.add(sun);
  const rim = new DirectionalLight(ACTOR_FIGURE.rimLight, 2.4);
  rim.position.set(-2.5 * facing, 2, -3);
  scene.add(rim);

  const shadow = new Mesh(
    new CircleGeometry(0.62, 24),
    new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.0;
  scene.add(shadow);
  const magicCircle = createMagicCircle(auraColor);
  scene.add(magicCircle);
  const motes = createMotes(auraColor, auraStyle);
  motes.forEach(({ mesh }) => scene.add(mesh));

  // pivot: 浮遊・踏み込みの傾き（左右反転しない）。body: 向きと左右反転。
  const pivot = new Group();
  const body = new Group();
  const baseScale = model.scale ?? 1;
  body.scale.set(baseScale * facing, baseScale, baseScale);
  body.rotation.y = (model.yaw ?? 0) * facing;
  pivot.add(body);
  scene.add(pivot);

  const materials: { material: MeshToonMaterial; emissive: Color; intensity: number }[] = [];
  const halos: Mesh[] = [];
  const animated: AnimatedPart[] = [];
  for (const part of model.parts) {
    const { mesh, material, halo } = createPart(part, baseScale);
    // 支点がある部品は、支点に置いた蝶番（Group）にぶら下げて、蝶番ごと回す。
    let hinge: Group | null = null;
    if (part.pivot) {
      hinge = new Group();
      hinge.position.set(...part.pivot);
      mesh.position.sub(hinge.position);
      hinge.add(mesh);
      body.add(hinge);
    } else {
      body.add(mesh);
    }
    materials.push({
      material,
      emissive: material.emissive.clone(),
      intensity: material.emissiveIntensity,
    });
    if (halo) halos.push(halo);
    if (part.animation) {
      animated.push({
        mesh,
        hinge,
        flapAxis: part.flapAxis ?? 'z',
        animation: part.animation,
        offset: (part.phase ?? 0) * Math.PI * 2,
        baseRotation: new Vector3(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z),
        basePosition: mesh.position.clone(),
        baseScale: mesh.scale.clone(),
      });
    }
  }

  const applyIdle = (time: number) => {
    switch (model.idle) {
      case 'bob': {
        const breath = Math.sin(time * 2.2);
        pivot.position.y = breath * 0.025;
        body.scale.y = baseScale * (1 + breath * 0.015);
        break;
      }
      case 'float':
        pivot.position.y = 0.08 + Math.sin(time * 1.6) * 0.08;
        break;
      case 'squish': {
        const squash = Math.sin(time * 3);
        body.scale.y = baseScale * (1 + squash * 0.07);
        body.scale.x = baseScale * facing * (1 - squash * 0.035);
        body.scale.z = baseScale * (1 - squash * 0.035);
        break;
      }
    }
  };

  const applyAura = (time: number) => {
    magicCircle.rotation.z = time * 0.35 * facing;
    const glow = 0.85 + Math.sin(time * 2) * 0.15;
    magicCircle.scale.setScalar(glow * 0.1 + 0.92);
    for (const mote of motes) placeMote(mote, auraStyle, time);
    const haloPulse = 0.28 + Math.sin(time * 3.2) * 0.1;
    for (const halo of halos) {
      if (halo.material instanceof MeshBasicMaterial) halo.material.opacity = haloPulse;
    }
  };

  /** 被弾した瞬間、全身を白く光らせる（アニメのヒットフラッシュ）。 */
  const applyFlash = (recoil: number) => {
    const flash = recoil * FLASH_STRENGTH;
    for (const { material, emissive, intensity } of materials) {
      material.emissive.copy(emissive).lerp(WHITE, flash);
      material.emissiveIntensity = intensity + (1 - intensity) * flash;
    }
  };

  const render = ({ time, lean, recoil }: ActorPose) => {
    applyIdle(time);
    applyAura(time);
    applyFlash(recoil);
    // 上体を相手の方へ倒しつつ半歩踏み込む（プレイヤーは右、敵は左）。のけぞりは逆向き。
    pivot.rotation.z = (-lean * LEAN_ANGLE + recoil * RECOIL_ANGLE) * facing;
    pivot.position.x = (lean - recoil * 0.5) * LEAN_STEP * facing;
    for (const part of animated) animatePart(part, time);
    renderer.render(scene, camera);
    gl.endFrameEXP();
  };

  const dispose = () => {
    const geometries = new Set<BufferGeometry>();
    const disposables = new Set<{ dispose: () => void }>();
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach((material) => disposables.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    disposables.forEach((material) => material.dispose());
    renderer.dispose();
  };

  return { render, dispose };
}
