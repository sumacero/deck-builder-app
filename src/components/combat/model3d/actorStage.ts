import type { ExpoWebGLRenderingContext } from 'expo-gl';
import {
  type BufferGeometry,
  BoxGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three';
import type { ActorModel, ModelPart, PartAnimation, PartShape } from './modelTypes';

/** 1 フレームごとに外から渡す姿勢。lean は相手への踏み込み、recoil は被弾ののけぞり（0〜1）。 */
export type ActorPose = { time: number; lean: number; recoil: number };

export type ActorStage = {
  render: (pose: ActorPose) => void;
  dispose: () => void;
};

const LEAN_ANGLE = 0.35;
const RECOIL_ANGLE = 0.3;
const FLAP_SPEED = 9;
const FLAP_ANGLE = 0.45;
const SPIN_SPEED = 0.9;

function createGeometry(shape: PartShape): BufferGeometry {
  switch (shape.kind) {
    case 'box':
      return new BoxGeometry(...shape.size);
    case 'sphere':
      return new IcosahedronGeometry(shape.radius, 1);
    case 'cone':
      return new ConeGeometry(shape.radius, shape.height, shape.segments ?? 7);
    case 'cylinder':
      return new CylinderGeometry(
        shape.radiusTop,
        shape.radiusBottom,
        shape.height,
        shape.segments ?? 8,
      );
    case 'torus':
      return new TorusGeometry(shape.radius, shape.tube, 6, 20);
    case 'octahedron':
      return new OctahedronGeometry(shape.radius);
  }
}

function createMesh(part: ModelPart): Mesh {
  const opacity = part.opacity ?? 1;
  const material = new MeshStandardMaterial({
    color: new Color(part.color),
    flatShading: true,
    roughness: 0.75,
    metalness: 0.05,
    emissive: part.glow ? new Color(part.color) : new Color(0x000000),
    emissiveIntensity: part.glow ? 0.9 : 0,
    transparent: opacity < 1,
    opacity,
  });
  const mesh = new Mesh(createGeometry(part.shape), material);
  if (part.position) mesh.position.set(...part.position);
  if (part.rotation) mesh.rotation.set(...part.rotation);
  if (part.scale) mesh.scale.set(...part.scale);
  return mesh;
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
 * キャラクター 1 体ぶんの小さな 3D 舞台を作る。
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

  scene.add(new HemisphereLight(0xfff2d9, 0x2a2238, 1.4));
  const sun = new DirectionalLight(0xffffff, 1.8);
  sun.position.set(2 * facing, 3, 4);
  scene.add(sun);

  const shadow = new Mesh(
    new CircleGeometry(0.62, 16),
    new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.0;
  scene.add(shadow);

  // pivot: 浮遊・踏み込みの傾き（左右反転しない）。body: 向きと左右反転。
  const pivot = new Group();
  const body = new Group();
  const baseScale = model.scale ?? 1;
  body.scale.set(baseScale * facing, baseScale, baseScale);
  body.rotation.y = (model.yaw ?? 0) * facing;
  pivot.add(body);
  scene.add(pivot);

  const animated: {
    mesh: Mesh;
    animation: PartAnimation;
    baseZ: number;
    baseY: number;
  }[] = [];
  for (const part of model.parts) {
    const mesh = createMesh(part);
    body.add(mesh);
    if (part.animation) {
      animated.push({
        mesh,
        animation: part.animation,
        baseZ: mesh.rotation.z,
        baseY: mesh.rotation.y,
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

  const render = ({ time, lean, recoil }: ActorPose) => {
    applyIdle(time);
    // 上体を相手の方へ倒す（プレイヤーは右、敵は左）。のけぞりは逆向き。
    pivot.rotation.z = (-lean * LEAN_ANGLE + recoil * RECOIL_ANGLE) * facing;
    for (const { mesh, animation, baseZ, baseY } of animated) {
      if (animation === 'spin') {
        mesh.rotation.y = baseY + time * SPIN_SPEED;
        continue;
      }
      const flap = Math.sin(time * FLAP_SPEED) * FLAP_ANGLE;
      mesh.rotation.z = baseZ + (animation === 'flapRight' ? flap : -flap);
    }
    renderer.render(scene, camera);
    gl.endFrameEXP();
  };

  const dispose = () => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material.dispose());
    });
    renderer.dispose();
  };

  return { render, dispose };
}
