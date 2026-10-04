import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsLandscape } from '../../hooks/useIsLandscape';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { MODAL_ORIENTATIONS } from '../layout/modalOrientations';

type InfoSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** 解説の横（縦向きなら上）に添えるもの。カードの拡大表示など。 */
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * 用語やキャラの状態の解説を出す小窓。外側をタップしても閉じる。
 * 横向きは高さが足りないので、aside を左に、解説を右に並べ、解説だけをスクロールさせる。
 */
export function InfoSheet({ visible, title, onClose, aside, children }: InfoSheetProps) {
  const landscape = useIsLandscape();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={MODAL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        {/*
          外側タップで閉じるボタンは小窓の「後ろ」に敷く。小窓をボタンで包むと、ボタンが指を握って
          中のスクロールがゆっくりした指の動きに反応しなくなる。
        */}
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.sheet, landscape && styles.landscapeSheet]}>
          <Text style={styles.title}>{title}</Text>
          {landscape ? (
            <View style={styles.columns}>
              {aside && <View style={styles.aside}>{aside}</View>}
              <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
                {children}
              </ScrollView>
            </View>
          ) : (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
              {aside}
              {children}
            </ScrollView>
          )}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  dismissArea: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: {
    maxHeight: '85%',
    backgroundColor: COLORS.panel,
    borderColor: COLORS.gold,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  landscapeSheet: {
    maxHeight: '100%',
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  title: { color: COLORS.gold, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  /** 小窓の高さの上限に合わせて縮み、入りきらない分はスクロールする。 */
  scroll: { flexShrink: 1 },
  columns: { flexDirection: 'row', gap: SPACING.md, flexShrink: 1 },
  aside: { justifyContent: 'center' },
  body: { gap: SPACING.md, alignItems: 'stretch' },
  footer: { alignItems: 'flex-end' },
  close: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  closeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
