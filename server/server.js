// Local server: serves public/ and the small API. Binds to 127.0.0.1 only.
// It saves nothing; answers are never written to disk or logged.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export function isLive() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relative = urlPath === '/' ? 'index.html' : urlPath.slice(1);
  const filePath = normalize(join(PUBLIC_DIR, relative));
  const type = TYPES[extname(filePath)];
  if (!filePath.startsWith(PUBLIC_DIR) || filePath.endsWith(sep) || !type) {
    res.writeHead(404).end('Not found');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}

export function handler(req, res) {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'GET' && path === '/api/mode') {
    sendJson(res, 200, { mode: isLive() ? 'live' : 'offline' });
    return;
  }
  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405).end('Method not allowed');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer(handler).listen(PORT, HOST, () => {
    console.log(`Before the Shake: http://${HOST}:${PORT} (${isLive() ? 'live' : 'offline'} mode)`);
  });
}
