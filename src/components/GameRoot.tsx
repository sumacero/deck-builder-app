import { useState } from 'react';
import { RunRoot } from './run/RunRoot';
import { TitleScreen } from './title/TitleScreen';

type Screen = 'title' | 'run';

/** アプリ全体の画面切り替え。起動するとタイトル、「冒険を始める」でランへ。 */
export function GameRoot() {
  const [screen, setScreen] = useState<Screen>('title');
  if (screen === 'title') return <TitleScreen onStart={() => setScreen('run')} />;
  // ランの状態は RunRoot の中にあるので、タイトルに戻ると破棄され、次は新しいランになる。
  return <RunRoot onExitToTitle={() => setScreen('title')} />;
}
