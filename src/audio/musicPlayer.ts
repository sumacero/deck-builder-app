import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { clampPlaybackVolume, outputVolume } from './levels';
import { MUSIC, type MusicId } from './music';
import { configureAudioMode } from './soundPlayer';

const FADE_STEP_MS = 50;
const FADE_IN_MS = 600;
const FADE_OUT_MS = 900;

const players = new Map<MusicId, AudioPlayer>();
/** いま流している（フェードアウト中は含まない）曲。 */
let current: MusicId | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

/** 曲ごとの音量 × 設定（50 で今までどおり）。 */
function musicVolume(id: MusicId): number {
  return outputVolume(MUSIC[id].volume, getAudioSettings().bgm);
}

/** Web は 0〜1 の外で例外になるので、必ず収めてから渡す。 */
function setPlayerVolume(player: AudioPlayer, volume: number): void {
  player.volume = clampPlaybackVolume(volume);
}

function playerFor(id: MusicId): AudioPlayer {
  const existing = players.get(id);
  if (existing) return existing;
  const player = createAudioPlayer(MUSIC[id].source);
  player.loop = true;
  players.set(id, player);
  return player;
}

/** WAV を端末メモリから外す。createAudioPlayer は remove しないと溜まる（Expo の注意）。 */
function disposePlayer(id: MusicId): void {
  const player = players.get(id);
  if (!player) return;
  players.delete(id);
  try {
    player.pause();
    player.remove();
  } catch (error: unknown) {
    console.warn(`BGM ${id} の解放に失敗しました`, error);
  }
}

/** 今流す曲以外のプレイヤーを全部捨てる。章の後半で曲が増えて落ちるのを防ぐ。 */
function disposeOthers(keep: MusicId | null): void {
  for (const id of [...players.keys()]) {
    if (id !== keep) disposePlayer(id);
  }
}

function cancelFade(): void {
  if (fadeTimer) clearInterval(fadeTimer);
  fadeTimer = null;
}

/**
 * 音量を target まで durationMs かけて変える。
 * target が関数のときは、フェードの途中で設定が変わっても、終わりは新しい音量になる。
 * 補間の結果は常に 0〜1 に収め、範囲外セットで Web が例外を投げてタイマーが残るのを防ぐ。
 */
function fadeTo(
  player: AudioPlayer,
  target: number | (() => number),
  durationMs: number,
  onDone?: () => void,
): void {
  cancelFade();
  const from = clampPlaybackVolume(player.volume);
  const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
  let step = 0;
  const destination = () =>
    clampPlaybackVolume(typeof target === 'function' ? target() : target);
  fadeTimer = setInterval(() => {
    step += 1;
    try {
      const to = destination();
      setPlayerVolume(player, from + ((to - from) * step) / steps);
      if (step >= steps) {
        cancelFade();
        setPlayerVolume(player, destination());
        onDone?.();
      }
    } catch (error: unknown) {
      console.warn('BGM のフェードに失敗しました', error);
      cancelFade();
      onDone?.();
    }
  }, FADE_STEP_MS);
}

/** 曲を頭からフェードインで流す。他の曲は止める。BGM の失敗でゲームが止まらないよう例外は警告だけにする。 */
export function playMusic(id: MusicId): void {
  if (current === id) return;
  current = id;
  cancelFade();
  void configureAudioMode().catch((error: unknown) => console.warn('音声モードの設定に失敗しました', error));
  try {
    disposeOthers(id);
    const player = playerFor(id);
    setPlayerVolume(player, 0);
    void player.seekTo(0);
    player.play();
    fadeTo(player, () => musicVolume(id), FADE_IN_MS);
  } catch (error: unknown) {
    console.warn(`BGM ${id} の再生に失敗しました`, error);
  }
}

/**
 * フェードアウトして止める。id を渡すと、その曲が流れているときだけ止める
 * （画面の切り替えで、次の画面が先に流し始めた曲を前の画面が止めてしまわないように）。
 */
export function stopMusic(id?: MusicId): void {
  if (!current || (id && current !== id)) return;
  const stopping = current;
  const player = players.get(stopping);
  current = null;
  if (!player) return;
  fadeTo(player, 0, FADE_OUT_MS, () => disposePlayer(stopping));
}

/** 図鑑で試聴を始める前に流れていた曲。undefined は試聴していない。 */
let beforePreview: MusicId | null | undefined;

/** 図鑑で試聴する（null は試聴を止めて無音にする）。終わったら endPreview で元の曲に戻す。 */
export function previewMusic(id: MusicId | null): void {
  if (beforePreview === undefined) beforePreview = current;
  if (id) playMusic(id);
  else stopMusic();
}

export function endPreview(): void {
  if (beforePreview === undefined) return;
  const back = beforePreview;
  beforePreview = undefined;
  if (back) playMusic(back);
  else stopMusic();
}

/** アプリがバックグラウンドに回ったときに一時停止する。 */
export function pauseMusic(): void {
  if (current) players.get(current)?.pause();
}

export function resumeMusic(): void {
  if (current) players.get(current)?.play();
}

subscribeAudioSettings(() => {
  if (!current || fadeTimer) return;
  const player = players.get(current);
  if (player) setPlayerVolume(player, musicVolume(current));
});
