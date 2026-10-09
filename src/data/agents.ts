import type { AgentDefinition } from '../domain/agent';
import { CRIMSON_PHOENIX } from './cards';
import { WHITE_WAVE } from './rainCards';
import { THOUSAND_YEAR_TREE } from './verdantCards';

/** 赤髪の熱血剣士。HP を燃やす力押しと、弱体・衰弱で敵を崩す戦い方が得意。 */
export const CRIMSON_HERO: AgentDefinition = {
  id: 'crimson-hero',
  name: '紅蓮のカイル',
  icon: '🔥',
  title: '熱血の剣士',
  playStyle: '筋力を積んだ一撃と、HP を燃やす捨て身の攻めで押し切る。弱体・衰弱で敵を崩すのも得意。',
  attribute: 'fire',
  mysticArte: CRIMSON_PHOENIX,
};

/** 森の民の狩人（弓とムチ）。宿り木で敵をじわじわ削り、茨の守りで受けた攻撃を返す。 */
export const VERDANT_ARCHER: AgentDefinition = {
  id: 'verdant-archer',
  name: '翠風のリーネ',
  icon: '🌿',
  title: '弓とムチの森の狩人',
  playStyle:
    '宿り木の種で毎ターンじわじわ削るのが基本。腰のムチで打つたびに宿り木を植え、弓は 0 コストの矢を次々に作って放つ。ブロックは蔦・年輪・葉・鞭で受け、攻めながら壁を足す。',
  attribute: 'grass',
  mysticArte: THOUSAND_YEAR_TREE,
};

/** 雨宿りの少年魔法使い。敵の次の行動に潮をかけ、威力を削る。 */
export const RAIN_MAGE: AgentDefinition = {
  id: 'rain-mage',
  name: '蒼雨のノエル',
  icon: '💧',
  title: '雨宿りの魔法使い',
  playStyle:
    '敵に潮をかけ、次の行動の威力を削る。攻撃・守り・強化・回復が弱まり、消えた行動と封印は流れる。潮を割れば、ためた分が水のダメージになる。',
  attribute: 'water',
  mysticArte: WHITE_WAVE,
};

export const ALL_AGENTS: readonly AgentDefinition[] = [CRIMSON_HERO, VERDANT_ARCHER, RAIN_MAGE];
