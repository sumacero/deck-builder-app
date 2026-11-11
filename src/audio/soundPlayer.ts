import { type AudioPlayer, type AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
import { SOUND_MASTER_VOLUME, type SoundId, SOUNDS } from './sounds';

const players = new Map<SoundId, AudioPlayer>();
/** 一度でも鳴り始めた音。準備直後の play が捨てられたときだけ、もう一度鳴らす。 */
const heard = new WeakSet<AudioPlayer>();
/** 読み込み通知が来ないとき、自分で見る上限（100ms × 150）。 */
const READY_POLLS = 150;
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
  const kick = () => {
    start();
    if (Platform.OS === 'web' || heard.has(player)) return;
    // 準備直後の play は、スマホだと一度だけ捨てられる。頭が出ていなければもう一度。
    setTimeout(() => {
      if (player.playing || player.currentTime > 0.05) {
        heard.add(player);
        return;
      }
      heard.add(player);
      start();
    }, 400);
  };
  if (player.currentTime <= 0.02) {
    kick();
    return;
  }
  void player.seekTo(0).then(kick, kick);
}

function noteReady(id: SoundId, player: AudioPlayer): void {
  if (primed.has(id)) return;
  primed.add(id);
  if (!pending.has(id)) return;
  pending.delete(id);
  player.volume = soundVolume(id);
  playFromStart(player);
}

/**
 * 読み込めたら一度だけ知らせる。
 * スマホは、読み込みの通知が来ないことがある。通知だけを待つと、最初の 1 回が永遠に無音になる。
 * 届いたかどうかは自分でも見る。
 */
function watchReady(id: SoundId, player: AudioPlayer): void {
  if (Platform.OS === 'web' || primed.has(id)) return;
  let done = false;
  let armed = false;
  let polls = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (done) return;
    done = true;
    armed = false;
    subscription.remove();
    if (timer) clearInterval(timer);
  };
  const finish = (force: boolean) => {
    if (done || !armed) return;
    if (!force && !player.isLoaded) return;
    stop();
    noteReady(id, player);
  };
  // リスナーが同期で呼ばれても、タイマーを消す前に参照しない。
  const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
    if (status.isLoaded) finish(false);
  });
  timer = setInterval(() => {
    polls += 1;
    if (player.isLoaded) finish(false);
    else if (polls >= READY_POLLS) finish(true);
  }, 100);
  armed = true;
  finish(false);
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
/** 曲の切り替え中は、効果音の一斉先読みを止める。全部作ると、スマホは新しい曲を捨てる。 */
let preloadHold: Promise<void> = Promise.resolve();

/** 曲を切り替える直前に呼ぶ。戻した関数を、新しい曲を鳴らし始めてから呼ぶ。 */
export function holdSoundPreload(): () => void {
  let release!: () => void;
  preloadHold = new Promise((resolve) => {
    release = resolve;
  });
  return release;
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
    await preloadHold;
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
    if (Platform.OS === 'web' || primed.has(id) || player.isLoaded) {
      if (player.isLoaded || Platform.OS === 'web') primed.add(id);
      pending.delete(id);
      playFromStart(player);
      return;
    }
    watchReady(id, player);
  });
}
