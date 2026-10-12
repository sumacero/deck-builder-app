import { StyleSheet, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { keywordsForCard } from '../../logic/glossary';
import { InfoSheet } from '../glossary/InfoSheet';
import { KeywordList } from '../glossary/KeywordList';
import { CardView } from './CardView';

type CardDetailSheetProps = {
  card: CardDefinition;
  /** 手札で重ねたあとの数字。拡大した札にも同じ文を出す。 */
  description?: string;
  /** 手札や山で、この札に重ねた枚数。 */
  stack?: number;
  visible: boolean;
  onClose: () => void;
};

/** カードをタップしたときの、拡大表示と用語解説。 */
export function CardDetailSheet({ card, description, stack, visible, onClose }: CardDetailSheetProps) {
  return (
    <InfoSheet
      visible={visible}
      title={card.name}
      onClose={onClose}
      aside={
        <View style={styles.preview}>
          <CardView
            card={card}
            description={description}
            stack={stack}
            size="md"
            detailOnHold={false}
          />
        </View>
      }
    >
      <KeywordList entries={keywordsForCard(card).map((keyword) => ({ keyword }))} />
    </InfoSheet>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', paddingTop: 8 },
});
