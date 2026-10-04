import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
let preparing: Promise<void> | null = null;

function playerFor(id: SoundId): AudioPlayer {
  const existing = players.get(id);
  if (existing) return existing;
  const player = createAudioPlayer(SOUNDS[id].source);
  player.volume = SOUNDS[id].volume;
  players.set(id, player);
  return player;
}

async function configureAndPreload(): Promise<void> {
  // Android の false はバイブモードでも消音してしまう。一般的なゲームに合わせ、
  // Android はメディア音量に従い、iOS だけ消音スイッチに従う。
  await setAudioModeAsync({
    playsInSilentMode: Platform.OS === 'android',
    interruptionMode: 'mixWithOthers',
  });
  (Object.keys(SOUNDS) as SoundId[]).forEach(playerFor);
}

/** 音声モードを設定し、全ての効果音を先読みしておく（初回再生の遅れを防ぐ）。失敗したら次回やり直す。 */
export function prepareSounds(): Promise<void> {
  preparing ??= configureAndPreload().catch((error: unknown) => {
    preparing = null;
    console.warn('効果音の準備に失敗しました', error);
  });
  return preparing;
}

/** 効果音の失敗でゲームが止まらないよう、例外は握りつぶして警告だけ出す。 */
export function playSound(id: SoundId): void {
  void prepareSounds();
  try {
    const player = playerFor(id);
    if (player.currentTime > 0) void player.seekTo(0);
    player.play();
  } catch (error: unknown) {
    console.warn(`効果音 ${id} の再生に失敗しました`, error);
  }
}
