import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

function isManagerRole(role: string): boolean {
  return role === 'ADMIN' || role === 'BAKIM_MUDURU' || role === 'BAKIM_SEFI';
}

function normalizeForAuth(value: string | null | undefined): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function isBerkeSpecialUser(user: AuthRequest['user'] | undefined): boolean {
  if (!user) return false;
  const ad = normalizeForAuth(user.ad);
  const fullName = normalizeForAuth(`${user.ad} ${user.soyad}`);
  const email = normalizeForAuth(user.email);
  const sicilNo = normalizeForAuth(user.sicilNo);

  return (
    ad === 'berke'
    || fullName === 'berke karayanik'
    || email.includes('berke')
    || sicilNo === 'berke'
  );
}

function canManageCompletedWorkOrders(user: AuthRequest['user'] | undefined): boolean {
  if (!user) return false;
  return isManagerRole(user.role) || isBerkeSpecialUser(user);
}

function canAssignWorkOrders(user: AuthRequest['user'] | undefined): boolean {
  if (!user) return false;
  return isBerkeSpecialUser(user);
}

function canWorkOnWorkOrder(
  workOrder: { atananId: number | null },
  user: AuthRequest['user'] | undefined
): boolean {
  if (!user) return false;
  if (isManagerRole(user.role)) return true;
  return workOrder.atananId === user.id;
}

function isExtendedDowntimeReportTitle(value?: string | null): boolean {
  return (value || '').trim().toUpperCase().startsWith('[UDR]');
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function generateWorkOrderNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const prefix = `IE-${year}${month}`;

  const lastOrder = await prisma.isEmri.findFirst({
    where: { isEmriNo: { startsWith: prefix } },
    orderBy: { isEmriNo: 'desc' }
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSeq = Number.parseInt(lastOrder.isEmriNo.slice(-4), 10);
    sequence = Number.isNaN(lastSeq) ? 1 : lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { durum, oncelik, shiftId, atananId, equipmentId, startDate, endDate, search } = req.query;
    const where: any = {};

    if (durum) where.durum = durum;
    if (oncelik) where.oncelik = oncelik;
    if (shiftId) where.shiftId = Number.parseInt(shiftId as string, 10);
    if (atananId) where.atananId = Number.parseInt(atananId as string, 10);
    if (equipmentId) where.equipmentId = Number.parseInt(equipmentId as string, 10);

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (search) {
      where.OR = [
        { isEmriNo: { contains: search as string } },
        { baslik: { contains: search as string } }
      ];
    }

    const workOrders = await prisma.isEmri.findMany({
      where,
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true, lokasyon: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true, sicilNo: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true, sicilNo: true, departman: true }
        },
        shift: {
          select: { id: true, vardiyaAdi: true, renk: true }
        }
      },
      orderBy: [
        { oncelik: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: workOrders
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Is emirleri alinamadi'
    });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const workOrder = await prisma.isEmri.findUnique({
      where: { id: Number.parseInt(req.params.id, 10) },
      include: {
        equipment: true,
        talepEden: {
          select: { id: true, ad: true, soyad: true, sicilNo: true, departman: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true, sicilNo: true, departman: true, uzmanlikAlani: true }
        },
        shift: true,
        loglar: {
          include: {
            user: {
              select: { id: true, ad: true, soyad: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        preventiveMaintenance: {
          select: { id: true, planAdi: true }
        }
      }
    });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    res.json({
      success: true,
      data: workOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Is emri alinamadi'
    });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      baslik,
      aciklama,
      equipmentId,
      oncelik,
      atananId,
      shiftId,
      planlananBaslangic,
      planlananBitis,
      tahminiSure,
      tamamlanmaNotlari
    } = req.body;
    const parsedAtananId = parseOptionalInt(atananId);

    if (parsedAtananId && !canAssignWorkOrders(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir'
      });
    }

    const isEmriNo = await generateWorkOrderNumber();

    const workOrder = await prisma.isEmri.create({
      data: {
        isEmriNo,
        baslik,
        aciklama,
        equipmentId: parseOptionalInt(equipmentId) ?? null,
        oncelik: oncelik || 'NORMAL',
        talepEdenId: req.user!.id,
        atananId: parsedAtananId ?? null,
        shiftId: parseOptionalInt(shiftId) ?? null,
        durum: parsedAtananId ? 'ATANDI' : 'BEKLEMEDE',
        planlananBaslangic: parseOptionalDate(planlananBaslangic) ?? null,
        planlananBitis: parseOptionalDate(planlananBitis) ?? null,
        tahminiSure: parseOptionalInt(tahminiSure) ?? null,
        tamamlanmaNotlari: typeof tamamlanmaNotlari === 'string' ? tamamlanmaNotlari : null
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        }
      }
    });

    await prisma.isEmriLog.create({
      data: {
        workOrderId: workOrder.id,
        userId: req.user!.id,
        islem: 'OLUSTURULDU',
        yeniDurum: workOrder.durum,
        aciklama: 'Is emri olusturuldu'
      }
    });

    res.status(201).json({
      success: true,
      data: workOrder,
      message: 'Is emri olusturuldu'
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({
      success: false,
      message: 'Is emri olusturulamadi'
    });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const workOrderId = Number.parseInt(req.params.id, 10);
    const currentUser = req.user!;

    const currentOrder = await prisma.isEmri.findUnique({
      where: { id: workOrderId },
      select: { id: true, atananId: true }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    if (!canWorkOnWorkOrder(currentOrder, currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'Bu is emrini guncelleme yetkiniz yok'
      });
    }

    const {
      baslik,
      aciklama,
      equipmentId,
      oncelik,
      atananId,
      shiftId,
      planlananBaslangic,
      planlananBitis,
      tahminiSure,
      tamamlanmaNotlari,
      maliyetIscilik,
      maliyetMalzeme
    } = req.body;
    const parsedAtananId = parseOptionalInt(atananId);
    const assignmentFieldProvided = Object.prototype.hasOwnProperty.call(req.body, 'atananId');

    if (assignmentFieldProvided && !canAssignWorkOrders(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir'
      });
    }

    const workOrder = await prisma.isEmri.update({
      where: { id: workOrderId },
      data: {
        baslik,
        aciklama,
        equipmentId: parseOptionalInt(equipmentId),
        oncelik,
        atananId: parsedAtananId,
        shiftId: parseOptionalInt(shiftId),
        planlananBaslangic: parseOptionalDate(planlananBaslangic),
        planlananBitis: parseOptionalDate(planlananBitis),
        tahminiSure: parseOptionalInt(tahminiSure),
        tamamlanmaNotlari,
        maliyetIscilik,
        maliyetMalzeme
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true }
        }
      }
    });

    await prisma.isEmriLog.create({
      data: {
        workOrderId: workOrder.id,
        userId: req.user!.id,
        islem: 'GUNCELLENDI',
        aciklama: 'Is emri guncellendi'
      }
    });

    res.json({
      success: true,
      data: workOrder,
      message: 'Is emri guncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Is emri guncellenemedi'
    });
  }
});

router.patch('/:id/clear-report', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const workOrderId = Number.parseInt(req.params.id, 10);
    const currentUser = req.user!;

    const currentOrder = await prisma.isEmri.findUnique({
      where: { id: workOrderId },
      select: {
        id: true,
        baslik: true,
        durum: true,
        tamamlanmaNotlari: true
      }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    if (!canAssignWorkOrders(currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'Form silme yetkisi sadece Berke Karayanik kullanicisinda'
      });
    }

    const hasReportContent = Boolean(
      currentOrder.tamamlanmaNotlari && currentOrder.tamamlanmaNotlari.trim()
    );

    const updateData: {
      tamamlanmaNotlari: null;
      onaylayanId: null;
      onayTarihi: null;
      durum?: string;
      gercekBitis?: null;
      gerceklesenSure?: null;
    } = {
      tamamlanmaNotlari: null,
      onaylayanId: null,
      onayTarihi: null
    };

    if (hasReportContent && (currentOrder.durum === 'ONAY_BEKLIYOR' || currentOrder.durum === 'TAMAMLANDI')) {
      updateData.durum = 'DEVAM_EDIYOR';
      updateData.gercekBitis = null;
      updateData.gerceklesenSure = null;
    }

    const workOrder = await prisma.isEmri.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true }
        },
        shift: {
          select: { id: true, vardiyaAdi: true, renk: true }
        }
      }
    });

    await prisma.isEmriLog.create({
      data: {
        workOrderId,
        userId: currentUser.id,
        islem: 'FORM_SILINDI',
        eskiDurum: currentOrder.durum,
        yeniDurum: workOrder.durum,
        aciklama: hasReportContent ? 'Is emri formu temizlendi' : 'Is emri formu zaten bostu'
      }
    });

    res.json({
      success: true,
      data: workOrder,
      message: 'Form silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Form silinemedi'
    });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const workOrderId = Number.parseInt(req.params.id, 10);
    const currentUser = req.user!;

    const currentOrder = await prisma.isEmri.findUnique({
      where: { id: workOrderId }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    if (!canManageCompletedWorkOrders(currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'Bu is emrini silme yetkiniz yok'
      });
    }

    await prisma.isEmri.delete({
      where: { id: workOrderId }
    });

    res.json({
      success: true,
      message: 'Is emri silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Is emri silinemedi'
    });
  }
});

router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { durum, aciklama } = req.body as { durum: string; aciklama?: string };
    const workOrderId = Number.parseInt(req.params.id, 10);
    const currentUser = req.user!;

    const currentOrder = await prisma.isEmri.findUnique({
      where: { id: workOrderId }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    if (durum === 'ATANDI' && !canAssignWorkOrders(currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir'
      });
    }

    const isReopenFromCompleted = currentOrder.durum === 'TAMAMLANDI' && durum !== 'TAMAMLANDI';
    if (isReopenFromCompleted && !canManageCompletedWorkOrders(currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'Tamamlanan is emirlerini geri yollama yetkiniz yok'
      });
    }

    const isWorkingStatusChange = !isReopenFromCompleted && durum !== 'ATANDI';
    if (isWorkingStatusChange && !canWorkOnWorkOrder(currentOrder, currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'Bu is emrini ilerletme yetkiniz yok'
      });
    }

    if (durum === 'DEVAM_EDIYOR' && !currentOrder.atananId) {
      return res.status(400).json({
        success: false,
        message: 'Is emri atanmadan baslatilamaz'
      });
    }

    const isExtendedDowntime = isExtendedDowntimeReportTitle(currentOrder.baslik);
    if (isExtendedDowntime && durum === 'TAMAMLANDI') {
      return res.status(400).json({
        success: false,
        message: 'Uzayan durus analiz isi direkt tamamlanamaz. Once onaya gonderin.'
      });
    }

    if (isExtendedDowntime && durum === 'ONAY_BEKLIYOR') {
      const canSubmitForApproval = currentOrder.atananId === currentUser.id || isManagerRole(currentUser.role);
      if (!canSubmitForApproval) {
        return res.status(403).json({
          success: false,
          message: 'Bu isi onaya gonderme yetkiniz yok'
        });
      }
    }

    const updateData: any = { durum };

    if (durum === 'DEVAM_EDIYOR' && !currentOrder.gercekBaslangic) {
      updateData.gercekBaslangic = new Date();
    }

    if (durum === 'TAMAMLANDI') {
      updateData.gercekBitis = new Date();
      if (currentOrder.gercekBaslangic) {
        const diffMs = new Date().getTime() - currentOrder.gercekBaslangic.getTime();
        updateData.gerceklesenSure = Math.round(diffMs / 60000);
      }
    }

    if (durum === 'ONAY_BEKLIYOR') {
      updateData.gercekBitis = new Date();
      if (currentOrder.gercekBaslangic) {
        const diffMs = new Date().getTime() - currentOrder.gercekBaslangic.getTime();
        updateData.gerceklesenSure = Math.round(diffMs / 60000);
      }
      updateData.onaylayanId = null;
      updateData.onayTarihi = null;
    }

    if (isReopenFromCompleted) {
      updateData.onaylayanId = null;
      updateData.onayTarihi = null;
      if (durum === 'DEVAM_EDIYOR') {
        updateData.gercekBitis = null;
      }
    }

    const workOrder = await prisma.isEmri.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true }
        },
        shift: true
      }
    });

    await prisma.isEmriLog.create({
      data: {
        workOrderId,
        userId: currentUser.id,
        islem: 'DURUM_DEGISTI',
        eskiDurum: currentOrder.durum,
        yeniDurum: durum,
        aciklama
      }
    });

    res.json({
      success: true,
      data: workOrder,
      message: 'Is emri durumu guncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Durum guncellenemedi'
    });
  }
});

router.patch('/:id/submit-for-approval', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const workOrderId = Number.parseInt(req.params.id, 10);
    const { reportContent } = req.body as { reportContent?: string };
    const currentUser = req.user!;

    const currentOrder = await prisma.isEmri.findUnique({
      where: { id: workOrderId }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    if (!isExtendedDowntimeReportTitle(currentOrder.baslik)) {
      return res.status(400).json({
        success: false,
        message: 'Bu is emri uzayan durus formu icermiyor'
      });
    }

    const canSubmit = currentOrder.atananId === currentUser.id || isManagerRole(currentUser.role);
    if (!canSubmit) {
      return res.status(403).json({
        success: false,
        message: 'Bu isi onaya gonderme yetkiniz yok'
      });
    }

    if (!reportContent || !reportContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rapor icerigi bos olamaz'
      });
    }

    const now = new Date();
    const updateData: any = {
      tamamlanmaNotlari: reportContent,
      durum: 'ONAY_BEKLIYOR',
      gercekBitis: now,
      onaylayanId: null,
      onayTarihi: null
    };

    if (currentOrder.gercekBaslangic) {
      const diffMs = now.getTime() - currentOrder.gercekBaslangic.getTime();
      updateData.gerceklesenSure = Math.max(0, Math.round(diffMs / 60000));
    }

    const workOrder = await prisma.isEmri.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true }
        }
      }
    });

    await prisma.isEmriLog.create({
      data: {
        workOrderId,
        userId: currentUser.id,
        islem: 'ONAYA_GONDERILDI',
        eskiDurum: currentOrder.durum,
        yeniDurum: 'ONAY_BEKLIYOR',
        aciklama: 'Uzayan durus raporu dolduruldu ve onaya gonderildi'
      }
    });

    res.json({
      success: true,
      data: workOrder,
      message: 'Is emri onaya gonderildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Onaya gonderme islemi basarisiz'
    });
  }
});

router.patch('/:id/approve-completion', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const workOrderId = Number.parseInt(req.params.id, 10);
    const currentUser = req.user!;

    const currentOrder = await prisma.isEmri.findUnique({
      where: { id: workOrderId }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Is emri bulunamadi'
      });
    }

    if (!isExtendedDowntimeReportTitle(currentOrder.baslik)) {
      return res.status(400).json({
        success: false,
        message: 'Bu is emri uzayan durus formu icermiyor'
      });
    }

    const canApprove = currentOrder.talepEdenId === currentUser.id || isManagerRole(currentUser.role);
    if (!canApprove) {
      return res.status(403).json({
        success: false,
        message: 'Bu isi onaylama yetkiniz yok'
      });
    }

    if (currentOrder.durum !== 'ONAY_BEKLIYOR') {
      return res.status(400).json({
        success: false,
        message: 'Is emri onay bekleyen durumda degil'
      });
    }

    const now = new Date();
    const updateData: any = {
      durum: 'TAMAMLANDI',
      onaylayanId: currentUser.id,
      onayTarihi: now
    };

    if (!currentOrder.gercekBitis) {
      updateData.gercekBitis = now;
    }
    if (currentOrder.gercekBaslangic && !currentOrder.gerceklesenSure) {
      const diffMs = now.getTime() - currentOrder.gercekBaslangic.getTime();
      updateData.gerceklesenSure = Math.max(0, Math.round(diffMs / 60000));
    }

    const workOrder = await prisma.isEmri.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        },
        talepEden: {
          select: { id: true, ad: true, soyad: true }
        }
      }
    });

    await prisma.isEmriLog.create({
      data: {
        workOrderId,
        userId: currentUser.id,
        islem: 'ONAYLANDI',
        eskiDurum: currentOrder.durum,
        yeniDurum: 'TAMAMLANDI',
        aciklama: 'Uzayan durus analizi tamamlandi ve onaylandi'
      }
    });

    res.json({
      success: true,
      data: workOrder,
      message: 'Is emri tamamlandi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Onay islemi basarisiz'
    });
  }
});

router.get('/by-shift/:shiftId/:date', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId, date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const workOrders = await prisma.isEmri.findMany({
      where: {
        shiftId: Number.parseInt(shiftId, 10),
        createdAt: {
          gte: targetDate,
          lt: nextDay
        }
      },
      include: {
        equipment: {
          select: { id: true, ekipmanKodu: true, ekipmanAdi: true }
        },
        atanan: {
          select: { id: true, ad: true, soyad: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      toplam: workOrders.length,
      beklemede: workOrders.filter((wo) => wo.durum === 'BEKLEMEDE').length,
      devamEdiyor: workOrders.filter((wo) => wo.durum === 'DEVAM_EDIYOR').length,
      tamamlandi: workOrders.filter((wo) => wo.durum === 'TAMAMLANDI').length,
      tamamlanmaOrani: workOrders.length > 0
        ? Math.round((workOrders.filter((wo) => wo.durum === 'TAMAMLANDI').length / workOrders.length) * 100)
        : 0
    };

    res.json({
      success: true,
      data: { workOrders, stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya is emirleri alinamadi'
    });
  }
});

router.get('/stats/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [total, byStatus, byPriority, avgCompletionTime] = await Promise.all([
      prisma.isEmri.count({ where }),
      prisma.isEmri.groupBy({
        by: ['durum'],
        where,
        _count: true
      }),
      prisma.isEmri.groupBy({
        by: ['oncelik'],
        where,
        _count: true
      }),
      prisma.isEmri.aggregate({
        where: { ...where, durum: 'TAMAMLANDI', gerceklesenSure: { not: null } },
        _avg: { gerceklesenSure: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc: any, item) => {
          acc[item.durum] = item._count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc: any, item) => {
          acc[item.oncelik] = item._count;
          return acc;
        }, {}),
        avgCompletionTime: Math.round(avgCompletionTime._avg.gerceklesenSure || 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Istatistikler alinamadi'
    });
  }
});

export { router as workOrdersRouter };
