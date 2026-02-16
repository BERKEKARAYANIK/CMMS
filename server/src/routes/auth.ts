import { Router, Response } from 'express';
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

function buildDefaultUserPassword(ad: string, soyad: string): string {
  const parts = normalizeAuthText(`${ad} ${soyad}`)
    .split(' ')
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  const initials = parts.map((part) => part.charAt(0).toLowerCase()).join('');
  return `${initials || 'user'}123456`;
}

router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
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
      return res.status(401).json({
        success: false,
        message: 'Gecersiz kullanici adi veya sifre'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Gecersiz kullanici adi veya sifre'
      });
    }

    if (!user.aktif) {
      return res.status(401).json({
        success: false,
        message: 'Hesabiniz pasif durumda'
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

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

router.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearCookieOptions);
  res.json({ success: true });
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSystemAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Bu islem sadece sistem yoneticisi icin kullanilabilir'
      });
    }
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
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

    if (!parsedUserId || parsedUserId <= 0 || !newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Gecerli kullanici ve en az 6 karakter yeni sifre gereklidir'
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
        passwordPattern: 'bas_harfler + 123456'
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
