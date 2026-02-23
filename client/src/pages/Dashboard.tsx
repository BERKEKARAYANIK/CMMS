import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ClipboardList,
  Wrench,
  AlertTriangle,
  Zap,
  Building2,
  Shield,
  Star } from
'lucide-react';
import { appStateApi, dashboardApi, jobEntriesApi } from '../services/api';
import type { DashboardSummary } from '../types';
import {
  APP_STATE_KEYS,
  normalizeDashboardFiveSLevels,
  type DashboardFiveSLevelsState } from
'../constants/appState';
import { ISG_YEARLY_DEPARTMENT_RATES, type IsgYearKey } from '../data/isg';
import { ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR } from '../data/isgMissing';

type DepartmentFiveS = {
  id: string;
  name: string;
  currentLevel: string;
  icon: React.ElementType;
  accent: string;
};

type IsgDepartmentKpi = {
  id: string;
  name: string;
  accidents: number;
  nonComplianceRate: number;
  crossAuditRate: number;
  icon: React.ElementType;
  accent: string;
};

type IsgDepartmentKpiDefinition = {
  id: string;
  name: string;
  accidents: number;
  icon: React.ElementType;
  accent: string;
  uygunsuzlukDepartmentAliases: string[];
  caprazDepartmentAliases: string[];
};

type DepartmentDowntimeKpi = {
  id: string;
  name: string;
  icon: React.ElementType;
  accent: string;
  unplannedDowntimeRate: number;
  plannedDowntimeRate: number;
  plannedMaintenanceMinutes: number;
  totalMaintenanceMinutes: number;
  mttrMinutes: number;
  mtbfHours: number;
  monthlyDowntimeMinutes: number;
};

type DurusDataset = {
  sourceFileName: string;
  uploadedAt: string;
  rowCount: number;
  rows: Array<Record<string, string>>;
};

type DurusTemplateKey = 'durusKayitlari' | 'durusOranlari';
type DurusMonthImports = Partial<Record<DurusTemplateKey, DurusDataset>>;

type DurusImportsState = {
  activeMonth?: string;
  months?: Record<string, DurusMonthImports>;
} & DurusMonthImports;

type ParsedDurusKayitRow = {
  machineKey: string;
  machineNumber: number | null;
  departmentText: string;
  downtimeMinutes: number;
};

type ParsedDurusOranRow = {
  machineKey: string;
  machineNumber: number | null;
  possibleMinutes: number;
  actualMinutes: number;
  operationsMinutes: number;
  electricalMinutes: number;
  mechanicalMinutes: number;
  helperMinutes: number;
};

type DowntimeOranDepartment = 'electrical' | 'mechanical' | 'helper';

type DowntimeDepartmentDefinition = {
  id: DepartmentDowntimeKpi['id'];
  name: string;
  icon: React.ElementType;
  accent: string;
  kayitDepartmentAliases: string[];
  oranDepartment: DowntimeOranDepartment;
};

type DashboardCompletedJobPersonel = {
  bolum?: string;
};

type DashboardCompletedJob = {
  tarih: string;
  makina: string;
  mudahaleTuru: string;
  sureDakika: number;
  personeller?: DashboardCompletedJobPersonel[];
};

type PlannedMaintenanceDepartmentStats = Record<
  DepartmentDowntimeKpi['id'],
  {
    plannedMinutes: number;
  }>;


const getCurrentMonthKey = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const normalizeMonthKeyStrict = (value: unknown): string => {
  const text = String(value ?? '').trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(text) ? text : '';
};

const normalizeMonthKey = (value: string): string => normalizeMonthKeyStrict(value) || getCurrentMonthKey();
const DASHBOARD_ISG_YEAR: IsgYearKey = '2026';

const normalizeDepartmentText = (value: string): string =>
String(value || '').
normalize('NFD').
replace(/[\u0300-\u036f]/g, '').
toUpperCase().
replace(/[^A-Z0-9 ]/g, ' ').
replace(/\s+/g, ' ').
trim();

const matchesDepartmentByAliases = (department: string, aliases: string[]): boolean => {
  const normalizedDepartment = normalizeDepartmentText(department);
  return aliases.some((alias) => {
    const normalizedAlias = normalizeDepartmentText(alias);
    return (
      normalizedDepartment === normalizedAlias ||
      normalizedDepartment.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedDepartment));

  });
};

const matchesDepartmentByAliasesStrict = (department: string, aliases: string[]): boolean => {
  const normalizedDepartment = normalizeDepartmentText(department);
  return aliases.some((alias) => {
    const normalizedAlias = normalizeDepartmentText(alias);
    return (
      normalizedDepartment === normalizedAlias ||
      normalizedDepartment.includes(normalizedAlias));

  });
};

const DEPARTMENT_FIVE_S: DepartmentFiveS[] = [
{
  id: 'elektrik-ana-bina',
  name: 'Elektrik Bakım Ana Bina',
  currentLevel: '3S',
  icon: Zap,
  accent: 'bg-yellow-500'
},
{
  id: 'elektrik-ek-bina',
  name: 'Elektrik Bakım Ek Bina',
  currentLevel: '3S',
  icon: Zap,
  accent: 'bg-amber-500'
},
{
  id: 'mekanik',
  name: 'Mekanik',
  currentLevel: '3S',
  icon: Wrench,
  accent: 'bg-blue-500'
},
{
  id: 'yardimci-tesisler',
  name: 'Yardımcı Tesisler',
  currentLevel: '3S',
  icon: Building2,
  accent: 'bg-emerald-500'
}];


const ISG_DEPARTMENT_KPI_DEFINITIONS: IsgDepartmentKpiDefinition[] = [
{
  id: 'elektrik-ana-bina',
  name: 'Elektrik Bakım Ana Bina',
  accidents: 0,
  icon: Zap,
  accent: 'bg-yellow-500',
  uygunsuzlukDepartmentAliases: ['E.BAKIM-1', 'E BAKIM 1', 'ELEKTRIK BAKIM ANA BINA'],
  caprazDepartmentAliases: ['E. BAKIM', 'E BAKIM', 'ELEKTRIK BAKIM']
},
{
  id: 'elektrik-ek-bina',
  name: 'Elektrik Bakım Ek Bina',
  accidents: 0,
  icon: Zap,
  accent: 'bg-amber-500',
  uygunsuzlukDepartmentAliases: ['E.BAKIM-2', 'E BAKIM 2', 'ELEKTRIK BAKIM EK BINA'],
  caprazDepartmentAliases: ['E. BAKIM', 'E BAKIM', 'ELEKTRIK BAKIM']
},
{
  id: 'mekanik',
  name: 'Mekanik',
  accidents: 4,
  icon: Wrench,
  accent: 'bg-blue-500',
  uygunsuzlukDepartmentAliases: ['M. BAKIM', 'M BAKIM', 'MEKANIK BAKIM'],
  caprazDepartmentAliases: ['M. BAKIM', 'M BAKIM', 'MEKANIK BAKIM']
},
{
  id: 'yardimci-tesisler',
  name: 'Yardımcı Tesisler',
  accidents: 0,
  icon: Building2,
  accent: 'bg-emerald-500',
  uygunsuzlukDepartmentAliases: ['Y. TESISLER', 'Y TESISLER', 'YARDIMCI TESISLER'],
  caprazDepartmentAliases: ['Y. TESISLER', 'Y TESISLER', 'YARDIMCI TESISLER']
}];


const DOWNTIME_DEPARTMENT_DEFINITIONS: DowntimeDepartmentDefinition[] = [
{
  id: 'elektrik-ana-bina',
  name: 'Elektrik Bakım Ana Bina',
  icon: Zap,
  accent: 'bg-yellow-500',
  kayitDepartmentAliases: ['E.BAKIM-1', 'E BAKIM 1', 'ELEKTRIK BAKIM ANA BINA'],
  oranDepartment: 'electrical'
},
{
  id: 'elektrik-ek-bina',
  name: 'Elektrik Bakım Ek Bina',
  icon: Zap,
  accent: 'bg-amber-500',
  kayitDepartmentAliases: ['E.BAKIM-2', 'E BAKIM 2', 'ELEKTRIK BAKIM EK BINA'],
  oranDepartment: 'electrical'
},
{
  id: 'mekanik',
  name: 'Mekanik',
  icon: Wrench,
  accent: 'bg-blue-500',
  kayitDepartmentAliases: ['M. BAKIM', 'M BAKIM', 'MEKANIK BAKIM', 'MEKANIK'],
  oranDepartment: 'mechanical'
},
{
  id: 'yardimci-tesisler',
  name: 'Yardımcı Tesisler',
  icon: Building2,
  accent: 'bg-emerald-500',
  kayitDepartmentAliases: ['Y. TESISLER', 'Y TESISLER', 'YARDIMCI TESISLER', 'YARDIMCI TESIS'],
  oranDepartment: 'helper'
}];


const ELECTRICAL_GENERIC_DEPARTMENT_ALIASES = ['ELEKTRIK BAKIM', 'ELEKTRIK'];
const ELECTRICAL_MACHINE_SPLIT_THRESHOLD = 16;

function normalizeDurusDataset(raw: unknown): DurusDataset | null {
  if (!raw || typeof raw !== 'object') return null;

  const source = raw as Record<string, unknown>;
  const rows = Array.isArray(source.rows) ?
  source.rows.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const mapped = Object.entries(item as Record<string, unknown>).reduce<Record<string, string>>((acc, [k, v]) => {
      const key = String(k || '').trim();
      if (!key) return acc;
      acc[key] = String(v ?? '').trim();
      return acc;
    }, {});
    return Object.keys(mapped).length > 0 ? [mapped] : [];
  }) :
  [];

  return {
    sourceFileName: String(source.sourceFileName || '').trim(),
    uploadedAt: String(source.uploadedAt || '').trim(),
    rowCount: rows.length,
    rows
  };
}

function normalizeDurusImportsState(value: unknown): DurusImportsState {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;
  const monthMap: Record<string, DurusMonthImports> = {};
  const upsertMonth = (monthKey: string, templateKey: DurusTemplateKey, dataset: DurusDataset) => {
    if (!monthMap[monthKey]) monthMap[monthKey] = {};
    monthMap[monthKey][templateKey] = dataset;
  };

  const rawMonths = source.months;
  if (rawMonths && typeof rawMonths === 'object') {
    Object.entries(rawMonths as Record<string, unknown>).forEach(([rawMonthKey, rawMonthValue]) => {
      const monthKey = normalizeMonthKeyStrict(rawMonthKey);
      if (!monthKey || !rawMonthValue || typeof rawMonthValue !== 'object') return;
      const monthData = rawMonthValue as Record<string, unknown>;

      (['durusKayitlari', 'durusOranlari'] as const).forEach((templateKey) => {
        const dataset = normalizeDurusDataset(monthData[templateKey]);
        if (!dataset) return;
        upsertMonth(monthKey, templateKey, dataset);
      });
    });
  }

  (['durusKayitlari', 'durusOranlari'] as const).forEach((templateKey) => {
    const legacyDataset = normalizeDurusDataset(source[templateKey]);
    if (!legacyDataset) return;
    const uploadedMonth = normalizeMonthKeyStrict(String(legacyDataset.uploadedAt || '').slice(0, 7));
    upsertMonth(uploadedMonth || getCurrentMonthKey(), templateKey, legacyDataset);
  });

  const monthKeys = Object.keys(monthMap).
  filter((monthKey) => {
    const monthData = monthMap[monthKey];
    return Boolean(monthData.durusKayitlari || monthData.durusOranlari);
  }).
  sort((a, b) => b.localeCompare(a, 'tr-TR'));

  if (monthKeys.length === 0) return {};

  const months = monthKeys.reduce<Record<string, DurusMonthImports>>((acc, monthKey) => {
    acc[monthKey] = monthMap[monthKey];
    return acc;
  }, {});

  const activeMonthCandidate = normalizeMonthKeyStrict(source.activeMonth);
  const activeMonth = activeMonthCandidate && monthKeys.includes(activeMonthCandidate) ?
  activeMonthCandidate :
  monthKeys[0];

  return { activeMonth, months };
}

function parseNumber(value: unknown): number {
  const text = String(value ?? '').
  replace(/\s+/g, '').
  replace(/%/g, '').
  trim();

  if (!text) return 0;

  const sanitized = text.replace(/[^0-9,.\-]/g, '');
  if (!sanitized || sanitized === '-') return 0;

  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');
  let normalized = sanitized;

  if (hasComma && hasDot) {
    const lastComma = sanitized.lastIndexOf(',');
    const lastDot = sanitized.lastIndexOf('.');
    normalized = lastComma > lastDot ?
    sanitized.replace(/\./g, '').replace(',', '.') :
    sanitized.replace(/,/g, '');
  } else if (hasComma) {
    const parts = sanitized.split(',');
    const commaAsThousands = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
    normalized = commaAsThousands ? sanitized.replace(/,/g, '') : sanitized.replace(',', '.');
  } else if (hasDot) {
    const parts = sanitized.split('.');
    const dotAsThousands = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
    normalized = dotAsThousands ? sanitized.replace(/\./g, '') : sanitized;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDowntimeMinutes(value: unknown): number {
  const text = String(value ?? '').
  replace(/\s+/g, '').
  trim();

  if (!text) return 0;

  const sanitized = text.replace(/[^0-9,.\-]/g, '');
  if (!sanitized || sanitized === '-') return 0;

  const commaIndex = sanitized.indexOf(',');
  const dotIndex = sanitized.indexOf('.');
  const firstSeparatorIndex = [commaIndex, dotIndex].
  filter((index) => index >= 0).
  reduce((min, index) => index < min ? index : min, Number.POSITIVE_INFINITY);

  const integerPart = Number.isFinite(firstSeparatorIndex) ?
  sanitized.slice(0, firstSeparatorIndex) :
  sanitized;

  const parsed = Number.parseInt(integerPart, 10);
  if (!Number.isFinite(parsed)) return 0;

  const nonNegative = parsed < 0 ? 0 : parsed;
  return Math.min(nonNegative, 480);
}

function normalizeMachineKey(value: unknown): string {
  return String(value ?? '').
  trim().
  replace(/\s+/g, ' ').
  toLocaleLowerCase('tr-TR');
}

function extractMachineNumber(value: unknown): number | null {
  const match = String(value ?? '').match(/(\d+)/);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseDurusKayitRows(rows: Array<Record<string, string>>): ParsedDurusKayitRow[] {
  return rows.flatMap((row) => {
    const machineKey = normalizeMachineKey(row['ISYERI']);
    const departmentText = normalizeDepartmentText(String(row['BOLUM TANIMI'] || ''));
    const downtimeMinutes = parseDowntimeMinutes(row['TOPLAM DURUS (DAK)'] || row['TOPLAM DURUS']);
    if (!machineKey || !departmentText || downtimeMinutes <= 0) return [];

    return [{
      machineKey,
      machineNumber: extractMachineNumber(row['ISYERI']),
      departmentText,
      downtimeMinutes
    }];
  });
}

function parseDurusOranRows(rows: Array<Record<string, string>>): ParsedDurusOranRow[] {
  return rows.flatMap((row) => {
    const machineRaw = String(row['MAKINE'] || '').trim();
    const machineKey = normalizeMachineKey(machineRaw);
    if (!machineKey) return [];

    return [{
      machineKey,
      machineNumber: extractMachineNumber(machineRaw),
      possibleMinutes: parseNumber(row['MUMKUN CALISMA(DK)']),
      actualMinutes: parseNumber(row['FIILI CALISMA(DK)']),
      operationsMinutes: parseNumber(row['ISLETME(DK)']),
      electricalMinutes: parseNumber(row['ELEKTRIK(DK)']),
      mechanicalMinutes: parseNumber(row['MEKANIK(DK)']),
      helperMinutes: parseNumber(row['YARDIMCI TESIS(DK)'])
    }];
  });
}

function getDepartmentMinutesByOranType(row: ParsedDurusOranRow, department: DowntimeOranDepartment): number {
  if (department === 'electrical') return row.electricalMinutes;
  if (department === 'mechanical') return row.mechanicalMinutes;
  return row.helperMinutes;
}

function sumOranForMachines(
rows: ParsedDurusOranRow[],
machineSet: Set<string>,
department: DowntimeOranDepartment)
: {possibleMinutes: number;actualMinutes: number;operationsMinutes: number;departmentMinutes: number;} {
  return rows.reduce(
    (acc, row) => {
      if (!machineSet.has(row.machineKey)) return acc;
      acc.possibleMinutes += row.possibleMinutes;
      acc.actualMinutes += row.actualMinutes;
      acc.operationsMinutes += row.operationsMinutes;
      acc.departmentMinutes += getDepartmentMinutesByOranType(row, department);
      return acc;
    },
    { possibleMinutes: 0, actualMinutes: 0, operationsMinutes: 0, departmentMinutes: 0 }
  );
}

function buildEmptyPlannedMaintenanceStats(): PlannedMaintenanceDepartmentStats {
  return DOWNTIME_DEPARTMENT_DEFINITIONS.reduce<PlannedMaintenanceDepartmentStats>((acc, definition) => {
    acc[definition.id] = {
      plannedMinutes: 0
    };
    return acc;
  }, {} as PlannedMaintenanceDepartmentStats);
}

function isPlannedMaintenanceType(value: unknown): boolean {
  const normalized = normalizeDepartmentText(String(value || ''));
  if (!normalized) return false;
  return (
    normalized.includes('PLANLI BAKIM') ||
    normalized.includes('PERIYODIK BAKIM'));

}

function getMonthKeyFromDateValue(value: unknown): string {
  const text = String(value || '').trim();
  const match = /^(\d{4})-(\d{2})/.exec(text);
  if (!match) return '';
  return `${match[1]}-${match[2]}`;
}

function resolveCompletedJobDepartments(job: DashboardCompletedJob): Set<DepartmentDowntimeKpi['id']> {
  const result = new Set<DepartmentDowntimeKpi['id']>();
  let hasGenericElectrical = false;

  (job.personeller || []).forEach((personel) => {
    const department = String(personel?.bolum || '').trim();
    if (!department) return;

    if (matchesDepartmentByAliasesStrict(department, DOWNTIME_DEPARTMENT_DEFINITIONS[0].kayitDepartmentAliases)) {
      result.add('elektrik-ana-bina');
      return;
    }
    if (matchesDepartmentByAliasesStrict(department, DOWNTIME_DEPARTMENT_DEFINITIONS[1].kayitDepartmentAliases)) {
      result.add('elektrik-ek-bina');
      return;
    }
    if (matchesDepartmentByAliasesStrict(department, DOWNTIME_DEPARTMENT_DEFINITIONS[2].kayitDepartmentAliases)) {
      result.add('mekanik');
      return;
    }
    if (matchesDepartmentByAliasesStrict(department, DOWNTIME_DEPARTMENT_DEFINITIONS[3].kayitDepartmentAliases)) {
      result.add('yardimci-tesisler');
      return;
    }
    if (matchesDepartmentByAliasesStrict(department, ELECTRICAL_GENERIC_DEPARTMENT_ALIASES)) {
      hasGenericElectrical = true;
    }
  });

  if (
  hasGenericElectrical &&
  !result.has('elektrik-ana-bina') &&
  !result.has('elektrik-ek-bina'))
  {
    const machineNumber = extractMachineNumber(job.makina);
    if (machineNumber != null && machineNumber > ELECTRICAL_MACHINE_SPLIT_THRESHOLD) {
      result.add('elektrik-ek-bina');
    } else {
      result.add('elektrik-ana-bina');
    }
  }

  return result;
}

function buildDowntimeKpisFromDurus(
kayitRows: Array<Record<string, string>>,
oranRows: Array<Record<string, string>>)
: DepartmentDowntimeKpi[] {
  const parsedKayitRows = parseDurusKayitRows(kayitRows);
  const parsedOranRows = parseDurusOranRows(oranRows);

  const explicitElectricalAnaRows: ParsedDurusKayitRow[] = [];
  const explicitElectricalEkRows: ParsedDurusKayitRow[] = [];
  const genericElectricalRows: ParsedDurusKayitRow[] = [];
  const mekanikRows: ParsedDurusKayitRow[] = [];
  const helperRows: ParsedDurusKayitRow[] = [];

  parsedKayitRows.forEach((row) => {
    if (matchesDepartmentByAliasesStrict(row.departmentText, DOWNTIME_DEPARTMENT_DEFINITIONS[0].kayitDepartmentAliases)) {
      explicitElectricalAnaRows.push(row);
      return;
    }

    if (matchesDepartmentByAliasesStrict(row.departmentText, DOWNTIME_DEPARTMENT_DEFINITIONS[1].kayitDepartmentAliases)) {
      explicitElectricalEkRows.push(row);
      return;
    }

    if (matchesDepartmentByAliasesStrict(row.departmentText, DOWNTIME_DEPARTMENT_DEFINITIONS[2].kayitDepartmentAliases)) {
      mekanikRows.push(row);
      return;
    }

    if (matchesDepartmentByAliasesStrict(row.departmentText, DOWNTIME_DEPARTMENT_DEFINITIONS[3].kayitDepartmentAliases)) {
      helperRows.push(row);
      return;
    }

    if (matchesDepartmentByAliasesStrict(row.departmentText, ELECTRICAL_GENERIC_DEPARTMENT_ALIASES)) {
      genericElectricalRows.push(row);
    }
  });

  const electricalAnaRows = [...explicitElectricalAnaRows];
  const electricalEkRows = [...explicitElectricalEkRows];

  genericElectricalRows.forEach((row) => {
    if (row.machineNumber != null) {
      if (row.machineNumber <= ELECTRICAL_MACHINE_SPLIT_THRESHOLD) {
        electricalAnaRows.push(row);
      } else {
        electricalEkRows.push(row);
      }
      return;
    }

    if (electricalAnaRows.length <= electricalEkRows.length) {
      electricalAnaRows.push(row);
    } else {
      electricalEkRows.push(row);
    }
  });

  const allOranMachineKeys = new Set(parsedOranRows.map((row) => row.machineKey));
  const electricalAnaMachines = new Set(
    parsedOranRows.
    filter((row) => row.machineNumber != null && row.machineNumber <= ELECTRICAL_MACHINE_SPLIT_THRESHOLD).
    map((row) => row.machineKey)
  );
  const electricalEkMachines = new Set(
    parsedOranRows.
    filter((row) => row.machineNumber != null && row.machineNumber > ELECTRICAL_MACHINE_SPLIT_THRESHOLD).
    map((row) => row.machineKey)
  );

  const addElectricalMachineIfUnmapped = (machineKey: string, target: 'ana' | 'ek') => {
    if (!machineKey || !allOranMachineKeys.has(machineKey)) return;
    if (electricalAnaMachines.has(machineKey) || electricalEkMachines.has(machineKey)) return;

    if (target === 'ana') {
      electricalAnaMachines.add(machineKey);
    } else {
      electricalEkMachines.add(machineKey);
    }
  };

  electricalAnaRows.forEach((row) => addElectricalMachineIfUnmapped(row.machineKey, 'ana'));
  electricalEkRows.forEach((row) => addElectricalMachineIfUnmapped(row.machineKey, 'ek'));

  parsedOranRows.forEach((row) => {
    if (electricalAnaMachines.has(row.machineKey) || electricalEkMachines.has(row.machineKey)) return;

    if (row.machineNumber != null) {
      if (row.machineNumber <= ELECTRICAL_MACHINE_SPLIT_THRESHOLD) {
        electricalAnaMachines.add(row.machineKey);
      } else {
        electricalEkMachines.add(row.machineKey);
      }
      return;
    }

    if (electricalAnaMachines.size <= electricalEkMachines.size) {
      electricalAnaMachines.add(row.machineKey);
    } else {
      electricalEkMachines.add(row.machineKey);
    }
  });

  const allMachines = new Set(parsedOranRows.map((row) => row.machineKey));

  const rowsByDepartment: Record<string, ParsedDurusKayitRow[]> = {
    'elektrik-ana-bina': electricalAnaRows,
    'elektrik-ek-bina': electricalEkRows,
    mekanik: mekanikRows,
    'yardimci-tesisler': helperRows
  };

  const machineSetByDepartment: Record<string, Set<string>> = {
    'elektrik-ana-bina': electricalAnaMachines,
    'elektrik-ek-bina': electricalEkMachines,
    mekanik: allMachines,
    'yardimci-tesisler': allMachines
  };

  return DOWNTIME_DEPARTMENT_DEFINITIONS.map((definition) => {
    const relatedKayitRows = rowsByDepartment[definition.id] || [];
    const machineSet = new Set(machineSetByDepartment[definition.id] || []);

    const oranTotals = sumOranForMachines(parsedOranRows, machineSet, definition.oranDepartment);
    const eventCount = relatedKayitRows.length;
    const monthlyDowntimeMinutes = relatedKayitRows.reduce((acc, row) => acc + row.downtimeMinutes, 0);
    const mttrMinutes = eventCount > 0 ? monthlyDowntimeMinutes / eventCount : 0;
    const mtbfHours = eventCount > 0 ? oranTotals.actualMinutes / eventCount / 60 : 0;
    const safePossible = oranTotals.possibleMinutes || 1;

    return {
      id: definition.id,
      name: definition.name,
      icon: definition.icon,
      accent: definition.accent,
      unplannedDowntimeRate: Number((oranTotals.departmentMinutes / safePossible * 100).toFixed(2)),
      plannedDowntimeRate: Number((oranTotals.operationsMinutes / safePossible * 100).toFixed(2)),
      plannedMaintenanceMinutes: 0,
      totalMaintenanceMinutes: 0,
      mttrMinutes: Number(mttrMinutes.toFixed(1)),
      mtbfHours: Number(mtbfHours.toFixed(1)),
      monthlyDowntimeMinutes: Math.round(monthlyDowntimeMinutes)
    };
  });
}

const formatMonthLabel = (monthKey: string): string => {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const [year, month] = normalizedMonth.split('-').map(Number);
  return format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: tr });
};

function getFiveSVisual(level: string): {
  panelClass: string;
  textClass: string;
  showStar: boolean;
} {
  const normalizedLevel = String(level || '').trim().toUpperCase();

  if (normalizedLevel === '0S' || normalizedLevel === '1S') {
    return {
      panelClass: 'border-red-100 bg-red-50',
      textClass: 'text-red-700',
      showStar: false
    };
  }

  if (normalizedLevel === '2S') {
    return {
      panelClass: 'border-amber-100 bg-amber-50',
      textClass: 'text-amber-700',
      showStar: false
    };
  }

  if (normalizedLevel === '3S') {
    return {
      panelClass: 'border-lime-100 bg-lime-50',
      textClass: 'text-lime-700',
      showStar: false
    };
  }

  if (normalizedLevel === '4S' || normalizedLevel === '5S') {
    return {
      panelClass: 'border-emerald-100 bg-emerald-50',
      textClass: 'text-emerald-700',
      showStar: normalizedLevel === '5S'
    };
  }

  return {
    panelClass: 'border-gray-200 bg-gray-50',
    textClass: 'text-gray-700',
    showStar: false
  };
}

function ProgressBar({
  label,
  value,
  fillClass,
  maxValue = 100,
  valueDisplay = 'percent'






}: {label: string;value: number;fillClass: string;maxValue?: number;valueDisplay?: 'percent' | 'ratio' | 'rawPercent' | 'raw';}) {
  const safeValue = Math.max(0, Math.min(maxValue, value));
  const safeWidth = maxValue > 0 ? safeValue / maxValue * 100 : 0;
  const normalizedPercent = maxValue > 0 ? safeValue / maxValue * 100 : 0;
  const formattedValue = safeValue.toFixed(2).replace('.', ',');

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">
          {valueDisplay === 'ratio' ?
          `${formattedValue}/${maxValue}` :
          valueDisplay === 'rawPercent' ?
          `%${formattedValue}` :
          valueDisplay === 'raw' ?
          formattedValue :
          `%${Math.round(normalizedPercent)}`}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-2.5 rounded-full transition-all ${fillClass}`}
          style={{ width: `${safeWidth}%` }} />
        
      </div>
    </div>);

}

function DepartmentFiveSCard({ item }: {item: DepartmentFiveS;}) {
  const Icon = item.icon;
  const fiveSVisual = getFiveSVisual(item.currentLevel);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${item.accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500">5S Çalışmasi</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          Hedef 5S
        </span>
      </div>

      <div className={`relative rounded-xl border p-4 text-center ${fiveSVisual.panelClass}`}>
        {fiveSVisual.showStar &&
        <span className="absolute right-2 top-2 rounded-full bg-amber-100 p-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </span>
        }
        <p className={`text-xs font-medium uppercase tracking-wide ${fiveSVisual.textClass}`}>Mevcut Seviye</p>
        <p className={`mt-2 text-4xl font-bold ${fiveSVisual.textClass}`}>{item.currentLevel}</p>
      </div>
    </div>);

}

function DepartmentIsgCard({ item }: {item: IsgDepartmentKpi;}) {
  const Icon = item.icon;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${item.accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500">İSG KPI</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-red-700">İSG Kaza Sayısı</p>
        <p className="mt-1 text-3xl font-bold text-red-700">{item.accidents}</p>
      </div>

      <div className="space-y-3">
        <ProgressBar label="İSG Uygunsuzluk Yüzdesi" value={item.nonComplianceRate} fillClass="bg-amber-500" />
        <ProgressBar label="İSG Çapraz Denetim Yüzdesi" value={item.crossAuditRate} fillClass="bg-emerald-500" />
      </div>
    </div>);

}

function DepartmentDowntimeCard({ item }: {item: DepartmentDowntimeKpi;}) {
  const Icon = item.icon;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${item.accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500">Duruş KPI</p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-orange-700">Plansız Bakım Orani</p>
          <p className="mt-1 text-lg font-bold text-orange-700">
            %{item.unplannedDowntimeRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-blue-700">PMP (%)</p>
          <p className="mt-1 text-lg font-bold text-blue-700">
            %{item.plannedDowntimeRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[10px] text-blue-700">Planlı: {(item.plannedMaintenanceMinutes / 60).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} saat / Toplam: {(item.totalMaintenanceMinutes / 60).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} saat</p>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar
          label="Plansız Bakım Orani"
          value={item.unplannedDowntimeRate}
          fillClass="bg-orange-500"
          maxValue={10}
          valueDisplay="rawPercent" />
        
        <ProgressBar
          label="PMP (%)"
          value={item.plannedDowntimeRate}
          fillClass="bg-blue-500"
          maxValue={100}
          valueDisplay="rawPercent" />
        
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500">MTTR</p>
          <p className="font-semibold text-gray-900">
            {item.mttrMinutes.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} dk
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500">MTBF</p>
          <p className="font-semibold text-gray-900">
            {item.mtbfHours.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} saat
          </p>
        </div>
        <div className="col-span-2 rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500">Aylık Duruş Süresi</p>
          <p className="font-semibold text-gray-900">
            {item.monthlyDowntimeMinutes.toLocaleString('tr-TR')} dk
          </p>
        </div>
      </div>
    </div>);

}

export default function Dashboard() {
  const [selectedDowntimeMonth, setSelectedDowntimeMonth] = useState<string>(() => getCurrentMonthKey());

  const { data: durusImports } = useQuery({
    queryKey: ['dashboard-durus-imports'],
    queryFn: async () => {
      try {
        const response = await appStateApi.get(APP_STATE_KEYS.settingsDurusAnaliziImports);
        return normalizeDurusImportsState(response.data?.data?.value);
      } catch {
        return {} as DurusImportsState;
      }
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const { data: completedJobs = [] } = useQuery({
    queryKey: ['dashboard-completed-jobs'],
    queryFn: async () => {
      try {
        const response = await jobEntriesApi.getCompleted();
        const rows = response.data?.data;
        return Array.isArray(rows) ? rows as DashboardCompletedJob[] : [];
      } catch {
        return [] as DashboardCompletedJob[];
      }
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  const { data: dashboardFiveSLevels } = useQuery({
    queryKey: ['dashboard-five-s-levels'],
    queryFn: async () => {
      const response = await appStateApi.get(APP_STATE_KEYS.dashboardFiveSLevels);
      return normalizeDashboardFiveSLevels(response.data?.data?.value) as DashboardFiveSLevelsState;
    }
  });

  const departmentFiveS = useMemo(
    () => DEPARTMENT_FIVE_S.map((item) => ({
      ...item,
      currentLevel: dashboardFiveSLevels?.[item.id] || item.currentLevel
    })),
    [dashboardFiveSLevels]
  );

  const downtimeMonthOptions = useMemo(() => {
    if (!durusImports?.months || typeof durusImports.months !== 'object') return [];
    return Object.keys(durusImports.months).
    map((monthKey) => normalizeMonthKeyStrict(monthKey)).
    filter(Boolean).
    sort((a, b) => b.localeCompare(a, 'tr-TR'));
  }, [durusImports]);

  useEffect(() => {
    if (downtimeMonthOptions.length === 0) return;
    if (downtimeMonthOptions.includes(selectedDowntimeMonth)) return;

    const preferredMonth = normalizeMonthKeyStrict(durusImports?.activeMonth);
    if (preferredMonth && downtimeMonthOptions.includes(preferredMonth)) {
      setSelectedDowntimeMonth(preferredMonth);
      return;
    }

    setSelectedDowntimeMonth(downtimeMonthOptions[0]);
  }, [downtimeMonthOptions, durusImports?.activeMonth, selectedDowntimeMonth]);

  const selectedDowntimeMonthRows = useMemo(() => {
    if (durusImports?.months && typeof durusImports.months === 'object') {
      return {
        kayitRows: durusImports.months?.[selectedDowntimeMonth]?.durusKayitlari?.rows ?? [],
        oranRows: durusImports.months?.[selectedDowntimeMonth]?.durusOranlari?.rows ?? []
      };
    }

    return {
      kayitRows: durusImports?.durusKayitlari?.rows ?? [],
      oranRows: durusImports?.durusOranlari?.rows ?? []
    };
  }, [durusImports, selectedDowntimeMonth]);

  const downtimeKpisFromDurus = useMemo(
    () => buildDowntimeKpisFromDurus(selectedDowntimeMonthRows.kayitRows, selectedDowntimeMonthRows.oranRows),
    [selectedDowntimeMonthRows.kayitRows, selectedDowntimeMonthRows.oranRows]
  );

  const plannedMaintenanceStats = useMemo<PlannedMaintenanceDepartmentStats>(() => {
    const stats = buildEmptyPlannedMaintenanceStats();

    completedJobs.forEach((job) => {
      if (getMonthKeyFromDateValue(job.tarih) !== selectedDowntimeMonth) return;
      if (!isPlannedMaintenanceType(job.mudahaleTuru)) return;

      const duration = Number.isFinite(Number(job.sureDakika)) ?
      Math.max(0, Number(job.sureDakika)) :
      0;
      const departments = resolveCompletedJobDepartments(job);
      if (departments.size === 0) return;

      departments.forEach((departmentId) => {
        const departmentStats = stats[departmentId];
        departmentStats.plannedMinutes += duration;
      });
    });

    return stats;
  }, [completedJobs, selectedDowntimeMonth]);

  const downtimeKpis = useMemo(
    () => downtimeKpisFromDurus.map((item) => {
      const plannedStats = plannedMaintenanceStats[item.id];
      if (!plannedStats) return item;

      const plannedMinutes = Math.max(0, plannedStats.plannedMinutes);
      const unplannedMinutes = Math.max(0, item.monthlyDowntimeMinutes);
      const totalMaintenanceMinutes = plannedMinutes + unplannedMinutes;
      const pmpPercent = totalMaintenanceMinutes > 0 ?
      plannedMinutes / totalMaintenanceMinutes * 100 :
      0;

      return {
        ...item,
        plannedDowntimeRate: Number(pmpPercent.toFixed(2)),
        plannedMaintenanceMinutes: Math.round(plannedMinutes),
        totalMaintenanceMinutes: Math.round(totalMaintenanceMinutes)
      };
    }),
    [downtimeKpisFromDurus, plannedMaintenanceStats]
  );

  const selectedDowntimeMonthLabel = useMemo(
    () => formatMonthLabel(selectedDowntimeMonth),
    [selectedDowntimeMonth]
  );

  const isgDepartmentKpis = useMemo<IsgDepartmentKpi[]>(() => {
    const uygunsuzlukRates = ISG_YEARLY_DEPARTMENT_RATES[DASHBOARD_ISG_YEAR];
    const caprazDepartments =
    ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR[DASHBOARD_ISG_YEAR]?.['capraz-denetim']?.departments || [];

    return ISG_DEPARTMENT_KPI_DEFINITIONS.map((definition) => {
      const uygunsuzlukDepartment = uygunsuzlukRates.find(
        (item) => matchesDepartmentByAliases(item.department, definition.uygunsuzlukDepartmentAliases)
      );

      const caprazDepartment = caprazDepartments.find((item) =>
      matchesDepartmentByAliases(item.department, definition.caprazDepartmentAliases)
      );

      const nonComplianceRate = Number((uygunsuzlukDepartment?.closureRate || 0).toFixed(2));
      const crossAuditRate = caprazDepartment && caprazDepartment.total > 0 ?
      Number(((caprazDepartment.total - caprazDepartment.missing) / caprazDepartment.total * 100).toFixed(2)) :
      0;

      return {
        id: definition.id,
        name: definition.name,
        accidents: definition.accidents,
        nonComplianceRate,
        crossAuditRate,
        icon: definition.icon,
        accent: definition.accent
      };
    });
  }, []);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await dashboardApi.getSummary();
      return response.data.data as DashboardSummary;
    }
  });

  if (summaryLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            5S Çalışmasi - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardımcı Tesisler
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {departmentFiveS.map((item) =>
          <DepartmentFiveSCard key={item.id} item={item} />
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            İSG KPI Pano - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardımcı Tesisler
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isgDepartmentKpis.map((item) =>
          <DepartmentIsgCard key={item.id} item={item} />
          )}
        </div>
      </div>

      {(summary?.preventiveMaintenance.overdue || 0) > 0 &&
      <div className="flex items-center rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mr-3 h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Gecikmis Bakımlar</p>
            <p className="text-sm text-red-600">
              {summary?.preventiveMaintenance.overdue} adet periyodik bakım gecikmis durumda
            </p>
          </div>
        </div>
      }

      <div className="card p-6">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Duruş KPI Pano - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardımcı Tesisler
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="downtime-month" className="text-sm text-gray-600">
              Ay Seçimi
            </label>
            <input
              id="downtime-month"
              type="month"
              value={selectedDowntimeMonth}
              onChange={(event) => setSelectedDowntimeMonth(normalizeMonthKey(event.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Seçilen ay: {selectedDowntimeMonthLabel}. MTTR ve MTBF, Ayarlar'dan yüklenen Duruş Analizi dosyalarından hesaplanır. MTTR: toplam arıza onarım süresi / arıza sayısı. MTBF: toplam çalışma süresi (FIILI CALISMA) / arıza sayısı. PMP (%): (Planlı Bakım Saatleri / Toplam Bakım Saatleri) x 100. Planlı saatler Tamamlanan İşler'den, plansız (arıza) saatleri Duruş Analizi'nden alınır.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {downtimeKpis.map((item) =>
          <DepartmentDowntimeCard key={item.id} item={item} />
          )}
        </div>
      </div>
    </div>);

}
