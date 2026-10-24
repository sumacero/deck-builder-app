import {
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import type { RunState } from '../domain/run';
import { parseSavedRun, serializeRun } from '../logic/savedRun';

const STORAGE_KEY = 'deck-builder-run-v1';
const FILE_NAME = 'run-save.json';

/** 書き込みが前後しても、最後の操作が残るように一直線に並べる。 */
let chain: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): void {
  chain = chain.then(task).catch(() => undefined);
}

function fileUri(): string | null {
  if (!documentDirectory) return null;
  return `${documentDirectory}${FILE_NAME}`;
}

async function writeRaw(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, text);
    return;
  }
  const uri = fileUri();
  if (!uri) return;
  await writeAsStringAsync(uri, text);
}

async function readRaw(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  }
  const uri = fileUri();
  if (!uri) return null;
  const info = await getInfoAsync(uri);
  if (!info.exists) return null;
  return readAsStringAsync(uri);
}

async function removeRaw(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const uri = fileUri();
  if (!uri) return;
  const info = await getInfoAsync(uri);
  if (!info.exists) return;
  await deleteAsync(uri);
}

/** ランの状態が変わるたびに呼ぶ。戦闘の途中の手札は含まず、その戦闘の最初から再開する。 */
export function saveRun(run: RunState): void {
  enqueue(() => writeRaw(serializeRun(run)));
}

/** あきらめたときと、振り返りからタイトルへ戻ったときに消す。 */
export function clearSavedRun(): void {
  enqueue(() => removeRaw());
}

/** 起動時に呼ぶ。書き込みの途中なら、その完了を待ってから読む。 */
export async function loadSavedRun(): Promise<RunState | null> {
  await chain;
  const raw = await readRaw();
  if (!raw) return null;
  return parseSavedRun(raw);
}
