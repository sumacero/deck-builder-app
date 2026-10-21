import type { ImageSourcePropType } from 'react-native';

/** エージェント id → Style B（切り紙）立ち絵。ドメインは画像を知らない。 */
const AGENT_ART: Record<string, ImageSourcePropType> = {
  'crimson-hero': require('../../../assets/agents/crimson-hero.png'),
  'verdant-archer': require('../../../assets/agents/verdant-archer.png'),
  'mirror-seer': require('../../../assets/agents/mirror-seer.png'),
};

export function agentArt(agentId: string): ImageSourcePropType | undefined {
  return AGENT_ART[agentId];
}
