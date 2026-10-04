/** mulberry32。シードを受け取り、0 以上 1 未満の値と次のシードを返す。 */
export function nextRandom(seed: number): { value: number; seed: number } {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next };
}

/** min 以上 max 以下の整数。 */
export function randomInt(min: number, max: number, seed: number): { value: number; seed: number } {
  const random = nextRandom(seed);
  return { value: min + Math.floor(random.value * (max - min + 1)), seed: random.seed };
}

/** 配列から 1 つ選ぶ。空なら undefined。 */
export function pickOne<T>(items: readonly T[], seed: number): { item: T | undefined; seed: number } {
  const random = nextRandom(seed);
  return { item: items[Math.floor(random.value * items.length)], seed: random.seed };
}

/** Fisher-Yates シャッフル。元の配列は変更しない。 */
export function shuffle<T>(items: readonly T[], seed: number): { items: T[]; seed: number } {
  const result = [...items];
  let currentSeed = seed;
  for (let i = result.length - 1; i > 0; i--) {
    const random = nextRandom(currentSeed);
    currentSeed = random.seed;
    const j = Math.floor(random.value * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return { items: result, seed: currentSeed };
}

export function pickUnique<T>(items: readonly T[], count: number, seed: number): { items: T[]; seed: number } {
  const shuffled = shuffle(items, seed);
  return { items: shuffled.items.slice(0, Math.min(count, shuffled.items.length)), seed: shuffled.seed };
}
