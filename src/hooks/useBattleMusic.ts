import { useEffect } from 'react';
import { AppState } from 'react-native';
import { battleMusicFor } from '../audio/music';
import { pauseMusic, playMusic, resumeMusic, stopMusic } from '../audio/musicPlayer';
import type { EnemyRank } from '../domain/enemy';

/**
 * 敵の格（通常・エリート・ボス）に合わせた BGM を流す。
 * 決着がついたら勝敗の効果音が聞こえるようにフェードアウトし、画面を離れても止める。
 */
export function useBattleMusic(rank: EnemyRank, finished: boolean) {
  const music = battleMusicFor(rank);

  useEffect(() => {
    if (finished) return;
    playMusic(music);
    return stopMusic;
  }, [music, finished]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') resumeMusic();
      else pauseMusic();
    });
    return () => subscription.remove();
  }, []);
}
