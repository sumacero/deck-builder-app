import { useCallback, useContext, useEffect, useState } from 'react';
import { Animated, type View } from 'react-native';
import { MOTION } from '../../../theme';
import { AcquireContext } from './AcquireContext';

/** 収まった瞬間に、スロットがどれだけふくらむか。 */
const LAND_SCALE = 1.45;

/**
 * 入手演出の飛び先になるスロット。View を登録し、飛んでくるまでは hidden、
 * 収まったら scale で弾む。
 */
export function useAcquireSlot(key: string) {
  const { registerSlot, hidden, landCounts } = useContext(AcquireContext);
  const [bounce] = useState(() => new Animated.Value(0));
  const landCount = landCounts.get(key) ?? 0;

  const bindView = useCallback((node: View | null) => registerSlot(key, node), [registerSlot, key]);

  useEffect(() => {
    if (landCount === 0) return;
    bounce.setValue(1);
    const animation = Animated.spring(bounce, {
      toValue: 0,
      friction: MOTION.slotLandFriction,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [landCount, bounce]);

  const scale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, LAND_SCALE] });
  return { bindView, hidden: hidden.has(key), scale };
}
