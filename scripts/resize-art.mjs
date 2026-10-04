// AI 画像生成で作った絵を、アプリに入れる大きさに縮小して assets/ に書き出す。
// 実行: node scripts/resize-art.mjs <元画像のフォルダ> [ファイル名の接頭辞]
//   <接頭辞>card-<カード id>.(jpg|png)         → assets/cards/<カード id>.jpg（320×240）
//   <接頭辞>bg-<map|combat>-<章>.(jpg|png)    → assets/backgrounds/<map|combat>-<章>.jpg（720×1280）
// 縮小には expo の依存に含まれる jimp-compact を使う（プロジェクトへのパッケージ追加なし）。
import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

/** 種類ごとの書き出し先と大きさ。カードの絵は手札で 1 枚 64〜110px 幅なので、2〜3 倍の解像度があれば足りる。 */
const KINDS = [
  { tag: 'card-', dir: 'cards', width: 320, height: 240, quality: 80 },
  { tag: 'bg-', dir: 'backgrounds', width: 720, height: 1280, quality: 82 },
];

const [sourceDir, prefix = ''] = process.argv.slice(2);
if (!sourceDir) {
  console.error('使い方: node scripts/resize-art.mjs <元画像のフォルダ> [ファイル名の接頭辞]');
  process.exit(1);
}

for (const file of readdirSync(sourceDir)) {
  const match = /^(.+)\.(jpe?g|png)$/i.exec(file);
  if (!match || !match[1].startsWith(prefix)) continue;
  const name = match[1].slice(prefix.length);
  const kind = KINDS.find((k) => name.startsWith(k.tag));
  if (!kind) continue;
  const outDir = join(ASSETS, kind.dir);
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${name.slice(kind.tag.length)}.jpg`);
  const image = await Jimp.read(join(sourceDir, file));
  await image.cover(kind.width, kind.height).quality(kind.quality).writeAsync(out);
  console.log(`wrote ${out}`);
}
