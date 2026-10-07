import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setBgmLevel, setSeLevel } from '../../audio/audioSettings';
import { playSound } from '../../audio/soundPlayer';
import { useAudioSettings } from '../../hooks/useAudioSettings';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { VolumeSlider } from './VolumeSlider';

type SettingsScreenProps = {
  onClose: () => void;
};

/** 音量の設定。50 が、設定を足す前の音量。BGM は動かすとその場で変わり、効果音は離したときに一度鳴る。 */
export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { bgm, se } = useAudioSettings();
  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.title}>設定</Text>
        <Text style={styles.note}>50 が標準の音量です。0 で消えます。</Text>
        <VolumeSlider label="BGM" value={bgm} onChange={setBgmLevel} />
        <VolumeSlider label="効果音" value={se} onChange={setSeLevel} onCommit={() => playSound('cardPlay')} />
        <Pressable onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <Text style={styles.closeText}>閉じる</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /**
   * 余白はパネルの内側に置く。親に padding を付けて子を width 100% にすると、
   * 子の幅が画面いっぱいのまま余白の分だけ右にはみ出し、スマホ幅で横スクロールになる。
   */
  panel: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  title: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
  },
  note: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  close: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
  },
  closeText: { color: COLORS.onGold, fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  pressed: { opacity: 0.7 },
});
