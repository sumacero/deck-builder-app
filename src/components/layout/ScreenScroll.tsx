import type { ReactNode } from 'react';
import { ScrollView, type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

type ScreenScrollProps = {
  children: ReactNode;
  /** 中身の並べ方。高さが足りていれば画面いっぱいに広がる（flexGrow: 1）。 */
  contentStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

/**
 * 画面全体の入れ物。縦向きでは今までどおり 1 画面に収まり、
 * 横向きなどで高さが足りないときだけスクロールできる。
 */
export function ScreenScroll({ children, contentStyle, onScroll }: ScreenScrollProps) {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, contentStyle]}
      onScroll={onScroll}
      scrollEventThrottle={onScroll ? 16 : undefined}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
});
