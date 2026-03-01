import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Flame,
  LayoutGrid,
  ShieldAlert,
  Target } from
'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import {
  ISG_TOPICS,
  ISG_YEARLY_TOPIC_DETAILS,
  ISG_YEARLY_DEPARTMENT_RATES,
  ISG_YEARLY_SUMMARIES,
  ISG_YEAR_OPTIONS,
  type IsgTopicMetric,
  type IsgTopicDefinition,
  type IsgTopicMetricTone,
  type IsgYearKey } from
'../data/isg';
import {
  ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR,
  type IsgTopicMissingBreakdown,
  type IsgMissingTopicId } from
'../data/isgMissing';
import { APP_STATE_KEYS, normalizeSettingsLists } from '../constants/appState';
import { appStateApi, jobEntriesApi } from '../services/api';
import type { CompletedJob } from '../types/jobEntries';

const toneClassMap: Record<IsgTopicMetricTone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  positive: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700'
};

const topicIconMap: Record<IsgTopicDefinition['iconKey'], React.ElementType> = {
  uygunsuzluk: ShieldAlert,
  capraz: ClipboardCheck,
  kaza: Flame,
  ramak: AlertTriangle,
  ifade: CircleDashed,
  'sari-kart': Target
};

const toPercentLabel = (value: number): string => `%${value.toFixed(2).replace('.', ',')}`;

const CAPRAZ_DENETIM_HEADERS = [
'SIRA',
'TARIH',
'HAFTA',
'RAPORLAMA YAPAN BIRIM',
'UYGUNSUZLUK TANIMI',
'DENETIM KONUSU',
'DENETLENEN BIRIM',
'AKSIYON DURUMU'] as
const;
const UYGUNSUZLUK_HEADERS = [
'RISK DERECESI',
'SIRA',
'TARIH',
'BILDIRIMI YAPAN',
'BILDIRIMI YAPAN BOLUM/BIRIM',
'UYGUNSUZLUK TANIMI',
'TEHLIKELI DURUM',
'ILGILI BOLUM/BIRIM',
'AKSIYON DURUMU',
'TERMIN'] as
const;
const ISG_OPTIONAL_SHIFT_HEADERS = ['VARDIYA'] as const;
const ISG_TO_IS_EMRI_KEY = 'cmms_isg_to_is_emri_transfer';

type IsgImportDataset = {
  sourceFileName: string;
  uploadedAt: string;
  rowCount: number;
  rows: Array<Record<string, string>>;
};

type IsgImportsState = {
  caprazDenetim?: IsgImportDataset;
  uygunsuzluk2026?: IsgImportDataset;
  uygunsuzluk2025?: IsgImportDataset;
};

type IsgClosedItemsState = {
  closedItemIds: string[];
};

type IsgComputation = {
  breakdown: IsgTopicMissingBreakdown;
  dataSource: string;
  sourceScope: string;
  uploadedAt: string;
  metrics: IsgTopicMetric[];
};

type UnresolvedRowItem = {
  closeItemId: string;
  sourceRowNo: number;
  rowText: string;
  department: string;
  date: string;
  person: string;
  missingField: string;
  detail: string;
};

type IsgToIsEmriTransferPayload = {
  source: 'isg-unresolved';
  closeItemId: string;
  aciklama: string;
  reportId: string;
  reportLabel: string;
  year: IsgYearKey;
};

type SelectedMissingDepartmentRow = {
  department: string;
  total: number;
  missing: number;
  missingRate: number;
  closedByJobEntry: number;
  items: UnresolvedRowItem[];
};

type SelectedMissingCardView = {
  id: IsgMissingTopicId;
  title: string;
  missingLabel: string;
  sourceScope: string;
  rows: SelectedMissingDepartmentRow[];
  total: number;
  missing: number;
  missingRate: number;
  closedCount: number;
};

type ShiftTrackType = 'uygunsuzluk' | 'capraz';

type ShiftTrackRecord = {
  id: string;
  date: string;
  shift: string;
  department: string;
  departmentGroup: DepartmentGroupKey;
  electricSubgroup: ElectricDepartmentSubgroup | null;
  durationMinutes: number;
  type: ShiftTrackType;
  typeLabel: string;
  isClosed: boolean;
};

type ShiftTrackPersonRecord = {
  date: string;
  shift: string;
  departmentGroup: DepartmentGroupKey;
  electricSubgroup: ElectricDepartmentSubgroup | null;
  durationMinutes: number;
  type: ShiftTrackType;
  personKey: string;
};

type DepartmentGroupKey = 'elektrik' | 'mekanik' | 'yardimci';
type ElectricDepartmentSubgroup = 'ana' | 'ek';

type ShiftChartRow = {
  key: string;
  date: string;
  name: string;
  shiftNo: 1 | 2 | 3;
  mekanik: number;
  elektrik: number;
  yardimci: number;
  total: number;
};

type ShiftAverageDurationRow = {
  key: string;
  shiftLabel: string;
  mekanikAverage: number | null;
  elektrikAverage: number | null;
  elektrikAnaAverage: number | null;
  elektrikEkAverage: number | null;
  yardimciAverage: number | null;
  totalAverage: number | null;
  mekanikCount: number;
  elektrikCount: number;
  elektrikAnaCount: number;
  elektrikEkCount: number;
  yardimciCount: number;
  totalCount: number;
};

type ShiftChartMode = 'stacked' | 'grouped';
type ShiftDepartmentFilter = 'tumu' | DepartmentGroupKey;
type ShiftWeekOption = {
  key: string;
  dateLabels: string[];
  rangeLabel: string;
  label: string;
};

function normalizeText(value: string): string {
  return String(value || '').
  toLocaleUpperCase('tr-TR').
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^A-Z0-9]+/g, ' ').
  trim();
}

function normalizeIsgClosedItemsState(value: unknown): IsgClosedItemsState {
  let rawIds: unknown[] = [];

  if (Array.isArray(value)) {
    rawIds = value;
  } else if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    if (Array.isArray(source.closedItemIds)) {
      rawIds = source.closedItemIds;
    }
  }

  const closedItemIds = Array.from(
    new Set(
      rawIds.
      map((item) => String(item || '').trim()).
      filter(Boolean)
    )
  );

  return { closedItemIds };
}

function buildRowText(
reportLabel: string,
rowNo: number,
item: {date: string;department: string;person: string;missingField: string;detail: string;})
: string {
  return [
  reportLabel,
  `Sira No: ${rowNo}`,
  `Tarih: ${item.date}`,
  `Bolum: ${item.department}`,
  `Personel: ${item.person}`,
  `Kayit: ${item.missingField}`,
  `Detay: ${item.detail}`].
  join('\n');
}

function buildLegacyClosedItemId(args: {
  reportId: string;
  year: IsgYearKey;
  sourceScope: string;
  rowNo: number;
  date: string;
  department: string;
  person: string;
  missingField: string;
  detail: string;
}): string {
  return [
  args.reportId,
  args.year,
  args.sourceScope,
  String(args.rowNo),
  args.date,
  args.department,
  args.person,
  args.missingField,
  args.detail].
  map((part) => normalizeText(part)).
  join('|');
}

function encodeIdPart(value: string): string {
  return encodeURIComponent(String(value || '').trim());
}

function buildClosedItemId(args: {
  reportId: string;
  year: IsgYearKey;
  sourceScope: string;
  rowNo: number;
  date: string;
  department: string;
  person: string;
  missingField: string;
  detail: string;
}): string {
  return [
  'V2',
  encodeIdPart(args.reportId),
  encodeIdPart(args.year),
  encodeIdPart(args.sourceScope),
  String(args.rowNo),
  encodeIdPart(args.date),
  encodeIdPart(args.department),
  encodeIdPart(args.person),
  encodeIdPart(args.missingField),
  encodeIdPart(args.detail)].
  join('|');
}

function isStatusResolved(status: string): boolean {
  return normalizeText(status).includes('GIDERILDI');
}

function toIsoDateLabel(input: string): string {
  const value = String(input || '').trim();
  if (!value) return '-';

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (dotMatch) {
    return `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    return `${slashMatch[3]}-${month}-${day}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value;
}

function formatPercent(part: number, total: number): string {
  if (total <= 0) return '%0,00';
  const ratio = Number(((part / total) * 100).toFixed(2));
  return `%${ratio.toFixed(2).replace('.', ',')}`;
}

function parseSourceRowNo(value: string, fallback: number): number {
  const normalized = String(value || '').trim().replace(/[^\d]/g, '');
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildDatasetSourceScope(dataset: IsgImportDataset): string {
  return `${dataset.sourceFileName}|${dataset.uploadedAt}|${dataset.rowCount}`;
}

function resolveShiftLabel(value: string): string {
  const raw = String(value || '').trim();
  if (!raw) return 'Belirtilmemis';

  const normalized = normalizeText(raw);
  if (!normalized) return 'Belirtilmemis';

  if (
  normalized.includes('A VARDIYA') ||
  normalized.includes('1 VARDIYA') ||
  normalized.includes('VARDIYA 1') ||
  normalized.includes('VARDIYA1') ||
  normalized === 'A' ||
  normalized === '1')
  {
    return 'A Vardiya';
  }

  if (
  normalized.includes('B VARDIYA') ||
  normalized.includes('2 VARDIYA') ||
  normalized.includes('VARDIYA 2') ||
  normalized.includes('VARDIYA2') ||
  normalized === 'B' ||
  normalized === '2')
  {
    return 'B Vardiya';
  }

  if (
  normalized.includes('C VARDIYA') ||
  normalized.includes('3 VARDIYA') ||
  normalized.includes('VARDIYA 3') ||
  normalized.includes('VARDIYA3') ||
  normalized === 'C' ||
  normalized === '3')
  {
    return 'C Vardiya';
  }

  return raw;
}

function isIsoDateLabel(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim());
}

function classifyDepartmentGroup(department: string): DepartmentGroupKey | null {
  const normalized = normalizeText(department);
  if (!normalized) return null;

  if (
  normalized.includes('ELEKTRIK') ||
  normalized.includes('E BAKIM'))
  {
    return 'elektrik';
  }

  if (
  normalized.includes('MEKANIK') ||
  normalized.includes('M BAKIM'))
  {
    return 'mekanik';
  }

  if (
  normalized.includes('YARDIMCI TESIS') ||
  normalized.includes('Y TESIS'))
  {
    return 'yardimci';
  }

  return null;
}

function classifyElectricDepartmentSubgroup(department: string): ElectricDepartmentSubgroup | null {
  const normalized = normalizeText(department);
  if (!normalized) return null;

  if (
    normalized.includes('EK BINA') ||
    normalized.includes('E BAKIM 2') ||
    normalized.includes('ELEKTRIK BAKIM 2')
  ) {
    return 'ek';
  }

  if (
    normalized.includes('ANA BINA') ||
    normalized.includes('E BAKIM 1') ||
    normalized.includes('ELEKTRIK BAKIM 1')
  ) {
    return 'ana';
  }

  return null;
}

function shiftToNo(shift: string): 1 | 2 | 3 | null {
  const normalized = normalizeText(shift);
  if (
  normalized.includes('A VARDIYA') ||
  normalized.includes('1 VARDIYA') ||
  normalized.includes('VARDIYA 1') ||
  normalized.includes('VARDIYA1') ||
  normalized === 'A' ||
  normalized === '1')
  {
    return 1 as const;
  }
  if (
  normalized.includes('B VARDIYA') ||
  normalized.includes('2 VARDIYA') ||
  normalized.includes('VARDIYA 2') ||
  normalized.includes('VARDIYA2') ||
  normalized === 'B' ||
  normalized === '2')
  {
    return 2 as const;
  }
  if (
  normalized.includes('C VARDIYA') ||
  normalized.includes('3 VARDIYA') ||
  normalized.includes('VARDIYA 3') ||
  normalized.includes('VARDIYA3') ||
  normalized === 'C' ||
  normalized === '3')
  {
    return 3 as const;
  }
  return null;
}

function resolveCompletedJobTrackType(job: CompletedJob): ShiftTrackType | null {
  const normalized = normalizeText(`${job.mudahaleTuru || ''} ${job.aciklama || ''}`);
  if (!normalized) return null;

  if (
  normalized.includes('CAPRAZ') &&
  normalized.includes('DENETIM') &&
  normalized.includes('UYGUNSUZLUK'))
  {
    return 'capraz';
  }

  if (normalized.includes('UYGUNSUZLUK')) {
    return 'uygunsuzluk';
  }

  return null;
}

function resolveCompletedJobDepartment(job: CompletedJob): {
  department: string;
  departmentGroup: DepartmentGroupKey;
  electricSubgroup: ElectricDepartmentSubgroup | null;
} | null {
  const personeller = Array.isArray(job.personeller) ? job.personeller : [];

  for (const personel of personeller) {
    const department = String(personel?.bolum || '').trim();
    const departmentGroup = classifyDepartmentGroup(department);
    if (departmentGroup) {
      return {
        department: department || '-',
        departmentGroup,
        electricSubgroup: departmentGroup === 'elektrik' ? classifyElectricDepartmentSubgroup(department) : null
      };
    }
  }

  return null;
}

function toIsoDateFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getIsoWeekStartLabel(date: Date): string {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  const dayNo = normalized.getDay();
  const diffToMonday = dayNo === 0 ? -6 : 1 - dayNo;
  normalized.setDate(normalized.getDate() + diffToMonday);

  return toIsoDateFromDate(normalized);
}

function buildWeekDateLabelsFromStart(weekStartLabel: string): string[] {
  if (!isIsoDateLabel(weekStartLabel)) return [];

  const startDate = new Date(`${weekStartLabel}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return [];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return toIsoDateFromDate(date);
  });
}

function getIsoWeekMetaFromDateLabel(dateLabel: string): {weekYear: number;weekNumber: number;} | null {
  if (!isIsoDateLabel(dateLabel)) return null;

  const [yearText, monthText, dayText] = dateLabel.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;

  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const weekNumber = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return { weekYear, weekNumber };
}

function buildIsoWeekStartLabelsForYear(year: number): string[] {
  if (!Number.isFinite(year)) return [];

  const week1ReferenceDate = new Date(`${year}-01-04T00:00:00`);
  if (Number.isNaN(week1ReferenceDate.getTime())) return [];

  const week1Day = week1ReferenceDate.getDay() || 7;
  week1ReferenceDate.setDate(week1ReferenceDate.getDate() - (week1Day - 1));

  const weekCount = getIsoWeekMetaFromDateLabel(`${year}-12-28`)?.weekNumber || 52;
  return Array.from({ length: weekCount }, (_, index) => {
    const weekStartDate = new Date(week1ReferenceDate);
    weekStartDate.setDate(week1ReferenceDate.getDate() + index * 7);
    return toIsoDateFromDate(weekStartDate);
  });
}

function buildRecentSevenDateLabels(baseDate: Date): string[] {
  return buildWeekDateLabelsFromStart(getIsoWeekStartLabel(baseDate));
}

function formatIsoDateRangeLabel(startDateLabel: string, endDateLabel: string, fallback = 'Son 7 gun'): string {
  if (!startDateLabel || !endDateLabel) return fallback;

  const startDate = new Date(`${startDateLabel}T00:00:00`);
  const endDate = new Date(`${endDateLabel}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return fallback;

  const formatter = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function formatIsoWeekdayShortLabel(dateLabel: string): string {
  if (!isIsoDateLabel(dateLabel)) return dateLabel;
  const date = new Date(`${dateLabel}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateLabel;

  const dayNo = date.getDay();
  if (dayNo === 1) return 'Pzt';
  if (dayNo === 2) return 'Sal';
  if (dayNo === 3) return 'Car';
  if (dayNo === 4) return 'Per';
  if (dayNo === 5) return 'Cum';
  if (dayNo === 6) return 'Cmt';
  return 'Paz';
}

function isCaprazDenetimRowValid(row: Record<string, string>): boolean {
  const denetlenenBirim = String(row['DENETLENEN BIRIM'] || '').trim();
  const aksiyonDurumu = String(row['AKSIYON DURUMU'] || '').trim();
  const tarih = String(row['TARIH'] || '').trim();
  const raporlamaBirim = String(row['RAPORLAMA YAPAN BIRIM'] || '').trim();
  const uygunsuzlukTanimi = String(row['UYGUNSUZLUK TANIMI'] || '').trim();
  const denetimKonusu = String(row['DENETIM KONUSU'] || '').trim();

  const hasContext = Boolean(
    tarih ||
    raporlamaBirim ||
    uygunsuzlukTanimi ||
    denetimKonusu ||
    denetlenenBirim ||
    aksiyonDurumu
  );

  if (!hasContext) return false;
  if (!denetlenenBirim) return false;
  if (!aksiyonDurumu) return false;
  return true;
}

function sanitizeCaprazDenetimRows(rows: Array<Record<string, string>>): Array<Record<string, string>> {
  return rows.filter((row) => isCaprazDenetimRowValid(row));
}

function isUygunsuzlukRowValid(row: Record<string, string>): boolean {
  const department = String(row['ILGILI BOLUM/BIRIM'] || '').trim();
  const status = String(row['AKSIYON DURUMU'] || '').trim();
  const date = String(row['TARIH'] || '').trim();
  const person = String(row['BILDIRIMI YAPAN'] || '').trim();
  const detail = String(row['UYGUNSUZLUK TANIMI'] || '').trim();

  const hasContext = Boolean(date || person || detail || department || status);
  if (!hasContext) return false;
  if (!department) return false;
  if (!status) return false;
  return true;
}

function sanitizeUygunsuzlukRows(rows: Array<Record<string, string>>): Array<Record<string, string>> {
  return rows.filter((row) => isUygunsuzlukRowValid(row));
}

function normalizeIsgImportDataset(
raw: unknown,
headers: readonly string[],
optionalHeaders: readonly string[] = [])
: IsgImportDataset | null {
  if (!raw || typeof raw !== 'object') return null;

  const source = raw as Record<string, unknown>;
  const allHeaders = Array.from(new Set([...headers, ...optionalHeaders]));
  const rawRows = Array.isArray(source.rows) ? source.rows : [];
  const rows = rawRows.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const row = item as Record<string, unknown>;
    const mapped: Record<string, string> = {};
    let hasAnyValue = false;

    allHeaders.forEach((header) => {
      const value = String(row[header] ?? '').trim();
      mapped[header] = value;
      if (value) hasAnyValue = true;
    });

    return hasAnyValue ? [mapped] : [];
  });

  const sourceFileName = String(source.sourceFileName || '').trim();
  const uploadedAtRaw = String(source.uploadedAt || '').trim();
  const uploadedAt = Number.isNaN(new Date(uploadedAtRaw).getTime()) ? '' : uploadedAtRaw;

  return {
    sourceFileName,
    uploadedAt,
    rowCount: rows.length,
    rows
  };
}

function normalizeIsgImportsState(value: unknown): IsgImportsState {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;
  const caprazDataset = normalizeIsgImportDataset(
    source.caprazDenetim,
    CAPRAZ_DENETIM_HEADERS,
    ISG_OPTIONAL_SHIFT_HEADERS
  );
  const uygunsuzluk2026Dataset = normalizeIsgImportDataset(
    source.uygunsuzluk2026,
    UYGUNSUZLUK_HEADERS,
    ISG_OPTIONAL_SHIFT_HEADERS
  );
  const uygunsuzluk2025Dataset = normalizeIsgImportDataset(
    source.uygunsuzluk2025,
    UYGUNSUZLUK_HEADERS,
    ISG_OPTIONAL_SHIFT_HEADERS
  );

  const sanitizeDataset = (
  dataset: IsgImportDataset | null,
  sanitizeRows: (rows: Array<Record<string, string>>) => Array<Record<string, string>>)
  : IsgImportDataset | undefined => {
    if (!dataset) return undefined;
    const rows = sanitizeRows(dataset.rows);
    return {
      ...dataset,
      rows,
      rowCount: rows.length
    };
  };

  return {
    caprazDenetim: sanitizeDataset(caprazDataset, sanitizeCaprazDenetimRows),
    uygunsuzluk2026: sanitizeDataset(uygunsuzluk2026Dataset, sanitizeUygunsuzlukRows),
    uygunsuzluk2025: sanitizeDataset(uygunsuzluk2025Dataset, sanitizeUygunsuzlukRows)
  };
}

function computeCaprazBreakdown(dataset: IsgImportDataset): IsgComputation | null {
  const departmentMap = new Map<string, {total: number;missing: number;items: IsgTopicMissingBreakdown['departments'][number]['items'];}>();
  let total = 0;
  let resolved = 0;
  let missing = 0;

  dataset.rows.forEach((row, index) => {
    if (!isCaprazDenetimRowValid(row)) return;

    const department = String(row['DENETLENEN BIRIM'] || '').trim();
    const status = String(row['AKSIYON DURUMU'] || '').trim();
    const detail = String(row['UYGUNSUZLUK TANIMI'] || '').trim();
    const person = String(row['RAPORLAMA YAPAN BIRIM'] || '').trim();
    const date = toIsoDateLabel(String(row['TARIH'] || ''));
    const sourceRowNo = parseSourceRowNo(String(row['SIRA'] || ''), index + 1);

    total += 1;
    const isResolved = isStatusResolved(status);
    if (isResolved) resolved += 1; else missing += 1;

    if (!departmentMap.has(department)) {
      departmentMap.set(department, { total: 0, missing: 0, items: [] });
    }

    const bucket = departmentMap.get(department)!;
    bucket.total += 1;

    if (!isResolved) {
      bucket.missing += 1;
      bucket.items.push({
        date,
        person: person || '-',
        detail: detail || '-',
        missingField: status || 'Giderilmedi (Devam Ediyor)',
        sourceRowNo
      });
    }
  });

  if (total === 0) return null;

  const departments = Array.from(departmentMap.entries()).
  map(([department, values]) => {
    const missingRate = values.total > 0 ? Number(((values.missing / values.total) * 100).toFixed(2)) : 0;
    return {
      department,
      total: values.total,
      missing: values.missing,
      missingRate,
      items: values.items
    };
  }).
  sort((a, b) => b.missing - a.missing || a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' }));

  const breakdown: IsgTopicMissingBreakdown = {
    total,
    missing,
    missingRate: total > 0 ? Number(((missing / total) * 100).toFixed(2)) : 0,
    departments
  };

  return {
    breakdown,
    dataSource: dataset.sourceFileName || 'Çapraz Denetim Uygunsuzluk Takip',
    sourceScope: buildDatasetSourceScope(dataset),
    uploadedAt: dataset.uploadedAt,
    metrics: [
    { label: 'Giderilme Orani', value: formatPercent(resolved, total), tone: 'warning' },
    { label: 'Toplam Kayıt', value: `${total}`, tone: 'neutral' },
    { label: 'Giderildi', value: `${resolved}`, tone: 'positive' },
    { label: 'Devam Ediyor', value: `${missing}`, tone: 'danger' }]
  };
}
function computeUygunsuzlukBreakdown(dataset: IsgImportDataset): IsgComputation | null {
  const departmentMap = new Map<string, {total: number;missing: number;items: IsgTopicMissingBreakdown['departments'][number]['items'];}>();
  let total = 0;
  let resolved = 0;
  let missing = 0;

  dataset.rows.forEach((row, index) => {
    if (!isUygunsuzlukRowValid(row)) return;

    const department = String(row['ILGILI BOLUM/BIRIM'] || '').trim();
    const status = String(row['AKSIYON DURUMU'] || '').trim();
    const detail = String(row['UYGUNSUZLUK TANIMI'] || '').trim();
    const person = String(row['BILDIRIMI YAPAN'] || '').trim();
    const date = toIsoDateLabel(String(row['TARIH'] || ''));
    const sourceRowNo = parseSourceRowNo(String(row['SIRA'] || ''), index + 1);

    total += 1;
    const isResolved = isStatusResolved(status);
    if (isResolved) resolved += 1; else missing += 1;

    if (!departmentMap.has(department)) {
      departmentMap.set(department, { total: 0, missing: 0, items: [] });
    }

    const bucket = departmentMap.get(department)!;
    bucket.total += 1;

    if (!isResolved) {
      bucket.missing += 1;
      bucket.items.push({
        date,
        person: person || '-',
        detail: detail || '-',
        missingField: status || 'Giderilmedi (Devam Ediyor)',
        sourceRowNo
      });
    }
  });

  if (total === 0) return null;

  const departments = Array.from(departmentMap.entries()).
  map(([department, values]) => {
    const missingRate = values.total > 0 ? Number(((values.missing / values.total) * 100).toFixed(2)) : 0;
    return {
      department,
      total: values.total,
      missing: values.missing,
      missingRate,
      items: values.items
    };
  }).
  sort((a, b) => b.missing - a.missing || a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' }));

  const breakdown: IsgTopicMissingBreakdown = {
    total,
    missing,
    missingRate: total > 0 ? Number(((missing / total) * 100).toFixed(2)) : 0,
    departments
  };

  return {
    breakdown,
    dataSource: dataset.sourceFileName || 'Uygunsuzluk Takip',
    sourceScope: buildDatasetSourceScope(dataset),
    uploadedAt: dataset.uploadedAt,
    metrics: [
    { label: 'Giderilme Orani', value: formatPercent(resolved, total), tone: 'warning' },
    { label: 'Toplam Kayit', value: `${total}`, tone: 'neutral' },
    { label: 'Giderildi', value: `${resolved}`, tone: 'positive' },
    { label: 'Devam Ediyor', value: `${missing}`, tone: 'danger' }]
  };
}

type ClosureColor = {
  badgeClass: string;
  barClass: string;
};

const getClosureColor = (rate: number): ClosureColor => {
  if (rate < 45) {
    return { badgeClass: 'bg-red-100 text-red-700', barClass: 'bg-red-500' };
  }

  if (rate < 75) {
    return { badgeClass: 'bg-orange-100 text-orange-700', barClass: 'bg-orange-500' };
  }

  if (rate < 85) {
    return { badgeClass: 'bg-lime-100 text-lime-700', barClass: 'bg-lime-500' };
  }

  return { badgeClass: 'bg-emerald-100 text-emerald-700', barClass: 'bg-emerald-500' };
};

function isPriorityMaintenanceDepartment(department: string): boolean {
  const normalized = String(department || '').
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  toLocaleUpperCase('tr-TR');
  return (
    normalized.includes('E.BAKIM') ||
    normalized.includes('E. BAKIM') ||
    normalized.includes('E BAKIM') ||
    normalized.includes('ELEKTRIK BAKIM') ||
    normalized.includes('M. BAKIM') ||
    normalized.includes('MEKANIK BAKIM') ||
    normalized.includes('Y. TESISLER') ||
    normalized.includes('YARDIMCI TESISLER'));

}

type ReportOption = {id: string;label: string;};
type DepartmentSortMode = 'name_asc' | 'name_desc' | 'rate_desc' | 'rate_asc';

const REPORT_OPTIONS: ReportOption[] = [
{ id: 'uygunsuzluk-yillik', label: 'Uygunsuzluklar' },
{ id: 'capraz-denetim', label: 'Çapraz Denetim Uygunsuzluklar' },
{ id: 'durum-kaynakli-kazalar', label: "Durum Kaynaklı Kazalar" },
{ id: 'ramak-kala', label: 'Ramak Kala' },
{ id: 'ifade-gelmeyen', label: 'Ifade Gelmeyenler' },
{ id: 'sari-kart-gelmeyen', label: 'Sari Kart Gelmeyenler' }];


export default function IsSagligiGuvenligi() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<IsgYearKey>('2026');
  const [selectedReportId, setSelectedReportId] = useState<string>('uygunsuzluk-yillik');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');
  const [departmentSortMode, setDepartmentSortMode] = useState<DepartmentSortMode>('rate_desc');
  const [copiedRowKey, setCopiedRowKey] = useState<string | null>(null);
  const [shiftChartMode, setShiftChartMode] = useState<ShiftChartMode>('stacked');
  const [shiftDepartmentFilter, setShiftDepartmentFilter] = useState<ShiftDepartmentFilter>('tumu');
  const [selectedShiftWeekStart, setSelectedShiftWeekStart] = useState('');

  const { data: importedIsg } = useQuery({
    queryKey: ['isg-imports'],
    queryFn: async () => {
      try {
        const response = await appStateApi.get(APP_STATE_KEYS.settingsIsgImports);
        return normalizeIsgImportsState(response.data?.data?.value);
      } catch {
        return {} as IsgImportsState;
      }
    }
  });
  const { data: completedJobs = [] } = useQuery({
    queryKey: ['isg-shift-track-completed-jobs'],
    queryFn: async () => {
      try {
        const response = await jobEntriesApi.getCompleted();
        const data = response.data?.data as CompletedJob[] | undefined;
        return Array.isArray(data) ? data : [];
      } catch {
        return [] as CompletedJob[];
      }
    }
  });
  const { data: settingsPersonelList = [] } = useQuery({
    queryKey: ['isg-shift-track-settings-personel-list'],
    queryFn: async () => {
      try {
        const response = await appStateApi.get(APP_STATE_KEYS.settingsLists);
        const lists = normalizeSettingsLists(response.data?.data?.value);
        return lists.personelListesi;
      } catch {
        return [];
      }
    }
  });
  const personelRoleMap = useMemo(() => {
    const map = new Map<string, string>();
    settingsPersonelList.forEach((personel) => {
      const sicilNo = String(personel?.sicilNo || '').trim();
      const rol = String(personel?.rol || '').trim();
      if (!sicilNo || !rol) return;
      map.set(normalizeText(sicilNo), normalizeText(rol));
    });
    return map;
  }, [settingsPersonelList]);

  const importedCaprazComputation = useMemo(() => {
    if (!importedIsg?.caprazDenetim) return null;
    return computeCaprazBreakdown(importedIsg.caprazDenetim);
  }, [importedIsg]);
  const activeUygunsuzlukDataset =
  selectedYear === '2025' ?
  importedIsg?.uygunsuzluk2025 :
  importedIsg?.uygunsuzluk2026;
  const importedUygunsuzlukComputation = useMemo(() => {
    if (!activeUygunsuzlukDataset) return null;
    return computeUygunsuzlukBreakdown(activeUygunsuzlukDataset);
  }, [activeUygunsuzlukDataset]);
  const { data: closedItemsState } = useQuery({
    queryKey: ['isg-closed-items'],
    queryFn: async () => {
      try {
        const response = await appStateApi.get(APP_STATE_KEYS.settingsIsgClosedItems);
        return normalizeIsgClosedItemsState(response.data?.data?.value);
      } catch {
        return { closedItemIds: [] } as IsgClosedItemsState;
      }
    }
  });
  const closedItemIdSet = useMemo(
    () => new Set(closedItemsState?.closedItemIds || []),
    [closedItemsState]
  );

  const isUygunsuzlukReport = selectedReportId === 'uygunsuzluk-yillik';
  const effectiveYear: IsgYearKey = isUygunsuzlukReport ? selectedYear : '2026';

  const activeSummary = ISG_YEARLY_SUMMARIES[effectiveYear];
  const activeDepartmentRates = ISG_YEARLY_DEPARTMENT_RATES[effectiveYear];
  const activeTopicDetails = ISG_YEARLY_TOPIC_DETAILS[effectiveYear];
  const activeMissingByTopic = ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR[effectiveYear];

  const missingTopicCards: Array<{id: IsgMissingTopicId;title: string;missingLabel: string;}> = [
  { id: 'uygunsuzluk-yillik', title: 'Uygunsuzluk Giderilmeyen', missingLabel: 'Giderilmeyen' },
  { id: 'capraz-denetim', title: 'Çapraz Denetim Giderilmeyen', missingLabel: 'Giderilmeyen' },
  { id: 'durum-kaynakli-kazalar', title: "Durum Kaynaklı Kaza", missingLabel: 'Aksiyon Eksik' },
  { id: 'ramak-kala', title: 'Bekleyen Ramak Kala', missingLabel: 'Bekleyen' },
  { id: 'ifade-gelmeyen', title: 'Kaza Ifade Gelmeyen', missingLabel: 'Ifade Gelmeyen' },
  { id: 'sari-kart-gelmeyen', title: 'Sari Kart Gelmeyen', missingLabel: 'Savunma Gelmeyen' }];


  const missingCardsWithRows = missingTopicCards.map((card) => {
    const fallbackBreakdown = activeMissingByTopic[card.id];
    const breakdown =
    card.id === 'uygunsuzluk-yillik' && importedUygunsuzlukComputation ?
    importedUygunsuzlukComputation.breakdown :
    card.id === 'capraz-denetim' && importedCaprazComputation ?
    importedCaprazComputation.breakdown :
    fallbackBreakdown;
    const sourceScope =
    card.id === 'uygunsuzluk-yillik' && importedUygunsuzlukComputation ?
    importedUygunsuzlukComputation.sourceScope :
    card.id === 'capraz-denetim' && importedCaprazComputation ?
    importedCaprazComputation.sourceScope :
    `STATIC|${effectiveYear}|${card.id}`;

    return {
      ...card,
      breakdown,
      rows: breakdown.departments,
      sourceScope
    };
  });

  const activeTopics = ISG_TOPICS.map((topic) => {
    if (topic.id === 'uygunsuzluk-yillik' && importedUygunsuzlukComputation) {
      return {
        ...topic,
        title: `${effectiveYear} Uygunsuzluklar`,
        dataSource: importedUygunsuzlukComputation.dataSource,
        metrics: importedUygunsuzlukComputation.metrics
      };
    }

    if (topic.id === 'capraz-denetim' && importedCaprazComputation) {
      return {
        ...topic,
        dataSource: importedCaprazComputation.dataSource,
        metrics: importedCaprazComputation.metrics
      };
    }

    const detail = activeTopicDetails[topic.id];
    if (!detail) {
      return topic;
    }

    return {
      ...topic,
      title: topic.id === 'uygunsuzluk-yillik' ? `${effectiveYear} Uygunsuzluklar` : topic.title,
      dataSource: detail.dataSource,
      metrics: detail.metrics
    };
  });

  const selectedReport = REPORT_OPTIONS.find((option) => option.id === selectedReportId) || REPORT_OPTIONS[0];
  const selectedTopic = activeTopics.find((topic) => topic.id === selectedReport.id) || activeTopics[0];
  const selectedReportDate =
  selectedReport.id === 'uygunsuzluk-yillik' && importedUygunsuzlukComputation?.uploadedAt ?
  new Date(importedUygunsuzlukComputation.uploadedAt).toLocaleDateString('tr-TR') :
  selectedReport.id === 'capraz-denetim' && importedCaprazComputation?.uploadedAt ?
  new Date(importedCaprazComputation.uploadedAt).toLocaleDateString('tr-TR') :
  activeSummary.reportDate;

  const shiftTrackRecords = useMemo<ShiftTrackRecord[]>(() => {
    return completedJobs.flatMap((job) => {
      const date = toIsoDateLabel(String(job.tarih || '').trim());
      if (!isIsoDateLabel(date)) return [];

      const type = resolveCompletedJobTrackType(job);
      if (!type) return [];

      const departmentInfo = resolveCompletedJobDepartment(job);
      if (!departmentInfo) return [];

      const shift = resolveShiftLabel(job.vardiya);
      if (!shiftToNo(shift)) return [];

      return [{
        id: `completed|${job.id}`,
        date,
        shift,
        department: departmentInfo.department,
        departmentGroup: departmentInfo.departmentGroup,
        electricSubgroup: departmentInfo.electricSubgroup,
        durationMinutes: Number(job.sureDakika) || 0,
        type,
        typeLabel: type === 'capraz' ? 'Capraz Denetim' : 'Uygunsuzluk',
        isClosed: true
      }];
    });
  }, [completedJobs]);

  const shiftTrackPersonRecords = useMemo<ShiftTrackPersonRecord[]>(() => {
    return completedJobs.flatMap((job) => {
      const date = toIsoDateLabel(String(job.tarih || '').trim());
      if (!isIsoDateLabel(date)) return [];

      const type = resolveCompletedJobTrackType(job);
      if (!type) return [];

      const shift = resolveShiftLabel(job.vardiya);
      if (!shiftToNo(shift)) return [];

      const durationMinutes = Number(job.sureDakika) || 0;
      const personeller = Array.isArray(job.personeller) ? job.personeller : [];
      if (personeller.length === 0) return [];

      return personeller.flatMap((personel) => {
        const sicilNo = String(personel?.sicilNo || '').trim();
        const adSoyad = String(personel?.adSoyad || '').trim();
        if (!sicilNo || !adSoyad || sicilNo === '-' || adSoyad === '-') return [];

        const normalizedSicilNo = normalizeText(sicilNo);
        const personRole = personelRoleMap.get(normalizedSicilNo);
        if (personRole !== 'ISCI') return [];

        const department = String(personel?.bolum || '').trim();
        const departmentGroup = classifyDepartmentGroup(department);
        if (!departmentGroup) return [];

        return [{
          date,
          shift,
          departmentGroup,
          electricSubgroup: departmentGroup === 'elektrik' ? classifyElectricDepartmentSubgroup(department) : null,
          durationMinutes,
          type,
          personKey: `${normalizedSicilNo}|${normalizeText(adSoyad)}`
        }];
      });
    });
  }, [completedJobs, personelRoleMap]);

  const shiftChartTrackType = useMemo<ShiftTrackType | null>(() => {
    if (selectedReport.id === 'uygunsuzluk-yillik') return 'uygunsuzluk';
    if (selectedReport.id === 'capraz-denetim') return 'capraz';
    return null;
  }, [selectedReport.id]);
  const showShiftChartSection = shiftChartTrackType !== null;
  const shiftWeekYear = Number.parseInt(effectiveYear, 10);
  const yearWeekStartLabels = useMemo(
    () => buildIsoWeekStartLabelsForYear(shiftWeekYear),
    [shiftWeekYear]
  );
  const shiftWeekOptions = useMemo<ShiftWeekOption[]>(() => {
    const fallbackWeekStart = getIsoWeekStartLabel(new Date());
    const sourceWeekStartLabels = yearWeekStartLabels.length > 0 ? yearWeekStartLabels : [fallbackWeekStart];

    return sourceWeekStartLabels.map((weekStartLabel, index) => {
      const dateLabels = buildWeekDateLabelsFromStart(weekStartLabel);
      const startDateLabel = dateLabels[0] || weekStartLabel;
      const endDateLabel = dateLabels[dateLabels.length - 1] || weekStartLabel;
      const rangeLabel = formatIsoDateRangeLabel(startDateLabel, endDateLabel);
      const weekMeta = getIsoWeekMetaFromDateLabel(weekStartLabel);
      const weekLabel =
      weekMeta ?
      `${weekMeta.weekYear} / ${String(weekMeta.weekNumber).padStart(2, '0')}. Hafta` :
      `Hafta ${index + 1}`;
      return {
        key: weekStartLabel,
        dateLabels,
        rangeLabel,
        label: `${weekLabel} (Pzt-Paz: ${rangeLabel})`
      };
    });
  }, [yearWeekStartLabels]);

  useEffect(() => {
    if (shiftWeekOptions.length === 0) {
      if (selectedShiftWeekStart) setSelectedShiftWeekStart('');
      return;
    }

    const currentWeekStart = getIsoWeekStartLabel(new Date());
    const preferredWeekStart = shiftWeekOptions.some((option) => option.key === currentWeekStart) ?
    currentWeekStart :
    shiftWeekOptions[0].key;

    if (shiftWeekOptions.some((option) => option.key === selectedShiftWeekStart)) return;
    setSelectedShiftWeekStart(preferredWeekStart);
  }, [selectedShiftWeekStart, shiftWeekOptions]);

  const selectedShiftWeekOption = useMemo(
    () => shiftWeekOptions.find((option) => option.key === selectedShiftWeekStart) || shiftWeekOptions[0] || null,
    [selectedShiftWeekStart, shiftWeekOptions]
  );
  const selectedShiftWeekIndex = useMemo(
    () => shiftWeekOptions.findIndex((option) => option.key === (selectedShiftWeekOption?.key || '')),
    [selectedShiftWeekOption, shiftWeekOptions]
  );
  const canSelectPreviousShiftWeek = selectedShiftWeekIndex > 0;
  const canSelectNextShiftWeek = selectedShiftWeekIndex >= 0 && selectedShiftWeekIndex < shiftWeekOptions.length - 1;
  const fallbackWeeklyDateLabels = useMemo(() => buildRecentSevenDateLabels(new Date()), []);
  const weeklyDateLabels = useMemo(
    () => selectedShiftWeekOption?.dateLabels.length ? selectedShiftWeekOption.dateLabels : fallbackWeeklyDateLabels,
    [fallbackWeeklyDateLabels, selectedShiftWeekOption]
  );
  const weeklyDateLabelSet = useMemo(() => new Set(weeklyDateLabels), [weeklyDateLabels]);
  const weeklyRangeLabel = useMemo(() => {
    if (selectedShiftWeekOption?.rangeLabel) return selectedShiftWeekOption.rangeLabel;
    const start = weeklyDateLabels[0];
    const end = weeklyDateLabels[weeklyDateLabels.length - 1];
    return formatIsoDateRangeLabel(start, end);
  }, [selectedShiftWeekOption, weeklyDateLabels]);

  const weeklyTypeCounters = useMemo(() => {
    let uygunsuzluk = 0;
    let capraz = 0;

    shiftTrackRecords.forEach((record) => {
      if (!weeklyDateLabelSet.has(record.date)) return;
      if (record.type === 'uygunsuzluk') uygunsuzluk += 1;
      if (record.type === 'capraz') capraz += 1;
    });

    return { uygunsuzluk, capraz };
  }, [shiftTrackRecords, weeklyDateLabelSet]);

  const shiftTrackRecordsForChart = useMemo(() => {
    if (!shiftChartTrackType) return [] as ShiftTrackRecord[];

    return shiftTrackRecords.filter((record) =>
    record.type === shiftChartTrackType && weeklyDateLabelSet.has(record.date)
    );
  }, [shiftTrackRecords, shiftChartTrackType, weeklyDateLabelSet]);

  const filteredShiftTrackRecordsForChart = useMemo(() => {
    if (shiftDepartmentFilter === 'tumu') return shiftTrackRecordsForChart;
    return shiftTrackRecordsForChart.filter((record) => record.departmentGroup === shiftDepartmentFilter);
  }, [shiftTrackRecordsForChart, shiftDepartmentFilter]);

  const shiftTrackPersonRecordsForAverage = useMemo(() => {
    return shiftTrackPersonRecords.filter((record) =>
      weeklyDateLabelSet.has(record.date) &&
      (shiftDepartmentFilter === 'tumu' || record.departmentGroup === shiftDepartmentFilter)
    );
  }, [shiftDepartmentFilter, shiftTrackPersonRecords, weeklyDateLabelSet]);

  const vardiyaChartRows = useMemo<ShiftChartRow[]>(() => {
    const rows: ShiftChartRow[] = [];
    const rowMap = new Map<string, ShiftChartRow>();

        weeklyDateLabels.forEach((dateLabel) => {
      const dayLabel = formatIsoWeekdayShortLabel(dateLabel);
      ([1, 2, 3] as const).forEach((shiftNo) => {
        const key = `${dateLabel}|${shiftNo}`;
        const row: ShiftChartRow = {
          key,
          date: dateLabel,
          name: `${dayLabel} V${shiftNo}`,
          shiftNo,
          mekanik: 0,
          elektrik: 0,
          yardimci: 0,
          total: 0
        };
        rows.push(row);
        rowMap.set(key, row);
      });
    });

    filteredShiftTrackRecordsForChart.forEach((record) => {
      const shiftNo = shiftToNo(record.shift);
      if (!shiftNo) return;
      const row = rowMap.get(`${record.date}|${shiftNo}`);
      if (!row) return;

      if (record.departmentGroup === 'mekanik') row.mekanik += 1;
      if (record.departmentGroup === 'elektrik') row.elektrik += 1;
      if (record.departmentGroup === 'yardimci') row.yardimci += 1;
      row.total = row.mekanik + row.elektrik + row.yardimci;
    });

    return rows;
  }, [weeklyDateLabels, filteredShiftTrackRecordsForChart]);

  const vardiyaAverageDurationRows = useMemo<ShiftAverageDurationRow[]>(() => {
    type PersonDurationAggregate = {
      durationSum: number;
      entryCount: number;
    };
    type PersonAggregateMap = Map<string, PersonDurationAggregate>;

    const updatePersonAggregate = (map: PersonAggregateMap, personKey: string, durationMinutes: number) => {
      const current = map.get(personKey) || { durationSum: 0, entryCount: 0 };
      current.durationSum += durationMinutes;
      current.entryCount += 1;
      map.set(personKey, current);
    };

    const toAverageFromPersonMap = (map: PersonAggregateMap): number | null => {
      if (map.size === 0) return null;
      let personAverageTotal = 0;
      map.forEach((value) => {
        personAverageTotal += value.entryCount > 0 ? value.durationSum / value.entryCount : 0;
      });
      return Math.round(personAverageTotal / map.size);
    };

    const accumulator = new Map<string, {
      mekanik: PersonAggregateMap;
      elektrik: PersonAggregateMap;
      elektrikAna: PersonAggregateMap;
      elektrikEk: PersonAggregateMap;
      yardimci: PersonAggregateMap;
      total: PersonAggregateMap;
    }>();

    vardiyaChartRows.forEach((row) => {
      accumulator.set(row.key, {
        mekanik: new Map<string, PersonDurationAggregate>(),
        elektrik: new Map<string, PersonDurationAggregate>(),
        elektrikAna: new Map<string, PersonDurationAggregate>(),
        elektrikEk: new Map<string, PersonDurationAggregate>(),
        yardimci: new Map<string, PersonDurationAggregate>(),
        total: new Map<string, PersonDurationAggregate>()
      });
    });

    shiftTrackPersonRecordsForAverage.forEach((record) => {
      const shiftNo = shiftToNo(record.shift);
      const durationMinutes = Number(record.durationMinutes);
      if (!shiftNo || !Number.isFinite(durationMinutes) || durationMinutes < 0) return;

      const bucket = accumulator.get(`${record.date}|${shiftNo}`);
      if (!bucket) return;

      updatePersonAggregate(bucket.total, record.personKey, durationMinutes);

      if (record.departmentGroup === 'mekanik') {
        updatePersonAggregate(bucket.mekanik, record.personKey, durationMinutes);
      }
      if (record.departmentGroup === 'elektrik') {
        updatePersonAggregate(bucket.elektrik, record.personKey, durationMinutes);
        if (record.electricSubgroup === 'ana') {
          updatePersonAggregate(bucket.elektrikAna, record.personKey, durationMinutes);
        }
        if (record.electricSubgroup === 'ek') {
          updatePersonAggregate(bucket.elektrikEk, record.personKey, durationMinutes);
        }
      }
      if (record.departmentGroup === 'yardimci') {
        updatePersonAggregate(bucket.yardimci, record.personKey, durationMinutes);
      }
    });

    return vardiyaChartRows.map((row) => {
      const values = accumulator.get(row.key)!;
      return {
        key: row.key,
        shiftLabel: row.name,
        mekanikAverage: toAverageFromPersonMap(values.mekanik),
        elektrikAverage: toAverageFromPersonMap(values.elektrik),
        elektrikAnaAverage: toAverageFromPersonMap(values.elektrikAna),
        elektrikEkAverage: toAverageFromPersonMap(values.elektrikEk),
        yardimciAverage: toAverageFromPersonMap(values.yardimci),
        totalAverage: toAverageFromPersonMap(values.total),
        mekanikCount: values.mekanik.size,
        elektrikCount: values.elektrik.size,
        elektrikAnaCount: values.elektrikAna.size,
        elektrikEkCount: values.elektrikEk.size,
        yardimciCount: values.yardimci.size,
        totalCount: values.total.size
      };
    });
  }, [shiftTrackPersonRecordsForAverage, vardiyaChartRows]);

  const vardiyaAverageByShift = useMemo(() => {
    const map = new Map<string, {
      mekanik: string;
      elektrikAna: string;
      elektrikEk: string;
      yardimci: string;
    }>();

    vardiyaAverageDurationRows.forEach((row) => {
      map.set(row.shiftLabel, {
        mekanik: row.mekanikAverage !== null ? String(row.mekanikAverage) : '-',
        elektrikAna: row.elektrikAnaAverage !== null ? String(row.elektrikAnaAverage) : '-',
        elektrikEk: row.elektrikEkAverage !== null ? String(row.elektrikEkAverage) : '-',
        yardimci: row.yardimciAverage !== null ? String(row.yardimciAverage) : '-'
      });
    });

    return map;
  }, [vardiyaAverageDurationRows]);

  const toplamMekanik = vardiyaChartRows.reduce((sum, row) => sum + row.mekanik, 0);
  const toplamElektrik = vardiyaChartRows.reduce((sum, row) => sum + row.elektrik, 0);
  const toplamYardimci = vardiyaChartRows.reduce((sum, row) => sum + row.yardimci, 0);
  const toplamVardiyaKayit = vardiyaChartRows.reduce((sum, row) => sum + row.total, 0);
  const showMekanikBar = shiftDepartmentFilter === 'tumu' || shiftDepartmentFilter === 'mekanik';
  const showElektrikBar = shiftDepartmentFilter === 'tumu' || shiftDepartmentFilter === 'elektrik';
  const showYardimciBar = shiftDepartmentFilter === 'tumu' || shiftDepartmentFilter === 'yardimci';

  const selectedMissingCardRaw = missingCardsWithRows.find((card) => card.id === selectedReport.id);
  const selectedMissingCard = useMemo<SelectedMissingCardView | null>(() => {
    if (!selectedMissingCardRaw) return null;

    const rows = selectedMissingCardRaw.rows.map((row) => {
      const openItems = row.items.
      map((item, index) => {
        const sourceRowNo = typeof item.sourceRowNo === 'number' ? item.sourceRowNo : index + 1;
        const department = row.department;
        const date = item.date || '-';
        const person = item.person || '-';
        const missingField = item.missingField || '-';
        const detail = item.detail || '-';
        const closeIdPayload = {
          reportId: selectedReport.id,
          year: effectiveYear,
          sourceScope: selectedMissingCardRaw.sourceScope,
          rowNo: sourceRowNo,
          date,
          department,
          person,
          missingField,
          detail
        };
        const closeItemId = buildClosedItemId(closeIdPayload);
        const legacyCloseItemId = buildLegacyClosedItemId(closeIdPayload);
        const isClosed =
        closedItemIdSet.has(closeItemId) ||
        closedItemIdSet.has(legacyCloseItemId);

        return {
          isClosed,
          closeItemId,
          sourceRowNo,
          rowText: buildRowText(selectedReport.label, sourceRowNo, {
            date,
            department,
            person,
            missingField,
            detail
          }),
          department,
          date,
          person,
          missingField,
          detail
        };
      }).
      filter((item) => !item.isClosed).
      map((item) => ({
        closeItemId: item.closeItemId,
        sourceRowNo: item.sourceRowNo,
        rowText: item.rowText,
        department: item.department,
        date: item.date,
        person: item.person,
        missingField: item.missingField,
        detail: item.detail
      }) as UnresolvedRowItem);

      const closedByJobEntry = Math.max(row.items.length - openItems.length, 0);
      const missing = openItems.length;
      const missingRate = row.total > 0 ? Number(((missing / row.total) * 100).toFixed(2)) : 0;

      return {
        department: row.department,
        total: row.total,
        missing,
        missingRate,
        closedByJobEntry,
        items: openItems
      } satisfies SelectedMissingDepartmentRow;
    });

    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const missing = rows.reduce((sum, row) => sum + row.missing, 0);
    const closedCount = rows.reduce((sum, row) => sum + row.closedByJobEntry, 0);
    const missingRate = total > 0 ? Number(((missing / total) * 100).toFixed(2)) : 0;

    return {
      id: selectedMissingCardRaw.id,
      title: selectedMissingCardRaw.title,
      missingLabel: selectedMissingCardRaw.missingLabel,
      sourceScope: selectedMissingCardRaw.sourceScope,
      rows,
      total,
      missing,
      missingRate,
      closedCount
    };
  }, [
    selectedMissingCardRaw,
    selectedReport.id,
    selectedReport.label,
    effectiveYear,
    closedItemIdSet
  ]);
  const showDepartmentRates = Boolean(selectedMissingCard);
  const SelectedTopicIcon = topicIconMap[selectedTopic.iconKey];
  const selectedUnresolvedItems: UnresolvedRowItem[] = selectedMissingCard ?
  selectedMissingCard.rows.
  flatMap((row) => row.items).
  sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;

    if (a.sourceRowNo !== b.sourceRowNo) return a.sourceRowNo - b.sourceRowNo;
    return a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
  }) :
  [];
  const departmentFilterOptions = Array.from(
    new Set(selectedUnresolvedItems.map((item) => item.department))
  ).sort((a, b) => a.localeCompare(b, 'tr-TR', { sensitivity: 'base' }));
  const activeDepartmentFilter = departmentFilterOptions.includes(selectedDepartmentFilter) ?
  selectedDepartmentFilter :
  'ALL';
  const filteredUnresolvedItems = activeDepartmentFilter === 'ALL' ?
  selectedUnresolvedItems :
  selectedUnresolvedItems.filter((item) => item.department === activeDepartmentFilter);
  const isAutoClosureReport =
  selectedReport.id === 'uygunsuzluk-yillik' ||
  selectedReport.id === 'capraz-denetim';
  const canTransferToJobEntry = isAutoClosureReport;
  const selectedTopicMetrics = useMemo<IsgTopicMetric[]>(() => {
    const currentMetrics = selectedTopic.metrics || [];
    if (currentMetrics.length === 0) return [];
    if (!isAutoClosureReport || !selectedMissingCard) return currentMetrics;

    const total = selectedMissingCard.total;
    const missing = selectedMissingCard.missing;
    const resolved = Math.max(total - missing, 0);
    const closureRate = total > 0 ? resolved / total : 0;
    const closureTone: IsgTopicMetricTone =
    total <= 0 ? 'neutral' :
    closureRate >= 0.85 ? 'positive' :
    closureRate >= 0.6 ? 'warning' :
    'danger';

    return [
    { label: 'Giderilme Orani', value: formatPercent(resolved, total), tone: closureTone },
    { label: 'Toplam Kayit', value: `${total}`, tone: 'neutral' },
    { label: 'Giderildi', value: `${resolved}`, tone: 'positive' },
    { label: 'Devam Ediyor', value: `${missing}`, tone: missing > 0 ? 'danger' : 'positive' }];
  }, [isAutoClosureReport, selectedMissingCard, selectedTopic.metrics]);
  const reportDepartmentRates = useMemo(() => {
    if (selectedMissingCard) {
      return selectedMissingCard.rows.map((row) => {
        const total = row.total;
        const ongoing = row.missing;
        const resolved = Math.max(total - ongoing, 0);
        const closureRate = total > 0 ? Number((resolved / total * 100).toFixed(2)) : 0;
        const openRate = total > 0 ? Number((ongoing / total * 100).toFixed(2)) : 0;

        return {
          department: row.department,
          total,
          resolved,
          ongoing,
          other: 0,
          closedByJobEntry: row.closedByJobEntry,
          closureRate,
          openRate
        };
      });
    }

    if (selectedReport.id === 'uygunsuzluk-yillik') {
      return activeDepartmentRates.map((row) => ({
        ...row,
        closedByJobEntry: 0
      }));
    }

    return [];
  }, [activeDepartmentRates, selectedMissingCard, selectedReport.id]);
  const sortedDepartmentRates = useMemo(() => {
    const rows = [...reportDepartmentRates];
    rows.sort((a, b) => {
      if (departmentSortMode === 'name_asc') {
        return a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
      }
      if (departmentSortMode === 'name_desc') {
        return b.department.localeCompare(a.department, 'tr-TR', { sensitivity: 'base' });
      }
      if (departmentSortMode === 'rate_asc') {
        return a.closureRate - b.closureRate ||
        a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
      }
      return b.closureRate - a.closureRate ||
      a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
    });
    return rows;
  }, [departmentSortMode, reportDepartmentRates]);
  const departmentCount = sortedDepartmentRates.length;

  useEffect(() => {
    setSelectedDepartmentFilter('ALL');
  }, [selectedYear, selectedReportId]);

  const copyRowText = async (rowKey: string, rowText: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(rowText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = rowText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedRowKey(rowKey);
      window.setTimeout(() => setCopiedRowKey((current) => current === rowKey ? null : current), 1200);
    } catch (error) {
      console.error('Satir kopyalama basarisiz:', error);
    }
  };
  const handleCloseToJobEntry = (item: UnresolvedRowItem) => {
    const payload: IsgToIsEmriTransferPayload = {
      source: 'isg-unresolved',
      closeItemId: item.closeItemId,
      aciklama: item.rowText,
      reportId: selectedReport.id,
      reportLabel: selectedReport.label,
      year: effectiveYear
    };

    sessionStorage.setItem(ISG_TO_IS_EMRI_KEY, JSON.stringify(payload));
    navigate('/is-emri-girisi');
  };

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-7 text-white">
          <div className="flex flex-col gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">İSG ANALITIK PANELI</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">İş Sağlığı ve Güvenliği</h1>
              <p className="mt-2 text-sm text-slate-200">
                Seçili rapora göre KPI, bölüm oranları ve eksik kayıt dağılımı aşağıda gösterilir.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Rapor Seçimi</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {REPORT_OPTIONS.map((option) =>
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedReportId(option.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  selectedReport.id === option.id ?
                  'bg-white text-slate-900' :
                  'bg-slate-900/40 text-slate-200 hover:bg-white/20'}`
                  }>
                  
                    {option.label}
                  </button>
                )}
              </div>

              {selectedReport.id === 'uygunsuzluk-yillik' &&
              <>
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-300">Yıl Seçimi</p>
                  <div className="mt-2 inline-flex rounded-lg bg-slate-900/50 p-1">
                    {ISG_YEAR_OPTIONS.map((option) =>
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedYear(option.key)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    selectedYear === option.key ?
                    'bg-white text-slate-900' :
                    'text-slate-200 hover:bg-white/20'}`
                    }>
                    
                        {option.label}
                      </button>
                  )}
                  </div>
                </>
              }

              <p className="mt-3 text-xs text-slate-300">Rapor Tarihi: {selectedReportDate}</p>
              <p className="text-xs text-slate-300">Veri Kaynagi: {selectedTopic.dataSource}</p>
            </div>
          </div>
        </div>
      </section>

      {showShiftChartSection &&
      <section className="card p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {shiftChartTrackType === 'uygunsuzluk' ?
              'Uygunsuzluk - Haftalik Grafik' :
              'Capraz Denetim Uygunsuzluk - Haftalik Grafik'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Tamamlanan Isler kayitlarindan, secilen haftada (Pazartesi-Pazar) tum vardiyalar ayri ayri (V1, V2, V3) gosterilir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              Mekanik: {toplamMekanik}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
              Elektrik: {toplamElektrik}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              Yardimci: {toplamYardimci}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Toplam: {toplamVardiyaKayit}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
              {weeklyRangeLabel}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Hafta</span>
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!canSelectPreviousShiftWeek) return;
                    const previousOption = shiftWeekOptions[selectedShiftWeekIndex - 1];
                    if (previousOption) setSelectedShiftWeekStart(previousOption.key);
                  }}
                  disabled={!canSelectPreviousShiftWeek}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  canSelectPreviousShiftWeek ?
                  'text-slate-700 hover:bg-slate-100' :
                  'cursor-not-allowed text-slate-300'}`
                  }
                  aria-label="Onceki hafta">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[250px] text-center text-xs font-semibold text-slate-700">
                  {selectedShiftWeekOption?.label || '-'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!canSelectNextShiftWeek) return;
                    const nextOption = shiftWeekOptions[selectedShiftWeekIndex + 1];
                    if (nextOption) setSelectedShiftWeekStart(nextOption.key);
                  }}
                  disabled={!canSelectNextShiftWeek}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  canSelectNextShiftWeek ?
                  'text-slate-700 hover:bg-slate-100' :
                  'cursor-not-allowed text-slate-300'}`
                  }
                  aria-label="Sonraki hafta">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
              { key: 'tumu' as const, label: 'Tumu' },
              { key: 'elektrik' as const, label: 'Elektrik' },
              { key: 'mekanik' as const, label: 'Mekanik' },
              { key: 'yardimci' as const, label: 'Yardimci Tesisler' }].
              map((option) =>
              <button
                key={option.key}
                type="button"
                onClick={() => setShiftDepartmentFilter(option.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                shiftDepartmentFilter === option.key ?
                'bg-slate-800 text-white' :
                'bg-white text-slate-600 hover:bg-slate-100'}`
                }>

                  {option.label}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                Gun Sayisi: {weeklyDateLabels.length}
              </span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                Uygunsuzluk: {weeklyTypeCounters.uygunsuzluk}
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                Capraz Uygunsuzluk: {weeklyTypeCounters.capraz}
              </span>
            </div>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setShiftChartMode('stacked')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              shiftChartMode === 'stacked' ?
              'bg-white text-slate-900 shadow-sm' :
              'text-slate-600 hover:bg-white/80'}`
              }>

              <LayoutGrid className="h-3.5 w-3.5" />
              Yigin
            </button>
            <button
              type="button"
              onClick={() => setShiftChartMode('grouped')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              shiftChartMode === 'grouped' ?
              'bg-white text-slate-900 shadow-sm' :
              'text-slate-600 hover:bg-white/80'}`
              }>

              <BarChart3 className="h-3.5 w-3.5" />
              Grup
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Mavi: Mekanik, Sari: Elektrik Ana Bina, Koyu Sari: Elektrik Ek Bina, Yesil: Yardimci Tesisler. Degerler Tamamlanan Isler &gt; Vardiya Calisma Sureleri mantigindaki kisi basi ortalama giris suresiyle hesaplanir.
        </p>

        {filteredShiftTrackRecordsForChart.length === 0 &&
        <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Secili filtrelerde kayit bulunamadi. Grafik 0 degerleri ile gosteriliyor.
          </div>
        }

        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">Tek Grafik</h3>
          <div className="mt-4 h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vardiyaChartRows}
                margin={{ top: 20, right: 16, left: 0, bottom: 74 }}>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={(props: any) => {
                    const x = Number(props?.x ?? 0);
                    const y = Number(props?.y ?? 0);
                    const label = String(props?.payload?.value ?? '');
                    const average = vardiyaAverageByShift.get(label) || {
                      mekanik: '-',
                      elektrikAna: '-',
                      elektrikEk: '-',
                      yardimci: '-'
                    };
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={11}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize={11}>
                          {label}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={24}
                          textAnchor="middle"
                          fill="#5b7be1"
                          fontSize={9}
                          fontWeight={600}>
                          {average.mekanik}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={36}
                          textAnchor="middle"
                          fill="#d4af37"
                          fontSize={9}
                          fontWeight={600}>
                          {average.elektrikAna}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={48}
                          textAnchor="middle"
                          fill="#b88a1d"
                          fontSize={9}
                          fontWeight={600}>
                          {average.elektrikEk}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={60}
                          textAnchor="middle"
                          fill="#6fb581"
                          fontSize={9}
                          fontWeight={600}>
                          {average.yardimci}
                        </text>
                      </g>
                    );
                  }}
                  interval={0}
                  height={96} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  width={36} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px' }}
                  iconType="circle" />
                {showMekanikBar &&
                <Bar
                  dataKey="mekanik"
                  name="Mekanik"
                  stackId={shiftChartMode === 'stacked' ? 'a' : undefined}
                  fill="#5b7be1"
                  radius={shiftChartMode === 'stacked' ? [0, 0, 4, 4] : [4, 4, 0, 0]}
                  maxBarSize={60} />
                }
                {showElektrikBar &&
                <Bar
                  dataKey="elektrik"
                  name="Elektrik"
                  stackId={shiftChartMode === 'stacked' ? 'a' : undefined}
                  fill="#d4af37"
                  radius={shiftChartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={60} />
                }
                {showYardimciBar &&
                <Bar
                  dataKey="yardimci"
                  name="Yardimci Tesisler"
                  stackId={shiftChartMode === 'stacked' ? 'a' : undefined}
                  fill="#6fb581"
                  radius={shiftChartMode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                  maxBarSize={60} />
                }
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>
      }

      {showDepartmentRates &&
      <section className="card p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedReport.id === 'uygunsuzluk-yillik' ?
              "Uygunsuzluklarda Bölüm Bazlı Oranlar" :
              `${selectedReport.label} - Bölüm Bazlı Oranlar`}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Her bölüm için giderilme ve acik kalan oranları ayrı ayrı gösterilir.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 text-xs md:w-auto md:flex-row md:items-end">
            <div className="w-full md:w-64">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Sıralama
              </label>
              <select
                value={departmentSortMode}
                onChange={(event) => setDepartmentSortMode(event.target.value as DepartmentSortMode)}
                className="input">
                
                <option value="rate_desc">Giderilme Orani (Yuksekten Dusege)</option>
                <option value="rate_asc">Giderilme Orani (Dusukten Yuksege)</option>
                <option value="name_asc">İşme Göre (A-Z)</option>
                <option value="name_desc">İşme Göre (Z-A)</option>
              </select>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Bölüm: {departmentCount}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Bölüm</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Toplam</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Giderildi</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Devam</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Giderilme %</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Oran Cizgisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDepartmentRates.map((item) => {
                const color = getClosureColor(item.closureRate);
                const isPriorityDepartment = isPriorityMaintenanceDepartment(item.department);

                return (
                  <tr key={item.department} className={isPriorityDepartment ? 'bg-amber-300/70' : undefined}>
                    <td className="px-3 py-2 font-medium text-gray-800">{item.department}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{item.total}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">{item.resolved}</td>
                    <td className="px-3 py-2 text-right text-red-700">{item.ongoing + item.other}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color.badgeClass}`}>
                        {toPercentLabel(item.closureRate)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-2.5 w-40 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full ${color.barClass}`} style={{ width: `${item.closureRate}%` }} />
                      </div>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </section>
      }

      <section className="card p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{selectedReport.label} - Giderilmeyenler</h2>
            <p className="mt-1 text-sm text-gray-600">
              Seçilen rapordaki giderilmeyen kayıtlar tarih ve sıra no sirasina göre listelenir.
            </p>
          </div>
          <div className="w-full md:w-72">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Bölüm Filtresi
            </label>
            <select
              value={activeDepartmentFilter}
              onChange={(event) => setSelectedDepartmentFilter(event.target.value)}
              className="input"
              disabled={!selectedMissingCard || departmentFilterOptions.length === 0}>
              
              <option value="ALL">Tüm Bölümler</option>
              {departmentFilterOptions.map((department) =>
              <option key={department} value={department}>
                  {department}
                </option>
              )}
            </select>
          </div>
        </div>

        {selectedMissingCard ?
        <div className="overflow-x-auto">
            {filteredUnresolvedItems.length === 0 ?
          <p className="text-sm text-gray-500">Giderilmeyen kayıt bulunmuyor.</p> :

          <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Sıra No</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Tarih</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Bölüm</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Personel</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Giderilmeyen</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Detay</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Islem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUnresolvedItems.map((item) => {
                const rowKey = item.closeItemId;
                const displayRowNo = item.sourceRowNo;

                return (
                  <tr key={rowKey}>
                      <td className="px-3 py-2 font-semibold text-gray-800">{displayRowNo}</td>
                      <td className="px-3 py-2 text-gray-700">{item.date}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.department}</td>
                      <td className="px-3 py-2 text-gray-700">{item.person}</td>
                      <td className="px-3 py-2 text-red-700">{item.missingField}</td>
                      <td className="px-3 py-2 text-gray-600">{item.detail}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                          type="button"
                          onClick={() => copyRowText(rowKey, item.rowText)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                          
                            {copiedRowKey === rowKey ?
                          'Kopyalandi' :
                          'Satiri Kopyala'}
                          </button>
                          {canTransferToJobEntry &&
                        <button
                          type="button"
                          onClick={() => handleCloseToJobEntry(item)}
                          className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                          
                              Uygunsuzluk Kapat
                            </button>
                        }
                        </div>
                      </td>
                    </tr>);

              })}
                </tbody>
              </table>
          }
          </div> :

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Bu rapor için eksik kayıt dağılımı bulunmuyor.
          </div>
        }
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${selectedTopic.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
              <SelectedTopicIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{selectedTopic.title}</h2>
              <p className="text-xs text-gray-500">{selectedTopic.ownerUnit}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            selectedTopic.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`
            }>
            
            {selectedTopic.status === 'active' ? 'Aktif KPI' : 'Pipeline'}
          </span>
        </div>
        <p className="text-sm text-gray-600">{selectedTopic.description}</p>
        <p className="mt-3 text-xs text-gray-500">Veri Kaynagi: {selectedTopic.dataSource}</p>

        {selectedTopicMetrics && selectedTopicMetrics.length > 0 ?
        <div className="mt-4 grid grid-cols-2 gap-2">
            {selectedTopicMetrics.map((metric) =>
          <div key={metric.label} className={`rounded-lg px-3 py-2 ${toneClassMap[metric.tone]}`}>
                <p className="text-[11px] font-medium uppercase tracking-wide">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold">{metric.value}</p>
              </div>
          )}
          </div> :

        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Bu rapor için KPI sutunlari hazir. Veri eklendiginde otomatik gosterilecek.
          </div>
        }
      </section>

    </div>);

}






