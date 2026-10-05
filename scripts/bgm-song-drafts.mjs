// タイトル曲の候補探し 第 6 弾（2026-10-05）: 選んだパートを組み合わせた「三つの旗 −試−」の改訂版。
// オーナー: イントロは【イントロ案 26】速まる足音と【イントロ案 29】サビの予告の要素を取り入れる。B メロは【B メロ案 13】五度圏を巡る。
// 今の −試−（battle-boss.wav）とほかの曲が引用している素材は変えず、聞き比べ用の試作として作る。
// 音源は song-draft-01.wav。図鑑の一覧 src/audio/songDrafts.ts はこの台本が書き出す。
import { BOSS_AFTER_INTRO, BOSS_BPM, BOSS_MIX, bossIntroSection } from './bgm-boss.mjs';
import { pad2, writeDraftCatalog } from './bgm-melody.mjs';
import { runDraftSection } from './bgm-run-drafts.mjs';
import { join4 } from './bgm-song.mjs';

const [verse, , build, chorus] = BOSS_AFTER_INTRO;

/**
 * イントロ: サビ頭の「レー・ドー・シ♭」の形（案 29）を、小節ごとに倍の速さにしていく（案 26）。
 * 1 小節目は倍の長さでゆったり → 2 小節目は元の速さで 2 回 → 3 小節目は 8 分 → 4 小節目は 16 分で A メロへ駆け込む。
 */
const INTRO = {
  chords: ['Bb', 'C Dm', 'Gm C', 'A'],
  organShift: 0,
  notes: join4(
    'D6:1.5 C6:1.5 Bb5:1',
    'E6:0.75 D6:0.75 C6:0.5 F6:0.75 E6:0.75 D6:0.5',
    'D6:0.5 C6:0.5 Bb5:0.5 G5:0.5 E6:0.5 D6:0.5 C6:0.5 G5:0.5',
    'F6:0.25 E6:0.25 D6:0.25 C#6:0.25 E6:0.25 D6:0.25 C#6:0.25 A5:0.25 E5:1 C#5:1',
  ),
};

const SONGS = [
  {
    no: 1,
    name: '三つの旗 −試− 改',
    desc: 'イントロはサビ頭の形が小節ごとに速くなる（案 26 + 29）。B メロは 8 小節の五度圏を巡る（案 13）。A メロ・ため・サビは今のまま。',
    sections: [bossIntroSection(INTRO), verse, runDraftSection(13), build, chorus],
  },
];

export const SONG_DRAFTS = SONGS.map((song) => ({ file: `song-draft-${pad2(song.no)}`, bpm: BOSS_BPM, mix: BOSS_MIX, sections: song.sections }));

export const writeSongDraftCatalog = (path) =>
  writeDraftCatalog(path, {
    kind: 'song',
    label: '試作',
    script: 'scripts/bgm-song-drafts.mjs',
    doc: 'タイトル曲の候補探し 第 6 弾: 選んだパートを組み合わせた三つの旗 −試− の改訂版。図鑑で聞き比べるだけで、ゲーム中には流れない。',
    entries: SONGS.map((song) => ({ no: song.no, name: song.name, desc: song.desc, bpm: BOSS_BPM })),
  });
