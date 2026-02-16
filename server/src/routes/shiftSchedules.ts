import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get shift schedules
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, userId, shiftId, departman } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.tarih = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (userId) where.userId = parseInt(userId as string);
    if (shiftId) where.shiftId = parseInt(shiftId as string);

    if (departman) {
      where.user = { departman: departman as string };
    }

    const schedules = await prisma.vardiyaPlanlama.findMany({
      where,
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
        },
        shift: true
      },
      orderBy: [{ tarih: 'asc' }, { shiftId: 'asc' }]
    });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya programı alınamadı'
    });
  }
});

// Get schedules by date
router.get('/by-date/:date', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const targetDate = new Date(req.params.date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const schedules = await prisma.vardiyaPlanlama.findMany({
      where: {
        tarih: {
          gte: targetDate,
          lt: nextDay
        }
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
        },
        shift: true
      },
      orderBy: { shiftId: 'asc' }
    });

    // Vardiyalara göre grupla
    const groupedByShift = schedules.reduce((acc: any, schedule) => {
      const shiftId = schedule.shiftId;
      if (!acc[shiftId]) {
        acc[shiftId] = {
          shift: schedule.shift,
          personnel: []
        };
      }
      acc[shiftId].personnel.push({
        ...schedule.user,
        durum: schedule.durum
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(groupedByShift)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Günlük vardiya programı alınamadı'
    });
  }
});

// Create/Update shift schedule (bulk)
router.post('/bulk', authenticate, authorize('ADMIN', 'BAKIM_MUDURU', 'BAKIM_SEFI'), async (req: AuthRequest, res: Response) => {
  try {
    const { schedules } = req.body;
    // schedules: [{ userId, shiftId, tarih, durum }]

    const results = await Promise.all(
      schedules.map(async (schedule: any) => {
        const tarih = new Date(schedule.tarih);
        tarih.setHours(0, 0, 0, 0);

        return prisma.vardiyaPlanlama.upsert({
          where: {
            userId_tarih: {
              userId: schedule.userId,
              tarih
            }
          },
          update: {
            shiftId: schedule.shiftId,
            durum: schedule.durum || 'AKTIF'
          },
          create: {
            userId: schedule.userId,
            shiftId: schedule.shiftId,
            tarih,
            durum: schedule.durum || 'AKTIF'
          }
        });
      })
    );

    res.json({
      success: true,
      data: results,
      message: `${results.length} kayıt güncellendi`
    });
  } catch (error) {
    console.error('Bulk schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Vardiya programı kaydedilemedi'
    });
  }
});

// Update single schedule
router.put('/:id', authenticate, authorize('ADMIN', 'BAKIM_MUDURU', 'BAKIM_SEFI'), async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId, durum, notlar } = req.body;

    const schedule = await prisma.vardiyaPlanlama.update({
      where: { id: parseInt(req.params.id) },
      data: {
        shiftId,
        durum,
        notlar
      },
      include: {
        user: {
          select: {
            id: true,
            ad: true,
            soyad: true
          }
        },
        shift: true
      }
    });

    res.json({
      success: true,
      data: schedule,
      message: 'Vardiya güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya güncellenemedi'
    });
  }
});

// Delete schedule
router.delete('/:id', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.vardiyaPlanlama.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'Vardiya kaydı silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya kaydı silinemedi'
    });
  }
});

export { router as shiftSchedulesRouter };
