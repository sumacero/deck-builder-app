import { useContext, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { SoundId } from '../../../audio/sounds';
import { playSound } from '../../../audio/soundPlayer';
import type { CardDefinition } from '../../../domain/card';
import { COLORS, MOTION, RADIUS, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';
import { AcquireContext, measureView } from './AcquireContext';

export type FlyingItem =
  | { kind: 'icon'; icon: string; label: string }
  | { kind: 'card'; card: CardDefinition };

type AcquireFlyerProps = {
  item: FlyingItem;
  targetKey: string;
  /** 現れたときの音。 */
  sound: SoundId;
  onDone: () => void;
};

const ICON_SIZE = 64;
const CARD_WIDTH = 84;

type Path = { dx: number; dy: number; endScale: number };

const runAnimation = (animation: Animated.CompositeAnimation) =>
  new Promise<boolean>((resolve) => animation.start(({ finished }) => resolve(finished)));
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 手に入れたものが画面の真ん中に現れ、所持品のスロット（カードはデッキボタン）へ飛んで収まる。
 * 飛び先が今の画面に無ければ、その場で上へ消える。操作は止めない。
 */
export function AcquireFlyer({ item, targetKey, sound, onDone }: AcquireFlyerProps) {
  const { measureSlot, land } = useContext(AcquireContext);
  const container = useRef<View>(null);
  const [appear] = useState(() => new Animated.Value(0));
  const [fly] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const [path, setPath] = useState<Path>({ dx: 0, dy: 0, endScale: 1 });
  const finish = useEffectEvent(onDone);
  const play = useEffectEvent(() => playSound(sound));
  const settle = useEffectEvent(() => {
    land(targetKey);
    playSound('slotIn');
  });
  const measure = useEffectEvent(async () => {
    const [self, target] = await Promise.all([
      container.current ? measureView(container.current) : Promise.resolve(null),
      measureSlot(targetKey),
    ]);
    if (!self || !target) return null;
    const size = item.kind === 'icon' ? ICON_SIZE : CARD_WIDTH;
    return {
      dx: target.x + target.width / 2 - (self.x + self.width / 2),
      dy: target.y + target.height / 2 - (self.y + self.height / 2),
      endScale: Math.min(target.width, target.height) / size,
    };
  });

  useEffect(() => {
    let cancelled = false;
    const sequence = async () => {
      play();
      const appeared = runAnimation(
        Animated.timing(appear, {
          toValue: 1,
          duration: MOTION.acquireAppear,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
      );
      // 画面が切り替わった直後は、飛び先のスロットがまだ並び終わっていないことがある。
      await wait(MOTION.acquireMeasureDelay);
      const measured = await measure();
      await appeared;
      await wait(MOTION.acquireHold);
      if (cancelled) return;
      if (measured) {
        setPath(measured);
        await runAnimation(
          Animated.timing(fly, {
            toValue: 1,
            duration: MOTION.acquireFly,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        );
        if (cancelled) return;
        settle();
      } else {
        await runAnimation(
          Animated.timing(fade, { toValue: 0, duration: MOTION.acquireFly, useNativeDriver: true }),
        );
        if (cancelled) return;
      }
      finish();
    };
    void sequence();
    return () => {
      cancelled = true;
    };
  }, [appear, fly, fade]);

  const appearScale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const flyScale = fly.interpolate({ inputRange: [0, 1], outputRange: [1, path.endScale] });
  const translateX = fly.interpolate({ inputRange: [0, 1], outputRange: [0, path.dx] });
  // 縦だけ加速させて、放物線のような軌道にする。
  const translateY = fly.interpolate({
    inputRange: [0, 1],
    outputRange: [0, path.dy],
    easing: Easing.in(Easing.quad),
  });
  const rise = fade.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });
  const glow = Animated.multiply(appear, fly.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' }));

  return (
    <View ref={container} pointerEvents="none" style={styles.root}>
      <Animated.View
        style={{
          opacity: fade,
          transform: [
            { translateX },
            { translateY: Animated.add(translateY, rise) },
            { scale: Animated.multiply(appearScale, flyScale) },
          ],
        }}
      >
        <Animated.View style={[styles.glow, { opacity: glow }]} />
        {item.kind === 'icon' ? (
          <View style={styles.icon}>
            <Text style={styles.emoji}>{item.icon}</Text>
          </View>
        ) : (
          <CardView card={item.card} width={CARD_WIDTH} detailOnHold={false} />
        )}
      </Animated.View>
      {item.kind === 'icon' && (
        <Animated.Text style={[styles.label, { opacity: Animated.multiply(appear, glow) }]}>
          {item.label}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -SPACING.md,
    right: -SPACING.md,
    bottom: -SPACING.md,
    left: -SPACING.md,
    borderRadius: RADIUS.round,
    backgroundColor: `${COLORS.gold}44`,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 34 },
  label: {
    position: 'absolute',
    marginTop: ICON_SIZE + SPACING.xl * 2,
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 4,
  },
});
