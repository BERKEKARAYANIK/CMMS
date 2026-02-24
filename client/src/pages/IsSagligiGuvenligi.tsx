import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CircleDashed,
  ClipboardCheck,
  Flame,
  ShieldAlert,
  Target } from
'lucide-react';
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
import { APP_STATE_KEYS } from '../constants/appState';
import { appStateApi } from '../services/api';

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

function normalizeIsgImportDataset(raw: unknown, headers: readonly string[]): IsgImportDataset | null {
  if (!raw || typeof raw !== 'object') return null;

  const source = raw as Record<string, unknown>;
  const rawRows = Array.isArray(source.rows) ? source.rows : [];
  const rows = rawRows.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const row = item as Record<string, unknown>;
    const mapped: Record<string, string> = {};
    let hasAnyValue = false;

    headers.forEach((header) => {
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
  const caprazDataset = normalizeIsgImportDataset(source.caprazDenetim, CAPRAZ_DENETIM_HEADERS);
  const uygunsuzluk2026Dataset = normalizeIsgImportDataset(source.uygunsuzluk2026, UYGUNSUZLUK_HEADERS);
  const uygunsuzluk2025Dataset = normalizeIsgImportDataset(source.uygunsuzluk2025, UYGUNSUZLUK_HEADERS);

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
    sourceScope: `${dataset.sourceFileName}|${dataset.uploadedAt}|${dataset.rowCount}`,
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
    sourceScope: `${dataset.sourceFileName}|${dataset.uploadedAt}|${dataset.rowCount}`,
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

  const importedCaprazComputation = useMemo(() => {
    if (!importedIsg?.caprazDenetim) return null;
    return computeCaprazBreakdown(importedIsg.caprazDenetim);
  }, [importedIsg]);
  const importedUygunsuzlukComputation = useMemo(() => {
    const dataset =
    selectedYear === '2025' ?
    importedIsg?.uygunsuzluk2025 :
    importedIsg?.uygunsuzluk2026;
    if (!dataset) return null;
    return computeUygunsuzlukBreakdown(dataset);
  }, [importedIsg, selectedYear]);
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






