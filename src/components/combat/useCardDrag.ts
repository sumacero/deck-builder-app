import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, type View } from 'react-native';
import type { CardDefinition, CardInstance } from '../../domain/card';
import type { EnemyState, EnemyUid } from '../../domain/combat';
import { isAlive } from '../../logic/combat';
import { HAND_LAYOUT } from '../../theme';
import { type DropTarget, type Point, type Rect, resolveDrop, sameDrop } from './cardDrop';
import type { CardDragHandlers } from './DraggableCard';

/** 手札の上端からこれだけ上まで持ち上げたら「使う」位置。 */
const RELEASE_MARGIN = 24;
/** 指の位置に対して、持ち上げたカードを描く位置（指がカードの下寄りに来るように）。 */
const GHOST_ANCHOR_Y = 0.8;

type DraggedCard = { instanceId: string; card: CardDefinition };

type Layout = {
  origin: Point;
  releaseLineY: number;
  enemyRects: { uid: EnemyUid; rect: Rect }[];
};

type UseCardDragOptions = {
  hand: CardInstance[];
  enemies: EnemyState[];
  cardWidth: number;
  onPlay: (instanceId: string, target?: EnemyUid) => void;
};

/**
 * 手札のカードを持ち上げて、敵の上などで離して使う操作。
 * 位置の判定は画面座標で行うので、戦闘画面・手札・各敵の View の位置を測っておく。
 * ドラッグ中に作り直されないよう、返す関数はすべて同じものを使い続ける。
 */
export function useCardDrag({ hand, enemies, cardWidth, onPlay }: UseCardDragOptions) {
  const [drag, setDrag] = useState<DraggedCard | null>(null);
  const [hover, setHover] = useState<DropTarget | null>(null);
  const [ghost] = useState(() => new Animated.ValueXY());

  const containerView = useRef<View | null>(null);
  const handView = useRef<View | null>(null);
  const enemyViews = useRef(new Map<EnemyUid, View>());
  const layout = useRef<Layout>({
    origin: { x: 0, y: 0 },
    releaseLineY: Number.NEGATIVE_INFINITY,
    enemyRects: [],
  });
  const dragRef = useRef<DraggedCard | null>(null);
  const hoverRef = useRef<DropTarget | null>(null);
  const latest = useRef({ hand, enemies, cardWidth, onPlay });
  useEffect(() => {
    latest.current = { hand, enemies, cardWidth, onPlay };
  });

  const measureContainer = useCallback(() => {
    containerView.current?.measureInWindow((x, y) => {
      layout.current.origin = { x, y };
    });
  }, []);

  const handlers = useMemo((): Omit<CardDragHandlers, 'onTap'> => {
    const measureAll = () => {
      measureContainer();
      handView.current?.measureInWindow((_x, y) => {
        layout.current.releaseLineY = y - RELEASE_MARGIN;
      });
      const rects: Layout['enemyRects'] = [];
      layout.current.enemyRects = rects;
      for (const enemy of latest.current.enemies.filter(isAlive)) {
        enemyViews.current.get(enemy.uid)?.measureInWindow((x, y, width, height) => {
          rects.push({ uid: enemy.uid, rect: { x, y, width, height } });
        });
      }
    };
    const moveGhost = (point: Point) => {
      const { origin } = layout.current;
      const width = latest.current.cardWidth;
      ghost.setValue({
        x: point.x - origin.x - width / 2,
        y: point.y - origin.y - width * HAND_LAYOUT.aspectRatio * GHOST_ANCHOR_Y,
      });
    };
    const updateHover = (point: Point) => {
      const dragged = dragRef.current;
      if (!dragged) return;
      const { enemyRects, releaseLineY } = layout.current;
      const next = resolveDrop(point, dragged.card.target, enemyRects, releaseLineY);
      if (sameDrop(next, hoverRef.current)) return;
      hoverRef.current = next;
      setHover(next);
    };
    const reset = () => {
      dragRef.current = null;
      hoverRef.current = null;
      setDrag(null);
      setHover(null);
    };
    return {
      onDragStart: (instanceId, point) => {
        const instance = latest.current.hand.find((c) => c.instanceId === instanceId);
        if (!instance) return;
        const dragged = { instanceId, card: instance.card };
        dragRef.current = dragged;
        setDrag(dragged);
        measureAll();
        moveGhost(point);
        updateHover(point);
      },
      onDragMove: (point) => {
        moveGhost(point);
        updateHover(point);
      },
      onDragEnd: (point) => {
        updateHover(point);
        const dragged = dragRef.current;
        const target = hoverRef.current;
        reset();
        if (!dragged || !target) return;
        latest.current.onPlay(dragged.instanceId, target.kind === 'enemy' ? target.uid : undefined);
      },
      onDragCancel: reset,
    };
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

  return { drag, hover, ghost, handlers, bindContainer, measureContainer, bindHand, bindEnemy };
}
