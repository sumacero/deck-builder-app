import type { CardType } from './domain/card';
import type { MapNodeType } from './domain/map';

/**
 * ポップで明るい配色。子どもでも遊びやすい雰囲気にするため、黒ではなく深い藍紫を土台にし、
 * 鮮やかな色を差す。白い文字が読めるよう、パネルの地は暗めの藍紫に保つ。
 */
export const COLORS = {
  bg: '#241C4E',
  panel: '#2F2766',
  panelBorder: '#5A4BB0',
  surface: '#3B3180',
  text: '#FFFAF0',
  textMuted: '#C2BBEB',
  /** アクセント（ボタン・見出し・選択中の枠）。お日さまのような黄色。 */
  gold: '#FFC83D',
  goldDark: '#6B3FA0',
  onGold: '#3A2200',
  hp: '#FF5C7A',
  hpTrack: '#4C2050',
  block: '#4FB8FF',
  energy: '#FFB020',
  danger: '#FF4D5E',
  overlay: 'rgba(28, 18, 70, 0.84)',
  damageText: '#FF6B6B',
  heal: '#4ADE80',
  hpTrail: '#FFE3A3',
  /** 強化済みカードの名前。 */
  upgraded: '#7CF29A',
  /** 背景画像の上に重ねて少し落ち着かせ、UI を読みやすくする。絵が明るいので薄めに。 */
  sceneShade: 'rgba(36, 24, 90, 0.22)',
  /** 背景画像が透けて見えるパネル。 */
  panelTranslucent: 'rgba(47, 39, 102, 0.84)',
  textOutline: '#1A1240',
  /** 強化の瞬間の閃光。 */
  flash: '#FFF6D8',
  /** 画面切り替えの暗転。 */
  fade: '#1A1240',
  /** カードのイラストの隅に重ねる、種類の紋章の下地。 */
  cardEmblemBg: 'rgba(255, 255, 255, 0.85)',
} as const;

export const MAP_NODE_COLORS: Record<MapNodeType, string> = {
  enemy: '#FF6B5B',
  elite: '#FF8A3D',
  rest: '#FFB020',
  shop: '#3DDC84',
  event: '#A78BFA',
  treasure: '#FFD23F',
  boss: '#FF4D8D',
};

export const MAP_LAYOUT = {
  rowHeight: 76,
  nodeSize: 42,
  bossSize: 68,
  verticalPadding: 48,
  /** マスの位置を少しずらして手描きっぽく見せる幅。 */
  jitter: 8,
  dotSpacing: 9,
  dotSize: 4,
  /** マップを開いたとき、今いるマスを表示領域の下端からこれだけ上に置く。 */
  currentNodeBottomOffset: 80,
  /** 横向き: 左右の余白、階の間隔の下限（画面が狭いときはスクロール）、今いるマスを左端からどれだけ右に置くか。 */
  horizontalPadding: 48,
  minFloorSpacing: 60,
  currentNodeLeftOffset: 96,
  /** 横向きで左に置く情報の列の幅。 */
  landscapeSideWidth: 250,
} as const;

/** 演出のタイミング（ミリ秒）。 */
export const MOTION = {
  /** 1 回の操作で複数のイベントが起きたとき、1 件ずつずらして再生する間隔。 */
  eventStagger: 280,
  shakeStep: 45,
  /** 手札がいっぱいで引けなかったときの帯を出しておく時間（出入りの動きを含まない）。 */
  handFullHold: 1100,
  flashIn: 60,
  flashOut: 280,
  floatingText: 900,
  hpBar: 250,
  hpTrailDelay: 350,
  hpTrail: 400,
  defeat: 700,
  mapPulse: 650,
  resultFadeIn: 400,
  resultExtraDelay: 600,
  /** 斬撃・盾などのエフェクト絵文字が出て消えるまで。 */
  burst: 600,
  /** タイトルのゲーム名が浮かび上がる時間と、開始ボタンが一回ふくらむ（しぼむ）時間。 */
  titleFadeIn: 1200,
  titlePulse: 1100,
  /** マップでマスを押してから画面が切り替わるまで。最後の mapLeaveFade の間に暗転する。 */
  mapSelect: 650,
  mapLeaveFade: 300,
  /** 画面が切り替わったとき、暗転から明けるまで。 */
  phaseFadeIn: 350,
  /** 回復の演出が出て消えるまで。 */
  healBurst: 1800,
  /** 回復の演出で、HP バーが増え始めるまで。 */
  healBarDelay: 350,
  /** 強化の演出: 槌を振り下ろすまで → 光って強化後のカードが現れるまで。 */
  upgradeStrike: 550,
  upgradeReveal: 500,
  /** 強化後のカードのまわりできらめく周期。 */
  sparkle: 900,
  /** 入手の演出: 真ん中に現れる → 少し見せる → スロットへ飛ぶ。飛び先を測る前に画面の並びを待つ時間。 */
  acquireAppear: 320,
  acquireHold: 280,
  acquireFly: 480,
  acquireMeasureDelay: 120,
  /** スロットに収まったときの弾み（小さいほどよく揺れる）。 */
  slotLandFriction: 4,
  /** 所持金が数え上がる時間（差が大きいほど長く、この範囲に収める）と、増減の数字が浮いて消えるまで。 */
  goldCountMin: 400,
  goldCountMax: 1000,
  goldDelta: 1100,
} as const;

export const CARD_TYPE_COLORS: Record<CardType, string> = {
  attack: '#FF6B5B',
  skill: '#3FA9FF',
  power: '#FFB830',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/** 丸みを強めにして、やわらかい印象にする。 */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  round: 999,
} as const;

/** 戦闘画面のキャラクター（3D 表示）。size は描画領域の一辺、duration はミリ秒。 */
export const ACTOR_FIGURE = {
  size: 128,
  /** 敵が多い・画面が低いときに縮めても、これより小さくはしない。 */
  minSize: 48,
  /** サイズはこの刻みに丸める（わずかなレイアウトの揺れで 3D を作り直さないため）。 */
  step: 8,
  /** 行動したときに相手の方へ体を傾ける時間。 */
  leanDuration: 320,
  /** 被弾してのけぞる時間。 */
  recoilDuration: 280,
} as const;

/**
 * 戦闘画面の舞台の割り付け。chrome はキャラの絵以外（行動予告・名前・HP など）が使う高さの目安。
 * 敵が compactEnemyCount 体以上いるときと横向きのときは、文字を小さくした詰めた表示にする。
 */
export const COMBAT_LAYOUT = {
  enemyChrome: 130,
  compactEnemyChrome: 108,
  playerChrome: 84,
  /** パネルの枠線と内側の余白の合計（左右）。 */
  panelInset: 12,
  compactEnemyCount: 3,
  /** 縦向きで敵が 1 体のとき・自分の、舞台の幅に対する割合。 */
  soloEnemyWidthRatio: 0.6,
  playerWidthRatio: 0.6,
  /** 横向きの左の列（所持品・自分・エナジー）の幅の割合。 */
  landscapeSideRatio: 0.27,
  /** 横向きのとき、手札のカードの高さを画面の高さのこの割合までにする。 */
  landscapeCardHeightRatio: 0.3,
  /** 横向きでターン終了ボタンと山札・捨て札を縦に積む列の幅。 */
  landscapeFooterWidth: 136,
} as const;

/** 所持品欄（レリック・ポーション）。 */
export const ITEM_BAR = {
  /** 横向きは所持品欄を細い左の列に置くので、説明欄はこの幅まで右へはみ出して広げる。 */
  landscapePopoverWidth: 340,
  /** 戦闘中にポーションを持ち上げたとき、指の上に描くアイコンの大きさ。 */
  potionGhostSize: 44,
} as const;

/** 手札の並べ方。visibleCards 枚がちょうど画面幅に収まるようにカード幅を決める。 */
export const HAND_LAYOUT = {
  visibleCards: 5,
  gap: 6,
  /** 左上のコスト表示がはみ出す分の余白。 */
  edgePadding: SPACING.sm,
  /** 手札の枠の上端からカードの上端まで（同じくコスト表示の分）。 */
  topPadding: SPACING.sm,
  /** カードの縦横比（高さ / 幅）。 */
  aspectRatio: 1.375,
} as const;

/** カードの上半分に置くイラスト枠。 */
export const CARD_ART = {
  /** 枠の高さ / カードの幅。名前・種類・説明文も収まるよう、手札（幅 64px 程度）でも 4 割弱に抑える。 */
  heightRatio: 0.52,
  /** 絵が無いカードの枠を、種類の色でうっすら塗る不透明度（16 進 2 桁）。 */
  fallbackAlpha: '33',
} as const;
