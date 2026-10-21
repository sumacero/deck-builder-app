import { useEffect, useEffectEvent, useRef, useState, type RefObject } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { CardInstance } from '../../../domain/card';
import type { CombatEvent, PlayerState } from '../../../domain/combat';
import { describeHandCard } from '../../../logic/describe';
import { stackOf } from '../../../logic/marks';
import { COLORS, HAND_LAYOUT, MOTION, RADIUS, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';
import { handCardCenters, handCardSpacing } from '../handLayout';

type PileName = 'draw' | 'discard' | 'exhaust';

type PileTravelProps = {
  events: CombatEvent[];
  hand: CardInstance[];
  player: PlayerState;
  cardWidth: number;
  handView: RefObject<View | null>;
  pileViews: RefObject<Partial<Record<PileName, View | null>>>;
  /** 山札から来た札が着地したら、手札の本体を見せる。 */
  onReveal: (eventId: number) => void;
};

type Rect = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

type TravelEvent = Extract<CombatEvent, { kind: 'pileTravel' }>;

type Ghost = {
  eventId: number;
  card: CardInstance;
  to: 'hand' | 'discard' | 'exhaust';
  /** レイヤー左上からの中心。 */
  from: Point;
  dx: number;
  dy: number;
  delay: number;
  startScale: number;
  endScale: number;
};

const ARC = 22;
const ARC_STEPS = [0, 0.25, 0.5, 0.75, 1];
/** 融合で溶けた札は、残った札の上に重ねず、少し進んだ位置から廃棄札へ飛ばす。 */
const FUSE_DEPART = 0.22;

const measureView = (view: View | null): Promise<Rect | null> => {
  if (!view) return Promise.resolve(null);
  return new Promise((resolve) => {
    view.measureInWindow((x, y, width, height) => {
      resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  });
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const centerOf = (rect: Rect): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

const pointAlong = (from: Point, to: Point, t: number): Point => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

/** 手札の並び（枚数）から、その番号の札の画面上の中心。 */
function slotCenter(hand: Rect, cardWidth: number, count: number, index: number): Point | null {
  const centers = handCardCenters(hand.width, cardWidth, handCardSpacing(hand.width, cardWidth, count), count);
  const center = centers[index];
  if (!center) return null;
  return { x: hand.x + center.x, y: hand.y + center.y };
}

/**
 * 手札を離れる札を先に、補充のドローを少し遅れて動かす。
 * 融合で消した札は、水に溶ける演出を見せてから廃棄札へ向かう。
 */
function delaysFor(moves: TravelEvent[], fusedIds: ReadonlySet<string>): Map<number, number> {
  const hasLeave = moves.some((move) => move.to !== 'hand');
  let leaves = 0;
  let draws = 0;
  const delays = new Map<number, number>();
  for (const move of moves) {
    if (move.to === 'hand') {
      delays.set(move.id, (hasLeave ? MOTION.pileArriveLead : 0) + draws * MOTION.pileStagger);
      draws += 1;
    } else {
      const fuseWait = fusedIds.has(move.card.instanceId) ? MOTION.pileFuseLeave : 0;
      delays.set(move.id, fuseWait + leaves * MOTION.pileStagger);
      leaves += 1;
    }
  }
  return delays;
}

const arcRange = (delta: number, perpendicular: number) =>
  ARC_STEPS.map((p) => delta * p + perpendicular * Math.sin(Math.PI * p) * ARC);

/**
 * 山札から手札、手札から捨て札、手札から廃棄札へ、札のゴーストを飛ばす。
 * 枚数はすでに更新済み。引いた札の本体は、着地を onReveal で知らせるまで手札側が隠す。
 */
export function PileTravel({ events, hand, player, cardWidth, handView, pileViews, onReveal }: PileTravelProps) {
  const layerRef = useRef<View>(null);
  const [flight, setFlight] = useState<{ events: CombatEvent[]; cardWidth: number; ghosts: Ghost[] } | null>(
    null,
  );
  const ghosts = flight && flight.events === events && flight.cardWidth === cardWidth ? flight.ghosts : [];
  const reveal = useEffectEvent(onReveal);
  useEffect(() => {
    const moves = events.filter((event): event is TravelEvent => event.kind === 'pileTravel');
    if (moves.length === 0 || cardWidth <= 0) return;
    let cancelled = false;
    const fusedIds = new Set(
      events.flatMap((event) => (event.kind === 'marksFused' ? event.materialIds : [])),
    );
    const delays = delaysFor(moves, fusedIds);

    const place = async (): Promise<void> => {
      let measured = await measureOnce();
      if (!measured) {
        await wait(50);
        if (cancelled) return;
        measured = await measureOnce();
      }
      if (cancelled) return;
      if (!measured) {
        for (const move of moves) {
          if (move.to === 'hand') reveal(move.id);
        }
        setFlight({ events, cardWidth, ghosts: [] });
        return;
      }
      const { layer, handRect, piles } = measured;
      const next: Ghost[] = [];
      for (const move of moves) {
        const ghost = toGhost(move, layer, handRect, piles, fusedIds.has(move.card.instanceId), delays);
        if (ghost) next.push(ghost);
        else if (move.to === 'hand') reveal(move.id);
      }
      setFlight({ events, cardWidth, ghosts: next });
    };

    const frame = requestAnimationFrame(() => {
      void place();
    });
    const latest =
      MOTION.pileFly +
      Math.max(MOTION.pileArriveLead, MOTION.pileFuseLeave) +
      moves.length * MOTION.pileStagger +
      600;
    const safety = setTimeout(() => {
      for (const move of moves) {
        if (move.to === 'hand') reveal(move.id);
      }
    }, latest);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(safety);
    };

    async function measureOnce() {
      const [layer, handRect, draw, discard, exhaust] = await Promise.all([
        measureView(layerRef.current),
        measureView(handView.current),
        measureView(pileViews.current.draw ?? null),
        measureView(pileViews.current.discard ?? null),
        measureView(pileViews.current.exhaust ?? null),
      ]);
      if (!layer || !handRect) return null;
      return { layer, handRect, piles: { draw, discard, exhaust } };
    }

    function toGhost(
      move: TravelEvent,
      layer: Rect,
      handRect: Rect,
      piles: Record<PileName, Rect | null>,
      fused: boolean,
      delayOf: Map<number, number>,
    ): Ghost | null {
      const pile = piles[move.to === 'hand' ? 'draw' : move.to];
      if (!pile) return null;
      const arriving = move.to === 'hand';
      const index = arriving ? hand.findIndex((card) => card.instanceId === move.card.instanceId) : move.handIndex;
      if (arriving && index < 0) return null;
      const count = arriving ? hand.length : move.handCount;
      const slot = slotCenter(handRect, cardWidth, count, index);
      if (!slot) return null;
      const pileCenter = centerOf(pile);
      let origin = arriving ? pileCenter : slot;
      const destination = arriving ? slot : pileCenter;
      if (fused && !arriving) origin = pointAlong(origin, destination, FUSE_DEPART);
      const from = { x: origin.x - layer.x, y: origin.y - layer.y };
      return {
        eventId: move.id,
        card: move.card,
        to: move.to,
        from,
        dx: destination.x - origin.x,
        dy: destination.y - origin.y,
        delay: delayOf.get(move.id) ?? 0,
        startScale: arriving ? 0.4 : fused ? 0.48 : 1,
        endScale: arriving ? 1 : 0.28,
      };
    }
  }, [events, cardWidth, hand, handView, pileViews]);

  return (
    <View ref={layerRef} pointerEvents="none" style={styles.layer}>
      {ghosts.map((ghost) => (
        <TravelGhost
          key={ghost.eventId}
          ghost={ghost}
          player={player}
          cardWidth={cardWidth}
          onDone={ghost.to === 'hand' ? () => onReveal(ghost.eventId) : undefined}
        />
      ))}
    </View>
  );
}

function TravelGhost({
  ghost,
  player,
  cardWidth,
  onDone,
}: {
  ghost: Ghost;
  player: PlayerState;
  cardWidth: number;
  onDone?: () => void;
}) {
  const [progress] = useState(() => new Animated.Value(0));
  const [started, setStarted] = useState(ghost.delay === 0);
  const [done, setDone] = useState(false);
  const finish = useEffectEvent(() => onDone?.());
  const cardHeight = cardWidth * HAND_LAYOUT.aspectRatio;
  const len = Math.hypot(ghost.dx, ghost.dy) || 1;

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), ghost.delay);
    return () => clearTimeout(timer);
  }, [ghost.delay]);

  useEffect(() => {
    if (!started) return;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: MOTION.pileFly,
      easing: ghost.to === 'hand' ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (!finished) return;
      setDone(true);
      finish();
    });
    return () => animation.stop();
  }, [started, progress, ghost.to]);

  if (!started || done) return null;

  const translateX = progress.interpolate({
    inputRange: ARC_STEPS,
    outputRange: arcRange(ghost.dx, -ghost.dy / len),
  });
  const translateY = progress.interpolate({
    inputRange: ARC_STEPS,
    outputRange: arcRange(ghost.dy, ghost.dx / len),
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [ghost.startScale, ghost.endScale],
  });
  const opacity =
    ghost.to === 'hand'
      ? progress.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0.2, 1, 1] })
      : progress.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] });
  const wash = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.72] });
  const ring = progress.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0.85, 0, 0] });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ghost.to === 'exhaust' ? ['0deg', '12deg'] : ['0deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.ghost,
        {
          width: cardWidth,
          height: cardHeight,
          left: ghost.from.x - cardWidth / 2,
          top: ghost.from.y - cardHeight / 2,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
        },
      ]}
    >
      {ghost.to === 'hand' && <Animated.View style={[styles.ring, { opacity: ring, borderColor: COLORS.gold }]} />}
      <CardView
        card={ghost.card.card}
        width={cardWidth}
        description={describeHandCard(ghost.card, player)}
        stack={stackOf(ghost.card)}
        detailOnHold={false}
      />
      {ghost.to === 'exhaust' && (
        <Animated.View style={[styles.wash, { opacity: wash, backgroundColor: COLORS.cardDim }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
  ghost: { position: 'absolute' },
  ring: {
    position: 'absolute',
    top: -SPACING.sm,
    right: -SPACING.sm,
    bottom: -SPACING.sm,
    left: -SPACING.sm,
    borderWidth: 2,
    borderRadius: RADIUS.md,
  },
  wash: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS.sm,
  },
});
