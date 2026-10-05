import type { Attribute } from './domain/attribute';
import type { CardType } from './domain/card';
import type { MapNodeType } from './domain/map';
import type { RelicRarity } from './domain/relic';

/**
 * アニメ調ファンタジー RPG の配色。深い紺を土台に、金の縁取りで王道の気品を出す。
 * 真っ黒にはせず、背景の絵が映える程度の明るさの紺に保つ。
 */
export const COLORS = {
  bg: '#141A2E',
  panel: '#1E2742',
  panelBorder: '#3A4A75',
  surface: '#26304F',
  text: '#F2EEE3',
  textMuted: '#9AA3BF',
  /** アクセント（ボタン・見出し・選択中の枠）。紋章のような落ち着いた金。 */
  gold: '#E2B84A',
  goldDark: '#4A3A18',
  onGold: '#241A06',
  hp: '#E0474C',
  hpTrack: '#3A1A24',
  block: '#4A9BE0',
  energy: '#F0A830',
  danger: '#E5484D',
  overlay: 'rgba(8, 12, 26, 0.86)',
  damageText: '#FF6B6B',
  heal: '#4CC27A',
  /** 敵の妨害（麻痺・凍え・封印）。 */
  hindrance: '#A98BEB',
  /** 敵がチャージ中（次に大技が来る）。 */
  charge: '#F5D547',
  /** 霊体化した敵。 */
  spirit: '#8FD3E8',
  /** 眠りなど、敵が何もしないターン。 */
  idle: '#7C849E',
  hpTrail: '#F5DFA0',
  /** 強化済みカードの名前。 */
  upgraded: '#6EE09A',
  /** 背景画像の上に重ねて少し落ち着かせ、UI を読みやすくする。 */
  sceneShade: 'rgba(10, 14, 30, 0.35)',
  /** 背景画像が透けて見えるパネル。 */
  panelTranslucent: 'rgba(30, 39, 66, 0.86)',
  textOutline: '#0A0E1C',
  /** 強化の瞬間の閃光。 */
  flash: '#FFF4D6',
  /** 画面切り替えの暗転。 */
  fade: '#0A0E1C',
  /** カードのイラストの隅に重ねる、種類の紋章の下地。 */
  cardEmblemBg: 'rgba(10, 14, 30, 0.7)',
  /** 弱点を突いたときの文字と、敵の弱点の表示。 */
  weakness: '#FFB347',
  /** 秘奥義ゲージ・秘奥義カードの縁と、カットインの帯。 */
  arte: '#FF7A3D',
  arteTrack: '#3A2418',
  arteBand: 'rgba(40, 14, 6, 0.88)',
} as const;

/** レリックのレア度の色（枠と名前の横のラベル）。 */
export const RELIC_RARITY_COLORS: Record<RelicRarity, string> = {
  starter: '#9AA3BF',
  common: '#C9D1E6',
  uncommon: '#5AA9FF',
  rare: '#E2B84A',
  boss: '#E5484D',
};

export const MAP_NODE_COLORS: Record<MapNodeType, string> = {
  enemy: '#D9534F',
  elite: '#E07B39',
  rest: '#F0A830',
  shop: '#4CC27A',
  event: '#9B7FE0',
  treasure: '#E2B84A',
  boss: '#C2364F',
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
  /** マップを開いたとき、今いるマスを表示領域の上からこの割合の位置に置く（上の、この先のマスを広く見せる）。 */
  currentNodeViewportRatio: 0.7,
  /** 今いるマスの目印: 輪とマスの隙間、ピンの大きさ・マスとの隙間・弾む高さ。 */
  markerRingPadding: 7,
  markerWidth: 76,
  markerHeight: 26,
  markerGap: 4,
  markerBob: 4,
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
  /** マップの「現在地」のピンが上がる（下がる）時間。 */
  mapMarkerBob: 700,
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
  /** 秘奥義のカットインを見せる時間（この間、後続の演出は待つ）。 */
  arteCutIn: 1400,
} as const;

export const CARD_TYPE_COLORS: Record<CardType, string> = {
  attack: '#D9534F',
  skill: '#3E86D6',
  power: '#D9A23A',
  status: '#6E6A80',
};

/** 属性のカードの枠・紋章の色。種類の色（赤・青）と見分けがつくよう、火は橙、水は水色にしている。 */
export const ATTRIBUTE_COLORS: Record<Attribute, string> = {
  grass: '#4CC96A',
  fire: '#FF7A2B',
  water: '#2FB8E8',
};

/** 属性カードの本文の背景にうっすら敷く色の不透明度（16 進 2 桁）。 */
export const ATTRIBUTE_TINT_ALPHA = '22';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/** 角は控えめに丸めて、引き締まった印象にする。 */
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  round: 999,
} as const;

/** 戦闘画面のキャラクター（3D 表示）。size は描画領域の一辺、duration はミリ秒。 */
export const ACTOR_FIGURE = {
  size: 128,
  /** エージェント選択画面の 3D の一辺。 */
  selectSize: 112,
  /** ラスボス戦の前の画面に立つ、ラスボスの 3D の一辺。 */
  finaleSize: 176,
  /** 敵が多い・画面が低いときに縮めても、これより小さくはしない。 */
  minSize: 48,
  /** サイズはこの刻みに丸める（わずかなレイアウトの揺れで 3D を作り直さないため）。 */
  step: 8,
  /** 行動したときに相手の方へ体を傾ける時間。 */
  leanDuration: 320,
  /** 被弾してのけぞる時間。 */
  recoilDuration: 280,
  /** セル塗りの輪郭線。 */
  outline: COLORS.textOutline,
  /** 足元の魔法陣と漂う光の粒の色。 */
  aura: { player: COLORS.gold, enemy: '#B85CFF' },
  /** 属性・地域ごとの魔法陣と粒の色（敵のモデルの aura）。 */
  elementAura: {
    fire: '#FF7A2B',
    grass: '#6EE07A',
    water: '#5CCBFF',
    thunder: '#FFE04A',
    arcane: '#B85CFF',
  },
  /** 背後から当てて輪郭を光らせるリムライト。 */
  rimLight: '#8FB8FF',
} as const;

/**
 * 戦闘画面の舞台の割り付け。chrome はキャラの絵以外（行動予告・名前・HP など）が使う高さの目安。
 * 敵が compactEnemyCount 体以上いるときと横向きのときは、文字を小さくした詰めた表示にする。
 */
export const COMBAT_LAYOUT = {
  enemyChrome: 130,
  compactEnemyChrome: 108,
  /** 自分の 3D 以外（名前・状態・HP・秘奥義ゲージ・余白）の高さ。足りないと下のエナジー欄に重なる。 */
  playerChrome: 128,
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
