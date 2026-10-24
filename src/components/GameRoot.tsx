import { useEffect, useState } from 'react';
import { AGENT_RUNS } from '../data/runSetups';
import type { RunSetup, RunState } from '../domain/run';
import { clearSavedRun, loadSavedRun } from '../services/runStorage';
import { RunRoot } from './run/RunRoot';
import { AgentSelectScreen } from './title/AgentSelectScreen';
import { TitleScreen } from './title/TitleScreen';

type Screen =
  | { kind: 'title' }
  | { kind: 'select' }
  | { kind: 'run'; setup: RunSetup; initial?: RunState };

/** 続きから、のボタンに出す短い場所。 */
function continueLabel(run: RunState): string {
  const chapter = run.actIndex + 1;
  if (run.phase.kind === 'cleared') return `${run.agent.name}の踏破を見る`;
  if (run.phase.kind === 'gameOver') return `${run.agent.name}の振り返りを見る`;
  return `${run.agent.name}の第 ${chapter} 章から続ける`;
}

/** アプリ全体の画面切り替え。タイトル →「冒険を始める」で仲間選び → ランへ。 */
export function GameRoot() {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });
  const [saved, setSaved] = useState<RunState | null>(null);
  const toTitle = () => setScreen({ kind: 'title' });

  useEffect(() => {
    let active = true;
    void loadSavedRun().then((run) => {
      if (!active || !run) return;
      if (!AGENT_RUNS.some((setup) => setup.agent.id === run.agent.id)) {
        clearSavedRun();
        return;
      }
      setSaved(run);
    });
    return () => {
      active = false;
    };
  }, []);

  const exitRun = () => {
    clearSavedRun();
    setSaved(null);
    setScreen({ kind: 'title' });
  };

  const continueRun = () => {
    if (!saved) return;
    const setup = AGENT_RUNS.find((item) => item.agent.id === saved.agent.id);
    if (!setup) return;
    setScreen({ kind: 'run', setup, initial: saved });
  };

  switch (screen.kind) {
    case 'title':
      return (
        <TitleScreen
          onStart={() => setScreen({ kind: 'select' })}
          continueLabel={saved ? continueLabel(saved) : undefined}
          onContinue={saved ? continueRun : undefined}
        />
      );
    case 'select':
      return (
        <AgentSelectScreen
          runs={AGENT_RUNS}
          onSelect={(setup) => setScreen({ kind: 'run', setup })}
          onBack={toTitle}
        />
      );
    case 'run':
      // あきらめると、振り返りからタイトルへ戻ると、セーブは消える。
      // アプリを閉じただけなら、次の起動で「続きから」が出る。
      return <RunRoot setup={screen.setup} initialRun={screen.initial} onExitToTitle={exitRun} />;
  }
}
