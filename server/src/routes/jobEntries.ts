import { Router, Response } from 'express';
import {
  authenticate,
  AuthRequest,
  isBerkeUser
} from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

type PlannedTaskType = 'PLANLI_BAKIM' | 'DURUS_RAPOR_ANALIZ';

type PlannedJobResponse = {
  id: string;
  makina: string;
  mudahaleTuru: string;
  aciklama: string;
  malzeme: string;
  gorevTipi: PlannedTaskType;
  atananSicilNo?: string;
  atananAdSoyad?: string;
  atananBolum?: string;
  backendWorkOrderId?: number;
  backendWorkOrderNo?: string;
  backendGonderimTarihi?: string;
  kaynakIsEmriId?: string;
  kaynakDurusDakika?: number;
  createdAt: string;
};

type CompletedJobResponse = {
  id: string;
  tarih: string;
  vardiya: string;
  makina: string;
  mudahaleTuru: string;
  baslangicSaati: string;
  bitisSaati: string;
  sureDakika: number;
  aciklama: string;
  malzeme: string;
  personeller: Array<{
    sicilNo: string;
    adSoyad: string;
    bolum: string;
  }>;
  analizAtamasi?: {
    planlananIsId?: string;
    backendWorkOrderId?: number;
    backendWorkOrderNo?: string;
    atananSicilNo: string;
    atananAdSoyad: string;
    atananBolum: string;
    atamaTarihi: string;
  };
  createdAt: string;
};

function canManageEntries(user: AuthRequest['user'] | undefined): boolean {
  if (!user) return false;
  return isBerkeUser(user);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeText(value: unknown): string {
  return String(value || '').trim();
}

function normalizeShift(value: unknown): string {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDepartmentKey(value: unknown): string {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DEPARTMENT_ALIAS_MAP: Record<string, string> = {
  'ELEKTRIK': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM ANA BINA': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM EK BINA': 'ELEKTRIK BAKIM EK BINA',
  'ELEKTRIK BAKIM YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'ELEKTRIK YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'MEKANIK': 'MEKANIK BAKIM',
  'MEKANIK BAKIM': 'MEKANIK BAKIM',
  'ISK ELEKTRIK BAKIM': 'ISK ELEKTRIK BAKIM',
  'ISK ELEKTRIK BAKIM YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'ISK ELEKTRIK YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'ISK MEKANIK BAKIM': 'ISK MEKANIK BAKIM',
  'ISK YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'YARDIMCI ISLETMELER': 'YARDIMCI TESISLER',
  'YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'YONETIM': 'YONETIM'
};

function normalizeDepartment(value: unknown): string {
  const key = normalizeDepartmentKey(value);
  if (!key) return '';
  return DEPARTMENT_ALIAS_MAP[key] || key;
}

function getAuthenticatedDepartment(req: AuthRequest): string {
  return normalizeDepartment(req.user?.departman);
}

function normalizePlannedTaskType(value: unknown): PlannedTaskType {
  return value === 'DURUS_RAPOR_ANALIZ' ? 'DURUS_RAPOR_ANALIZ' : 'PLANLI_BAKIM';
}

async function generatePlannedRecordId(): Promise<string> {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 900) + 100;
  const baseId = `PL-${timestamp}${randomSuffix}`;

  const existing = await prisma.planlananIs.findUnique({
    where: { recordId: baseId },
    select: { id: true }
  });

  if (!existing) return baseId;
  return `PL-${timestamp}${randomSuffix}${Math.floor(Math.random() * 10)}`;
}

async function generateCompletedRecordId(tarih: Date): Promise<string> {
  const prefix = toDateKey(tarih).replace(/-/g, '');
  const last = await prisma.tamamlananIs.findFirst({
    where: { recordId: { startsWith: `${prefix}-` } },
    orderBy: { recordId: 'desc' },
    select: { recordId: true }
  });

  let next = 1;
  if (last) {
    const suffix = Number.parseInt(last.recordId.slice(prefix.length + 1), 10);
    next = Number.isNaN(suffix) ? 1 : (suffix + 1);
  }

  return `${prefix}-${String(next).padStart(4, '0')}`;
}

function mapPlannedJob(job: {
  recordId: string;
  makina: string;
  mudahaleTuru: string;
  aciklama: string;
  malzeme: string | null;
  gorevTipi: string;
  atananSicilNo: string | null;
  atananAdSoyad: string | null;
  atananBolum: string | null;
  backendWorkOrderId: number | null;
  backendWorkOrderNo: string | null;
  backendGonderimTarihi: Date | null;
  kaynakIsEmriId: string | null;
  kaynakDurusDakika: number | null;
  createdAt: Date;
}): PlannedJobResponse {
  return {
    id: job.recordId,
    makina: job.makina,
    mudahaleTuru: job.mudahaleTuru,
    aciklama: job.aciklama,
    malzeme: job.malzeme || '',
    gorevTipi: normalizePlannedTaskType(job.gorevTipi),
    atananSicilNo: job.atananSicilNo || undefined,
    atananAdSoyad: job.atananAdSoyad || undefined,
    atananBolum: job.atananBolum || undefined,
    backendWorkOrderId: job.backendWorkOrderId || undefined,
    backendWorkOrderNo: job.backendWorkOrderNo || undefined,
    backendGonderimTarihi: job.backendGonderimTarihi?.toISOString(),
    kaynakIsEmriId: job.kaynakIsEmriId || undefined,
    kaynakDurusDakika: job.kaynakDurusDakika || undefined,
    createdAt: job.createdAt.toISOString()
  };
}

function mapCompletedJob(job: {
  recordId: string;
  tarih: Date;
  vardiya: string;
  makina: string;
  mudahaleTuru: string;
  baslangicSaati: string;
  bitisSaati: string;
  sureDakika: number;
  aciklama: string;
  malzeme: string | null;
  analizPlanlananIsId: number | null;
  analizBackendWorkOrderId: number | null;
  analizBackendWorkOrderNo: string | null;
  analizAtananSicilNo: string | null;
  analizAtananAdSoyad: string | null;
  analizAtananBolum: string | null;
  analizAtamaTarihi: Date | null;
  createdAt: Date;
  personeller: Array<{
    sicilNo: string;
    adSoyad: string;
    bolum: string;
  }>;
}): CompletedJobResponse {
  const hasAnalizAtamasi = Boolean(
    job.analizAtananSicilNo
    && job.analizAtananAdSoyad
    && job.analizAtananBolum
    && job.analizAtamaTarihi
  );

  return {
    id: job.recordId,
    tarih: toDateKey(job.tarih),
    vardiya: job.vardiya,
    makina: job.makina,
    mudahaleTuru: job.mudahaleTuru,
    baslangicSaati: job.baslangicSaati,
    bitisSaati: job.bitisSaati,
    sureDakika: job.sureDakika,
    aciklama: job.aciklama,
    malzeme: job.malzeme || '',
    personeller: job.personeller.map((personel) => ({
      sicilNo: personel.sicilNo,
      adSoyad: personel.adSoyad,
      bolum: personel.bolum
    })),
    analizAtamasi: hasAnalizAtamasi
      ? {
          planlananIsId: job.analizPlanlananIsId
            ? String(job.analizPlanlananIsId)
            : undefined,
          backendWorkOrderId: job.analizBackendWorkOrderId || undefined,
          backendWorkOrderNo: job.analizBackendWorkOrderNo || undefined,
          atananSicilNo: job.analizAtananSicilNo!,
          atananAdSoyad: job.analizAtananAdSoyad!,
          atananBolum: job.analizAtananBolum!,
          atamaTarihi: job.analizAtamaTarihi!.toISOString()
        }
      : undefined,
    createdAt: job.createdAt.toISOString()
  };
}

router.get('/planned', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plannedJobs = await prisma.planlananIs.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: plannedJobs.map(mapPlannedJob)
    });
  } catch (error) {
    console.error('Get planned jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Planlanan isler alinamadi'
    });
  }
});

router.post('/planned', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const makina = normalizeText(req.body?.makina);
    const mudahaleTuru = normalizeText(req.body?.mudahaleTuru || 'Planli Bakim');
    const aciklama = normalizeText(req.body?.aciklama);
    const malzeme = normalizeText(req.body?.malzeme);

    if (!makina || !aciklama) {
      return res.status(400).json({
        success: false,
        message: 'Makina ve aciklama zorunludur'
      });
    }

    const created = await prisma.planlananIs.create({
      data: {
        recordId: await generatePlannedRecordId(),
        makina,
        mudahaleTuru,
        aciklama,
        malzeme: malzeme || null,
        gorevTipi: normalizePlannedTaskType(req.body?.gorevTipi),
        atananSicilNo: normalizeText(req.body?.atananSicilNo) || null,
        atananAdSoyad: normalizeText(req.body?.atananAdSoyad) || null,
        atananBolum: normalizeText(req.body?.atananBolum) || null,
        backendWorkOrderId: parseOptionalInt(req.body?.backendWorkOrderId) ?? null,
        backendWorkOrderNo: normalizeText(req.body?.backendWorkOrderNo) || null,
        backendGonderimTarihi: parseOptionalDate(req.body?.backendGonderimTarihi) ?? null,
        kaynakIsEmriId: normalizeText(req.body?.kaynakIsEmriId) || null,
        kaynakDurusDakika: parseOptionalInt(req.body?.kaynakDurusDakika) ?? null
      }
    });

    res.status(201).json({
      success: true,
      data: mapPlannedJob(created),
      message: 'Planlanan is kaydedildi'
    });
  } catch (error) {
    console.error('Create planned job error:', error);
    res.status(500).json({
      success: false,
      message: 'Planlanan is kaydedilemedi'
    });
  }
});

router.put('/planned/:recordId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageEntries(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Duzenleme yetkisi sadece Berke Karayanik kullanicisinda'
      });
    }

    const recordId = String(req.params.recordId || '').trim();
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz plan ID'
      });
    }

    const existing = await prisma.planlananIs.findUnique({
      where: { recordId },
      select: { id: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Planlanan is bulunamadi'
      });
    }

    const makina = normalizeText(req.body?.makina);
    const aciklama = normalizeText(req.body?.aciklama);
    const malzeme = normalizeText(req.body?.malzeme);

    if (!makina || !aciklama) {
      return res.status(400).json({
        success: false,
        message: 'Makina ve aciklama zorunludur'
      });
    }

    const updated = await prisma.planlananIs.update({
      where: { recordId },
      data: {
        makina,
        aciklama,
        malzeme: malzeme || null
      }
    });

    res.json({
      success: true,
      data: mapPlannedJob(updated),
      message: 'Planlanan is guncellendi'
    });
  } catch (error) {
    console.error('Update planned job error:', error);
    res.status(500).json({
      success: false,
      message: 'Planlanan is guncellenemedi'
    });
  }
});

router.delete('/planned/:recordId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageEntries(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Silme yetkisi sadece Berke Karayanik kullanicisinda'
      });
    }

    const recordId = String(req.params.recordId || '').trim();
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz plan ID'
      });
    }

    await prisma.planlananIs.delete({
      where: { recordId }
    });

    res.json({
      success: true,
      message: 'Planlanan is silindi'
    });
  } catch (error) {
    console.error('Delete planned job error:', error);
    res.status(500).json({
      success: false,
      message: 'Planlanan is silinemedi'
    });
  }
});

router.get('/completed', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isBerke = canManageEntries(req.user);
    const activeBolum = getAuthenticatedDepartment(req);
    const requestedBolum = normalizeDepartment(req.query?.bolum);
    const requestedVardiya = normalizeShift(req.query?.vardiya);

    if (!isBerke && !activeBolum) {
      return res.json({
        success: true,
        data: []
      });
    }

    const completed = await prisma.tamamlananIs.findMany({
      include: {
        personeller: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const filteredCompleted = completed
      .map((job) => {
        let personeller = job.personeller;
        if (isBerke) {
          if (requestedBolum) {
            personeller = personeller.filter(
              (personel) => normalizeDepartment(personel.bolum) === requestedBolum
            );
          }
        } else {
          personeller = personeller.filter(
            (personel) => normalizeDepartment(personel.bolum) === activeBolum
          );
        }

        return {
          ...job,
          personeller
        };
      })
      .filter((job) => job.personeller.length > 0)
      .filter((job) => (
        !requestedVardiya || normalizeShift(job.vardiya).includes(requestedVardiya)
      ));

    res.json({
      success: true,
      data: filteredCompleted.map(mapCompletedJob)
    });
  } catch (error) {
    console.error('Get completed jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Tamamlanan isler alinamadi'
    });
  }
});

router.post('/completed', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const activeBolum = getAuthenticatedDepartment(req);
    if (!activeBolum) {
      return res.status(403).json({
        success: false,
        message: 'Kullanici bolumu tanimli degil'
      });
    }

    const tarih = parseDateKey(req.body?.tarih);
    const vardiya = normalizeText(req.body?.vardiya);
    const makina = normalizeText(req.body?.makina);
    const mudahaleTuru = normalizeText(req.body?.mudahaleTuru);
    const baslangicSaati = normalizeText(req.body?.baslangicSaati);
    const bitisSaati = normalizeText(req.body?.bitisSaati);
    const sureDakika = parseOptionalInt(req.body?.sureDakika) ?? 0;
    const aciklama = normalizeText(req.body?.aciklama);
    const malzeme = normalizeText(req.body?.malzeme);
    const rawPersoneller = Array.isArray(req.body?.personeller)
      ? req.body.personeller as Array<{
          sicilNo?: unknown;
          adSoyad?: unknown;
          bolum?: unknown;
        }>
      : [];

    const personelMap = new Map<string, { sicilNo: string; adSoyad: string; bolum: string }>();
    rawPersoneller.forEach((personel) => {
      const sicilNo = normalizeText(personel.sicilNo);
      const adSoyad = normalizeText(personel.adSoyad);
      const bolum = normalizeDepartment(personel.bolum);
      if (!sicilNo || !adSoyad || !bolum) return;
      personelMap.set(sicilNo, { sicilNo, adSoyad, bolum });
    });
    const personeller = Array.from(personelMap.values());

    if (!tarih || !vardiya || !makina || !mudahaleTuru || !baslangicSaati || !bitisSaati || !aciklama) {
      return res.status(400).json({
        success: false,
        message: 'Tum zorunlu alanlari doldurun'
      });
    }

    if (personeller.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'En az bir personel seciniz'
      });
    }

    const isBolumDisiPersonelVar = personeller.some(
      (personel) => normalizeDepartment(personel.bolum) !== activeBolum
    );
    if (isBolumDisiPersonelVar) {
      return res.status(403).json({
        success: false,
        message: 'Sadece kendi bolumunuzden personel secilebilir'
      });
    }

    const analizAtamasi = req.body?.analizAtamasi as {
      planlananIsId?: unknown;
      backendWorkOrderId?: unknown;
      backendWorkOrderNo?: unknown;
      atananSicilNo?: unknown;
      atananAdSoyad?: unknown;
      atananBolum?: unknown;
      atamaTarihi?: unknown;
    } | undefined;

    const created = await prisma.tamamlananIs.create({
      data: {
        recordId: await generateCompletedRecordId(tarih),
        tarih,
        vardiya,
        makina,
        mudahaleTuru,
        baslangicSaati,
        bitisSaati,
        sureDakika,
        aciklama,
        malzeme: malzeme || null,
        analizPlanlananIsId: parseOptionalInt(analizAtamasi?.planlananIsId) ?? null,
        analizBackendWorkOrderId: parseOptionalInt(analizAtamasi?.backendWorkOrderId) ?? null,
        analizBackendWorkOrderNo: normalizeText(analizAtamasi?.backendWorkOrderNo) || null,
        analizAtananSicilNo: normalizeText(analizAtamasi?.atananSicilNo) || null,
        analizAtananAdSoyad: normalizeText(analizAtamasi?.atananAdSoyad) || null,
        analizAtananBolum: normalizeDepartment(analizAtamasi?.atananBolum) || null,
        analizAtamaTarihi: parseOptionalDate(analizAtamasi?.atamaTarihi) ?? null,
        personeller: {
          create: personeller.map((personel) => ({
            sicilNo: personel.sicilNo,
            adSoyad: personel.adSoyad,
            bolum: personel.bolum
          }))
        }
      },
      include: {
        personeller: {
          orderBy: { id: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: mapCompletedJob(created),
      message: 'Is girisi kaydedildi'
    });
  } catch (error) {
    console.error('Create completed job error:', error);
    res.status(500).json({
      success: false,
      message: 'Is girisi kaydedilemedi'
    });
  }
});

router.put('/completed/:recordId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageEntries(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Duzenleme yetkisi sadece Berke Karayanik kullanicisinda'
      });
    }

    const recordId = String(req.params.recordId || '').trim();
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz is ID'
      });
    }

    const existing = await prisma.tamamlananIs.findUnique({
      where: { recordId },
      select: { id: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Is kaydi bulunamadi'
      });
    }

    const tarih = parseDateKey(req.body?.tarih);
    const vardiya = normalizeText(req.body?.vardiya);
    const makina = normalizeText(req.body?.makina);
    const mudahaleTuru = normalizeText(req.body?.mudahaleTuru);
    const baslangicSaati = normalizeText(req.body?.baslangicSaati);
    const bitisSaati = normalizeText(req.body?.bitisSaati);
    const sureDakika = parseOptionalInt(req.body?.sureDakika);
    const aciklama = normalizeText(req.body?.aciklama);
    const malzeme = normalizeText(req.body?.malzeme);

    if (
      !tarih
      || !vardiya
      || !makina
      || !mudahaleTuru
      || !baslangicSaati
      || !bitisSaati
      || !aciklama
      || sureDakika === undefined
      || !Number.isFinite(sureDakika)
      || sureDakika < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tum zorunlu alanlari doldurun'
      });
    }

    const updated = await prisma.tamamlananIs.update({
      where: { recordId },
      data: {
        tarih,
        vardiya,
        makina,
        mudahaleTuru,
        baslangicSaati,
        bitisSaati,
        sureDakika,
        aciklama,
        malzeme: malzeme || null
      },
      include: {
        personeller: {
          orderBy: { id: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: mapCompletedJob(updated),
      message: 'Tamamlanan is guncellendi'
    });
  } catch (error) {
    console.error('Update completed job error:', error);
    res.status(500).json({
      success: false,
      message: 'Tamamlanan is guncellenemedi'
    });
  }
});

router.patch('/completed/:recordId/analysis-assignment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageEntries(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Is emri atamasi sadece Berke Karayanik kullanicisinda'
      });
    }

    const recordId = String(req.params.recordId || '').trim();
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz is ID'
      });
    }

    const existing = await prisma.tamamlananIs.findUnique({
      where: { recordId },
      select: {
        id: true,
        analizPlanlananIsId: true
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Is kaydi bulunamadi'
      });
    }

    const analizAtamasi = (req.body?.analizAtamasi || req.body || {}) as {
      planlananIsId?: unknown;
      backendWorkOrderId?: unknown;
      backendWorkOrderNo?: unknown;
      atananSicilNo?: unknown;
      atananAdSoyad?: unknown;
      atananBolum?: unknown;
      atamaTarihi?: unknown;
    };

    const backendWorkOrderId = parseOptionalInt(analizAtamasi.backendWorkOrderId);
    const backendWorkOrderNo = normalizeText(analizAtamasi.backendWorkOrderNo);
    const atananSicilNo = normalizeText(analizAtamasi.atananSicilNo);
    const atananAdSoyad = normalizeText(analizAtamasi.atananAdSoyad);
    const atananBolum = normalizeDepartment(analizAtamasi.atananBolum);
    const planlananIsId = parseOptionalInt(analizAtamasi.planlananIsId);
    const atamaTarihi = parseOptionalDate(analizAtamasi.atamaTarihi) ?? new Date();

    if ((!backendWorkOrderId && !backendWorkOrderNo) || !atananSicilNo || !atananAdSoyad || !atananBolum) {
      return res.status(400).json({
        success: false,
        message: 'Analiz atamasi icin is emri ve atanan bilgileri zorunludur'
      });
    }

    const updated = await prisma.tamamlananIs.update({
      where: { recordId },
      data: {
        analizPlanlananIsId: planlananIsId ?? existing.analizPlanlananIsId ?? null,
        analizBackendWorkOrderId: backendWorkOrderId ?? null,
        analizBackendWorkOrderNo: backendWorkOrderNo || null,
        analizAtananSicilNo: atananSicilNo,
        analizAtananAdSoyad: atananAdSoyad,
        analizAtananBolum: atananBolum,
        analizAtamaTarihi: atamaTarihi
      },
      include: {
        personeller: {
          orderBy: { id: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: mapCompletedJob(updated),
      message: 'Analiz atamasi kaydedildi'
    });
  } catch (error) {
    console.error('Update completed analysis assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Analiz atamasi kaydedilemedi'
    });
  }
});

router.delete('/completed/:recordId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageEntries(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Silme yetkisi sadece Berke Karayanik kullanicisinda'
      });
    }

    const recordId = String(req.params.recordId || '').trim();
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'Gecersiz is ID'
      });
    }

    await prisma.tamamlananIs.delete({
      where: { recordId }
    });

    res.json({
      success: true,
      message: 'Is kaydi silindi'
    });
  } catch (error) {
    console.error('Delete completed job error:', error);
    res.status(500).json({
      success: false,
      message: 'Is kaydi silinemedi'
    });
  }
});

export { router as jobEntriesRouter };
