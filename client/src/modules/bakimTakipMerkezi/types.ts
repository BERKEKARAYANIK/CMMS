import { ChecklistData, MaintenanceTask } from '../dcMotorBakim/types';

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  CAUTION = 'CAUTION',
  CRITICAL = 'CRITICAL'
}

export enum ComponentStatus {
  OK = 'Sorunsuz',
  MAINTENANCE_REQUIRED = 'Yerinde bakım yapılmalı',
  DAMAGED_NOT_WORKING = 'Yerinde hasarlı çalışmıyor',
  NOT_PRESENT = 'Yerinde değil',
  PROBLEMATIC_WORKING = 'Sorunlu çalışıyor',
  PROBLEMATIC_NOT_WORKING = 'Sorunlu çalışmıyor'
}

export interface HistoryEntry {
  timestamp: number;
  details: string;
  status: HealthStatus;
}

export interface MotorState {
  id: string;
  name: string;
  motorStatus: ComponentStatus;
  reducerStatus: ComponentStatus;
  rollerStatus: ComponentStatus;
  otherElectrical: ComponentStatus;
  otherMechanical: ComponentStatus;
  electricalComment: string;
  mechanicalComment: string;
  history: HistoryEntry[];
  maintenanceMonths: string[];
  monthlyReports: Record<string, string[]>;
  dcMotorReports: Record<string, {
    date: string;
    technician: string;
    assessment: string;
    data: ChecklistData;
    task: MaintenanceTask;
    timestamp: string;
  }>;
}

export enum ModuleType {
  ACCUMULATION = 'AKÜMÜLASYON',
  RELAY_WAY = 'RÖLE YOLU',
  ALIGNMENT = 'HİZALAMA',
  DC_MOTOR = 'DC MOTOR'
}

export interface ModuleConfig {
  type: ModuleType;
  motorCount: number;
}

export type AppData = Record<number, Record<ModuleType, MotorState[]>>;
export type MachineConfigs = Record<number, Record<ModuleType, number>>;
