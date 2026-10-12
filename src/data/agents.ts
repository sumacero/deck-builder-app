import type { AgentDefinition } from '../domain/agent';
import { CRIMSON_PHOENIX } from './cards';
import { MIRROR_TRIAD } from './mirrorCards';
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

/** 水盤に透けた札を置く占い師。同じ種類・同じ段の札を手札で重ねて段を上げる。 */
export const MIRROR_SEER: AgentDefinition = {
  id: 'mirror-seer',
  name: '水鏡のノア',
  icon: '💧',
  title: '水面の占い師',
  playStyle:
    '札には氷・雫・霞の印がある。アタックどうし・スキルどうしで同じ段の札を重ねると段が上がり（1→2→4）、数値が 2 倍・3 倍になる。重ねて消えた札の印で、霜・ドロー・筋力消し・悪い効果消しが起きる。',
  attribute: 'water',
  mysticArte: MIRROR_TRIAD,
};

export const ALL_AGENTS: readonly AgentDefinition[] = [CRIMSON_HERO, VERDANT_ARCHER, MIRROR_SEER];
