import type { Request } from 'express';
import { prisma } from '../lib/prisma.js';

export type AccessLogEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT';

const ACCESS_LOG_EVENT_TYPES = new Set<AccessLogEventType>([
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT'
]);
const SQLITE_TURKEY_OFFSET = '+3 hours';

export type AccessLogUserIdentity = {
  id?: number | null;
  sicilNo?: string | null;
  ad?: string | null;
  soyad?: string | null;
  adSoyad?: string | null;
  role?: string | null;
  departman?: string | null;
};

export type AccessLogWriteInput = {
  req?: Request;
  eventType: AccessLogEventType;
  user?: AccessLogUserIdentity | null;
  identifier?: string | null;
  sessionId?: string | null;
  success?: boolean;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AccessLogFilters = {
  from?: string;
  to?: string;
  department?: string;
  userId?: number;
  eventType?: AccessLogEventType;
  limit?: number;
};

export type AccessLogEvent = {
  id: number;
  eventType: AccessLogEventType;
  userId: number | null;
  sicilNo: string;
  fullName: string;
  role: string;
  department: string;
  identifier: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AccessLogSummary = {
  totalLoginSuccess: number;
  totalLoginFailed: number;
  totalLogout: number;
  uniqueLoginUsers: number;
  topUsers: Array<{
    userId: number;
    fullName: string;
    sicilNo: string;
    department: string;
    loginCount: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    loginCount: number;
  }>;
  dailyDistribution: Array<{
    day: string;
    loginSuccess: number;
    loginFailed: number;
    logoutCount: number;
  }>;
};

let ensureTablePromise: Promise<void> | null = null;

function normalizeText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeCreatedAtIsoUtc(value: unknown): string {
  const raw = normalizeText(value);
  if (!raw) return '';

  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
  const withTimeZone = hasTimeZone ? normalized : `${normalized}Z`;
  const parsed = new Date(withTimeZone);

  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString();
}

function normalizeEventType(value: unknown): AccessLogEventType | undefined {
  const normalized = normalizeText(value).toUpperCase();
  if (!normalized) return undefined;
  return ACCESS_LOG_EVENT_TYPES.has(normalized as AccessLogEventType)
    ? normalized as AccessLogEventType
    : undefined;
}

function parseDateFilter(value: unknown): string | undefined {
  const text = normalizeText(value);
  if (!text) return undefined;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function parseLimit(value: unknown): number {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (Number.isNaN(parsed)) return 200;
  if (parsed < 1) return 1;
  if (parsed > 1000) return 1000;
  return parsed;
}

function resolveClientIp(req?: Request): string {
  if (!req) return '';

  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0] || '').split(',')[0].trim();
  }

  return normalizeText(req.ip || req.socket?.remoteAddress || '');
}

function resolveUserAgent(req?: Request): string {
  if (!req) return '';
  const value = req.headers['user-agent'];
  if (typeof value !== 'string') return '';
  return value.slice(0, 1000);
}

function buildWhereClause(filters: AccessLogFilters, includeEventType: boolean): {whereSql: string;params: unknown[];} {
  const clauses: string[] = [];
  const params: unknown[] = [];

  const fromIso = parseDateFilter(filters.from);
  if (fromIso) {
    clauses.push('created_at >= ?');
    params.push(fromIso);
  }

  const toIso = parseDateFilter(filters.to);
  if (toIso) {
    clauses.push('created_at <= ?');
    params.push(toIso);
  }

  const department = normalizeText(filters.department);
  if (department) {
    clauses.push('UPPER(TRIM(department)) = UPPER(TRIM(?))');
    params.push(department);
  }

  if (typeof filters.userId === 'number' && Number.isFinite(filters.userId) && filters.userId > 0) {
    clauses.push('user_id = ?');
    params.push(Math.floor(filters.userId));
  }

  const eventType = includeEventType ? normalizeEventType(filters.eventType) : undefined;
  if (eventType) {
    clauses.push('event_type = ?');
    params.push(eventType);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

async function ensureAccessLogTable(): Promise<void> {
  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_access_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          user_id INTEGER NULL,
          sicil_no TEXT NULL,
          full_name TEXT NULL,
          role TEXT NULL,
          department TEXT NULL,
          identifier TEXT NULL,
          session_id TEXT NULL,
          ip_address TEXT NULL,
          user_agent TEXT NULL,
          success INTEGER NOT NULL DEFAULT 1,
          reason TEXT NULL,
          metadata_json TEXT NULL,
          created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
        )
      `);

      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS idx_user_access_logs_created_at ON user_access_logs(created_at)'
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS idx_user_access_logs_event_type ON user_access_logs(event_type)'
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS idx_user_access_logs_user_id ON user_access_logs(user_id)'
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS idx_user_access_logs_department ON user_access_logs(department)'
      );
      await prisma.$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS idx_user_access_logs_session_id ON user_access_logs(session_id)'
      );
    })().catch((error) => {
      ensureTablePromise = null;
      throw error;
    });
  }

  await ensureTablePromise;
}

function parseMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function logAccessEvent(input: AccessLogWriteInput): Promise<void> {
  try {
    await ensureAccessLogTable();

    const eventType = normalizeEventType(input.eventType);
    if (!eventType) return;

    const user = input.user || null;
    const userId = user?.id && Number.isFinite(user.id) ? Math.floor(Number(user.id)) : null;
    const sicilNo = normalizeText(user?.sicilNo);
    const fullName = normalizeText(
      user?.adSoyad || [normalizeText(user?.ad), normalizeText(user?.soyad)].filter(Boolean).join(' ')
    );
    const role = normalizeText(user?.role);
    const department = normalizeText(user?.departman);
    const identifier = normalizeText(input.identifier);
    const sessionId = normalizeText(input.sessionId);
    const ipAddress = resolveClientIp(input.req);
    const userAgent = resolveUserAgent(input.req);
    const reason = normalizeText(input.reason);
    const success = typeof input.success === 'boolean' ? input.success : eventType !== 'LOGIN_FAILED';
    const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO user_access_logs (
        event_type,
        user_id,
        sicil_no,
        full_name,
        role,
        department,
        identifier,
        session_id,
        ip_address,
        user_agent,
        success,
        reason,
        metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      eventType,
      userId,
      sicilNo || null,
      fullName || null,
      role || null,
      department || null,
      identifier || null,
      sessionId || null,
      ipAddress || null,
      userAgent || null,
      success ? 1 : 0,
      reason || null,
      metadataJson
    );
  } catch (error) {
    console.error('Access log write failed:', error);
  }
}

export async function listAccessLogs(filters: AccessLogFilters): Promise<AccessLogEvent[]> {
  await ensureAccessLogTable();

  const { whereSql, params } = buildWhereClause(filters, true);
  const limit = parseLimit(filters.limit);
  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT
      id,
      event_type AS eventType,
      user_id AS userId,
      sicil_no AS sicilNo,
      full_name AS fullName,
      role,
      department,
      identifier,
      session_id AS sessionId,
      ip_address AS ipAddress,
      user_agent AS userAgent,
      success,
      reason,
      metadata_json AS metadataJson,
      created_at AS createdAt
    FROM user_access_logs
    ${whereSql}
    ORDER BY id DESC
    LIMIT ?`,
    ...params,
    limit
  );

  return rows.map((row) => ({
    id: Number(row.id || 0),
    eventType: normalizeEventType(row.eventType) || 'LOGIN_FAILED',
    userId: row.userId === null || row.userId === undefined ? null : Number(row.userId),
    sicilNo: normalizeText(row.sicilNo),
    fullName: normalizeText(row.fullName),
    role: normalizeText(row.role),
    department: normalizeText(row.department),
    identifier: normalizeText(row.identifier),
    sessionId: normalizeText(row.sessionId),
    ipAddress: normalizeText(row.ipAddress),
    userAgent: normalizeText(row.userAgent),
    success: Number(row.success || 0) === 1,
    reason: normalizeText(row.reason),
    metadata: parseMetadata(row.metadataJson),
    createdAt: normalizeCreatedAtIsoUtc(row.createdAt)
  }));
}

export async function getAccessLogSummary(filters: AccessLogFilters): Promise<AccessLogSummary> {
  await ensureAccessLogTable();

  const { whereSql, params } = buildWhereClause(filters, false);
  const summaryRows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT
      COALESCE(SUM(CASE WHEN event_type = 'LOGIN_SUCCESS' THEN 1 ELSE 0 END), 0) AS totalLoginSuccess,
      COALESCE(SUM(CASE WHEN event_type = 'LOGIN_FAILED' THEN 1 ELSE 0 END), 0) AS totalLoginFailed,
      COALESCE(SUM(CASE WHEN event_type = 'LOGOUT' THEN 1 ELSE 0 END), 0) AS totalLogout,
      COALESCE(COUNT(DISTINCT CASE WHEN event_type = 'LOGIN_SUCCESS' THEN user_id END), 0) AS uniqueLoginUsers
    FROM user_access_logs
    ${whereSql}`,
    ...params
  );
  const summary = summaryRows[0] || {};

  const topUsers = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT
      user_id AS userId,
      COALESCE(full_name, '') AS fullName,
      COALESCE(sicil_no, '') AS sicilNo,
      COALESCE(department, '') AS department,
      COUNT(*) AS loginCount
    FROM user_access_logs
    ${whereSql ? `${whereSql} AND` : 'WHERE'} event_type = 'LOGIN_SUCCESS' AND user_id IS NOT NULL
    GROUP BY user_id, full_name, sicil_no, department
    ORDER BY loginCount DESC
    LIMIT 10`,
    ...params
  );

  const hourlyDistribution = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT
      strftime('%H', datetime(created_at, '${SQLITE_TURKEY_OFFSET}')) AS hour,
      COUNT(*) AS loginCount
    FROM user_access_logs
    ${whereSql ? `${whereSql} AND` : 'WHERE'} event_type = 'LOGIN_SUCCESS'
    GROUP BY strftime('%H', datetime(created_at, '${SQLITE_TURKEY_OFFSET}'))
    ORDER BY hour ASC`,
    ...params
  );

  const dailyDistribution = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT
      date(datetime(created_at, '${SQLITE_TURKEY_OFFSET}')) AS day,
      COALESCE(SUM(CASE WHEN event_type = 'LOGIN_SUCCESS' THEN 1 ELSE 0 END), 0) AS loginSuccess,
      COALESCE(SUM(CASE WHEN event_type = 'LOGIN_FAILED' THEN 1 ELSE 0 END), 0) AS loginFailed,
      COALESCE(SUM(CASE WHEN event_type = 'LOGOUT' THEN 1 ELSE 0 END), 0) AS logoutCount
    FROM user_access_logs
    ${whereSql}
    GROUP BY date(datetime(created_at, '${SQLITE_TURKEY_OFFSET}'))
    ORDER BY day DESC
    LIMIT 30`,
    ...params
  );

  return {
    totalLoginSuccess: Number(summary.totalLoginSuccess || 0),
    totalLoginFailed: Number(summary.totalLoginFailed || 0),
    totalLogout: Number(summary.totalLogout || 0),
    uniqueLoginUsers: Number(summary.uniqueLoginUsers || 0),
    topUsers: topUsers.map((row) => ({
      userId: Number(row.userId || 0),
      fullName: normalizeText(row.fullName),
      sicilNo: normalizeText(row.sicilNo),
      department: normalizeText(row.department),
      loginCount: Number(row.loginCount || 0)
    })),
    hourlyDistribution: hourlyDistribution.map((row) => ({
      hour: normalizeText(row.hour),
      loginCount: Number(row.loginCount || 0)
    })),
    dailyDistribution: dailyDistribution.map((row) => ({
      day: normalizeText(row.day),
      loginSuccess: Number(row.loginSuccess || 0),
      loginFailed: Number(row.loginFailed || 0),
      logoutCount: Number(row.logoutCount || 0)
    }))
  };
}
