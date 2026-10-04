import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MUSIC_ENTRIES, type MusicEntry, type MusicGroup, type MusicId } from '../../audio/music';
import { playMusic, stopMusic } from '../../audio/musicPlayer';
import { COLORS, RADIUS, SPACING } from '../../theme';

const GROUP_LABEL: Record<MusicGroup, string> = {
  theme: 'メインテーマ「三つの旗」の変奏（同じ旋律・コードで編曲違い）',
  current: '今の戦闘 BGM',
  trial: '試作 BGM',
};

const GROUPS: MusicGroup[] = ['theme', 'current', 'trial'];

/** 図鑑の BGM 一覧。押すと流れ、もう一度押すと止まる。図鑑を閉じたら止める。 */
export function MusicCatalog() {
  const [playing, setPlaying] = useState<MusicId | null>(null);

  useEffect(() => stopMusic, []);

  const toggle = (id: MusicId) => {
    if (playing === id) {
      stopMusic();
      setPlaying(null);
      return;
    }
    playMusic(id);
    setPlaying(id);
  };

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {GROUPS.map((group) => (
        <View key={group} style={styles.group}>
          <Text style={styles.groupLabel}>{GROUP_LABEL[group]}</Text>
          {MUSIC_ENTRIES.filter((entry) => entry.group === group).map((entry, index) => (
            <MusicRow
              key={entry.id}
              entry={entry}
              number={index + 1}
              playing={playing === entry.id}
              onPress={() => toggle(entry.id)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

type MusicRowProps = {
  entry: MusicEntry;
  number: number;
  playing: boolean;
  onPress: () => void;
};

function MusicRow({ entry, number, playing, onPress }: MusicRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, playing && styles.rowPlaying, pressed && styles.pressed]}>
      <Text style={styles.icon}>{playing ? '⏹' : '▶'}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>
          {String(number).padStart(2, '0')}　{entry.title}
        </Text>
        <Text style={styles.description}>{entry.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.lg, paddingVertical: SPACING.sm },
  group: { gap: SPACING.sm },
  groupLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
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
