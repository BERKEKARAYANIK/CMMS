import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  authenticate,
  AuthRequest,
  isBerkeUser,
  isSystemAdminUser,
  normalizeAuthText,
  resolveEffectiveRole
} from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  JWT_SECRET
} from '../config.js';
import {
  buildDefaultUserPassword,
  isPasswordPolicyCompliant,
  PASSWORD_POLICY_MESSAGE
} from '../utils/passwordPolicy.js';
import { logAccessEvent } from '../services/accessLogService.js';

const router = Router();

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
  path: '/'
};

const clearCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

type LoginUser = {
  id: number;
  sicilNo: string;
  ad: string;
  soyad: string;
  adSoyad: string | null;
  email: string | null;
  password: string | null;
  role: string;
  departman: string;
  aktif: boolean;
};

function compactValue(value: string | null | undefined): string {
  return normalizeAuthText(value).replace(/\s+/g, '');
}

function matchesLoginIdentifier(user: LoginUser, loginId: string): boolean {
  const normalizedLogin = normalizeAuthText(loginId);
  const compactLogin = compactValue(loginId);
  const fullName = normalizeAuthText(user.adSoyad || `${user.ad} ${user.soyad}`);

  return (
    normalizeAuthText(user.email) === normalizedLogin
    || normalizeAuthText(user.sicilNo) === normalizedLogin
    || fullName === normalizedLogin
    || compactValue(fullName) === compactLogin
  );
}

function getTokenFromRequest(req: AuthRequest): string | null {
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

router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      await logAccessEvent({
        req,
        eventType: 'LOGIN_FAILED',
        identifier: loginId || undefined,
        success: false,
        reason: 'MISSING_CREDENTIALS'
      });
      return res.status(400).json({
        success: false,
        message: 'Kullanici adi ve sifre gereklidir'
      });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { sicilNo: loginId },
          { adSoyad: loginId }
        ]
      }
    });

    if (!user) {
      const activeUsers = await prisma.user.findMany({
        where: { aktif: true }
      });
      user = activeUsers.find((candidate) => matchesLoginIdentifier(candidate as LoginUser, loginId)) || null;
    }

    if (!user || !user.password) {
      await logAccessEvent({
        req,
        eventType: 'LOGIN_FAILED',
        identifier: loginId,
        success: false,
        reason: 'INVALID_CREDENTIALS'
      });
      return res.status(401).json({
        success: false,
        message: 'Gecersiz kullanici adi veya sifre'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await logAccessEvent({
        req,
        eventType: 'LOGIN_FAILED',
        identifier: loginId,
        user,
        success: false,
        reason: 'INVALID_CREDENTIALS'
      });
      return res.status(401).json({
        success: false,
        message: 'Gecersiz kullanici adi veya sifre'
      });
    }

    if (!user.aktif) {
      await logAccessEvent({
        req,
        eventType: 'LOGIN_FAILED',
        identifier: loginId,
        user,
        success: false,
        reason: 'USER_INACTIVE'
      });
      return res.status(401).json({
        success: false,
        message: 'Hesabiniz pasif durumda'
      });
    }

    const sessionId = randomUUID();
    const token = jwt.sign({ userId: user.id, sessionId }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    await logAccessEvent({
      req,
      eventType: 'LOGIN_SUCCESS',
      user,
      sessionId,
      success: true
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          sicilNo: user.sicilNo,
          ad: user.ad,
          soyad: user.soyad,
          email: user.email,
          role: resolveEffectiveRole(user),
          departman: user.departman
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giris islemi basarisiz'
    });
  }
});

router.post('/logout', async (req: AuthRequest, res) => {
  let user: LoginUser | null = null;
  let sessionId = '';

  const token = getTokenFromRequest(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {userId?: number;sessionId?: string;};
      sessionId = String(decoded.sessionId || '').trim();
      if (decoded.userId && Number.isFinite(decoded.userId)) {
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            sicilNo: true,
            ad: true,
            soyad: true,
            adSoyad: true,
            email: true,
            password: true,
            role: true,
            departman: true,
            aktif: true
          }
        });
      }
    } catch {
      // Token invalid/expired; logout should still succeed without blocking.
    }
  }

  await logAccessEvent({
    req,
    eventType: 'LOGOUT',
    user,
    sessionId: sessionId || undefined,
    success: true,
    reason: 'USER_INITIATED'
  });

  res.clearCookie(AUTH_COOKIE_NAME, clearCookieOptions);
  res.json({ success: true });
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut ve yeni sifre gereklidir'
      });
    }

    if (!isPasswordPolicyCompliant(String(newPassword))) {
      return res.status(400).json({
        success: false,
        message: PASSWORD_POLICY_MESSAGE
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user?.password) {
      return res.status(400).json({
        success: false,
        message: 'Sifre guncellenemedi'
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Mevcut sifre hatali'
      });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Sifre guncellendi'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Sifre guncellenemedi'
    });
  }
});

router.post('/admin/set-user-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSystemAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu islem icin sistem yoneticisi yetkisi gerekli'
      });
    }

    const { userId, newPassword } = req.body as { userId?: number; newPassword?: string };
    const parsedUserId = Number.parseInt(String(userId ?? ''), 10);

    if (!parsedUserId || parsedUserId <= 0 || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Gecerli kullanici ve yeni sifre gereklidir'
      });
    }

    if (!isPasswordPolicyCompliant(String(newPassword).trim())) {
      return res.status(400).json({
        success: false,
        message: PASSWORD_POLICY_MESSAGE
      });
    }

    const target = await prisma.user.findUnique({ where: { id: parsedUserId } });
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Kullanici bulunamadi'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.user.update({
      where: { id: target.id },
      data: {
        password: hashedPassword,
        adSoyad: `${target.ad} ${target.soyad}`.replace(/\s+/g, ' ').trim()
      }
    });

    res.json({
      success: true,
      message: `${target.ad} ${target.soyad} sifresi guncellendi`
    });
  } catch (error) {
    console.error('Admin set user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanici sifresi guncellenemedi'
    });
  }
});

router.post('/admin/reset-all-passwords', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSystemAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu islem icin sistem yoneticisi yetkisi gerekli'
      });
    }

    const berkePassword = buildDefaultUserPassword('BERKE', 'KARAYANIK');
    const berkePasswordHash = await bcrypt.hash(berkePassword, 10);

    await prisma.user.upsert({
      where: { sicilNo: 'BERKE' },
      update: {
        ad: 'BERKE',
        soyad: 'KARAYANIK',
        adSoyad: 'BERKE KARAYANIK',
        email: 'berke@cmms.local',
        password: berkePasswordHash,
        departman: 'YONETIM',
        role: 'ADMIN',
        aktif: true
      },
      create: {
        sicilNo: 'BERKE',
        ad: 'BERKE',
        soyad: 'KARAYANIK',
        adSoyad: 'BERKE KARAYANIK',
        email: 'berke@cmms.local',
        password: berkePasswordHash,
        departman: 'YONETIM',
        role: 'ADMIN',
        aktif: true
      }
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        sicilNo: true,
        ad: true,
        soyad: true,
        adSoyad: true,
        email: true,
        role: true
      }
    });

    for (const user of users) {
      const defaultPassword = buildDefaultUserPassword(user.ad, user.soyad);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const fullName = `${user.ad} ${user.soyad}`.replace(/\s+/g, ' ').trim();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          adSoyad: fullName,
          password: hashedPassword,
          role: isBerkeUser(user) ? 'ADMIN' : user.role
        }
      });
    }

    res.json({
      success: true,
      data: {
        count: users.length,
        loginPattern: 'adsoyad',
        passwordPattern: 'bas_harfler(Ilk buyuk) + 123456'
      },
      message: `${users.length} kullanicinin sifresi varsayilan formata guncellendi`
    });
  } catch (error) {
    console.error('Admin reset all passwords error:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu sifre guncelleme basarisiz'
    });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        sicilNo: true,
        ad: true,
        soyad: true,
        email: true,
        telefon: true,
        departman: true,
        unvan: true,
        uzmanlikAlani: true,
        role: true
      }
    });

    res.json({
      success: true,
      data: user
        ? {
            ...user,
            departman: user.departman,
            role: resolveEffectiveRole(user)
          }
        : null
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Kullanici bilgileri alinamadi'
    });
  }
});

export { router as authRouter };
