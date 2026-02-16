import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Edit2, Save, Trash2 } from 'lucide-react';
import {
  makinaListesi as defaultMakinaListesi,
  type Makina
} from '../data/lists';
import { useAuthStore } from '../store/authStore';
import { isBerkeUser } from '../utils/access';
import { appStateApi, jobEntriesApi } from '../services/api';
import type { PlannedJob } from '../types/jobEntries';
import { APP_STATE_KEYS, normalizeSettingsLists } from '../constants/appState';

const PLANLI_BAKIM_TURU = 'Planli Bakim';
const CONVERT_KEY = 'cmms_planlanan_is_to_is_emri';

function sortByCreatedAtDesc(items: PlannedJob[]): PlannedJob[] {
  return [...items].sort((a, b) => (
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
}

export default function PlanlananIsler() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const canManagePlanlanan = isBerkeUser(currentUser);
  const [makinaListesi, setMakinaListesi] = useState<Makina[]>(defaultMakinaListesi);
  const [isler, setIsler] = useState<PlannedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterMakina, setFilterMakina] = useState('');
  const [makina, setMakina] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [malzeme, setMalzeme] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const loadPlannedJobs = async () => {
      try {
        setIsLoading(true);
        const [plannedResponse, listsResponse] = await Promise.all([
          jobEntriesApi.getPlanned(),
          appStateApi.get(APP_STATE_KEYS.settingsLists)
        ]);
        const data = plannedResponse.data?.data as PlannedJob[] | undefined;
        const list = Array.isArray(data) ? data : [];
        setIsler(sortByCreatedAtDesc(list));

        const listsPayload = listsResponse.data?.data?.value;
        const normalizedLists = normalizeSettingsLists(listsPayload);
        setMakinaListesi(normalizedLists.makinaListesi);
      } catch {
        toast.error('Planlanan isler yuklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlannedJobs();
  }, []);

  const handleKaydet = async () => {
    if (!makina) {
      toast.error('Makina / Hat seciniz');
      return;
    }
    if (!aciklama.trim()) {
      toast.error('Aciklama giriniz');
      return;
    }

    try {
      if (editId) {
        if (!canManagePlanlanan) {
          toast.error('Duzenleme yetkisi sadece Berke Karayanik kullanicisinda');
          return;
        }

        const response = await jobEntriesApi.updatePlanned(editId, {
          makina,
          aciklama: aciklama.trim(),
          malzeme: malzeme.trim()
        });
        const updated = response.data?.data as PlannedJob | undefined;
        if (!updated) throw new Error('Invalid response');

        setIsler((prev) => prev.map((item) => (item.id === editId ? updated : item)));
        setSelectedId(editId);
        setEditId(null);
        setMakina('');
        setAciklama('');
        setMalzeme('');
        toast.success('Planli is guncellendi');
        return;
      }

      const response = await jobEntriesApi.createPlanned({
        makina,
        mudahaleTuru: PLANLI_BAKIM_TURU,
        aciklama: aciklama.trim(),
        malzeme: malzeme.trim(),
        gorevTipi: 'PLANLI_BAKIM'
      });
      const created = response.data?.data as PlannedJob | undefined;
      if (!created) throw new Error('Invalid response');

      setIsler((prev) => sortByCreatedAtDesc([created, ...prev]));
      setMakina('');
      setAciklama('');
      setMalzeme('');
      setSelectedId(created.id);
      toast.success('Planli is kaydedildi');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Planli is kaydedilemedi');
    }
  };

  const handleSil = async (id: string) => {
    if (!canManagePlanlanan) {
      toast.error('Silme yetkisi sadece Berke Karayanik kullanicisinda');
      return;
    }
    if (!confirm('Bu planli isi silmek istiyor musunuz?')) return;

    try {
      await jobEntriesApi.deletePlanned(id);
      setIsler((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) setSelectedId(null);
      if (editId === id) {
        setEditId(null);
        setMakina('');
        setAciklama('');
        setMalzeme('');
      }
      toast.success('Planli is silindi');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Planli is silinemedi');
    }
  };

  const handleDuzenle = (is: PlannedJob) => {
    if (!canManagePlanlanan) {
      toast.error('Duzenleme yetkisi sadece Berke Karayanik kullanicisinda');
      return;
    }
    if (is.gorevTipi === 'DURUS_RAPOR_ANALIZ') {
      toast.error('Bu satir duzenlenemez');
      return;
    }

    setEditId(is.id);
    setMakina(is.makina);
    setAciklama(is.aciklama || '');
    setMalzeme(is.malzeme || '');
    setSelectedId(is.id);
  };

  const handleEditIptal = () => {
    setEditId(null);
    setMakina('');
    setAciklama('');
    setMalzeme('');
  };

  const filteredIsler = useMemo(() => {
    if (!filterMakina) return isler;
    return isler.filter((is) => is.makina === filterMakina);
  }, [filterMakina, isler]);

  const selectedIs = selectedId ? isler.find((is) => is.id === selectedId) || null : null;

  const handleConvert = () => {
    if (!selectedIs) {
      toast.error('Lutfen donusturulecek plani secin');
      return;
    }

    sessionStorage.setItem(CONVERT_KEY, JSON.stringify(selectedIs));
    navigate('/is-emri-girisi');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Planlanan Isler</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Makina / Hat Secimi</label>
              <select
                value={makina}
                onChange={(e) => setMakina(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
              >
                <option value="">Seciniz...</option>
                {makinaListesi.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mudahale Turu</label>
              <input
                type="text"
                value={PLANLI_BAKIM_TURU}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Aciklama</label>
            <textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Malzeme</label>
            <textarea
              value={malzeme}
              onChange={(e) => setMalzeme(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleKaydet()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
            >
              <Save className="w-4 h-4" />
              {editId ? 'Guncelle' : 'Kaydet'}
            </button>
          </div>
          {editId && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleEditIptal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md"
              >
                Duzenlemeyi Iptal Et
              </button>
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Is Girisine Aktar</h2>
            <p className="text-sm text-gray-500">Secili plan, Is Girisi formunu otomatik doldurur.</p>
          </div>
          {selectedIs ? (
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 text-sm">
              <p><span className="text-gray-500">Makina:</span> {selectedIs.makina}</p>
              <p><span className="text-gray-500">Tur:</span> {selectedIs.mudahaleTuru}</p>
              <p><span className="text-gray-500">Aciklama:</span> {selectedIs.aciklama}</p>
              <p><span className="text-gray-500">Durum:</span> {selectedIs.gorevTipi === 'DURUS_RAPOR_ANALIZ' ? 'Uzayan Durus Analizi Aktif' : 'Normal Plan'}</p>
              {selectedIs.atananAdSoyad && (
                <p><span className="text-gray-500">Atanan:</span> {selectedIs.atananAdSoyad} ({selectedIs.atananSicilNo})</p>
              )}
              {selectedIs.backendWorkOrderNo && (
                <p><span className="text-gray-500">Is Emri:</span> {selectedIs.backendWorkOrderNo}</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              Plan secilmedi.
            </div>
          )}
          <button
            type="button"
            onClick={handleConvert}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Is Girisine Aktar
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-gray-700">Planli Isler</div>
            <div className="w-full md:w-72">
              <select
                value={filterMakina}
                onChange={(e) => setFilterMakina(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Tum Makinalar</option>
                {makinaListesi.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left font-semibold">Sec</th>
                <th className="px-4 py-3 text-left font-semibold">Tarih</th>
                <th className="px-4 py-3 text-left font-semibold">Makina</th>
                <th className="px-4 py-3 text-left font-semibold">Mudahale Turu</th>
                <th className="px-4 py-3 text-left font-semibold">Aciklama</th>
                <th className="px-4 py-3 text-left font-semibold">Atanan</th>
                <th className="px-4 py-3 text-center font-semibold">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Yukleniyor...</td>
                </tr>
              ) : filteredIsler.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Planli is bulunamadi</td>
                </tr>
              ) : (
                filteredIsler.map((is) => (
                  <tr key={is.id} className={`hover:bg-gray-50 ${selectedId === is.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="radio" name="planli-is-secim" checked={selectedId === is.id} onChange={() => setSelectedId(is.id)} />
                    </td>
                    <td className="px-4 py-3">{format(new Date(is.createdAt), 'dd.MM.yyyy')}</td>
                    <td className="px-4 py-3">{is.makina}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        is.gorevTipi === 'DURUS_RAPOR_ANALIZ' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {is.mudahaleTuru}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={is.aciklama}>{is.aciklama}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {is.atananAdSoyad ? `${is.atananAdSoyad}${is.atananSicilNo ? ` (${is.atananSicilNo})` : ''}` : '-'}
                      {is.backendWorkOrderNo ? ` / ${is.backendWorkOrderNo}` : ''}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      {canManagePlanlanan ? (
                        <>
                          <button
                            onClick={() => handleDuzenle(is)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Duzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => void handleSil(is.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
