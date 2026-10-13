import {
  type AudioPlayer,
  type AudioStatus,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';
import { Platform } from 'react-native';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
import { SOUND_MASTER_VOLUME, type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
const playTails = new Map<SoundId, Promise<void>>();
let preparing: Promise<void> | null = null;

/** 読み込み待ちがこれ以上かかったら、鳴らしにいく。 */
const LOAD_WAIT_MS = 2000;

/** 各音の大きさ × 効果音全体のバランス × 設定（50 で今までどおり）。 */
function soundVolume(id: SoundId): number {
  return outputVolume(SOUNDS[id].volume * SOUND_MASTER_VOLUME, getAudioSettings().se);
}

function createPlayer(id: SoundId): AudioPlayer {
  // ブラウザは音の URL をその場で鳴らせる。
  // スマホは、パックの URL のまま play すると読み込み前の再生が捨てられて無音になる。
  // 先に端末へ落としてから鳴らす。
  const player = createAudioPlayer(SOUNDS[id].source, {
    downloadFirst: Platform.OS !== 'web',
  });
  player.volume = soundVolume(id);
  return player;
}

function playerFor(id: SoundId): AudioPlayer {
  const existing = players.get(id);
  if (existing) return existing;
  const player = createPlayer(id);
  players.set(id, player);
  return player;
}

subscribeAudioSettings(() => {
  players.forEach((player, id) => {
    player.volume = soundVolume(id);
  });
});

let configuring: Promise<void> | null = null;

/** 音声モードは効果音と BGM で共通。最初に呼ばれたときに 1 回だけ設定する。失敗したら次回やり直す。 */
export function configureAudioMode(): Promise<void> {
  // Android の false はバイブモードでも消音してしまう。一般的なゲームに合わせ、
  // Android はメディア音量に従い、iOS だけ消音スイッチに従う。
  configuring ??= setAudioModeAsync({
    playsInSilentMode: Platform.OS === 'android',
    interruptionMode: 'mixWithOthers',
  }).catch((error: unknown) => {
    configuring = null;
    throw error;
  });
  return configuring;
}

function whenLoaded(player: AudioPlayer): Promise<void> {
  if (player.isLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscription.remove();
      resolve();
    };
    const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (status.isLoaded) finish();
    });
    const timeout = setTimeout(finish, LOAD_WAIT_MS);
    if (player.isLoaded) finish();
  });
}

async function configureAndPreload(): Promise<void> {
  await configureAudioMode();
  const ids = Object.keys(SOUNDS) as SoundId[];
  await Promise.all(
    ids.map(async (id) => {
      const player = playerFor(id);
      if (Platform.OS !== 'web') await whenLoaded(player);
    }),
  );
}

/** 音声モードを設定し、全ての効果音を先読みしておく（初回再生の遅れを防ぐ）。失敗したら次回やり直す。 */
export function prepareSounds(): Promise<void> {
  preparing ??= configureAndPreload().catch((error: unknown) => {
    preparing = null;
    console.warn('効果音の準備に失敗しました', error);
  });
  return preparing;
}

function playNow(id: SoundId): void {
  const player = playerFor(id);
  player.volume = soundVolume(id);
  if (player.currentTime > 0) void player.seekTo(0);
  player.play();
}

async function playWhenReady(id: SoundId): Promise<void> {
  await prepareSounds();
  const player = players.get(id) ?? playerFor(id);
  await whenLoaded(player);
  player.volume = soundVolume(id);
  if (player.currentTime > 0.05) await player.seekTo(0);
  player.play();
}

/** 効果音の失敗でゲームが止まらないよう、例外は握りつぶして警告だけ出す。 */
export function playSound(id: SoundId): void {
  if (Platform.OS === 'web') {
    void prepareSounds();
    try {
      playNow(id);
    } catch (error: unknown) {
      console.warn(`効果音 ${id} の再生に失敗しました`, error);
    }
    return;
  }
  const run = () =>
    playWhenReady(id).catch((error: unknown) => {
      console.warn(`効果音 ${id} の再生に失敗しました`, error);
    });
  const previous = playTails.get(id) ?? Promise.resolve();
  playTails.set(id, previous.then(run, run));
}
