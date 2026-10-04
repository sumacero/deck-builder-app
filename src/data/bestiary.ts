import type { EnemyDefinition } from '../domain/enemy';
import * as ENEMIES from './enemies';

/** 定義されているすべての敵（`enemies.ts` に書いた順）。図鑑で使う。 */
export const ALL_ENEMIES: EnemyDefinition[] = Object.values(ENEMIES).filter(
  // バンドラーがモジュールに付ける補助的なプロパティを除く。
  (value: unknown): value is EnemyDefinition =>
    typeof value === 'object' && value !== null && 'moves' in value,
);
