import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function parseDateParam(value?: string): Date | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return startOfDay(parsed);
}

function parseMonthParam(value?: string): Date | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);

  if (month < 1 || month > 12) return null;

  const parsed = new Date(year, month - 1, 1);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function addOneDay(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

function addOneMonth(date: Date): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return (hour * 60) + minute;
}

function calculateShiftDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (start === null || end === null) return 0;

  if (end > start) {
    return end - start;
  }

  return (24 * 60 - start) + end;
}

function calculateAvailableMinutesFromSchedules(
  schedules: Array<{ shift: { baslangicSaati: string; bitisSaati: string } }>
): number {
  return schedules.reduce((total, schedule) => (
    total + calculateShiftDurationMinutes(schedule.shift.baslangicSaati, schedule.shift.bitisSaati)
  ), 0);
}

async function buildMinuteBasedSummary(where: any, availableMinutes: number) {
  const completedWhere: any = {
    ...where,
    durum: 'TAMAMLANDI',
    gerceklesenSure: { not: null }
  };

  const [completedWorkOrders, completionStats] = await Promise.all([
    prisma.isEmri.count({ where: completedWhere }),
    prisma.isEmri.aggregate({
      where: completedWhere,
      _avg: { gerceklesenSure: true },
      _sum: { gerceklesenSure: true }
    })
  ]);

  const completedMinutes = completionStats._sum.gerceklesenSure || 0;
  const workRate = availableMinutes > 0
    ? Math.round((completedMinutes / availableMinutes) * 100)
    : 0;

  return {
    completedWorkOrders,
    completedMinutes,
    availableMinutes,
    workRate,
    averageCompletionMinutes: Math.round(completionStats._avg.gerceklesenSure || 0)
  };
}

// Get all users
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { departman, role, aktif, search } = req.query;

    const where: any = {};

    if (departman) where.departman = departman;
    if (role) where.role = role;
    if (aktif !== undefined) where.aktif = aktif === 'true';
    if (search) {
      where.OR = [
        { ad: { contains: search as string } },
        { soyad: { contains: search as string } },
        { sicilNo: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
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
        role: true,
        aktif: true,
        createdAt: true
      },
      orderBy: { sicilNo: 'asc' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınamadı'
    });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
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
        role: true,
        aktif: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı alınamadı'
    });
  }
});

// Get personnel performance (daily, monthly and by shift)
router.get('/:id/performance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz personel ID'
      });
    }

    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
    const monthParam = typeof req.query.month === 'string' ? req.query.month : undefined;

    const parsedDate = parseDateParam(dateParam);
    if (dateParam && !parsedDate) {
      return res.status(400).json({
        success: false,
        message: 'Tarih formati YYYY-MM-DD olmali'
      });
    }

    const selectedDate = parsedDate || startOfDay(new Date());
    const parsedMonth = parseMonthParam(monthParam);
    if (monthParam && !parsedMonth) {
      return res.status(400).json({
        success: false,
        message: 'Ay formati YYYY-MM olmali'
      });
    }

    const selectedMonthStart = parsedMonth || new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    selectedMonthStart.setHours(0, 0, 0, 0);

    const personnel = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        sicilNo: true,
        ad: true,
        soyad: true,
        departman: true
      }
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personel bulunamadi'
      });
    }

    const assignmentWhere = {
      OR: [
        { atananId: userId },
        { personeller: { some: { userId } } }
      ]
    };

    const dayEnd = addOneDay(selectedDate);
    const monthEnd = addOneMonth(selectedMonthStart);

    const dailyWhere = {
      ...assignmentWhere,
      updatedAt: {
        gte: selectedDate,
        lt: dayEnd
      }
    };

    const monthlyWhere = {
      ...assignmentWhere,
      updatedAt: {
        gte: selectedMonthStart,
        lt: monthEnd
      }
    };

    const [dailySchedules, monthlySchedules, shifts, shiftCompletedStats] = await Promise.all([
      prisma.vardiyaPlanlama.findMany({
        where: {
          userId,
          durum: 'AKTIF',
          tarih: {
            gte: selectedDate,
            lt: dayEnd
          }
        },
        select: {
          shiftId: true,
          shift: {
            select: {
              baslangicSaati: true,
              bitisSaati: true
            }
          }
        }
      }),
      prisma.vardiyaPlanlama.findMany({
        where: {
          userId,
          durum: 'AKTIF',
          tarih: {
            gte: selectedMonthStart,
            lt: monthEnd
          }
        },
        select: {
          shift: {
            select: {
              baslangicSaati: true,
              bitisSaati: true
            }
          }
        }
      }),
      prisma.vardiya.findMany({
        select: {
          id: true,
          vardiyaAdi: true,
          baslangicSaati: true,
          bitisSaati: true,
          renk: true,
          sira: true
        },
        orderBy: { sira: 'asc' }
      }),
      prisma.isEmri.groupBy({
        by: ['shiftId'],
        where: {
          ...dailyWhere,
          durum: 'TAMAMLANDI',
          gerceklesenSure: { not: null },
          shiftId: { not: null }
        },
        _count: { _all: true },
        _sum: { gerceklesenSure: true },
        _avg: { gerceklesenSure: true }
      })
    ]);

    const [daily, monthly] = await Promise.all([
      buildMinuteBasedSummary(dailyWhere, calculateAvailableMinutesFromSchedules(dailySchedules)),
      buildMinuteBasedSummary(monthlyWhere, calculateAvailableMinutesFromSchedules(monthlySchedules))
    ]);

    const scheduledShiftIds = new Set(dailySchedules.map((schedule) => schedule.shiftId));
    const shiftStatsMap = new Map(
      shiftCompletedStats
        .filter((item) => item.shiftId !== null)
        .map((item) => [
          item.shiftId as number,
          {
            completedWorkOrders: item._count._all,
            completedMinutes: item._sum.gerceklesenSure || 0,
            averageCompletionMinutes: Math.round(item._avg.gerceklesenSure || 0)
          }
        ])
    );

    const shiftPerformance = shifts.map((shift) => {
      const shiftDurationMinutes = calculateShiftDurationMinutes(shift.baslangicSaati, shift.bitisSaati);
      const isScheduled = scheduledShiftIds.has(shift.id);
      const availableMinutes = isScheduled ? shiftDurationMinutes : 0;
      const shiftStats = shiftStatsMap.get(shift.id);
      const completedMinutes = shiftStats?.completedMinutes || 0;

      return {
        shiftId: shift.id,
        shiftName: shift.vardiyaAdi,
        shiftStart: shift.baslangicSaati,
        shiftEnd: shift.bitisSaati,
        color: shift.renk || '#3B82F6',
        isScheduled,
        completedWorkOrders: shiftStats?.completedWorkOrders || 0,
        completedMinutes,
        availableMinutes,
        workRate: availableMinutes > 0 ? Math.round((completedMinutes / availableMinutes) * 100) : 0,
        averageCompletionMinutes: shiftStats?.averageCompletionMinutes || 0
      };
    });

    res.json({
      success: true,
      data: {
        user: personnel,
        period: {
          date: toDateKey(selectedDate),
          month: toMonthKey(selectedMonthStart)
        },
        daily,
        monthly,
        shifts: shiftPerformance
      }
    });
  } catch (error) {
    console.error('Get personnel performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Personel performansi alinamadi'
    });
  }
});

// Create user
router.post('/', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    const { sicilNo, ad, soyad, email, password, telefon, departman, unvan, uzmanlikAlani, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ sicilNo }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu sicil no veya email zaten kullanılıyor'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        sicilNo,
        ad,
        soyad,
        email,
        password: hashedPassword,
        telefon,
        departman,
        unvan,
        uzmanlikAlani,
        role: role || 'TEKNISYEN'
      },
      select: {
        id: true,
        sicilNo: true,
        ad: true,
        soyad: true,
        email: true,
        departman: true,
        role: true
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Kullanıcı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulamadı'
    });
  }
});

// Update user
router.put('/:id', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    const { ad, soyad, email, telefon, departman, unvan, uzmanlikAlani, role, aktif } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ad,
        soyad,
        email,
        telefon,
        departman,
        unvan,
        uzmanlikAlani,
        role,
        aktif
      },
      select: {
        id: true,
        sicilNo: true,
        ad: true,
        soyad: true,
        email: true,
        departman: true,
        role: true,
        aktif: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'Kullanıcı güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenemedi'
    });
  }
});

// Get users by shift
router.get('/by-shift/:shiftId/:date', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId, date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const schedules = await prisma.vardiyaPlanlama.findMany({
      where: {
        shiftId: parseInt(shiftId),
        tarih: targetDate,
        durum: 'AKTIF'
      },
      include: {
        user: {
          select: {
            id: true,
            sicilNo: true,
            ad: true,
            soyad: true,
            departman: true,
            uzmanlikAlani: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: schedules.map(s => s.user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya personeli alınamadı'
    });
  }
});

export { router as usersRouter };
