import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { APP_STATE_KEYS } from '../constants/appState';
import { appStateApi } from '../services/api';

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

type OranRow = {
  machine: string;
  machineKey: string;
  machineNumberKey: string;
  production: number;
  possibleMinutes: number;
  actualMinutes: number;
  downtimeMinutes: number;
  helperMinutes: number;
  operationsMinutes: number;
  mechanicalMinutes: number;
  electricalMinutes: number;
  efficiencyRate: number;
  helperRate: number;
  operationsRate: number;
  mechanicalRate: number;
  electricalRate: number;
};

type DepartmentGraphMode = 'minutes' | 'ratio';
type DepartmentGraphDepartment = 'all' | 'electrical' | 'mechanical' | 'helper';
type DepartmentGraphSort = 'value_desc' | 'value_asc' | 'machine_asc' | 'machine_desc';
type DetailDowntimeDepartmentFilter = 'all' | 'electrical' | 'mechanical' | 'helper';

type DurusCustomMachineGroup = {
  id: string;
  name: string;
  machines: string[];
};

type DurusCustomMachineGroupsState = Record<Exclude<DepartmentGraphDepartment, 'all'>, DurusCustomMachineGroup[]>;

type MachineDepartmentDowntimeRow = {
  id: string;
  machine: string;
  possibleMinutes: number;
  electricalMinutes: number;
  mechanicalMinutes: number;
  helperMinutes: number;
  totalDepartmentMinutes: number;
  electricalShare: number;
  mechanicalShare: number;
  helperShare: number;
  electricalDowntimeRate: number;
  mechanicalDowntimeRate: number;
  helperDowntimeRate: number;
  totalDepartmentDowntimeRate: number;
};

type DurusMachineDetailRow = {
  id: string;
  dateLabel: string;
  shift: string;
  reason: string;
  minutes: number;
  department: string;
  note: string;
  sortDate: number;
  sortTime: number;
};

type ParetoPoint = {
  id: string;
  label: string;
  value: number;
  cumulativePercent: number;
  meta: string;
};

type ParetoChartProps = {
  rows: ParetoPoint[];
  valueFractionDigits?: number;
  valueSuffix?: string;
  emptyMessage: string;
  barFill?: string;
  selectedLabel?: string;
  onSelectLabel?: (label: string | null) => void;
};

const DETAIL_MACHINE_ALL = 'ALL';
const DETAIL_MACHINE_ALL_PIPE = 'ALL_BORU';

function buildDefaultDurusCustomMachineGroupsState(): DurusCustomMachineGroupsState {
  return {
    electrical: [],
    mechanical: [],
    helper: []
  };
}

function normalizeMonthKey(value: unknown): string {
  const text = String(value ?? '').trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(text) ? text : '';
}

function buildCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

const DURUS_YEAR_OPTIONS = ['2025', '2026'] as const;
const DURUS_MONTH_PART_OPTIONS = [
{ value: '01', label: 'Ocak' },
{ value: '02', label: 'Şubat' },
{ value: '03', label: 'Mart' },
{ value: '04', label: 'Nisan' },
{ value: '05', label: 'Mayıs' },
{ value: '06', label: 'Haziran' },
{ value: '07', label: 'Temmuz' },
{ value: '08', label: 'Ağustos' },
{ value: '09', label: 'Eylül' },
{ value: '10', label: 'Ekim' },
{ value: '11', label: 'Kasım' },
{ value: '12', label: 'Aralık' }] as
const;

function splitMonthKeyParts(monthKey: string): {year: string;month: string;} {
  const normalized = normalizeMonthKey(monthKey) || buildCurrentMonthKey();
  return {
    year: normalized.slice(0, 4),
    month: normalized.slice(5, 7)
  };
}

function buildMonthKeyFromParts(year: string, month: string): string {
  const normalizedYear = /^\d{4}$/.test(year) ? year : '';
  const normalizedMonth = /^(0[1-9]|1[0-2])$/.test(month) ? month : '';
  if (!normalizedYear || !normalizedMonth) return '';
  return `${normalizedYear}-${normalizedMonth}`;
}

function buildInitialDurusDisplayMonthKey(date: Date = new Date()): string {
  const currentMonthKey = buildCurrentMonthKey(date);
  const { year, month } = splitMonthKeyParts(currentMonthKey);
  const targetYear = DURUS_YEAR_OPTIONS.includes(year as typeof DURUS_YEAR_OPTIONS[number]) ?
  year :
  DURUS_YEAR_OPTIONS[DURUS_YEAR_OPTIONS.length - 1];
  return `${targetYear}-${month}`;
}

function sortMonthKeysDesc(monthKeys: string[]): string[] {
  return [...monthKeys].sort((a, b) => b.localeCompare(a, 'tr-TR'));
}

function formatMonthLabel(monthKey: string): string {
  const normalized = normalizeMonthKey(monthKey);
  if (!normalized) return '-';
  const parsed = new Date(`${normalized}-01T00:00:00`);
  return Number.isNaN(parsed.getTime()) ?
  normalized :
  parsed.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
}

function normalizeDurusDataset(raw: unknown): DurusDataset | null {
  if (!raw || typeof raw !== 'object') return null;

  const rawDataset = raw as Record<string, unknown>;
  const rawRows = Array.isArray(rawDataset.rows) ? rawDataset.rows : [];
  const rows = rawRows.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const mapped = Object.entries(row).reduce<Record<string, string>>((acc, entry) => {
      const k = String(entry[0] || '').trim();
      if (!k) return acc;
      acc[k] = String(entry[1] ?? '').trim();
      return acc;
    }, {});
    return Object.keys(mapped).length > 0 ? [mapped] : [];
  });

  return {
    sourceFileName: String(rawDataset.sourceFileName || '').trim(),
    uploadedAt: String(rawDataset.uploadedAt || '').trim(),
    rowCount: rows.length,
    rows
  };
}

function normalizeImportsState(value: unknown): DurusImportsState {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;
  const monthMap: Record<string, DurusMonthImports> = {};

  const upsertDataset = (monthKey: string, templateKey: DurusTemplateKey, dataset: DurusDataset) => {
    if (!monthMap[monthKey]) monthMap[monthKey] = {};
    monthMap[monthKey][templateKey] = dataset;
  };

  const rawMonths = source.months;
  if (rawMonths && typeof rawMonths === 'object') {
    Object.entries(rawMonths as Record<string, unknown>).forEach(([rawMonthKey, rawMonthValue]) => {
      const monthKey = normalizeMonthKey(rawMonthKey);
      if (!monthKey || !rawMonthValue || typeof rawMonthValue !== 'object') return;
      const monthPayload = rawMonthValue as Record<string, unknown>;

      (['durusKayitlari', 'durusOranlari'] as const).forEach((templateKey) => {
        const dataset = normalizeDurusDataset(monthPayload[templateKey]);
        if (!dataset) return;
        upsertDataset(monthKey, templateKey, dataset);
      });
    });
  }

  (['durusKayitlari', 'durusOranlari'] as const).forEach((templateKey) => {
    const legacyDataset = normalizeDurusDataset(source[templateKey]);
    if (!legacyDataset) return;
    const legacyMonth = normalizeMonthKey(String(legacyDataset.uploadedAt || '').slice(0, 7)) || buildCurrentMonthKey();
    upsertDataset(legacyMonth, templateKey, legacyDataset);
  });

  const monthKeys = sortMonthKeysDesc(
    Object.keys(monthMap).filter((monthKey) => {
      const monthData = monthMap[monthKey];
      return Boolean(monthData.durusKayitlari || monthData.durusOranlari);
    })
  );

  if (monthKeys.length === 0) return {};

  const months = monthKeys.reduce<Record<string, DurusMonthImports>>((acc, monthKey) => {
    acc[monthKey] = monthMap[monthKey];
    return acc;
  }, {});

  const activeMonthCandidate = normalizeMonthKey(source.activeMonth);
  const activeMonth = activeMonthCandidate && monthKeys.includes(activeMonthCandidate) ?
  activeMonthCandidate :
  monthKeys[0];

  return {
    activeMonth,
    months
  };
}

function normalizeDurusCustomMachineGroupsState(value: unknown): DurusCustomMachineGroupsState {
  const defaults = buildDefaultDurusCustomMachineGroupsState();
  if (!value || typeof value !== 'object') return defaults;

  const source = value as Record<string, unknown>;
  const result = buildDefaultDurusCustomMachineGroupsState();

  (['electrical', 'mechanical', 'helper'] as const).forEach((department) => {
    const rawGroups = source[department];
    if (!Array.isArray(rawGroups)) return;

    result[department] = rawGroups.flatMap((item, index) => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Record<string, unknown>;
      const name = String(row.name || '').trim();
      if (!name) return [];

      const machineValues = Array.isArray(row.machines) ? row.machines : [];
      const machines = Array.from(
        new Set(
          machineValues.
          map((machine) => String(machine || '').trim()).
          filter(Boolean)
        )
      );
      if (machines.length === 0) return [];

      return [{
        id: String(row.id || `${department}_${index + 1}`),
        name,
        machines
      }];
    });
  });

  return result;
}

function parseNumber(value: string): number {
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

function getFirstColumnValue(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const value = String(row[key] ?? '').trim();
    if (value) return value;
  }
  return '';
}

function normalizeDateLabel(value: string): string {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.
  replace(/[ T]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?$/, '').
  trim();
}

function parseDateForSort(value: string): number {
  const text = String(value ?? '').trim();
  if (!text) return 0;

  const directParsed = Date.parse(text);
  if (Number.isFinite(directParsed)) return directParsed;

  const dateMatch = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!dateMatch) return 0;

  const day = Number.parseInt(dateMatch[1], 10);
  const month = Number.parseInt(dateMatch[2], 10) - 1;
  const yearRaw = Number.parseInt(dateMatch[3], 10);
  const year = yearRaw < 100 ? yearRaw + 2000 : yearRaw;
  const parsed = new Date(year, month, day).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseTimeForSort(value: string): number {
  const text = String(value ?? '').trim();
  if (!text) return 0;

  const timeMatch = text.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/);
  if (!timeMatch) return 0;

  const hour = Number.parseInt(timeMatch[1], 10);
  const minute = Number.parseInt(timeMatch[2] ?? '0', 10);
  const second = Number.parseInt(timeMatch[3] ?? '0', 10);

  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return 0;
  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return 0;
  if (!Number.isFinite(second) || second < 0 || second > 59) return 0;

  return hour * 3600 + minute * 60 + second;
}

function normalizeMachineKey(value: unknown): string {
  return String(value ?? '').
  trim().
  replace(/\s+/g, ' ').
  toLocaleLowerCase('tr-TR');
}

function isPipeMachineName(value: unknown): boolean {
  const machineText = String(value ?? '').
  toLocaleUpperCase('tr-TR').
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^A-Z0-9]+/g, ' ').
  trim();
  if (!machineText) return false;
  return (
    machineText.includes('BORU') ||
    machineText.includes('BMK') ||
    machineText.startsWith('O BMK')
  );
}

function extractMachineNumberKey(value: unknown): string {
  const normalized = normalizeMachineKey(value);
  if (!normalized) return '';
  const match = normalized.match(/(\d+)/);
  if (!match) return '';
  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return String(parsed);
}

function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
}

function buildParetoPoints(
rows: Array<{id: string;label: string;value: number;meta?: string;}>)
: ParetoPoint[] {
  const sorted = rows.
  map((row) => ({
    id: row.id,
    label: String(row.label || '-').trim() || '-',
    value: Number.isFinite(row.value) ? row.value : 0,
    meta: String(row.meta || '').trim()
  })).
  filter((row) => row.value > 0).
  sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'tr-TR', { sensitivity: 'base' }));

  const total = sorted.reduce((sum, row) => sum + row.value, 0);
  if (total <= 0) return [];

  let running = 0;
  return sorted.map((row) => {
    running += row.value;
    return {
      id: row.id,
      label: row.label,
      value: row.value,
      cumulativePercent: running / total * 100,
      meta: row.meta
    };
  });
}

function getParetoThresholdCount(rows: ParetoPoint[], thresholdPercent = 80): number {
  if (rows.length === 0) return 0;
  const index = rows.findIndex((row) => row.cumulativePercent >= thresholdPercent);
  if (index < 0) return rows.length;
  return index + 1;
}

function ParetoChart({
  rows,
  valueFractionDigits = 2,
  valueSuffix = '',
  emptyMessage,
  barFill = '#D97706',
  selectedLabel = '',
  onSelectLabel
}: ParetoChartProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  const maxValue = rows.reduce((highest, row) => row.value > highest ? row.value : highest, 0) || 1;
  const chartHeight = 320;
  const chartWidth = Math.max(860, rows.length * 58);
  const margin = { top: 20, right: 44, bottom: 94, left: 46 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  const baselineY = margin.top + plotHeight;
  const y80 = margin.top + plotHeight * 0.2;
  const y100 = margin.top;
  const xStep = rows.length > 0 ? plotWidth / rows.length : plotWidth;
  const barWidth = Math.max(10, xStep * 0.62);

  const bars = rows.map((row, index) => {
    const x = margin.left + index * xStep + (xStep - barWidth) / 2;
    const barHeight = row.value / maxValue * plotHeight;
    const y = baselineY - barHeight;
    const centerX = x + barWidth / 2;
    const cumulativeY = baselineY - row.cumulativePercent / 100 * plotHeight;
    return {
      ...row,
      x,
      y,
      centerX,
      barHeight,
      cumulativeY
    };
  });

  const cumulativePoints = bars.map((bar) => `${bar.centerX},${bar.cumulativeY}`).join(' ');
  const formattedMaxValue = `${formatNumber(maxValue, valueFractionDigits)}${valueSuffix ? ` ${valueSuffix}` : ''}`;
  const selectedLabelKey = String(selectedLabel || '').trim().toLocaleLowerCase('tr-TR');

  const handleSelectLabel = (label: string) => {
    if (!onSelectLabel) return;
    const normalized = String(label || '').trim();
    if (!normalized) {
      onSelectLabel(null);
      return;
    }
    const isSameSelection = normalized.toLocaleLowerCase('tr-TR') === selectedLabelKey;
    onSelectLabel(isSameSelection ? null : normalized);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} role="img" aria-label="Pareto chart">
          <line x1={margin.left} y1={baselineY} x2={chartWidth - margin.right} y2={baselineY} stroke="#D1D5DB" strokeWidth="1" />
          <line x1={margin.left} y1={y100} x2={chartWidth - margin.right} y2={y100} stroke="#E5E7EB" strokeWidth="1" />
          <line x1={margin.left} y1={y80} x2={chartWidth - margin.right} y2={y80} stroke="#DC2626" strokeWidth="1.5" strokeDasharray="5 4" />

          {bars.map((bar) =>
          <rect
            key={`bar-${bar.id}`}
            x={bar.x}
            y={bar.y}
            width={barWidth}
            height={Math.max(0, bar.barHeight)}
            fill={bar.label.toLocaleLowerCase('tr-TR') === selectedLabelKey ? '#B45309' : barFill}
            rx="2"
            ry="2"
            className={onSelectLabel ? 'cursor-pointer' : undefined}
            role={onSelectLabel ? 'button' : undefined}
            tabIndex={onSelectLabel ? 0 : -1}
            onClick={() => handleSelectLabel(bar.label)}
            onKeyDown={(event) => {
              if (!onSelectLabel) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSelectLabel(bar.label);
              }
            }}>
              <title>{`${bar.label}: ${formatNumber(bar.value, valueFractionDigits)}${valueSuffix ? ` ${valueSuffix}` : ''}`}</title>
            </rect>
          )}

          {cumulativePoints &&
          <polyline
            points={cumulativePoints}
            fill="none"
            stroke="#111827"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round" />
          }

          {bars.map((bar) =>
          <circle
            key={`point-${bar.id}`}
            cx={bar.centerX}
            cy={bar.cumulativeY}
            r="3"
            fill="#111827">
              <title>{`Kümülatif: %${formatNumber(bar.cumulativePercent, 2)}`}</title>
            </circle>
          )}

          <text x={margin.left - 6} y={y100 + 4} textAnchor="end" fontSize="10" fill="#6B7280">{formattedMaxValue}</text>
          <text x={margin.left - 6} y={baselineY + 4} textAnchor="end" fontSize="10" fill="#6B7280">0</text>
          <text x={chartWidth - margin.right + 6} y={y100 + 4} fontSize="10" fill="#374151">100%</text>
          <text x={chartWidth - margin.right + 6} y={y80 + 4} fontSize="10" fill="#DC2626">%80</text>

          {bars.map((bar) =>
          <text
            key={`label-${bar.id}`}
            x={bar.centerX}
            y={baselineY + 16}
            transform={`rotate(-45 ${bar.centerX} ${baselineY + 16})`}
            textAnchor="end"
            fontSize="10"
            fill="#4B5563">
              {bar.label}
            </text>
          )}
        </svg>
      </div>

      <div className="max-h-60 overflow-auto rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left font-semibold text-gray-600">Sıra</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-600">Kategori</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-600">Değer</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-600">Kümülatif</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-600">Seç</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) =>
            <tr
              key={`row-${row.id}`}
              className={row.label.toLocaleLowerCase('tr-TR') === selectedLabelKey ? 'bg-amber-50' : undefined}>
                <td className="px-2 py-1.5 text-gray-700">{index + 1}</td>
                <td className="px-2 py-1.5 text-gray-700">
                  <p>{row.label}</p>
                  {row.meta && <p className="text-[11px] text-gray-500">{row.meta}</p>}
                </td>
                <td className="px-2 py-1.5 text-right text-gray-700">{formatNumber(row.value, valueFractionDigits)}{valueSuffix ? ` ${valueSuffix}` : ''}</td>
                <td className="px-2 py-1.5 text-right font-semibold text-gray-800">%{formatNumber(row.cumulativePercent, 2)}</td>
                <td className="w-1 px-2 py-1.5 text-right">
                  {onSelectLabel &&
                  <button
                    type="button"
                    onClick={() => handleSelectLabel(row.label)}
                    className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${
                    row.label.toLocaleLowerCase('tr-TR') === selectedLabelKey ?
                    'border-amber-500 bg-amber-500 text-white' :
                    'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}>
                    Seç
                  </button>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);
}

function getDepartmentLabel(department: DepartmentGraphDepartment): string {
  switch (department) {
    case 'electrical':
      return 'Elektrik Bakım';
    case 'mechanical':
      return 'Mekanik Bakım';
    case 'helper':
      return 'Yardımcı Tesisler';
    default:
      return 'Tüm Bölümler';
  }
}

function getDepartmentColorClass(department: DepartmentGraphDepartment): string {
  switch (department) {
    case 'electrical':
      return 'bg-amber-500';
    case 'mechanical':
      return 'bg-blue-500';
    case 'helper':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
}

function getDetailDowntimeDepartmentKey(department: string): DetailDowntimeDepartmentFilter | 'other' {
  const normalized = String(department || '').
  toLocaleUpperCase('tr-TR').
  replace(/İ/g, 'I').
  replace(/Ş/g, 'S').
  replace(/Ç/g, 'C').
  replace(/Ğ/g, 'G').
  replace(/Ü/g, 'U').
  replace(/Ö/g, 'O');

  if (normalized.includes('ELEKTRIK')) return 'electrical';
  if (normalized.includes('MEKANIK')) return 'mechanical';
  if (normalized.includes('YARDIMCI') || normalized.includes('TESIS')) return 'helper';
  return 'other';
}

function getMachineDepartmentValue(
row: MachineDepartmentDowntimeRow,
mode: DepartmentGraphMode,
department: DepartmentGraphDepartment)
: number {
  if (department === 'electrical') {
    return mode === 'minutes' ? row.electricalMinutes : row.electricalDowntimeRate;
  }
  if (department === 'mechanical') {
    return mode === 'minutes' ? row.mechanicalMinutes : row.mechanicalDowntimeRate;
  }
  if (department === 'helper') {
    return mode === 'minutes' ? row.helperMinutes : row.helperDowntimeRate;
  }
  return mode === 'minutes' ? row.totalDepartmentMinutes : row.totalDepartmentDowntimeRate;
}

function parseOranRows(rows: Array<Record<string, string>>): OranRow[] {
  return rows.
  map((row) => {
    const machine = String(row['MAKINE'] || '').trim();
    return {
      machine,
      machineKey: normalizeMachineKey(machine),
      machineNumberKey: extractMachineNumberKey(machine),
      production: parseNumber(row['URETIM(KG)']),
      possibleMinutes: parseNumber(row['MUMKUN CALISMA(DK)']),
      actualMinutes: parseNumber(row['FIILI CALISMA(DK)']),
      downtimeMinutes: parseNumber(row['TOPLAM DURUS']),
      helperMinutes: parseNumber(row['YARDIMCI TESIS(DK)']),
      operationsMinutes: parseNumber(row['ISLETME(DK)']),
      mechanicalMinutes: parseNumber(row['MEKANIK(DK)']),
      electricalMinutes: parseNumber(row['ELEKTRIK(DK)']),
      efficiencyRate: parseNumber(row['% ZAMAN VERIMLILIGI']),
      helperRate: parseNumber(row['% YARDIMCI TESIS']),
      operationsRate: parseNumber(row['% ISLETME']),
      mechanicalRate: parseNumber(row['% MEKANIK']),
      electricalRate: parseNumber(row['% ELEKTRIK'])
    };
  }).
  filter((row) => Boolean(row.machineKey)).
  sort((a, b) => b.downtimeMinutes - a.downtimeMinutes);
}

export default function DurusAnalizi() {
  const location = useLocation();
  const isParetoPage = location.pathname === '/pareto-analizi';
  const [selectedMonth, setSelectedMonth] = useState(() => buildInitialDurusDisplayMonthKey());
  const [selectedMachine, setSelectedMachine] = useState('ALL');
  const [selectedDetailMachine, setSelectedDetailMachine] = useState(DETAIL_MACHINE_ALL);
  const [selectedDetailDepartmentFilter, setSelectedDetailDepartmentFilter] = useState<DetailDowntimeDepartmentFilter>('all');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [departmentGraphMode] = useState<DepartmentGraphMode>('ratio');
  const [selectedGraphDepartment, setSelectedGraphDepartment] = useState<DepartmentGraphDepartment>('all');
  const [departmentGraphSort, setDepartmentGraphSort] = useState<DepartmentGraphSort>('value_desc');
  const [selectedParetoReason, setSelectedParetoReason] = useState('');

  const {
    data: imports,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['durus-analizi-imports'],
    queryFn: async () => {
      const response = await appStateApi.get(APP_STATE_KEYS.settingsDurusAnaliziImports);
      return normalizeImportsState(response.data?.data?.value);
    }
  });

  const { data: customMachineGroups } = useQuery({
    queryKey: ['durus-custom-machine-groups'],
    queryFn: async () => {
      try {
        const response = await appStateApi.get(APP_STATE_KEYS.settingsDurusCustomMachineGroups);
        return normalizeDurusCustomMachineGroupsState(response.data?.data?.value);
      } catch {
        return buildDefaultDurusCustomMachineGroupsState();
      }
    }
  });

  useEffect(() => {
    const normalizedSelected = normalizeMonthKey(selectedMonth);
    if (!normalizedSelected) {
      setSelectedMonth(buildInitialDurusDisplayMonthKey());
      return;
    }

    const { year, month } = splitMonthKeyParts(normalizedSelected);
    if (!DURUS_YEAR_OPTIONS.includes(year as typeof DURUS_YEAR_OPTIONS[number])) {
      setSelectedMonth(`${DURUS_YEAR_OPTIONS[DURUS_YEAR_OPTIONS.length - 1]}-${month}`);
    }
  }, [selectedMonth]);

  const availableMonthKeys = useMemo(() => {
    if (!imports?.months || typeof imports.months !== 'object') return [];

    return sortMonthKeysDesc(
      Object.keys(imports.months).filter((monthKey) => {
        const normalizedMonth = normalizeMonthKey(monthKey);
        if (!normalizedMonth) return false;
        const monthData = imports.months?.[monthKey];
        return Boolean(monthData?.durusKayitlari || monthData?.durusOranlari);
      })
    );
  }, [imports]);

  useEffect(() => {
    if (availableMonthKeys.length === 0) return;

    const normalizedSelected = normalizeMonthKey(selectedMonth);
    if (normalizedSelected && availableMonthKeys.includes(normalizedSelected)) return;

    const activeMonthCandidate = normalizeMonthKey(imports?.activeMonth);
    const fallbackMonth =
      activeMonthCandidate && availableMonthKeys.includes(activeMonthCandidate)
        ? activeMonthCandidate
        : availableMonthKeys[0];

    if (fallbackMonth && fallbackMonth !== selectedMonth) {
      setSelectedMonth(fallbackMonth);
    }
  }, [availableMonthKeys, imports?.activeMonth, selectedMonth]);

  const monthScopedRows = useMemo(() => {
    if (imports?.months && typeof imports.months === 'object') {
      return {
        kayitRows: imports.months?.[selectedMonth]?.durusKayitlari?.rows ?? [],
        oranRows: imports.months?.[selectedMonth]?.durusOranlari?.rows ?? []
      };
    }

    return {
      kayitRows: imports?.durusKayitlari?.rows ?? [],
      oranRows: imports?.durusOranlari?.rows ?? []
    };
  }, [imports, selectedMonth]);

  const kayitRows = useMemo(
    () =>
    monthScopedRows.kayitRows.filter((row) =>
    Boolean(getFirstColumnValue(row, ['BOLUM TANIMI', 'BOLUM']).trim())
    ),
    [monthScopedRows.kayitRows]
  );
  const oranRows = monthScopedRows.oranRows;
  const hasData = kayitRows.length > 0 || oranRows.length > 0;

  const machineOptions = useMemo(() => {
    const values = new Set<string>();
    kayitRows.forEach((row) => {
      const machine = String(row['ISYERI'] || '').trim();
      if (machine) values.add(machine);
    });
    oranRows.forEach((row) => {
      const machine = String(row['MAKINE'] || '').trim();
      if (machine) values.add(machine);
    });
    if (customMachineGroups) {
      (['electrical', 'mechanical', 'helper'] as const).forEach((department) => {
        customMachineGroups[department].forEach((group) => {
          const groupName = String(group.name || '').trim();
          if (groupName) values.add(groupName);
        });
      });
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'tr-TR', { numeric: true, sensitivity: 'base' }));
  }, [customMachineGroups, kayitRows, oranRows]);

  const departmentOptions = useMemo(() => {
    const values = new Set<string>();
    kayitRows.forEach((row) => {
      const department = String(row['BOLUM TANIMI'] || '').trim();
      if (department) values.add(department);
    });
    return [...values].sort((a, b) => a.localeCompare(b, 'tr-TR', { sensitivity: 'base' }));
  }, [kayitRows]);

  const shiftOptions = useMemo(() => {
    const values = new Set<string>();
    kayitRows.forEach((row) => {
      const shift = String(row['VARDIYA'] || '').trim();
      if (shift) values.add(shift);
    });
    return [...values].sort((a, b) => a.localeCompare(b, 'tr-TR', { sensitivity: 'base' }));
  }, [kayitRows]);

  const detailMachineOptions = useMemo(() => {
    const values = new Set<string>();
    kayitRows.forEach((row) => {
      const machine = getFirstColumnValue(row, ['ISYERI', 'MAKINE', 'IS YERI']);
      if (machine) values.add(machine);
    });
    return [...values].sort((a, b) => a.localeCompare(b, 'tr-TR', { numeric: true, sensitivity: 'base' }));
  }, [kayitRows]);

  useEffect(() => {
    if (selectedMachine !== 'ALL' && !machineOptions.includes(selectedMachine)) {
      setSelectedMachine('ALL');
    }
  }, [machineOptions, selectedMachine]);

  useEffect(() => {
    if (selectedDepartment !== 'ALL' && !departmentOptions.includes(selectedDepartment)) {
      setSelectedDepartment('ALL');
    }
  }, [departmentOptions, selectedDepartment]);

  useEffect(() => {
    if (selectedShift !== 'ALL' && !shiftOptions.includes(selectedShift)) {
      setSelectedShift('ALL');
    }
  }, [selectedShift, shiftOptions]);

  useEffect(() => {
    if (
    selectedDetailMachine !== DETAIL_MACHINE_ALL &&
    selectedDetailMachine !== DETAIL_MACHINE_ALL_PIPE &&
    !detailMachineOptions.includes(selectedDetailMachine))
    {
      setSelectedDetailMachine(DETAIL_MACHINE_ALL);
    }
  }, [detailMachineOptions, selectedDetailMachine]);

  const selectedMachineKey = useMemo(
    () => selectedMachine === 'ALL' ? '' : normalizeMachineKey(selectedMachine),
    [selectedMachine]
  );

  const isAllPipeMachineSelection = selectedDetailMachine === DETAIL_MACHINE_ALL_PIPE;
  const selectedDetailMachineKey = useMemo(
    () =>
    selectedDetailMachine === DETAIL_MACHINE_ALL || selectedDetailMachine === DETAIL_MACHINE_ALL_PIPE ?
    '' :
    normalizeMachineKey(selectedDetailMachine),
    [selectedDetailMachine]
  );

  const filteredKayitRows = useMemo(() => kayitRows.filter((row) => {
    const machineKey = normalizeMachineKey(row['ISYERI']);
    const department = String(row['BOLUM TANIMI'] || '').trim();
    const shift = String(row['VARDIYA'] || '').trim();

    if (selectedMachine !== 'ALL' && machineKey !== selectedMachineKey) return false;
    if (selectedDepartment !== 'ALL' && department !== selectedDepartment) return false;
    if (selectedShift !== 'ALL' && shift !== selectedShift) return false;

    return true;
  }), [kayitRows, selectedDepartment, selectedMachine, selectedMachineKey, selectedShift]);

  const filteredMachineSet = useMemo(() => {
    const values = new Set<string>();
    filteredKayitRows.forEach((row) => {
      const machineKey = normalizeMachineKey(row['ISYERI']);
      if (machineKey) values.add(machineKey);
    });
    return values;
  }, [filteredKayitRows]);

  const parsedOranRows = useMemo(() => parseOranRows(oranRows), [oranRows]);

  const selectedMachineDetailRows = useMemo<DurusMachineDetailRow[]>(() => {
    if (selectedDetailMachine === DETAIL_MACHINE_ALL) return [];

    return kayitRows.
    map((row, index) => {
      const machine = getFirstColumnValue(row, ['ISYERI', 'MAKINE', 'IS YERI']);
      const machineKey = normalizeMachineKey(machine);
      if (!machineKey) return null;
      if (isAllPipeMachineSelection) {
        if (!isPipeMachineName(machine)) return null;
      } else if (machineKey !== selectedDetailMachineKey) {
        return null;
      }

      const startDateRaw = getFirstColumnValue(row, ['BASLANGIC TARIHI', 'TARIH']);
      const endDateRaw = getFirstColumnValue(row, ['BITIS TARIHI']);
      const startDate = normalizeDateLabel(startDateRaw);
      const endDate = normalizeDateLabel(endDateRaw);
      const startTime = getFirstColumnValue(row, ['BASLANGIC SAATI']);
      const endTime = getFirstColumnValue(row, ['BITIS SAATI']);
      const shift = getFirstColumnValue(row, ['VARDIYA']) || '-';
      const reason = getFirstColumnValue(row, ['DURUS TANIMI', 'DURUS']) || '-';
      const department = getFirstColumnValue(row, ['BOLUM TANIMI', 'BOLUM']) || '-';
      const departmentKey = getDetailDowntimeDepartmentKey(department);
      if (selectedDetailDepartmentFilter !== 'all' && departmentKey !== selectedDetailDepartmentFilter) return null;
      const note = getFirstColumnValue(row, ['ACIKLAMA']) || '-';
      const minutesText = getFirstColumnValue(row, ['TOPLAM DURUS (DAK)', 'TOPLAM DURUS(DK)', 'TOPLAM DURUS']);
      const minutes = parseDowntimeMinutes(minutesText);

      const dateBaseLabel = endDate && endDate !== startDate ?
      `${startDate || '-'} - ${endDate}` :
      startDate || '-';
      const timeLabel = [startTime, endTime].filter(Boolean).join(' - ');
      const dateLabel = timeLabel ? `${dateBaseLabel} (${timeLabel})` : dateBaseLabel;
      const sortDateValue = parseDateForSort(startDateRaw || endDateRaw);
      const sortTimeValue = parseTimeForSort(startTime);

      return {
        id: `${machineKey}-${index}`,
        dateLabel,
        shift,
        reason,
        minutes,
        department,
        note,
        sortDate: sortDateValue,
        sortTime: sortTimeValue
      };
    }).
    filter((row): row is DurusMachineDetailRow => Boolean(row)).
    sort((a, b) => {
      if (a.sortDate !== b.sortDate) return b.sortDate - a.sortDate;
      if (a.sortTime !== b.sortTime) return b.sortTime - a.sortTime;
      return a.reason.localeCompare(b.reason, 'tr-TR', { sensitivity: 'base' });
    });
  }, [
    isAllPipeMachineSelection,
    kayitRows,
    selectedDetailDepartmentFilter,
    selectedDetailMachine,
    selectedDetailMachineKey
  ]);

  const allMachineDepartmentDowntime = useMemo<MachineDepartmentDowntimeRow[]>(() => {
    const grouped = new Map<string, {
      machine: string;
      possibleMinutes: number;
      electricalMinutes: number;
      mechanicalMinutes: number;
      helperMinutes: number;
    }>();

    const requiresKayitFilter = selectedDepartment !== 'ALL' || selectedShift !== 'ALL';

    parsedOranRows.forEach((row) => {
      if (selectedMachine !== 'ALL' && row.machineKey !== selectedMachineKey) return;
      if (requiresKayitFilter && !filteredMachineSet.has(row.machineKey)) return;

      const current = grouped.get(row.machineKey) || {
        machine: row.machine,
        possibleMinutes: 0,
        electricalMinutes: 0,
        mechanicalMinutes: 0,
        helperMinutes: 0
      };

      if (!current.machine) current.machine = row.machine;
      current.possibleMinutes += row.possibleMinutes;
      current.electricalMinutes += row.electricalMinutes;
      current.mechanicalMinutes += row.mechanicalMinutes;
      current.helperMinutes += row.helperMinutes;
      grouped.set(row.machineKey, current);
    });

    const baseRows = [...grouped.entries()].
    map(([machineKey, totals]) => {
      const totalDepartmentMinutes = totals.electricalMinutes + totals.mechanicalMinutes + totals.helperMinutes;
      const safeTotal = totalDepartmentMinutes || 1;
      const safePossible = totals.possibleMinutes || 1;
      const electricalDowntimeRate = totals.electricalMinutes / safePossible * 100;
      const mechanicalDowntimeRate = totals.mechanicalMinutes / safePossible * 100;
      const helperDowntimeRate = totals.helperMinutes / safePossible * 100;
      const totalDepartmentDowntimeRate = totalDepartmentMinutes / safePossible * 100;

      return {
        id: `machine:${machineKey}`,
        machine: totals.machine || machineKey,
        possibleMinutes: totals.possibleMinutes,
        electricalMinutes: totals.electricalMinutes,
        mechanicalMinutes: totals.mechanicalMinutes,
        helperMinutes: totals.helperMinutes,
        totalDepartmentMinutes,
        electricalShare: totals.electricalMinutes / safeTotal * 100,
        mechanicalShare: totals.mechanicalMinutes / safeTotal * 100,
        helperShare: totals.helperMinutes / safeTotal * 100,
        electricalDowntimeRate,
        mechanicalDowntimeRate,
        helperDowntimeRate,
        totalDepartmentDowntimeRate
      };
    });

    const customGroups = customMachineGroups || buildDefaultDurusCustomMachineGroupsState();
    const customRows: MachineDepartmentDowntimeRow[] = [];

    (['electrical', 'mechanical', 'helper'] as const).forEach((department) => {
      customGroups[department].forEach((group) => {
        const groupName = String(group.name || '').trim();
        if (!groupName) return;
        if (selectedMachine !== 'ALL' && selectedMachine !== groupName) return;

        const machineSet = new Set(
          group.machines.
          map((machine) => normalizeMachineKey(machine)).
          filter(Boolean)
        );
        const machineNumberSet = new Set(
          group.machines.
          map((machine) => extractMachineNumberKey(machine)).
          filter(Boolean)
        );
        if (machineSet.size === 0 && machineNumberSet.size === 0) return;

        let possibleMinutes = 0;
        let electricalMinutes = 0;
        let mechanicalMinutes = 0;
        let helperMinutes = 0;

        parsedOranRows.forEach((row) => {
          const matchesMachine = machineSet.has(row.machineKey) ||
          row.machineNumberKey && machineNumberSet.has(row.machineNumberKey);
          if (!matchesMachine) return;
          if (requiresKayitFilter && !filteredMachineSet.has(row.machineKey)) return;

          possibleMinutes += row.possibleMinutes;
          electricalMinutes += row.electricalMinutes;
          mechanicalMinutes += row.mechanicalMinutes;
          helperMinutes += row.helperMinutes;
        });

        const totalDepartmentMinutes = electricalMinutes + mechanicalMinutes + helperMinutes;
        if (totalDepartmentMinutes <= 0) return;

        const safePossible = possibleMinutes || 1;
        const safeTotal = totalDepartmentMinutes || 1;

        customRows.push({
          id: `custom:${department}:${group.id}`,
          machine: groupName,
          possibleMinutes,
          electricalMinutes,
          mechanicalMinutes,
          helperMinutes,
          totalDepartmentMinutes,
          electricalShare: electricalMinutes / safeTotal * 100,
          mechanicalShare: mechanicalMinutes / safeTotal * 100,
          helperShare: helperMinutes / safeTotal * 100,
          electricalDowntimeRate: electricalMinutes / safePossible * 100,
          mechanicalDowntimeRate: mechanicalMinutes / safePossible * 100,
          helperDowntimeRate: helperMinutes / safePossible * 100,
          totalDepartmentDowntimeRate: totalDepartmentMinutes / safePossible * 100
        });
      });
    });

    return [...baseRows, ...customRows].sort((a, b) => b.totalDepartmentMinutes - a.totalDepartmentMinutes);
  }, [
  customMachineGroups,
  filteredMachineSet,
  parsedOranRows,
  selectedDepartment,
  selectedMachine,
  selectedMachineKey,
  selectedShift]
  );

  const selectedMachineReasonParetoRows = useMemo<ParetoPoint[]>(() => {
    if (selectedDetailMachine === DETAIL_MACHINE_ALL) return [];

    const grouped = new Map<string, {minutes: number;count: number;}>();
    selectedMachineDetailRows.forEach((row) => {
      const reason = String(row.reason || '-').trim() || '-';
      const current = grouped.get(reason) || { minutes: 0, count: 0 };
      current.minutes += row.minutes;
      current.count += 1;
      grouped.set(reason, current);
    });

    return buildParetoPoints(
      [...grouped.entries()].map(([reason, totals], index) => ({
        id: `${normalizeMachineKey(reason)}-${index}`,
        label: reason,
        value: totals.minutes,
        meta: `${totals.count} kayıt`
      }))
    );
  }, [selectedDetailMachine, selectedMachineDetailRows]);

  const selectedMachineParetoThresholdCount = useMemo(
    () => getParetoThresholdCount(selectedMachineReasonParetoRows, 80),
    [selectedMachineReasonParetoRows]
  );

  useEffect(() => {
    if (!selectedParetoReason) return;
    const selectedKey = selectedParetoReason.toLocaleLowerCase('tr-TR');
    const exists = selectedMachineReasonParetoRows.some(
      (row) => row.label.toLocaleLowerCase('tr-TR') === selectedKey
    );
    if (!exists) setSelectedParetoReason('');
  }, [selectedMachineReasonParetoRows, selectedParetoReason]);

  const paretoDetailRows = useMemo(() => {
    if (!selectedParetoReason) return selectedMachineDetailRows;

    const selectedKey = selectedParetoReason.toLocaleLowerCase('tr-TR');
    const matchingRows: DurusMachineDetailRow[] = [];
    const nonMatchingRows: DurusMachineDetailRow[] = [];

    selectedMachineDetailRows.forEach((row) => {
      const reasonKey = String(row.reason || '').trim().toLocaleLowerCase('tr-TR');
      if (reasonKey === selectedKey) {
        matchingRows.push(row);
      } else {
        nonMatchingRows.push(row);
      }
    });

    return [...matchingRows, ...nonMatchingRows];
  }, [selectedMachineDetailRows, selectedParetoReason]);

  const selectedParetoReasonMatchCount = useMemo(() => {
    if (!selectedParetoReason) return 0;
    const selectedKey = selectedParetoReason.toLocaleLowerCase('tr-TR');
    return selectedMachineDetailRows.filter(
      (row) => String(row.reason || '').trim().toLocaleLowerCase('tr-TR') === selectedKey
    ).length;
  }, [selectedMachineDetailRows, selectedParetoReason]);

  const dashboardDepartmentTotals = useMemo(() => {
    const sourceRows = selectedMachine === 'ALL' ?
    allMachineDepartmentDowntime.filter((row) => !row.id.startsWith('custom:')) :
    allMachineDepartmentDowntime;

    const totals = sourceRows.reduce(
      (acc, row) => {
        acc.possible += row.possibleMinutes;
        acc.electrical += row.electricalMinutes;
        acc.mechanical += row.mechanicalMinutes;
        acc.helper += row.helperMinutes;
        return acc;
      },
      { possible: 0, electrical: 0, mechanical: 0, helper: 0 }
    );

    const grandTotal = totals.electrical + totals.mechanical + totals.helper;
    const safeGrandTotal = grandTotal || 1;
    const safePossible = totals.possible || 1;

    return {
      ...totals,
      grandTotal,
      electricalShareRate: totals.electrical / safeGrandTotal * 100,
      mechanicalShareRate: totals.mechanical / safeGrandTotal * 100,
      helperShareRate: totals.helper / safeGrandTotal * 100,
      electricalRate: totals.electrical / safePossible * 100,
      mechanicalRate: totals.mechanical / safePossible * 100,
      helperRate: totals.helper / safePossible * 100,
      totalRate: grandTotal / safePossible * 100
    };
  }, [allMachineDepartmentDowntime, selectedMachine]);

  const { year: selectedYearPart, month: selectedMonthPart } = useMemo(
    () => splitMonthKeyParts(selectedMonth),
    [selectedMonth]
  );

  const handleDisplayYearChange = (year: string) => {
    const nextMonthKey = buildMonthKeyFromParts(year, selectedMonthPart);
    if (!nextMonthKey) return;
    setSelectedMonth(nextMonthKey);
  };

  const handleDisplayMonthChange = (month: string) => {
    const nextMonthKey = buildMonthKeyFromParts(selectedYearPart, month);
    if (!nextMonthKey) return;
    setSelectedMonth(nextMonthKey);
  };

  const selectedDepartmentLabel = getDepartmentLabel(selectedGraphDepartment);
  const selectedMonthLabel = formatMonthLabel(selectedMonth);

  const selectedDepartmentTotalValue = useMemo(() => {
    if (selectedGraphDepartment === 'electrical') {
      return departmentGraphMode === 'minutes' ?
      dashboardDepartmentTotals.electrical :
      dashboardDepartmentTotals.electricalRate;
    }
    if (selectedGraphDepartment === 'mechanical') {
      return departmentGraphMode === 'minutes' ?
      dashboardDepartmentTotals.mechanical :
      dashboardDepartmentTotals.mechanicalRate;
    }
    if (selectedGraphDepartment === 'helper') {
      return departmentGraphMode === 'minutes' ?
      dashboardDepartmentTotals.helper :
      dashboardDepartmentTotals.helperRate;
    }
    return departmentGraphMode === 'minutes' ?
    dashboardDepartmentTotals.grandTotal :
    dashboardDepartmentTotals.totalRate;
  }, [dashboardDepartmentTotals, departmentGraphMode, selectedGraphDepartment]);

  const sortedMachineDepartmentDowntime = useMemo(() => {
    return [...allMachineDepartmentDowntime].
    filter((row) => {
      if (getMachineDepartmentValue(row, departmentGraphMode, selectedGraphDepartment) <= 0) return false;

      if (row.id.startsWith('custom:')) {
        if (selectedGraphDepartment === 'all') return false;
        const rowDepartment = row.id.split(':')[1] as DepartmentGraphDepartment | undefined;
        if (!rowDepartment || rowDepartment !== selectedGraphDepartment) return false;
      }

      return true;
    }).
    sort((a, b) => {
      if (departmentGraphSort === 'machine_asc') {
        return a.machine.localeCompare(b.machine, 'tr-TR', { numeric: true, sensitivity: 'base' });
      }
      if (departmentGraphSort === 'machine_desc') {
        return b.machine.localeCompare(a.machine, 'tr-TR', { numeric: true, sensitivity: 'base' });
      }

      const aValue = getMachineDepartmentValue(a, departmentGraphMode, selectedGraphDepartment);
      const bValue = getMachineDepartmentValue(b, departmentGraphMode, selectedGraphDepartment);

      if (departmentGraphSort === 'value_asc') {
        if (aValue !== bValue) return aValue - bValue;
        return a.machine.localeCompare(b.machine, 'tr-TR', { numeric: true, sensitivity: 'base' });
      }

      if (aValue !== bValue) return bValue - aValue;
      return a.machine.localeCompare(b.machine, 'tr-TR', { numeric: true, sensitivity: 'base' });
    });
  }, [allMachineDepartmentDowntime, departmentGraphMode, departmentGraphSort, selectedGraphDepartment]);

  const maxMachineDepartmentValue = useMemo(() => {
    const max = sortedMachineDepartmentDowntime.reduce((highest, row) => {
      const value = getMachineDepartmentValue(row, departmentGraphMode, selectedGraphDepartment);
      return value > highest ? value : highest;
    }, 0);
    return max > 0 ? max : 1;
  }, [departmentGraphMode, selectedGraphDepartment, sortedMachineDepartmentDowntime]);

  const graphUnitLabel = departmentGraphMode === 'minutes' ? 'dk' : '%';

  const graphDescription = departmentGraphMode === 'minutes' ?
  selectedGraphDepartment === 'all' ?
  `Dashboard gösterimine uygun veri seti: Elektrik Bakım, Mekanik Bakım, Yardımcı Tesisler (dk). Seçili dönem: ${selectedMonthLabel}.` :
  `${selectedDepartmentLabel} duruş süresi tüm makineler için dakika bazında gösterilir. Seçili dönem: ${selectedMonthLabel}.` :
  selectedGraphDepartment === 'all' ?
  `Duruş oranı hesabı: bölüm duruş süresi / mümkün çalışma süresi, tüm makineler için (%). Seçili dönem: ${selectedMonthLabel}.` :
  `${selectedDepartmentLabel} duruş oranı: bölüm duruş süresi / mümkün çalışma süresi (%). Seçili dönem: ${selectedMonthLabel}.`;

  const graphEmptyMessage = departmentGraphMode === 'minutes' ?
  `${selectedDepartmentLabel} için grafik verisi bulunamadı.` :
  `${selectedDepartmentLabel} için duruş oranı verisi bulunamadı.`;

  const electricalCardValue = departmentGraphMode === 'minutes' ?
  `${formatNumber(dashboardDepartmentTotals.electrical)} dk` :
  `%${formatNumber(dashboardDepartmentTotals.electricalRate, 2)}`;

  const mechanicalCardValue = departmentGraphMode === 'minutes' ?
  `${formatNumber(dashboardDepartmentTotals.mechanical)} dk` :
  `%${formatNumber(dashboardDepartmentTotals.mechanicalRate, 2)}`;

  const helperCardValue = departmentGraphMode === 'minutes' ?
  `${formatNumber(dashboardDepartmentTotals.helper)} dk` :
  `%${formatNumber(dashboardDepartmentTotals.helperRate, 2)}`;

  const electricalCardSubValue = departmentGraphMode === 'minutes' ?
  `%${formatNumber(dashboardDepartmentTotals.electricalShareRate, 2)}` :
  `${formatNumber(dashboardDepartmentTotals.electrical)} dk`;

  const mechanicalCardSubValue = departmentGraphMode === 'minutes' ?
  `%${formatNumber(dashboardDepartmentTotals.mechanicalShareRate, 2)}` :
  `${formatNumber(dashboardDepartmentTotals.mechanical)} dk`;

  const helperCardSubValue = departmentGraphMode === 'minutes' ?
  `%${formatNumber(dashboardDepartmentTotals.helperShareRate, 2)}` :
  `${formatNumber(dashboardDepartmentTotals.helper)} dk`;

  const maintenanceCardValue = departmentGraphMode === 'minutes' ?
  `${formatNumber(dashboardDepartmentTotals.grandTotal)} dk` :
  `%${formatNumber(dashboardDepartmentTotals.totalRate, 2)}`;

  const maintenanceCardSubValue = departmentGraphMode === 'minutes' ?
  `%${formatNumber(dashboardDepartmentTotals.totalRate, 2)}` :
  `${formatNumber(dashboardDepartmentTotals.grandTotal)} dk`;

  const graphTotalSummary = departmentGraphMode === 'minutes' ?
  `${formatNumber(selectedDepartmentTotalValue)} dk` :
  `%${formatNumber(selectedDepartmentTotalValue, 2)}`;

  const graphTotalSummaryLabel = departmentGraphMode === 'minutes' ?
  `${selectedDepartmentLabel} toplam duruş süresi` :
  `${selectedDepartmentLabel} toplam duruş oranı`;

  const handleReset = () => {
    const activeMonthCandidate = normalizeMonthKey(imports?.activeMonth);
    const resetMonth =
      activeMonthCandidate && availableMonthKeys.includes(activeMonthCandidate) ?
      activeMonthCandidate :
      availableMonthKeys[0] || buildInitialDurusDisplayMonthKey();
    setSelectedMonth(resetMonth);
    setSelectedMachine('ALL');
    setSelectedDetailMachine(DETAIL_MACHINE_ALL);
    setSelectedDepartment('ALL');
    setSelectedShift('ALL');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>);

  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isParetoPage ? 'Pareto Analizi' : 'Duruş Analizi'}</h1>
          <p className="text-sm text-gray-600">
            {isParetoPage ?
            'Duruş verilerinden Pareto dağılımı ve %80 etki çizgisi izlenir.' :
            'Duruş verileri bu ekranda filtrelenip izlenir.'}
          </p>
          <div className="mt-3 inline-flex rounded-lg border border-gray-200 bg-white p-1 text-xs font-semibold">
            <NavLink
              to="/durus-analizi"
              className={({ isActive }) =>
              `rounded-md px-3 py-1.5 ${
              isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }>
              Duruş Analizi
            </NavLink>
            <NavLink
              to="/pareto-analizi"
              className={({ isActive }) =>
              `rounded-md px-3 py-1.5 ${
              isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }>
              Pareto Analizi
            </NavLink>
          </div>
        </div>
        <Link
          to="/ayarlar?tab=durusAnalizi"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-400">
          Ayarlar &gt; Duruş Analizi veri yükleme
        </Link>
      </div>

      {isError &&
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Duruş analizi verileri okunamadı.
        </div>
      }

      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="durus-year-filter" className="mb-1 block text-xs font-semibold text-gray-600">Yıl</label>
            <select id="durus-year-filter" className="input text-sm" value={selectedYearPart} onChange={(event) => handleDisplayYearChange(event.target.value)}>
              {DURUS_YEAR_OPTIONS.map((year) =>
              <option key={year} value={year}>{year}</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="durus-month-filter" className="mb-1 block text-xs font-semibold text-gray-600">Ay</label>
            <select id="durus-month-filter" className="input text-sm" value={selectedMonthPart} onChange={(event) => handleDisplayMonthChange(event.target.value)}>
              {DURUS_MONTH_PART_OPTIONS.map((monthOption) =>
              <option key={monthOption.value} value={monthOption.value}>{monthOption.label}</option>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button type="button" onClick={handleReset} className="btn btn-secondary w-full text-sm">Filtreleri Temizle</button>
          </div>
        </div>
      </div>

      {!hasData &&
      <div className="card p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Analiz verisi bulunamadı</h2>
          <p className="mt-2 text-sm text-gray-600">Seçili dönem: {selectedMonthLabel}. Önce Ayarlar &gt; Duruş Analizi alanından bu ay için Excel dosyalarını yükleyin.</p>
        </div>
      }

      {hasData &&
      <>
          {!isParetoPage &&
          <div className="card p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Tüm Makineler İçin Bölüm Duruş Grafiği
              </h2>
              <p className="text-xs text-gray-500">
                {graphDescription}
              </p>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                  Duruş Oranı (%)
                </div>

                <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 text-xs font-semibold">
                  <button
                  type="button"
                  onClick={() => setSelectedGraphDepartment('all')}
                  className={`rounded-md px-3 py-1.5 ${
                  selectedGraphDepartment === 'all' ?
                  'bg-gray-900 text-white' :
                  'text-gray-700 hover:bg-gray-100'}`
                  }>
                  
                    Tümü
                  </button>
                  <button
                  type="button"
                  onClick={() => setSelectedGraphDepartment('electrical')}
                  className={`rounded-md px-3 py-1.5 ${
                  selectedGraphDepartment === 'electrical' ?
                  'bg-amber-500 text-white' :
                  'text-gray-700 hover:bg-gray-100'}`
                  }>
                  
                    Elektrik
                  </button>
                  <button
                  type="button"
                  onClick={() => setSelectedGraphDepartment('mechanical')}
                  className={`rounded-md px-3 py-1.5 ${
                  selectedGraphDepartment === 'mechanical' ?
                  'bg-blue-500 text-white' :
                  'text-gray-700 hover:bg-gray-100'}`
                  }>
                  
                    Mekanik
                  </button>
                  <button
                  type="button"
                  onClick={() => setSelectedGraphDepartment('helper')}
                  className={`rounded-md px-3 py-1.5 ${
                  selectedGraphDepartment === 'helper' ?
                  'bg-emerald-500 text-white' :
                  'text-gray-700 hover:bg-gray-100'}`
                  }>
                  
                    Yardımcı
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                  <label htmlFor="durus-graph-sort" className="font-semibold">Sıralama</label>
                  <select
                  id="durus-graph-sort"
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                  value={departmentGraphSort}
                  onChange={(event) => setDepartmentGraphSort(event.target.value as DepartmentGraphSort)}>
                  
                    <option value="value_desc">Değer: Büyükten küçüğe</option>
                    <option value="value_asc">Değer: Küçükten büyüğe</option>
                    <option value="machine_asc">Makine: A-Z</option>
                    <option value="machine_desc">Makine: Z-A</option>
                  </select>
                </div>

                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                  <span className="font-semibold">{graphTotalSummaryLabel}:</span> {graphTotalSummary}
                </div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">Elektrik Bakım Toplam Duruş</p>
                <p className="mt-1 text-xl font-bold text-amber-800">
                  {electricalCardValue}
                </p>
                <p className="text-xs text-amber-700">{electricalCardSubValue}</p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs text-blue-700">Mekanik Bakım Toplam Duruş</p>
                <p className="mt-1 text-xl font-bold text-blue-800">
                  {mechanicalCardValue}
                </p>
                <p className="text-xs text-blue-700">{mechanicalCardSubValue}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Yardımcı Tesisler Toplam Duruş</p>
                <p className="mt-1 text-xl font-bold text-emerald-800">
                  {helperCardValue}
                </p>
                <p className="text-xs text-emerald-700">{helperCardSubValue}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-700">Bakım Toplam Duruş</p>
                <p className="mt-1 text-xl font-bold text-slate-800">
                  {maintenanceCardValue}
                </p>
                <p className="text-xs text-slate-700">{maintenanceCardSubValue}</p>
              </div>
            </div>

            <div className="mb-1 text-xs font-medium text-gray-600">
              Grafik görünümü: {selectedDepartmentLabel}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Elektrik Bakım
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Mekanik Bakım
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Yardımcı Tesisler
              </span>
            </div>

            <div className="space-y-3">
              {sortedMachineDepartmentDowntime.length === 0 &&
            <p className="text-sm text-gray-500">{graphEmptyMessage}</p>
            }

              {sortedMachineDepartmentDowntime.map((row) => {
              const totalValue = getMachineDepartmentValue(row, departmentGraphMode, selectedGraphDepartment);
              const scaledWidth = totalValue > 0 ?
              Math.max(4, totalValue / maxMachineDepartmentValue * 100) :
              0;
              const isCustomGroupRow = row.id.startsWith('custom:');

              const electricalSegmentWidth = departmentGraphMode === 'minutes' ?
              row.electricalShare :
              row.totalDepartmentDowntimeRate > 0 ?
              row.electricalDowntimeRate / row.totalDepartmentDowntimeRate * 100 :
              0;

              const mechanicalSegmentWidth = departmentGraphMode === 'minutes' ?
              row.mechanicalShare :
              row.totalDepartmentDowntimeRate > 0 ?
              row.mechanicalDowntimeRate / row.totalDepartmentDowntimeRate * 100 :
              0;

              const helperSegmentWidth = departmentGraphMode === 'minutes' ?
              row.helperShare :
              row.totalDepartmentDowntimeRate > 0 ?
              row.helperDowntimeRate / row.totalDepartmentDowntimeRate * 100 :
              0;

              const electricalTitle = departmentGraphMode === 'minutes' ?
              `Elektrik Bakım: ${formatNumber(row.electricalMinutes)} dk` :
              `Elektrik Bakım Oranı: %${formatNumber(row.electricalDowntimeRate, 2)}`;

              const mechanicalTitle = departmentGraphMode === 'minutes' ?
              `Mekanik Bakım: ${formatNumber(row.mechanicalMinutes)} dk` :
              `Mekanik Bakım Oranı: %${formatNumber(row.mechanicalDowntimeRate, 2)}`;

              const helperTitle = departmentGraphMode === 'minutes' ?
              `Yardımcı Tesisler: ${formatNumber(row.helperMinutes)} dk` :
              `Yardımcı Tesisler Oranı: %${formatNumber(row.helperDowntimeRate, 2)}`;

              const selectedDepartmentTitle = departmentGraphMode === 'minutes' ?
              `${selectedDepartmentLabel}: ${formatNumber(totalValue)} dk` :
              `${selectedDepartmentLabel} Oranı: %${formatNumber(totalValue, 2)}`;
              const customGroupTitle = `Özel Grup Oranı: %${formatNumber(totalValue, 2)}`;

              const selectedDepartmentColorClass = getDepartmentColorClass(selectedGraphDepartment);

              return (
                <div key={row.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{row.machine}</span>
                      <span className="text-gray-600">{formatNumber(totalValue, departmentGraphMode === 'minutes' ? 0 : 2)} {graphUnitLabel}</span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-gray-100">
                      <div className="flex h-4 overflow-hidden rounded-full" style={{ width: `${scaledWidth}%` }}>
                        {isCustomGroupRow ?
                      <div
                        className="bg-red-600"
                        style={{ width: '100%' }}
                        title={customGroupTitle} /> :

                      selectedGraphDepartment === 'all' ?
                      <>
                            <div
                          className="bg-amber-500"
                          style={{ width: `${electricalSegmentWidth}%` }}
                          title={electricalTitle} />
                        
                            <div
                          className="bg-blue-500"
                          style={{ width: `${mechanicalSegmentWidth}%` }}
                          title={mechanicalTitle} />
                        
                            <div
                          className="bg-emerald-500"
                          style={{ width: `${helperSegmentWidth}%` }}
                          title={helperTitle} />
                        
                          </> :

                      <div
                        className={selectedDepartmentColorClass}
                        style={{ width: '100%' }}
                        title={selectedDepartmentTitle} />

                      }
                      </div>
                    </div>
                  </div>);

            })}
            </div>
          </div>
          }

          {isParetoPage &&
          <section className="card p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pareto Analizi</h2>
                <p className="text-sm text-gray-600">
                  Bu bölümde barlar azalan sıralıdır, çizgi kümülatif yüzdeyi gösterir.
                </p>
              </div>
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
                Kesik kırmızı çizgi: %80 Pareto eşiği
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Seçili Makine Pareto (Duruş Nedeni)</h3>
                    <p className="text-xs text-gray-500">Seçilen makinede duruş süresini en çok oluşturan nedenler.</p>
                  </div>
                  <div className="grid w-full gap-3 md:w-[34rem] md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Makine Filtresi
                      </label>
                      <select
                        value={selectedDetailMachine}
                        onChange={(event) => setSelectedDetailMachine(event.target.value)}
                        className="input">
                        <option value={DETAIL_MACHINE_ALL}>Makine seçin</option>
                        <option value={DETAIL_MACHINE_ALL_PIPE}>Tüm Boru Makineleri</option>
                        {detailMachineOptions.map((machineName) =>
                        <option key={`pareto-${machineName}`} value={machineName}>{machineName}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Duruş Türü
                      </label>
                      <select
                        value={selectedDetailDepartmentFilter}
                        onChange={(event) => setSelectedDetailDepartmentFilter(event.target.value as DetailDowntimeDepartmentFilter)}
                        className="input">
                        <option value="all">Tümü</option>
                        <option value="electrical">Elektrik</option>
                        <option value="mechanical">Mekanik</option>
                        <option value="helper">Yardımcı Tesisler</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
                  %80 etki için ilk <span className="font-semibold">{selectedMachineParetoThresholdCount}</span> neden
                </div>

                <ParetoChart
                  rows={selectedMachineReasonParetoRows}
                  valueFractionDigits={0}
                  valueSuffix="dk"
                  emptyMessage={selectedDetailMachine === DETAIL_MACHINE_ALL ?
                  'Seçili makine paretosu için önce makine seçin.' :
                  'Seçili makine için pareto verisi bulunamadı.'}
                  barFill="#F59E0B"
                  selectedLabel={selectedParetoReason}
                  onSelectLabel={(label) => setSelectedParetoReason(label || '')} />

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-800">Seçili Makine Duruş Kayıtları</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Kayıtlar, Pareto filtresindeki seçili makine ve duruş türüne göre listelenir.
                  </p>
                  {selectedParetoReason &&
                  <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800">
                      Seçili duruş nedeni: <span className="font-semibold">{selectedParetoReason}</span> ({selectedParetoReasonMatchCount} kayıt)
                    </p>
                  }

                  <div className="mt-3 overflow-x-auto">
                    {selectedDetailMachine === DETAIL_MACHINE_ALL ?
                    <p className="text-sm text-gray-500">Kayıtları görmek için önce makine seçin.</p> :
                    paretoDetailRows.length === 0 ?
                    <p className="text-sm text-gray-500">Seçili makine ve duruş türü için kayıt bulunmuyor.</p> :

                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Sıra No</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Tarih/Saat</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Vardiya</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Bölüm</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Duruş Tanımı</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-600">Süre (dk)</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-600">Açıklama</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paretoDetailRows.map((item, index) => {
                      const isSelectedReason =
                        selectedParetoReason &&
                        String(item.reason || '').trim().toLocaleLowerCase('tr-TR') ===
                        selectedParetoReason.toLocaleLowerCase('tr-TR');

                      return (
                      <tr key={`pareto-row-${item.id}`} className={isSelectedReason ? 'bg-amber-50' : undefined}>
                              <td className="px-3 py-2 font-semibold text-gray-800">{index + 1}</td>
                              <td className="px-3 py-2 text-gray-700">{item.dateLabel}</td>
                              <td className="px-3 py-2 text-gray-700">{item.shift}</td>
                              <td className="px-3 py-2 text-gray-700">{item.department}</td>
                              <td className="px-3 py-2 font-medium text-gray-800">{item.reason}</td>
                              <td className="px-3 py-2 text-right text-gray-700">{formatNumber(item.minutes, 0)}</td>
                              <td className="px-3 py-2 text-gray-600">{item.note}</td>
                            </tr>
                      );
                    })}
                        </tbody>
                      </table>
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>
          }

          {!isParetoPage &&
          <section className="card p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Seçili Makine - Duruş Kayıtları</h2>
                <p className="mt-1 text-sm text-gray-600">
                  İSG sayfasındaki giderilmeyenler tablosu yapısında, seçilen makineye ait duruş kayıtları listelenir.
                </p>
              </div>
              <div className="grid w-full gap-3 md:w-[34rem] md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Makine Filtresi
                  </label>
                  <select
                  value={selectedDetailMachine}
                  onChange={(event) => setSelectedDetailMachine(event.target.value)}
                  className="input">
                    
                    <option value={DETAIL_MACHINE_ALL}>Makine seçin</option>
                    <option value={DETAIL_MACHINE_ALL_PIPE}>Tüm Boru Makineleri</option>
                    {detailMachineOptions.map((machineName) =>
                  <option key={machineName} value={machineName}>{machineName}</option>
                  )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Duruş Türü
                  </label>
                  <select
                  value={selectedDetailDepartmentFilter}
                  onChange={(event) => setSelectedDetailDepartmentFilter(event.target.value as DetailDowntimeDepartmentFilter)}
                  className="input">
                    
                    <option value="all">Tümü</option>
                    <option value="electrical">Elektrik</option>
                    <option value="mechanical">Mekanik</option>
                    <option value="helper">Yardımcı Tesisler</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {selectedDetailMachine === DETAIL_MACHINE_ALL ?
            <p className="text-sm text-gray-500">Aşağıda duruş kayıtlarını görmek için bir makine seçin.</p> :
            selectedMachineDetailRows.length === 0 ?
            <p className="text-sm text-gray-500">Seçili makine ve duruş türü için kayıt bulunmuyor.</p> :

            <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Sıra No</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Tarih/Saat</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Vardiya</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Bölüm</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Duruş Tanımı</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600">Süre (dk)</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedMachineDetailRows.map((item, index) =>
                <tr key={item.id}>
                        <td className="px-3 py-2 font-semibold text-gray-800">{index + 1}</td>
                        <td className="px-3 py-2 text-gray-700">{item.dateLabel}</td>
                        <td className="px-3 py-2 text-gray-700">{item.shift}</td>
                        <td className="px-3 py-2 text-gray-700">{item.department}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">{item.reason}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatNumber(item.minutes, 0)}</td>
                        <td className="px-3 py-2 text-gray-600">{item.note}</td>
                      </tr>
                )}
                  </tbody>
                </table>
            }
            </div>
          </section>
          }
        </>
      }
    </div>);

}

