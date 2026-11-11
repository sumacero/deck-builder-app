import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type ViewInstance } from 'react-native';
import type { CardDefinition } from '../../domain/card';
import { keywordsForCard } from '../../logic/glossary';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardGlossary } from './KeywordList';

export type WindowRect = { x: number; y: number; width: number; height: number };

type CardGlossaryPopoverProps = {
  card: CardDefinition;
  anchor: WindowRect;
};

const PANEL_WIDTH = 300;

/**
 * 仮選択したカードのすぐ下に、用語を全部出す。
 * カードの枠には収めない。隣の札やボタンに被ってよい。
 */
export function CardGlossaryPopover({ card, anchor }: CardGlossaryPopoverProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const layerRef = useRef<ViewInstance>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const measureOrigin = useCallback(() => {
    layerRef.current?.measureInWindow((x, y) => {
      setOrigin((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    });
  }, []);
  useEffect(() => {
    measureOrigin();
  }, [anchor, measureOrigin]);

  const panelWidth = Math.min(PANEL_WIDTH, screenW - 16);
  let left = anchor.x - origin.x;
  if (anchor.x + panelWidth > screenW - 8) left = Math.max(8, screenW - 8 - panelWidth) - origin.x;

  // 選んだカード自体は隠さない。余白の広い側へ出し、隣の札やボタンには被せてよい。
  const gap = 6;
  // 画面下の決定ボタンは残す。それ以外（隣の札など）には被せてよい。
  const spaceBelow = screenH - (anchor.y + anchor.height + gap) - 88;
  const spaceAbove = anchor.y - gap - 8;
  const openBelow = spaceBelow >= spaceAbove;
  const maxHeight = Math.min(360, Math.max(0, openBelow ? spaceBelow : spaceAbove));
  const top = (openBelow ? anchor.y + anchor.height + gap : Math.max(8, anchor.y - gap - maxHeight)) - origin.y;
  if (keywordsForCard(card).length === 0) return null;

  return (
    <View ref={layerRef} pointerEvents="box-none" style={styles.layer} onLayout={measureOrigin}>
      {maxHeight > 0 && (
        <ScrollView
          style={[styles.panel, { top, left, width: panelWidth, maxHeight }]}
          contentContainerStyle={styles.content}
        >
          <CardGlossary card={card} />
        </ScrollView>
      )}
    </View>
  );
}

/** 選ばれているあいだ、この View の画面上の位置を知らせる。 */
export function useGlossaryAnchor(active: boolean, onAnchor: (rect: WindowRect) => void) {
  const ref = useRef<ViewInstance>(null);
  const onAnchorRef = useRef(onAnchor);
  useEffect(() => {
    onAnchorRef.current = onAnchor;
  }, [onAnchor]);

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) onAnchorRef.current({ x, y, width, height });
    });
  }, []);

  useEffect(() => {
    if (active) measure();
  }, [active, measure]);

  return { ref, measure: active ? measure : undefined };
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 40,
    elevation: 24,
  },
  panel: {
    position: 'absolute',
    backgroundColor: COLORS.panel,
    borderColor: COLORS.keyword,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  content: { padding: SPACING.md },
});
