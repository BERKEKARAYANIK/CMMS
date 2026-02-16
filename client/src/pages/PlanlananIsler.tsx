import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Save, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  makinaListesi as defaultMakinaListesi,
  type Makina
} from '../data/lists';
import { usersApi, workOrdersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import { isBerkeUser } from '../utils/access';

const STORAGE_KEY = 'cmms_planlanan_isler';
const LIST_KEYS = {
  makinaListesi: 'cmms_makina_listesi'
};
const PLANLI_BAKIM_TURU = 'Planli Bakim';
const CONVERT_KEY = 'cmms_planlanan_is_to_is_emri';

type PlanlananIs = {
  id: string;
  makina: string;
  mudahaleTuru: string;
  aciklama: string;
  malzeme: string;
  gorevTipi?: 'PLANLI_BAKIM' | 'DURUS_RAPOR_ANALIZ';
  atananSicilNo?: string;
  atananAdSoyad?: string;
  atananBolum?: string;
  backendWorkOrderId?: number;
  backendWorkOrderNo?: string;
  backendGonderimTarihi?: string;
  kaynakIsEmriId?: string;
  kaynakDurusDakika?: number;
  createdAt: string;
};

function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    const parsed = JSON.parse(data) as T[];
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

function getPlanlananIsler(): PlanlananIs[] {
  return getFromStorage<PlanlananIs>(STORAGE_KEY, []);
}

function savePlanlananIsler(isler: PlanlananIs[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(isler));
}

export default function PlanlananIsler() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const canAssignWorkOrders = isBerkeUser(currentUser);
  const [makinaListesi] = useState<Makina[]>(() =>
    getFromStorage(LIST_KEYS.makinaListesi, defaultMakinaListesi)
  );
  const [isler, setIsler] = useState<PlanlananIs[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterMakina, setFilterMakina] = useState('');
  const [makina, setMakina] = useState('');
  const [mudahaleTuru] = useState(PLANLI_BAKIM_TURU);
  const [aciklama, setAciklama] = useState('');
  const [malzeme, setMalzeme] = useState('');
  const [isAktivasyonModalOpen, setIsAktivasyonModalOpen] = useState(false);
  const [aktivasyonPlanId, setAktivasyonPlanId] = useState<string | null>(null);
  const [aktivasyonUserId, setAktivasyonUserId] = useState('');
  const [isAktivating, setIsAktivating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const { data: aktifKullanicilar } = useQuery({
    queryKey: ['planlanan-users-list', currentUser?.id ?? 'anon'],
    enabled: canAssignWorkOrders,
    queryFn: async () => {
      const response = await usersApi.getAll({ aktif: 'true' });
      return response.data.data as User[];
    }
  });

  useEffect(() => {
    const kayitlar = getPlanlananIsler();
    const temizKayitlar = kayitlar.filter((is) => !(
      is.gorevTipi === 'DURUS_RAPOR_ANALIZ'
      && !is.backendWorkOrderId
      && !is.backendWorkOrderNo
    ));

    if (temizKayitlar.length !== kayitlar.length) {
      savePlanlananIsler(temizKayitlar);
    }

    setIsler(temizKayitlar);
  }, []);

  const handleKaydet = () => {
    if (!makina) {
      toast.error('Makina / Hat seciniz');
      return;
    }
    if (!aciklama.trim()) {
      toast.error('Aciklama giriniz');
      return;
    }

    const yeniIs: PlanlananIs = {
      id: `PL-${Date.now()}`,
      makina,
      mudahaleTuru,
      aciklama: aciklama.trim(),
      malzeme: malzeme.trim(),
      gorevTipi: 'PLANLI_BAKIM',
      createdAt: new Date().toISOString()
    };

    const yeniListe = [yeniIs, ...isler];
    setIsler(yeniListe);
    savePlanlananIsler(yeniListe);
    setMakina('');
    setAciklama('');
    setMalzeme('');
    setSelectedId(yeniIs.id);
    toast.success('Planli is kaydedildi');
  };

  const handleSil = (id: string) => {
    if (!confirm('Bu planli isi silmek istiyor musunuz?')) return;
    const yeniListe = isler.filter((is) => is.id !== id);
    setIsler(yeniListe);
    savePlanlananIsler(yeniListe);
    if (selectedId === id) setSelectedId(null);
    toast.success('Planli is silindi');
  };

  const openAktivasyonModal = (planId: string) => {
    if (!canAssignWorkOrders) {
      toast.error('Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir');
      return;
    }
    setAktivasyonPlanId(planId);
    setAktivasyonUserId('');
    setIsAktivasyonModalOpen(true);
  };

  const closeAktivasyonModal = () => {
    setIsAktivasyonModalOpen(false);
    setAktivasyonPlanId(null);
    setAktivasyonUserId('');
  };

  const handleAktivasyonKaydet = async () => {
    if (!canAssignWorkOrders) {
      toast.error('Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir');
      return;
    }
    if (!aktivasyonPlanId || !aktivasyonUserId) {
      toast.error('Plan ve kisi secimi zorunlu');
      return;
    }
    const plan = isler.find((item) => item.id === aktivasyonPlanId);
    if (!plan) {
      toast.error('Plan bulunamadi');
      return;
    }
    if (plan.backendWorkOrderId) {
      toast.error('Bu satir zaten Is Emirleri ekranina gonderildi');
      return;
    }
    const secilen = aktifKullanicilar?.find((user) => String(user.id) === aktivasyonUserId);
    if (!secilen) {
      toast.error('Kullanici bulunamadi');
      return;
    }

    setIsAktivating(true);
    try {
      const createResponse = await workOrdersApi.create({
        baslik: `[UDR] Uzayan Durus Analizi - ${plan.makina}`,
        aciklama: plan.aciklama,
        oncelik: 'YUKSEK',
        atananId: String(secilen.id),
        tahminiSure: plan.kaynakDurusDakika || 120
      });
      const workOrder = createResponse.data?.data as { id?: number; isEmriNo?: string } | undefined;
      const gonderimTarihi = new Date().toISOString();

      const yeniListe = isler.map((is) => (
        is.id === aktivasyonPlanId
          ? {
            ...is,
            gorevTipi: 'DURUS_RAPOR_ANALIZ' as const,
            mudahaleTuru: 'Durus Raporu ve Analiz',
            atananSicilNo: secilen.sicilNo,
            atananAdSoyad: `${secilen.ad} ${secilen.soyad}`.trim(),
            atananBolum: secilen.departman,
            backendWorkOrderId: workOrder?.id,
            backendWorkOrderNo: workOrder?.isEmriNo,
            backendGonderimTarihi: gonderimTarihi
          }
          : is
      ));

      setIsler(yeniListe);
      savePlanlananIsler(yeniListe);
      toast.success(workOrder?.isEmriNo
        ? `Satir aktif edildi ve ${workOrder.isEmriNo} olusturuldu`
        : 'Satir aktif edildi ve Is Emirleri ekranina gonderildi');
      closeAktivasyonModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Is emri olusturulamadi');
    } finally {
      setIsAktivating(false);
    }
  };

  const filteredIsler = filterMakina
    ? isler.filter((is) => is.makina === filterMakina)
    : isler;
  const selectedIs = selectedId ? isler.find((is) => is.id === selectedId) || null : null;

  const handleConvert = async () => {
    if (!selectedIs) {
      toast.error('Lutfen donusturulecek plani secin');
      return;
    }

    if (selectedIs.gorevTipi === 'DURUS_RAPOR_ANALIZ') {
      if (!canAssignWorkOrders) {
        toast.error('Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir');
        return;
      }
      if (selectedIs.backendWorkOrderId) {
        toast.success('Bu satir zaten Is Emirleri ekranina gonderildi');
        navigate('/work-orders');
        return;
      }

      if (!selectedIs.atananSicilNo) {
        toast.error('Bu satir icin once aktivasyon ve kisi atamasi yapin');
        return;
      }

      const atanan = aktifKullanicilar?.find((user) => user.sicilNo === selectedIs.atananSicilNo);
      if (!atanan) {
        toast.error('Atanan kisi aktif kullanicilarda bulunamadi');
        return;
      }

      setIsConverting(true);
      try {
        await workOrdersApi.create({
          baslik: `[UDR] Uzayan Durus Analizi - ${selectedIs.makina}`,
          aciklama: selectedIs.aciklama,
          oncelik: 'YUKSEK',
          atananId: String(atanan.id),
          tahminiSure: selectedIs.kaynakDurusDakika || 120
        });

        const yeniListe = isler.filter((is) => is.id !== selectedIs.id);
        setIsler(yeniListe);
        savePlanlananIsler(yeniListe);
        setSelectedId(null);
        toast.success('Is emri olusturuldu ve Is Emirleri sekmesine gonderildi');
        navigate('/work-orders');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Is emri olusturulamadi');
      } finally {
        setIsConverting(false);
      }
      return;
    }

    localStorage.setItem(CONVERT_KEY, JSON.stringify(selectedIs));
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
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md"
              >
                <option value="">Seciniz...</option>
                {makinaListesi.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mudahale Turu</label>
              <input type="text" value={PLANLI_BAKIM_TURU} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Aciklama</label>
            <textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Malzeme</label>
            <textarea
              value={malzeme}
              onChange={(e) => setMalzeme(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={handleKaydet} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Is Emrine Donustur</h2>
            <p className="text-sm text-gray-500">Secili plana gore uygun ekrana yonlendirilir.</p>
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
            disabled={isConverting}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {isConverting ? 'Is Emri Olusturuluyor...' : 'Is Emrine Donustur'}
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
              {filteredIsler.length === 0 ? (
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
                      {canAssignWorkOrders ? (
                        <button
                          type="button"
                          onClick={() => openAktivasyonModal(is.id)}
                          disabled={Boolean(is.backendWorkOrderId)}
                          className="rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                        >
                          {is.backendWorkOrderId ? 'Gonderildi' : 'Aktif Et'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Sadece Berke</span>
                      )}
                      <button onClick={() => handleSil(is.id)} className="text-red-500 hover:text-red-700 p-1" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAktivasyonModalOpen && canAssignWorkOrders && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeAktivasyonModal} />
            <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200 p-5 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Uzayan Durus Akisini Aktif Et</h2>
              <p className="text-sm text-gray-600">
                Bu satir, Is Emirleri ekraninda doldurulacak analiz formu akisina donusecek.
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Yonlendirilecek Kisi</label>
                <select
                  value={aktivasyonUserId}
                  onChange={(e) => setAktivasyonUserId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Seciniz...</option>
                  {(aktifKullanicilar || []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.ad} {user.soyad} ({user.sicilNo}) - {user.departman}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-secondary" onClick={closeAktivasyonModal} disabled={isAktivating}>Iptal</button>
                <button type="button" className="btn btn-primary" onClick={handleAktivasyonKaydet} disabled={isAktivating}>
                  {isAktivating ? 'Olusturuluyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
