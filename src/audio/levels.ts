import { OUTPUT_GAIN } from './gain';

/** 設定画面の 50。この値のとき、各音源の音量に全体の倍率 OUTPUT_GAIN をかけた音量で鳴る。 */
export const DEFAULT_VOLUME_LEVEL = 50;
export const MIN_VOLUME_LEVEL = 0;
export const MAX_VOLUME_LEVEL = 100;

/** スライダーの値を 0〜100 の整数に収める。 */
export function clampVolumeLevel(level: number): number {
  if (!Number.isFinite(level)) return DEFAULT_VOLUME_LEVEL;
  return Math.min(MAX_VOLUME_LEVEL, Math.max(MIN_VOLUME_LEVEL, Math.round(level)));
}

/**
 * 50 で 1 倍（今の音量）、0 で無音、100 で 2 倍。
 * 効果音どうし・BGM どうしのバランスは、各音源の volume のまま保つ。
 */
export function volumeGain(level: number): number {
  return clampVolumeLevel(level) / DEFAULT_VOLUME_LEVEL;
}

/**
 * 実際にプレイヤーへ渡す音量（全体の倍率 OUTPUT_GAIN もかける）。
 * expo-audio は 1 を超えると例外になるので、そこで頭打ちにする。
 */
export function outputVolume(base: number, level: number): number {
  return Math.min(1, Math.max(0, base * OUTPUT_GAIN * volumeGain(level)));
}
