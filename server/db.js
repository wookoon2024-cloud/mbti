import pg from 'pg';

let rawConn = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '';
if (rawConn && rawConn.includes('?')) {
  rawConn = rawConn.split('?')[0];
}

export const pgPool = rawConn
  ? new pg.Pool({
      connectionString: rawConn,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    })
  : null;

let tableInitPromise = null;

export async function ensureLimitsTables() {
  if (!pgPool) return;
  if (!tableInitPromise) {
    tableInitPromise = pgPool.query(`
      CREATE TABLE IF NOT EXISTS talkscanner_limits (
        ip TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        runs_today INT DEFAULT 0,
        step1_last BIGINT DEFAULT 0,
        love_last BIGINT DEFAULT 0,
        has_referral_bonus BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS talkscanner_referrals (
        code TEXT PRIMARY KEY,
        creator_ip TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        redeemed_count INT DEFAULT 0,
        share_data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS talkscanner_analytics (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS talkscanner_active_sessions (
        ip TEXT PRIMARY KEY,
        last_seen BIGINT NOT NULL,
        user_agent TEXT,
        path TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `).catch((err) => {
      console.warn('[DB] Init tables error:', err.message);
      tableInitPromise = null;
    });
  }
  return tableInitPromise;
}

// 모듈 로드 시 테이블 자동 생성 보장
if (pgPool) {
  ensureLimitsTables().catch(() => {});
}
