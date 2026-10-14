import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, type View } from 'react-native';
import type { CardDefinition, CardInstance } from '../../domain/card';
import type { EnemyState, EnemyUid, PotionSlot } from '../../domain/combat';
import type { PotionDefinition } from '../../domain/potion';
import { isAlive } from '../../logic/combat';
import { canStackOnto } from '../../logic/marks';
import { HAND_LAYOUT, ITEM_BAR } from '../../theme';
import {
  DRAG_LIFT_DISTANCE,
  type DragMoveHandlers,
  type DropTarget,
  type Point,
  type PotionDragHandlers,
  projectFlick,
  type Rect,
  resolveDrop,
  resolveItemDrop,
  sameDrop,
} from './cardDrop';
import type { CardDragHandlers } from './DraggableCard';
import { handCardAtPoint } from './handLayout';

/**
 * 指がこの高さより上に来たら「使う」位置。手札のカードの上端から、カードの高さのこの割合だけ下。
 * 指はふつうカードの真ん中あたりを押すので、カード半分弱持ち上げれば届く。
 */
const RELEASE_LINE_IN_CARD = 0.2;
/** 指の位置に対して、持ち上げたカードを描く位置（指がカードの下寄りに来るように）。 */
const GHOST_ANCHOR_Y = 0.8;
/** 持ち上げたポーションは、指に隠れないよう指の少し上に描く。 */
const POTION_GHOST_ANCHOR_Y = 1.2;

/** 持ち上げているもの。 */
export type DragItem =
  | { kind: 'card'; instanceId: string; card: CardDefinition }
  | { kind: 'potion'; slot: number; potion: PotionDefinition };

/** lifted: 持ち始めた位置から DRAG_LIFT_DISTANCE より動かした。それまでは使い道を決めない（タップかもしれない）。 */
type Dragging = { item: DragItem; start: Point; lifted: boolean };

type Layout = {
  origin: Point;
  /** 手札の枠。画面座標。カードの上に重ねる判定に使う。 */
  handRect: Rect | null;
  releaseLineY: number;
  enemyRects: { uid: EnemyUid; rect: Rect }[];
  /** 自分の枠。自分に使うカードは、この中で離したときだけ使う。 */
  playerRect: Rect | null;
};

type UseCardDragOptions = {
  hand: CardInstance[];
  enemies: EnemyState[];
  potions: PotionSlot[];
  cardWidth: number;
  onPlayCard: (instanceId: string, target?: EnemyUid) => void;
  /** 手札の印を、もう一枚の上に重ねる。 */
  onFuse: (sourceId: string, targetId: string) => void;
  onDrinkPotion: (slot: number, target?: EnemyUid) => void;
};

/**
 * 手札のカードや所持品のポーションを持ち上げて、敵の上などで離して使う操作。
 * 位置の判定は画面座標で行うので、戦闘画面・手札・各敵の View の位置を測っておく。
 * ドラッグ中に作り直されないよう、返す関数はすべて同じものを使い続ける。
 */
export function useCardDrag({
  hand,
  enemies,
  potions,
  cardWidth,
  onPlayCard,
  onFuse,
  onDrinkPotion,
}: UseCardDragOptions) {
  const [drag, setDrag] = useState<DragItem | null>(null);
  const [hover, setHover] = useState<DropTarget | null>(null);
  /** 指の下にある、重ねられる札。 */
  const [stackHover, setStackHover] = useState<string | null>(null);
  /** 持ち始めた位置から動かしたか。動かす前は案内を出さない（タップかもしれない）。 */
  const [lifted, setLifted] = useState(false);
  const [ghost] = useState(() => new Animated.ValueXY());

  const containerView = useRef<View | null>(null);
  const handView = useRef<View | null>(null);
  const enemyViews = useRef(new Map<EnemyUid, View>());
  const playerView = useRef<View | null>(null);
  const layout = useRef<Layout>({
    origin: { x: 0, y: 0 },
    handRect: null,
    releaseLineY: Number.NEGATIVE_INFINITY,
    enemyRects: [],
    playerRect: null,
  });
  const draggingRef = useRef<Dragging | null>(null);
  const hoverRef = useRef<DropTarget | null>(null);
  const stackRef = useRef<string | null>(null);
  const latest = useRef({ hand, enemies, potions, cardWidth, onPlayCard, onFuse, onDrinkPotion });
  useEffect(() => {
    latest.current = { hand, enemies, potions, cardWidth, onPlayCard, onFuse, onDrinkPotion };
  });

  const measureContainer = useCallback(() => {
    containerView.current?.measureInWindow((x, y) => {
      layout.current.origin = { x, y };
    });
  }, []);

  const { cardHandlers, potionHandlers } = useMemo(() => {
    /**
     * 位置を測り直す。測定は非同期なので、敵の位置は全員分そろってから入れ替える
     * （途中で離されても、前回の測定結果で狙える）。
     */
    const measureAll = () => {
      measureContainer();
      handView.current?.measureInWindow((x, y, width, height) => {
        layout.current.handRect = { x, y, width, height };
        const cardHeight = latest.current.cardWidth * HAND_LAYOUT.aspectRatio;
        layout.current.releaseLineY = y + HAND_LAYOUT.topPadding + cardHeight * RELEASE_LINE_IN_CARD;
      });
      playerView.current?.measureInWindow((x, y, width, height) => {
        layout.current.playerRect = width > 0 && height > 0 ? { x, y, width, height } : null;
      });
      const views = latest.current.enemies.filter(isAlive).flatMap((enemy) => {
        const view = enemyViews.current.get(enemy.uid);
        return view ? [{ uid: enemy.uid, view }] : [];
      });
      if (views.length === 0) {
        layout.current.enemyRects = [];
        return;
      }
      const rects: Layout['enemyRects'] = [];
      for (const { uid, view } of views) {
        view.measureInWindow((x, y, width, height) => {
          rects.push({ uid, rect: { x, y, width, height } });
          if (rects.length === views.length) layout.current.enemyRects = rects;
        });
      }
    };
    /** 測ったあとに倒れた敵は狙わない。 */
    const livingRects = () => {
      const living = new Set(latest.current.enemies.filter(isAlive).map((enemy) => enemy.uid));
      return layout.current.enemyRects.filter(({ uid }) => living.has(uid));
    };
    const moveGhost = (item: DragItem, point: Point) => {
      const { origin } = layout.current;
      if (item.kind === 'potion') {
        const size = ITEM_BAR.potionGhostSize;
        ghost.setValue({
          x: point.x - origin.x - size / 2,
          y: point.y - origin.y - size * POTION_GHOST_ANCHOR_Y,
        });
        return;
      }
      const width = latest.current.cardWidth;
      ghost.setValue({
        x: point.x - origin.x - width / 2,
        y: point.y - origin.y - width * HAND_LAYOUT.aspectRatio * GHOST_ANCHOR_Y,
      });
    };
    const aim = (dragging: Dragging, point: Point): DropTarget | null => {
      const { item, start } = dragging;
      return item.kind === 'card'
        ? resolveDrop(
            point,
            item.card.target,
            livingRects(),
            layout.current.releaseLineY,
            layout.current.playerRect,
          )
        : resolveItemDrop(point, start, item.potion.target, livingRects());
    };
    /** 指の下に、持ち上げた札を重ねられる相手がいれば、その札。 */
    const stackTargetAt = (point: Point, sourceId: string): string | null => {
      const { hand, cardWidth: width } = latest.current;
      const rect = layout.current.handRect;
      if (!rect || width <= 0) return null;
      const sourceIndex = hand.findIndex((card) => card.instanceId === sourceId);
      const hit = handCardAtPoint(point, rect, rect.width, width, hand.length, sourceIndex);
      if (hit === null) return null;
      const source = hand[sourceIndex];
      const target = hand[hit];
      if (!source || !target || !canStackOnto(hand, source, target)) return null;
      return target.instanceId;
    };
    const updateHover = (point: Point) => {
      const dragging = draggingRef.current;
      if (!dragging) return;
      const { start } = dragging;
      if (!dragging.lifted && Math.hypot(point.x - start.x, point.y - start.y) > DRAG_LIFT_DISTANCE) {
        dragging.lifted = true;
        setLifted(true);
      }
      const nextStack =
        dragging.lifted && dragging.item.kind === 'card'
          ? stackTargetAt(point, dragging.item.instanceId)
          : null;
      if (nextStack !== stackRef.current) {
        stackRef.current = nextStack;
        setStackHover(nextStack);
      }
      const next = dragging.lifted && nextStack === null ? aim(dragging, point) : null;
      if (sameDrop(next, hoverRef.current)) return;
      hoverRef.current = next;
      setHover(next);
    };
    const reset = () => {
      draggingRef.current = null;
      hoverRef.current = null;
      stackRef.current = null;
      setDrag(null);
      setHover(null);
      setStackHover(null);
      setLifted(false);
    };
    const begin = (item: DragItem, point: Point) => {
      draggingRef.current = { item, start: point, lifted: false };
      setDrag(item);
      measureAll();
      moveGhost(item, point);
      updateHover(point);
    };

    const common: DragMoveHandlers = {
      onPressIn: measureAll,
      onDragMove: (point) => {
        const dragging = draggingRef.current;
        if (!dragging) return;
        moveGhost(dragging.item, point);
        updateHover(point);
      },
      onDragEnd: (point, velocity) => {
        const dragging = draggingRef.current;
        const stacking =
          dragging?.lifted && dragging.item.kind === 'card'
            ? stackTargetAt(point, dragging.item.instanceId)
            : null;
        reset();
        if (!dragging) return;
        if (stacking && dragging.item.kind === 'card') {
          latest.current.onFuse(dragging.item.instanceId, stacking);
          return;
        }
        const target = aim(dragging, projectFlick(point, velocity));
        if (!target) return;
        const uid = target.kind === 'enemy' ? target.uid : undefined;
        const { item } = dragging;
        if (item.kind === 'card') latest.current.onPlayCard(item.instanceId, uid);
        else latest.current.onDrinkPotion(item.slot, uid);
      },
      onDragCancel: reset,
    };

    const cards: CardDragHandlers = {
      ...common,
      onDragStart: (instanceId, point) => {
        const instance = latest.current.hand.find((c) => c.instanceId === instanceId);
        if (instance) begin({ kind: 'card', instanceId, card: instance.card }, point);
      },
    };
    const potionDrag: PotionDragHandlers = {
      ...common,
      onDragStart: (slot, point) => {
        const potion = latest.current.potions[slot];
        if (potion) begin({ kind: 'potion', slot, potion }, point);
      },
    };
    return { cardHandlers: cards, potionHandlers: potionDrag };
  }, [ghost, measureContainer]);

  const bindContainer = useCallback((node: View | null) => {
    containerView.current = node;
  }, []);
  const bindHand = useCallback((node: View | null) => {
    handView.current = node;
  }, []);
  const bindEnemy = useCallback((uid: EnemyUid, node: View | null) => {
    if (node) enemyViews.current.set(uid, node);
    else enemyViews.current.delete(uid);
  }, []);
  const bindPlayer = useCallback((node: View | null) => {
    playerView.current = node;
  }, []);

  return {
    drag,
    hover,
    stackHover,
    lifted,
    ghost,
    cardHandlers,
    potionHandlers,
    bindContainer,
    measureContainer,
    bindHand,
    bindEnemy,
    bindPlayer,
  };
}
