import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma.js';

const BACKUP_SETTINGS_KEY = 'backup:settings';
const BACKUP_STATUS_KEY = 'backup:status';
const MIN_INTERVAL_MINUTES = 5;
const MAX_INTERVAL_MINUTES = 24 * 60;

type PersistedBackupResult = 'idle' | 'success' | 'error';

export type BackupTrigger = 'manual' | 'auto';

export type BackupSettings = {
  enabled: boolean;
  intervalMinutes: number;
  backupDir: string;
  includeDatabase: boolean;
  includeCompletedExcel: boolean;
};

type PersistedBackupStatus = {
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastResult: PersistedBackupResult;
  lastError: string | null;
  lastTrigger: BackupTrigger | null;
  lastOutputDir: string | null;
  lastFiles: string[];
};

export type BackupStatus = PersistedBackupStatus & {
  nextRunAt: string | null;
  isRunning: boolean;
};

export type BackupRunResult = {
  success: boolean;
  message: string;
  files: string[];
  status: BackupStatus;
  errorCode?: 'RUNNING' | 'FAILED';
};

let backupTimer: NodeJS.Timeout | null = null;
let nextRunAt: Date | null = null;
let isBackupRunning = false;

function stripWrapQuotes(value: string): string {
  const text = value.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1).trim();
  }
  return text;
}

function parseJsonValue(payload: string): unknown {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function serializeJsonValue(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return 'null';
  }
}

function getDefaultBackupSettings(): BackupSettings {
  return {
    enabled: true,
    intervalMinutes: 120,
    backupDir: path.resolve(process.cwd(), 'backups'),
    includeDatabase: true,
    includeCompletedExcel: true
  };
}

function getDefaultPersistedStatus(): PersistedBackupStatus {
  return {
    lastRunAt: null,
    lastSuccessAt: null,
    lastResult: 'idle',
    lastError: null,
    lastTrigger: null,
    lastOutputDir: null,
    lastFiles: []
  };
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return fallback;
}

function parseIntervalMinutes(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(MAX_INTERVAL_MINUTES, Math.max(MIN_INTERVAL_MINUTES, parsed));
}

function resolveBackupDir(value: unknown, fallback: string): string {
  const raw = String(value ?? '').trim();
  const selected = raw || fallback;
  if (path.isAbsolute(selected)) return path.normalize(selected);
  return path.normalize(path.resolve(process.cwd(), selected));
}

function normalizeBackupSettings(value: unknown, fallback?: BackupSettings): BackupSettings {
  const defaults = fallback ?? getDefaultBackupSettings();
  if (!value || typeof value !== 'object') return defaults;

  const source = value as Partial<BackupSettings>;

  return {
    enabled: parseBoolean(source.enabled, defaults.enabled),
    intervalMinutes: parseIntervalMinutes(source.intervalMinutes, defaults.intervalMinutes),
    backupDir: resolveBackupDir(source.backupDir, defaults.backupDir),
    includeDatabase: parseBoolean(source.includeDatabase, defaults.includeDatabase),
    includeCompletedExcel: parseBoolean(source.includeCompletedExcel, defaults.includeCompletedExcel)
  };
}

function normalizePersistedStatus(value: unknown): PersistedBackupStatus {
  const defaults = getDefaultPersistedStatus();
  if (!value || typeof value !== 'object') return defaults;

  const source = value as Partial<PersistedBackupStatus>;

  const normalizedResult = source.lastResult === 'success' || source.lastResult === 'error'
    ? source.lastResult
    : 'idle';

  const normalizedTrigger = source.lastTrigger === 'manual' || source.lastTrigger === 'auto'
    ? source.lastTrigger
    : null;

  return {
    lastRunAt: typeof source.lastRunAt === 'string' ? source.lastRunAt : null,
    lastSuccessAt: typeof source.lastSuccessAt === 'string' ? source.lastSuccessAt : null,
    lastResult: normalizedResult,
    lastError: typeof source.lastError === 'string' ? source.lastError : null,
    lastTrigger: normalizedTrigger,
    lastOutputDir: typeof source.lastOutputDir === 'string' ? source.lastOutputDir : null,
    lastFiles: Array.isArray(source.lastFiles)
      ? source.lastFiles
        .map((entry) => String(entry || '').trim())
        .filter(Boolean)
      : []
  };
}

async function readAppState(key: string): Promise<unknown | null> {
  const row = await prisma.appState.findUnique({
    where: { appKey: key },
    select: { jsonValue: true }
  });

  if (!row) return null;
  return parseJsonValue(row.jsonValue);
}

async function writeAppState(key: string, value: unknown): Promise<void> {
  await prisma.appState.upsert({
    where: { appKey: key },
    create: {
      appKey: key,
      jsonValue: serializeJsonValue(value)
    },
    update: {
      jsonValue: serializeJsonValue(value)
    }
  });
}

function resolveDatabaseFilePath(): string | null {
  const configuredUrl = stripWrapQuotes(String(process.env.DATABASE_URL || ''));
  if (!configuredUrl.toLowerCase().startsWith('file:')) return null;

  const rawPath = decodeURIComponent(configuredUrl.slice('file:'.length).split('?')[0] || '');
  if (!rawPath) return null;

  if (path.isAbsolute(rawPath)) return path.normalize(rawPath);

  const candidatePaths = [
    path.resolve(process.cwd(), rawPath),
    path.resolve(process.cwd(), 'prisma', rawPath)
  ];

  const existing = candidatePaths.find((candidate) => existsSync(candidate));
  return existing || candidatePaths[1];
}

function formatDateToken(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hour}${minute}${second}`;
}

function formatDateDisplay(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function toRuntimeStatus(status: PersistedBackupStatus): BackupStatus {
  return {
    ...status,
    nextRunAt: nextRunAt ? nextRunAt.toISOString() : null,
    isRunning: isBackupRunning
  };
}

function updateNextRunDate(settings: BackupSettings): void {
  if (!settings.enabled) {
    nextRunAt = null;
    return;
  }

  nextRunAt = new Date(Date.now() + settings.intervalMinutes * 60 * 1000);
}

function clearBackupTimer(): void {
  if (backupTimer) {
    clearInterval(backupTimer);
    backupTimer = null;
  }
}

function scheduleBackupTimer(settings: BackupSettings): void {
  clearBackupTimer();
  updateNextRunDate(settings);

  if (!settings.enabled) return;

  const intervalMs = settings.intervalMinutes * 60 * 1000;

  backupTimer = setInterval(() => {
    void runBackupNow('auto').finally(() => {
      if (backupTimer) {
        updateNextRunDate(settings);
      }
    });
  }, intervalMs);
}

async function exportDatabaseSnapshot(backupDir: string, token: string): Promise<string> {
  const databasePath = resolveDatabaseFilePath();
  if (!databasePath) {
    throw new Error('DATABASE_URL sqlite dosyasi olarak cozumlenemedi');
  }

  await fs.access(databasePath);

  const extension = path.extname(databasePath) || '.db';
  const backupPath = path.join(backupDir, `cmms_database_${token}${extension}`);

  await fs.copyFile(databasePath, backupPath);

  const walPath = `${databasePath}-wal`;
  const shmPath = `${databasePath}-shm`;

  if (existsSync(walPath)) {
    await fs.copyFile(walPath, `${backupPath}-wal`);
  }

  if (existsSync(shmPath)) {
    await fs.copyFile(shmPath, `${backupPath}-shm`);
  }

  return backupPath;
}

async function exportCompletedJobsExcel(backupDir: string, token: string): Promise<string> {
  const completedJobs = await prisma.tamamlananIs.findMany({
    include: {
      personeller: {
        orderBy: { id: 'asc' }
      }
    },
    orderBy: [
      { tarih: 'desc' },
      { id: 'desc' }
    ]
  });

  const headers = [
    'ID',
    'Tarih',
    'Vardiya',
    'Ad Soyad',
    'Sicil No',
    'Bolum',
    'Makina',
    'Mudahale Turu',
    'Baslangic',
    'Bitis',
    'Sure (dk)',
    'Aciklama',
    'Malzeme',
    'Analiz Is Emri'
  ];

  const rows: Array<Array<string | number>> = [headers];

  completedJobs.forEach((job) => {
    const personeller = job.personeller.length > 0
      ? job.personeller
      : [{ sicilNo: '-', adSoyad: '-', bolum: '-' }];

    const analizBilgisi = job.analizAtananAdSoyad && job.analizAtananSicilNo
      ? `${job.analizAtananAdSoyad} (${job.analizAtananSicilNo})${job.analizBackendWorkOrderNo ? ` - ${job.analizBackendWorkOrderNo}` : ''}`
      : '-';

    personeller.forEach((personel) => {
      rows.push([
        job.recordId,
        formatDateDisplay(job.tarih),
        job.vardiya,
        personel.adSoyad,
        personel.sicilNo,
        personel.bolum,
        job.makina,
        job.mudahaleTuru,
        job.baslangicSaati,
        job.bitisSaati,
        job.sureDakika,
        job.aciklama,
        job.malzeme || '',
        analizBilgisi
      ]);
    });
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 22 },
    { wch: 24 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 45 },
    { wch: 30 },
    { wch: 36 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tamamlanan Isler');

  const backupPath = path.join(backupDir, `tamamlanan_isler_${token}.xlsx`);
  XLSX.writeFile(workbook, backupPath, { compression: true });

  return backupPath;
}

async function savePersistedStatus(status: PersistedBackupStatus): Promise<void> {
  await writeAppState(BACKUP_STATUS_KEY, status);
}

export async function getBackupSettings(): Promise<BackupSettings> {
  const stored = await readAppState(BACKUP_SETTINGS_KEY);
  const normalized = normalizeBackupSettings(stored);

  if (!stored) {
    await writeAppState(BACKUP_SETTINGS_KEY, normalized);
  }

  return normalized;
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const stored = await readAppState(BACKUP_STATUS_KEY);
  const normalized = normalizePersistedStatus(stored);

  if (!stored) {
    await savePersistedStatus(normalized);
  }

  return toRuntimeStatus(normalized);
}

export async function updateBackupSettings(partial: unknown): Promise<BackupSettings> {
  const current = await getBackupSettings();
  const merged = normalizeBackupSettings({
    ...current,
    ...(partial && typeof partial === 'object' ? partial : {})
  }, current);

  await writeAppState(BACKUP_SETTINGS_KEY, merged);
  scheduleBackupTimer(merged);

  return merged;
}

export async function runBackupNow(trigger: BackupTrigger = 'manual'): Promise<BackupRunResult> {
  if (isBackupRunning) {
    const status = await getBackupStatus();
    return {
      success: false,
      message: 'Yedekleme zaten devam ediyor',
      files: [],
      status,
      errorCode: 'RUNNING'
    };
  }

  isBackupRunning = true;

  const startedAt = new Date();
  const settings = await getBackupSettings();
  const storedStatus = normalizePersistedStatus(await readAppState(BACKUP_STATUS_KEY));
  let success = false;
  let message = 'Yedekleme basarisiz';
  let files: string[] = [];
  let errorCode: BackupRunResult['errorCode'] | undefined = 'FAILED';

  try {
    await fs.mkdir(settings.backupDir, { recursive: true });

    const token = formatDateToken(startedAt);
    const producedFiles: string[] = [];

    if (settings.includeDatabase) {
      const databaseFile = await exportDatabaseSnapshot(settings.backupDir, token);
      producedFiles.push(databaseFile);
    }

    if (settings.includeCompletedExcel) {
      const completedExcelFile = await exportCompletedJobsExcel(settings.backupDir, token);
      producedFiles.push(completedExcelFile);
    }

    const persistedStatus: PersistedBackupStatus = {
      ...storedStatus,
      lastRunAt: startedAt.toISOString(),
      lastSuccessAt: new Date().toISOString(),
      lastResult: 'success',
      lastError: null,
      lastTrigger: trigger,
      lastOutputDir: settings.backupDir,
      lastFiles: producedFiles
    };

    await savePersistedStatus(persistedStatus);
    success = true;
    message = 'Yedekleme tamamlandi';
    files = producedFiles;
    errorCode = undefined;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen yedekleme hatasi';

    const persistedStatus: PersistedBackupStatus = {
      ...storedStatus,
      lastRunAt: startedAt.toISOString(),
      lastResult: 'error',
      lastError: errorMessage,
      lastTrigger: trigger,
      lastOutputDir: settings.backupDir,
      lastFiles: []
    };

    await savePersistedStatus(persistedStatus);
    success = false;
    message = 'Yedekleme basarisiz';
    files = [];
    errorCode = 'FAILED';
  } finally {
    isBackupRunning = false;
  }

  const status = await getBackupStatus();

  const result: BackupRunResult = {
    success,
    message,
    files,
    status
  };

  if (errorCode) {
    result.errorCode = errorCode;
  }

  return result;
}

export async function initializeBackupScheduler(): Promise<void> {
  const settings = await getBackupSettings();
  await getBackupStatus();
  scheduleBackupTimer(settings);
}
