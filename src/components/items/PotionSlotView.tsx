import { useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PotionSlot } from '../../domain/combat';
import type { PotionDefinition } from '../../domain/potion';
import type { PotionDragHandlers } from '../combat/cardDrop';
import { COLORS, RADIUS } from '../../theme';
import { slotKey } from '../run/acquire/AcquireContext';
import { useAcquireSlot } from '../run/acquire/useAcquireSlot';

/** 戦闘中だけ渡す。ポーションを持ち上げて、狙う敵へ払って使える。 */
export type PotionDrag = {
  slot: number;
  /** 今飲めるか。飲めなければ持ち上がらない（タップで説明は開く）。 */
  enabled: boolean;
  /** 持ち上げている最中。元の位置は薄く残す。 */
  dragging: boolean;
  handlers: PotionDragHandlers;
  /** タップした（説明を開く）。持ち上げ中に作り直されないよう、同じ関数を渡し続ける。 */
  onTap: (slot: number) => void;
};

type PotionSlotViewProps = {
  /** 何番目の枠か（手に入れたポーションが飛んでくる先を見分ける）。 */
  slot: number;
  potion: PotionSlot;
  selected: boolean;
  onPress: () => void;
  drag?: PotionDrag;
};

/** ポーション 1 枠。手に入れたポーションは飛んでくるまで空き枠に見え、収まると弾む。 */
export function PotionSlotView({ slot, potion, selected, onPress, drag }: PotionSlotViewProps) {
  const { bindView, hidden, scale } = useAcquireSlot(slotKey.potion(slot));
  return (
    <View ref={bindView} collapsable={false}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {!potion || hidden ? (
          <View style={[styles.slot, styles.empty]} />
        ) : drag ? (
          <DraggablePotion potion={potion} selected={selected} drag={drag} />
        ) : (
          <StaticPotion potion={potion} selected={selected} onPress={onPress} />
        )}
      </Animated.View>
    </View>
  );
}

type StaticPotionProps = { potion: PotionDefinition; selected: boolean; onPress: () => void };

/** 戦闘の外。タップで説明を開くだけ。 */
function StaticPotion({ potion, selected, onPress }: StaticPotionProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.slot, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{potion.icon}</Text>
    </Pressable>
  );
}

/** これより指が動いたら、タップではなく持ち上げ。 */
const DRAG_START_DISTANCE = 8;

type DraggablePotionProps = {
  potion: PotionDefinition;
  selected: boolean;
  drag: PotionDrag;
};

/** タップで説明を開き、指を動かせば持ち上げる。 */
function DraggablePotion({ potion, selected, drag }: DraggablePotionProps) {
  const { slot, enabled, handlers, onTap } = drag;
  const [pressed, setPressed] = useState(false);

  // ジェスチャーを途中で作り直すと途切れるので、渡す関数は親で同じものを使い続けてもらう。
  const responder = useMemo(() => {
    const gesture = { dragging: false, moved: false };
    const startDrag = (x0: number, y0: number) => {
      if (!enabled) return false;
      gesture.dragging = true;
      handlers.onDragStart(slot, { x: x0, y: y0 });
      return true;
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gesture.dragging = false;
        gesture.moved = false;
        setPressed(true);
        if (enabled) handlers.onPressIn();
      },
      onPanResponderMove: (_, g) => {
        const point = { x: g.moveX, y: g.moveY };
        if (gesture.dragging) {
          handlers.onDragMove(point);
          return;
        }
        if (Math.hypot(g.dx, g.dy) <= DRAG_START_DISTANCE) return;
        gesture.moved = true;
        if (startDrag(g.x0, g.y0)) handlers.onDragMove(point);
      },
      onPanResponderRelease: (_, g) => {
        setPressed(false);
        const point = { x: g.moveX, y: g.moveY };
        const velocity = { x: g.vx, y: g.vy };
        if (gesture.dragging) {
          handlers.onDragEnd(point, velocity);
        } else if (Math.hypot(g.dx, g.dy) > DRAG_START_DISTANCE) {
          // 指の動きの知らせが来る前に離すほど素早いフリック。
          if (startDrag(g.x0, g.y0)) handlers.onDragEnd(point, velocity);
        } else if (!gesture.moved) {
          onTap(slot);
        }
        gesture.dragging = false;
      },
      onPanResponderTerminationRequest: () => !gesture.dragging,
      onPanResponderTerminate: () => {
        setPressed(false);
        if (gesture.dragging) handlers.onDragCancel();
        gesture.dragging = false;
      },
    });
  }, [slot, enabled, handlers, onTap]);

  return (
    <View
      {...responder.panHandlers}
      hitSlop={4}
      style={[
        styles.slot,
        selected && styles.selected,
        pressed && styles.pressed,
        drag.dragging && styles.dragging,
      ]}
    >
      <Text style={styles.emoji}>{potion.icon}</Text>
    </View>
  );
}

const SIZE = 34;

const styles = StyleSheet.create({
  slot: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { borderStyle: 'dashed', borderColor: COLORS.panelBorder, backgroundColor: 'transparent' },
  selected: { borderColor: COLORS.gold },
  pressed: { opacity: 0.7 },
  dragging: { opacity: 0.25 },
  emoji: { fontSize: 18 },
});
