import { createContext, useContext, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme';

/**
 * ランを捨ててタイトルへ戻す処理。
 * 図鑑やデッキは React Native の Modal（ネイティブの別レイヤー）で開くので、
 * 画面上端のボタンが後ろに隠れる。小窓側はこの値を見て、同じ確認を自分の中に出す。
 * タイトルの図鑑などランの外では null。
 */
const AbandonRunContext = createContext<(() => void) | null>(null);

type AbandonRunProviderProps = {
  onAbandon: () => void;
  children: ReactNode;
};

export function AbandonRunProvider({ onAbandon, children }: AbandonRunProviderProps) {
  return <AbandonRunContext.Provider value={onAbandon}>{children}</AbandonRunContext.Provider>;
}

/** 小窓の中で「あきらめる」を出すための状態。ランの外では available が false。 */
export function useAbandonPrompt() {
  const onAbandon = useContext(AbandonRunContext);
  const [asking, setAsking] = useState(false);
  return {
    available: onAbandon !== null,
    asking,
    ask: () => setAsking(true),
    stay: () => setAsking(false),
    leave: () => onAbandon?.(),
  };
}

type AbandonRunBarProps = {
  onPress: () => void;
};

/** ラン中の画面の上端。手札やマスの操作と重ならないよう、中身の外に置く。 */
export function AbandonRunBar({ onPress }: AbandonRunBarProps) {
  return (
    <View style={styles.bar}>
      <AbandonRunPressable onPress={onPress} />
    </View>
  );
}

type AbandonRunPressableProps = {
  onPress: () => void;
};

/** 「あきらめる」の見た目。押しただけではランは消えない（確認は呼び出し側が出す）。 */
export function AbandonRunPressable({ onPress }: AbandonRunPressableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="冒険をあきらめる"
      hitSlop={SPACING.xs}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>あきらめる</Text>
    </Pressable>
  );
}

type AbandonRunConfirmProps = {
  onStay: () => void;
  onLeave: () => void;
};

/**
 * 冒険を捨てる確認。続ける方が目立つ色にして、誤タップでランが消えないようにする。
 * 枠の外をタップしても閉じない。戻るか続けるかを選ばせる。
 */
export function AbandonRunConfirm({ onStay, onLeave }: AbandonRunConfirmProps) {
  return (
    <View style={styles.backdrop} accessibilityViewIsModal>
      <View style={styles.panel}>
        <Text style={styles.title}>冒険をあきらめる</Text>
        <Text style={styles.body}>ここまでの冒険は消え、タイトルに戻ります。</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onStay}
          style={({ pressed }) => [styles.stay, pressed && styles.pressed]}
        >
          <Text style={styles.stayText}>続ける</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onLeave}
          style={({ pressed }) => [styles.leave, pressed && styles.pressed]}
        >
          <Text style={styles.leaveText}>あきらめて戻る</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.panelBorder,
  },
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.panel,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  buttonText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    zIndex: 50,
    elevation: 50,
  },
  panel: {
    alignSelf: 'stretch',
    maxWidth: 360,
    width: '100%',
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: { color: COLORS.gold, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  body: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  stay: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  stayText: { color: COLORS.onGold, fontSize: 16, fontWeight: '800' },
  leave: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  leaveText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
