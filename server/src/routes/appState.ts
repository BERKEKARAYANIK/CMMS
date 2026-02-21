import { Router, Response } from 'express';
import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest, isSystemAdminUser } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const KEY_PATTERN = /^[a-z0-9:_-]{2,100}$/i;
const SETTINGS_LISTS_KEY = 'settings:lists';
const ADMIN_ONLY_WRITE_KEYS = new Set<string>([
  'dashboard:five_s_levels'
]);
const VALID_APP_ROLES = new Set(['ADMIN', 'BAKIM_MUDURU', 'BAKIM_SEFI', 'TEKNISYEN', 'OPERATOR']);

type TransactionClient = Prisma.TransactionClient;
type NormalizedPersonnel = {
  sicilNo: string;
  ad: string;
  soyad: string;
  adSoyad: string;
  departman: string;
  role: string;
};

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

function pickFirstText(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const text = String(source[key] ?? '').trim();
    if (text) return text;
  }
  return '';
}

function splitFullName(fullName: string): { ad: string; soyad: string } {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return { ad: '', soyad: '' };
  if (parts.length === 1) return { ad: parts[0], soyad: '' };

  return {
    ad: parts.slice(0, -1).join(' '),
    soyad: parts[parts.length - 1]
  };
}

function normalizeRole(value: string): string {
  const role = String(value || '').trim().toUpperCase();
  if (VALID_APP_ROLES.has(role)) return role;
  return 'TEKNISYEN';
}

function normalizeAuthText(value: string): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDefaultPassword(ad: string, soyad: string): string {
  const parts = normalizeAuthText(`${ad} ${soyad}`)
    .split(' ')
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const initials = parts.map((part) => part.charAt(0)).join('');
  return `${initials || 'user'}123456`;
}

function buildDefaultEmail(sicilNo: string): string {
  const compact = normalizeAuthText(sicilNo)
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
  return `${compact || 'user'}@cmms.local`;
}

function normalizePersonnelList(payload: unknown): NormalizedPersonnel[] {
  if (!payload || typeof payload !== 'object') return [];

  const source = payload as Record<string, unknown>;
  const rows = Array.isArray(source.personelListesi) ? source.personelListesi : [];
  const seen = new Set<string>();

  return rows.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;

    const sicilNo = pickFirstText(row, ['sicilNo', 'sicil_no', 'sicil', 'personelNo', 'personel_no']);
    if (!sicilNo || seen.has(sicilNo)) return [];

    let ad = pickFirstText(row, ['ad', 'isim', 'firstName', 'first_name']);
    let soyad = pickFirstText(row, ['soyad', 'lastName', 'last_name']);
    const fullName = pickFirstText(row, ['adSoyad', 'ad_soyad', 'adsoyad', 'fullName', 'full_name']);

    if ((!ad || !soyad) && fullName) {
      const split = splitFullName(fullName);
      if (!ad) ad = split.ad;
      if (!soyad) soyad = split.soyad;
    }

    const adSoyad = String(fullName || `${ad} ${soyad}`)
      .replace(/\s+/g, ' ')
      .trim();
    const departman = pickFirstText(row, ['bolum', 'departman', 'department']) || 'BAKIM';
    const role = normalizeRole(pickFirstText(row, ['rol', 'role']));

    if (!ad || !soyad || !adSoyad) return [];

    seen.add(sicilNo);
    return [{
      sicilNo,
      ad,
      soyad,
      adSoyad,
      departman,
      role
    }];
  });
}

async function syncUsersFromSettingsPersonnel(
  tx: TransactionClient,
  payload: unknown
): Promise<{ total: number; created: number; updated: number; passwordAssigned: number }> {
  const personnel = normalizePersonnelList(payload);
  if (personnel.length === 0) {
    return {
      total: 0,
      created: 0,
      updated: 0,
      passwordAssigned: 0
    };
  }

  const sicilNos = personnel.map((row) => row.sicilNo);
  const defaultEmails = personnel.map((row) => buildDefaultEmail(row.sicilNo));

  const existingUsers = await tx.user.findMany({
    where: {
      OR: [
        { sicilNo: { in: sicilNos } },
        { email: { in: defaultEmails } }
      ]
    },
    select: {
      id: true,
      sicilNo: true,
      ad: true,
      soyad: true,
      adSoyad: true,
      departman: true,
      email: true,
      password: true,
      role: true,
      aktif: true
    }
  });

  const bySicilNo = new Map(existingUsers.map((row) => [row.sicilNo, row]));
  const emailOwner = new Map(
    existingUsers
      .filter((row) => Boolean(row.email))
      .map((row) => [String(row.email).toLowerCase(), row.sicilNo])
  );

  let created = 0;
  let updated = 0;
  let passwordAssigned = 0;

  for (const row of personnel) {
    const existing = bySicilNo.get(row.sicilNo);
    const candidateEmail = buildDefaultEmail(row.sicilNo).toLowerCase();
    const emailBelongsTo = emailOwner.get(candidateEmail);
    const emailAvailable = !emailBelongsTo || emailBelongsTo === row.sicilNo;

    if (existing) {
      const data: Prisma.UserUpdateInput = {};

      if (existing.ad !== row.ad) data.ad = row.ad;
      if (existing.soyad !== row.soyad) data.soyad = row.soyad;
      if (existing.adSoyad !== row.adSoyad) data.adSoyad = row.adSoyad;
      if (existing.departman !== row.departman) data.departman = row.departman;
      if (!existing.aktif) data.aktif = true;

      if (!existing.email && emailAvailable) {
        data.email = candidateEmail;
      }

      if (!existing.password) {
        data.password = await bcrypt.hash(buildDefaultPassword(row.ad, row.soyad), 10);
        passwordAssigned += 1;
      }

      if (!existing.role || !VALID_APP_ROLES.has(String(existing.role).toUpperCase())) {
        data.role = row.role;
      }

      if (Object.keys(data).length > 0) {
        await tx.user.update({
          where: { sicilNo: row.sicilNo },
          data
        });
      }

      if (!existing.email && emailAvailable) {
        emailOwner.set(candidateEmail, row.sicilNo);
      }

      updated += 1;
      continue;
    }

    const password = await bcrypt.hash(buildDefaultPassword(row.ad, row.soyad), 10);
    passwordAssigned += 1;

    await tx.user.create({
      data: {
        sicilNo: row.sicilNo,
        ad: row.ad,
        soyad: row.soyad,
        adSoyad: row.adSoyad,
        email: emailAvailable ? candidateEmail : null,
        password,
        departman: row.departman,
        role: row.role,
        aktif: true
      }
    });

    if (emailAvailable) {
      emailOwner.set(candidateEmail, row.sicilNo);
    }

    created += 1;
  }

  return {
    total: personnel.length,
    created,
    updated,
    passwordAssigned
  };
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

    if (ADMIN_ONLY_WRITE_KEYS.has(key) && !isSystemAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu uygulama ayarini sadece sistem yoneticisi veya Berke Karayanik guncelleyebilir'
      });
    }

    const payload = Object.prototype.hasOwnProperty.call(req.body || {}, 'value')
      ? req.body.value
      : null;

    const serializedPayload = serializeValue(payload);
    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.appState.upsert({
        where: { appKey: key },
        create: {
          appKey: key,
          jsonValue: serializedPayload
        },
        update: {
          jsonValue: serializedPayload
        },
        select: {
          appKey: true,
          jsonValue: true
        }
      });

      const personnelSync = key === SETTINGS_LISTS_KEY
        ? await syncUsersFromSettingsPersonnel(tx, payload)
        : null;

      return { row, personnelSync };
    });

    res.json({
      success: true,
      data: {
        key: result.row.appKey,
        value: parseValue(result.row.jsonValue),
        personnelSync: result.personnelSync
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
