import type { ActorModel, AuraStyle, ModelPart, Vec3 } from './modelTypes';
import {
  EYE_COLOR,
  box,
  capsule,
  cone,
  crown,
  crystals,
  cylinder,
  eyeShine,
  eyes,
  flame,
  rock,
  sphere,
  taper,
  torus,
} from './parts';

/**
 * キャラクターの「型」ごとの組み立て関数。色や装備を変えるだけで別のキャラクターを作れる。
 * 地域ごとの固有のモンスターは regions/ 以下で、これらと parts の部品を組み合わせて作る。
 */

// ---------- 人型 ----------

export type Headgear =
  | 'hood'
  | 'helmet'
  | 'hornedHelm'
  | 'plumeHelm'
  | 'visor'
  | 'wizardHat'
  | 'horns'
  | 'crown'
  | 'iceCrown'
  | 'spikyHair'
  | 'longHair'
  | 'none';

export type Weapon =
  | 'sword'
  | 'flameSword'
  | 'axe'
  | 'staff'
  | 'spear'
  | 'trident'
  | 'lance'
  | 'bow'
  | 'club'
  | 'none';

export type HumanoidOptions = {
  skin: string;
  body: string;
  legs: string;
  accent?: string;
  headgear?: Headgear;
  weapon?: Weapon;
  /** 杖の宝玉・刃のきらめき・穂先の光など、武器に宿る魔力の色。 */
  magic?: string;
  shield?: boolean;
  /** 盾の紋章の色。 */
  emblem?: string;
  /** 光る目（アンデッド・機械など）。 */
  eyeColor?: string;
  /** マント。 */
  cape?: string;
  /** 髪（前髪・長髪・逆立った髪の色）。 */
  hair?: string;
  /** 肩当て。 */
  pauldrons?: boolean;
  /** 足を隠す長いローブ・ドレス。色を指定する。 */
  robe?: string;
  boots?: string;
  /** 脚の代わりに付ける下半身（人魚の尾など）。robe より優先する。 */
  lowerBody?: ModelPart[];
  /** 最後に足す固有の飾り。 */
  extras?: ModelPart[];
};

const HAND: Vec3 = [0.42, -0.4, 0.14];

/** 額にかかる前髪。 */
function bangs(color: string): ModelPart[] {
  return [-0.12, -0.04, 0.04, 0.12].map((x, index) =>
    cone(0.06, 0.15, color, [x, 0.5, 0.18], {
      rotation: [Math.PI + 0.7, 0, (index - 1.5) * 0.3],
    }),
  );
}

/** 逆立った髪。 */
function spikyHair(color: string): ModelPart[] {
  const spikes: [number, number, number, number, number][] = [
    [0, 0.7, -0.02, 0, -0.35],
    [0.15, 0.65, -0.04, -0.55, -0.3],
    [-0.15, 0.65, -0.04, 0.55, -0.3],
    [0.08, 0.62, -0.17, -0.25, -0.9],
    [-0.08, 0.62, -0.17, 0.25, -0.9],
    [0.2, 0.5, -0.1, -1.1, -0.4],
    [-0.2, 0.5, -0.1, 1.1, -0.4],
  ];
  return [
    sphere(0.26, color, [0, 0.45, -0.04], { scale: [1, 0.85, 1] }),
    ...spikes.map(([x, y, z, tilt, pitch]) =>
      cone(0.08, 0.26, color, [x, y, z], { rotation: [pitch, 0, tilt] }),
    ),
  ];
}

/** 背中に流れる長い髪。 */
function longHair(color: string): ModelPart[] {
  return [
    sphere(0.265, color, [0, 0.44, -0.04], { scale: [1, 0.9, 1] }),
    taper(0.2, 0.28, 0.75, color, [0, 0.05, -0.16], { rotation: [0.12, 0, 0], scale: [1, 1, 0.5] }),
    capsule(0.07, 0.4, color, [0.22, 0.2, 0.02], { rotation: [0, 0, 0.1] }),
    capsule(0.07, 0.4, color, [-0.22, 0.2, 0.02], { rotation: [0, 0, -0.1] }),
  ];
}

function headgearParts(headgear: Headgear, color: string, hair: string, magic: string): ModelPart[] {
  switch (headgear) {
    case 'spikyHair':
      return spikyHair(hair);
    case 'longHair':
      return longHair(hair);
    case 'hood':
      return [
        sphere(0.29, color, [0, 0.42, -0.05], { scale: [1, 1.05, 1] }),
        cone(0.2, 0.34, color, [0, 0.72, -0.12], { rotation: [-0.5, 0, 0] }),
        torus(0.2, 0.04, color, [0, 0.4, 0.14], { scale: [1, 1.2, 1] }),
      ];
    case 'helmet':
      return [
        sphere(0.28, color, [0, 0.47, 0], { scale: [1, 0.9, 1] }),
        box([0.34, 0.05, 0.06], '#222222', [0, 0.42, 0.25]),
        box([0.04, 0.2, 0.06], color, [0, 0.36, 0.27]),
        cone(0.05, 0.2, color, [0, 0.78, 0]),
      ];
    case 'hornedHelm':
      return [
        sphere(0.28, color, [0, 0.47, 0], { scale: [1, 0.9, 1] }),
        box([0.34, 0.05, 0.06], '#1A1010', [0, 0.42, 0.25]),
        cone(0.07, 0.36, '#EDE3C8', [0.25, 0.7, 0], { rotation: [0, 0, -0.7] }),
        cone(0.07, 0.36, '#EDE3C8', [-0.25, 0.7, 0], { rotation: [0, 0, 0.7] }),
      ];
    case 'plumeHelm':
      return [
        sphere(0.28, color, [0, 0.47, 0], { scale: [1, 0.9, 1] }),
        box([0.34, 0.05, 0.06], '#222222', [0, 0.42, 0.25]),
        box([0.05, 0.12, 0.42], magic, [0, 0.78, -0.08], { rotation: [-0.3, 0, 0] }),
        cone(0.06, 0.3, magic, [0, 0.72, -0.34], { rotation: [-2.2, 0, 0], animation: 'sway' }),
      ];
    case 'visor':
      return [
        box([0.48, 0.42, 0.46], color, [0, 0.42, 0]),
        box([0.4, 0.07, 0.04], magic, [0, 0.42, 0.24], { glow: true }),
        cylinder(0.015, 0.22, color, [0.14, 0.72, 0]),
        sphere(0.035, magic, [0.14, 0.84, 0], { glow: true }),
      ];
    case 'wizardHat':
      return [
        cylinder(0.42, 0.04, color, [0, 0.56, 0]),
        cone(0.26, 0.62, color, [0.02, 0.88, -0.02], { rotation: [-0.15, 0, 0.3] }),
        torus(0.26, 0.03, magic, [0, 0.6, 0], { rotation: [Math.PI / 2, 0, 0] }),
      ];
    case 'horns':
      return [
        cone(0.07, 0.3, '#EDE3C8', [0.17, 0.66, 0], { rotation: [0, 0, -0.5] }),
        cone(0.07, 0.3, '#EDE3C8', [-0.17, 0.66, 0], { rotation: [0, 0, 0.5] }),
      ];
    case 'crown':
      return crown(0.56);
    case 'iceCrown':
      return [
        cylinder(0.24, 0.06, magic, [0, 0.6, 0], { glow: true, opacity: 0.85 }),
        ...[-0.16, -0.08, 0, 0.08, 0.16].map((x, index) =>
          cone(0.04, index === 2 ? 0.34 : 0.22 - Math.abs(index - 2) * 0.03, magic, [x, 0.74 - Math.abs(index - 2) * 0.03, 0.06], {
            rotation: [0, 0, -x * 1.5],
            glow: true,
            opacity: 0.85,
            segments: 4,
          }),
        ),
      ];
    case 'none':
      return [];
  }
}

/** 右手（+x 側）に持つ武器。 */
function weaponParts(weapon: Weapon, magic: string): ModelPart[] {
  const [hx, hy, hz] = HAND;
  switch (weapon) {
    case 'sword':
      return [
        box([0.08, 0.75, 0.03], '#D8DDE3', [hx, hy + 0.46, hz]),
        box([0.02, 0.7, 0.035], magic, [hx, hy + 0.46, hz], { glow: true, opacity: 0.6 }),
        cone(0.04, 0.1, '#D8DDE3', [hx, hy + 0.88, hz], { segments: 4 }),
        box([0.26, 0.05, 0.08], '#C9A227', [hx, hy + 0.06, hz]),
        box([0.06, 0.14, 0.06], '#5A3A22', [hx, hy - 0.04, hz]),
        sphere(0.04, '#C9A227', [hx, hy - 0.13, hz]),
      ];
    case 'flameSword':
      return [
        box([0.09, 0.75, 0.035], '#2A1A1A', [hx, hy + 0.46, hz]),
        box([0.035, 0.72, 0.04], magic, [hx, hy + 0.46, hz], { glow: true }),
        ...flame([hx, hy + 0.55, hz], 0.8, 0.1),
        ...flame([hx, hy + 0.25, hz], 0.6, 0.6),
        box([0.3, 0.06, 0.09], '#5A1E1E', [hx, hy + 0.06, hz]),
        box([0.06, 0.14, 0.06], '#2A1A1A', [hx, hy - 0.04, hz]),
      ];
    case 'axe':
      return [
        cylinder(0.035, 1.0, '#4A3322', [hx, hy + 0.25, hz]),
        box([0.32, 0.26, 0.05], '#7A7F87', [hx + 0.14, hy + 0.62, hz]),
      ];
    case 'staff':
      return [
        cylinder(0.03, 1.15, '#5A3A22', [hx, hy + 0.3, hz]),
        torus(0.1, 0.02, '#C9A227', [hx, hy + 0.92, hz]),
        sphere(0.085, magic, [hx, hy + 0.92, hz], { glow: true }),
      ];
    case 'spear':
      return [
        cylinder(0.03, 1.3, '#6B5A40', [hx, hy + 0.35, hz]),
        cone(0.07, 0.24, '#E8E8F0', [hx, hy + 1.1, hz], { segments: 4 }),
        box([0.14, 0.03, 0.03], '#C9A227', [hx, hy + 0.97, hz]),
        sphere(0.03, magic, [hx, hy + 1.24, hz], { glow: true }),
      ];
    case 'trident':
      return [
        cylinder(0.03, 1.3, '#4A6A6A', [hx, hy + 0.35, hz]),
        box([0.26, 0.04, 0.04], '#8AC8C0', [hx, hy + 0.98, hz]),
        cone(0.04, 0.24, '#CFEFF0', [hx, hy + 1.12, hz], { segments: 4 }),
        cone(0.035, 0.18, '#CFEFF0', [hx + 0.12, hy + 1.08, hz], { segments: 4 }),
        cone(0.035, 0.18, '#CFEFF0', [hx - 0.12, hy + 1.08, hz], { segments: 4 }),
        sphere(0.04, magic, [hx, hy + 0.98, hz + 0.03], { glow: true }),
      ];
    case 'lance':
      return [
        cone(0.1, 1.2, '#C8CCD4', [hx, hy + 0.65, hz], { segments: 8 }),
        box([0.02, 1.0, 0.02], magic, [hx, hy + 0.6, hz + 0.06], { glow: true, opacity: 0.8 }),
        cone(0.16, 0.18, '#E2B84A', [hx, hy + 0.04, hz], { rotation: [Math.PI, 0, 0] }),
      ];
    case 'bow':
      return [
        capsule(0.025, 0.5, '#6A4A2A', [hx + 0.02, hy + 0.48, hz], { rotation: [0, 0, 0.35] }),
        capsule(0.025, 0.5, '#6A4A2A', [hx + 0.02, hy - 0.02, hz], { rotation: [0, 0, -0.35] }),
        box([0.01, 0.9, 0.01], '#EDE3C8', [hx - 0.08, hy + 0.23, hz]),
        sphere(0.04, magic, [hx + 0.11, hy + 0.23, hz], { glow: true }),
      ];
    case 'club':
      return [
        cylinder(0.05, 0.4, '#5A3A22', [hx, hy + 0.1, hz]),
        rock(0.16, '#6B4A2E', [hx, hy + 0.4, hz], { scale: [1, 1.3, 1] }),
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
    magic = '#B37CFF',
    shield = false,
    emblem = '#C9A227',
    eyeColor,
    cape,
    hair,
    pauldrons = false,
    robe,
    boots = '#3A2A22',
    lowerBody: customLowerBody,
    extras = [],
  } = options;
  const glowEyes = eyeColor !== undefined;
  const eyeParts = glowEyes
    ? [
        box([0.07, 0.05, 0.04], eyeColor, [0.08, 0.4, 0.22], { glow: true }),
        box([0.07, 0.05, 0.04], eyeColor, [-0.08, 0.4, 0.22], { glow: true }),
      ]
    : [
        box([0.06, 0.09, 0.04], EYE_COLOR, [0.08, 0.4, 0.22]),
        box([0.06, 0.09, 0.04], EYE_COLOR, [-0.08, 0.4, 0.22]),
        eyeShine(0.08, 0.4, 0.245),
        eyeShine(-0.08, 0.4, 0.245),
      ];
  const lowerBody: ModelPart[] = customLowerBody
    ? customLowerBody
    : robe
    ? [
        taper(0.26, 0.46, 0.66, robe, [0, -0.66, 0], { segments: 14 }),
        torus(0.45, 0.025, accent, [0, -0.98, 0], { rotation: [Math.PI / 2, 0, 0] }),
      ]
    : [
        capsule(0.085, 0.3, legs, [0.12, -0.64, 0]),
        capsule(0.085, 0.3, legs, [-0.12, -0.64, 0]),
        box([0.17, 0.16, 0.24], boots, [0.12, -0.92, 0.03]),
        box([0.17, 0.16, 0.24], boots, [-0.12, -0.92, 0.03]),
      ];
  const parts: ModelPart[] = [
    ...lowerBody,
    taper(0.27, 0.22, 0.6, body, [0, -0.16, 0], { segments: 8, scale: [1, 1, 0.66] }),
    box([0.5, 0.07, 0.32], accent, [0, -0.42, 0]),
    box([0.08, 0.08, 0.04], emblem, [0, -0.42, 0.17]),
    box([0.2, 0.2, 0.04], accent, [0, -0.04, 0.17], { rotation: [0, 0, Math.PI / 4] }),
    cylinder(0.08, 0.1, skin, [0, 0.16, 0]),
    capsule(0.07, 0.34, body, [0.35, -0.16, 0], { rotation: [0, 0, 0.12] }),
    capsule(0.07, 0.34, body, [-0.35, -0.16, 0], { rotation: [0, 0, -0.12] }),
    sphere(0.075, skin, [0.38, -0.42, 0.02]),
    sphere(0.075, skin, [-0.38, -0.42, 0.02]),
    sphere(0.24, skin, [0, 0.38, 0]),
    ...eyeParts,
    ...(hair ? bangs(hair) : []),
    ...headgearParts(headgear, accent, hair ?? accent, magic),
    ...weaponParts(weapon, magic),
  ];
  if (pauldrons) {
    parts.push(
      sphere(0.14, accent, [0.3, 0.06, 0], { scale: [1.1, 0.7, 1] }),
      sphere(0.14, accent, [-0.3, 0.06, 0], { scale: [1.1, 0.7, 1] }),
    );
  }
  if (shield) {
    parts.push(
      cylinder(0.27, 0.06, accent, [-0.5, -0.2, 0.12], { rotation: [Math.PI / 2, 0, 0] }),
      torus(0.26, 0.025, emblem, [-0.5, -0.2, 0.16]),
      sphere(0.07, emblem, [-0.5, -0.2, 0.17], { scale: [1, 1, 0.5] }),
    );
  }
  if (cape) {
    parts.push(
      box([0.62, 0.9, 0.04], cape, [0, -0.32, -0.21], { rotation: [0.14, 0, 0] }),
      box([0.5, 0.06, 0.1], cape, [0, 0.1, -0.15]),
    );
  }
  parts.push(...extras);
  return { parts, idle: 'bob', yaw: 0.5, ...extra };
}

// ---------- スライム ----------

export type SlimeOptions = {
  crowned?: boolean;
  scale?: number;
  /** 体の中に浮かぶ芯（光る）。 */
  core?: string;
  extras?: ModelPart[];
};

export function slime(color: string, options?: SlimeOptions): ActorModel {
  const parts: ModelPart[] = [
    sphere(0.7, color, [0, -0.45, 0], { scale: [1, 0.78, 1], opacity: 0.88 }),
    sphere(0.14, '#FFFFFF', [-0.28, -0.1, 0.42], { opacity: 0.6, scale: [1, 0.7, 0.6] }),
    sphere(0.06, '#FFFFFF', [-0.12, 0, 0.45], { opacity: 0.5 }),
    ...eyes(0.16, -0.3, 0.6, 0.075),
    box([0.12, 0.03, 0.03], EYE_COLOR, [0.02, -0.44, 0.64], { rotation: [0, 0, 0] }),
  ];
  if (options?.core) parts.push(sphere(0.2, options.core, [0, -0.5, 0], { glow: true, opacity: 0.7 }));
  if (options?.crowned) parts.push(...crown(0.05));
  if (options?.extras) parts.push(...options.extras);
  return { parts, idle: 'squish', yaw: 0.4, scale: options?.scale };
}

// ---------- 四つ足の獣（横向き、頭が +x） ----------

export type QuadrupedOptions = {
  eyeColor?: string;
  belly?: string;
  size?: number;
  ears?: 'pointy' | 'round' | 'long' | 'none';
  tail?: 'thin' | 'bushy' | 'puff' | 'none';
  /** 鼻先の長さ（0 で丸顔）。 */
  snout?: number;
  extras?: ModelPart[];
};

export function quadruped(color: string, options: QuadrupedOptions): ActorModel {
  const {
    eyeColor,
    belly = color,
    size = 1,
    ears = 'pointy',
    tail = 'thin',
    snout = 0.22,
    extras = [],
  } = options;
  const legY = -0.74;
  const earParts: ModelPart[] = {
    pointy: [
      cone(0.07, 0.2, color, [0.48, 0.14, 0.1], { rotation: [0.2, 0, -0.2] }),
      cone(0.07, 0.2, color, [0.48, 0.14, -0.1], { rotation: [-0.2, 0, -0.2] }),
    ],
    round: [sphere(0.09, color, [0.46, 0.08, 0.13]), sphere(0.09, color, [0.46, 0.08, -0.13])],
    long: [
      capsule(0.05, 0.36, color, [0.42, 0.3, 0.08], { rotation: [0.15, 0, 0.35], scale: [1, 1, 0.6] }),
      capsule(0.05, 0.36, color, [0.38, 0.28, -0.08], { rotation: [-0.15, 0, 0.5], scale: [1, 1, 0.6] }),
    ],
    none: [],
  }[ears];
  const tailParts: ModelPart[] = {
    thin: [capsule(0.05, 0.45, color, [-0.66, -0.2, 0], { rotation: [0, 0, 1.0], animation: 'sway' })],
    bushy: [
      capsule(0.11, 0.4, color, [-0.66, -0.18, 0], { rotation: [0, 0, 0.9], animation: 'sway' }),
      sphere(0.1, belly, [-0.82, -0.02, 0], { animation: 'sway' }),
    ],
    puff: [sphere(0.1, belly, [-0.5, -0.3, 0])],
    none: [],
  }[tail];
  const leg = (x: number, z: number): ModelPart[] => [
    capsule(0.07, 0.24, color, [x, legY, z]),
    sphere(0.075, belly, [x + 0.02, -0.94, z], { scale: [1.2, 0.6, 1] }),
  ];
  const parts: ModelPart[] = [
    capsule(0.23, 0.55, color, [-0.08, -0.36, 0], { rotation: [0, 0, Math.PI / 2] }),
    capsule(0.16, 0.5, belly, [-0.06, -0.48, 0], { rotation: [0, 0, Math.PI / 2], scale: [1, 1, 0.9] }),
    sphere(0.25, color, [0.26, -0.3, 0]),
    sphere(0.2, color, [0.5, -0.06, 0]),
    ...(snout > 0
      ? [
          capsule(0.09, snout, belly, [0.66 + snout * 0.3, -0.12, 0], { rotation: [0, 0, Math.PI / 2] }),
          sphere(0.04, EYE_COLOR, [0.76 + snout * 0.6, -0.08, 0]),
        ]
      : []),
    sphere(0.035, eyeColor ?? EYE_COLOR, [0.62, -0.01, 0.13], { glow: eyeColor !== undefined }),
    sphere(0.035, eyeColor ?? EYE_COLOR, [0.62, -0.01, -0.13], { glow: eyeColor !== undefined }),
    ...earParts,
    ...leg(0.28, 0.13),
    ...leg(0.28, -0.13),
    ...leg(-0.4, 0.13),
    ...leg(-0.4, -0.13),
    ...tailParts,
    ...extras,
  ];
  return { parts, idle: 'bob', yaw: -0.45, scale: size };
}

// ---------- 翼を持つもの（正面向き） ----------

export type WingedOptions = {
  head?: string;
  beak?: boolean;
  ears?: boolean;
  eyeColor?: string;
  /** 翼の先の色（羽根の先端・皮膜の縁）。 */
  wingTip?: string;
  /** 翼の大きさ。 */
  span?: number;
  extras?: ModelPart[];
};

/**
 * 翼は中心を共有する数枚の板を重ねて作る（はばたきは部品ごとの回転なので、中心が同じなら一緒に動く）。
 */
export function wingPair(color: string, tip: string, center: Vec3, span = 1): ModelPart[] {
  const [x, y, z] = center;
  return ([1, -1] as const).flatMap((side) => {
    const animation = side === 1 ? ('flapRight' as const) : ('flapLeft' as const);
    const at: Vec3 = [x * side, y, z];
    const pivot: Vec3 = [x * side * 0.25, y, z];
    const tilt = 0.35 * side;
    return [
      sphere(0.5 * span, color, at, { scale: [1, 0.08, 0.42], rotation: [0, 0, tilt], animation, pivot }),
      sphere(0.5 * span, tip, at, {
        scale: [1.12, 0.05, 0.3],
        rotation: [0, 0, tilt + 0.06 * side],
        animation,
        pivot,
      }),
    ];
  });
}

export type SideWingOptions = {
  membrane: string;
  bone: string;
  /** 指先の爪・羽根の先の色。 */
  tip: string;
  /** 翼の付け根（体の中心線上の点。左右へは z 方向に開く）。 */
  root: Vec3;
  span?: number;
  /** 指先を光らせる。 */
  glowTip?: boolean;
};

/**
 * 横向きの獣（竜・グリフォン）の左右の翼。付け根から指のように骨を広げ、骨ごとに皮膜（羽）を張る。
 * 付け根を支点に x 軸まわりではばたく。
 */
export function sideWings(options: SideWingOptions): ModelPart[] {
  const { membrane, bone, tip, root, span = 1, glowTip = false } = options;
  const fingers: [number, number][] = [
    [1.25, 0.95],
    [0.85, 0.85],
    [0.45, 0.65],
  ];
  return ([1, -1] as const).flatMap((side) => {
    const animation = side === 1 ? ('flapRight' as const) : ('flapLeft' as const);
    const pivot: Vec3 = [root[0], root[1], root[2] + 0.12 * side];
    return fingers.flatMap(([angle, length], index) => {
      const reach = length * span;
      // 骨（y 軸向きのカプセル）を x 軸まわりに倒し、上（y）と外（±z）の間の向きにする。
      const tilt = side * (Math.PI / 2 - angle);
      const direction: Vec3 = [0, Math.sin(angle), side * Math.cos(angle)];
      const along = (ratio: number, back = 0): Vec3 => [
        pivot[0] - back,
        pivot[1] + direction[1] * reach * ratio,
        pivot[2] + direction[2] * reach * ratio,
      ];
      const shared = { animation, pivot, flapAxis: 'x' as const };
      return [
        sphere(0.5, membrane, along(0.5, 0.16 + index * 0.04), {
          ...shared,
          rotation: [tilt, 0, 0],
          scale: [0.34 * span, reach, 0.05],
          opacity: 0.92,
        }),
        capsule(0.03, reach * 0.9, bone, along(0.5), { ...shared, rotation: [tilt, 0, 0] }),
        cone(0.035, 0.12, tip, along(1.02), { ...shared, rotation: [tilt, 0, 0], glow: glowTip }),
      ];
    });
  });
}

export function winged(body: string, wing: string, options: WingedOptions): ActorModel {
  const {
    head = body,
    beak = false,
    ears = false,
    eyeColor,
    wingTip = wing,
    span = 1,
    extras = [],
  } = options;
  const parts: ModelPart[] = [
    sphere(0.34, body, [0, -0.15, 0], { scale: [1, 1.15, 0.9] }),
    sphere(0.22, head, [0, 0.3, 0.05]),
    ...eyes(0.08, 0.34, 0.24, 0.04, eyeColor),
    ...wingPair(wing, wingTip, [0.5 * span, 0, -0.02], span),
    cone(0.05, 0.2, '#D9A630', [0.08, -0.6, 0.05], { rotation: [Math.PI, 0, 0] }),
    cone(0.05, 0.2, '#D9A630', [-0.08, -0.6, 0.05], { rotation: [Math.PI, 0, 0] }),
    ...extras,
  ];
  if (beak) {
    parts.push(cone(0.07, 0.2, '#E8B530', [0, 0.26, 0.3], { rotation: [Math.PI / 2, 0, 0] }));
  }
  if (ears) {
    parts.push(
      cone(0.08, 0.24, body, [0.13, 0.52, 0.02], { rotation: [0, 0, -0.35] }),
      cone(0.08, 0.24, body, [-0.13, 0.52, 0.02], { rotation: [0, 0, 0.35] }),
    );
  }
  return { parts, idle: 'float', yaw: 0.4 };
}

// ---------- 岩・金属の巨人 ----------

export type GolemOptions = {
  /** 継ぎ目からのぞく光（溶岩・雷・苔の光など）。 */
  glow: string;
  /** 角ばった岩で組むか、箱で組むか（金属）。 */
  rocky?: boolean;
  extras?: ModelPart[];
};

export function golem(color: string, options: GolemOptions): ActorModel {
  const { glow, rocky = true, extras = [] } = options;
  const chunk = (radius: number, position: Vec3, size: Vec3, scale: Vec3 = [1, 1, 1]): ModelPart =>
    rocky ? rock(radius, color, position, { scale }) : box(size, color, position);
  const parts: ModelPart[] = [
    chunk(0.2, [0.22, -0.8, 0], [0.26, 0.4, 0.3], [1, 1.1, 1]),
    chunk(0.2, [-0.22, -0.8, 0], [0.26, 0.4, 0.3], [1, 1.1, 1]),
    chunk(0.5, [0, -0.18, 0], [0.9, 0.78, 0.52], [1, 0.85, 0.65]),
    chunk(0.24, [0.58, -0.02, 0], [0.32, 0.3, 0.34]),
    chunk(0.24, [-0.58, -0.02, 0], [0.32, 0.3, 0.34]),
    chunk(0.2, [0.66, -0.4, 0.04], [0.26, 0.5, 0.28], [1, 1.3, 1]),
    chunk(0.2, [-0.66, -0.4, 0.04], [0.26, 0.5, 0.28], [1, 1.3, 1]),
    chunk(0.2, [0, 0.38, 0.02], [0.42, 0.34, 0.4], [1.1, 0.9, 1]),
    box([0.09, 0.05, 0.04], glow, [0.09, 0.4, 0.2], { glow: true }),
    box([0.09, 0.05, 0.04], glow, [-0.09, 0.4, 0.2], { glow: true }),
    sphere(0.12, glow, [0, -0.12, 0.28], { glow: true, scale: [1, 1, 0.5] }),
    box([0.03, 0.3, 0.02], glow, [0.18, -0.3, 0.3], { glow: true, rotation: [0, 0, 0.5] }),
    box([0.03, 0.26, 0.02], glow, [-0.2, -0.05, 0.3], { glow: true, rotation: [0, 0, -0.6] }),
    ...extras,
  ];
  return { parts, idle: 'bob', yaw: 0.4 };
}

/** 体のまわりをゆっくり回る、浮かぶ岩や氷片。 */
export function orbitingShards(color: string, count: number, radius: number, y: number, glow = false): ModelPart[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return rock(0.08 + (index % 2) * 0.03, color, [Math.cos(angle) * radius, y + (index % 3) * 0.18, Math.sin(angle) * radius], {
      animation: 'orbit',
      phase: index / count,
      glow,
    });
  });
}

/** 組み立てたモデルに、地域の aura や大きさを付け足す。 */
export const withAura = (model: ActorModel, aura: AuraStyle, extra?: Partial<ActorModel>): ActorModel => ({
  ...model,
  aura,
  ...extra,
});

/** 地面から生える結晶（足元の飾り）。 */
export const groundCrystals = (color: string): ModelPart[] => [
  ...crystals([0.55, -1, 0.15], color, 0.8),
  ...crystals([-0.6, -1, -0.1], color, 0.6),
];
