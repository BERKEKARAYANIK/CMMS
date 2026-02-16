import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Settings } from 'lucide-react';
import { equipmentApi } from '../services/api';
import type { Equipment, KritiklikSeviyesi } from '../types';

const kritiklikColors: Record<KritiklikSeviyesi, string> = {
  A: 'bg-red-100 text-red-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-green-100 text-green-800'
};

interface EquipmentFormData {
  ekipmanKodu: string;
  ekipmanAdi: string;
  kategori: string;
  altKategori: string;
  marka: string;
  model: string;
  seriNo: string;
  lokasyon: string;
  kritiklikSeviyesi: KritiklikSeviyesi;
  notlar: string;
}

function EquipmentModal({
  isOpen,
  onClose,
  equipment,
  onSubmit,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onSubmit: (data: EquipmentFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<EquipmentFormData>({
    ekipmanKodu: equipment?.ekipmanKodu || '',
    ekipmanAdi: equipment?.ekipmanAdi || '',
    kategori: equipment?.kategori || '',
    altKategori: equipment?.altKategori || '',
    marka: equipment?.marka || '',
    model: equipment?.model || '',
    seriNo: equipment?.seriNo || '',
    lokasyon: equipment?.lokasyon || '',
    kritiklikSeviyesi: equipment?.kritiklikSeviyesi || 'B',
    notlar: equipment?.notlar || ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {equipment ? 'Ekipman Düzenle' : 'Yeni Ekipman Ekle'}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ekipman Kodu</label>
                <input
                  type="text"
                  value={formData.ekipmanKodu}
                  onChange={(e) => setFormData({ ...formData, ekipmanKodu: e.target.value })}
                  className="input"
                  required
                  disabled={!!equipment}
                  placeholder="BM-001"
                />
              </div>
              <div>
                <label className="label">Ekipman Adı</label>
                <input
                  type="text"
                  value={formData.ekipmanAdi}
                  onChange={(e) => setFormData({ ...formData, ekipmanAdi: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Kategori</label>
                <input
                  type="text"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="input"
                  required
                  placeholder="Boru Makinaları"
                />
              </div>
              <div>
                <label className="label">Alt Kategori</label>
                <input
                  type="text"
                  value={formData.altKategori}
                  onChange={(e) => setFormData({ ...formData, altKategori: e.target.value })}
                  className="input"
                  placeholder="Kaynak"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Marka</label>
                <input
                  type="text"
                  value={formData.marka}
                  onChange={(e) => setFormData({ ...formData, marka: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Seri No</label>
                <input
                  type="text"
                  value={formData.seriNo}
                  onChange={(e) => setFormData({ ...formData, seriNo: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Lokasyon</label>
                <input
                  type="text"
                  value={formData.lokasyon}
                  onChange={(e) => setFormData({ ...formData, lokasyon: e.target.value })}
                  className="input"
                  required
                  placeholder="Üretim Hattı 1"
                />
              </div>
              <div>
                <label className="label">Kritiklik Seviyesi</label>
                <select
                  value={formData.kritiklikSeviyesi}
                  onChange={(e) => setFormData({ ...formData, kritiklikSeviyesi: e.target.value as KritiklikSeviyesi })}
                  className="input"
                >
                  <option value="A">A - Kritik</option>
                  <option value="B">B - Önemli</option>
                  <option value="C">C - Normal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Notlar</label>
              <textarea
                value={formData.notlar}
                onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
                className="input"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', search, filterKategori],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterKategori) params.kategori = filterKategori;
      const response = await equipmentApi.getAll(params);
      return response.data.data as Equipment[];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['equipment-categories'],
    queryFn: async () => {
      const response = await equipmentApi.getCategories();
      return response.data.data as string[];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: EquipmentFormData) => equipmentApi.create(data),
    onSuccess: () => {
      toast.success('Ekipman oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EquipmentFormData> }) =>
      equipmentApi.update(id, data),
    onSuccess: () => {
      toast.success('Ekipman güncellendi');
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsModalOpen(false);
      setSelectedEquipment(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hata oluştu');
    }
  });

  const handleSubmit = (data: EquipmentFormData) => {
    if (selectedEquipment) {
      updateMutation.mutate({ id: selectedEquipment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Kategorilere göre grupla
  const groupedEquipment = equipment?.reduce((acc: Record<string, Equipment[]>, eq) => {
    if (!acc[eq.kategori]) {
      acc[eq.kategori] = [];
    }
    acc[eq.kategori].push(eq);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Ekipman Yönetimi</h1>
        <button
          onClick={() => {
            setSelectedEquipment(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Ekipman
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ekipman kodu veya adı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="">Tüm Kategoriler</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEquipment && Object.entries(groupedEquipment).map(([kategori, items]) => (
            <div key={kategori}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-500" />
                {kategori}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({items.length} adet)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((eq) => (
                  <div key={eq.id} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-gray-500">{eq.ekipmanKodu}</p>
                        <h3 className="font-semibold text-gray-900">{eq.ekipmanAdi}</h3>
                      </div>
                      <span className={`badge ${kritiklikColors[eq.kritiklikSeviyesi]}`}>
                        {eq.kritiklikSeviyesi}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">Lokasyon:</span> {eq.lokasyon}</p>
                      {eq.marka && <p><span className="font-medium">Marka:</span> {eq.marka} {eq.model}</p>}
                      <p>
                        <span className="font-medium">Durum:</span>{' '}
                        <span className={`badge ${eq.durum === 'AKTIF' ? 'badge-success' : 'badge-gray'}`}>
                          {eq.durum}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEquipment(eq);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-secondary w-full text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Düzenle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEquipment(null);
        }}
        equipment={selectedEquipment}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
