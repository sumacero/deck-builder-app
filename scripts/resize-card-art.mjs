// カードのイラスト（AI 画像生成の card-<カード id>.jpg / .png）を縮小して assets/cards/<カード id>.jpg に書き出す。
// 実行: node scripts/resize-card-art.mjs <元画像のフォルダ>
// 縮小には expo の依存に含まれる jimp-compact を使う（プロジェクトへのパッケージ追加なし）。
import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');

/** カードのイラスト枠は横長（4:3）。手札で 1 枚 64〜110px 幅なので、2〜3 倍の解像度があれば足りる。 */
const WIDTH = 320;
const HEIGHT = 240;
const QUALITY = 78;

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('使い方: node scripts/resize-card-art.mjs <元画像のフォルダ>');
  process.exit(1);
}
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'cards');
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(sourceDir)) {
  const match = /^card-(.+)\.(jpe?g|png)$/i.exec(file);
  if (!match) continue;
  const id = match[1];
  const image = await Jimp.read(join(sourceDir, file));
  const out = join(outDir, `${id}.jpg`);
  await image.cover(WIDTH, HEIGHT).quality(QUALITY).writeAsync(out);
  console.log(`wrote ${out}`);
}

