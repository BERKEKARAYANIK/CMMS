import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ClipboardList,
  Wrench,
  AlertTriangle,
  Zap,
  Building2,
  Shield
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardSummary } from '../types';

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

const ISG_DEPARTMENT_KPIS: IsgDepartmentKpi[] = [
  {
    id: 'elektrik-ana-bina',
    name: 'Elektrik Bakim Ana Bina',
    accidents: 1,
    nonComplianceRate: 12,
    crossAuditRate: 88,
    icon: Zap,
    accent: 'bg-yellow-500'
  },
  {
    id: 'elektrik-ek-bina',
    name: 'Elektrik Bakim Ek Bina',
    accidents: 1,
    nonComplianceRate: 15,
    crossAuditRate: 84,
    icon: Zap,
    accent: 'bg-amber-500'
  },
  {
    id: 'mekanik',
    name: 'Mekanik',
    accidents: 1,
    nonComplianceRate: 9,
    crossAuditRate: 91,
    icon: Wrench,
    accent: 'bg-blue-500'
  },
  {
    id: 'yardimci-tesisler',
    name: 'Yardimci Tesisler',
    accidents: 0,
    nonComplianceRate: 6,
    crossAuditRate: 95,
    icon: Building2,
    accent: 'bg-emerald-500'
  }
];

const DEPARTMENT_DOWNTIME_KPIS: DepartmentDowntimeKpi[] = [
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

      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Mevcut Seviye</p>
        <p className="mt-2 text-4xl font-bold text-emerald-700">{item.currentLevel}</p>
        <p className="mt-2 text-xs text-emerald-700">Tum bolumler icin 3S tanimli</p>
      </div>
    </div>
  );
}

function DepartmentIsgCard({ item }: { item: IsgDepartmentKpi }) {
  const Icon = item.icon;
  const score = Math.max(
    0,
    Math.min(100, Math.round((100 - item.nonComplianceRate + item.crossAuditRate) / 2))
  );

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${item.accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500">ISG KPI</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          Skor {score}
        </span>
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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${item.accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500">Durus KPI</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {item.monthlyDowntimeMinutes} dk/ay
        </span>
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
          {DEPARTMENT_FIVE_S.map((item) => (
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
          {ISG_DEPARTMENT_KPIS.map((item) => (
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Durus KPI Pano - Elektrik Ana Bina / Elektrik Ek Bina / Mekanik / Yardimci Tesisler
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DEPARTMENT_DOWNTIME_KPIS.map((item) => (
            <DepartmentDowntimeCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
