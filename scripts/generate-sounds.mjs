// 効果音を波形から合成して assets/sounds/*.wav に書き出す。
// 実行: npm run sounds
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, toWav } from './wav.mjs';

const SAMPLE_RATE = 22050;
const PEAK = 0.7;
const FADE_OUT_SECONDS = 0.008;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

// ===== 波形の部品 =====

let noiseSeed = 12345;
/** 毎回同じ音になるよう、シード固定の疑似乱数ノイズにする。 */
const noise = () => {
  noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff;
  return noiseSeed / 0x3fffffff - 1;
};

const sine = (phase) => Math.sin(2 * Math.PI * phase);
const square = (phase) => (phase % 1 < 0.5 ? 1 : -1);
const triangle = (phase) => 1 - 4 * Math.abs((phase % 1) - 0.5);

/** 周波数を毎サンプル変えても途切れないよう、位相を積み上げる発振器。 */
const oscillator = (wave) => {
  let phase = 0;
  return (frequency) => {
    phase += frequency / SAMPLE_RATE;
    return wave(phase);
  };
};

/** 1 次のローパスフィルタ。alpha が小さいほどこもった音になる。 */
const lowpass = () => {
  let y = 0;
  return (x, alpha) => (y += alpha * (x - y));
};

const lerp = (a, b, p) => a + (b - a) * p;
const decay = (p, k) => Math.exp(-k * p);

/** duration 秒の音を、sample(経過秒, 進行率 0〜1) で 1 サンプルずつ作る。 */
function render(duration, sample) {
  const length = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = sample(i / SAMPLE_RATE, i / length);
  return out;
}

/** 音程の並び（アルペジオ）。notes を step 秒ずつ鳴らし、最後の音を伸ばす。 */
function arpeggio(notes, step, duration, wave, volume) {
  const osc = oscillator(wave);
  return render(duration, (t) => {
    const index = Math.min(notes.length - 1, Math.floor(t / step));
    const local = t - index * step;
    const isLast = index === notes.length - 1;
    const env = isLast ? decay(local / (duration - index * step), 3) : decay(local / step, 1.5);
    return osc(notes[index]) * env * volume;
  });
}

// ===== 効果音 =====

const SOUNDS = {
  /** カードを出す: こもったノイズが開いて閉じる「シュッ」。 */
  'card-play': () => {
    const lp = lowpass();
    return render(0.14, (_t, p) => lp(noise(), 0.04 + 0.4 * Math.sin(Math.PI * p)) * Math.sin(Math.PI * p));
  },

  /** 攻撃が当たる: 低い打撃音とノイズの「ドッ」。 */
  hit: () => {
    const thump = oscillator(sine);
    const lp = lowpass();
    return render(0.16, (_t, p) => thump(lerp(170, 50, p)) * decay(p, 6) + lp(noise(), 0.5) * 0.8 * decay(p, 14));
  },

  /** 大ダメージ: さらに低く長く、歪ませた「ドゴッ」。 */
  'heavy-hit': () => {
    const thump = oscillator(sine);
    const grit = oscillator(square);
    const lp = lowpass();
    return render(0.32, (_t, p) => {
      const body = thump(lerp(130, 32, p)) * decay(p, 4) + grit(lerp(65, 30, p)) * 0.25 * decay(p, 8);
      return Math.tanh((body + lp(noise(), 0.35) * decay(p, 9)) * 2);
    });
  },

  /** ブロックで防ぎきる: 金属を叩いたような「キンッ」。 */
  guard: () => {
    const partials = [1250, 1870, 2630].map(() => oscillator(sine));
    return render(0.32, (_t, p) => {
      const ring =
        partials[0](1250) * decay(p, 5) +
        partials[1](1870) * 0.6 * decay(p, 7) +
        partials[2](2630) * 0.4 * decay(p, 9);
      return ring * 0.6 + noise() * decay(p, 60) * 0.6;
    });
  },

  /** ブロックを得る: 上がっていく短い電子音。 */
  'block-gain': () => arpeggio([523, 784, 1047], 0.05, 0.2, square, 0.35),

  /** 自分が被弾: 下がっていく音とノイズ。 */
  'player-hurt': () => {
    const tone = oscillator(square);
    const lp = lowpass();
    return render(0.26, (_t, p) => (tone(lerp(420, 130, p)) * 0.4 + lp(noise(), 0.45) * 0.6 * decay(p, 8)) * decay(p, 3));
  },

  /** ポーションを飲む: 泡が 3 回はじける「ポコポコ」。 */
  potion: () => {
    const osc = oscillator(sine);
    const bubble = 0.09;
    return render(0.27, (t) => {
      const index = Math.floor(t / bubble);
      const local = (t - index * bubble) / bubble;
      return osc(lerp(300 + index * 120, 900 + index * 150, local)) * decay(local, 5) * 0.8;
    });
  },

  /** レリック発動: きらめく高い音。 */
  relic: () => arpeggio([1047, 1319, 1568, 2093], 0.045, 0.4, triangle, 0.6),

  /** 勝利: ド・ミ・ソ・ドのファンファーレ。 */
  victory: () => arpeggio([523, 659, 784, 1047], 0.11, 0.8, square, 0.3),

  /** 敗北: ゆっくり下がっていく暗い音。 */
  defeat: () => arpeggio([392, 330, 262, 196], 0.22, 1.1, triangle, 0.7),
};

// ===== 書き出し =====

mkdirSync(OUT_DIR, { recursive: true });
const fadeLength = Math.floor(FADE_OUT_SECONDS * SAMPLE_RATE);
for (const [name, build] of Object.entries(SOUNDS)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(normalize(build(), PEAK, fadeLength), SAMPLE_RATE));
  console.log(`wrote ${file}`);
}
