import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const KEY_PATTERN = /^[a-z0-9:_-]{2,100}$/i;

function normalizeKey(value: unknown): string | null {
  const key = String(value || '').trim();
  if (!key || !KEY_PATTERN.test(key)) return null;
  return key;
}

function serializeValue(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return 'null';
  }
}

function parseValue(payload: string): unknown {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rawKeys = String(req.query.keys || '').trim();
    if (!rawKeys) {
      return res.status(400).json({
        success: false,
        message: 'En az bir key giriniz'
      });
    }

    const keys = rawKeys
      .split(',')
      .map((key) => normalizeKey(key))
      .filter((key): key is string => Boolean(key));

    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz key'
      });
    }

    const rows = await prisma.appState.findMany({
      where: {
        appKey: {
          in: keys
        }
      },
      select: {
        appKey: true,
        jsonValue: true
      }
    });

    const mapped = rows.reduce<Record<string, unknown>>((acc, row) => {
      acc[row.appKey] = parseValue(row.jsonValue);
      return acc;
    }, {});

    res.json({
      success: true,
      data: mapped
    });
  } catch (error) {
    console.error('Get app state batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Uygulama ayarlari alinamadi'
    });
  }
});

router.get('/:key', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const key = normalizeKey(req.params.key);
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz key'
      });
    }

    const row = await prisma.appState.findUnique({
      where: { appKey: key },
      select: {
        appKey: true,
        jsonValue: true
      }
    });

    res.json({
      success: true,
      data: {
        key,
        value: row ? parseValue(row.jsonValue) : null
      }
    });
  } catch (error) {
    console.error('Get app state error:', error);
    res.status(500).json({
      success: false,
      message: 'Uygulama ayari alinamadi'
    });
  }
});

router.put('/:key', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const key = normalizeKey(req.params.key);
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz key'
      });
    }

    const payload = Object.prototype.hasOwnProperty.call(req.body || {}, 'value')
      ? req.body.value
      : null;

    const row = await prisma.appState.upsert({
      where: { appKey: key },
      create: {
        appKey: key,
        jsonValue: serializeValue(payload)
      },
      update: {
        jsonValue: serializeValue(payload)
      },
      select: {
        appKey: true,
        jsonValue: true
      }
    });

    res.json({
      success: true,
      data: {
        key: row.appKey,
        value: parseValue(row.jsonValue)
      },
      message: 'Uygulama ayari kaydedildi'
    });
  } catch (error) {
    console.error('Set app state error:', error);
    res.status(500).json({
      success: false,
      message: 'Uygulama ayari kaydedilemedi'
    });
  }
});

export { router as appStateRouter };
