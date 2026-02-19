import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Settings,
  Users,
  ClipboardList,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Building2,
  Shield
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardSummary } from '../types';

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
  totalDowntimeRate: number;
  unplannedDowntimeRate: number;
  plannedDowntimeRate: number;
  mttrMinutes: number;
  mtbfHours: number;
  monthlyDowntimeMinutes: number;
};

const ISG_DEPARTMENT_KPIS: IsgDepartmentKpi[] = [
  {
    id: 'elektrik',
    name: 'Elektrik',
    accidents: 2,
    nonComplianceRate: 14,
    crossAuditRate: 86,
    icon: Zap,
    accent: 'bg-yellow-500'
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
    id: 'elektrik',
    name: 'Elektrik',
    icon: Zap,
    accent: 'bg-yellow-500',
    totalDowntimeRate: 13.2,
    unplannedDowntimeRate: 8.4,
    plannedDowntimeRate: 4.8,
    mttrMinutes: 58,
    mtbfHours: 34,
    monthlyDowntimeMinutes: 410
  },
  {
    id: 'mekanik',
    name: 'Mekanik',
    icon: Wrench,
    accent: 'bg-blue-500',
    totalDowntimeRate: 11.1,
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
    totalDowntimeRate: 7.8,
    unplannedDowntimeRate: 4.1,
    plannedDowntimeRate: 3.7,
    mttrMinutes: 39,
    mtbfHours: 57,
    monthlyDowntimeMinutes: 175
  }
];

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  fillClass
}: {
  label: string;
  value: number;
  fillClass: string;
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">%{safeValue}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-2.5 rounded-full transition-all ${fillClass}`}
          style={{ width: `${safeValue}%` }}
        />
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
          %{Math.round(item.totalDowntimeRate)}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-red-700">Toplam Durus</p>
          <p className="mt-1 text-lg font-bold text-red-700">%{item.totalDowntimeRate}</p>
        </div>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-orange-700">Plansiz</p>
          <p className="mt-1 text-lg font-bold text-orange-700">%{item.unplannedDowntimeRate}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-center">
          <p className="text-[10px] font-semibold uppercase text-blue-700">Planli</p>
          <p className="mt-1 text-lg font-bold text-blue-700">%{item.plannedDowntimeRate}</p>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar label="Toplam Durus Orani" value={item.totalDowntimeRate} fillClass="bg-red-500" />
        <ProgressBar label="Plansiz Durus Orani" value={item.unplannedDowntimeRate} fillClass="bg-orange-500" />
        <ProgressBar label="Planli Durus Orani" value={item.plannedDowntimeRate} fillClass="bg-blue-500" />
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

  const { data: kpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const response = await dashboardApi.getKPIs('month');
      return response.data.data;
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Ekipman"
          value={summary?.equipment.total || 0}
          subtitle={`${summary?.equipment.active || 0} aktif`}
          icon={Settings}
          color="bg-blue-500"
        />
        <StatCard
          title="Personel"
          value={summary?.personnel.total || 0}
          subtitle="Aktif personel"
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Bugunku Is Emirleri"
          value={summary?.workOrders.today.toplam || 0}
          subtitle={`${summary?.workOrders.today.tamamlandi || 0} tamamlandi`}
          icon={ClipboardList}
          color="bg-purple-500"
        />
        <StatCard
          title="Periyodik Bakim"
          value={summary?.preventiveMaintenance.upcoming || 0}
          subtitle={`${summary?.preventiveMaintenance.overdue || 0} gecikmis`}
          icon={Wrench}
          color="bg-orange-500"
        />
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            ISG KPI Pano - Elektrik / Mekanik / Yardimci Tesisler
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
          Durus KPI Pano - Elektrik / Mekanik / Yardimci Tesisler
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DEPARTMENT_DOWNTIME_KPIS.map((item) => (
            <DepartmentDowntimeCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Bu Ay Is Emri Durumu</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="text-gray-600">Beklemede</span>
              </div>
              <span className="font-semibold">{summary?.workOrders.monthly.beklemede || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-gray-600">Devam Ediyor</span>
              </div>
              <span className="font-semibold">{summary?.workOrders.monthly.devamEdiyor || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-gray-600">Tamamlandi</span>
              </div>
              <span className="font-semibold">{summary?.workOrders.monthly.tamamlandi || 0}</span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Toplam</span>
              <span className="text-xl font-bold">{summary?.workOrders.monthly.toplam || 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Performans Gostergeleri</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">Tamamlanma Orani</span>
                <span className="font-medium">%{kpis?.completionRate || 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${kpis?.completionRate || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">PB Uyum Orani</span>
                <span className="font-medium">%{kpis?.pmComplianceRate || 0}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${kpis?.pmComplianceRate || 0}%` }}
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Ort. Tamamlanma Suresi</span>
                <span className="font-semibold">{kpis?.avgCompletionTime || 0} dk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
