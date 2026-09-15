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
  const perIp = new Map();
  const activeByIp = new Map();
  const step1LastByIp = new Map();
  const loveLastByIp = new Map();
  const dailyRunsByIp = new Map(); // IP별 하루 분석 횟수 (date, count)
  const bonusDiscountByIp = new Map(); // IP별 쿨다운 단축 혜택 보유 여부
  const referrals = loadReferralsFromDisk(); // refCode -> { code, creatorIp, createdAt, redeemedCount, shareData }
  let active = 0;
  let globalDay = { start: startOfDay(Date.now()), used: 0 };
  let manualQuotaExhausted = false; // API 키 크레딧 부족 시 전역 잠금

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
      step1LastByIp.set(ip, now);
      bonusDiscountByIp.delete(ip);
      incrementDailyRuns(ip, now);
    }

    if (isLove) {
      loveLastByIp.set(ip, now);
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

  function createReferral(ip, shareData = null) {
    const code = 'scout_' + Math.random().toString(36).slice(2, 9);
    referrals.set(code, {
      code,
      creatorIp: ip,
      createdAt: Date.now(),
      redeemedCount: 0,
      shareData: shareData || null,
    });
    saveReferralsToDisk(referrals);
    return code;
  }

  function redeemReferral(code, visitorIp) {
    let ref = referrals.get(code);
    if (!ref || !ref.shareData) {
      // Reload disk just in case
      const diskMap = loadReferralsFromDisk();
      const diskRef = diskMap.get(code);
      if (diskRef) {
        ref = diskRef;
        referrals.set(code, ref);
      }
    }
    if (!ref) return { ok: false, reason: 'invalid_code' };

    // 같은 IP 접속 시 자가 초대(Self-referral)로 판정하여 보상 전면 차단
    const isSelf = ref.creatorIp === visitorIp;

    if (!isSelf) {
      ref.redeemedCount = (ref.redeemedCount || 0) + 1;

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
      saveReferralsToDisk(referrals);
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
      step1CooldownSec: Math.floor(cooldownMs / 1000),
      hasReferralBonus: Boolean(bonusDiscountByIp.get(ip)),
      quotaExhausted: exhausted,
      active,
    };
  }

  // 오래된 IP 및 레퍼럴 기록 정리 (프로세스를 붙잡지 않도록 unref)
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

  return { tryAcquire, usage, createReferral, redeemReferral, setQuotaExhausted, isExhausted, config };
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
