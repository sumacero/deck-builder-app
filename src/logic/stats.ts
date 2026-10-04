import type { CardDefinition } from '../domain/card';
import type { CombatStats } from '../domain/combat';
import type { RunStats } from '../domain/run';
import { baseCardId } from './cards';

export const EMPTY_RUN_STATS: RunStats = {
  maxHit: 0,
  enemiesDefeated: 0,
  downs: 0,
  artes: 0,
  cardsPlayed: {},
  combatsWon: 0,
};

/** 戦闘 1 回分の記録をランの記録に足す。 */
export function mergeStats(run: RunStats, combat: CombatStats, won: boolean): RunStats {
  const cardsPlayed = { ...run.cardsPlayed };
  for (const [id, count] of Object.entries(combat.cardsPlayed)) {
    cardsPlayed[id] = (cardsPlayed[id] ?? 0) + count;
  }
  return {
    maxHit: Math.max(run.maxHit, combat.maxHit),
    enemiesDefeated: run.enemiesDefeated + combat.enemiesDefeated,
    downs: run.downs + combat.downs,
    artes: run.artes + combat.artes,
    cardsPlayed,
    combatsWon: run.combatsWon + (won ? 1 : 0),
  };
}

export type FavoriteCard = { card: CardDefinition; count: number };

/**
 * よく使ったカード（多い順に limit 枚）。ストライク・防御のような基本カードより、
 * デッキの個性が出るよう、candidates（デッキ・秘奥義など）に含まれるカードだけを数える。
 */
export function favoriteCards(
  stats: RunStats,
  candidates: readonly CardDefinition[],
  limit: number,
): FavoriteCard[] {
  const byId = new Map(candidates.map((card) => [baseCardId(card.id), card]));
  return Object.entries(stats.cardsPlayed)
    .flatMap(([id, count]) => {
      const card = byId.get(id);
      return card ? [{ card, count }] : [];
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
