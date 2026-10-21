import { useEffect, useRef, useState } from 'react';
import type { CombatEvent } from '../domain/combat';
import {
  hasAgentPoses,
  poseFromCardMotion,
  type AgentPose,
} from '../components/agents/agentPoses';
import { agentMotionDuration } from '../components/combat/motion/motionPresets';
import { useCombatEvents } from './useCombatEvents';

type Options = {
  agentId: string;
  /** HP 0 のとき downed を固定する。 */
  defeated: boolean;
};

/**
 * 戦闘イベントから紙人形のポーズを決める。
 * カード使用中だけ slash/guard などを出し、終わったら idle に戻す。
 * 敗北・勝利は上書きして維持する。
 */
export function useAgentPose(events: CombatEvent[], { agentId, defeated }: Options): AgentPose {
  const [pose, setPose] = useState<AgentPose>('idle');
  const enabled = hasAgentPoses(agentId);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  useCombatEvents(events, (event) => {
    if (!enabled || defeated) return;
    if (event.kind === 'won' && event.target === 'player') {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setPose('victory');
      return;
    }
    if (event.kind === 'defeated' && event.target === 'player') {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setPose('downed');
      return;
    }
    if (event.kind === 'cardPlayed') {
      const next = poseFromCardMotion(event.motion, agentId);
      setPose(next);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      const hold = agentMotionDuration(agentId, event.motion);
      resetTimer.current = setTimeout(() => {
        setPose((current) => (current === next ? 'idle' : current));
      }, hold);
    }
  });

  if (!enabled) return 'idle';
  if (defeated) return 'downed';
  return pose;
}
