/** カードやキャラの状態に出てくる用語。長押し・タップで解説を出す。 */
export type KeywordId =
  | 'attack'
  | 'skill'
  | 'power'
  | 'damage'
  | 'areaAttack'
  | 'block'
  | 'energy'
  | 'draw'
  | 'heal'
  | 'loseHp'
  | 'strength'
  | 'tempStrength'
  | 'endTurnBlock'
  | 'exhaust'
  | 'copyToDiscard'
  | 'paralysis'
  | 'chill'
  | 'seal'
  | 'intentAttack'
  | 'intentBlock'
  | 'intentBuff'
  | 'intentHeal'
  | 'intentAllyHeal'
  | 'intentParalyze'
  | 'intentChill'
  | 'intentSeal'
  | 'intentCharge';

export type KeywordDefinition = {
  id: KeywordId;
  name: string;
  icon: string;
  description: string;
};

/** キャラにかかっている状態（バフ・デバフ）1 つ分。value は重なっている量。 */
export type StatusView = {
  keyword: KeywordId;
  value: number;
  /** 量を持たない状態（封印など）。数値を表示しない。 */
  flag?: boolean;
};
