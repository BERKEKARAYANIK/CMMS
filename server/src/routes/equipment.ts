import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get all equipment
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { kategori, lokasyon, kritiklik, durum, search } = req.query;

    const where: any = {};

    if (kategori) where.kategori = kategori;
    if (lokasyon) where.lokasyon = { contains: lokasyon as string, mode: 'insensitive' };
    if (kritiklik) where.kritiklikSeviyesi = kritiklik;
    if (durum) where.durum = durum;
    if (search) {
      where.OR = [
        { ekipmanKodu: { contains: search as string, mode: 'insensitive' } },
        { ekipmanAdi: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const equipment = await prisma.makina.findMany({
      where,
      orderBy: { ekipmanKodu: 'asc' }
    });

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ekipmanlar alınamadı'
    });
  }
});

// Get equipment by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const equipment = await prisma.makina.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        isEmirleri: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            isEmriNo: true,
            baslik: true,
            durum: true,
            oncelik: true,
            createdAt: true
          }
        },
        periyodikBakimlar: {
          where: { aktif: true },
          select: {
            id: true,
            planAdi: true,
            periyotTipi: true,
            sonrakiTarih: true
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ekipman alınamadı'
    });
  }
});

// Create equipment
router.post('/', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      ekipmanKodu,
      ekipmanAdi,
      kategori,
      altKategori,
      marka,
      model,
      seriNo,
      lokasyon,
      kritiklikSeviyesi,
      kurulumTarihi,
      garantiBitisTarihi,
      teknikOzellikler,
      notlar
    } = req.body;

    const existing = await prisma.makina.findUnique({
      where: { ekipmanKodu }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bu ekipman kodu zaten kullanılıyor'
      });
    }

    const equipment = await prisma.makina.create({
      data: {
        ekipmanKodu,
        ekipmanAdi,
        kategori,
        altKategori,
        marka,
        model,
        seriNo,
        lokasyon,
        kritiklikSeviyesi: kritiklikSeviyesi || 'B',
        kurulumTarihi: kurulumTarihi ? new Date(kurulumTarihi) : null,
        garantiBitisTarihi: garantiBitisTarihi ? new Date(garantiBitisTarihi) : null,
        teknikOzellikler,
        notlar
      }
    });

    res.status(201).json({
      success: true,
      data: equipment,
      message: 'Ekipman oluşturuldu'
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman oluşturulamadı'
    });
  }
});

// Update equipment
router.put('/:id', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      ekipmanAdi,
      kategori,
      altKategori,
      marka,
      model,
      seriNo,
      lokasyon,
      kritiklikSeviyesi,
      durum,
      kurulumTarihi,
      garantiBitisTarihi,
      teknikOzellikler,
      notlar
    } = req.body;

    const equipment = await prisma.makina.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ekipmanAdi,
        kategori,
        altKategori,
        marka,
        model,
        seriNo,
        lokasyon,
        kritiklikSeviyesi,
        durum,
        kurulumTarihi: kurulumTarihi ? new Date(kurulumTarihi) : undefined,
        garantiBitisTarihi: garantiBitisTarihi ? new Date(garantiBitisTarihi) : undefined,
        teknikOzellikler,
        notlar
      }
    });

    res.json({
      success: true,
      data: equipment,
      message: 'Ekipman güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ekipman güncellenemedi'
    });
  }
});

// Get equipment categories
router.get('/meta/categories', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.makina.findMany({
      select: { kategori: true },
      distinct: ['kategori']
    });

    res.json({
      success: true,
      data: categories.map(c => c.kategori)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler alınamadı'
    });
  }
});

export { router as equipmentRouter };
