import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get dashboard summary
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Paralel sorgular
    const [
      totalEquipment,
      activeEquipment,
      totalPersonnel,
      todayWorkOrders,
      monthlyWorkOrders,
      upcomingPM,
      overduePM,
      todayShiftStats
    ] = await Promise.all([
      // Toplam ekipman
      prisma.makina.count(),

      // Aktif ekipman
      prisma.makina.count({ where: { durum: 'AKTIF' } }),

      // Toplam personel
      prisma.user.count({ where: { aktif: true } }),

      // Bugünkü iş emirleri
      prisma.isEmri.groupBy({
        by: ['durum'],
        where: {
          createdAt: { gte: today, lt: tomorrow }
        },
        _count: true
      }),

      // Bu ayki iş emirleri
      prisma.isEmri.groupBy({
        by: ['durum'],
        where: {
          createdAt: { gte: thisMonthStart, lt: thisMonthEnd }
        },
        _count: true
      }),

      // Yaklaşan periyodik bakımlar (7 gün içinde)
      prisma.periyodikBakim.count({
        where: {
          aktif: true,
          sonrakiTarih: {
            gte: today,
            lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Gecikmiş periyodik bakımlar
      prisma.periyodikBakim.count({
        where: {
          aktif: true,
          sonrakiTarih: { lt: today }
        }
      }),

      // Bugünkü vardiya istatistikleri
      prisma.vardiyaPlanlama.groupBy({
        by: ['shiftId'],
        where: {
          tarih: { gte: today, lt: tomorrow },
          durum: 'AKTIF'
        },
        _count: true
      })
    ]);

    // İş emri istatistiklerini düzenle
    const formatWorkOrderStats = (data: any[]) => {
      const stats = {
        beklemede: 0,
        atandi: 0,
        devamEdiyor: 0,
        tamamlandi: 0,
        iptal: 0,
        toplam: 0
      };

      const statusMap: Record<string, keyof typeof stats> = {
        BEKLEMEDE: 'beklemede',
        ATANDI: 'atandi',
        DEVAM_EDIYOR: 'devamEdiyor',
        TAMAMLANDI: 'tamamlandi',
        IPTAL: 'iptal'
      };

      data.forEach(item => {
        const key = statusMap[item.durum];
        if (key) {
          stats[key] = item._count;
        }
        stats.toplam += item._count;
      });

      return stats;
    };

    res.json({
      success: true,
      data: {
        equipment: {
          total: totalEquipment,
          active: activeEquipment
        },
        personnel: {
          total: totalPersonnel
        },
        workOrders: {
          today: formatWorkOrderStats(todayWorkOrders),
          monthly: formatWorkOrderStats(monthlyWorkOrders)
        },
        preventiveMaintenance: {
          upcoming: upcomingPM,
          overdue: overduePM
        },
        todayShifts: todayShiftStats
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard verileri alınamadı'
    });
  }
});

// Get shift-based work order completion stats
router.get('/shift-completion', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Tüm vardiyaları al
    const shifts = await prisma.vardiya.findMany();

    // Her vardiya için iş emri istatistikleri
    const shiftStats = await Promise.all(
      shifts.map(async (shift) => {
        const workOrders = await prisma.isEmri.findMany({
          where: {
            shiftId: shift.id,
            createdAt: { gte: targetDate, lt: nextDay }
          },
          select: { durum: true, gerceklesenSure: true }
        });

        const personnel = await prisma.vardiyaPlanlama.count({
          where: {
            shiftId: shift.id,
            tarih: { gte: targetDate, lt: nextDay },
            durum: 'AKTIF'
          }
        });

        const total = workOrders.length;
        const completed = workOrders.filter(wo => wo.durum === 'TAMAMLANDI').length;
        const inProgress = workOrders.filter(wo => wo.durum === 'DEVAM_EDIYOR').length;
        const pending = workOrders.filter(wo => wo.durum === 'BEKLEMEDE' || wo.durum === 'ATANDI').length;

        const avgTime = workOrders
          .filter(wo => wo.gerceklesenSure)
          .reduce((acc, wo) => acc + (wo.gerceklesenSure || 0), 0) / (completed || 1);

        return {
          shift: {
            id: shift.id,
            vardiyaAdi: shift.vardiyaAdi,
            baslangicSaati: shift.baslangicSaati,
            bitisSaati: shift.bitisSaati,
            renk: shift.renk
          },
          personnel,
          workOrders: {
            total,
            completed,
            inProgress,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            avgCompletionTime: Math.round(avgTime)
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        shifts: shiftStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya istatistikleri alınamadı'
    });
  }
});

// Get recent activities
router.get('/activities', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await prisma.isEmriLog.findMany({
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, ad: true, soyad: true }
        },
        workOrder: {
          select: { id: true, isEmriNo: true, baslik: true }
        }
      }
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Aktiviteler alınamadı'
    });
  }
});

// Get KPI metrics
router.get('/kpis', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const [
      completedOrders,
      totalOrders,
      avgCompletionTime,
      pmCompliance,
      totalPM
    ] = await Promise.all([
      prisma.isEmri.count({
        where: {
          createdAt: { gte: startDate },
          durum: 'TAMAMLANDI'
        }
      }),
      prisma.isEmri.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.isEmri.aggregate({
        where: {
          createdAt: { gte: startDate },
          durum: 'TAMAMLANDI',
          gerceklesenSure: { not: null }
        },
        _avg: { gerceklesenSure: true }
      }),
      prisma.isEmri.count({
        where: {
          createdAt: { gte: startDate },
          preventiveMaintenanceId: { not: null },
          durum: 'TAMAMLANDI'
        }
      }),
      prisma.isEmri.count({
        where: {
          createdAt: { gte: startDate },
          preventiveMaintenanceId: { not: null }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        avgCompletionTime: Math.round(avgCompletionTime._avg.gerceklesenSure || 0),
        pmComplianceRate: totalPM > 0 ? Math.round((pmCompliance / totalPM) * 100) : 0,
        totalWorkOrders: totalOrders,
        completedWorkOrders: completedOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'KPI verileri alınamadı'
    });
  }
});

export { router as dashboardRouter };
