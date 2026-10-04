// 合成した波形を 16bit モノラルの WAV にする共通処理。
import { Buffer } from 'node:buffer';

/** 最大振幅を peak にそろえる。fadeLength サンプルぶん末尾をフェードアウトしてプツッと鳴らないようにする。 */
export function normalize(samples, peak, fadeLength = 0) {
  const max = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0) || 1;
  return samples.map((s, i) => {
    const fromEnd = samples.length - 1 - i;
    const fade = fromEnd < fadeLength ? fromEnd / fadeLength : 1;
    return (s / max) * peak * fade;
  });
}

export function toWav(samples, sampleRate) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((s, i) => {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2);
  });
  return buffer;
}
