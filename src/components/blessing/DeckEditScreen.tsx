import { StyleSheet, View } from 'react-native';
import type { DeckEditMode, RunState } from '../../domain/run';
import type { BlessingActions } from '../../hooks/useRun';
import { canUpgrade, stackCards, upgradeCard } from '../../logic/cards';
import { CardPickerModal } from '../cards/CardPickerModal';

type DeckEditScreenProps = {
  run: RunState;
  mode: DeckEditMode;
  actions: BlessingActions;
};

/** 恩恵で「カードを選んで強化 / 削除」を選んだあとの画面。 */
export function DeckEditScreen({ run, mode, actions }: DeckEditScreenProps) {
  const upgrading = mode === 'upgrade';
  return (
    <View style={styles.root}>
      <CardPickerModal
        title={upgrading ? '強化するカードを選ぶ' : '削除するカードを選ぶ'}
        stacks={stackCards(upgrading ? run.deck.filter(canUpgrade) : run.deck)}
        confirmLabel={upgrading ? '強化する' : '削除する'}
        cancelLabel="受け取らない"
        preview={upgrading ? upgradeCard : undefined}
        onConfirm={(card) => actions.finishDeckEdit(card.id)}
        onCancel={() => actions.finishDeckEdit(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
