import { StyleSheet, Text, View } from 'react-native';
import type { KeywordId, StatusView } from '../../domain/glossary';
import { COLORS, SPACING } from '../../theme';
import { InfoSheet } from '../glossary/InfoSheet';
import { KeywordList } from '../glossary/KeywordList';

type FighterInfoSheetProps = {
  name: string;
  statuses: StatusView[];
  /** 敵の次の行動のアイコンの意味。プレイヤーは省略。 */
  intent?: { moveName: string; keywords: KeywordId[] };
  /** 敵の性質の具体的な説明。 */
  traits?: string[];
  onClose: () => void;
};

/** キャラをタップしたときの、かかっているバフ・デバフと次の行動の解説。 */
export function FighterInfoSheet({ name, statuses, intent, traits, onClose }: FighterInfoSheetProps) {
  return (
    <InfoSheet visible title={name} onClose={onClose}>
      <View style={styles.section}>
        <Text style={styles.heading}>状態</Text>
        {statuses.length === 0 ? (
          <Text style={styles.empty}>かかっているバフ・デバフはありません。</Text>
        ) : (
          <KeywordList
            entries={statuses.map(({ keyword, value, flag }) => ({ keyword, value: flag ? undefined : value }))}
          />
        )}
      </View>
      {traits && traits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>性質</Text>
          {traits.map((text) => (
            <Text key={text} style={styles.trait}>
              {text}
            </Text>
          ))}
        </View>
      )}
      {intent && (
        <View style={styles.section}>
          <Text style={styles.heading}>次の行動「{intent.moveName}」</Text>
          <KeywordList entries={intent.keywords.map((keyword) => ({ keyword }))} />
        </View>
      )}
    </InfoSheet>
  );
}

const styles = StyleSheet.create({
  section: { gap: SPACING.sm },
  heading: { color: COLORS.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  empty: { color: COLORS.textMuted, fontSize: 13 },
  trait: { color: COLORS.text, fontSize: 13, lineHeight: 19 },
});
