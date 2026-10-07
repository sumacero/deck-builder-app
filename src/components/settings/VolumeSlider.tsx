import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { clampVolumeLevel, MAX_VOLUME_LEVEL, MIN_VOLUME_LEVEL } from '../../audio/levels';
import { COLORS, RADIUS, SPACING } from '../../theme';

type VolumeSliderProps = {
  label: string;
  value: number;
  onChange: (level: number) => void;
  /** 指を離したときと、±ボタンを押したとき。効果音の試し鳴らしに使う。 */
  onCommit?: () => void;
};

const STEP = 10;
const KNOB = 22;
const TRACK_HIT = 36;

/** 0〜100 の音量。パッケージのスライダーは足さず、指の位置で値を決める。 */
export function VolumeSlider({ label, value, onChange, onCommit }: VolumeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const applyAt = (event: GestureResponderEvent) => {
    onChange(levelAt(event.nativeEvent.locationX, trackWidth));
  };
  const releaseAt = (event: GestureResponderEvent) => {
    onChange(levelAt(event.nativeEvent.locationX, trackWidth));
    onCommit?.();
  };
  const stepTo = (next: number) => {
    onChange(clampVolumeLevel(next));
    onCommit?.();
  };
  const knobLeft = trackWidth === 0 ? 0 : (value / MAX_VOLUME_LEVEL) * Math.max(0, trackWidth - KNOB);

  return (
    <View style={styles.block}>
      <View style={styles.heading}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={`${label}を下げる`}
          onPress={() => stepTo(value - STEP)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: MIN_VOLUME_LEVEL, max: MAX_VOLUME_LEVEL, now: value }}
          style={styles.trackHit}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={applyAt}
          onResponderMove={applyAt}
          onResponderRelease={releaseAt}
          onResponderTerminate={() => onCommit?.()}
        >
          <View pointerEvents="none" style={styles.track}>
            <View style={[styles.fill, { width: `${value}%` }]} />
          </View>
          <View pointerEvents="none" style={[styles.knob, { left: knobLeft }]} />
        </View>
        <Pressable
          accessibilityLabel={`${label}を上げる`}
          onPress={() => stepTo(value + STEP)}
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
        >
          <Text style={styles.stepText}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

function levelAt(x: number, width: number): number {
  if (width <= 0) return MIN_VOLUME_LEVEL;
  return clampVolumeLevel((x / width) * MAX_VOLUME_LEVEL);
}

const styles = StyleSheet.create({
  block: { alignSelf: 'stretch', minWidth: 0, gap: SPACING.sm },
  heading: {
    alignSelf: 'stretch',
    minWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  value: { color: COLORS.gold, fontSize: 18, fontWeight: '800' },
  row: { alignSelf: 'stretch', minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  step: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.panel,
  },
  stepText: { color: COLORS.gold, fontSize: 20, fontWeight: '800' },
  /** minWidth: 0 と overflow で、つまみの位置が行を横に押し広げないようにする。 */
  trackHit: { flex: 1, minWidth: 0, height: TRACK_HIT, justifyContent: 'center', overflow: 'hidden' },
  track: {
    height: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.hpTrack,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.gold },
  knob: {
    position: 'absolute',
    top: (TRACK_HIT - KNOB) / 2,
    width: KNOB,
    height: KNOB,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: COLORS.onGold,
  },
  pressed: { opacity: 0.7 },
});
