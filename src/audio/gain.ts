/**
 * 効果音と BGM の両方にかける全体の音量。
 * 各効果音の volume と SOUND_MASTER_VOLUME、各曲の volume は比率のままなので、バランスは変わらない。
 */
export const OUTPUT_GAIN = 2;

/**
 * 再生する音量。expo-audio は 0〜1 で、1 を超えるとブラウザでは例外になる。
 * いちばん大きい効果音（大ダメージ）だけ、2 倍が 1 をわずかに超えるので 1 で止まる。
 */
export const outputVolume = (mix: number) => Math.min(1, mix * OUTPUT_GAIN);
