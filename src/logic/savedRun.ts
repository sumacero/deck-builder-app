import type { CardDefinition } from '../domain/card';
import type { RunState } from '../domain/run';
import { ALL_CARDS } from '../data/catalog';
import { baseCardId, growCard, upgradeCard } from './cards';

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

/**
 * 印が付いて保存された水札を、今のカード定義に戻す。
 * ストライクなど印の無かった札は、属性や成長をそのまま残す。
 */
function migrateCard(card: CardDefinition): CardDefinition {
  const saved = card as CardDefinition & { mark?: unknown };
  const latest = ALL_CARDS.find((item) => item.id === baseCardId(saved.id));
  if (!latest?.water) {
    if (!('mark' in saved)) return card;
    const { mark: _mark, ...rest } = saved;
    return rest;
  }
  let next = saved.upgraded || saved.id.endsWith('+') ? upgradeCard(latest) : latest;
  const times = saved.timesGrown ?? 0;
  for (let i = 0; i < times; i += 1) next = growCard(next);
  return next;
}

function migrateCards(run: RunState): RunState {
  const deck = run.deck.map(migrateCard);
  const rewardPool = run.rewardPool.map(migrateCard);
  if (run.phase.kind === 'reward') {
    return { ...run, deck, rewardPool, phase: { ...run.phase, choices: run.phase.choices.map(migrateCard) } };
  }
  if (run.phase.kind === 'shop') {
    return {
      ...run,
      deck,
      rewardPool,
      phase: {
        ...run.phase,
        stock: {
          ...run.phase.stock,
          cards: run.phase.stock.cards.map((offer) => ({ ...offer, item: migrateCard(offer.item) })),
        },
      },
    };
  }
  return { ...run, deck, rewardPool };
}

/**
 * 報酬画面にポーションの 3 択を足す前のセーブは、カードだけ選んで進める。
 * 取り消せないフラグが無い古いセーブは、これまでどおり受け取らずに進める。
 * 印を書いている途中のセーブは、その画面を閉じてマップへ戻す。
 */
function withRewardDefaults(run: RunState): RunState {
  const migrated = migrateCards(run);
  if (migrated.phase.kind === 'reward') {
    return {
      ...migrated,
      phase: {
        ...migrated.phase,
        step: migrated.phase.step === 'potion' ? 'potion' : 'card',
        potionChoices: Array.isArray(migrated.phase.potionChoices) ? migrated.phase.potionChoices : [],
        canSkip: migrated.phase.canSkip !== false,
      },
    };
  }
  if (migrated.phase.kind === 'deckEdit') {
    return { ...migrated, phase: { ...migrated.phase, cancellable: migrated.phase.cancellable !== false } };
  }
  return migrated;
}

/** 印の書き換え画面はもう無い。読み込んだらマップ（結末が残っていればそこ）へ戻す。 */
function scrubRetiredPhase(phase: unknown): unknown {
  if (!isRecord(phase) || phase.kind !== 'deckEdit' || phase.mode !== 'remark') return phase;
  return isRecord(phase.resume) ? phase.resume : { kind: 'map' };
}

export function parseSavedRun(raw: string): RunState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== SAVE_VERSION) return null;
    if (isRecord(parsed.run)) parsed.run.phase = scrubRetiredPhase(parsed.run.phase);
    return isRunState(parsed.run) ? withRewardDefaults(parsed.run) : null;
  } catch {
    return null;
  }
}
