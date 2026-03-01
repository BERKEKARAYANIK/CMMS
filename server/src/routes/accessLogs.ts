import { Router, Response } from 'express';
import {
  authenticate,
  AuthRequest,
  isBerkeUser,
  isSystemAdminUser
} from '../middleware/auth.js';
import {
  AccessLogEventType,
  AccessLogFilters,
  getAccessLogSummary,
  listAccessLogs
} from '../services/accessLogService.js';

const router = Router();

const ACCESS_LOG_EVENT_TYPES = new Set<AccessLogEventType>([
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT'
]);

function normalizeText(value: unknown): string {
  return String(value || '').trim();
}

function parsePositiveInt(value: unknown): number | undefined {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function parseEventType(value: unknown): AccessLogEventType | undefined {
  const normalized = normalizeText(value).toUpperCase();
  if (!normalized) return undefined;
  if (!ACCESS_LOG_EVENT_TYPES.has(normalized as AccessLogEventType)) {
    return undefined;
  }
  return normalized as AccessLogEventType;
}

function canViewAccessLogs(user: AuthRequest['user'] | undefined): boolean {
  if (!user) return false;
  return isBerkeUser(user) || isSystemAdminUser(user);
}

function buildFilters(req: AuthRequest): AccessLogFilters {
  return {
    from: normalizeText(req.query?.from),
    to: normalizeText(req.query?.to),
    department: normalizeText(req.query?.department),
    userId: parsePositiveInt(req.query?.userId),
    eventType: parseEventType(req.query?.eventType),
    limit: parsePositiveInt(req.query?.limit)
  };
}

router.get('/events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canViewAccessLogs(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu kayitlari sadece sistem yoneticisi goruntuleyebilir'
      });
    }

    const filters = buildFilters(req);
    const events = await listAccessLogs(filters);
    return res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get access log events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erisim loglari alinamadi'
    });
  }
});

router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canViewAccessLogs(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu kayitlari sadece sistem yoneticisi goruntuleyebilir'
      });
    }

    const filters = buildFilters(req);
    const summary = await getAccessLogSummary(filters);
    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get access log summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erisim log ozeti alinamadi'
    });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canViewAccessLogs(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu kayitlari sadece sistem yoneticisi goruntuleyebilir'
      });
    }

    const filters = buildFilters(req);
    const [events, summary] = await Promise.all([
      listAccessLogs(filters),
      getAccessLogSummary(filters)
    ]);

    return res.json({
      success: true,
      data: {
        filters,
        summary,
        events
      }
    });
  } catch (error) {
    console.error('Get access logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erisim loglari alinamadi'
    });
  }
});

export { router as accessLogsRouter };
