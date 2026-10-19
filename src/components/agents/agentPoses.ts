import type { ImageSourcePropType } from 'react-native';
import type { CardMotion } from '../../domain/card';

/** カクカクの紙人形アニメ用ポーズ。 */
export type AgentPose = 'idle' | 'guard' | 'slash' | 'downed' | 'victory';

const CRIMSON_POSES: Record<AgentPose, ImageSourcePropType> = {
  idle: require('../../../assets/agents/crimson-hero.png'),
  guard: require('../../../assets/agents/crimson-hero-guard.png'),
  slash: require('../../../assets/agents/crimson-hero-slash.png'),
  downed: require('../../../assets/agents/crimson-hero-downed.png'),
  victory: require('../../../assets/agents/crimson-hero-victory.png'),
};

const VERDANT_POSES: Record<AgentPose, ImageSourcePropType> = {
  idle: require('../../../assets/agents/verdant-archer.png'),
  guard: require('../../../assets/agents/verdant-archer-guard.png'),
  slash: require('../../../assets/agents/verdant-archer-slash.png'),
  downed: require('../../../assets/agents/verdant-archer-downed.png'),
  victory: require('../../../assets/agents/verdant-archer-victory.png'),
};

const MIRROR_POSES: Record<AgentPose, ImageSourcePropType> = {
  idle: require('../../../assets/agents/mirror-seer.png'),
  guard: require('../../../assets/agents/mirror-seer-guard.png'),
  slash: require('../../../assets/agents/mirror-seer-slash.png'),
  downed: require('../../../assets/agents/mirror-seer-downed.png'),
  victory: require('../../../assets/agents/mirror-seer-victory.png'),
};

const POSES_BY_AGENT: Record<string, Record<AgentPose, ImageSourcePropType>> = {
  'crimson-hero': CRIMSON_POSES,
  'verdant-archer': VERDANT_POSES,
  'mirror-seer': MIRROR_POSES,
};

/** エージェントのポーズ絵。未登録なら idle 相当（通常立ち絵）だけ返す。 */
export function agentPoseArt(agentId: string, pose: AgentPose): ImageSourcePropType | undefined {
  const set = POSES_BY_AGENT[agentId];
  if (!set) return undefined;
  return set[pose] ?? set.idle;
}

/** このエージェントにポーズセットがあるか。 */
export function hasAgentPoses(agentId: string): boolean {
  return agentId in POSES_BY_AGENT;
}

/** 剣を振る攻撃。カイルは、このときだけ炎を纏った斬撃ポーズを出す。 */
const SWORD_ATTACKS: ReadonlySet<CardMotion> = new Set(['strike', 'flurry', 'heavy', 'sweep', 'lash']);

/**
 * カードの動き → 表示するポーズ。
 * カイルの炎は攻撃ポーズにだけ描いてあるので、力を溜める・身を削る動きでは待機に戻す。
 */
export function poseFromCardMotion(motion: CardMotion, agentId?: string): AgentPose {
  if (motion === 'guard') return 'guard';
  if (agentId === 'crimson-hero' && !SWORD_ATTACKS.has(motion)) return 'idle';
  return 'slash';
}
