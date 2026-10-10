/**
 * ターン数つきの状態。値は残りターン数で、0 になると消える。重ねてかけるとターン数が加算される。
 * - vulnerable（弱体）: 受けるダメージが 1.5 倍
 * - weak（衰弱）: 与えるダメージが半分
 * - retainBlock（ブロック保持）: ターンの始めにブロックが消えない
 * - blazing（熱血）: 与えるダメージが 1.5 倍
 * - intangible（霊体化。敵だけ）: 攻撃 1 回で受けるダメージが最大 1
 * - seed（宿り木。敵だけに効く）: 敵のターンの始めに、残りターン数と同じダメージ（ブロック無視）を受ける。
 *   ターン数がそのまま威力なので、デバフを延ばす・数えるカードとも噛み合う。
 */
export type DebuffId = 'vulnerable' | 'weak' | 'seed';
export type BuffId = 'retainBlock' | 'blazing';
export type EnemyStatusId = 'intangible';
export type StatusId = DebuffId | BuffId | EnemyStatusId;

export type Statuses = Partial<Record<StatusId, number>>;

/**
 * パワーカードで得る、戦闘の終わりまで続く能力。値は重ねた量（ターン数ではない）。
 * - barricade（不動）: ターンの始めにブロックが消えない
 * - demonForm（紅蓮の化身）: ターンの始めに筋力 +N
 * - juggernaut（鉄壁の闘気）: ブロックを得るたびに、HP が一番低い敵に N ダメージ
 * - sadistic（弱点看破）: 敵にデバフを与えるたびに、その敵に N ダメージ
 * - rupture（燃える血潮）: HP を失うたびに筋力 +N
 * - feelNoPain（灰より立つ）: カードが廃棄されるたびにブロック +N
 * - thorns（茨の鎧）: 敵の攻撃を 1 回受けるたびに、その敵に N ダメージ
 * - overgrowth（森の侵蝕）: ターンの始めに、敵全体に宿り木 N
 * - verdure（命の芽吹き）: 敵に宿り木を与えるたびに、ブロック +N
 * - quickdraw（速射の構え）: カードを使うたびに、HP が一番低い敵に N ダメージ
 * - flurry（連閃）: 同じ攻撃の 2 ヒット目以降、1 ヒットごとにダメージ +N
 * - lashSeed（宿り木の蔓）: ムチの攻撃が 1 回当たるたびに、その敵に宿り木 N
 * - arrowEdge（鋭き鏃）: 矢のダメージ +N
 * - arrowSpread（散り矢の構え）: 矢が敵全体に当たる
 * - arrowRetain（矢筒の備え）: ターン終了時、手札の矢を捨てずに残す
 * - arrowSupply（無限の矢筒）: ターンの始めに矢 N 本を手札に加える
 * - markCount（水面）: 印を数えるとき、同じ印が N 枚多くあるものとして扱う
 * - markDepth（深み）: 雨と波の倍率を N 段階上げる（最大 4 倍）
 * - waterClone（水分身）: 敵の攻撃を 1 回、自分の代わりに受ける。受けると 1 つ消える
 */
export type PowerId =
  | 'barricade'
  | 'demonForm'
  | 'juggernaut'
  | 'sadistic'
  | 'rupture'
  | 'feelNoPain'
  | 'thorns'
  | 'overgrowth'
  | 'verdure'
  | 'quickdraw'
  | 'flurry'
  | 'lashSeed'
  | 'arrowEdge'
  | 'arrowSpread'
  | 'arrowRetain'
  | 'arrowSupply'
  | 'markCount'
  | 'markDepth'
  | 'waterClone';

export type Powers = Partial<Record<PowerId, number>>;
