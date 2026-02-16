export interface BackupSettings {
  enabled: boolean;
  intervalMinutes: number;
  backupDir: string;
  includeDatabase: boolean;
  includeCompletedExcel: boolean;
}

export interface BackupStatus {
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastResult: 'idle' | 'success' | 'error';
  lastError: string | null;
  lastTrigger: 'manual' | 'auto' | null;
  lastOutputDir: string | null;
  lastFiles: string[];
  nextRunAt: string | null;
  isRunning: boolean;
}

export interface BackupSettingsResponse {
  settings: BackupSettings;
  status: BackupStatus;
}
