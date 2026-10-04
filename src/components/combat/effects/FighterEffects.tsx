import { type ReactNode, useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { CombatEvent, CombatTarget } from '../../../domain/combat';
import { COLORS, MOTION, RADIUS } from '../../../theme';
import { FloatingText, type FloatingTextTone } from './FloatingText';
import { useCombatEvents } from '../../../hooks/useCombatEvents';

type Popup = {
  id: number;
  text: string;
  tone: FloatingTextTone;
  offsetX: number;
  large: boolean;
};

type FighterEffectsProps = {
  target: CombatTarget;
  events: CombatEvent[];
  defeated: boolean;
  defeatDelay: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const BIG_HIT = 10;

const timing = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, { toValue, duration, useNativeDriver: true });

const shake = (value: Animated.Value, intensity: number) =>
  Animated.sequence(
    [1, -1, 0.6, -0.6, 0.3, 0].map((k) => timing(value, k * intensity, MOTION.shakeStep)),
  );

const flash = (value: Animated.Value, peak: number) =>
  Animated.sequence([timing(value, peak, MOTION.flashIn), timing(value, 0, MOTION.flashOut)]);

const bump = (value: Animated.Value) =>
  Animated.sequence([
    timing(value, 1.08, MOTION.flashIn),
    Animated.spring(value, { toValue: 1, friction: 4, useNativeDriver: true }),
  ]);

/**
 * キャラクター（敵・プレイヤー）を包み、被弾・ガード・ブロック獲得・撃破の演出を付ける。
 * 揺れ、色フラッシュ、浮き上がる数値の 3 種類を組み合わせる。
 */
export function FighterEffects({
  target,
  events,
  defeated,
  defeatDelay,
  style,
  children,
}: FighterEffectsProps) {
  const [shakeX] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [damageFlash] = useState(() => new Animated.Value(0));
  const [guardFlash] = useState(() => new Animated.Value(0));
  const [healFlash] = useState(() => new Animated.Value(0));
  const [presence] = useState(() => new Animated.Value(1));
  const [popups, setPopups] = useState<Popup[]>([]);

  const addPopup = (popup: Omit<Popup, 'offsetX'>) =>
    setPopups((prev) => [...prev, { ...popup, offsetX: ((popup.id % 3) - 1) * 28 }]);
  const removePopup = (id: number) => setPopups((prev) => prev.filter((p) => p.id !== id));

  useCombatEvents(events, (event) => {
    if (event.target !== target) return;
    switch (event.kind) {
      case 'hit': {
        if (event.hpLoss > 0) {
          const big = event.hpLoss >= BIG_HIT;
          Animated.parallel([shake(shakeX, big ? 16 : 10), flash(damageFlash, 0.55)]).start();
          addPopup({ id: event.id, text: `-${event.hpLoss}`, tone: 'damage', large: big });
        } else {
          Animated.parallel([bump(scale), flash(guardFlash, 0.5)]).start();
          addPopup({ id: event.id, text: 'ガード！', tone: 'guard', large: false });
        }
        return;
      }
      case 'blockGain':
        Animated.parallel([bump(scale), flash(guardFlash, 0.35)]).start();
        addPopup({ id: event.id, text: `+${event.amount} 🛡️`, tone: 'guard', large: false });
        return;
      case 'heal':
        Animated.parallel([bump(scale), flash(healFlash, 0.45)]).start();
        addPopup({ id: event.id, text: `+${event.amount}`, tone: 'heal', large: false });
        return;
      case 'cardPlayed':
      case 'potionUsed':
      case 'relicTriggered':
      case 'enemyAct':
      case 'defeated':
        return;
    }
  });

  useEffect(() => {
    if (!defeated) {
      presence.setValue(1);
      return;
    }
    const animation = Animated.timing(presence, {
      toValue: 0,
      delay: defeatDelay,
      duration: MOTION.defeat,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [defeated, defeatDelay, presence]);

  const presenceScale = presence.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: presence,
          transform: [{ translateX: shakeX }, { scale: Animated.multiply(scale, presenceScale) }],
        },
      ]}
    >
      {children}
      <Animated.View
        style={[styles.fill, { backgroundColor: COLORS.hp, opacity: damageFlash }]}
      />
      <Animated.View
        style={[styles.fill, { backgroundColor: COLORS.block, opacity: guardFlash }]}
      />
      <Animated.View style={[styles.fill, { backgroundColor: COLORS.heal, opacity: healFlash }]} />
      <View style={[styles.fill, styles.center]}>
        {popups.map((popup) => (
          <FloatingText
            key={popup.id}
            text={popup.text}
            tone={popup.tone}
            offsetX={popup.offsetX}
            large={popup.large}
            onDone={() => removePopup(popup.id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS.md,
    pointerEvents: 'none',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
