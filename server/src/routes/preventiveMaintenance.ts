import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Calculate next date based on period
function calculateNextDate(fromDate: Date, periyotTipi: string, periyotDegeri: number): Date {
  const nextDate = new Date(fromDate);

  switch (periyotTipi) {
    case 'GUNLUK':
      nextDate.setDate(nextDate.getDate() + periyotDegeri);
      break;
    case 'HAFTALIK':
      nextDate.setDate(nextDate.getDate() + (periyotDegeri * 7));
      break;
    case 'AYLIK':
      nextDate.setMonth(nextDate.getMonth() + periyotDegeri);
      break;
    case 'UC_AYLIK':
      nextDate.setMonth(nextDate.getMonth() + (periyotDegeri * 3));
      break;
    case 'ALTI_AYLIK':
      nextDate.setMonth(nextDate.getMonth() + (periyotDegeri * 6));
      break;
    case 'YILLIK':
      nextDate.setFullYear(nextDate.getFullYear() + periyotDegeri);
      break;
  }

  return nextDate;
}

// Get all preventive maintenance plans
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { equipmentId, aktif, periyotTipi } = req.query;

    const where: any = {};

    if (equipmentId) where.equipmentId = parseInt(equipmentId as string);
    if (aktif !== undefined) where.aktif = aktif === 'true';
    if (periyotTipi) where.periyotTipi = periyotTipi;

    const plans = await prisma.periyodikBakim.findMany({
      where,
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true, lokasyon: true }
        }
      },
      orderBy: { sonrakiTarih: 'asc' }
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bakım planları alınamadı'
    });
  }
});

// Get upcoming maintenance
router.get('/upcoming', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days as string));

    const upcoming = await prisma.periyodikBakim.findMany({
      where: {
        aktif: true,
        sonrakiTarih: {
          gte: new Date(),
          lte: endDate
        }
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true, lokasyon: true, kritiklikSeviyesi: true }
        }
      },
      orderBy: { sonrakiTarih: 'asc' }
    });

    // Gecikmiş bakımlar
    const overdue = await prisma.periyodikBakim.findMany({
      where: {
        aktif: true,
        sonrakiTarih: {
          lt: new Date()
        }
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true, lokasyon: true, kritiklikSeviyesi: true }
        }
      },
      orderBy: { sonrakiTarih: 'asc' }
    });

    res.json({
      success: true,
      data: {
        upcoming,
        overdue,
        stats: {
          upcomingCount: upcoming.length,
          overdueCount: overdue.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Yaklaşan bakımlar alınamadı'
    });
  }
});

// Get PM by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const pm = await prisma.periyodikBakim.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        equipment: true,
        isEmirleri: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            isEmriNo: true,
            durum: true,
            createdAt: true,
            gercekBitis: true
          }
        }
      }
    });

    if (!pm) {
      return res.status(404).json({
        success: false,
        message: 'Bakım planı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: pm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bakım planı alınamadı'
    });
  }
});

// Create PM plan
router.post('/', authenticate, authorize('ADMIN', 'BAKIM_MUDURU', 'BAKIM_SEFI'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      planAdi,
      equipmentId,
      periyotTipi,
      periyotDegeri,
      sonrakiTarih,
      kontrolListesi,
      talimatlar,
      tahminiSure,
      sorumluDepartman
    } = req.body;

    const pm = await prisma.periyodikBakim.create({
      data: {
        planAdi,
        equipmentId: parseInt(equipmentId),
        periyotTipi,
        periyotDegeri: periyotDegeri || 1,
        sonrakiTarih: new Date(sonrakiTarih),
        kontrolListesi,
        talimatlar,
        tahminiSure,
        sorumluDepartman
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: pm,
      message: 'Bakım planı oluşturuldu'
    });
  } catch (error) {
    console.error('Create PM error:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım planı oluşturulamadı'
    });
  }
});

// Update PM plan
router.put('/:id', authenticate, authorize('ADMIN', 'BAKIM_MUDURU', 'BAKIM_SEFI'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      planAdi,
      periyotTipi,
      periyotDegeri,
      sonrakiTarih,
      kontrolListesi,
      talimatlar,
      tahminiSure,
      sorumluDepartman,
      aktif
    } = req.body;

    const pm = await prisma.periyodikBakim.update({
      where: { id: parseInt(req.params.id) },
      data: {
        planAdi,
        periyotTipi,
        periyotDegeri,
        sonrakiTarih: sonrakiTarih ? new Date(sonrakiTarih) : undefined,
        kontrolListesi,
        talimatlar,
        tahminiSure,
        sorumluDepartman,
        aktif
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        }
      }
    });

    res.json({
      success: true,
      data: pm,
      message: 'Bakım planı güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bakım planı güncellenemedi'
    });
  }
});

// Generate work order from PM
router.post('/:id/generate-work-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const pmId = parseInt(req.params.id);
    const { atananId, shiftId } = req.body;

    const pm = await prisma.periyodikBakim.findUnique({
      where: { id: pmId },
      include: { equipment: true }
    });

    if (!pm) {
      return res.status(404).json({
        success: false,
        message: 'Bakım planı bulunamadı'
      });
    }

    // İş emri numarası oluştur
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PB-${year}${month}`;

    const lastOrder = await prisma.isEmri.findFirst({
      where: { isEmriNo: { startsWith: prefix } },
      orderBy: { isEmriNo: 'desc' }
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.isEmriNo.slice(-4));
      sequence = lastSeq + 1;
    }

    const isEmriNo = `${prefix}-${String(sequence).padStart(4, '0')}`;

    // İş emri oluştur
    const workOrder = await prisma.isEmri.create({
      data: {
        isEmriNo,
        baslik: `[PB] ${pm.planAdi}`,
        aciklama: pm.talimatlar || `${pm.equipment.ekipmanAdi} periyodik bakımı`,
        equipmentId: pm.equipmentId,
        oncelik: 'NORMAL',
        talepEdenId: req.user!.id,
        atananId: atananId ? parseInt(atananId) : null,
        shiftId: shiftId ? parseInt(shiftId) : null,
        durum: atananId ? 'ATANDI' : 'BEKLEMEDE',
        tahminiSure: pm.tahminiSure,
        preventiveMaintenanceId: pm.id,
        planlananBaslangic: pm.sonrakiTarih
      }
    });

    // Sonraki bakım tarihini hesapla ve güncelle
    const nextDate = calculateNextDate(pm.sonrakiTarih, pm.periyotTipi, pm.periyotDegeri);

    await prisma.periyodikBakim.update({
      where: { id: pmId },
      data: {
        sonYapilanTarih: pm.sonrakiTarih,
        sonrakiTarih: nextDate
      }
    });

    res.status(201).json({
      success: true,
      data: workOrder,
      message: 'Periyodik bakım iş emri oluşturuldu'
    });
  } catch (error) {
    console.error('Generate work order error:', error);
    res.status(500).json({
      success: false,
      message: 'İş emri oluşturulamadı'
    });
  }
});

// Get PM calendar data
router.get('/calendar/:year/:month', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const plans = await prisma.periyodikBakim.findMany({
      where: {
        aktif: true,
        sonrakiTarih: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true, kritiklikSeviyesi: true }
        }
      },
      orderBy: { sonrakiTarih: 'asc' }
    });

    // Günlere göre grupla
    const calendarData = plans.reduce((acc: any, plan) => {
      const day = plan.sonrakiTarih.getDate();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push({
        id: plan.id,
        planAdi: plan.planAdi,
        equipment: plan.equipment,
        periyotTipi: plan.periyotTipi
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: calendarData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Takvim verisi alınamadı'
    });
  }
});

export { router as preventiveMaintenanceRouter };
