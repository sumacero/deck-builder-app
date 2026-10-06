import type { AgentDefinition } from '../domain/agent';
import { CRIMSON_PHOENIX } from './cards';
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
    '宿り木の種を植えて毎ターン敵を削り、芽吹かせて一気に刈り取る。茨の鎧で受けた攻撃を返し、守りながら勝つ。',
  attribute: 'grass',
  mysticArte: THOUSAND_YEAR_TREE,
};

export const ALL_AGENTS: readonly AgentDefinition[] = [CRIMSON_HERO, VERDANT_ARCHER];
