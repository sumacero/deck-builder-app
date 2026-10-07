import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, MOTION, RADIUS, SPACING } from '../../theme';

type HpBarProps = {
  hp: number;
  maxHp: number;
  block: number;
  /** 敵が多いときの細い表示。 */
  compact?: boolean;
  /**
   * このターンの終わりに失う予定の HP（宿り木）。
   * 今の HP の右側を緑にし、残りが全部緑ならターン終了で倒れる。
   */
  incoming?: number;
};

const toWidth = (value: Animated.Value | Animated.AnimatedInterpolation<number> | Animated.AnimatedSubtraction<number>) =>
  value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

/** 減った分は明るい残像が少し遅れて追いかける。宿り木の予定ダメージは、今の HP の右側を緑にする。 */
export function HpBar({ hp, maxHp, block, compact = false, incoming = 0 }: HpBarProps) {
  const ratio = maxHp > 0 ? hp / maxHp : 0;
  const loss = Math.min(Math.max(0, incoming), hp);
  const lossRatio = maxHp > 0 ? loss / maxHp : 0;
  const lethal = hp > 0 && loss >= hp;
  const [fill] = useState(() => new Animated.Value(ratio));
  const [trail] = useState(() => new Animated.Value(ratio));
  const [badgeScale] = useState(() => new Animated.Value(1));
  // 緑は赤いゲージの右端にくっつけて動かす。HP が減る途中でも、緑と空の間に赤がのぞかない。
  const incomingLeft = Animated.subtract(fill, lossRatio).interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });
  const incomingWidth = Animated.subtract(fill, incomingLeft);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fill, { toValue: ratio, duration: MOTION.hpBar, useNativeDriver: false }),
      Animated.timing(trail, {
        toValue: ratio,
        delay: MOTION.hpTrailDelay,
        duration: MOTION.hpTrail,
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [ratio, fill, trail]);

  useEffect(() => {
    badgeScale.setValue(1.35);
    const animation = Animated.spring(badgeScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [block, badgeScale]);

  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      {block > 0 && (
        <Animated.View
          style={[
            styles.blockBadge,
            compact && styles.compactBlockBadge,
            { transform: [{ scale: badgeScale }] },
          ]}
        >
          <Text style={[styles.blockText, compact && styles.compactText]}>
            🛡️{compact ? '' : ' '}
            {block}
          </Text>
        </Animated.View>
      )}
      <View style={[styles.track, compact && styles.compactTrack]}>
        <Animated.View style={[styles.bar, styles.trail, { width: toWidth(trail) }]} />
        <Animated.View style={[styles.bar, styles.fill, { width: toWidth(fill) }]} />
        {loss > 0 && maxHp > 0 && (
          <Animated.View
            style={[
              styles.bar,
              styles.incoming,
              { left: toWidth(incomingLeft), width: toWidth(incomingWidth) },
            ]}
          />
        )}
        {lethal && <View pointerEvents="none" style={styles.lethalRing} />}
        <Text style={[styles.label, compact && styles.compactLabel]}>
          {compact ? `${hp}/${maxHp}` : `${hp} / ${maxHp}`}
        </Text>
      </View>
    </View>
  );
}

const BAR_HEIGHT = 18;
const COMPACT_BAR_HEIGHT = 14;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  compactRow: { gap: 2 },
  compactTrack: { height: COMPACT_BAR_HEIGHT },
  compactLabel: { fontSize: 10, lineHeight: COMPACT_BAR_HEIGHT },
  compactBlockBadge: { paddingHorizontal: 3, paddingVertical: 0 },
  compactText: { fontSize: 11 },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.hpTrack,
    overflow: 'hidden',
  },
  bar: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  trail: { backgroundColor: COLORS.hpTrail },
  fill: { backgroundColor: COLORS.hp },
  /** 赤の上に重ねる。残像が追いつく前でも、失う予定の分だけ緑に見える。 */
  incoming: { backgroundColor: COLORS.heal },
  /** 残り HP が全部緑のとき、ゲージ全体を緑の輪で囲んで「ターン終了で倒れる」と分かるようにする。 */
  lethalRing: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 2,
    borderColor: COLORS.heal,
    borderRadius: RADIUS.round,
  },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: BAR_HEIGHT,
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 3,
  },
  blockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.block,
    backgroundColor: `${COLORS.block}33`,
  },
  blockText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
});
