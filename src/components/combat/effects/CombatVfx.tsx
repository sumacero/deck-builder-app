import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ACTOR_FIGURE, COLORS, LEGACY_BURST, MOTION } from '../../../theme';
import type { VfxKind } from '../motion/motionPresets';

type CombatVfxProps = {
  kind: VfxKind;
  /** 再生のたびに変えて、同じ種類でも再スタートする。 */
  playId: number;
  onDone?: () => void;
};

/**
 * アニメ風の戦闘エフェクト（斬撃ライン・衝撃波・盾の光など）。
 * 絵文字の代わりに、View の拡大・移動・フェードで表現する。
 */
export function CombatVfx({ kind, playId, onDone }: CombatVfxProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: MOTION.burst,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => anim.stop();
  }, [playId, progress, onDone]);

  const fade = progress.interpolate({
    inputRange: [0, 0.12, 0.55, 1],
    outputRange: [0, 1, 1, 0],
  });

  switch (kind) {
    case 'slash':
    case 'cross':
      return (
        <View style={styles.stage} pointerEvents="none">
          <SlashArc progress={progress} fade={fade} angle={-38} />
          {kind === 'cross' && <SlashArc progress={progress} fade={fade} angle={42} delayed />}
        </View>
      );
    case 'impact':
      return (
        <View style={styles.stage} pointerEvents="none">
          <ImpactBurst progress={progress} fade={fade} />
        </View>
      );
    case 'spin':
      return (
        <View style={styles.stage} pointerEvents="none">
          <SpinRing progress={progress} fade={fade} />
        </View>
      );
    case 'guard':
      return (
        <View style={styles.stage} pointerEvents="none">
          <GuardFlash progress={progress} fade={fade} />
        </View>
      );
    case 'power':
      return (
        <View style={styles.stage} pointerEvents="none">
          <PowerAura progress={progress} fade={fade} color={COLORS.arte} />
        </View>
      );
    case 'spark':
      return (
        <View style={styles.stage} pointerEvents="none">
          <PowerAura progress={progress} fade={fade} color={COLORS.gold} />
        </View>
      );
    case 'wince':
      return (
        <View style={styles.stage} pointerEvents="none">
          <ImpactBurst progress={progress} fade={fade} small />
        </View>
      );
    case 'arrow':
      return (
        <View style={styles.stage} pointerEvents="none">
          <ArrowFlash progress={progress} fade={fade} />
        </View>
      );
    case 'leaf':
      return (
        <View style={styles.stage} pointerEvents="none">
          <SpinRing progress={progress} fade={fade} color={COLORS.heal} />
        </View>
      );
    case 'water':
      return (
        <View style={styles.stage} pointerEvents="none">
          <PowerAura progress={progress} fade={fade} color={ACTOR_FIGURE.elementAura.water} />
        </View>
      );
    case 'ice':
      return (
        <View style={styles.stage} pointerEvents="none">
          <IceBurst progress={progress} fade={fade} />
        </View>
      );
    case 'drop':
      return (
        <View style={styles.stage} pointerEvents="none">
          <DropBurst progress={progress} fade={fade} />
        </View>
      );
    case 'mist':
      return (
        <View style={styles.stage} pointerEvents="none">
          <MistBurst progress={progress} fade={fade} />
        </View>
      );
  }
}

type AnimProps = {
  progress: Animated.Value;
  fade: Animated.AnimatedInterpolation<string | number>;
};

function SlashArc({
  progress,
  fade,
  angle,
  delayed,
}: AnimProps & { angle: number; delayed?: boolean }) {
  const travel = progress.interpolate({
    inputRange: delayed ? [0.15, 0.55, 1] : [0, 0.4, 1],
    outputRange: [-50, 10, 70],
  });
  const stretch = progress.interpolate({
    inputRange: delayed ? [0.15, 0.4, 1] : [0, 0.25, 1],
    outputRange: [0.2, 1.3, 0.4],
  });
  return (
    <Animated.View
      style={[
        styles.slash,
        {
          opacity: fade,
          transform: [{ rotate: `${angle}deg` }, { translateX: travel }, { scaleX: stretch }],
        },
      ]}
    >
      <View style={styles.slashCore} />
      <View style={styles.slashGlow} />
    </Animated.View>
  );
}

function ImpactBurst({
  progress,
  fade,
  small,
}: AnimProps & { small?: boolean }) {
  const ring = progress.interpolate({ inputRange: [0, 1], outputRange: [0.2, small ? 1.4 : 2.2] });
  const flash = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1.2, 0.2] });
  const size = small ? 56 : 88;
  return (
    <>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: fade,
            transform: [{ scale: ring }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.star,
          {
            opacity: fade,
            transform: [{ scale: flash }, { rotate: '20deg' }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.star,
          styles.starCross,
          {
            opacity: fade,
            transform: [{ scale: flash }, { rotate: '-25deg' }],
          },
        ]}
      />
    </>
  );
}

function SpinRing({
  progress,
  fade,
  color = COLORS.gold,
}: AnimProps & { color?: string }) {
  const spin = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '280deg'] });
  const grow = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.8] });
  return (
    <Animated.View
      style={[
        styles.spinRing,
        {
          borderColor: color,
          opacity: fade,
          transform: [{ rotate: spin }, { scale: grow }],
        },
      ]}
    />
  );
}

function GuardFlash({ progress, fade }: AnimProps) {
  const grow = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] });
  return (
    <>
      <Animated.View
        style={[
          styles.guardDisc,
          { opacity: fade, transform: [{ scale: grow }] },
        ]}
      />
      <Animated.View
        style={[
          styles.guardRim,
          { opacity: fade, transform: [{ scale: grow }] },
        ]}
      />
    </>
  );
}

function PowerAura({
  progress,
  fade,
  color,
}: AnimProps & { color: string }) {
  const up = progress.interpolate({ inputRange: [0, 1], outputRange: [20, -40] });
  const grow = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.6] });
  return (
    <>
      <Animated.View
        style={[
          styles.aura,
          { backgroundColor: color, opacity: fade, transform: [{ translateY: up }, { scale: grow }] },
        ]}
      />
      <Animated.View
        style={[
          styles.auraInner,
          { borderColor: color, opacity: fade, transform: [{ scale: grow }] },
        ]}
      />
    </>
  );
}

function IceBurst({ progress, fade }: AnimProps) {
  const grow = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.7] });
  const spin = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '40deg'] });
  return (
    <>
      <Animated.View
        style={[
          styles.iceRing,
          { opacity: fade, transform: [{ scale: grow }] },
        ]}
      />
      {[0, 60, 120].map((angle) => (
        <Animated.View
          key={angle}
          style={[
            styles.iceShard,
            {
              opacity: fade,
              transform: [{ rotate: `${angle}deg` }, { rotate: spin }, { scale: grow }],
            },
          ]}
        />
      ))}
    </>
  );
}

function DropBurst({ progress, fade }: AnimProps) {
  const fall = progress.interpolate({ inputRange: [0, 1], outputRange: [-24, 18] });
  const grow = progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.4, 1.2, 0.6] });
  return (
    <>
      <Animated.View
        style={[
          styles.dropRing,
          { opacity: fade, transform: [{ scale: grow }] },
        ]}
      />
      {[-28, 0, 28].map((x) => (
        <Animated.View
          key={x}
          style={[
            styles.dropOrb,
            {
              opacity: fade,
              transform: [{ translateX: x }, { translateY: fall }, { scale: grow }],
            },
          ]}
        />
      ))}
    </>
  );
}

function MistBurst({ progress, fade }: AnimProps) {
  const drift = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const grow = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] });
  return (
    <>
      {[-36, 0, 34].map((x, index) => (
        <Animated.View
          key={x}
          style={[
            styles.mistCloud,
            {
              opacity: fade,
              transform: [
                { translateX: x },
                { translateY: drift },
                { scale: grow },
                { rotate: `${index === 1 ? -8 : 6}deg` },
              ],
            },
          ]}
        />
      ))}
    </>
  );
}

function ArrowFlash({ progress, fade }: AnimProps) {
  const fly = progress.interpolate({ inputRange: [0, 1], outputRange: [-40, 60] });
  return (
    <Animated.View
      style={[
        styles.arrow,
        { opacity: fade, transform: [{ translateX: fly }, { rotate: '-12deg' }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  stage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  slash: {
    position: 'absolute',
    width: 140,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slashCore: {
    position: 'absolute',
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF8E7',
  },
  slashGlow: {
    position: 'absolute',
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 200, 80, 0.45)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FFE08A',
    backgroundColor: 'rgba(255, 180, 60, 0.2)',
  },
  star: {
    position: 'absolute',
    width: 72,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF4C2',
  },
  starCross: {
    width: 6,
    height: 72,
  },
  spinRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
  },
  guardDisc: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(90, 169, 255, 0.35)',
  },
  guardRim: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#8EC5FF',
  },
  aura: {
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.5,
  },
  auraInner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
  },
  arrow: {
    width: 70,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CFFB0',
  },
  iceRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: LEGACY_BURST.ice,
    backgroundColor: 'rgba(223, 246, 255, 0.28)',
  },
  iceShard: {
    position: 'absolute',
    width: 8,
    height: 46,
    borderRadius: 4,
    backgroundColor: LEGACY_BURST.ice,
  },
  dropRing: {
    width: 64,
    height: 28,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: LEGACY_BURST.drop,
    backgroundColor: 'rgba(61, 139, 255, 0.25)',
  },
  dropOrb: {
    position: 'absolute',
    width: 16,
    height: 22,
    borderRadius: 10,
    backgroundColor: LEGACY_BURST.drop,
  },
  mistCloud: {
    position: 'absolute',
    width: 84,
    height: 32,
    borderRadius: 16,
    backgroundColor: LEGACY_BURST.mist,
  },
});
