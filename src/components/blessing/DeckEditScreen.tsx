import { StyleSheet, View } from 'react-native';
import type { RunPhase, RunState } from '../../domain/run';
import type { BlessingActions } from '../../hooks/useRun';
import type { CardStamp } from '../../domain/runEffect';
import { canStamp, canUpgrade, stackCards, stampCard, upgradeCard } from '../../logic/cards';
import { CardPickerModal } from '../cards/CardPickerModal';

type DeckEditPhase = Extract<RunPhase, { kind: 'deckEdit' }>;

type DeckEditScreenProps = {
  run: RunState;
  phase: DeckEditPhase;
  actions: BlessingActions;
};

const STAMP_NAME: Record<CardStamp, string> = {
  replay: '再演',
  sly: '昇華',
  innate: '先制',
  retain: '保留',
};

/** 恩恵・出来事で「カードを選んで強化 / 削除 / 性質を付与」を選んだあとの画面。 */
export function DeckEditScreen({ run, phase, actions }: DeckEditScreenProps) {
  const upgrading = phase.mode === 'upgrade';
  const stamp = phase.mode === 'stamp' ? phase.stamp : null;
  const pool =
    phase.mode === 'upgrade'
      ? run.deck.filter(canUpgrade)
      : phase.mode === 'stamp'
        ? run.deck.filter((card) => canStamp(card, phase.stamp))
        : run.deck;
  const stacks = stackCards(pool);
  const title =
    phase.mode === 'stamp'
      ? `${STAMP_NAME[phase.stamp]}を付与するカードを選ぶ${phase.remaining > 1 ? `（あと ${phase.remaining} 枚）` : ''}`
      : upgrading
        ? '強化するカードを選ぶ'
        : '削除するカードを選ぶ';
  // 出来事はカードを選ばずに抜けられない。選べる札が無いときだけ先へ進める。
  const canLeave = phase.cancellable !== false || stacks.length === 0;
  return (
    <View style={styles.root}>
      <CardPickerModal
        title={title}
        stacks={stacks}
        confirmLabel={stamp ? '付与する' : upgrading ? '強化する' : '削除する'}
        cancelLabel={phase.cancellable === false ? '先へ進む' : '受け取らない'}
        preview={stamp ? (card) => stampCard(card, stamp) : upgrading ? upgradeCard : undefined}
        onConfirm={(card) => actions.finishDeckEdit(card)}
        onCancel={canLeave ? () => actions.finishDeckEdit(null) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
