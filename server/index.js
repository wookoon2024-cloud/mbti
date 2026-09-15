import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractSpeakers, analyzePerson } from './analyze.js';
import { ApiError } from './commandcode.js';
import { MODELS, DEFAULT_MODEL, resolveModel } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

function serverApiKey() {
  return process.env.COMMANDCODE_API_KEY || process.env.CMD_API_KEY || '';
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new ApiError('요청 본문이 너무 큽니다.', 413, 'payload_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new ApiError('요청 본문이 올바른 JSON 이 아닙니다.', 400, 'bad_json_body'));
      }
    });
    req.on('error', reject);
  });
}

async function readRequest(req) {
  const body = await readBody(req);
  const apiKey = String(body.apiKey ?? '').trim() || serverApiKey();

  if (!apiKey) {
    throw new ApiError('API 키가 설정되지 않았습니다. .env 에 COMMANDCODE_API_KEY 를 넣어 주세요.', 500, 'no_api_key');
  }

  return { body, apiKey, modelInfo: resolveModel(String(body.model ?? '').trim() || DEFAULT_MODEL) };
}

async function handleSpeakers(req, res) {
  const { body, apiKey, modelInfo } = await readRequest(req);

  const result = await extractSpeakers({
    conversation: body.conversation,
    apiKey,
    model: modelInfo.id,
    wire: modelInfo.wire,
  });

  result.meta.model = modelInfo.id;
  result.meta.modelName = modelInfo.name;
  sendJson(res, 200, result);
}

async function handlePerson(req, res) {
  const { body, apiKey, modelInfo } = await readRequest(req);

  const result = await analyzePerson({
    conversation: body.conversation,
    person: body.person,
    apiKey,
    model: modelInfo.id,
    wire: modelInfo.wire,
  });

  result.meta.model = modelInfo.id;
  result.meta.modelName = modelInfo.name;
  sendJson(res, 200, result);
}

async function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, relative);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('not a file');
    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': data.length,
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && pathname === '/api/models') {
      return sendJson(res, 200, {
        models: MODELS,
        defaultModel: DEFAULT_MODEL,
        hasServerKey: Boolean(serverApiKey()),
      });
    }

    if (req.method === 'POST' && pathname === '/api/speakers') {
      return await handleSpeakers(req, res);
    }

    if (req.method === 'POST' && pathname === '/api/analyze-person') {
      return await handlePerson(req, res);
    }

    if (pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: { message: '알 수 없는 API 경로입니다.' } });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      return await serveStatic(req, res, pathname);
    }

    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' }).end('405 Method Not Allowed');
  } catch (err) {
    const status = err instanceof ApiError ? err.status || 500 : 500;
    const message = err?.message || '알 수 없는 오류가 발생했습니다.';
    if (status >= 500) console.error('[analyze]', err);
    sendJson(res, status, { error: { message, code: err?.code || 'error' } });
  }
});

server.listen(PORT, () => {
  const keyState = serverApiKey() ? '설정됨' : '없음 (.env 확인 필요)';
  console.log(`\n  온라인MBTI`);
  console.log(`  ▶ http://localhost:${PORT}`);
  console.log(`  API 키: ${keyState}\n`);
});
