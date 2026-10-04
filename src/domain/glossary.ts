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
  | 'intentAttack'
  | 'intentBlock'
  | 'intentBuff';

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
};
