import { type AudioPlayer, type AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
import { SOUND_MASTER_VOLUME, type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
/**
 * 一度でも実際に鳴った音。
 * ファイルが読めただけでは足りない。スマホは、その再生機の最初の play を捨てることがある。
 * 鳴ったあとは、Android が鳴らし終わった音を未読み込みと返しても、待たずに頭から鳴らす。
 */
const heard = new WeakSet<AudioPlayer>();
/** いま、最初の再生を待っている音。同じ音を重ねて何本も作らない。 */
const arming = new WeakSet<AudioPlayer>();
/** 最初の再生を待っているあいだに、もう一度鳴らしてほしい回数。 */
const followUp = new WeakMap<AudioPlayer, number>();
/** まだ準備中の音で、準備ができたら鳴らすもの。 */
const pending = new Set<SoundId>();
let preparing: Promise<void> | null = null;
/** 同時に初めて鳴らす音は、少しずらす。同じ瞬間の play はまとめて捨てられる。 */
let firstWave = 0;

/** 各音の大きさ × 効果音全体のバランス × 設定（50 で今までどおり）。 */
function soundVolume(id: SoundId): number {
  return outputVolume(SOUNDS[id].volume * SOUND_MASTER_VOLUME, getAudioSettings().se);
}

/** 頭から鳴らす。シークが要るときだけ、シークが届いてから再生する。鳴ったことのある音向け。 */
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

/** 再生位置が進んだ、または鳴っている。読み込み完了の通知は来ないことがあるので、自分で見る。 */
function audible(player: AudioPlayer): boolean {
  try {
    if (player.playing || player.currentTime > 0.02) return true;
    const status = player.currentStatus;
    return status.playing || status.didJustFinish || status.currentTime > 0.02;
  } catch {
    return false;
  }
}

/**
 * その再生機の最初の音。作った直後の play は、スマホに捨てられる。
 * 鳴ったのが分かるまで、間を空けてやり直す。鳴り終わった短い音を、もう一度鳴らさない。
 */
function playUntilHeard(player: AudioPlayer): void {
  if (Platform.OS === 'web' || heard.has(player)) {
    heard.add(player);
    playFromStart(player);
    return;
  }
  if (arming.has(player)) {
    followUp.set(player, (followUp.get(player) ?? 0) + 1);
    return;
  }
  arming.add(player);
  const release = holdSoundPreload();
  let tries = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let subscription: { remove: () => void } | undefined;
  const finish = (ok: boolean) => {
    if (stopped) return;
    stopped = true;
    if (timer) clearTimeout(timer);
    subscription?.remove();
    arming.delete(player);
    if (ok) heard.add(player);
    release();
    if (ok && (followUp.get(player) ?? 0) > 0) {
      followUp.set(player, 0);
      playFromStart(player);
    }
  };
  // リスナーが同期で呼ばれても、代入前の購読は消せるように、戻ってから片づける。
  subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
    if (status.playing || status.didJustFinish || status.currentTime > 0.02) finish(true);
  });
  if (stopped) {
    subscription.remove();
    return;
  }
  const attempt = () => {
    if (stopped) return;
    if (audible(player)) {
      finish(true);
      return;
    }
    if (tries >= 6) {
      finish(false);
      return;
    }
    tries += 1;
    try {
      player.play();
    } catch (error: unknown) {
      console.warn('効果音の再生に失敗しました', error);
    }
    timer = setTimeout(attempt, 180);
  };
  const gap = 70 + (firstWave % 4) * 50;
  firstWave += 1;
  timer = setTimeout(attempt, gap);
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
/**
 * 曲の切り替え中や、効果音の最初の再生中は、先読みを止める。
 * その瞬間に再生機をまとめて作ると、スマホは鳴らし始めた音を捨てる。
 */
let preloadHolds = 0;
let preloadWaiters: (() => void)[] = [];

/** 先読みを止める。戻した関数を、鳴らし始めてから呼ぶ。重なっても、全部終わるまで待つ。 */
export function holdSoundPreload(): () => void {
  preloadHolds += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    preloadHolds -= 1;
    if (preloadHolds > 0) return;
    const waiters = preloadWaiters;
    preloadWaiters = [];
    for (const resolve of waiters) resolve();
  };
}

function whenPreloadAllowed(): Promise<void> {
  if (preloadHolds === 0) return Promise.resolve();
  return new Promise((resolve) => preloadWaiters.push(resolve));
}

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 効果音は少しずつ先読みする。曲を鳴らした直後にまとめて作らない。 */
async function preloadSlowly(): Promise<void> {
  const ids = Object.keys(SOUNDS) as SoundId[];
  for (let index = 0; index < ids.length; index += 1) {
    await whenPreloadAllowed();
    if (index === 0) await wait(700);
    const id = ids[index];
    if (id) playerFor(id);
    if (index % 3 === 2) await wait(80);
  }
}

async function configureAndPreload(): Promise<void> {
  await configureAudioMode();
  if (Platform.OS === 'web') return;
  void preloadSlowly();
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
  pending.add(id);
  // 音声モードが済む前にプレイヤーを作って play すると、スマホは最初の 1 回を捨てる。
  void prepareSounds().then(() => {
    if (!pending.has(id)) return;
    const player = playerFor(id);
    player.volume = soundVolume(id);
    pending.delete(id);
    playUntilHeard(player);
  });
}
