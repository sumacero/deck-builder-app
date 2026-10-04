import type { CardType } from './domain/card';
import type { MapNodeType } from './domain/map';

export const COLORS = {
  bg: '#121212',
  panel: '#1E1E1E',
  panelBorder: '#2E2E2E',
  surface: '#262626',
  text: '#E8E4DA',
  textMuted: '#8A8790',
  gold: '#C9A227',
  goldDark: '#2A2410',
  onGold: '#1A1408',
  hp: '#C0483D',
  hpTrack: '#3A1E1C',
  block: '#4A8FD4',
  energy: '#E0A030',
  danger: '#B33A3A',
  overlay: 'rgba(0, 0, 0, 0.8)',
  damageText: '#FF5A4E',
  heal: '#4CAF6E',
  hpTrail: '#F2D7A0',
  /** 強化済みカードの名前。 */
  upgraded: '#7FD36B',
  /** 背景画像の上に重ねて暗くし、UI を読みやすくする。 */
  sceneShade: 'rgba(0, 0, 0, 0.45)',
  /** 背景画像が透けて見えるパネル。 */
  panelTranslucent: 'rgba(30, 30, 30, 0.72)',
  textOutline: '#000000',
} as const;

export const MAP_NODE_COLORS: Record<MapNodeType, string> = {
  enemy: '#C0483D',
  elite: '#D1503A',
  rest: '#E0A030',
  shop: '#4CAF6E',
  event: '#8A7AD1',
  treasure: '#C9A227',
  boss: '#B33A3A',
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
} as const;

/** 演出のタイミング（ミリ秒）。 */
export const MOTION = {
  /** 1 回の操作で複数のイベントが起きたとき、1 件ずつずらして再生する間隔。 */
  eventStagger: 280,
  shakeStep: 45,
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
} as const;

export const CARD_TYPE_COLORS: Record<CardType, string> = {
  attack: '#C0483D',
  skill: '#3D7CC0',
  power: '#D1A23A',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
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

/** 手札の並べ方。visibleCards 枚がちょうど画面幅に収まるようにカード幅を決める。 */
export const HAND_LAYOUT = {
  visibleCards: 5,
  gap: 6,
  /** 左上のコスト表示がはみ出す分の余白。 */
  edgePadding: SPACING.sm,
  /** カードの縦横比（高さ / 幅）。 */
  aspectRatio: 1.375,
} as const;
