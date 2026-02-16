import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get all shifts
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const shifts = await prisma.vardiya.findMany({
      orderBy: { baslangicSaati: 'asc' }
    });

    res.json({
      success: true,
      data: shifts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiyalar alınamadı'
    });
  }
});

// Get shift by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const shift = await prisma.vardiya.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Vardiya bulunamadı'
      });
    }

    res.json({
      success: true,
      data: shift
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya alınamadı'
    });
  }
});

// Create shift
router.post('/', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    const { vardiyaAdi, baslangicSaati, bitisSaati, renk } = req.body;

    const shift = await prisma.vardiya.create({
      data: {
        vardiyaAdi,
        baslangicSaati,
        bitisSaati,
        renk: renk || '#3B82F6'
      }
    });

    res.status(201).json({
      success: true,
      data: shift,
      message: 'Vardiya oluşturuldu'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya oluşturulamadı'
    });
  }
});

// Update shift
router.put('/:id', authenticate, authorize('ADMIN', 'BAKIM_MUDURU'), async (req: AuthRequest, res: Response) => {
  try {
    const { vardiyaAdi, baslangicSaati, bitisSaati, renk } = req.body;

    const shift = await prisma.vardiya.update({
      where: { id: parseInt(req.params.id) },
      data: {
        vardiyaAdi,
        baslangicSaati,
        bitisSaati,
        renk
      }
    });

    res.json({
      success: true,
      data: shift,
      message: 'Vardiya güncellendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Vardiya güncellenemedi'
    });
  }
});

export { router as shiftsRouter };
