/* ==================================================================
   사용량 제한 — 공개 서비스에서 크레딧이 털리지 않도록 막는 계층

   1) IP별 시간당/일당 한도   — 한 사람이 반복 호출하는 것을 막는다
   2) IP별 동시 요청 한도      — 탭 여러 개로 몰아치는 것을 막는다
   3) 전체 동시 요청 한도      — 업스트림 과부하/레이트리밋을 막는다
   4) 전체 일일 상한           — 최악의 경우 지출을 고정한다 (가장 중요)

   메모리 기반이라 단일 인스턴스에서만 정확하다. 여러 대로 늘리면
   Redis 같은 공용 저장소로 옮겨야 한다.
   ================================================================== */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// 요청 종류별 비용. 사람 판정이 인물 추출보다 훨씬 무겁다.
export const COST = { speakers: 1, person: 3 };

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function readInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export const LIMITS = {
  hourlyUnits: readInt('FREE_HOURLY_UNITS', 60),
  dailyUnits: readInt('FREE_DAILY_UNITS', 150),
  globalDailyUnits: readInt('FREE_GLOBAL_DAILY_UNITS', 1500),
  maxConcurrent: readInt('FREE_MAX_CONCURRENT', 4),
  maxConcurrentPerIp: readInt('FREE_MAX_CONCURRENT_PER_IP', 2),
};

export function createLimiter(config = LIMITS) {
  const perIp = new Map();
  const activeByIp = new Map();
  let active = 0;
  let globalDay = { start: startOfDay(Date.now()), used: 0 };

  function rollDay(now) {
    const start = startOfDay(now);
    if (start !== globalDay.start) globalDay = { start, used: 0 };
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

  /**
   * 요청을 받아들일지 판단하고, 받아들이면 사용량을 기록한다.
   * 성공 시 반드시 release() 를 호출해야 동시성 카운트가 풀린다.
   */
  function tryAcquire(ip, cost) {
    const now = Date.now();
    rollDay(now);
    const entry = bucket(ip, now);

    if (globalDay.used + cost > config.globalDailyUnits) {
      return deny(
        'global_daily_limit',
        '오늘 무료 사용량이 모두 소진되었습니다. 내일 다시 이용해 주세요.',
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

  function usage(ip) {
    const now = Date.now();
    rollDay(now);
    const entry = bucket(ip, now);

    return {
      hourlyUsed: sum(entry.hour),
      hourlyLimit: config.hourlyUnits,
      dailyUsed: sum(entry.day),
      dailyLimit: config.dailyUnits,
      hourlyRemaining: Math.max(0, config.hourlyUnits - sum(entry.hour)),
      dailyRemaining: Math.max(0, config.dailyUnits - sum(entry.day)),
      globalUsed: globalDay.used,
      globalLimit: config.globalDailyUnits,
      globalRemaining: Math.max(0, config.globalDailyUnits - globalDay.used),
      globalResetInSec: secondsUntilTomorrow(now),
      active,
    };
  }

  // 오래된 IP 기록 정리 (프로세스를 붙잡지 않도록 unref)
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of perIp) {
      const kept = entry.day.filter((r) => now - r.t < DAY);
      if (!kept.length) perIp.delete(ip);
      else entry.day = kept;
    }
  }, 10 * MINUTE);
  sweeper.unref?.();

  return { tryAcquire, usage, config };
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
