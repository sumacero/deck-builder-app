import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import { getAudioSettings, subscribeAudioSettings } from './audioSettings';
import { outputVolume } from './levels';
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

function playerFor(id: MusicId): AudioPlayer {
  const existing = players.get(id);
  if (existing) return existing;
  const player = createAudioPlayer(MUSIC[id].source);
  player.loop = true;
  players.set(id, player);
  return player;
}

function cancelFade(): void {
  if (fadeTimer) clearInterval(fadeTimer);
  fadeTimer = null;
}

/**
 * 音量を target まで durationMs かけて変える。
 * target が関数のときは、フェードの途中で設定が変わっても、終わりは新しい音量になる。
 */
function fadeTo(
  player: AudioPlayer,
  target: number | (() => number),
  durationMs: number,
  onDone?: () => void,
): void {
  cancelFade();
  const from = player.volume;
  const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
  let step = 0;
  const destination = () => (typeof target === 'function' ? target() : target);
  fadeTimer = setInterval(() => {
    step += 1;
    const to = destination();
    player.volume = from + ((to - from) * step) / steps;
    if (step >= steps) {
      cancelFade();
      player.volume = destination();
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
    players.forEach((player, key) => {
      if (key !== id) player.pause();
    });
    const player = playerFor(id);
    player.volume = 0;
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
  const player = players.get(current);
  current = null;
  if (!player) return;
  fadeTo(player, 0, FADE_OUT_MS, () => player.pause());
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
  if (player) player.volume = musicVolume(current);
});
