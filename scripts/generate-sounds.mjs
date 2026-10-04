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

  // ここから下はマップ・休憩所など戦闘の外の音。上の音の波形が変わらないよう、新しい音は末尾に足す。

  /** カード強化: 金床を叩く「カーン」のあと、きらめきが上っていく。 */
  upgrade: () => {
    const partials = [880, 1320, 2210, 3170].map(() => oscillator(sine));
    const sparkle = arpeggio([1568, 2093, 2637, 3136], 0.06, 0.55, triangle, 0.35);
    const sparkleStart = Math.floor(0.16 * SAMPLE_RATE);
    return render(0.75, (t, p) => {
      const ring =
        partials[0](880) * decay(t, 6) +
        partials[1](1320) * 0.7 * decay(t, 8) +
        partials[2](2210) * 0.45 * decay(t, 11) +
        partials[3](3170) * 0.3 * decay(t, 14);
      const strike = noise() * decay(t, 70);
      const index = Math.floor(t * SAMPLE_RATE) - sparkleStart;
      const shimmer = index >= 0 && index < sparkle.length ? sparkle[index] : 0;
      return (ring * 0.55 + strike * 0.7) * decay(p, 1) + shimmer;
    });
  },

  /** HP 回復: やわらかく上がっていく和音に、ゆれを少し。 */
  heal: () => {
    const notes = [523, 659, 784, 1047];
    const oscs = notes.map(() => oscillator(sine));
    const step = 0.08;
    return render(0.9, (t, p) => {
      const vibrato = 1 + 0.004 * Math.sin(2 * Math.PI * 6 * t);
      let sum = 0;
      notes.forEach((note, i) => {
        const start = i * step;
        if (t < start) return;
        const local = t - start;
        const attack = Math.min(1, local / 0.04);
        sum += oscs[i](note * vibrato) * attack * decay(local, 3.2);
      });
      return sum * 0.35 * (1 - p * 0.3);
    });
  },

  /** マップのマスを選ぶ: 「シュッ」と開いて、決定の「ポーン」。 */
  'map-select': () => {
    const lp = lowpass();
    const ping = oscillator(sine);
    const pingStart = 0.07;
    return render(0.42, (t, p) => {
      const sweep = t < 0.12 ? lp(noise(), 0.05 + 0.5 * (t / 0.12)) * Math.sin((Math.PI * t) / 0.12) * 0.6 : 0;
      const tone = t >= pingStart ? ping(t < pingStart + 0.03 ? 660 : 990) * decay(t - pingStart, 7) * 0.7 : 0;
      return (sweep + tone) * (1 - p * 0.2);
    });
  },

  /** ゴールドの出し入れ: コインの「チャリン」（高い 2 音）。 */
  coin: () => arpeggio([1976, 2637], 0.07, 0.32, square, 0.25),

  /** 入手したものがスロットに収まる: 軽い「コトッ」と小さなきらめき。 */
  'slot-in': () => {
    const knock = oscillator(sine);
    const chime = oscillator(triangle);
    return render(0.22, (t) => {
      const body = knock(lerp(520, 260, Math.min(1, t / 0.05))) * decay(t, 40);
      const click = noise() * decay(t, 200) * 0.5;
      const sparkle = t > 0.03 ? chime(2093) * decay(t - 0.03, 18) * 0.35 : 0;
      return body + click + sparkle;
    });
  },
};

// ===== 書き出し =====

mkdirSync(OUT_DIR, { recursive: true });
const fadeLength = Math.floor(FADE_OUT_SECONDS * SAMPLE_RATE);
for (const [name, build] of Object.entries(SOUNDS)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(normalize(build(), PEAK, fadeLength), SAMPLE_RATE));
  console.log(`wrote ${file}`);
}
