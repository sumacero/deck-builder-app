import { useEffect, useState } from 'react';
import { getAudioSettings, subscribeAudioSettings, type AudioSettings } from '../audio/audioSettings';

/** 設定画面が音量の変化を受け取る。中身の保存は audioSettings 側。 */
export function useAudioSettings(): AudioSettings {
  const [current, setCurrent] = useState(getAudioSettings);
  useEffect(() => subscribeAudioSettings(() => setCurrent(getAudioSettings())), []);
  return current;
}
