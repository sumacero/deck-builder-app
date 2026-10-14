import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
import { SOUND_MASTER_VOLUME, type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
let preparing: Promise<void> | null = null;

/** まだ読み込めていない音を、この間隔で見にいく。状態通知は再生中しか来ないので、自分で見る。 */
const LOAD_POLL_MS = 16;
/** これだけ待っても読めなければ、その音は鳴らさない。遅い音を後から重ねない。 */
const LOAD_WAIT_MS = 400;

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

/** 読み込み済みなら true。状態通知を待たず、短い間隔で isLoaded を見る。 */
function whenLoaded(player: AudioPlayer): Promise<boolean> {
  if (player.isLoaded) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (player.isLoaded) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - started >= LOAD_WAIT_MS) {
        clearInterval(timer);
        resolve(false);
      }
    }, LOAD_POLL_MS);
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

/** 頭から鳴らす。シークが要るときだけ、シークが届いてから再生する。 */
function playFromStart(player: AudioPlayer): void {
  const start = () => {
    try {
      player.play();
    } catch (error: unknown) {
      console.warn('効果音の再生に失敗しました', error);
    }
  };
  if (player.currentTime <= 0.02) {
    start();
    return;
  }
  void player.seekTo(0).then(start, start);
}

/**
 * 効果音を鳴らす。読み込み済みならその場で鳴らす。
 * スマホは、全音の準備や状態通知（最大 2 秒）を待たない。未読のときだけ、読めた瞬間に鳴らす。
 * 失敗してもゲームは止めない。
 */
export function playSound(id: SoundId): void {
  void prepareSounds();
  const player = playerFor(id);
  player.volume = soundVolume(id);
  if (Platform.OS === 'web' || player.isLoaded) {
    playFromStart(player);
    return;
  }
  void whenLoaded(player).then((ready) => {
    if (!ready) return;
    player.volume = soundVolume(id);
    playFromStart(player);
  });
}
