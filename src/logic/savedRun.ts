import type { RunState } from '../domain/run';

/** セーブの形を変えたら上げる。合わないセーブは読み捨てる。 */
export const SAVE_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** 画面がすぐ読む項目だけ確かめる。壊れたセーブで起動時に落ちないようにする。 */
function isPhase(value: unknown): boolean {
  if (!isRecord(value) || typeof value.kind !== 'string') return false;
  switch (value.kind) {
    case 'blessing':
      return Array.isArray(value.options);
    case 'deckEdit':
      return value.mode === 'upgrade' || value.mode === 'remove' || value.mode === 'remark';
    case 'reward':
      return Array.isArray(value.choices) && typeof value.gold === 'number';
    case 'bossRelic':
      return Array.isArray(value.choices);
    case 'combat':
      return isRecord(value.encounter) && typeof value.nodeId === 'string' && typeof value.seed === 'number';
    case 'shop':
      return isRecord(value.stock);
    case 'event':
      return isRecord(value.event) && (typeof value.outcome === 'string' || value.outcome === null);
    case 'treasure':
      return typeof value.opened === 'boolean';
    case 'map':
    case 'finale':
    case 'rest':
    case 'gameOver':
    case 'cleared':
      return true;
    default:
      return false;
  }
}

function isRunState(value: unknown): value is RunState {
  if (!isRecord(value) || !isPhase(value.phase)) return false;
  const player = value.player;
  const agent = value.agent;
  return (
    Array.isArray(value.acts) &&
    value.acts.length > 0 &&
    typeof value.actIndex === 'number' &&
    value.actIndex >= 0 &&
    value.actIndex < value.acts.length &&
    isRecord(value.map) &&
    isRecord(agent) &&
    typeof agent.id === 'string' &&
    isRecord(player) &&
    typeof player.hp === 'number' &&
    typeof player.maxHp === 'number' &&
    typeof value.gold === 'number' &&
    Array.isArray(value.deck) &&
    Array.isArray(value.relics) &&
    Array.isArray(value.potions) &&
    typeof value.energyPerTurn === 'number' &&
    typeof value.drawPerTurn === 'number' &&
    Array.isArray(value.rewardPool) &&
    typeof value.rngSeed === 'number' &&
    isRecord(value.stats)
  );
}

export function serializeRun(run: RunState): string {
  return JSON.stringify({ version: SAVE_VERSION, run });
}

/** 版が違う、または中身が足りない文字列は null。 */
export function parseSavedRun(raw: string): RunState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== SAVE_VERSION) return null;
    return isRunState(parsed.run) ? parsed.run : null;
  } catch {
    return null;
  }
}
