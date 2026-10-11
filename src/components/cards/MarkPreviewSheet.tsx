import { StyleSheet, Text, View } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { markPreviewLines } from '../../logic/describe';
import { COLORS, SPACING } from '../../theme';
import { InfoSheet } from '../glossary/InfoSheet';
import { CardView } from './CardView';

type MarkPreviewSheetProps = {
  card: CardDefinition | null;
  onClose: () => void;
};

/** 報酬の印チップ。この札を重ねたときの数字を出す。 */
export function MarkPreviewSheet({ card, onClose }: MarkPreviewSheetProps) {
  const lines = card ? markPreviewLines(card) : [];
  return (
    <InfoSheet
      visible={card !== null}
      title={card ? `${card.name}を重ねると` : ''}
      onClose={onClose}
      aside={
        card ? (
          <View style={styles.preview}>
            <CardView card={card} size="md" detailOnHold={false} />
          </View>
        ) : null
      }
    >
      {lines.map((line) => (
        <View key={line.label} style={styles.line}>
          <Text style={styles.label}>{line.label}</Text>
          <Text style={styles.text}>{line.text}</Text>
        </View>
      ))}
    </InfoSheet>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', paddingTop: SPACING.sm },
  line: { gap: 2, marginBottom: SPACING.sm },
  label: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  text: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
});
