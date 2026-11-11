import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { KEYWORDS } from '../../data/glossary';
import type { KeywordId } from '../../domain/glossary';
import { splitKeywordText } from '../../logic/keywordText';
import { COLORS, RADIUS, SPACING } from '../../theme';

/** 用語を押した瞬間に親の決定を止める。カードや選択肢の Pressable が先に反応しないようにする。 */
const KeywordGuardContext = createContext<(() => void) | null>(null);

/** 中の専門用語を押しても、外側の onPress（決定）は走らない。 */
export function GuardedPressable({ onPress, ...rest }: PressableProps) {
  const skip = useRef(false);
  const hold = () => {
    skip.current = true;
    setTimeout(() => {
      skip.current = false;
    }, 120);
  };
  return (
    <KeywordGuardContext.Provider value={hold}>
      <Pressable
        {...rest}
        onPress={(event) => {
          if (skip.current) {
            skip.current = false;
            return;
          }
          onPress?.(event);
        }}
      />
    </KeywordGuardContext.Provider>
  );
}

type KeywordTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  /** 用語の説明が開いたか。重なるカードを前面に出すために使う。 */
  onOpenChange?: (open: boolean) => void;
};

type WebHover = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

/** 専門用語だけ色を変え、ホバーかタップでその用語の説明を出す。 */
export function KeywordText({ text, style, containerStyle, numberOfLines, onOpenChange }: KeywordTextProps) {
  const pieces = splitKeywordText(text);
  const hold = useContext(KeywordGuardContext);
  const [pinned, setPinned] = useState<KeywordId | null>(null);
  const [hovered, setHovered] = useState<KeywordId | null>(null);
  const shown = hovered ?? pinned;
  const wasOpen = useRef(false);

  useEffect(() => {
    const open = shown !== null;
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    onOpenChange?.(open);
  }, [shown, onOpenChange]);

  const pressTerm = (keywordId: KeywordId) => {
    hold?.();
    setPinned((current) => (current === keywordId ? null : keywordId));
  };

  return (
    <View style={containerStyle}>
      <Text style={style} numberOfLines={numberOfLines}>
        {pieces.map((piece, index) =>
          piece.keywordId ? (
            <Text
              key={index}
              style={[styles.term, shown === piece.keywordId && styles.termOpen]}
              onPress={() => pressTerm(piece.keywordId as KeywordId)}
              {...({
                onMouseEnter: () => setHovered(piece.keywordId ?? null),
                onMouseLeave: () => setHovered((current) => (current === piece.keywordId ? null : current)),
              } as WebHover)}
            >
              {piece.text}
            </Text>
          ) : (
            <Text key={index}>{piece.text}</Text>
          ),
        )}
      </Text>
      {shown && <KeywordNote keywordId={shown} floating={pinned === null} onPress={pressTerm} />}
    </View>
  );
}

function KeywordNote({
  keywordId,
  floating,
  onPress,
}: {
  keywordId: KeywordId;
  floating: boolean;
  onPress: (keywordId: KeywordId) => void;
}) {
  const hold = useContext(KeywordGuardContext);
  const definition = KEYWORDS[keywordId];
  return (
    <Pressable
      onPressIn={() => hold?.()}
      onPress={() => onPress(keywordId)}
      style={[styles.note, floating && styles.floating]}
    >
      <Text style={styles.noteName}>
        {definition.icon} {definition.name}
      </Text>
      <Text style={styles.noteBody}>{definition.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  term: { color: COLORS.keyword, fontWeight: '800' },
  termOpen: { textDecorationLine: 'underline' },
  note: {
    alignSelf: 'stretch',
    marginTop: SPACING.xs,
    backgroundColor: COLORS.panel,
    borderColor: COLORS.keyword,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    gap: 2,
  },
  floating: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    zIndex: 40,
    marginTop: 2,
  },
  noteName: { color: COLORS.keyword, fontSize: 12, fontWeight: '800' },
  noteBody: { color: COLORS.text, fontSize: 12, lineHeight: 17 },
});
