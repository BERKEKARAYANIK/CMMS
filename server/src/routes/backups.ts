import { Router, Response } from 'express';
import {
  authenticate,
  AuthRequest,
  isSystemAdminUser
} from '../middleware/auth.js';
import {
  getBackupSettings,
  getBackupStatus,
  updateBackupSettings,
  runBackupNow
} from '../services/backupService.js';

const router = Router();

function canManageBackups(user: AuthRequest['user'] | undefined): boolean {
  if (!user) return false;
  return isSystemAdminUser(user);
}

router.get('/settings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageBackups(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Yedekleme ayarlari sadece sistem yoneticisi tarafindan yonetilebilir'
      });
    }

    const [settings, status] = await Promise.all([
      getBackupSettings(),
      getBackupStatus()
    ]);

    res.json({
      success: true,
      data: {
        settings,
        status
      }
    });
  } catch (error) {
    console.error('Get backup settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Yedekleme ayarlari alinamadi'
    });
  }
});

router.put('/settings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageBackups(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Yedekleme ayarlari sadece sistem yoneticisi tarafindan degistirilebilir'
      });
    }

    const settings = await updateBackupSettings(req.body || {});
    const status = await getBackupStatus();

    res.json({
      success: true,
      data: {
        settings,
        status
      },
      message: 'Yedekleme ayarlari kaydedildi'
    });
  } catch (error) {
    console.error('Update backup settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Yedekleme ayarlari kaydedilemedi'
    });
  }
});

router.post('/run', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!canManageBackups(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Yedekleme sadece sistem yoneticisi tarafindan baslatilabilir'
      });
    }

    const result = await runBackupNow('manual');

    if (!result.success && result.errorCode === 'RUNNING') {
      return res.status(409).json({
        success: false,
        message: result.message,
        data: {
          status: result.status,
          files: result.files
        }
      });
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: `${result.message}: ${result.status.lastError || 'Bilinmeyen hata'}`,
        data: {
          status: result.status,
          files: result.files
        }
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        status: result.status,
        files: result.files
      }
    });
  } catch (error) {
    console.error('Manual backup run error:', error);
    res.status(500).json({
      success: false,
      message: 'Yedekleme islemi baslatilamadi'
    });
  }
});

export { router as backupsRouter };
