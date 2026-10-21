import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { pickTitleMusic, type TitleMusicId } from '../../audio/music';
import { CRIMSON_HERO, MIRROR_SEER, VERDANT_ARCHER } from '../../data/agents';
import { GAME_SUBTITLE, GAME_TITLE } from '../../data/gameInfo';
import type { AgentDefinition } from '../../domain/agent';
import type { Region } from '../../domain/act';
import { useMusic } from '../../hooks/useMusic';
import { ACTOR_FIGURE, COLORS, MOTION, RADIUS, SPACING } from '../../theme';
import { AgentPortrait } from '../agents/AgentPortrait';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { GalleryButton } from '../gallery/GalleryButton';
import { SettingsButton } from '../settings/SettingsButton';
import { ScreenScroll } from '../layout/ScreenScroll';

type TitleScreenProps = {
  onStart: () => void;
};

/** タイトルの背景は水の古都の景色。 */
const BACKGROUND_REGION: Region = 'sunkenCity';

/** 曲と、画面に立つ仲間を対応させる。 */
const TITLE_CAST: Record<TitleMusicId, AgentDefinition> = {
  title: CRIMSON_HERO,
  titleLene: VERDANT_ARCHER,
  titleNoa: MIRROR_SEER,
};

/** 起動直後の画面。ゲーム名が浮かび上がり、「冒険を始める」が呼吸するように光る。 */
export function TitleScreen({ onStart }: TitleScreenProps) {
  const [appear] = useState(() => new Animated.Value(0));
  const [glow] = useState(() => new Animated.Value(0));
  // 起動のたびに 3 キャラのうち 1 人（曲も同じ人）。再描画では変えない。
  const [musicId] = useState(pickTitleMusic);
  const agent = TITLE_CAST[musicId];
  useMusic(musicId);

  useEffect(() => {
    const intro = Animated.timing(appear, {
      toValue: 1,
      duration: MOTION.titleFadeIn,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: MOTION.titlePulse, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: MOTION.titlePulse, useNativeDriver: true }),
      ]),
    );
    intro.start();
    breathe.start();
    return () => {
      intro.stop();
      breathe.stop();
    };
  }, [appear, glow]);

  const rise = appear.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const buttonScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <SceneBackground region={BACKGROUND_REGION} scene="map">
      <ScreenScroll contentStyle={styles.root}>
        <Animated.View
          style={[styles.heading, { opacity: appear, transform: [{ translateY: rise }] }]}
        >
          <Text style={styles.subtitle}>{GAME_SUBTITLE}</Text>
          <Text style={styles.title}>{GAME_TITLE}</Text>
          <View style={styles.rule} />
        </Animated.View>

        <AgentPortrait agentId={agent.id} icon={agent.icon} size={ACTOR_FIGURE.size} />

        <Animated.View style={[styles.menu, { opacity: appear }]}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              onPress={onStart}
              style={({ pressed }) => [styles.start, pressed && styles.pressed]}
            >
              <Text style={styles.startText}>冒険を始める</Text>
            </Pressable>
          </Animated.View>
          <GalleryButton large />
          <SettingsButton large />
        </Animated.View>
      </ScreenScroll>
    </SceneBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    padding: SPACING.xl,
  },
  heading: { alignItems: 'center', gap: SPACING.sm },
  subtitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 6 },
  title: {
    color: COLORS.gold,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
    textShadowColor: COLORS.textOutline,
    textShadowRadius: 8,
  },
  rule: { width: 160, height: 2, backgroundColor: COLORS.gold, opacity: 0.6 },
  menu: { alignItems: 'center', gap: SPACING.md },
  start: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
  },
  startText: { color: COLORS.onGold, fontSize: 18, fontWeight: '900', letterSpacing: 4 },
  pressed: { opacity: 0.7 },
});
