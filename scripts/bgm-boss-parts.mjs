// 「三つの旗 −試−」をパートごとに切り出した音源（パートの呼び方の確認用、2026-10-05）。
// 音源は part-draft-01〜05.wav。図鑑の一覧 src/audio/partDrafts.ts はこの台本が書き出す。
import { BOSS_AFTER_INTRO, BOSS_BPM, BOSS_MIX, bossIntroSection } from './bgm-boss.mjs';
import { pad2, writeDraftCatalog } from './bgm-melody.mjs';

const [verse, run, build, chorus] = BOSS_AFTER_INTRO;

const PARTS = [
  { no: 1, name: 'A メロ', desc: '−試− の導入のリフ。ギターとオルガン（4 小節）。', section: bossIntroSection() },
  { no: 2, name: 'B メロ', desc: 'ギターの主旋律（8 小節）。', section: verse },
  { no: 3, name: 'C メロ', desc: 'オルガンの駆け上がり（4 小節）。', section: run },
  { no: 4, name: 'ため', desc: 'サビ前。金管の長い音とスネアのロール（4 小節）。', section: build },
  { no: 5, name: 'サビ', desc: '金管の主旋律と低いギター（8 小節）。', section: chorus },
];

export const PART_DRAFTS = PARTS.map((part) => ({
  file: `part-draft-${pad2(part.no)}`,
  bpm: BOSS_BPM,
  mix: BOSS_MIX,
  sections: [part.section],
}));

export const writePartDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'part',
    label: 'パート',
    script: 'scripts/bgm-boss-parts.mjs',
    doc: '三つの旗 −試− をパートごとに切り出した音源（パートの呼び方の確認用）。図鑑で聞くだけで、ゲーム中には流れない。',
    entries: PARTS.map((part) => ({ no: part.no, name: part.name, desc: part.desc, bpm: BOSS_BPM })),
  });
