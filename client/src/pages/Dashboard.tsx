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
  TrendingUp
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardSummary, ShiftCompletionStats } from '../types';

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
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ShiftCard({
  shift,
  personnel,
  workOrders
}: {
  shift: { vardiyaAdi: string; baslangicSaati: string; bitisSaati: string; renk: string };
  personnel: number;
  workOrders: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    completionRate: number;
  };
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: shift.renk }}
          />
          <h3 className="font-semibold text-gray-900">{shift.vardiyaAdi}</h3>
        </div>
        <span className="text-sm text-gray-500">
          {shift.baslangicSaati} - {shift.bitisSaati}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{personnel}</p>
          <p className="text-xs text-gray-500">Personel</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{workOrders.total}</p>
          <p className="text-xs text-gray-500">İş Emri</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tamamlanma Oranı</span>
          <span className="font-medium text-gray-900">{workOrders.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${workOrders.completionRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center">
          <span className="badge badge-warning">{workOrders.pending}</span>
          <p className="text-xs text-gray-500 mt-1">Bekliyor</p>
        </div>
        <div className="text-center">
          <span className="badge badge-info">{workOrders.inProgress}</span>
          <p className="text-xs text-gray-500 mt-1">Devam</p>
        </div>
        <div className="text-center">
          <span className="badge badge-success">{workOrders.completed}</span>
          <p className="text-xs text-gray-500 mt-1">Tamam</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await dashboardApi.getSummary();
      return response.data.data as DashboardSummary;
    }
  });

  const { data: shiftCompletion, isLoading: shiftLoading } = useQuery({
    queryKey: ['shift-completion', today],
    queryFn: async () => {
      const response = await dashboardApi.getShiftCompletion(today);
      return response.data.data as ShiftCompletionStats;
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Bugünkü İş Emirleri"
          value={summary?.workOrders.today.toplam || 0}
          subtitle={`${summary?.workOrders.today.tamamlandi || 0} tamamlandı`}
          icon={ClipboardList}
          color="bg-purple-500"
        />
        <StatCard
          title="Periyodik Bakım"
          value={summary?.preventiveMaintenance.upcoming || 0}
          subtitle={`${summary?.preventiveMaintenance.overdue || 0} gecikmiş`}
          icon={Wrench}
          color="bg-orange-500"
        />
      </div>

      {/* Alerts */}
      {(summary?.preventiveMaintenance.overdue || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <p className="font-medium text-red-800">Gecikmiş Bakımlar</p>
            <p className="text-sm text-red-600">
              {summary?.preventiveMaintenance.overdue} adet periyodik bakım gecikmiş durumda
            </p>
          </div>
        </div>
      )}

      {/* Shift Completion */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Vardiya Bazlı İş Emri Durumu
        </h2>
        {shiftLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shiftCompletion?.shifts.map((item) => (
              <ShiftCard
                key={item.shift.id}
                shift={item.shift}
                personnel={item.personnel}
                workOrders={item.workOrders}
              />
            ))}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bu Ay İş Emri Durumu
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-600">Beklemede</span>
              </div>
              <span className="font-semibold">
                {summary?.workOrders.monthly.beklemede || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">Devam Ediyor</span>
              </div>
              <span className="font-semibold">
                {summary?.workOrders.monthly.devamEdiyor || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-600">Tamamlandı</span>
              </div>
              <span className="font-semibold">
                {summary?.workOrders.monthly.tamamlandi || 0}
              </span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Toplam</span>
              <span className="font-bold text-xl">
                {summary?.workOrders.monthly.toplam || 0}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performans Göstergeleri
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tamamlanma Oranı</span>
                <span className="font-medium">{kpis?.completionRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${kpis?.completionRate || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">PB Uyum Oranı</span>
                <span className="font-medium">{kpis?.pmComplianceRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${kpis?.pmComplianceRate || 0}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Ort. Tamamlanma Süresi</span>
                <span className="font-semibold">
                  {kpis?.avgCompletionTime || 0} dk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
