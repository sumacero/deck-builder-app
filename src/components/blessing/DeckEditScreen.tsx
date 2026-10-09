import { StyleSheet, View } from 'react-native';
import type { RunPhase, RunState } from '../../domain/run';
import type { BlessingActions } from '../../hooks/useRun';
import { canUpgrade, stackCards, upgradeCard } from '../../logic/cards';
import { MARK_NAME } from '../../logic/marks';
import { CardPickerModal } from '../cards/CardPickerModal';

type DeckEditPhase = Extract<RunPhase, { kind: 'deckEdit' }>;

type DeckEditScreenProps = {
  run: RunState;
  phase: DeckEditPhase;
  actions: BlessingActions;
};

/** 恩恵・出来事で「カードを選んで強化 / 削除 / 印を書く」を選んだあとの画面。 */
export function DeckEditScreen({ run, phase, actions }: DeckEditScreenProps) {
  const remarking = phase.mode === 'remark';
  const upgrading = phase.mode === 'upgrade';
  const title = remarking
    ? `${MARK_NAME[phase.mark]}の印にするカードを選ぶ`
    : upgrading
      ? '強化するカードを選ぶ'
      : '削除するカードを選ぶ';
  return (
    <View style={styles.root}>
      <CardPickerModal
        title={title}
        note={remarking ? '印の無いカードにも押せる。雨はダメージ、波はブロック、氷はエナジー。' : undefined}
        stacks={stackCards(upgrading ? run.deck.filter(canUpgrade) : run.deck)}
        confirmLabel={remarking ? `${MARK_NAME[phase.mark]}にする` : upgrading ? '強化する' : '削除する'}
        cancelLabel="受け取らない"
        preview={
          upgrading ? upgradeCard : remarking ? (card) => ({ ...card, mark: phase.mark }) : undefined
        }
        onConfirm={(card) => actions.finishDeckEdit(card)}
        onCancel={() => actions.finishDeckEdit(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
