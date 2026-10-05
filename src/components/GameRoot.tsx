import { useState } from 'react';
import { AGENT_RUNS } from '../data/runSetups';
import type { RunSetup } from '../domain/run';
import { RunRoot } from './run/RunRoot';
import { AgentSelectScreen } from './title/AgentSelectScreen';
import { TitleScreen } from './title/TitleScreen';

type Screen = { kind: 'title' } | { kind: 'select' } | { kind: 'run'; setup: RunSetup };

/** アプリ全体の画面切り替え。タイトル →「冒険を始める」で仲間選び → ランへ。 */
export function GameRoot() {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });
  const toTitle = () => setScreen({ kind: 'title' });
  switch (screen.kind) {
    case 'title':
      return <TitleScreen onStart={() => setScreen({ kind: 'select' })} />;
    case 'select':
      return (
        <AgentSelectScreen
          runs={AGENT_RUNS}
          onSelect={(setup) => setScreen({ kind: 'run', setup })}
          onBack={toTitle}
        />
      );
    case 'run':
      // ランの状態は RunRoot の中にあるので、タイトルに戻ると破棄され、次は新しいランになる。
      return <RunRoot setup={screen.setup} onExitToTitle={toTitle} />;
  }
}
