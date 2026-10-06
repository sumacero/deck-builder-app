import { useContext, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SoundId } from '../../../audio/sounds';
import { playSound } from '../../../audio/soundPlayer';
import type { CardDefinition } from '../../../domain/card';
import { COLORS, MOTION, RADIUS, SPACING } from '../../../theme';
import { CardView } from '../../cards/CardView';
import { AcquireContext, measureView } from './AcquireContext';

export type FlyingItem =
  /** description があれば、飛ぶ前に効果の説明を読ませる（レリック）。 */
  | { kind: 'icon'; icon: string; label: string; description?: string }
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
const INFO_WIDTH = 300;
const ARC_STEPS = [0, 0.25, 0.5, 0.75, 1];

type Path = { dx: number; dy: number; endScale: number };

const runAnimation = (animation: Animated.CompositeAnimation) =>
  new Promise<boolean>((resolve) => animation.start(({ finished }) => resolve(finished)));
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const readingTime = (text: string) =>
  Math.min(MOTION.acquireInfoMax, MOTION.acquireInfoBase + text.length * MOTION.acquireInfoPerChar);

/**
 * 手に入れたものが画面の真ん中に現れ、所持品のスロット（カードはデッキボタン）へ飛んで収まる。
 * レリックは効果の説明を出して読ませてから飛ぶ（画面のどこかをタップすると先へ進む）。
 * 飛び先が今の画面に無ければ、その場で上へ消える。説明を読んでいる間以外は操作を止めない。
 */
export function AcquireFlyer({ item, targetKey, sound, onDone }: AcquireFlyerProps) {
  const { measureSlot, land } = useContext(AcquireContext);
  const origin = useRef<View>(null);
  const skipReading = useRef<(() => void) | null>(null);
  const [appear] = useState(() => new Animated.Value(0));
  const [info] = useState(() => new Animated.Value(0));
  const [fly] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const [path, setPath] = useState<Path>({ dx: 0, dy: 0, endScale: 1 });
  const [reading, setReading] = useState(false);
  const description = item.kind === 'icon' ? item.description : undefined;
  const finish = useEffectEvent(onDone);
  const play = useEffectEvent(() => playSound(sound));
  const settle = useEffectEvent(() => {
    land(targetKey);
    playSound('slotIn');
  });
  const measure = useEffectEvent(async () => {
    const [self, target] = await Promise.all([
      origin.current ? measureView(origin.current) : Promise.resolve(null),
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
  /** 説明を読ませる。時間が来るか、タップされたら進む。 */
  const read = useEffectEvent(async (text: string) => {
    setReading(true);
    await runAnimation(Animated.timing(info, { toValue: 1, duration: MOTION.acquireInfoFade, useNativeDriver: true }));
    await new Promise<void>((resolve) => {
      const timer = setTimeout(done, readingTime(text));
      function done() {
        clearTimeout(timer);
        skipReading.current = null;
        resolve();
      }
      skipReading.current = done;
    });
    setReading(false);
    await runAnimation(Animated.timing(info, { toValue: 0, duration: MOTION.acquireInfoFade, useNativeDriver: true }));
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
      await appeared;
      if (description) await read(description);
      else await wait(MOTION.acquireHold);
      if (cancelled) return;
      // 画面が切り替わった直後は、飛び先のスロットがまだ並び終わっていないことがある。
      await wait(MOTION.acquireMeasureDelay);
      const measured = await measure();
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
      skipReading.current?.();
    };
  }, [appear, fly, fade, description]);

  const appearScale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const flyScale = fly.interpolate({ inputRange: [0, 1], outputRange: [1, path.endScale] });
  const translateX = fly.interpolate({ inputRange: [0, 1], outputRange: [0, path.dx] });
  // 縦だけ加速させて、放物線のような軌道にする。native driver は interpolate の easing を
  // 扱えないので、y = dy × p² を折れ線で近似する。
  const translateY = fly.interpolate({
    inputRange: ARC_STEPS,
    outputRange: ARC_STEPS.map((p) => path.dy * p * p),
  });
  const rise = fade.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });
  const glow = Animated.multiply(appear, fly.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' }));

  return (
    <View pointerEvents={reading ? 'auto' : 'none'} style={styles.root}>
      {reading && <Pressable style={StyleSheet.absoluteFill} onPress={() => skipReading.current?.()} />}
      <Animated.View
        pointerEvents="none"
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
        <View ref={origin}>
          {item.kind === 'icon' ? (
            <View style={styles.icon}>
              <Text style={styles.emoji}>{item.icon}</Text>
            </View>
          ) : (
            <CardView card={item.card} width={CARD_WIDTH} detailOnHold={false} />
          )}
        </View>
      </Animated.View>
      {item.kind === 'icon' && description === undefined && (
        <Animated.Text style={[styles.label, { opacity: Animated.multiply(appear, glow) }]}>
          {item.label}
        </Animated.Text>
      )}
      {item.kind === 'icon' && description !== undefined && (
        <Animated.View pointerEvents="none" style={[styles.info, { opacity: info }]}>
          <Text style={styles.infoName}>{item.label}</Text>
          <Text style={styles.infoText}>{description}</Text>
          <Text style={styles.infoHint}>タップで次へ</Text>
        </Animated.View>
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
  info: {
    width: INFO_WIDTH,
    maxWidth: '90%',
    marginTop: SPACING.xl,
    padding: SPACING.md,
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  infoName: { color: COLORS.gold, fontSize: 16, fontWeight: '800' },
  infoText: { color: COLORS.text, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  infoHint: { color: COLORS.textMuted, fontSize: 11, marginTop: SPACING.xs },
});
