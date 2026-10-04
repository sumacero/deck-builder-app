import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CRIMSON_HERO } from '../../data/agents';
import { ALL_ENEMIES } from '../../data/bestiary';
import type { ActorId, CombatEvent } from '../../domain/combat';
import { ENEMY_RANK_LABEL } from '../../logic/describe';
import { ACTOR_FIGURE, COLORS, RADIUS, SPACING } from '../../theme';
import { ActorFigure } from '../combat/model3d/ActorFigure';
import { AGENT_MODELS, ENEMY_MODELS } from '../combat/model3d/actorModels';
import type { ActorModel } from '../combat/model3d/modelTypes';

type GalleryEntry = {
  key: string;
  name: string;
  icon: string;
  /** エージェント / エリート / ボスなど。通常の敵は null。 */
  label: string | null;
  hp: number | null;
  model: ActorModel | undefined;
  /** 向きを決めるため（自分は右向き、敵は左向き）。 */
  actorId: ActorId;
};

const ENTRIES: GalleryEntry[] = [
  {
    key: CRIMSON_HERO.id,
    name: CRIMSON_HERO.name,
    icon: CRIMSON_HERO.icon,
    label: 'エージェント',
    hp: null,
    model: AGENT_MODELS[CRIMSON_HERO.id],
    actorId: 'player',
  },
  ...ALL_ENEMIES.map(
    (enemy): GalleryEntry => ({
      key: enemy.id,
      name: enemy.name,
      icon: enemy.icon,
      label: ENEMY_RANK_LABEL[enemy.rank],
      hp: enemy.maxHp,
      model: ENEMY_MODELS[enemy.id],
      actorId: 'enemy-0',
    }),
  ),
];

/** 3D は 1 体ごとに GL の描画面を使い、端末ごとに同時に持てる数に上限があるので、ページに分ける。 */
const PER_PAGE = 6;
const NO_EVENTS: CombatEvent[] = [];

/** キャラクター（エージェントと敵）の 3D モデルを、ページに分けて並べる。図鑑の「キャラ」タブ。 */
export function ModelGallery() {
  const [page, setPage] = useState(0);
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const columns = landscape ? PER_PAGE : 3;
  const pageCount = Math.ceil(ENTRIES.length / PER_PAGE);
  const entries = ENTRIES.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const cellWidth = (width - SPACING.lg * 2 - SPACING.sm * (columns - 1)) / columns;
  const size = Math.floor(Math.min(ACTOR_FIGURE.size, cellWidth - SPACING.sm * 2));

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {entries.map((entry) => (
          <View key={entry.key} style={[styles.cell, { width: cellWidth }]}>
            <ActorFigure
              model={entry.model}
              icon={entry.icon}
              actorId={entry.actorId}
              events={NO_EVENTS}
              agentId={CRIMSON_HERO.id}
              size={size}
            />
            {entry.label && <Text style={styles.label}>{entry.label}</Text>}
            <Text style={styles.name} numberOfLines={1}>
              {entry.icon} {entry.name}
            </Text>
            {entry.hp !== null && <Text style={styles.hp}>HP {entry.hp}</Text>}
            {!entry.model && <Text style={styles.noModel}>3D なし</Text>}
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <PageButton label="◀ 前" disabled={page === 0} onPress={() => setPage(page - 1)} />
        <Text style={styles.page}>
          {page + 1} / {pageCount}
        </Text>
        <PageButton
          label="次 ▶"
          disabled={page >= pageCount - 1}
          onPress={() => setPage(page + 1)}
        />
      </View>
    </View>
  );
}

type PageButtonProps = {
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function PageButton({ label, disabled, onPress }: PageButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.pageButton, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.pageButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: SPACING.md },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    gap: SPACING.sm,
  },
  cell: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
  },
  label: { color: COLORS.danger, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  name: { color: COLORS.text, fontSize: 12, fontWeight: '700', paddingHorizontal: SPACING.xs },
  hp: { color: COLORS.textMuted, fontSize: 11 },
  noModel: { color: COLORS.textMuted, fontSize: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  page: { color: COLORS.text, fontSize: 14, fontWeight: '800', minWidth: 56, textAlign: 'center' },
  pageButton: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  pageButtonText: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
