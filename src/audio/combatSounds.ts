import type { CombatEvent } from '../domain/combat';
import type { SoundId } from './sounds';

const HEAVY_HIT = 10;

/** 戦闘イベントに対応する効果音。鳴らさないイベントは null。 */
export function soundForEvent(event: CombatEvent): SoundId | null {
  switch (event.kind) {
    case 'cardPlayed':
      return 'cardPlay';
    case 'potionUsed':
      return 'potion';
    case 'relicTriggered':
      return 'relic';
    case 'heal':
      return 'heal';
    case 'enemyAct':
      return null;
    case 'hit':
      if (event.hpLoss === 0) return event.blocked > 0 ? 'guard' : null;
      if (event.target === 'player') return 'playerHurt';
      return event.hpLoss >= HEAVY_HIT ? 'heavyHit' : 'hit';
    case 'blockGain':
      return 'blockGain';
    case 'defeated':
      // 敵が倒れたときは打撃音が鳴っているので重ねない。
      return event.target === 'player' ? 'defeat' : null;
    case 'won':
      return 'victory';
    case 'handFull':
      return 'handFull';
  }
}
