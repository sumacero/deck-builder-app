import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RunState } from '../../domain/run';
import { currentAct, findNode, mapHint, reachableNodeIds, reachedFloor } from '../../logic/run';
import { COLORS, MAP_LAYOUT, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { DeckButton } from '../cards/DeckButton';
import { HpBar } from '../combat/HpBar';
import { ItemBar } from '../items/ItemBar';
import { GoldBadge } from '../run/GoldBadge';
import { RunEndOverlay } from '../run/RunEndOverlay';
import { MapEdge } from './MapEdge';
import { MapLegend } from './MapLegend';
import { layoutMap } from './mapLayout';
import { MapNodeView } from './MapNodeView';

type MapScreenProps = {
  run: RunState;
  onMove: (nodeId: string) => void;
  onNewRun: () => void;
};

export function MapScreen({ run, onMove, onNewRun }: MapScreenProps) {
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const viewportHeight = useRef(0);
  const aligned = useRef(false);
  const layout = width > 0 ? layoutMap(run.map, width) : null;
  const reachable = new Set(reachableNodeIds(run));
  const visited = new Set(run.visitedNodeIds);
  const ended = run.phase.kind === 'gameOver' || run.phase.kind === 'cleared';

  /** 今いるマスが画面の下の方に来るようにスクロールする（この先のマスが上に広く見える）。 */
  const alignScroll = () => {
    if (!layout || viewportHeight.current === 0 || aligned.current) return;
    aligned.current = true;
    const current = run.currentNodeId ? layout.positions[run.currentNodeId] : undefined;
    if (!current) {
      scrollRef.current?.scrollToEnd({ animated: false });
      return;
    }
    const maxScroll = Math.max(0, layout.height - viewportHeight.current);
    const target = current.y - (viewportHeight.current - MAP_LAYOUT.currentNodeBottomOffset);
    scrollRef.current?.scrollTo({ y: Math.min(maxScroll, Math.max(0, target)), animated: false });
  };

  return (
    <SceneBackground actId={currentAct(run).id} scene="map">
      <View style={styles.hud}>
        <ItemBar relics={run.relics} potions={run.potions} />
        <View style={styles.status}>
          <Text style={styles.floor}>
            {reachedFloor(run)} / {run.map.floorCount}
          </Text>
          <View style={styles.hp}>
            <HpBar hp={run.player.hp} maxHp={run.player.maxHp} block={0} />
          </View>
          <GoldBadge gold={run.gold} />
          <DeckButton deck={run.deck} />
        </View>
        <Text style={styles.act}>
          {currentAct(run).name}　ボス {run.boss.icon} {run.boss.name}
        </Text>
        <Text style={styles.hint}>{mapHint(run)}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onLayout={(e) => {
          viewportHeight.current = e.nativeEvent.layout.height;
          alignScroll();
        }}
        onContentSizeChange={alignScroll}
      >
        <View style={styles.measure} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {layout && (
          <View style={[styles.canvas, { height: layout.height }]}>
            {run.map.nodes.flatMap((node) =>
              node.next.map((toId) => {
                const to = findNode(run.map, toId);
                const fromPos = layout.positions[node.id];
                const toPos = layout.positions[toId];
                if (!to || !fromPos || !toPos) return null;
                return (
                  <MapEdge
                    key={`${node.id}->${toId}`}
                    from={fromPos}
                    to={toPos}
                    traveled={visited.has(node.id) && visited.has(toId)}
                  />
                );
              }),
            )}
            {run.map.nodes.map((node) => {
              const position = layout.positions[node.id];
              if (!position) return null;
              return (
                <MapNodeView
                  key={node.id}
                  node={node}
                  position={position}
                  current={run.currentNodeId === node.id}
                  reachable={!ended && reachable.has(node.id)}
                  visited={visited.has(node.id)}
                  onPress={() => onMove(node.id)}
                />
              );
            })}
          </View>
        )}
        </View>
      </ScrollView>

      <MapLegend />
      {(run.phase.kind === 'gameOver' || run.phase.kind === 'cleared') && (
        <RunEndOverlay kind={run.phase.kind} onNewRun={onNewRun} />
      )}
    </SceneBackground>
  );
}

const styles = StyleSheet.create({
  hud: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, gap: SPACING.sm },
  status: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  floor: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    minWidth: 56,
  },
  hp: { flex: 1 },
  act: { color: COLORS.gold, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  hint: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },
  measure: { width: '100%' },
  canvas: { width: '100%' },
});
