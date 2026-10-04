import type { ReactNode } from 'react';
import { ScrollView, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

type ScreenScrollProps = {
  children: ReactNode;
  /** 中身の並べ方。高さが足りていれば画面いっぱいに広がる（flexGrow: 1）。 */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * 画面全体の入れ物。縦向きでは今までどおり 1 画面に収まり、
 * 横向きなどで高さが足りないときだけスクロールできる。
 */
export function ScreenScroll({ children, contentStyle }: ScreenScrollProps) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, contentStyle]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
});
