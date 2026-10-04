import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { playSound } from '../../audio/soundPlayer';
import type { RunState } from '../../domain/run';
import { useIsLandscape } from '../../hooks/useIsLandscape';
import { currentAct, mapHint, reachedFloor } from '../../logic/run';
import { COLORS, MAP_LAYOUT, MOTION, SPACING } from '../../theme';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { DeckButton } from '../cards/DeckButton';
import { FadeOverlay } from '../effects/FadeOverlay';
import { HpBar } from '../combat/HpBar';
import { GalleryButton } from '../gallery/GalleryButton';
import { ItemBar } from '../items/ItemBar';
import { GoldBadge } from '../run/GoldBadge';
import { RunEndOverlay } from '../run/RunEndOverlay';
import { MapCanvas } from './MapCanvas';
import { layoutMap, layoutMapHorizontal, type MapLayout } from './mapLayout';
import { MapLegend } from './MapLegend';

type MapScreenProps = {
  run: RunState;
  onMove: (nodeId: string) => void;
  onNewRun: () => void;
  onExitToTitle: () => void;
};

type Size = { width: number; height: number };

/**
 * マップ画面。縦向きは上に情報、下に縦長のマップ（上へ進む）。
 * 横向きは左の列に情報をまとめ、右に横長のマップ（右へ進む）を置いて、一度に多くの階を見せる。
 */
export function MapScreen({ run, onMove, onNewRun, onExitToTitle }: MapScreenProps) {
  const landscape = useIsLandscape();
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const aligned = useRef(false);
  const ended = run.phase.kind === 'gameOver' || run.phase.kind === 'cleared';
  const act = currentAct(run);

  const layout = mapLayoutFor(run, viewport, landscape);

  /** 押したマスを光らせ、効果音と暗転のあとで移動する。演出中はほかのマスを押せない。 */
  const selectNode = (nodeId: string) => {
    if (selectedId !== null) return;
    playSound('mapSelect');
    setSelectedId(nodeId);
  };

  useEffect(() => {
    if (selectedId === null) return;
    const timer = setTimeout(() => onMove(selectedId), MOTION.mapSelect);
    return () => clearTimeout(timer);
  }, [selectedId, onMove]);

  /** 今いるマスが、この先のマスが広く見える位置に来るようにスクロールする。 */
  const alignScroll = () => {
    if (!layout || aligned.current) return;
    aligned.current = true;
    const current = run.currentNodeId ? layout.positions[run.currentNodeId] : undefined;
    if (landscape) {
      const target = current ? current.x - MAP_LAYOUT.currentNodeLeftOffset : 0;
      const maxScroll = Math.max(0, layout.width - viewport.width);
      scrollRef.current?.scrollTo({ x: clamp(target, 0, maxScroll), animated: false });
      return;
    }
    if (!current) {
      scrollRef.current?.scrollToEnd({ animated: false });
      return;
    }
    const maxScroll = Math.max(0, layout.height - viewport.height);
    const target = current.y - (viewport.height - MAP_LAYOUT.currentNodeBottomOffset);
    scrollRef.current?.scrollTo({ y: clamp(target, 0, maxScroll), animated: false });
  };

  const onViewportLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === viewport.width && height === viewport.height) return;
    // 向きが変わったら、今いるマスへ合わせ直す。
    aligned.current = false;
    setViewport({ width, height });
  };

  const itemBar = <ItemBar relics={run.relics} potions={run.potions} />;
  const floor = (
    <Text style={styles.floor}>
      {reachedFloor(run)} / {run.map.floorCount}
    </Text>
  );
  const hp = (
    <View style={styles.hp}>
      <HpBar hp={run.player.hp} maxHp={run.player.maxHp} block={0} />
    </View>
  );
  const actLine = (
    <Text style={styles.act}>
      {act.name}　ボス {run.boss.icon} {run.boss.name}
    </Text>
  );
  const hint = <Text style={styles.hint}>{mapHint(run)}</Text>;
  const map = (
    <ScrollView
      key={landscape ? 'landscape' : 'portrait'}
      ref={scrollRef}
      horizontal={landscape}
      style={styles.scroll}
      contentContainerStyle={landscape ? styles.landscapeContent : styles.portraitContent}
      showsHorizontalScrollIndicator={false}
      onLayout={onViewportLayout}
      onContentSizeChange={alignScroll}
    >
      {layout && (
        <MapCanvas
          run={run}
          layout={layout}
          ended={ended}
          selectedId={selectedId}
          onMove={selectNode}
        />
      )}
    </ScrollView>
  );

  return (
    <SceneBackground actId={act.id} scene="map">
      {landscape ? (
        <View style={styles.landscape}>
          <ScrollView style={styles.side} contentContainerStyle={styles.sideContent}>
            {itemBar}
            <View style={styles.status}>
              {floor}
              {hp}
            </View>
            <View style={styles.status}>
              <GoldBadge gold={run.gold} />
              <DeckButton deck={run.deck} />
              <GalleryButton />
            </View>
            {actLine}
            {hint}
            <MapLegend compact />
          </ScrollView>
          {map}
        </View>
      ) : (
        <>
          <View style={styles.hud}>
            {itemBar}
            <View style={styles.status}>
              {floor}
              {hp}
              <GoldBadge gold={run.gold} />
              <DeckButton deck={run.deck} />
              <GalleryButton />
            </View>
            {actLine}
            {hint}
          </View>
          {map}
          <MapLegend />
        </>
      )}
      {selectedId !== null && (
        <FadeOverlay
          from={0}
          to={1}
          delay={MOTION.mapSelect - MOTION.mapLeaveFade}
          duration={MOTION.mapLeaveFade}
        />
      )}
      {ended && (
        <RunEndOverlay
          kind={run.phase.kind === 'cleared' ? 'cleared' : 'gameOver'}
          onNewRun={onNewRun}
          onExitToTitle={onExitToTitle}
        />
      )}
    </SceneBackground>
  );
}

function mapLayoutFor(run: RunState, viewport: Size, landscape: boolean): MapLayout | null {
  if (viewport.width === 0 || viewport.height === 0) return null;
  if (landscape) {
    return layoutMapHorizontal(run.map, viewport.height - SPACING.sm * 2, viewport.width);
  }
  return layoutMap(run.map, viewport.width - SPACING.lg * 2);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const styles = StyleSheet.create({
  hud: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, gap: SPACING.sm, zIndex: 10 },
  landscape: { flex: 1, flexDirection: 'row' },
  /** 所持品の説明欄がマップの上に重なって見えるよう、マップより手前に置く。 */
  side: { width: MAP_LAYOUT.landscapeSideWidth, flexGrow: 0, zIndex: 10, elevation: 10 },
  sideContent: { padding: SPACING.md, gap: SPACING.sm },
  status: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
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
  portraitContent: { paddingHorizontal: SPACING.lg },
  landscapeContent: { paddingVertical: SPACING.sm },
});
