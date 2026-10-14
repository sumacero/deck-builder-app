import { type AudioPlayer, type AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
import { SOUND_MASTER_VOLUME, type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
/**
 * 一度でも再生できる状態になった音。
 * Android の isLoaded は「いま READY」だけを見て、鳴らし終わった ENDED を未読み込みと返す。
 * そこを待つと、2 回目以降の効果音が遅れたり、鳴らさずに終わったりする。
 */
const primed = new Set<SoundId>();
/** まだ準備中の音で、準備ができたら鳴らすもの。 */
const pending = new Set<SoundId>();
let preparing: Promise<void> | null = null;

/** 各音の大きさ × 効果音全体のバランス × 設定（50 で今までどおり）。 */
function soundVolume(id: SoundId): number {
  return outputVolume(SOUNDS[id].volume * SOUND_MASTER_VOLUME, getAudioSettings().se);
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

function noteReady(id: SoundId, player: AudioPlayer): void {
  if (primed.has(id)) return;
  primed.add(id);
  if (!pending.has(id)) return;
  pending.delete(id);
  player.volume = soundVolume(id);
  playFromStart(player);
}

/** 読み込めたという通知を一度だけ受け取る。鳴らし終わりの未読み込みフラグは見ない。 */
function watchReady(id: SoundId, player: AudioPlayer): void {
  if (Platform.OS === 'web' || primed.has(id)) return;
  const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
    if (!status.isLoaded) return;
    subscription.remove();
    noteReady(id, player);
  });
  if (player.isLoaded) {
    subscription.remove();
    noteReady(id, player);
  }
}

function createPlayer(id: SoundId): AudioPlayer {
  // ブラウザは音の URL をその場で鳴らせる。
  // スマホは、パックの URL のまま play すると読み込み前の再生が捨てられて無音になる。
  // 先に端末へ落としてから鳴らす。
  const player = createAudioPlayer(SOUNDS[id].source, {
    downloadFirst: Platform.OS !== 'web',
  });
  player.volume = soundVolume(id);
  watchReady(id, player);
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

async function configureAndPreload(): Promise<void> {
  await configureAudioMode();
  if (Platform.OS === 'web') return;
  for (const id of Object.keys(SOUNDS) as SoundId[]) playerFor(id);
}

/** 音声モードを設定し、全ての効果音を先読みしておく（初回再生の遅れを防ぐ）。失敗したら次回やり直す。 */
export function prepareSounds(): Promise<void> {
  preparing ??= configureAndPreload().catch((error: unknown) => {
    preparing = null;
    console.warn('効果音の準備に失敗しました', error);
  });
  return preparing;
}

/**
 * 効果音を鳴らす。一度読み込んだ音は、鳴らし終わっていてもすぐ頭から鳴らす。
 * まだ届いていないときだけ、届いた瞬間に鳴らす。全音の準備完了は待たない。
 * 失敗してもゲームは止めない。
 */
export function playSound(id: SoundId): void {
  void prepareSounds();
  const player = playerFor(id);
  player.volume = soundVolume(id);
  if (Platform.OS === 'web' || primed.has(id) || player.isLoaded) {
    if (player.isLoaded) primed.add(id);
    pending.delete(id);
    playFromStart(player);
    return;
  }
  pending.add(id);
}
