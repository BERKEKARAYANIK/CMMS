import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AUTH_COOKIE_NAME, JWT_SECRET } from '../config.js';

export type AppRole = 'ADMIN' | 'BAKIM_MUDURU' | 'BAKIM_SEFI' | 'TEKNISYEN' | 'OPERATOR';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    sicilNo: string;
    email: string | null;
    departman: string;
    role: AppRole;
    ad: string;
    soyad: string;
  };
}

type UserIdentity = {
  role?: string | null;
  ad?: string | null;
  soyad?: string | null;
  adSoyad?: string | null;
  email?: string | null;
  sicilNo?: string | null;
};

const READ_ONLY_INSPECTOR_SICIL_NO = 'izleyici';
const READ_ONLY_INSPECTOR_EMAIL = 'izleyici@cmms.local';

export function normalizeAuthText(value: string | null | undefined): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\u0131/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BERKE_ADMIN_SICIL_NOS = new Set(
  String(process.env.BERKE_ADMIN_SICIL_NOS || 'BERKE')
    .split(',')
    .map((value) => normalizeAuthText(value))
    .filter(Boolean)
);

export function isBerkeUser(identity: UserIdentity | null | undefined): boolean {
  if (!identity) return false;
  const sicilNo = normalizeAuthText(identity.sicilNo);
  return Boolean(sicilNo && BERKE_ADMIN_SICIL_NOS.has(sicilNo));
}

export function isReadOnlyInspectorUser(identity: UserIdentity | null | undefined): boolean {
  if (!identity) return false;

  const sicilNo = normalizeAuthText(identity.sicilNo);
  const email = normalizeAuthText(identity.email);

  return sicilNo === READ_ONLY_INSPECTOR_SICIL_NO || email === READ_ONLY_INSPECTOR_EMAIL;
}

export function resolveEffectiveRole(identity: UserIdentity | null | undefined): AppRole {
  if (isReadOnlyInspectorUser(identity)) return 'OPERATOR';
  if (isBerkeUser(identity)) return 'ADMIN';

  const role = String(identity?.role || '').toUpperCase();
  if (
    role === 'ADMIN'
    || role === 'BAKIM_MUDURU'
    || role === 'BAKIM_SEFI'
    || role === 'TEKNISYEN'
    || role === 'OPERATOR'
  ) {
    return role as AppRole;
  }

  return 'TEKNISYEN';
}

export function isSystemAdminUser(identity: UserIdentity | null | undefined): boolean {
  return resolveEffectiveRole(identity) === 'ADMIN';
}

function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(`${AUTH_COOKIE_NAME}=`.length));
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme bilgisi bulunamadi'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        sicilNo: true,
        email: true,
        departman: true,
        role: true,
        ad: true,
        soyad: true,
        aktif: true
      }
    });

    if (!user || !user.aktif) {
      return res.status(401).json({
        success: false,
        message: 'Gecersiz veya pasif kullanici'
      });
    }

    req.user = {
      ...user,
      role: resolveEffectiveRole(user)
    };

    const requestMethod = String(req.method || '').toUpperCase();
    const isReadOnlyMethod = requestMethod === 'GET' || requestMethod === 'HEAD' || requestMethod === 'OPTIONS';
    if (isReadOnlyInspectorUser(req.user) && !isReadOnlyMethod) {
      return res.status(403).json({
        success: false,
        message: 'Bu hesap sadece goruntuleme islemleri yapabilir'
      });
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Gecersiz token'
    });
  }
}

export function authorize(...roles: AppRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu islem icin yetkiniz yok'
      });
    }

    next();
  };
}

