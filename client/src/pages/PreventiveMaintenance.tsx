import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Plus, Calendar, AlertTriangle, CheckCircle, Play, Clock } from 'lucide-react';
import { preventiveMaintenanceApi, equipmentApi } from '../services/api';
import type { PreventiveMaintenance, Equipment, PeriyotTipi, Departman } from '../types';
import { PeriyotTipiLabels, DepartmanLabels } from '../types';

const periyotOptions: PeriyotTipi[] = ['GUNLUK', 'HAFTALIK', 'AYLIK', 'UC_AYLIK', 'ALTI_AYLIK', 'YILLIK'];
const departmanOptions: Departman[] = ['MEKANIK', 'ELEKTRIK', 'YARDIMCI_ISLETMELER'];

interface PMFormData {
  planAdi: string;
  equipmentId: string;
  periyotTipi: PeriyotTipi;
  periyotDegeri: number;
  sonrakiTarih: string;
  talimatlar: string;
  tahminiSure: string;
  sorumluDepartman: Departman | '';
}

function PMModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  equipment
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PMFormData) => void;
  isLoading: boolean;
  equipment: Equipment[];
}) {
  const [formData, setFormData] = useState<PMFormData>({
    planAdi: '',
    equipmentId: '',
    periyotTipi: 'AYLIK',
    periyotDegeri: 1,
    sonrakiTarih: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    talimatlar: '',
    tahminiSure: '',
    sorumluDepartman: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Yeni Periyodik Bakım Planı</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="label">Plan Adı</label>
              <input
                type="text"
                value={formData.planAdi}
                onChange={(e) => setFormData({ ...formData, planAdi: e.target.value })}
                className="input"
                required
                placeholder="Aylık Kompresör Bakımı"
              />
            </div>

            <div>
              <label className="label">Ekipman</label>
              <select
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="input"
                required
              >
                <option value="">Seçiniz</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.ekipmanKodu} - {eq.ekipmanAdi}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Periyot Tipi</label>
                <select
                  value={formData.periyotTipi}
                  onChange={(e) => setFormData({ ...formData, periyotTipi: e.target.value as PeriyotTipi })}
                  className="input"
                >
                  {periyotOptions.map((p) => (
                    <option key={p} value={p}>{PeriyotTipiLabels[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Periyot Değeri</label>
                <input
                  type="number"
                  value={formData.periyotDegeri}
                  onChange={(e) => setFormData({ ...formData, periyotDegeri: parseInt(e.target.value) })}
                  className="input"
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">İlk Bakım Tarihi</label>
                <input
                  type="date"
                  value={formData.sonrakiTarih}
                  onChange={(e) => setFormData({ ...formData, sonrakiTarih: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Sorumlu Departman</label>
                <select
                  value={formData.sorumluDepartman}
                  onChange={(e) => setFormData({ ...formData, sorumluDepartman: e.target.value as Departman })}
                  className="input"
                >
                  <option value="">Seçiniz</option>
                  {departmanOptions.map((d) => (
                    <option key={d} value={d}>{DepartmanLabels[d]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Tahmini Süre (dakika)</label>
              <input
                type="number"
                value={formData.tahminiSure}
                onChange={(e) => setFormData({ ...formData, tahminiSure: e.target.value })}
                className="input"
                placeholder="60"
              />
            </div>

            <div>
              <label className="label">Talimatlar</label>
              <textarea
                value={formData.talimatlar}
                onChange={(e) => setFormData({ ...formData, talimatlar: e.target.value })}
                className="input"
                rows={4}
                placeholder="Bakım talimatları..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PMCard({
  pm,
  onGenerateWorkOrder
}: {
  pm: PreventiveMaintenance;
  onGenerateWorkOrder: (id: number) => void;
}) {
  const isOverdue = new Date(pm.sonrakiTarih) < new Date();
  const daysUntil = Math.ceil(
    (new Date(pm.sonrakiTarih).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`card p-4 ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{pm.planAdi}</h3>
          <p className="text-sm text-gray-500">
            {pm.equipment?.ekipmanKodu} - {pm.equipment?.ekipmanAdi}
          </p>
        </div>
        {isOverdue ? (
          <span className="badge badge-danger">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Gecikmiş
          </span>
        ) : (
          <span className="badge badge-info">
            <Clock className="w-3 h-3 mr-1" />
            {daysUntil} gün
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <span className="text-gray-500">Periyot:</span>
          <span className="ml-1 font-medium">{PeriyotTipiLabels[pm.periyotTipi]}</span>
        </div>
        <div>
          <span className="text-gray-500">Sonraki:</span>
          <span className="ml-1 font-medium">
            {format(new Date(pm.sonrakiTarih), 'dd MMM yyyy', { locale: tr })}
          </span>
        </div>
        {pm.tahminiSure && (
          <div>
            <span className="text-gray-500">Süre:</span>
            <span className="ml-1 font-medium">{pm.tahminiSure} dk</span>
          </div>
        )}
        {pm.sorumluDepartman && (
          <div>
            <span className="text-gray-500">Departman:</span>
            <span className="ml-1 font-medium">{DepartmanLabels[pm.sorumluDepartman]}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onGenerateWorkOrder(pm.id)}
        className="btn btn-primary w-full text-sm"
      >
        <Play className="w-4 h-4 mr-2" />
        İş Emri Oluştur
      </button>
    </div>
  );
}

export default function PreventiveMaintenancePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');
  const queryClient = useQueryClient();

  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['pm-upcoming'],
    queryFn: async () => {
      const response = await preventiveMaintenanceApi.getUpcoming(30);
      return response.data.data as {
        upcoming: PreventiveMaintenance[];
        overdue: PreventiveMaintenance[];
        stats: { upcomingCount: number; overdueCount: number };
      };
    }
  });

  const { data: allPM, isLoading: allLoading } = useQuery({
    queryKey: ['pm-all'],
    queryFn: async () => {
      const response = await preventiveMaintenanceApi.getAll();
      return response.data.data as PreventiveMaintenance[];
    },
    enabled: activeTab === 'all'
  });

  const { data: equipment } = useQuery({
    queryKey: ['equipment-list'],
    queryFn: async () => {
      const response = await equipmentApi.getAll();
      return response.data.data as Equipment[];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: PMFormData) => preventiveMaintenanceApi.create(data),
    onSuccess: () => {
      toast.success('Bakım planı oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['pm-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['pm-all'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  });

  const generateMutation = useMutation({
    mutationFn: (id: number) => preventiveMaintenanceApi.generateWorkOrder(id, {}),
    onSuccess: () => {
      toast.success('İş emri oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['pm-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'İş emri oluşturulamadı');
    }
  });

  const isLoading = activeTab === 'upcoming' ? upcomingLoading : allLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Periyodik Bakım</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Plan
        </button>
      </div>

      {/* Stats */}
      {upcomingData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center">
            <div className="p-3 rounded-xl bg-red-100 mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingData.stats.overdueCount}</p>
              <p className="text-sm text-gray-500">Gecikmiş Bakım</p>
            </div>
          </div>
          <div className="card p-4 flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingData.stats.upcomingCount}</p>
              <p className="text-sm text-gray-500">Yaklaşan (30 gün)</p>
            </div>
          </div>
          <div className="card p-4 flex items-center">
            <div className="p-3 rounded-xl bg-green-100 mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allPM?.filter(p => p.aktif).length || '-'}</p>
              <p className="text-sm text-gray-500">Aktif Plan</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Yaklaşan Bakımlar
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tüm Planlar
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : activeTab === 'upcoming' ? (
        <div className="space-y-6">
          {/* Overdue */}
          {upcomingData?.overdue && upcomingData.overdue.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Gecikmiş Bakımlar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingData.overdue.map((pm) => (
                  <PMCard
                    key={pm.id}
                    pm={pm}
                    onGenerateWorkOrder={(id) => generateMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingData?.upcoming && upcomingData.upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Yaklaşan Bakımlar (30 gün içinde)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingData.upcoming.map((pm) => (
                  <PMCard
                    key={pm.id}
                    pm={pm}
                    onGenerateWorkOrder={(id) => generateMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {!upcomingData?.overdue?.length && !upcomingData?.upcoming?.length && (
            <div className="text-center py-12 text-gray-500">
              Yaklaşan veya gecikmiş bakım bulunmuyor
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPM?.map((pm) => (
            <PMCard
              key={pm.id}
              pm={pm}
              onGenerateWorkOrder={(id) => generateMutation.mutate(id)}
            />
          ))}
          {allPM?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Bakım planı bulunmuyor
            </div>
          )}
        </div>
      )}

      <PMModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        equipment={equipment || []}
      />
    </div>
  );
}
