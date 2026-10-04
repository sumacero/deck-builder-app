import type { ActorModel, ModelPart, Vec3 } from './modelTypes';

/**
 * キャラクターの「型」ごとの組み立て関数。色や装備を変えるだけで別のキャラクターを作れる。
 */

const EYE_COLOR = '#111111';

const box = (size: Vec3, color: string, position: Vec3, extra?: Partial<ModelPart>): ModelPart => ({
  shape: { kind: 'box', size },
  color,
  position,
  ...extra,
});

const sphere = (
  radius: number,
  color: string,
  position: Vec3,
  extra?: Partial<ModelPart>,
): ModelPart => ({
  shape: { kind: 'sphere', radius },
  color,
  position,
  ...extra,
});

const cone = (
  radius: number,
  height: number,
  color: string,
  position: Vec3,
  extra?: Partial<ModelPart>,
): ModelPart => ({
  shape: { kind: 'cone', radius, height },
  color,
  position,
  ...extra,
});

const cylinder = (
  radius: number,
  height: number,
  color: string,
  position: Vec3,
  extra?: Partial<ModelPart>,
): ModelPart => ({
  shape: { kind: 'cylinder', radiusTop: radius, radiusBottom: radius, height },
  color,
  position,
  ...extra,
});

/** 頭の上に乗せる王冠。y は王冠の底の高さ。 */
function crown(y: number, color = '#E2B53E', width = 0.26): ModelPart[] {
  const spikes = [-1, 0, 1].map((step) =>
    cone(0.06, 0.16, color, [step * width * 0.6, y + 0.17, 0]),
  );
  return [cylinder(width, 0.12, color, [0, y + 0.06, 0]), ...spikes];
}

// ---------- 人型 ----------

export type Headgear = 'hood' | 'helmet' | 'wizardHat' | 'horns' | 'crown' | 'none';
export type Weapon = 'sword' | 'axe' | 'staff' | 'spear' | 'club' | 'none';

export type HumanoidOptions = {
  skin: string;
  body: string;
  legs: string;
  accent?: string;
  headgear?: Headgear;
  weapon?: Weapon;
  shield?: boolean;
  /** 光る目（アンデッドなど）。 */
  eyeColor?: string;
  /** マント。 */
  cape?: string;
  /** 前髪。 */
  hair?: string;
};

/** 額にかかる前髪。 */
function bangs(color: string): ModelPart[] {
  return [-0.12, -0.04, 0.04, 0.12].map((x, index) =>
    cone(0.06, 0.15, color, [x, 0.5, 0.18], {
      rotation: [Math.PI + 0.7, 0, (index - 1.5) * 0.3],
    }),
  );
}

/** 目に入れるアニメ調のハイライト。 */
const eyeShine = (x: number, y: number, z: number): ModelPart =>
  sphere(0.018, '#FFFFFF', [x + 0.012, y + 0.018, z], { glow: true });

function headgearParts(headgear: Headgear, color: string): ModelPart[] {
  switch (headgear) {
    case 'hood':
      return [
        sphere(0.28, color, [0, 0.42, -0.04], { scale: [1, 1.05, 1] }),
        cone(0.2, 0.3, color, [0, 0.72, -0.08], { rotation: [-0.4, 0, 0] }),
      ];
    case 'helmet':
      return [
        cylinder(0.27, 0.22, color, [0, 0.5, 0]),
        box([0.3, 0.05, 0.05], '#222222', [0, 0.42, 0.25]),
        cone(0.05, 0.2, color, [0, 0.7, 0]),
      ];
    case 'wizardHat':
      return [
        cylinder(0.4, 0.04, color, [0, 0.55, 0]),
        cone(0.26, 0.6, color, [0, 0.86, 0], { rotation: [0, 0, 0.25] }),
      ];
    case 'horns':
      return [
        cone(0.07, 0.3, '#EDE3C8', [0.17, 0.66, 0], { rotation: [0, 0, -0.5] }),
        cone(0.07, 0.3, '#EDE3C8', [-0.17, 0.66, 0], { rotation: [0, 0, 0.5] }),
      ];
    case 'crown':
      return crown(0.54);
    case 'none':
      return [];
  }
}

/** 右手（+x 側）に持つ武器。 */
function weaponParts(weapon: Weapon): ModelPart[] {
  const hand: Vec3 = [0.42, -0.38, 0.14];
  switch (weapon) {
    case 'sword':
      return [
        box([0.07, 0.75, 0.03], '#D8DDE3', [hand[0], hand[1] + 0.45, hand[2]]),
        box([0.24, 0.05, 0.07], '#C9A227', [hand[0], hand[1] + 0.06, hand[2]]),
        box([0.06, 0.14, 0.06], '#5A3A22', [hand[0], hand[1] - 0.04, hand[2]]),
      ];
    case 'axe':
      return [
        cylinder(0.035, 1.0, '#4A3322', [hand[0], hand[1] + 0.25, hand[2]]),
        box([0.32, 0.26, 0.05], '#7A7F87', [hand[0] + 0.14, hand[1] + 0.62, hand[2]]),
      ];
    case 'staff':
      return [
        cylinder(0.03, 1.15, '#5A3A22', [hand[0], hand[1] + 0.3, hand[2]]),
        sphere(0.1, '#B37CFF', [hand[0], hand[1] + 0.92, hand[2]], {
          glow: true,
        }),
      ];
    case 'spear':
      return [
        cylinder(0.03, 1.3, '#6B5A40', [hand[0], hand[1] + 0.35, hand[2]]),
        cone(0.07, 0.22, '#E8E8F0', [hand[0], hand[1] + 1.1, hand[2]]),
      ];
    case 'club':
      return [
        cylinder(0.05, 0.4, '#5A3A22', [hand[0], hand[1] + 0.1, hand[2]]),
        sphere(0.14, '#6B4A2E', [hand[0], hand[1] + 0.38, hand[2]], {
          scale: [1, 1.4, 1],
        }),
      ];
    case 'none':
      return [];
  }
}

export function humanoid(options: HumanoidOptions, extra?: Partial<ActorModel>): ActorModel {
  const {
    skin,
    body,
    legs,
    accent = body,
    headgear = 'none',
    weapon = 'none',
    shield = false,
    eyeColor,
    cape,
    hair,
  } = options;
  const eye = eyeColor ?? EYE_COLOR;
  const glowEyes = eyeColor !== undefined;
  const parts: ModelPart[] = [
    box([0.18, 0.5, 0.2], legs, [0.13, -0.72, 0]),
    box([0.18, 0.5, 0.2], legs, [-0.13, -0.72, 0]),
    box([0.56, 0.62, 0.32], body, [0, -0.16, 0]),
    box([0.58, 0.08, 0.34], accent, [0, -0.42, 0]),
    box([0.15, 0.5, 0.16], body, [0.37, -0.15, 0]),
    box([0.15, 0.5, 0.16], body, [-0.37, -0.15, 0]),
    sphere(0.07, skin, [0.37, -0.42, 0.02]),
    sphere(0.07, skin, [-0.37, -0.42, 0.02]),
    sphere(0.24, skin, [0, 0.38, 0]),
    box([0.06, glowEyes ? 0.06 : 0.09, 0.04], eye, [0.08, 0.4, 0.22], { glow: glowEyes }),
    box([0.06, glowEyes ? 0.06 : 0.09, 0.04], eye, [-0.08, 0.4, 0.22], { glow: glowEyes }),
    ...(glowEyes ? [] : [eyeShine(0.08, 0.4, 0.245), eyeShine(-0.08, 0.4, 0.245)]),
    ...(hair ? bangs(hair) : []),
    ...headgearParts(headgear, accent),
    ...weaponParts(weapon),
  ];
  if (shield) {
    parts.push(
      cylinder(0.26, 0.06, accent, [-0.48, -0.2, 0.12], {
        rotation: [Math.PI / 2, 0, 0],
      }),
      sphere(0.06, '#C9A227', [-0.48, -0.2, 0.17]),
    );
  }
  if (cape) parts.push(box([0.6, 0.85, 0.04], cape, [0, -0.3, -0.2], { rotation: [0.12, 0, 0] }));
  return { parts, idle: 'bob', yaw: 0.5, ...extra };
}

// ---------- スライム ----------

export function slime(color: string, options?: { crowned?: boolean; scale?: number }): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.7, color, [0, -0.45, 0], { scale: [1, 0.78, 1], opacity: 0.92 }),
    sphere(0.14, '#FFFFFF', [-0.28, -0.12, 0.42], { opacity: 0.6 }),
    sphere(0.08, EYE_COLOR, [0.18, -0.3, 0.6]),
    sphere(0.08, EYE_COLOR, [-0.12, -0.3, 0.62]),
  ];
  if (options?.crowned) parts.push(...crown(0.05));
  return { parts, idle: 'squish', yaw: 0.4, scale: options?.scale };
}

// ---------- 四つ足の獣（横向き、頭が +x） ----------

export function quadruped(
  color: string,
  options: {
    eyeColor?: string;
    belly?: string;
    size?: number;
    ears?: 'pointy' | 'round';
  },
): ActorModel {
  const { eyeColor = EYE_COLOR, belly = color, size = 1, ears = 'pointy' } = options;
  const legY = -0.78;
  const earParts =
    ears === 'pointy'
      ? [cone(0.07, 0.18, color, [0.5, 0.12, 0.1]), cone(0.07, 0.18, color, [0.5, 0.12, -0.1])]
      : [sphere(0.09, color, [0.48, 0.08, 0.13]), sphere(0.09, color, [0.48, 0.08, -0.13])];
  const parts: ModelPart[] = [
    box([0.95, 0.42, 0.42], color, [-0.05, -0.38, 0]),
    box([0.8, 0.12, 0.36], belly, [-0.05, -0.6, 0]),
    box([0.36, 0.32, 0.32], color, [0.52, -0.14, 0]),
    box([0.22, 0.16, 0.22], belly, [0.76, -0.2, 0]),
    sphere(0.04, eyeColor, [0.66, -0.06, 0.15], {
      glow: eyeColor !== EYE_COLOR,
    }),
    sphere(0.04, eyeColor, [0.66, -0.06, -0.15], {
      glow: eyeColor !== EYE_COLOR,
    }),
    ...earParts,
    box([0.12, 0.36, 0.12], color, [0.3, legY, 0.13]),
    box([0.12, 0.36, 0.12], color, [0.3, legY, -0.13]),
    box([0.12, 0.36, 0.12], color, [-0.38, legY, 0.13]),
    box([0.12, 0.36, 0.12], color, [-0.38, legY, -0.13]),
    cone(0.06, 0.5, color, [-0.68, -0.22, 0], { rotation: [0, 0, 1.1] }),
  ];
  return { parts, idle: 'bob', yaw: -0.45, scale: size };
}

// ---------- 翼を持つもの（正面向き） ----------

export function winged(
  body: string,
  wing: string,
  options: { head?: string; beak?: boolean; ears?: boolean; eyeColor?: string },
): ActorModel {
  const { head = body, beak = false, ears = false, eyeColor = EYE_COLOR } = options;
  const glow = eyeColor !== EYE_COLOR;
  const parts: ModelPart[] = [
    sphere(0.34, body, [0, -0.15, 0], { scale: [1, 1.15, 0.9] }),
    sphere(0.22, head, [0, 0.3, 0.05]),
    sphere(0.04, eyeColor, [0.08, 0.34, 0.24], { glow }),
    sphere(0.04, eyeColor, [-0.08, 0.34, 0.24], { glow }),
    box([0.75, 0.04, 0.38], wing, [0.5, 0.0, 0], {
      rotation: [0, 0, 0.35],
      animation: 'flapRight',
    }),
    box([0.75, 0.04, 0.38], wing, [-0.5, 0.0, 0], {
      rotation: [0, 0, -0.35],
      animation: 'flapLeft',
    }),
    cone(0.05, 0.2, '#D9A630', [0.08, -0.6, 0.05], {
      rotation: [Math.PI, 0, 0],
    }),
    cone(0.05, 0.2, '#D9A630', [-0.08, -0.6, 0.05], {
      rotation: [Math.PI, 0, 0],
    }),
  ];
  if (beak) {
    parts.push(
      cone(0.07, 0.2, '#E8B530', [0, 0.26, 0.3], {
        rotation: [Math.PI / 2, 0, 0],
      }),
    );
  }
  if (ears) {
    parts.push(
      cone(0.07, 0.2, body, [0.12, 0.52, 0.02], { rotation: [0, 0, -0.3] }),
      cone(0.07, 0.2, body, [-0.12, 0.52, 0.02], { rotation: [0, 0, 0.3] }),
    );
  }
  return { parts, idle: 'float', yaw: 0.4 };
}

// ---------- 亡霊 ----------

export function ghost(color: string, options?: { crowned?: boolean; scale?: number }): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.5, color, [0, 0.05, 0], { scale: [1, 1.15, 1], opacity: 0.82 }),
    cone(0.48, 0.8, color, [0, -0.62, 0], {
      rotation: [Math.PI, 0, 0],
      opacity: 0.82,
    }),
    sphere(0.09, '#2A0A3A', [0.16, 0.12, 0.42], { scale: [1, 1.4, 0.6] }),
    sphere(0.09, '#2A0A3A', [-0.16, 0.12, 0.42], { scale: [1, 1.4, 0.6] }),
    sphere(0.12, color, [0.5, -0.12, 0.1], { opacity: 0.82 }),
    sphere(0.12, color, [-0.5, -0.12, 0.1], { opacity: 0.82 }),
  ];
  if (options?.crowned) parts.push(...crown(0.58));
  return { parts, idle: 'float', yaw: 0.35, scale: options?.scale };
}

// ---------- 石像・ゴーレム ----------

export function golem(color: string, eyeColor: string): ActorModel {
  const parts: ModelPart[] = [
    box([0.24, 0.4, 0.28], color, [0.2, -0.78, 0]),
    box([0.24, 0.4, 0.28], color, [-0.2, -0.78, 0]),
    box([0.85, 0.75, 0.5], color, [0, -0.2, 0]),
    box([0.25, 0.7, 0.28], color, [0.58, -0.25, 0], { rotation: [0, 0, 0.1] }),
    box([0.25, 0.7, 0.28], color, [-0.58, -0.25, 0], {
      rotation: [0, 0, -0.1],
    }),
    box([0.42, 0.36, 0.4], color, [0, 0.38, 0]),
    box([0.08, 0.05, 0.04], eyeColor, [0.1, 0.4, 0.21], { glow: true }),
    box([0.08, 0.05, 0.04], eyeColor, [-0.1, 0.4, 0.21], { glow: true }),
    box([0.3, 0.06, 0.04], eyeColor, [0, -0.1, 0.26], { glow: true }),
  ];
  return { parts, idle: 'bob', yaw: 0.4 };
}

// ---------- 浮遊する目 ----------

export function floatingEye(color: string, iris: string): ActorModel {
  const tentacles = [-0.3, 0, 0.3].map((x) =>
    cone(0.08, 0.5, color, [x, -0.72, 0], { rotation: [Math.PI, 0, x * 0.6] }),
  );
  const parts: ModelPart[] = [
    sphere(0.55, color, [0, -0.05, 0]),
    sphere(0.28, iris, [0, -0.05, 0.45], { glow: true, scale: [1, 1, 0.5] }),
    sphere(0.13, '#000000', [0, -0.05, 0.58], { scale: [1, 1, 0.6] }),
    ...tentacles,
  ];
  return { parts, idle: 'float', yaw: 0.45 };
}

// ---------- 竜（横向き、頭が +x） ----------

export function dragon(color: string, belly: string, wing: string): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.48, color, [-0.15, -0.35, 0], { scale: [1.3, 0.85, 0.85] }),
    sphere(0.36, belly, [-0.05, -0.5, 0.1], { scale: [1.2, 0.7, 0.8] }),
    cylinder(0.14, 0.5, color, [0.4, 0.0, 0], { rotation: [0, 0, -0.6] }),
    box([0.38, 0.26, 0.28], color, [0.62, 0.25, 0]),
    box([0.24, 0.14, 0.2], color, [0.86, 0.2, 0]),
    sphere(0.04, '#FFD23E', [0.72, 0.32, 0.14], { glow: true }),
    sphere(0.04, '#FFD23E', [0.72, 0.32, -0.14], { glow: true }),
    cone(0.05, 0.22, '#EDE3C8', [0.52, 0.48, 0.08], { rotation: [0, 0, 0.6] }),
    cone(0.05, 0.22, '#EDE3C8', [0.52, 0.48, -0.08], { rotation: [0, 0, 0.6] }),
    box([0.7, 0.04, 0.45], wing, [-0.25, 0.2, 0.35], {
      rotation: [0.5, 0, 0.3],
      animation: 'flapRight',
    }),
    box([0.7, 0.04, 0.45], wing, [-0.25, 0.2, -0.35], {
      rotation: [-0.5, 0, 0.3],
      animation: 'flapLeft',
    }),
    cone(0.14, 0.7, color, [-0.85, -0.45, 0], { rotation: [0, 0, 1.3] }),
    box([0.14, 0.32, 0.14], color, [0.15, -0.82, 0.18]),
    box([0.14, 0.32, 0.14], color, [0.15, -0.82, -0.18]),
    box([0.14, 0.32, 0.14], color, [-0.45, -0.82, 0.18]),
    box([0.14, 0.32, 0.14], color, [-0.45, -0.82, -0.18]),
  ];
  return { parts, idle: 'bob', yaw: -0.45, scale: 1.05 };
}

// ---------- 砂時計の番人 ----------

export function hourglass(frame: string, glass: string, sand: string): ActorModel {
  const parts: ModelPart[] = [
    cylinder(0.5, 0.1, frame, [0, 0.72, 0]),
    cylinder(0.5, 0.1, frame, [0, -0.82, 0]),
    {
      shape: {
        kind: 'cylinder',
        radiusTop: 0.42,
        radiusBottom: 0.05,
        height: 0.7,
      },
      color: glass,
      position: [0, 0.32, 0],
      opacity: 0.45,
    },
    {
      shape: {
        kind: 'cylinder',
        radiusTop: 0.05,
        radiusBottom: 0.42,
        height: 0.7,
      },
      color: glass,
      position: [0, -0.42, 0],
      opacity: 0.45,
    },
    cone(0.3, 0.3, sand, [0, -0.62, 0], { glow: true }),
    cone(0.16, 0.18, sand, [0, 0.12, 0], {
      rotation: [Math.PI, 0, 0],
      glow: true,
    }),
    cylinder(0.04, 1.5, frame, [0.44, -0.05, 0]),
    cylinder(0.04, 1.5, frame, [-0.44, -0.05, 0]),
    {
      shape: { kind: 'torus', radius: 0.62, tube: 0.03 },
      color: sand,
      glow: true,
      position: [0, -0.05, 0],
      rotation: [Math.PI / 2, 0, 0],
      animation: 'spin',
    },
  ];
  return { parts, idle: 'float', yaw: 0.3 };
}

// ---------- 虚無の王 ----------

export function voidLord(core: string, ring: string): ActorModel {
  const parts: ModelPart[] = [
    {
      shape: { kind: 'octahedron', radius: 0.6 },
      color: core,
      position: [0, -0.1, 0],
      scale: [1, 1.3, 1],
      animation: 'spin',
    },
    sphere(0.22, '#E6D2FF', [0, -0.1, 0.42], {
      glow: true,
      scale: [1, 0.5, 0.4],
    }),
    {
      shape: { kind: 'torus', radius: 0.85, tube: 0.04 },
      color: ring,
      glow: true,
      position: [0, -0.1, 0],
      rotation: [1.25, 0, 0.3],
    },
    sphere(0.1, ring, [0.82, 0.35, 0], { glow: true }),
    sphere(0.1, ring, [-0.82, -0.5, 0], { glow: true }),
    ...crown(0.45, '#8C6CFF', 0.3),
  ];
  return { parts, idle: 'float', yaw: 0.3, scale: 1.1 };
}
