import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ClipboardList,
  Wrench,
  AlertTriangle,
  Zap,
  Building2,
  Shield,
  Star
} from 'lucide-react';
import { appStateApi, dashboardApi } from '../services/api';
import type { DashboardSummary } from '../types';
import {
  APP_STATE_KEYS,
  normalizeDashboardFiveSLevels,
  type DashboardFiveSLevelsState
} from '../constants/appState';
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
  mttrMinutes: number;
  mtbfHours: number;
  monthlyDowntimeMinutes: number;
};

const getCurrentMonthKey = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const normalizeMonthKey = (value: string): string => {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : getCurrentMonthKey();
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const DASHBOARD_ISG_YEAR: IsgYearKey = '2026';

const normalizeDepartmentText = (value: string): string =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const matchesDepartmentByAliases = (department: string, aliases: string[]): boolean => {
  const normalizedDepartment = normalizeDepartmentText(department);
  return aliases.some((alias) => {
    const normalizedAlias = normalizeDepartmentText(alias);
    return (
      normalizedDepartment === normalizedAlias
      || normalizedDepartment.includes(normalizedAlias)
      || normalizedAlias.includes(normalizedDepartment)
    );
  });
};

const DEPARTMENT_FIVE_S: DepartmentFiveS[] = [
  {
    id: 'elektrik-ana-bina',
    name: 'Elektrik Bakim Ana Bina',
    currentLevel: '3S',
    icon: Zap,
    accent: 'bg-yellow-500'
  },
  {
    id: 'elektrik-ek-bina',
    name: 'Elektrik Bakim Ek Bina',
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
    name: 'Yardimci Tesisler',
    currentLevel: '3S',
    icon: Building2,
    accent: 'bg-emerald-500'
  }
];

const ISG_DEPARTMENT_KPI_DEFINITIONS: IsgDepartmentKpiDefinition[] = [
  {
    id: 'elektrik-ana-bina',
    name: 'Elektrik Bakim Ana Bina',
    accidents: 1,
    icon: Zap,
    accent: 'bg-yellow-500',
    uygunsuzlukDepartmentAliases: ['E.BAKIM-1', 'E BAKIM 1', 'ELEKTRIK BAKIM ANA BINA'],
    caprazDepartmentAliases: ['E. BAKIM', 'E BAKIM', 'ELEKTRIK BAKIM']
  },
  {
    id: 'elektrik-ek-bina',
    name: 'Elektrik Bakim Ek Bina',
    accidents: 1,
    icon: Zap,
    accent: 'bg-amber-500',
    uygunsuzlukDepartmentAliases: ['E.BAKIM-2', 'E BAKIM 2', 'ELEKTRIK BAKIM EK BINA'],
    caprazDepartmentAliases: ['E. BAKIM', 'E BAKIM', 'ELEKTRIK BAKIM']
  },
  {
    id: 'mekanik',
    name: 'Mekanik',
    accidents: 1,
    icon: Wrench,
    accent: 'bg-blue-500',
    uygunsuzlukDepartmentAliases: ['M. BAKIM', 'M BAKIM', 'MEKANIK BAKIM'],
    caprazDepartmentAliases: ['M. BAKIM', 'M BAKIM', 'MEKANIK BAKIM']
  },
  {
    id: 'yardimci-tesisler',
    name: 'Yardimci Tesisler',
    accidents: 0,
    icon: Building2,
    accent: 'bg-emerald-500',
    uygunsuzlukDepartmentAliases: ['Y. TESISLER', 'Y TESISLER', 'YARDIMCI TESISLER'],
    caprazDepartmentAliases: ['Y. TESISLER', 'Y TESISLER', 'YARDIMCI TESISLER']
  }
];

const BASE_DEPARTMENT_DOWNTIME_KPIS: DepartmentDowntimeKpi[] = [
  {
    id: 'elektrik-ana-bina',
    name: 'Elektrik Bakim Ana Bina',
    icon: Zap,
    accent: 'bg-yellow-500',
    unplannedDowntimeRate: 6.1,
    plannedDowntimeRate: 3.5,
    mttrMinutes: 52,
    mtbfHours: 38,
    monthlyDowntimeMinutes: 290
  },
  {
    id: 'elektrik-ek-bina',
    name: 'Elektrik Bakim Ek Bina',
    icon: Zap,
    accent: 'bg-amber-500',
    unplannedDowntimeRate: 4.9,
    plannedDowntimeRate: 2.6,
    mttrMinutes: 45,
    mtbfHours: 46,
    monthlyDowntimeMinutes: 215
  },
  {
    id: 'mekanik',
    name: 'Mekanik',
    icon: Wrench,
    accent: 'bg-blue-500',
    unplannedDowntimeRate: 7.2,
    plannedDowntimeRate: 3.9,
    mttrMinutes: 49,
    mtbfHours: 41,
    monthlyDowntimeMinutes: 335
  },
  {
    id: 'yardimci-tesisler',
    name: 'Yardimci Tesisler',
    icon: Building2,
    accent: 'bg-emerald-500',
    unplannedDowntimeRate: 4.1,
    plannedDowntimeRate: 3.7,
    mttrMinutes: 39,
    mtbfHours: 57,
    monthlyDowntimeMinutes: 175
  }
];

const getDowntimeKpisByMonth = (monthKey: string): DepartmentDowntimeKpi[] => {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const month = Number(normalizedMonth.split('-')[1]);
  const monthOffset = month - 6.5;

  return BASE_DEPARTMENT_DOWNTIME_KPIS.map((item, index) => {
    const unplannedDelta = monthOffset * 0.08 + index * 0.03;
    const plannedDelta = monthOffset * 0.05 - index * 0.01;
    const monthlyDelta = monthOffset * 11 + index * 6;
    const mttrDelta = monthOffset * 0.9;
    const mtbfDelta = monthOffset * -1.1;

    return {
      ...item,
      unplannedDowntimeRate: Number(clamp(item.unplannedDowntimeRate + unplannedDelta, 0.5, 9.99).toFixed(2)),
      plannedDowntimeRate: Number(clamp(item.plannedDowntimeRate + plannedDelta, 0.5, 99.99).toFixed(2)),
      mttrMinutes: Math.round(clamp(item.mttrMinutes + mttrDelta, 10, 240)),
      mtbfHours: Math.round(clamp(item.mtbfHours + mtbfDelta, 1, 240)),
      monthlyDowntimeMinutes: Math.round(clamp(item.monthlyDowntimeMinutes + monthlyDelta, 30, 1000))
    };
  });
};

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
}: {
  label: string;
  value: number;
  fillClass: string;
  maxValue?: number;
  valueDisplay?: 'percent' | 'ratio' | 'rawPercent';
}) {
  const safeValue = Math.max(0, Math.min(maxValue, value));
  const safeWidth = maxValue > 0 ? (safeValue / maxValue) * 100 : 0;
  const normalizedPercent = maxValue > 0 ? (safeValue / maxValue) * 100 : 0;
  const formattedValue = safeValue.toFixed(2).replace('.', ',');

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">
          {valueDisplay === 'ratio'
            ? `${formattedValue}/${maxValue}`
            : valueDisplay === 'rawPercent'
              ? `%${formattedValue}`
              : `%${Math.round(normalizedPercent)}`}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-2.5 rounded-full transition-all ${fillClass}`}
          style={{ width: `${safeWidth}%` }}
        />
      </div>
    </div>
  );
}

function DepartmentFiveSCard({ item }: { item: DepartmentFiveS }) {
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
            <p className="text-xs text-gray-500">5S Calismasi</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          Hedef 5S
        </span>
      </div>

      <div className={`relative rounded-xl border p-4 text-center ${fiveSVisual.panelClass}`}>
        {fiveSVisual.showStar && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-100 p-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </span>
        )}
        <p className={`text-xs font-medium uppercase tracking-wide ${fiveSVisual.textClass}`}>Mevcut Seviye</p>
        <p className={`mt-2 text-4xl font-bold ${fiveSVisual.textClass}`}>{item.currentLevel}</p>
      </div>
    </div>
  );
}

function DepartmentIsgCard({ item }: { item: IsgDepartmentKpi }) {
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
            <p className="text-xs text-gray-500">ISG KPI</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-red-700">ISG Kaza Sayisi</p>
        <p className="mt-1 text-3xl font-bold text-red-700">{item.accidents}</p>
      </div>

      <div className="space-y-3">
        <ProgressBar label="ISG Uygunsuzluk Yuzdesi" value={item.nonComplianceRate} fillClass="bg-amber-500" />
        <ProgressBar label="ISG Capraz Denetim Yuzdesi" value={item.crossAuditRate} fillClass="bg-emerald-500" />
      </div>
    </div>
  );
}

function DepartmentDowntimeCard({ item }: { item: DepartmentDowntimeKpi }) {
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
            <p className="text-xs text-gray-500">Durus KPI</p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-orange-700">Plansiz Bakim Orani</p>
          <p className="mt-1 text-lg font-bold text-orange-700">
            %{item.unplannedDowntimeRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-blue-700">Planli Bakim Orani</p>
          <p className="mt-1 text-lg font-bold text-blue-700">
            %{item.plannedDowntimeRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar
          label="Plansiz Bakim Orani"
          value={item.unplannedDowntimeRate}
          fillClass="bg-orange-500"
          maxValue={10}
          valueDisplay="rawPercent"
        />
        <ProgressBar
          label="Planli Bakim Orani"
          value={item.plannedDowntimeRate}
          fillClass="bg-blue-500"
          maxValue={100}
          valueDisplay="rawPercent"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500">MTTR</p>
          <p className="font-semibold text-gray-900">{item.mttrMinutes} dk</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500">MTBF</p>
          <p className="font-semibold text-gray-900">{item.mtbfHours} saat</p>
        </div>
        <div className="col-span-2 rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500">Aylik Durus Suresi</p>
          <p className="font-semibold text-gray-900">{item.monthlyDowntimeMinutes} dk</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedDowntimeMonth, setSelectedDowntimeMonth] = useState<string>(() => getCurrentMonthKey());

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

  const downtimeKpis = useMemo(
    () => getDowntimeKpisByMonth(selectedDowntimeMonth),
    [selectedDowntimeMonth]
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
      const crossAuditRate = caprazDepartment && caprazDepartment.total > 0
        ? Number((((caprazDepartment.total - caprazDepartment.missing) / caprazDepartment.total) * 100).toFixed(2))
        : 0;

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
      </div>
    );
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
            5S Calismasi - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardimci Tesisler
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {departmentFiveS.map((item) => (
            <DepartmentFiveSCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            ISG KPI Pano - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardimci Tesisler
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isgDepartmentKpis.map((item) => (
            <DepartmentIsgCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {(summary?.preventiveMaintenance.overdue || 0) > 0 && (
        <div className="flex items-center rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mr-3 h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Gecikmis Bakimlar</p>
            <p className="text-sm text-red-600">
              {summary?.preventiveMaintenance.overdue} adet periyodik bakim gecikmis durumda
            </p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Durus KPI Pano - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardimci Tesisler
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="downtime-month" className="text-sm text-gray-600">
              Ay Secimi
            </label>
            <input
              id="downtime-month"
              type="month"
              value={selectedDowntimeMonth}
              onChange={(event) => setSelectedDowntimeMonth(normalizeMonthKey(event.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-500">Secilen ay: {selectedDowntimeMonthLabel}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {downtimeKpis.map((item) => (
            <DepartmentDowntimeCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
