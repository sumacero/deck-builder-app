import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MUSIC_ENTRIES } from '../../audio/music';
import { ALL_ENEMIES } from '../../data/bestiary';
import { ALL_CARDS } from '../../data/catalog';
import { COLORS, RADIUS, SPACING } from '../../theme';
import { CardCatalog } from './CardCatalog';
import { BLESSING_ITEMS, EVENT_ITEMS, POTION_ITEMS, RELIC_ITEMS } from './catalogEntries';
import { EntryCatalog } from './EntryCatalog';
import { ModelGallery } from './ModelGallery';
import { MusicCatalog } from './MusicCatalog';

type EncyclopediaTab = 'characters' | 'cards' | 'relics' | 'potions' | 'events' | 'blessings' | 'music';

type TabDef = { id: EncyclopediaTab; label: string; count: number };

const TABS: TabDef[] = [
  // エージェント（自分）1 体 + 敵。
  { id: 'characters', label: '👾 キャラ', count: ALL_ENEMIES.length + 1 },
  { id: 'cards', label: '🃏 カード', count: ALL_CARDS.length },
  { id: 'relics', label: '💎 レリック', count: RELIC_ITEMS.length },
  { id: 'potions', label: '🧪 ポーション', count: POTION_ITEMS.length },
  { id: 'events', label: '❓ イベント', count: EVENT_ITEMS.length },
  { id: 'blessings', label: '✨ 恩恵', count: BLESSING_ITEMS.length },
  { id: 'music', label: '🎵 BGM', count: MUSIC_ENTRIES.length },
];

type EncyclopediaProps = {
  onClose: () => void;
};

/** ゲームに登場するものをすべて見られる図鑑。上のタブで種類を切り替える。 */
export function Encyclopedia({ onClose }: EncyclopediaProps) {
  const [tab, setTab] = useState<EncyclopediaTab>('characters');
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 図鑑</Text>
        <Pressable
          onPress={onClose}
          hitSlop={6}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>閉じる</Text>
        </Pressable>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((def) => {
            const active = def.id === tab;
            return (
              <Pressable
                key={def.id}
                onPress={() => setTab(def.id)}
                style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {def.label} {def.count}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.content}>
        <TabContent tab={tab} />
      </View>
    </View>
  );
}

function TabContent({ tab }: { tab: EncyclopediaTab }) {
  switch (tab) {
    case 'characters':
      return <ModelGallery />;
    case 'cards':
      return <CardCatalog />;
    case 'relics':
      return <EntryCatalog items={RELIC_ITEMS} note="エリート・宝箱・ショップ・恩恵で手に入る。「ボス」はボスを倒したときの 3 択。" />;
    case 'potions':
      return <EntryCatalog items={POTION_ITEMS} note="自分のターン中、エナジーを使わずに飲める。" />;
    case 'events':
      return <EntryCatalog items={EVENT_ITEMS} note="マップの「？」マスで出会う。" />;
    case 'blessings':
      return <EntryCatalog items={BLESSING_ITEMS} note="各章のはじめに、案内役が 3 つの中から 1 つ授けてくれる。" />;
    case 'music':
      return <MusicCatalog />;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, gap: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: COLORS.gold, fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  close: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  closeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  tabs: { gap: SPACING.sm },
  tab: {
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    backgroundColor: COLORS.panel,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tabActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  tabText: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  tabTextActive: { color: COLORS.onGold },
  content: { flex: 1 },
  pressed: { opacity: 0.7 },
});
