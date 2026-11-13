import { Asset } from 'expo-asset';
import { type AudioPlayer, type AudioSource, type AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
import { SOUND_MASTER_VOLUME, type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
const opening = new Map<SoundId, Promise<AudioPlayer>>();
/** 端末に落としたファイル。再生機を空のまま作って後から差し替えると、最初の play が捨てられる。 */
const localSources = new Map<SoundId, AudioSource>();
/**
 * 再生位置が実際に進んだ音。
 * 「再生中」フラグだけは、音が出ていなくてもすぐ真になる。短い効果音はそこで成功扱いにすると、1 回目が無音のままになる。
 * 一度鳴ったあとは、鳴らし終わりを未読み込みと返す端末でも、待たずに頭から鳴らす。
 */
const heard = new WeakSet<AudioPlayer>();
/** いま、最初の再生を待っている音。 */
const priming = new WeakSet<AudioPlayer>();
/** 最初の再生を待っているあいだに、もう一度鳴らしてほしい回数。 */
const followUp = new WeakMap<AudioPlayer, number>();
let preparing: Promise<void> | null = null;

/** 各音の大きさ × 効果音全体のバランス × 設定（50 で今までどおり）。 */
function soundVolume(id: SoundId): number {
  return outputVolume(SOUNDS[id].volume * SOUND_MASTER_VOLUME, getAudioSettings().se);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

/** 再生位置が進んだ。`playing` だけでは音が出ていなくても真になるので、見ない。 */
function progressed(player: AudioPlayer): boolean {
  try {
    if (player.currentTime > 0.02) return true;
    const status = player.currentStatus;
    return status.currentTime > 0.02 || status.didJustFinish;
  } catch {
    return false;
  }
}

/**
 * パックの中の WAV を、再生機を作る前に端末のファイルにする。
 * `downloadFirst` は空の再生機を先に作り、後から差し替える。その空の再生機への play は捨てられ、
 * 差し替えが終わる頃には「再生中」だけが真になって、1 回目を成功扱いにしてしまう。
 */
async function localSource(id: SoundId): Promise<AudioSource> {
  const cached = localSources.get(id);
  if (cached) return cached;
  const raw = SOUNDS[id].source;
  if (typeof raw !== 'number') {
    localSources.set(id, raw);
    return raw;
  }
  const packed = Asset.fromModule(raw);
  const asset = packed.type
    ? packed
    : new Asset({ name: packed.name, type: 'wav', hash: packed.hash, uri: packed.uri });
  if (!asset.localUri) await asset.downloadAsync();
  const source: AudioSource = { uri: asset.localUri ?? asset.uri };
  localSources.set(id, source);
  return source;
}

/** 同じ音の再生機は 1 つ。先読みと再生が同時でも、ファイルを載せてから作る。 */
function openPlayer(id: SoundId): Promise<AudioPlayer> {
  const existing = players.get(id);
  if (existing) return Promise.resolve(existing);
  const inflight = opening.get(id);
  if (inflight) return inflight;
  const created = (async () => {
    await configureAudioMode();
    const source = Platform.OS === 'web' ? SOUNDS[id].source : await localSource(id);
    const raced = players.get(id);
    if (raced) return raced;
    const player = createAudioPlayer(source, {
      updateInterval: 50,
      keepAudioSessionActive: true,
    });
    player.volume = soundVolume(id);
    players.set(id, player);
    return player;
  })().catch((error: unknown) => {
    opening.delete(id);
    throw error;
  });
  opening.set(id, created);
  return created;
}

/** 読み込み完了の通知が来ないことがある。来なければ、少し待ってから鳴らす。 */
function waitUntilLoaded(player: AudioPlayer): Promise<void> {
  if (Platform.OS === 'web' || player.isLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    let subscription: { remove: () => void } | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (done) return;
      done = true;
      if (timer) clearInterval(timer);
      if (giveUp) clearTimeout(giveUp);
      subscription?.remove();
      resolve();
    };
    subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (status.isLoaded) finish();
    });
    if (done || player.isLoaded) {
      finish();
      return;
    }
    timer = setInterval(() => {
      if (player.isLoaded) finish();
    }, 40);
    giveUp = setTimeout(finish, 400);
  });
}

/**
 * その再生機の最初の音。ファイルが載り、再生位置が進むまで成功にしない。
 * 進まなければ、もう一度だけ鳴らす。短い音を 180ms ごとにやり直すと、鳴る前に頭へ戻る。
 */
async function playNewSound(id: SoundId, player: AudioPlayer): Promise<void> {
  if (priming.has(player)) {
    followUp.set(player, (followUp.get(player) ?? 0) + 1);
    return;
  }
  priming.add(player);
  const release = holdSoundPreload();
  let moved = false;
  let subscription: { remove: () => void } | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  try {
    await waitUntilLoaded(player);
    if (player.currentTime > 0.02) {
      await Promise.race([player.seekTo(0).catch(() => undefined), wait(150)]);
    }
    await wait(30);
    const note = (status: AudioStatus) => {
      if (status.currentTime > 0.02 || status.didJustFinish) moved = true;
    };
    subscription = player.addListener('playbackStatusUpdate', note);
    timer = setInterval(() => {
      if (progressed(player)) moved = true;
    }, 40);
    player.play();
    await wait(280);
    if (!moved && !progressed(player)) {
      player.play();
      await wait(280);
    }
    if (moved || progressed(player)) {
      heard.add(player);
    } else {
      console.warn(`効果音が鳴りませんでした (${id})`);
    }
  } catch (error: unknown) {
    console.warn('効果音の再生に失敗しました', error);
  } finally {
    if (timer) clearInterval(timer);
    subscription?.remove();
    priming.delete(player);
    release();
    const extra = followUp.get(player) ?? 0;
    followUp.delete(player);
    if (extra > 0 && heard.has(player)) playFromStart(player);
  }
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

/** 効果音は少しずつ先読みする。曲を鳴らした直後にまとめて作らない。 */
async function preloadSlowly(): Promise<void> {
  const ids = Object.keys(SOUNDS) as SoundId[];
  for (let index = 0; index < ids.length; index += 1) {
    await whenPreloadAllowed();
    if (index === 0) await wait(700);
    const id = ids[index];
    if (id) {
      try {
        await openPlayer(id);
      } catch (error: unknown) {
        console.warn('効果音の準備に失敗しました', error);
      }
    }
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
 * 効果音を鳴らす。一度再生位置が進んだ音は、鳴らし終わっていてもすぐ頭から鳴らす。
 * まだ鳴ったことのない音だけ、ファイルを載せてから鳴らし、位置が進むまで成功にしない。
 * 失敗してもゲームは止めない。
 */
export function playSound(id: SoundId): void {
  void openPlayer(id)
    .then((player) => {
      player.volume = soundVolume(id);
      if (Platform.OS === 'web' || heard.has(player)) {
        heard.add(player);
        playFromStart(player);
        return;
      }
      return playNewSound(id, player);
    })
    .catch((error: unknown) => {
      console.warn('効果音の再生に失敗しました', error);
    });
}
