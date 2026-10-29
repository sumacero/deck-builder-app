import { StyleSheet, View } from 'react-native';
import type { RunPhase, RunState } from '../../domain/run';
import type { BlessingActions } from '../../hooks/useRun';
import { canUpgrade, stackCards, upgradeCard } from '../../logic/cards';
import { CardPickerModal } from '../cards/CardPickerModal';

type DeckEditPhase = Extract<RunPhase, { kind: 'deckEdit' }>;

type DeckEditScreenProps = {
  run: RunState;
  phase: DeckEditPhase;
  actions: BlessingActions;
};

/** 恩恵・出来事で「カードを選んで強化 / 削除」を選んだあとの画面。 */
export function DeckEditScreen({ run, phase, actions }: DeckEditScreenProps) {
  const upgrading = phase.mode === 'upgrade';
  const stacks = stackCards(upgrading ? run.deck.filter(canUpgrade) : run.deck);
  const title = upgrading ? '強化するカードを選ぶ' : '削除するカードを選ぶ';
  // 出来事の強化は、決めるまで選択肢に戻れる。削除などは、選べる札があるあいだ抜けられない。
  const canLeave = phase.cancellable !== false || stacks.length === 0;
  const backToEvent = phase.resume?.kind === 'event' && canLeave;
  const cancelLabel = backToEvent ? '戻る' : phase.cancellable === false ? '先へ進む' : '受け取らない';
  return (
    <View style={styles.root}>
      <CardPickerModal
        title={title}
        note={backToEvent ? '決めるまでは、出来事の選択肢に戻れます' : undefined}
        stacks={stacks}
        confirmLabel={upgrading ? '強化する' : '削除する'}
        cancelLabel={cancelLabel}
        preview={upgrading ? upgradeCard : undefined}
        onConfirm={(card) => actions.finishDeckEdit(card)}
        onCancel={canLeave ? () => actions.finishDeckEdit(null) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
