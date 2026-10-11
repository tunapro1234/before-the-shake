// Local server: serves public/ and the small API. Binds to 127.0.0.1 only.
// It saves nothing; answers are never written to disk or logged.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClaude } from './claude.js';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 16 * 1024;
const TASKS = ['followup', 'flags', 'card'];

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size <= MAX_BODY) chunks.push(chunk);
    });
    req.on('end', () => (size > MAX_BODY ? reject(new Error('too_large')) : resolve(Buffer.concat(chunks).toString('utf8'))));
    req.on('error', reject);
  });
}

async function claudeRoute(req, res, { live, getClaude }) {
  if (!live()) {
    sendJson(res, 503, { error: 'offline' });
    return;
  }
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    sendJson(res, err.message === 'too_large' ? 413 : 400, { error: 'bad_request' });
    return;
  }
  if (!body || !TASKS.includes(body.task)) {
    sendJson(res, 400, { error: 'unknown_task' });
    return;
  }
  const out = await getClaude()[body.task](body.payload ?? {});
  const status = out.result ? 200 : out.error === 'bad_request' ? 400 : 502;
  // Only the task name and the status are logged, never the answers.
  console.log(`claude ${body.task} ${status}${out.error ? ` ${out.error}` : ''}`);
  sendJson(res, status, out.result ? { result: out.result } : { error: out.error });
}

// `claude` and `live` can be injected so tests run without a key or a network.
export function createHandler({ claude, live = isLive } = {}) {
  let client = claude;
  const getClaude = () => (client ??= createClaude());
  return function handler(req, res) {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && path === '/api/mode') {
      sendJson(res, 200, { mode: live() ? 'live' : 'offline' });
      return;
    }
    if (req.method === 'POST' && path === '/api/claude') {
      claudeRoute(req, res, { live, getClaude }).catch(() => sendJson(res, 500, { error: 'server' }));
      return;
    }
    if (req.method === 'GET') {
      serveStatic(req, res);
      return;
    }
    res.writeHead(405).end('Method not allowed');
  };
}

export const handler = createHandler();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer(handler).listen(PORT, HOST, () => {
    console.log(`Before the Shake: http://${HOST}:${PORT} (${isLive() ? 'live' : 'offline'} mode)`);
  });
}
