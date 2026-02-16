import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Clock, CheckCircle, Users, Settings } from 'lucide-react';
import { dashboardApi } from '../services/api';

type Period = 'week' | 'month' | 'year';

export default function Reports() {
  const [period, setPeriod] = useState<Period>('month');

  const { data: kpis } = useQuery({
    queryKey: ['kpis', period],
    queryFn: async () => {
      const response = await dashboardApi.getKPIs(period);
      return response.data.data;
    }
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await dashboardApi.getSummary();
      return response.data.data;
    }
  });

  const { data: shiftCompletion } = useQuery({
    queryKey: ['shift-completion-today'],
    queryFn: async () => {
      const response = await dashboardApi.getShiftCompletion();
      return response.data.data;
    }
  });

  const periodLabels: Record<Period, string> = {
    week: 'Son 7 Gün',
    month: 'Bu Ay',
    year: 'Bu Yıl'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">{periodLabels[period]}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis?.completionRate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Tamamlanma Oranı</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${kpis?.completionRate || 0}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">{periodLabels[period]}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis?.avgCompletionTime || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Ort. Tamamlanma Süresi (dk)</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">{periodLabels[period]}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis?.pmComplianceRate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">PB Uyum Oranı</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${kpis?.pmComplianceRate || 0}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">{periodLabels[period]}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis?.totalWorkOrders || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Toplam İş Emri</p>
          <p className="text-xs text-green-600 mt-1">
            {kpis?.completedWorkOrders || 0} tamamlandı
          </p>
        </div>
      </div>

      {/* Shift Performance */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Vardiya Performansı (Bugün)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Vardiya</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Personel</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Toplam İş Emri</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Tamamlanan</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Devam Eden</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Tamamlanma %</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Ort. Süre</th>
              </tr>
            </thead>
            <tbody>
              {shiftCompletion?.shifts?.map((item: any) => (
                <tr key={item.shift.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.shift.renk }}
                      />
                      <span className="font-medium">{item.shift.vardiyaAdi}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.shift.baslangicSaati} - {item.shift.bitisSaati})
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">{item.personnel}</td>
                  <td className="text-center py-3 px-4 font-semibold">{item.workOrders.total}</td>
                  <td className="text-center py-3 px-4">
                    <span className="badge badge-success">{item.workOrders.completed}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="badge badge-warning">{item.workOrders.inProgress}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${item.workOrders.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.workOrders.completionRate}%</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">
                    {item.workOrders.avgCompletionTime} dk
                  </td>
                </tr>
              ))}
              {(!shiftCompletion?.shifts || shiftCompletion.shifts.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Bugün için veri bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Work Orders */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Bu Ay İş Emri Dağılımı</h2>
          <div className="space-y-4">
            {[
              { label: 'Beklemede', value: summary?.workOrders?.monthly?.beklemede || 0, color: 'bg-gray-500' },
              { label: 'Atandı', value: summary?.workOrders?.monthly?.atandi || 0, color: 'bg-blue-500' },
              { label: 'Devam Ediyor', value: summary?.workOrders?.monthly?.devamEdiyor || 0, color: 'bg-yellow-500' },
              { label: 'Tamamlandı', value: summary?.workOrders?.monthly?.tamamlandi || 0, color: 'bg-green-500' },
              { label: 'İptal', value: summary?.workOrders?.monthly?.iptal || 0, color: 'bg-red-500' }
            ].map((item) => {
              const total = summary?.workOrders?.monthly?.toplam || 1;
              const percentage = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment & Personnel Summary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Genel Durum</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <Settings className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Toplam Ekipman</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary?.equipment?.total || 0}</p>
              <p className="text-sm text-green-600">{summary?.equipment?.active || 0} aktif</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Toplam Personel</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary?.personnel?.total || 0}</p>
              <p className="text-sm text-gray-500">Aktif personel</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Yaklaşan PB</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.preventiveMaintenance?.upcoming || 0}
              </p>
              <p className="text-sm text-gray-500">7 gün içinde</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Gecikmiş PB</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {summary?.preventiveMaintenance?.overdue || 0}
              </p>
              <p className="text-sm text-red-500">Dikkat gerektiriyor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
