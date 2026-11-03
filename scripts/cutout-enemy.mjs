// 黒背景の敵イラストを透過 PNG に切り抜き、assets/enemies/ へ書く。
// 実行: node scripts/cutout-enemy.mjs <元画像フォルダ>
//   enemy-<id>.(jpg|png) → assets/enemies/<id>.png（360×480）
import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const WIDTH = 360;
const HEIGHT = 480;
/** これより暗い画素を背景として消す（0〜255 の RGB 合計）。 */
const BLACK_SUM = 45;

const [sourceDir] = process.argv.slice(2);
if (!sourceDir) {
  console.error('使い方: node scripts/cutout-enemy.mjs <元画像のフォルダ>');
  process.exit(1);
}

const outDir = join(ASSETS, 'enemies');
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(sourceDir)) {
  const match = /^enemy-(.+)\.(jpe?g|png)$/i.exec(file);
  if (!match) continue;
  const id = match[1];
  const image = await Jimp.read(join(sourceDir, file));
  await image.cover(WIDTH, HEIGHT);
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (r + g + b <= BLACK_SUM) this.bitmap.data[idx + 3] = 0;
  });
  const out = join(outDir, `${id}.png`);
  await image.writeAsync(out);
  console.log(`wrote ${out}`);
}
