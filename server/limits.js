/* ==================================================================
   사용량 제한 — 공개 서비스에서 크레딧이 털리지 않도록 막는 계층

   1) IP별 시간당/일당 한도   — 한 사람이 반복 호출하는 것을 막는다
   2) IP별 동시 요청 한도      — 탭 여러 개로 몰아치는 것을 막는다
   3) 전체 동시 요청 한도      — 업스트림 과부하/레이트리밋을 막는다
   4) 전체 일일 상한           — 최악의 경우 지출을 고정한다 (가장 중요)

   메모리 기반이라 단일 인스턴스에서만 정확하다. 여러 대로 늘리면
   Redis 같은 공용 저장소로 옮겨야 한다.
   ================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { pgPool, ensureLimitsTables } from './db.js';

const REFERRALS_FILE = process.env.VERCEL
  ? path.resolve('/tmp', 'referrals.json')
  : path.resolve('logs', 'referrals.json');

function loadReferralsFromDisk() {
  try {
    if (fs.existsSync(REFERRALS_FILE)) {
      const content = fs.readFileSync(REFERRALS_FILE, 'utf-8');
      const obj = JSON.parse(content);
      return new Map(Object.entries(obj));
    }
  } catch (err) {
    console.warn('Failed to load referrals from disk:', err.message);
  }
  return new Map();
}

function saveReferralsToDisk(map) {
  try {
    const dir = path.dirname(REFERRALS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const obj = Object.fromEntries(map);
    fs.writeFileSync(REFERRALS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save referrals to disk:', err.message);
  }
}

const USAGE_FILE = process.env.VERCEL
  ? path.resolve('/tmp', 'limits_usage.json')
  : path.resolve('logs', 'limits_usage.json');

function loadUsageFromDisk() {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      const content = fs.readFileSync(USAGE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Failed to load usage limits from disk:', err.message);
  }
  return null;
}

function saveUsageToDisk(data) {
  try {
    const dir = path.dirname(USAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data), 'utf-8');
  } catch (err) {
    console.warn('Failed to save usage limits to disk:', err.message);
  }
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
export const STEP1_COOLDOWN_MS = 10 * MINUTE; // 기본 10분에 1번
export const REWARD_DISCOUNT_MS = 5 * MINUTE; // 공유 초대로 5분 단축

// 요청 종류별 비용. 사람 판정과 애정 분석은 무거운 요청이다.
export const COST = { speakers: 1, person: 3, love: 3 };

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function readInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export const DAILY_ANALYSIS_LIMIT = 10; // 하루 무료 한도 10회

export const LIMITS = {
  dailyAnalysisLimit: DAILY_ANALYSIS_LIMIT,
  hourlyUnits: readInt('FREE_HOURLY_UNITS', 60),
  dailyUnits: readInt('FREE_DAILY_UNITS', 150),
  globalDailyUnits: readInt('FREE_GLOBAL_DAILY_UNITS', 1500),
  maxConcurrent: readInt('FREE_MAX_CONCURRENT', 4),
  maxConcurrentPerIp: readInt('FREE_MAX_CONCURRENT_PER_IP', 2),
  step1CooldownSec: Math.floor(STEP1_COOLDOWN_MS / 1000),
  rewardDiscountSec: Math.floor(REWARD_DISCOUNT_MS / 1000),
};

export function createLimiter(config = LIMITS) {
  const diskUsage = loadUsageFromDisk() || {};
  const perIp = new Map();
  const activeByIp = new Map();
  const step1LastByIp = new Map(Object.entries(diskUsage.step1Last || {}));
  const loveLastByIp = new Map(Object.entries(diskUsage.loveLast || {}));
  const dailyRunsByIp = new Map(Object.entries(diskUsage.dailyRuns || {})); // IP별 하루 분석 횟수 (date, count)
  const bonusDiscountByIp = new Map(Object.entries(diskUsage.bonusDiscount || {})); // IP별 쿨다운 단축 혜택 보유 여부
  const referrals = loadReferralsFromDisk(); // refCode -> { code, creatorIp, createdAt, redeemedCount, shareData }
  let active = 0;
  let globalDay = { start: startOfDay(Date.now()), used: 0 };
  let manualQuotaExhausted = false; // API 키 크레딧 부족 시 전역 잠금

  function persistUsage() {
    saveUsageToDisk({
      step1Last: Object.fromEntries(step1LastByIp),
      loveLast: Object.fromEntries(loveLastByIp),
      dailyRuns: Object.fromEntries(dailyRunsByIp),
      bonusDiscount: Object.fromEntries(bonusDiscountByIp),
    });
  }

  async function syncFromDb(ip) {
    if (!pgPool || !ip) return;
    try {
      await ensureLimitsTables();
      const today = startOfDay(Date.now());
      const todayStr = new Date(today).toISOString().slice(0, 10);
      const res = await pgPool.query(`SELECT * FROM talkscanner_limits WHERE ip = $1`, [ip]);
      if (res.rows && res.rows.length > 0) {
        const row = res.rows[0];
        if (row.date === todayStr) {
          dailyRunsByIp.set(ip, { date: today, count: row.runs_today || 0 });
        } else {
          dailyRunsByIp.set(ip, { date: today, count: 0 });
        }
        if (row.step1_last) step1LastByIp.set(ip, Number(row.step1_last));
        if (row.love_last) loveLastByIp.set(ip, Number(row.love_last));
        if (row.has_referral_bonus) {
          bonusDiscountByIp.set(ip, true);
        } else {
          bonusDiscountByIp.delete(ip);
        }
        persistUsage();
      }
    } catch (e) {
      console.warn('[DB] syncFromDb error:', e.message);
    }
  }

  async function syncToDb(ip) {
    if (!pgPool || !ip) return;
    try {
      await ensureLimitsTables();
      const today = startOfDay(Date.now());
      const todayStr = new Date(today).toISOString().slice(0, 10);
      const runs = dailyRunsByIp.get(ip);
      const runsCount = (runs && runs.date === today) ? runs.count : 0;
      const step1Last = step1LastByIp.get(ip) || 0;
      const loveLast = loveLastByIp.get(ip) || 0;
      const hasBonus = Boolean(bonusDiscountByIp.get(ip));

      await pgPool.query(`
        INSERT INTO talkscanner_limits (ip, date, runs_today, step1_last, love_last, has_referral_bonus, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (ip) DO UPDATE SET
          date = EXCLUDED.date,
          runs_today = EXCLUDED.runs_today,
          step1_last = EXCLUDED.step1_last,
          love_last = EXCLUDED.love_last,
          has_referral_bonus = EXCLUDED.has_referral_bonus,
          updated_at = NOW()
      `, [ip, todayStr, runsCount, step1Last, loveLast, hasBonus]);
    } catch (e) {
      console.warn('[DB] syncToDb error:', e.message);
    }
  }

  function rollDay(now) {
    const start = startOfDay(now);
    if (start !== globalDay.start) {
      globalDay = { start, used: 0 };
      manualQuotaExhausted = false; // 날이 바뀌면 초기화
    }
  }

  function getDailyRuns(ip, now) {
    const today = startOfDay(now);
    const entry = dailyRunsByIp.get(ip);
    if (!entry || entry.date !== today) return 0;
    return entry.count;
  }

  function incrementDailyRuns(ip, now) {
    const today = startOfDay(now);
    const entry = dailyRunsByIp.get(ip);
    if (!entry || entry.date !== today) {
      dailyRunsByIp.set(ip, { date: today, count: 1 });
    } else {
      entry.count += 1;
    }
    persistUsage();
    syncToDb(ip).catch(() => {});
  }

  function bucket(ip, now) {
    let entry = perIp.get(ip);
    if (!entry) {
      entry = { hour: [], day: [] };
      perIp.set(ip, entry);
    }
    entry.hour = entry.hour.filter((r) => now - r.t < HOUR);
    entry.day = entry.day.filter((r) => now - r.t < DAY);
    return entry;
  }

  const sum = (list) => list.reduce((total, r) => total + r.cost, 0);

  function secondsUntilTomorrow(now) {
    return Math.max(1, Math.ceil((startOfDay(now) + DAY - now) / 1000));
  }

  function secondsUntilOldestExpires(list, now) {
    if (!list.length) return 60;
    return Math.max(1, Math.ceil((list[0].t + HOUR - now) / 1000));
  }

  function deny(reason, message, retryAfterSec) {
    return { ok: false, reason, message, retryAfterSec };
  }

  function isExhausted() {
    return manualQuotaExhausted || globalDay.used >= config.globalDailyUnits;
  }

  function setQuotaExhausted(exhausted = true) {
    manualQuotaExhausted = Boolean(exhausted);
  }

  function getIpCooldownDuration(ip) {
    return STEP1_COOLDOWN_MS;
  }

  /**
   * 요청을 받아들일지 판단하고, 받아들이면 사용량을 기록한다.
   * 성공 시 반드시 release() 를 호출해야 동시성 카운트가 풀린다.
   */
  function tryAcquire(ip, cost, { isStep1 = false, isLove = false, isCustomKey = false } = {}) {
    // 사용자가 본인의 API 키를 등록하여 사용하는 경우 서버 비용/한도 및 10분 쿨다운 전면 면제
    if (isCustomKey) {
      return { ok: true, release() {} };
    }

    const now = Date.now();
    rollDay(now);
    const entry = bucket(ip, now);

    if (isExhausted()) {
      return deny(
        'global_daily_limit',
        '오늘 무료 AI 분석 한도가 모두 소진되었습니다. 내일 다시 이용해 주세요.',
        secondsUntilTomorrow(now),
      );
    }

    if (isStep1) {
      const last = step1LastByIp.get(ip);
      const cooldownMs = getIpCooldownDuration(ip);
      if (last && now - last < cooldownMs) {
        const remainingSec = Math.max(1, Math.ceil((last + cooldownMs - now) / 1000));
        const remMin = Math.floor(remainingSec / 60);
        const remSec = remainingSec % 60;
        const timeText = remMin > 0 ? `${remMin}분 ${remSec}초` : `${remSec}초`;
        return deny(
          'cooldown',
          `분석 쿨다운 대기 중입니다. ${timeText} 뒤에 다시 이용해 주세요. (공유를 통해 친구가 접속하면 5분 단축됩니다!)`,
          remainingSec,
        );
      }
    }

    if (isLove) {
      const last = loveLastByIp.get(ip);
      const cooldownMs = getIpCooldownDuration(ip);
      if (last && now - last < cooldownMs) {
        const remainingSec = Math.max(1, Math.ceil((last + cooldownMs - now) / 1000));
        const remMin = Math.floor(remainingSec / 60);
        const remSec = remainingSec % 60;
        const timeText = remMin > 0 ? `${remMin}분 ${remSec}초` : `${remSec}초`;
        return deny(
          'cooldown',
          `1:1 애정 분석 쿨다운 대기 중입니다. ${timeText} 뒤에 다시 이용해 주세요. (공유 링크로 친구가 접속하면 5분 단축됩니다!)`,
          remainingSec,
        );
      }
    }

    if (isStep1 || isLove) {
      const runsToday = getDailyRuns(ip, now);
      if (runsToday >= DAILY_ANALYSIS_LIMIT) {
        return deny(
          'daily_limit_reached',
          '오늘 하루 무료 분석 한도(10회)를 모두 사용하셨습니다. 내일 자정(00:00) 이후에 다시 이용해 주세요.',
          secondsUntilTomorrow(now),
        );
      }
    }

    if (globalDay.used + cost > config.globalDailyUnits) {
      return deny(
        'global_daily_limit',
        '오늘 무료 AI 분석 한도가 모두 소진되었습니다. 내일 다시 이용해 주세요.',
        secondsUntilTomorrow(now),
      );
    }

    if (sum(entry.day) + cost > config.dailyUnits) {
      return deny(
        'ip_daily_limit',
        '하루 무료 사용 한도를 모두 썼습니다. 내일 다시 이용해 주세요.',
        secondsUntilTomorrow(now),
      );
    }

    if (sum(entry.hour) + cost > config.hourlyUnits) {
      return deny(
        'ip_hourly_limit',
        '짧은 시간에 너무 많이 요청했습니다. 잠시 후 다시 시도해 주세요.',
        secondsUntilOldestExpires(entry.hour, now),
      );
    }

    if ((activeByIp.get(ip) ?? 0) >= config.maxConcurrentPerIp) {
      return deny('ip_concurrency', '이미 판독이 진행 중입니다. 끝난 뒤에 시도해 주세요.', 5);
    }

    if (active >= config.maxConcurrent) {
      return deny(
        'busy',
        '지금 이용자가 몰려 있습니다. 잠시 후 다시 시도해 주세요.',
        10,
      );
    }

    if (isStep1) {
      const hadBonus = bonusDiscountByIp.get(ip);
      step1LastByIp.set(ip, hadBonus ? now - REWARD_DISCOUNT_MS : now);
      bonusDiscountByIp.delete(ip);
      incrementDailyRuns(ip, now);
    }

    if (isLove) {
      const hadBonus = bonusDiscountByIp.get(ip);
      loveLastByIp.set(ip, hadBonus ? now - REWARD_DISCOUNT_MS : now);
      bonusDiscountByIp.delete(ip);
      incrementDailyRuns(ip, now);
    }

    entry.hour.push({ t: now, cost });
    entry.day.push({ t: now, cost });
    globalDay.used += cost;
    active += 1;
    activeByIp.set(ip, (activeByIp.get(ip) ?? 0) + 1);

    let released = false;
    return {
      ok: true,
      release() {
        if (released) return;
        released = true;
        active -= 1;
        const remaining = (activeByIp.get(ip) ?? 1) - 1;
        if (remaining <= 0) activeByIp.delete(ip);
        else activeByIp.set(ip, remaining);
      },
    };
  }

  async function createReferral(ip, shareData = null) {
    const code = 'scout_' + Math.random().toString(36).slice(2, 9);
    const item = {
      code,
      creatorIp: ip,
      createdAt: Date.now(),
      redeemedCount: 0,
      shareData: shareData || null,
    };
    referrals.set(code, item);
    saveReferralsToDisk(referrals);

    if (pgPool) {
      try {
        await ensureLimitsTables();
        await pgPool.query(`
          INSERT INTO talkscanner_referrals (code, creator_ip, created_at, redeemed_count, share_data, updated_at)
          VALUES ($1, $2, $3, 0, $4, NOW())
          ON CONFLICT (code) DO UPDATE SET
            share_data = EXCLUDED.share_data,
            updated_at = NOW()
        `, [code, ip, item.createdAt, shareData ? JSON.stringify(shareData) : null]);
      } catch (e) {
        console.warn('[DB] createReferral error:', e.message);
      }
    }
    return code;
  }

  async function redeemReferral(code, visitorIp) {
    let ref = referrals.get(code);

    // 1. DB에서 먼저 최신 레코드 조회 (Vercel 다른 인스턴스에서 생성된 경우)
    if ((!ref || !ref.shareData) && pgPool) {
      try {
        await ensureLimitsTables();
        const res = await pgPool.query(`SELECT * FROM talkscanner_referrals WHERE code = $1`, [code]);
        if (res.rows && res.rows.length > 0) {
          const row = res.rows[0];
          ref = {
            code: row.code,
            creatorIp: row.creator_ip,
            createdAt: Number(row.created_at),
            redeemedCount: Number(row.redeemed_count),
            shareData: row.share_data,
          };
          referrals.set(code, ref);
        }
      } catch (e) {
        console.warn('[DB] redeemReferral query error:', e.message);
      }
    }

    if (!ref || !ref.shareData) {
      const diskMap = loadReferralsFromDisk();
      const diskRef = diskMap.get(code);
      if (diskRef) {
        ref = diskRef;
        referrals.set(code, ref);
      }
    }

    if (!ref) {
      if (code && code.startsWith('scout_')) {
        const visitorLast = step1LastByIp.get(visitorIp);
        if (visitorLast) step1LastByIp.set(visitorIp, visitorLast - REWARD_DISCOUNT_MS);
        const visitorLoveLast = loveLastByIp.get(visitorIp);
        if (visitorLoveLast) loveLastByIp.set(visitorIp, visitorLoveLast - REWARD_DISCOUNT_MS);
        bonusDiscountByIp.set(visitorIp, true);
        syncToDb(visitorIp).catch(() => {});
        return { ok: true, rewardApplied: true, isSelf: false, shareData: null };
      }
      return { ok: false, reason: 'invalid_code' };
    }

    // 같은 IP 접속 시 자가 초대(Self-referral)로 판정하여 보상 전면 차단
    const isSelf = ref.creatorIp === visitorIp;

    if (!isSelf) {
      ref.redeemedCount = (ref.redeemedCount || 0) + 1;

      // DB에서 초대자와 방문자의 최신 한도/쿨다운 상태를 동기화
      await syncFromDb(ref.creatorIp);
      await syncFromDb(visitorIp);

      // 1. 초대자 IP 쿨다운 5분 단축 (시간 앞당김)
      const creatorLast = step1LastByIp.get(ref.creatorIp);
      if (creatorLast) {
        step1LastByIp.set(ref.creatorIp, creatorLast - REWARD_DISCOUNT_MS);
      }
      const creatorLoveLast = loveLastByIp.get(ref.creatorIp);
      if (creatorLoveLast) {
        loveLastByIp.set(ref.creatorIp, creatorLoveLast - REWARD_DISCOUNT_MS);
      }
      bonusDiscountByIp.set(ref.creatorIp, true);
      await syncToDb(ref.creatorIp);

      // 2. 방문자 IP에도 쿨다운 단축(5분) 혜택 부여
      const visitorLast = step1LastByIp.get(visitorIp);
      if (visitorLast) {
        step1LastByIp.set(visitorIp, visitorLast - REWARD_DISCOUNT_MS);
      }
      const visitorLoveLast = loveLastByIp.get(visitorIp);
      if (visitorLoveLast) {
        loveLastByIp.set(visitorIp, visitorLoveLast - REWARD_DISCOUNT_MS);
      }
      bonusDiscountByIp.set(visitorIp, true);
      await syncToDb(visitorIp);

      saveReferralsToDisk(referrals);
      if (pgPool) {
        pgPool.query(
          `UPDATE talkscanner_referrals SET redeemed_count = redeemed_count + 1, updated_at = NOW() WHERE code = $1`,
          [code],
        ).catch(() => {});
      }
    }

    return {
      ok: true,
      rewardApplied: !isSelf,
      isSelf,
      shareData: ref.shareData || null,
      message: !isSelf
        ? '친구 초대로 쿨다운이 5분 단축되었습니다! ⚡'
        : '본인 IP로 접속하여 초대 단축 혜택이 적용되지 않습니다. (친구가 다른 IP에서 접속해야 5분 단축)',
    };
  }

  function usage(ip) {
    const now = Date.now();
    rollDay(now);
    const entry = bucket(ip, now);
    const lastStep1 = step1LastByIp.get(ip) || 0;
    const lastLove = loveLastByIp.get(ip) || 0;
    const cooldownMs = getIpCooldownDuration(ip);
    const cooldownRemainingSec = Math.max(0, Math.ceil((lastStep1 + cooldownMs - now) / 1000));
    const loveCooldownRemainingSec = Math.max(0, Math.ceil((lastLove + cooldownMs - now) / 1000));
    const exhausted = isExhausted();

    const runsToday = getDailyRuns(ip, now);
    const dailyRemaining = Math.max(0, DAILY_ANALYSIS_LIMIT - runsToday);

    return {
      dailyUsed: runsToday,
      runsToday,
      dailyLimit: DAILY_ANALYSIS_LIMIT,
      dailyRemaining,
      hourlyUsed: sum(entry.hour),
      hourlyLimit: config.hourlyUnits,
      hourlyRemaining: Math.max(0, config.hourlyUnits - sum(entry.hour)),
      globalUsed: globalDay.used,
      globalLimit: config.globalDailyUnits,
      globalRemaining: Math.max(0, config.globalDailyUnits - globalDay.used),
      globalResetInSec: secondsUntilTomorrow(now),
      cooldownRemainingSec,
      loveCooldownRemainingSec,
      hasReferralBonus: Boolean(bonusDiscountByIp.get(ip)),
      quotaExhausted: exhausted,
      isCustomKeyAvailable: true,
    };
  }

  async function resetCooldown(ip) {
    if (!ip) return;
    step1LastByIp.delete(ip);
    loveLastByIp.delete(ip);
    const entry = perIp.get(ip);
    if (entry) {
      entry.hour = [];
    }
    persistUsage();
    if (pgPool) {
      try {
        await ensureLimitsTables();
        const today = startOfDay(Date.now());
        const todayStr = new Date(today).toISOString().slice(0, 10);
        await pgPool.query(`
          INSERT INTO talkscanner_limits (ip, date, step1_last, love_last, updated_at)
          VALUES ($1, $2, 0, 0, NOW())
          ON CONFLICT (ip) DO UPDATE SET
            step1_last = 0,
            love_last = 0,
            updated_at = NOW()
        `, [ip, todayStr]);
      } catch (e) {
        console.warn('[DB] resetCooldown error:', e.message);
      }
    }
  }

  async function resetDailyRuns(ip) {
    if (!ip) return;
    const today = startOfDay(Date.now());
    dailyRunsByIp.set(ip, { date: today, count: 0 });
    const entry = perIp.get(ip);
    if (entry) {
      entry.day = [];
      entry.hour = [];
    }
    persistUsage();
    if (pgPool) {
      try {
        await ensureLimitsTables();
        const todayStr = new Date(today).toISOString().slice(0, 10);
        await pgPool.query(`
          INSERT INTO talkscanner_limits (ip, date, runs_today, updated_at)
          VALUES ($1, $2, 0, NOW())
          ON CONFLICT (ip) DO UPDATE SET
            runs_today = 0,
            date = EXCLUDED.date,
            updated_at = NOW()
        `, [ip, todayStr]);
      } catch (e) {
        console.warn('[DB] resetDailyRuns error:', e.message);
      }
    }
  }

  // 주기적으로 24시간 지난 IP 기록 청소
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of perIp) {
      const kept = entry.day.filter((r) => now - r.t < DAY);
      if (!kept.length) perIp.delete(ip);
      else entry.day = kept;
    }
    for (const [code, item] of referrals) {
      if (now - item.createdAt > DAY) referrals.delete(code);
    }
  }, 10 * MINUTE);
  sweeper.unref?.();

  return { tryAcquire, usage, createReferral, redeemReferral, resetCooldown, resetDailyRuns, setQuotaExhausted, isExhausted, syncFromDb, syncToDb, config };
}

/**
 * 실제 접속 IP. 프록시 뒤에 있을 때만 X-Forwarded-For 를 신뢰한다.
 * (TRUST_PROXY 없이 헤더를 믿으면 누구나 IP 를 위조해 한도를 우회할 수 있다.)
 */
export function clientIp(req, trustProxy) {
  if (trustProxy) {
    const header = req.headers['x-forwarded-for'];
    if (typeof header === 'string' && header.length) {
      return header.split(',')[0].trim();
    }
    const real = req.headers['x-real-ip'];
    if (typeof real === 'string' && real.length) return real.trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}
