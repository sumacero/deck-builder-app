import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const threeRoot = join(root, '../node_modules/three/build/three.module.js');
const types = { '.html': 'text/html', '.js': 'text/javascript' };

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost').pathname;
  let file = url === '/three' ? threeRoot : join(root, url === '/' ? 'index.html' : url);
  if (!existsSync(file) && existsSync(`${file}.js`)) file = `${file}.js`;
  if (!existsSync(file)) file = join(root, '../node_modules/three/build', url);
  if (!existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'text/plain' });
  res.end(readFileSync(file));
}).listen(5178);
