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

  /** 手札がいっぱいで引けない: こもった低い「ブブッ」（できない操作の合図）。 */
  'hand-full': () => {
    const buzz = oscillator(square);
    const lp = lowpass();
    const pulse = 0.09;
    const gap = 0.04;
    return render(0.24, (t) => {
      const index = Math.floor(t / (pulse + gap));
      const local = t - index * (pulse + gap);
      if (index > 1 || local > pulse) return lp(0, 0.2);
      const env = Math.min(1, local / 0.008) * decay(local / pulse, 2.5);
      return lp(buzz(index === 0 ? 196 : 165) * env, 0.2);
    });
  },

  /**
   * 手札を重ねる: 二筋の水流が交差して一つになる。
   * 音程はスマホのスピーカーが出せる帯（おおよそ 600〜1800Hz）に置く。
   * こもったノイズだけにすると、PC のスピーカーでは聞こえても端末では BGM に埋もれる。
   */
  fuse: () => {
    const rise = oscillator(sine);
    const fall = oscillator(sine);
    const bubble = oscillator(sine);
    const air = lowpass();
    return render(0.5, (t, p) => {
      const env = Math.sin(Math.PI * p);
      const up = rise(lerp(640, 1580, p)) * 0.62;
      const down = fall(lerp(1720, 760, p)) * 0.55;
      const whoosh = air(noise(), 0.4) * 0.18 * env;
      let pop = 0;
      for (const at of [0.22, 0.38, 0.5]) {
        const local = (t - at) / 0.07;
        if (local < 0 || local > 1) continue;
        pop += bubble(lerp(980, 1680, local)) * Math.sin(Math.PI * local) * decay(local, 2.4) * 0.5;
      }
      return (up + down) * env + whoosh + pop;
    });
  },

  // ここから下へ足す。途中に入れると、あとの音が使うノイズの並びがずれて、既存の波形が変わる。

  /** 祠の鈴。 */
  'shrine-bell': () => arpeggio([784, 1175, 1568], 0.11, 0.62, triangle, 0.42),
  /** 泉の水面。 */
  'spring-water': () => {
    const flow = oscillator(sine);
    const drop = oscillator(sine);
    const air = lowpass();
    return render(0.7, (t, p) => {
      const env = Math.sin(Math.PI * p);
      let pops = 0;
      for (const at of [0.12, 0.28, 0.46]) {
        const local = (t - at) / 0.08;
        if (local < 0 || local > 1) continue;
        pops += drop(lerp(980, 1560, local)) * Math.sin(Math.PI * local) * 0.45;
      }
      return flow(lerp(620, 980, p)) * 0.35 * env + air(noise(), 0.25) * 0.12 * env + pops;
    });
  },
  /** 店の呼び鈴。 */
  'shop-bell': () => arpeggio([1046, 1568], 0.08, 0.42, triangle, 0.4),
  /** 鍛冶の槌。スマホでも聞こえるよう、低い打撃に高い金属音を足す。 */
  'forge-hammer': () => {
    const metal = oscillator(triangle);
    const hit = oscillator(sine);
    return render(0.42, (t) => {
      const first = t < 0.16 ? hit(lerp(240, 120, t / 0.16)) * decay(t / 0.16, 4) : 0;
      const secondAt = t - 0.18;
      const second = secondAt > 0 && secondAt < 0.2 ? hit(lerp(280, 140, secondAt / 0.2)) * decay(secondAt / 0.2, 4) : 0;
      const ring = metal(t < 0.18 ? 880 : 1175) * decay(t, 6) * 0.45;
      return (first + second) * 0.7 + ring;
    });
  },
  /** 寝息。 */
  snore: () => {
    const breath = oscillator(sine);
    const air = lowpass();
    return render(0.9, (t, p) => {
      const swell = Math.sin(Math.PI * p);
      return breath(lerp(180, 260, swell)) * 0.25 * swell + air(noise(), 0.08) * 0.2 * swell;
    });
  },
  /** 吟遊詩人の弦。 */
  'bard-strings': () => arpeggio([659, 880, 1175, 1568], 0.12, 0.7, triangle, 0.32),
  /** 本のページ。 */
  'tome-pages': () => {
    const lp = lowpass();
    return render(0.45, (t) => {
      const burst = (at) => {
        const local = t - at;
        if (local < 0 || local > 0.08) return 0;
        return lp(noise(), 0.35) * decay(local / 0.08, 3);
      };
      return burst(0.02) + burst(0.14) + burst(0.28);
    });
  },
  /** 祭壇の低い唸り。 */
  'altar-hum': () => {
    const low = oscillator(sine);
    const high = oscillator(triangle);
    return render(0.7, (_t, p) => (low(440) * 0.35 + high(880) * 0.4) * Math.sin(Math.PI * p));
  },
  /** 落とし穴の土。 */
  'pit-rubble': () => {
    const lp = lowpass();
    const thump = oscillator(sine);
    return render(0.4, (t, p) => thump(lerp(200, 90, p)) * decay(p, 5) * 0.6 + lp(noise(), 0.4) * decay(p, 8));
  },
  /** 妖精の鈴。 */
  'fairy-chime': () => arpeggio([1318, 1568, 1976], 0.07, 0.4, triangle, 0.28),
  /** 焚き火。 */
  campfire: () => {
    const lp = lowpass();
    const glow = oscillator(sine);
    return render(0.8, (t, p) => glow(420 + 40 * sine(t * 6)) * 0.15 + lp(noise(), 0.12 + 0.2 * Math.sin(Math.PI * p)) * 0.35);
  },
  /** 竜の寝息。 */
  'dragon-rumble': () => {
    const body = oscillator(sine);
    const grit = lowpass();
    return render(0.8, (_t, p) => (body(lerp(140, 90, p)) * 0.55 + grit(noise(), 0.15) * 0.3) * Math.sin(Math.PI * p));
  },
  /** 湖面。 */
  'lake-ripple': () => {
    const wave = oscillator(sine);
    return render(0.7, (_t, p) => wave(lerp(620, 880, Math.sin(Math.PI * p))) * Math.sin(Math.PI * p) * 0.5);
  },
  /** 騎士の鋼。 */
  'knight-steel': () => arpeggio([880, 1318], 0.06, 0.36, triangle, 0.4),
  /** 井戸に落ちる硬貨。 */
  'well-drop': () => {
    const plink = oscillator(triangle);
    const splash = lowpass();
    return render(0.45, (t) => {
      const coin = t < 0.12 ? plink(1480) * decay(t / 0.12, 3) : 0;
      const local = t - 0.16;
      const water = local > 0 ? splash(noise(), 0.3) * decay(local, 8) * 0.7 : 0;
      return coin * 0.5 + water;
    });
  },
  /** 書庫のページ。本より静か。 */
  'library-pages': () => {
    const lp = lowpass();
    return render(0.5, (t) => {
      const rustle = (at) => {
        const local = t - at;
        if (local < 0 || local > 0.12) return 0;
        return lp(noise(), 0.2) * Math.sin(Math.PI * (local / 0.12)) * 0.6;
      };
      return rustle(0.04) + rustle(0.2);
    });
  },
  /** 小瓶。 */
  'vial-clink': () => arpeggio([1480, 1760], 0.05, 0.28, triangle, 0.3),
  /** 木のきしみ。 */
  'tree-creak': () => {
    const creak = oscillator(triangle);
    return render(0.55, (_t, p) => creak(lerp(280, 720, Math.sin(Math.PI * p))) * Math.sin(Math.PI * p) * 0.45);
  },
  /** 道端の石。 */
  'stone-chime': () => arpeggio([988, 1318], 0.1, 0.48, triangle, 0.36),
  /** 聖櫃の錠。 */
  'reliquary-lock': () => {
    const click = oscillator(square);
    const lp = lowpass();
    return render(0.36, (t) => {
      const tick = (at, freq) => {
        const local = t - at;
        if (local < 0 || local > 0.05) return 0;
        return lp(click(freq), 0.25) * decay(local / 0.05, 2);
      };
      return tick(0.02, 740) * 0.4 + tick(0.12, 980) * 0.45 + tick(0.24, 620) * 0.35;
    });
  },
  /** 旗の布。 */
  'banner-cloth': () => {
    const lp = lowpass();
    return render(0.55, (_t, p) => lp(noise(), 0.08 + 0.15 * Math.sin(Math.PI * p)) * Math.sin(Math.PI * p));
  },
  /** 奈落の風。 */
  'whisper-wind': () => {
    const lp = lowpass();
    const tone = oscillator(sine);
    return render(0.7, (_t, p) => (lp(noise(), 0.06) * 0.55 + tone(740) * 0.12) * Math.sin(Math.PI * p));
  },
  /** 王冠の金属。 */
  'crown-metal': () => arpeggio([740, 1108, 1480], 0.09, 0.5, triangle, 0.34),
  /** 素振り。 */
  'practice-slash': () => {
    const lp = lowpass();
    const edge = oscillator(sine);
    return render(0.22, (_t, p) => lp(noise(), 0.15 + 0.5 * p) * Math.sin(Math.PI * p) + edge(lerp(700, 1600, p)) * Math.sin(Math.PI * p) * 0.35);
  },
  /** 弓弦。 */
  'bow-string': () => {
    const string = oscillator(triangle);
    return render(0.28, (t, p) => string(lerp(220, 880, Math.min(1, t / 0.04))) * decay(p, 5) * 0.6);
  },
  /** 水滴。 */
  'water-drop': () => {
    const drop = oscillator(sine);
    return render(0.28, (_t, p) => drop(lerp(1500, 900, p)) * Math.sin(Math.PI * p) * decay(p, 2));
  },
  /** 宝箱の蓋。 */
  'chest-open': () => {
    const lp = lowpass();
    const chime = oscillator(triangle);
    return render(0.5, (t, p) => {
      const creak = t < 0.28 ? lp(noise(), 0.18) * Math.sin(Math.PI * (t / 0.28)) : 0;
      const ring = t > 0.22 ? chime(660) * decay(t - 0.22, 6) * 0.4 : 0;
      return creak + ring * (1 - p * 0.2);
    });
  },
  /** 案内役の灯。 */
  'lantern-chime': () => arpeggio([1175, 1568], 0.1, 0.5, triangle, 0.32),
  /** カードを別のカードに換える。二筋が交差して入れ替わる。 */
  exchange: () => {
    const from = oscillator(sine);
    const to = oscillator(sine);
    return render(0.42, (_t, p) => (from(lerp(720, 1400, p)) * 0.45 + to(lerp(1500, 680, p)) * 0.45) * Math.sin(Math.PI * p));
  },
  'voice-merchant': voice(150, 700, 1180),
  'voice-smith': voice(120, 620, 1040, 0.42),
  'voice-guardian': voice(95, 520, 860, 0.7),
  'voice-bard': voice(210, 820, 1400, 0.55),
  'voice-fairy': voice(300, 1100, 1620, 0.4),
  'voice-knight': voice(130, 660, 1120, 0.45),
  'voice-alchemist': voice(185, 760, 1320, 0.48),
  'voice-fortune': voice(165, 700, 1260, 0.58),
  'voice-whisper': voice(200, 900, 1480, 0.62),
  'voice-kyle': voice(155, 690, 1200, 0.4),
  'voice-rine': voice(235, 860, 1460, 0.4),
  'voice-noah': voice(190, 780, 1360, 0.46),
  'voice-guide': voice(170, 730, 1280, 0.55),
};

/** 短い声。基本周波数と二つの倍音を、スマホのスピーカーが出せる帯に置く。ノイズは使わない。 */
function voice(f0, f1, f2, seconds = 0.48) {
  return () => {
    const fundamental = oscillator(sine);
    const formant = oscillator(triangle);
    const high = oscillator(sine);
    return render(seconds, (t, p) => {
      const env = Math.sin(Math.PI * p) * decay(p, 1.3);
      const vibrato = 1 + 0.02 * sine(t * 5);
      return (fundamental(f0 * vibrato) * 0.36 + formant(f1) * 0.4 + high(f2) * 0.22) * env;
    });
  };
}

// ===== 書き出し =====

mkdirSync(OUT_DIR, { recursive: true });
const fadeLength = Math.floor(FADE_OUT_SECONDS * SAMPLE_RATE);
for (const [name, build] of Object.entries(SOUNDS)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(normalize(build(), PEAK, fadeLength), SAMPLE_RATE));
  console.log(`wrote ${file}`);
}
