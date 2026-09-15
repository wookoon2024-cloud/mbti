/* ==================================================================
   접속 통계 및 관리자 인증 모듈
   ================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

let rawConn = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '';
if (rawConn && rawConn.includes('?')) {
  rawConn = rawConn.split('?')[0];
}

let pgPool = null;
if (rawConn) {
  pgPool = new pg.Pool({
    connectionString: rawConn,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
}

const ANALYTICS_FILE = process.env.VERCEL
  ? path.resolve('/tmp', 'analytics.json')
  : path.resolve('logs', 'analytics.json');

const ADMIN_ID = 'admin';
const ADMIN_PW = 'cail891';

// 인메모리 관리자 세션
const adminSessions = new Set();

// 실시간 접속자 (최근 5분 기준)
const activeSessions = new Map(); // ip -> { lastSeen, userAgent, path }

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadData() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
      return {
        daily: parsed.daily || {},
        recentEvents: parsed.recentEvents || [],
      };
    }
  } catch (err) {
    console.warn('Failed to load analytics from disk:', err.message);
  }
  return { daily: {}, recentEvents: [] };
}

let store = loadData();

let dbInitPromise = null;
async function ensureDbTable() {
  if (!pgPool) return;
  if (!dbInitPromise) {
    dbInitPromise = pgPool.query(`
      CREATE TABLE IF NOT EXISTS talkscanner_analytics (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `).catch(err => {
      console.warn('[Supabase] Init error:', err.message);
      dbInitPromise = null;
    });
  }
  return dbInitPromise;
}

function mergeStore(externalData) {
  if (!externalData) return;
  if (externalData.daily) {
    for (const [k, v] of Object.entries(externalData.daily)) {
      if (!store.daily[k]) {
        store.daily[k] = { ...v };
      } else {
        const cur = store.daily[k];
        cur.pv = Math.max(cur.pv || 0, v.pv || 0);
        cur.mbti = Math.max(cur.mbti || 0, v.mbti || 0);
        cur.love = Math.max(cur.love || 0, v.love || 0);
        cur.apiTotal = Math.max(cur.apiTotal || 0, v.apiTotal || 0);
        const combined = new Set([...(cur.uvIps || []), ...(v.uvIps || [])]);
        cur.uvIps = Array.from(combined);
      }
    }
  }
  if (Array.isArray(externalData.recentEvents) && externalData.recentEvents.length > 0) {
    const existingKeys = new Set(store.recentEvents.map(e => e.time + e.type));
    for (const evt of externalData.recentEvents) {
      if (!existingKeys.has(evt.time + evt.type)) {
        store.recentEvents.push(evt);
        existingKeys.add(evt.time + evt.type);
      }
    }
    store.recentEvents.sort((a, b) => new Date(b.time) - new Date(a.time));
    if (store.recentEvents.length > 100) store.recentEvents.length = 100;
  }
}

export async function pullFromSupabase() {
  if (!pgPool) return;
  try {
    await ensureDbTable();
    const res = await pgPool.query(`SELECT data FROM talkscanner_analytics WHERE key = 'store'`);
    if (res.rows && res.rows.length > 0 && res.rows[0].data) {
      mergeStore(res.rows[0].data);
    } else if (Object.keys(store.daily).length > 0) {
      // DB가 비어있으면 현재 누적 데이터를 초기 업로드
      pushToSupabase(true);
    }
  } catch (err) {
    console.warn('[Supabase] pull error:', err.message);
  }
}

// 초기 기동 시 1회 비동기 동기화
pullFromSupabase().catch(() => {});

let dbSaveTimer = null;
function pushToSupabase(immediate = false) {
  if (!pgPool) return;
  if (dbSaveTimer) clearTimeout(dbSaveTimer);
  const doSave = async () => {
    try {
      await ensureDbTable();
      const payload = JSON.stringify({
        daily: store.daily,
        recentEvents: store.recentEvents.slice(0, 100),
      });
      await pgPool.query(`
        INSERT INTO talkscanner_analytics (key, data, updated_at)
        VALUES ('store', $1::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW();
      `, [payload]);
    } catch (err) {
      console.warn('[Supabase] push error:', err.message);
    }
  };
  if (immediate) {
    doSave().catch(() => {});
  } else {
    dbSaveTimer = setTimeout(doSave, 1500);
  }
}

function saveData(immediateCloud = false) {
  try {
    const dir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const serialized = {
      daily: {},
      recentEvents: store.recentEvents.slice(0, 100),
    };
    for (const [k, v] of Object.entries(store.daily)) {
      serialized.daily[k] = {
        uvIps: Array.isArray(v.uvIps) ? v.uvIps.slice(0, 500) : [],
        pv: v.pv || 0,
        mbti: v.mbti || 0,
        love: v.love || 0,
        apiTotal: v.apiTotal || 0,
      };
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(serialized, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save analytics to disk:', err.message);
  }
  pushToSupabase(immediateCloud);
}

function ensureTodayEntry() {
  const today = getTodayKey();
  if (!store.daily[today]) {
    store.daily[today] = { uvIps: [], pv: 0, mbti: 0, love: 0, apiTotal: 0 };
  }
  return store.daily[today];
}

export function trackVisit(ip, pathname, userAgent = '') {
  if (pathname.startsWith('/api/admin') || pathname === '/admin' || pathname === '/admin.html') return;
  const now = Date.now();
  activeSessions.set(ip, { lastSeen: now, userAgent: userAgent.slice(0, 150), path: pathname });

  const entry = ensureTodayEntry();
  entry.pv += 1;
  if (!entry.uvIps.includes(ip)) {
    entry.uvIps.push(ip);
  }

  saveData();
}

export function trackEvent(ip, type, detail = '') {
  const now = Date.now();
  activeSessions.set(ip, { lastSeen: now, userAgent: '', path: type });

  const entry = ensureTodayEntry();
  entry.apiTotal += 1;
  if (type === 'mbti') entry.mbti += 1;
  if (type === 'love') entry.love += 1;

  store.recentEvents.unshift({
    time: new Date().toISOString(),
    ip: ip ? ip.replace(/^.*:/, '') : 'unknown',
    type,
    detail,
  });
  if (store.recentEvents.length > 100) store.recentEvents.length = 100;

  saveData();
}

const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || (ADMIN_PW + '_secret_key_talkscanner_2026');

export function authenticateAdmin(id, pw) {
  if (id === ADMIN_ID && pw === ADMIN_PW) {
    // 7일간 유효한 HMAC 서명 토큰 발급 (서버리스 인스턴스 변경 시에도 유효)
    const payload = JSON.stringify({ id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    const b64 = Buffer.from(payload).toString('base64url');
    const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(b64).digest('base64url');
    return `${b64}.${sig}`;
  }
  return null;
}

export function verifyAdmin(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    const cookie = req.headers['cookie'] || '';
    const match = cookie.match(/admin_token=([^;]+)/);
    if (match) token = match[1];
  }
  if (!token || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(b64).digest('base64url');
  if (sig !== expectedSig) return false;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8'));
    if (payload.id !== ADMIN_ID || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function revokeAdmin(req) {
  // 상태 비저장 서명 토큰
}

export async function getAnalyticsStats() {
  await pullFromSupabase();
  const diskData = loadData();
  // 메모리 상의 당일 데이터와 디스크 데이터 병합
  for (const [k, v] of Object.entries(diskData.daily || {})) {
    if (!store.daily[k]) {
      store.daily[k] = v;
    } else {
      const cur = store.daily[k];
      cur.pv = Math.max(cur.pv || 0, v.pv || 0);
      cur.mbti = Math.max(cur.mbti || 0, v.mbti || 0);
      cur.love = Math.max(cur.love || 0, v.love || 0);
      cur.apiTotal = Math.max(cur.apiTotal || 0, v.apiTotal || 0);
      const combined = new Set([...(cur.uvIps || []), ...(v.uvIps || [])]);
      cur.uvIps = Array.from(combined);
    }
  }

  const now = Date.now();
  const fiveMinAgo = now - 5 * 60 * 1000;

  // 활성 세션 정리
  const currentActives = [];
  for (const [ip, data] of activeSessions.entries()) {
    if (data.lastSeen >= fiveMinAgo) {
      currentActives.push({
        ip: ip.replace(/(\d+)\.\d+$/, '$1.***'),
        rawIp: ip,
        lastSeenSec: Math.round((now - data.lastSeen) / 1000),
        userAgent: data.userAgent,
        path: data.path,
      });
    } else {
      activeSessions.delete(ip);
    }
  }

  // 일별 데이터 (최근 14일)
  const allDates = Object.keys(store.daily).sort();
  const recentDays = allDates.slice(-14).map((d) => {
    const item = store.daily[d];
    return {
      date: d,
      uv: item.uvIps ? item.uvIps.length : 0,
      pv: item.pv || 0,
      mbti: item.mbti || 0,
      love: item.love || 0,
      apiTotal: item.apiTotal || 0,
    };
  });

  // 주간 집계 (최근 8주)
  const weeksMap = {};
  for (const d of allDates) {
    const dt = new Date(d);
    const year = dt.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((dt - oneJan) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((dt.getDay() + 1 + numberOfDays) / 7);
    const weekKey = `${year}-W${String(weekNum).padStart(2, '0')}`;

    if (!weeksMap[weekKey]) weeksMap[weekKey] = { week: weekKey, uvIps: new Set(), pv: 0, mbti: 0, love: 0, apiTotal: 0 };
    const w = weeksMap[weekKey];
    (store.daily[d].uvIps || []).forEach(ip => w.uvIps.add(ip));
    w.pv += store.daily[d].pv || 0;
    w.mbti += store.daily[d].mbti || 0;
    w.love += store.daily[d].love || 0;
    w.apiTotal += store.daily[d].apiTotal || 0;
  }
  const weekly = Object.values(weeksMap).slice(-8).map(w => ({
    week: w.week,
    uv: w.uvIps.size,
    pv: w.pv,
    mbti: w.mbti,
    love: w.love,
    apiTotal: w.apiTotal,
  }));

  // 월별 집계 (최근 12개월)
  const monthsMap = {};
  for (const d of allDates) {
    const monthKey = d.slice(0, 7);
    if (!monthsMap[monthKey]) monthsMap[monthKey] = { month: monthKey, uvIps: new Set(), pv: 0, mbti: 0, love: 0, apiTotal: 0 };
    const m = monthsMap[monthKey];
    (store.daily[d].uvIps || []).forEach(ip => m.uvIps.add(ip));
    m.pv += store.daily[d].pv || 0;
    m.mbti += store.daily[d].mbti || 0;
    m.love += store.daily[d].love || 0;
    m.apiTotal += store.daily[d].apiTotal || 0;
  }
  const monthly = Object.values(monthsMap).slice(-12).map(m => ({
    month: m.month,
    uv: m.uvIps.size,
    pv: m.pv,
    mbti: m.mbti,
    love: m.love,
    apiTotal: m.apiTotal,
  }));

  // 전체 누적 요약
  const todayKey = getTodayKey();
  const todayData = store.daily[todayKey] || { uvIps: [], pv: 0, mbti: 0, love: 0, apiTotal: 0 };
  let totalUvSet = new Set();
  let totalPv = 0, totalMbti = 0, totalLove = 0;
  for (const d of Object.values(store.daily)) {
    (d.uvIps || []).forEach(ip => totalUvSet.add(ip));
    totalPv += d.pv || 0;
    totalMbti += d.mbti || 0;
    totalLove += d.love || 0;
  }

  return {
    activeUsersCount: currentActives.length,
    activeSessions: currentActives,
    summary: {
      todayUv: todayData.uvIps ? todayData.uvIps.length : 0,
      todayPv: todayData.pv || 0,
      todayMbti: todayData.mbti || 0,
      todayLove: todayData.love || 0,
      totalUv: totalUvSet.size,
      totalPv,
      totalMbti,
      totalLove,
    },
    daily: recentDays,
    weekly,
    monthly,
    recentEvents: store.recentEvents.slice(0, 50),
  };
}
