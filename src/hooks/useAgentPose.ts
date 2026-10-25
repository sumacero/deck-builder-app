import { useEffect, useRef, useState } from 'react';
import type { CombatEvent } from '../domain/combat';
import {
  hasAgentPoses,
  poseFromCardMotion,
  type AgentPose,
} from '../components/agents/agentPoses';
import { agentMotionDuration } from '../components/combat/motion/motionPresets';
import { useCombatEvents, useOutcomeRevealed } from './useCombatEvents';

type Options = {
  agentId: string;
  /** 実際の HP が 0。ポーズはゲージが空になってから倒れる。 */
  defeated: boolean;
};

/**
 * 戦闘イベントから紙人形のポーズを決める。
 * カード使用中だけ slash/guard などを出し、終わったら idle に戻す。
 * 勝利・敗北は、HP ゲージが 0 に着いてから出す。先に変えると結果が分かってしまう。
 */
export function useAgentPose(events: CombatEvent[], { agentId, defeated }: Options): AgentPose {
  const [pose, setPose] = useState<AgentPose>('idle');
  const enabled = hasAgentPoses(agentId);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const combatOver = defeated || events.some((event) => event.kind === 'won');
  const outcomeRevealed = useOutcomeRevealed(events, combatOver);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  useCombatEvents(events, (event) => {
    if (!enabled || event.kind !== 'cardPlayed') return;
    const next = poseFromCardMotion(event.motion, agentId);
    setPose(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    const hold = agentMotionDuration(agentId, event.motion);
    resetTimer.current = setTimeout(() => {
      setPose((current) => (current === next ? 'idle' : current));
    }, hold);
  });

  if (!enabled) return 'idle';
  if (outcomeRevealed) return defeated ? 'downed' : 'victory';
  return pose;
}
