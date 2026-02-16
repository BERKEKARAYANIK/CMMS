import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { shiftsRouter } from './routes/shifts.js';
import { shiftSchedulesRouter } from './routes/shiftSchedules.js';
import { equipmentRouter } from './routes/equipment.js';
import { workOrdersRouter } from './routes/workOrders.js';
import { preventiveMaintenanceRouter } from './routes/preventiveMaintenance.js';
import { dashboardRouter } from './routes/dashboard.js';
import { jobEntriesRouter } from './routes/jobEntries.js';
import { appStateRouter } from './routes/appState.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './lib/prisma.js';
import { CLIENT_ORIGIN } from './config.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/shift-schedules', shiftSchedulesRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/preventive-maintenance', preventiveMaintenanceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/job-entries', jobEntriesRouter);
app.use('/api/app-state', appStateRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function ensureBootstrapAdmin() {
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;

  if (!bootstrapPassword || !bootstrapEmail) {
    return;
  }

  const sicilNo = process.env.BOOTSTRAP_ADMIN_SICIL_NO || 'ADMIN';
  const ad = process.env.BOOTSTRAP_ADMIN_AD || 'Sistem';
  const soyad = process.env.BOOTSTRAP_ADMIN_SOYAD || 'Yonetici';
  const adSoyad = `${ad} ${soyad}`.trim();
  const departman = process.env.BOOTSTRAP_ADMIN_DEPARTMAN || 'YONETIM';

  const hashedPassword = await bcrypt.hash(bootstrapPassword, 10);
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: bootstrapEmail },
        { sicilNo }
      ]
    }
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        sicilNo,
        ad,
        soyad,
        adSoyad,
        email: bootstrapEmail,
        password: hashedPassword,
        departman,
        role: 'ADMIN',
        aktif: true
      }
    });
    return;
  }

  await prisma.user.update({
    where: { id: existing.id },
    data: {
      sicilNo,
      ad,
      soyad,
      adSoyad,
      email: bootstrapEmail,
      password: hashedPassword,
      departman,
      role: 'ADMIN',
      aktif: true
    }
  });
}

async function start() {
  await ensureBootstrapAdmin();

  app.listen(PORT, () => {
    console.log(`CMMS Server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Server start failed:', error);
  process.exit(1);
});
