import { useEffect } from 'react';
import { sceneCue } from '../audio/sceneCues';
import { playSound } from '../audio/soundPlayer';

const VOICE_DELAY_MS = 220;

/** 場所を開いたとき、効果音と、いる人の声を一度だけ鳴らす。 */
export function useSceneCue(placeId: string | null) {
  useEffect(() => {
    if (!placeId) return;
    const cue = sceneCue(placeId);
    if (!cue) return;
    playSound(cue.se);
    if (!cue.voice) return;
    const voice = cue.voice;
    const timer = setTimeout(() => playSound(voice), VOICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [placeId]);
}
