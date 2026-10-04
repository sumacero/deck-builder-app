import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MUSIC_ENTRIES, type MusicEntry, type MusicId } from '../../audio/music';
import { endPreview, previewMusic } from '../../audio/musicPlayer';
import { COLORS, RADIUS, SPACING } from '../../theme';

/** 図鑑の BGM 一覧。押すと流れ、もう一度押すと止まる。図鑑を閉じたら元の曲（タイトルなど）に戻す。 */
export function MusicCatalog() {
  const [playing, setPlaying] = useState<MusicId | null>(null);

  useEffect(() => endPreview, []);

  const toggle = (id: MusicId) => {
    const next = playing === id ? null : id;
    previewMusic(next);
    setPlaying(next);
  };

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <Text style={styles.note}>全曲がメインテーマ「三つの旗」の旋律をどこかに持っている。</Text>
      {MUSIC_ENTRIES.map((entry) => (
        <MusicRow key={entry.id} entry={entry} playing={playing === entry.id} onPress={() => toggle(entry.id)} />
      ))}
    </ScrollView>
  );
}

type MusicRowProps = {
  entry: MusicEntry;
  playing: boolean;
  onPress: () => void;
};

function MusicRow({ entry, playing, onPress }: MusicRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, playing && styles.rowPlaying, pressed && styles.pressed]}>
      <Text style={styles.icon}>{playing ? '⏹' : '▶'}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.description}>{entry.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.sm, paddingVertical: SPACING.sm },
  note: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  rowPlaying: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDark },
  icon: { color: COLORS.gold, fontSize: 20, width: 24, textAlign: 'center' },
  body: { flex: 1, gap: 2 },
  title: { color: COLORS.gold, fontSize: 15, fontWeight: '800' },
  description: { color: COLORS.text, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.7 },
});
