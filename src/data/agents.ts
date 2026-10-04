import type { AgentDefinition } from '../domain/agent';
import { CRIMSON_PHOENIX } from './cards';

/** 赤髪の熱血剣士。HP を燃やす力押しと、弱体・衰弱で敵を崩す戦い方が得意。 */
export const CRIMSON_HERO: AgentDefinition = {
  id: 'crimson-hero',
  name: '紅蓮のカイル',
  icon: '🔥',
  mysticArte: CRIMSON_PHOENIX,
};
