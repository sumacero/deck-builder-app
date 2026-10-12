import { useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { CardInstance, CardMark } from '../../../domain/card';
import type { CombatEvent } from '../../../domain/combat';
import type { MarkLink } from '../../../logic/marks';
import { MARK_COLORS, MOTION } from '../../../theme';
import { CARD_SELECT_LIFT } from '../DraggableCard';
import { handCardCenters } from '../handLayout';

type MarkLinkOverlayProps = {
  cards: CardInstance[];
  links: MarkLink[];
  events: CombatEvent[];
  containerWidth: number;
  cardWidth: number;
  spacing: number;
  /** 摘んでいる、または敵を選んでいる札。あるときは links がその札の相手だけ。 */
  focusId: string | null;
  /** タップで選び、指についていない札。表示位置が少し上がっている。 */
  liftedId: string | null;
};

type Slot = { x: number; y: number; mark: CardMark | null };

type Placed = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colorA: string;
  colorB: string;
};

type Ring = { key: string; x: number; y: number; color: string };

type Burst = { id: number; links: Placed[]; rings: Ring[] };

type MarksFusedEvent = Extract<CombatEvent, { kind: 'marksFused' }>;

/**
 * 同じ印、または三印で結び付く札のあいだに波紋を出す。
 * 摘む前は結び得る組を薄く、摘んだあいだは今融合する相手だけを明るく、
 * 使った瞬間は消える直前の位置から波紋を広げる。
 */
export function MarkLinkOverlay({
  cards,
  links,
  events,
  containerWidth,
  cardWidth,
  spacing,
  focusId,
  liftedId,
}: MarkLinkOverlayProps) {
  const slots = useMemo(
    () => slotMap(cards, containerWidth, cardWidth, spacing, liftedId),
    [cards, containerWidth, cardWidth, spacing, liftedId],
  );
  const placed = useMemo(() => placeLinks(links, slots), [links, slots]);
  const rings = useMemo(() => ringsOf(links, slots), [links, slots]);
  const hot = focusId !== null && placed.length > 0;
  const [clock] = useState(() => new Animated.Value(0));
  const [burst, setBurst] = useState<Burst | null>(null);
  const slotsRef = useRef(slots);

  useLayoutEffect(() => {
    const previous = slotsRef.current;
    const fused = events.filter((event): event is MarksFusedEvent => event.kind === 'marksFused');
    const next = fused.length > 0 ? burstFrom(fused[0], previous) : null;
    if (next && next.rings.length > 0) setBurst(next);
    slotsRef.current = slots;
  }, [events, slots]);

  useLayoutEffect(() => {
    if (placed.length === 0) return;
    clock.setValue(0);
    // ネイティブ駆動は子の点を 1 枚の絵に写し、揺れのあと透明なまま残ることがある。
    const pulse = Animated.loop(
      Animated.timing(clock, {
        toValue: 1,
        duration: hot ? MOTION.ripplePulseHot : MOTION.ripplePulse,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    pulse.start();
    return () => pulse.stop();
  }, [clock, hot, placed.length]);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {rings.map((ring) => (
        <RippleRing key={ring.key} ring={ring} clock={clock} hot={hot} cardWidth={cardWidth} />
      ))}
      {placed.map((link) => (
        <RippleBridge key={link.key} link={link} clock={clock} hot={hot} />
      ))}
      {burst && <FusionBurst burst={burst} cardWidth={cardWidth} onDone={() => setBurst(null)} />}
    </View>
  );
}

function slotMap(
  cards: readonly CardInstance[],
  containerWidth: number,
  cardWidth: number,
  spacing: number,
  liftedId: string | null,
): Map<string, Slot> {
  const centers = handCardCenters(containerWidth, cardWidth, spacing, cards.length);
  const slots = new Map<string, Slot>();
  cards.forEach((card, index) => {
    const center = centers[index];
    if (!center) return;
    slots.set(card.instanceId, {
      x: center.x,
      y: center.y + (card.instanceId === liftedId ? CARD_SELECT_LIFT : 0),
      mark: card.card.mark ?? null,
    });
  });
  return slots;
}

function placeLinks(links: readonly MarkLink[], slots: ReadonlyMap<string, Slot>): Placed[] {
  return links.flatMap((link) => {
    const from = slots.get(link.fromId);
    const to = slots.get(link.toId);
    if (!from || !to) return [];
    return [
      {
        key: `${link.fromId}:${link.toId}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        colorA: MARK_COLORS[link.fromMark],
        colorB: MARK_COLORS[link.toMark],
      },
    ];
  });
}

function ringsOf(links: readonly MarkLink[], slots: ReadonlyMap<string, Slot>): Ring[] {
  const ids = new Set<string>();
  for (const link of links) {
    ids.add(link.fromId);
    ids.add(link.toId);
  }
  const rings: Ring[] = [];
  for (const id of ids) {
    const slot = slots.get(id);
    if (!slot?.mark) continue;
    rings.push({ key: id, x: slot.x, y: slot.y, color: MARK_COLORS[slot.mark] });
  }
  return rings;
}

function burstFrom(event: MarksFusedEvent, slots: ReadonlyMap<string, Slot>): Burst {
  const origin = slots.get(event.playedId);
  const rings: Ring[] = [];
  const links: Placed[] = [];
  if (origin?.mark) {
    rings.push({ key: event.playedId, x: origin.x, y: origin.y, color: MARK_COLORS[origin.mark] });
  }
  for (const id of event.materialIds) {
    const slot = slots.get(id);
    if (!slot?.mark) continue;
    rings.push({ key: id, x: slot.x, y: slot.y, color: MARK_COLORS[slot.mark] });
    if (origin) {
      links.push({
        key: `${event.playedId}:${id}`,
        x1: origin.x,
        y1: origin.y,
        x2: slot.x,
        y2: slot.y,
        colorA: origin.mark ? MARK_COLORS[origin.mark] : MARK_COLORS[slot.mark],
        colorB: MARK_COLORS[slot.mark],
      });
    }
  }
  return { id: event.id, links, rings };
}

function RippleRing({
  ring,
  clock,
  hot,
  cardWidth,
}: {
  ring: Ring;
  clock: Animated.Value;
  hot: boolean;
  cardWidth: number;
}) {
  const size = Math.max(18, cardWidth * 0.62);
  const scale = clock.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: hot ? [0.78, 1.22, 0.78] : [0.9, 1.08, 0.9],
  });
  const opacity = clock.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: hot ? [0.25, 0.9, 0.25] : [0.08, 0.4, 0.08],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: ring.x - size / 2,
        top: ring.y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: hot ? 2 : 1,
        borderColor: ring.color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

function RippleBridge({ link, clock, hot }: { link: Placed; clock: Animated.Value; hot: boolean }) {
  const dx = link.x2 - link.x1;
  const dy = link.y2 - link.y1;
  const length = Math.hypot(dx, dy);
  if (length < 1) return null;
  const count = Math.max(3, Math.min(7, Math.round(length / 16)));
  const dot = hot ? 7 : 4;
  const opacity = clock.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: hot ? [0.4, 1, 0.4] : [0.12, 0.55, 0.12],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: (link.x1 + link.x2) / 2 - length / 2,
        top: (link.y1 + link.y2) / 2 - dot / 2,
        width: length,
        height: dot,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        opacity,
        transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: index % 2 === 0 ? link.colorA : link.colorB,
          }}
        />
      ))}
    </Animated.View>
  );
}

function FusionBurst({
  burst,
  cardWidth,
  onDone,
}: {
  burst: Burst;
  cardWidth: number;
  onDone: () => void;
}) {
  const [clock] = useState(() => new Animated.Value(0));
  const finish = useEffectEvent(() => onDone());
  useLayoutEffect(() => {
    clock.setValue(0);
    const anim = Animated.timing(clock, {
      toValue: 1,
      duration: MOTION.rippleBurst,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) finish();
    });
    return () => anim.stop();
  }, [burst.id, clock]);

  const size = Math.max(22, cardWidth * 0.7);
  const scale = clock.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.85] });
  const opacity = clock.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.2, 0.95, 0] });
  const linkOpacity = clock.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.3, 1, 0] });

  return (
    <>
      {burst.rings.map((ring) => (
        <Animated.View
          key={ring.key}
          style={{
            position: 'absolute',
            left: ring.x - size / 2,
            top: ring.y - size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: ring.color,
            opacity,
            transform: [{ scale }],
          }}
        />
      ))}
      {burst.links.map((link) => {
        const dx = link.x2 - link.x1;
        const dy = link.y2 - link.y1;
        const length = Math.hypot(dx, dy);
        if (length < 1) return null;
        return (
          <Animated.View
            key={link.key}
            style={{
              position: 'absolute',
              left: (link.x1 + link.x2) / 2 - length / 2,
              top: (link.y1 + link.y2) / 2 - 3,
              width: length,
              height: 6,
              borderRadius: 3,
              backgroundColor: link.colorA,
              opacity: linkOpacity,
              transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
            }}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
