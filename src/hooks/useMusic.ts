import { useEffect } from 'react';
import { AppState } from 'react-native';
import type { MusicId } from '../audio/music';
import { pauseMusic, playMusic, resumeMusic, stopMusic } from '../audio/musicPlayer';

/**
 * 画面を開いている間 BGM を流す。null のときは止める（決着して勝敗の効果音を聞かせたいときなど）。
 * 画面を離れたらフェードアウトし、アプリがバックグラウンドに回ったら一時停止する。
 */
export function useMusic(id: MusicId | null) {
  useEffect(() => {
    if (!id) return;
    playMusic(id);
    return () => stopMusic(id);
  }, [id]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') resumeMusic();
      else pauseMusic();
    });
    return () => subscription.remove();
  }, []);
}
