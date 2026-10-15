// 本地预览 dist 的最小静态服务器：无尾斜杠 URL、目录 index、404 回落。
// 仅用于人工验收（开发文档 8.2），不作为生产托管方案。
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import process from 'node:process';

const root = resolve('dist');
const port = Number(process.env.PORT ?? 4321);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = join(root, decoded);
  if (target !== root && !target.startsWith(root + sep)) return null;
  return target;
}

function candidates(urlPath) {
  const base = safeJoin(urlPath);
  if (!base) return [];
  const list = [];
  if (urlPath === '/' ) list.push(join(base, 'index.html'));
  if (existsSync(base) && statSync(base).isFile()) list.push(base);
  list.push(`${base}.html`, join(base, 'index.html'));
  return list.filter((p) => existsSync(p) && statSync(p).isFile());
}

const server = createServer((req, res) => {
  const hits = candidates(req.url ?? '/');
  const file = hits[0] ?? (existsSync(join(root, '404.html')) ? join(root, '404.html') : null);
  if (!file) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(file.includes('404.html') ? 404 : 200, {
    'content-type': types[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`serving ${root} at http://localhost:${port}`);
});
