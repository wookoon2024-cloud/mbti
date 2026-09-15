import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.env.VERCEL && process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { extractSpeakers, analyzePerson } from './analyze.js';
import { analyzeLove } from './analyze-love.js';
import { ApiError } from './commandcode.js';
import { MODELS, DEFAULT_MODEL, resolveModel } from './models.js';
import { createLimiter, clientIp, COST, LIMITS } from './limits.js';
import { trackVisit, trackEvent, authenticateAdmin, verifyAdmin, revokeAdmin, getAnalyticsStats } from './analytics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const TRUST_PROXY = /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || '') || Boolean(process.env.VERCEL);

export const APP_VERSION = '1.2.0';

const limiter = createLimiter();

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
  return (
    process.env.COMMANDCODE_API_KEY ||
    process.env.CMD_API_KEY ||
    process.env.API_KEY ||
    'user_QzFA8YfatVMyeLkidms8NPDg3FyPLMYMbZvWxRCkakciuAUioRK1Uez2muBJtFWj4vYrXtSGPbQN7hYEf4kaaD7'
  );
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
  const customKey = String(body.apiKey ?? '').trim();
  const apiKey = customKey || serverApiKey();

  if (!apiKey) {
    throw new ApiError('API 키가 설정되지 않았습니다. .env 에 COMMANDCODE_API_KEY 를 넣어 주세요.', 500, 'no_api_key');
  }

  const isCustomKey = Boolean(customKey);
  return { body, apiKey, isCustomKey, modelInfo: resolveModel(String(body.model ?? '').trim() || DEFAULT_MODEL, isCustomKey) };
}

function requestIp(req) {
  return clientIp(req, TRUST_PROXY);
}

/**
 * 한도를 확인하고 자리를 잡는다. 성공하면 반드시 release() 를 호출해야 한다.
 * 대화 길이 같은 값싼 검증을 먼저 통과시킨 뒤 호출할 것.
 */
function guard(ip, cost, options = {}) {
  const decision = limiter.tryAcquire(ip, cost, options);

  if (!decision.ok) {
    const error = new ApiError(decision.message, 429, decision.reason);
    error.retryAfterSec = decision.retryAfterSec;
    throw error;
  }

  return decision;
}

function assertConversation(conversation) {
  const text = String(conversation ?? '').trim();
  if (text.length < 20) {
    throw new ApiError('대화 내용이 너무 짧습니다. 최소 몇 줄 이상의 대화를 넣어 주세요.', 400, 'too_short');
  }
  return text;
}

function withUsage(payload, ip, isCustomKey = false) {
  const usage = { ...limiter.usage(ip) };
  if (isCustomKey) {
    usage.cooldownRemainingSec = 0;
    usage.loveCooldownRemainingSec = 0;
    usage.hasCustomKey = true;
  }
  return { ...payload, usage, limits: LIMITS, cost: COST };
}

async function handleSpeakers(req, res) {
  const { body, apiKey, isCustomKey, modelInfo } = await readRequest(req);
  const ip = requestIp(req);
  await limiter.syncFromDb(ip);
  assertConversation(body.conversation);

  const lease = guard(ip, COST.speakers, { isStep1: true, isCustomKey });
  try {
    const result = await extractSpeakers({
      conversation: body.conversation,
      apiKey,
      model: modelInfo.id,
      wire: modelInfo.wire,
    });

    result.meta.model = modelInfo.id;
    result.meta.modelName = modelInfo.name;
    trackEvent(ip, 'speakers', `등장인물 추출 (${result.speakers?.length || 0}명)`);
    await limiter.syncToDb(ip);
    sendJson(res, 200, withUsage(result, ip, isCustomKey));
  } finally {
    lease.release();
  }
}

async function handlePerson(req, res) {
  const { body, apiKey, isCustomKey, modelInfo } = await readRequest(req);
  const ip = requestIp(req);
  await limiter.syncFromDb(ip);
  assertConversation(body.conversation);

  const lease = guard(ip, COST.person, { isCustomKey });
  try {
    const result = await analyzePerson({
      conversation: body.conversation,
      person: body.person,
      apiKey,
      model: modelInfo.id,
      wire: modelInfo.wire,
    });

    result.meta.model = modelInfo.id;
    result.meta.modelName = modelInfo.name;
    const personName = typeof body.person === 'object' ? body.person?.name : (body.person || '인물');
    trackEvent(ip, 'mbti', `${personName} MBTI 판정 (${result.mbti?.type || '성공'})`);
    sendJson(res, 200, withUsage(result, ip, isCustomKey));
  } finally {
    lease.release();
  }
}

async function handleLove(req, res) {
  const { body, apiKey, isCustomKey, modelInfo } = await readRequest(req);
  const ip = requestIp(req);
  await limiter.syncFromDb(ip);
  assertConversation(body.conversation);

  const lease = guard(ip, COST.love, { isLove: true, isCustomKey });
  try {
    const result = await analyzeLove({
      conversation: body.conversation,
      apiKey,
      model: modelInfo.id,
      wire: modelInfo.wire,
    });

    result.meta.model = modelInfo.id;
    result.meta.modelName = modelInfo.name;
    trackEvent(ip, 'love', `1:1 애정 분석 (${result.loveAnalysis?.summary?.chemistryScore || 0}점)`);
    await limiter.syncToDb(ip);
    sendJson(res, 200, withUsage(result, ip, isCustomKey));
  } finally {
    lease.release();
  }
}

async function serveStatic(req, res, pathname) {
  let relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relative === 'admin' || relative === 'admin/') {
    relative = 'admin.html';
  }
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

export async function handleRequest(req, res) {
  const rawUrl = req.headers['x-matched-path'] || req.url;
  const { pathname } = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
  const ip = requestIp(req);

  try {
    trackVisit(ip, pathname, req.headers['user-agent'] || '');

    if (req.method === 'GET' && pathname === '/api/version') {
      return sendJson(res, 200, { ok: true, version: APP_VERSION, app: '톡스캐너' });
    }

    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await readBody(req);
      const token = authenticateAdmin(body?.id, body?.pw);
      if (!token) {
        return sendJson(res, 401, { error: { message: '아이디 또는 비밀번호가 올바르지 않습니다.' } });
      }
      res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      return sendJson(res, 200, { ok: true, token });
    }

    if (req.method === 'GET' && pathname === '/api/admin/stats') {
      if (!verifyAdmin(req)) {
        return sendJson(res, 401, { error: { message: '관리자 로그인이 필요합니다.' } });
      }
      return sendJson(res, 200, await getAnalyticsStats());
    }

    if (req.method === 'POST' && pathname === '/api/admin/reset-limits') {
      if (!verifyAdmin(req)) {
        return sendJson(res, 401, { error: { message: '관리자 로그인이 필요합니다.' } });
      }
      const body = await readBody(req);
      const targetIp = String(body?.ip || '').trim();
      const action = String(body?.action || '').trim(); // 'cooldown' or 'runs' or 'all'

      if (!targetIp) {
        return sendJson(res, 400, { error: { message: '대상 IP가 지정되지 않았습니다.' } });
      }

      if (action === 'cooldown' || action === 'all') {
        await limiter.resetCooldown(targetIp);
      }
      if (action === 'runs' || action === 'all') {
        await limiter.resetDailyRuns(targetIp);
      }

      return sendJson(res, 200, {
        ok: true,
        message: action === 'cooldown'
          ? `${targetIp}의 분석 대기시간이 즉시 초기화되었습니다.`
          : action === 'runs'
          ? `${targetIp}의 일일 10회 한도가 즉시 초기화되었습니다.`
          : `${targetIp}의 대기시간 및 10회 한도가 모두 초기화되었습니다.`,
        usage: limiter.usage(targetIp),
      });
    }

    if (req.method === 'POST' && pathname === '/api/admin/logout') {
      revokeAdmin(req);
      res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; Max-Age=0');
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && pathname === '/api/usage') {
      const ip = requestIp(req);
      await limiter.syncFromDb(ip);
      return sendJson(res, 200, {
        usage: limiter.usage(ip),
        limits: LIMITS,
        cost: COST,
      });
    }

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

    if (req.method === 'POST' && pathname === '/api/analyze-love') {
      return await handleLove(req, res);
    }

    if (req.method === 'POST' && pathname === '/api/referral/create') {
      let body = {};
      try { body = await readBody(req); } catch {}
      const ip = requestIp(req);
      const code = await limiter.createReferral(ip, body?.shareData || null);
      return sendJson(res, 200, { ok: true, code });
    }

    if (req.method === 'POST' && pathname === '/api/referral/visit') {
      const body = await readBody(req);
      const ip = requestIp(req);
      const result = await limiter.redeemReferral(String(body?.refCode || ''), ip);
      return sendJson(res, 200, result);
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
    const code = err?.code || 'error';

    // 토큰/크레딧 부족 또는 쿼터 초과 감지 시 전역 소진 상태로 전환
    if (
      status === 402 ||
      /insufficient_quota|quota_exceeded|credit_exhausted|out of credit|balance/i.test(message) ||
      /insufficient_quota|credit/i.test(code)
    ) {
      limiter.setQuotaExhausted(true);
    }

    if (status >= 500) console.error('[analyze]', err);
    if (err?.retryAfterSec) res.setHeader('Retry-After', String(err.retryAfterSec));
    sendJson(res, status, {
      error: {
        message,
        code,
        retryAfterSec: err?.retryAfterSec,
        quotaExhausted: limiter.isExhausted(),
      },
    });
  }
}

const server = http.createServer(handleRequest);

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    const keyState = serverApiKey() ? '설정됨' : '없음 (.env 확인 필요)';
    console.log(`\n  온라인MBTI`);
    console.log(`  ▶ http://localhost:${PORT}`);
    console.log(`  API 키: ${keyState}`);
    console.log(
      `  무료 한도: IP 시간당 ${LIMITS.hourlyUnits} / 일당 ${LIMITS.dailyUnits} · 전체 일일 ${LIMITS.globalDailyUnits} (단위)`,
    );
    console.log(`  동시 요청: 전체 ${LIMITS.maxConcurrent} · IP당 ${LIMITS.maxConcurrentPerIp}`);
    console.log(`  프록시 신뢰(X-Forwarded-For): ${TRUST_PROXY ? '켜짐' : '꺼짐'}\n`);
  });
}

export default handleRequest;
