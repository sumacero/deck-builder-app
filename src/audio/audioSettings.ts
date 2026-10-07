import { clampVolumeLevel, DEFAULT_VOLUME_LEVEL } from './levels';

/** 音量の設定。50 が標準（今までの音量）。 */
export type AudioSettings = {
  bgm: number;
  se: number;
};

const STORAGE_KEY = 'deck-builder.audio';

const DEFAULTS: AudioSettings = {
  bgm: DEFAULT_VOLUME_LEVEL,
  se: DEFAULT_VOLUME_LEVEL,
};

type Listener = () => void;

function isLevel(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parse(raw: string): AudioSettings | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const record = parsed as { bgm?: unknown; se?: unknown };
  if (!isLevel(record.bgm) || !isLevel(record.se)) return null;
  return { bgm: clampVolumeLevel(record.bgm), se: clampVolumeLevel(record.se) };
}

/** ブラウザでは前回の値を読む。無い環境では標準のまま。 */
function readStored(): AudioSettings {
  try {
    if (typeof localStorage === 'undefined') return DEFAULTS;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULTS;
    return parse(raw) ?? DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function writeStored(next: AudioSettings): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 保存に失敗しても、今の起動中はメモリ上の設定を使う。
  }
}

let settings: AudioSettings = readStored();
const listeners = new Set<Listener>();

function commit(next: AudioSettings): void {
  settings = next;
  writeStored(next);
  listeners.forEach((listener) => listener());
}

export function getAudioSettings(): AudioSettings {
  return settings;
}

export function setBgmLevel(level: number): void {
  const bgm = clampVolumeLevel(level);
  if (bgm === settings.bgm) return;
  commit({ ...settings, bgm });
}

export function setSeLevel(level: number): void {
  const se = clampVolumeLevel(level);
  if (se === settings.se) return;
  commit({ ...settings, se });
}

/** 音量が変わったときに再生中の音へ反映するための購読。Laravel のイベント購読に近い。 */
export function subscribeAudioSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
