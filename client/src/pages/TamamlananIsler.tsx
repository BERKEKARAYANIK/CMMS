import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  type IsEmri
} from '../data/lists';
import { usersApi, workOrdersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import { isBerkeUser } from '../utils/access';

const STORAGE_KEY = 'cmms_tamamlanan_isler';
const PLANLANAN_STORAGE_KEY = 'cmms_planlanan_isler';
const MIN_DURUS_DAKIKASI = 45;

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

function getTamamlananIsler(): IsEmri[] {
  return getFromStorage<IsEmri>(STORAGE_KEY, []);
}

function saveTamamlananIsler(isler: IsEmri[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(isler));
}

function getPlanlananIsler(): Array<Record<string, any>> {
  return getFromStorage<Record<string, any>>(PLANLANAN_STORAGE_KEY, []);
}

function savePlanlananIsler(isler: Array<Record<string, any>>): void {
  localStorage.setItem(PLANLANAN_STORAGE_KEY, JSON.stringify(isler));
}

function normalizeForAuth(value: string | undefined | null): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function canManageCompletedJobs(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const ad = normalizeForAuth(user.ad);
  const fullName = normalizeForAuth(`${user.ad} ${user.soyad}`);
  const email = normalizeForAuth(user.email);
  const sicilNo = normalizeForAuth(user.sicilNo);

  return (
    ad === 'berke'
    || fullName === 'berke karayanik'
    || email.includes('berke')
    || sicilNo === 'berke'
  );
}

export default function TamamlananIsler() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageCompletedJobs(currentUser);
  const canAssignWorkOrders = isBerkeUser(currentUser);
  const [isler, setIsler] = useState<IsEmri[]>([]);
  const [search, setSearch] = useState('');
  const [filterTarih, setFilterTarih] = useState('');
  const [filterVardiya, setFilterVardiya] = useState('');
  const [isAnalizModalOpen, setIsAnalizModalOpen] = useState(false);
  const [selectedIsId, setSelectedIsId] = useState<string | null>(null);
  const [atananSicilNo, setAtananSicilNo] = useState('');
  const [analizNotu, setAnalizNotu] = useState('');
  const [isAtamaKaydediliyor, setIsAtamaKaydediliyor] = useState(false);

  const { data: aktifKullanicilar, isLoading: kullanicilarYukleniyor } = useQuery({
    queryKey: ['tamamlanan-analiz-users-list', currentUser?.id ?? 'anon'],
    enabled: canAssignWorkOrders,
    queryFn: async () => {
      const response = await usersApi.getAll({ aktif: 'true' });
      return response.data.data as User[];
    }
  });

  useEffect(() => {
    setIsler(getTamamlananIsler());
  }, []);

  const selectedIs = selectedIsId
    ? isler.find((is) => is.id === selectedIsId) || null
    : null;

  const handleSil = (id: string) => {
    if (!canManage) {
      toast.error('Bu islem icin yetkiniz yok');
      return;
    }

    if (confirm('Bu is emrini silmek istediginize emin misiniz?')) {
      const yeniListe = isler.filter((is) => is.id !== id);
      saveTamamlananIsler(yeniListe);
      setIsler(yeniListe);
      toast.success('Is emri silindi');
    }
  };


  const openAnalizModal = (is: IsEmri) => {
    if (!canAssignWorkOrders) {
      toast.error('Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir');
      return;
    }
    if ((Number(is.sureDakika) || 0) <= MIN_DURUS_DAKIKASI) {
      toast.error(`Sadece ${MIN_DURUS_DAKIKASI} dk ustu duruslar icin atama yapilabilir`);
      return;
    }

    const hasBackendWorkOrder = Boolean(
      is.analizAtamasi?.backendWorkOrderId || is.analizAtamasi?.backendWorkOrderNo
    );
    if (hasBackendWorkOrder) {
      toast.error('Bu durus icin analiz gorevi zaten atandi');
      return;
    }

    setSelectedIsId(is.id);
    setAtananSicilNo(is.analizAtamasi?.atananSicilNo || '');
    setAnalizNotu('');
    setIsAnalizModalOpen(true);
  };

  const closeAnalizModal = () => {
    setIsAnalizModalOpen(false);
    setSelectedIsId(null);
    setAtananSicilNo('');
    setAnalizNotu('');
  };

  const handleAnalizAtamaKaydet = async () => {
    if (!canAssignWorkOrders) {
      toast.error('Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir');
      return;
    }
    if (!selectedIs) {
      toast.error('Durus kaydi bulunamadi');
      return;
    }

    if ((Number(selectedIs.sureDakika) || 0) <= MIN_DURUS_DAKIKASI) {
      toast.error(`Bu kayit ${MIN_DURUS_DAKIKASI} dk ustu degil`);
      return;
    }

    const hasBackendWorkOrder = Boolean(
      selectedIs.analizAtamasi?.backendWorkOrderId || selectedIs.analizAtamasi?.backendWorkOrderNo
    );
    if (hasBackendWorkOrder) {
      toast.error('Bu durus icin analiz gorevi zaten atandi');
      return;
    }

    if (!atananSicilNo) {
      toast.error('Lutfen atayacagin kisiyi sec');
      return;
    }

    const atananKullanici = aktifKullanicilar?.find((user) => user.sicilNo === atananSicilNo);
    if (!atananKullanici) {
      toast.error('Secilen kisi aktif sistem kullanicilarinda bulunamadi');
      return;
    }

    const secilenPersonel = {
      sicilNo: atananKullanici.sicilNo,
      adSoyad: `${atananKullanici.ad} ${atananKullanici.soyad}`.trim(),
      bolum: atananKullanici.departman
    };

    setIsAtamaKaydediliyor(true);
    try {
      const notText = analizNotu.trim();
      const aciklama = [
        `${selectedIs.id} numarali durusta durus suresi ${selectedIs.sureDakika} dk olarak kaydedildi.`,
        `${selectedIs.makina} / ${selectedIs.vardiya}.`,
        `Saat: ${selectedIs.baslangicSaati} - ${selectedIs.bitisSaati}.`,
        'Talep: Durus raporu cikar ve kok neden analizi yap.',
        notText ? `Ek not: ${notText}` : ''
      ]
        .filter(Boolean)
        .join(' ');

      const createResponse = await workOrdersApi.create({
        baslik: `[UDR] Uzayan Durus Analizi - ${selectedIs.makina}`,
        aciklama,
        oncelik: 'YUKSEK',
        atananId: String(atananKullanici.id),
        tahminiSure: Number(selectedIs.sureDakika) || 120
      });

      const createdWorkOrder = createResponse.data?.data as { id?: number; isEmriNo?: string } | undefined;
      const nowIso = new Date().toISOString();

      // Legacy akisinda ayni durus icin Planlanan Isler'e dusen kaydi temizle.
      const eskiPlanlananId = selectedIs.analizAtamasi?.planlananIsId;
      const mevcutPlanlanan = getPlanlananIsler();
      const temizPlanlanan = mevcutPlanlanan.filter((item) => (
        item?.id !== eskiPlanlananId
        && item?.kaynakIsEmriId !== selectedIs.id
      ));
      if (temizPlanlanan.length !== mevcutPlanlanan.length) {
        savePlanlananIsler(temizPlanlanan);
      }

      const guncelIsler = isler.map((is) => (
        is.id === selectedIs.id
          ? {
            ...is,
            analizAtamasi: {
              backendWorkOrderId: createdWorkOrder?.id,
              backendWorkOrderNo: createdWorkOrder?.isEmriNo,
              atananSicilNo: secilenPersonel.sicilNo,
              atananAdSoyad: secilenPersonel.adSoyad,
              atananBolum: secilenPersonel.bolum,
              atamaTarihi: nowIso
            }
          }
          : is
      ));

      saveTamamlananIsler(guncelIsler);
      setIsler(guncelIsler);
      toast.success(
        createdWorkOrder?.isEmriNo
          ? `${secilenPersonel.adSoyad} icin ${createdWorkOrder.isEmriNo} olusturuldu`
          : `${secilenPersonel.adSoyad} icin analiz is emri olusturuldu`
      );
      closeAnalizModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analiz is emri olusturulamadi');
    } finally {
      setIsAtamaKaydediliyor(false);
    }
  };

  const filteredIsler = isler.filter((is) => {
    const searchLower = search.toLowerCase();
    const matchSearch = !search
      || is.id.toLowerCase().includes(searchLower)
      || is.makina.toLowerCase().includes(searchLower)
      || is.aciklama.toLowerCase().includes(searchLower)
      || is.personeller.some((personel) => personel.adSoyad.toLowerCase().includes(searchLower));

    const matchTarih = !filterTarih || is.tarih === filterTarih;
    const matchVardiya = !filterVardiya || is.vardiya.includes(filterVardiya);

    return matchSearch && matchTarih && matchVardiya;
  });

  const uzunDurusKayitlari = filteredIsler.filter((is) => (Number(is.sureDakika) || 0) > MIN_DURUS_DAKIKASI);
  const analizAtananKayitlar = uzunDurusKayitlari.filter((is) => Boolean(is.analizAtamasi));

  const handleExport = () => {
    const excelData: Record<string, string | number>[] = [];

    filteredIsler.forEach((is) => {
      const analizDurumu = (Number(is.sureDakika) || 0) > MIN_DURUS_DAKIKASI
        ? (is.analizAtamasi
          ? `${is.analizAtamasi.atananAdSoyad} (${is.analizAtamasi.atananSicilNo})${is.analizAtamasi.backendWorkOrderNo ? ` - ${is.analizAtamasi.backendWorkOrderNo}` : ''}`
          : 'Atama bekliyor')
        : 'Gerekli degil';

      is.personeller.forEach((personel) => {
        excelData.push({
          ID: is.id,
          Tarih: format(new Date(is.tarih), 'dd.MM.yyyy'),
          Vardiya: is.vardiya,
          'Ad Soyad': personel.adSoyad,
          'Sicil No': personel.sicilNo,
          Bolum: personel.bolum,
          Makina: is.makina,
          'Mudahale Turu': is.mudahaleTuru,
          Baslangic: is.baslangicSaati,
          Bitis: is.bitisSaati,
          'Sure (dk)': is.sureDakika,
          Aciklama: is.aciklama,
          Malzeme: is.malzeme || '',
          'Analiz Is Emri': analizDurumu
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tamamlanan Isler');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 10 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 40 },
      { wch: 25 },
      { wch: 36 }
    ];

    XLSX.writeFile(workbook, `tamamlanan_isler_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
    toast.success('Excel dosyasi indirildi');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tamamlanan Isler</h1>
        <button
          onClick={handleExport}
          className="btn btn-primary inline-flex items-center"
          disabled={filteredIsler.length === 0}
        >
          <Download className="w-5 h-5 mr-2" />
          Excel'e Aktar
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ID, makina, personel veya aciklama ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <input
            type="date"
            value={filterTarih}
            onChange={(e) => setFilterTarih(e.target.value)}
            className="input w-full md:w-44"
            placeholder="Tarih filtrele"
          />
          <select
            value={filterVardiya}
            onChange={(e) => setFilterVardiya(e.target.value)}
            className="input w-full md:w-44"
          >
            <option value="">Tum Vardiyalar</option>
            <option value="VARDIYA 1">Vardiya 1</option>
            <option value="VARDIYA 2">Vardiya 2</option>
            <option value="VARDIYA 3">Vardiya 3</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-500 text-white">
                <th className="px-3 py-3 text-left font-semibold">ID</th>
                <th className="px-3 py-3 text-left font-semibold">Tarih</th>
                <th className="px-3 py-3 text-left font-semibold">Vardiya</th>
                <th className="px-3 py-3 text-left font-semibold">Ad Soyad</th>
                <th className="px-3 py-3 text-left font-semibold">Sicil No</th>
                <th className="px-3 py-3 text-left font-semibold">Bolum</th>
                <th className="px-3 py-3 text-left font-semibold">Makina</th>
                <th className="px-3 py-3 text-left font-semibold">Mudahale Turu</th>
                <th className="px-3 py-3 text-left font-semibold">Baslangic</th>
                <th className="px-3 py-3 text-left font-semibold">Bitis</th>
                <th className="px-3 py-3 text-left font-semibold">Sure (dk)</th>
                <th className="px-3 py-3 text-left font-semibold">Aciklama</th>
                <th className="px-3 py-3 text-left font-semibold">Malzeme</th>
                <th className="px-3 py-3 text-left font-semibold">Analiz Gorevi</th>
                <th className="px-3 py-3 text-center font-semibold">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIsler.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-3 py-8 text-center text-gray-500">
                    Kayitli is emri bulunmamaktadir
                  </td>
                </tr>
              ) : (
                filteredIsler.map((is) => (
                  is.personeller.map((personel, pIndex) => (
                    <tr key={`${is.id}-${personel.sicilNo}`} className="hover:bg-gray-50">
                      {pIndex === 0 ? (
                        <>
                          <td className="px-3 py-2 font-mono text-xs" rowSpan={is.personeller.length}>{is.id}</td>
                          <td className="px-3 py-2" rowSpan={is.personeller.length}>{format(new Date(is.tarih), 'dd.MM.yyyy')}</td>
                          <td className="px-3 py-2 text-xs" rowSpan={is.personeller.length}>{is.vardiya}</td>
                        </>
                      ) : null}
                      <td className="px-3 py-2">{personel.adSoyad}</td>
                      <td className="px-3 py-2 font-mono">{personel.sicilNo}</td>
                      <td className="px-3 py-2 text-xs">{personel.bolum}</td>
                      {pIndex === 0 ? (
                        <>
                          <td className="px-3 py-2" rowSpan={is.personeller.length}>{is.makina}</td>
                          <td className="px-3 py-2" rowSpan={is.personeller.length}>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{is.mudahaleTuru}</span>
                          </td>
                          <td className="px-3 py-2 font-mono" rowSpan={is.personeller.length}>{is.baslangicSaati}</td>
                          <td className="px-3 py-2 font-mono" rowSpan={is.personeller.length}>{is.bitisSaati}</td>
                          <td className="px-3 py-2 font-mono" rowSpan={is.personeller.length}>{is.sureDakika}</td>
                          <td className="px-3 py-2 max-w-xs truncate" rowSpan={is.personeller.length} title={is.aciklama}>{is.aciklama}</td>
                          <td className="px-3 py-2 max-w-xs truncate" rowSpan={is.personeller.length} title={is.malzeme}>{is.malzeme || '-'}</td>
                          <td className="px-3 py-2" rowSpan={is.personeller.length}>
                            {(Number(is.sureDakika) || 0) > MIN_DURUS_DAKIKASI ? (
                              is.analizAtamasi && (is.analizAtamasi.backendWorkOrderId || is.analizAtamasi.backendWorkOrderNo) ? (
                                <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                                  <p className="font-semibold">Atandi</p>
                                  <p>{is.analizAtamasi.atananAdSoyad}</p>
                                  <p className="text-[11px]">{is.analizAtamasi.atananSicilNo}</p>
                                  {is.analizAtamasi.backendWorkOrderNo && (
                                    <p className="text-[11px]">Is Emri: {is.analizAtamasi.backendWorkOrderNo}</p>
                                  )}
                                </div>
                              ) : canAssignWorkOrders ? (
                                <button
                                  type="button"
                                  onClick={() => openAnalizModal(is)}
                                  className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                                >
                                  Is Emirlerine Yaz
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">Sadece Berke</span>
                              )
                            ) : (
                              <span className="text-xs text-gray-400">Gerekli degil</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center" rowSpan={is.personeller.length}>
                            {canManage ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleSil(is.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </>
                      ) : null}
                    </tr>
                  ))
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Toplam Is Emri:</span>
            <span className="ml-2 font-semibold">{filteredIsler.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Toplam Sure:</span>
            <span className="ml-2 font-semibold">{filteredIsler.reduce((sum, is) => sum + is.sureDakika, 0)} dk</span>
          </div>
          <div>
            <span className="text-gray-500">Toplam Personel Girisi:</span>
            <span className="ml-2 font-semibold">{filteredIsler.reduce((sum, is) => sum + is.personeller.length, 0)}</span>
          </div>
          <div>
            <span className="text-gray-500">{MIN_DURUS_DAKIKASI} dk Ustu Durus:</span>
            <span className="ml-2 font-semibold">{uzunDurusKayitlari.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Analiz Atanan Kayit:</span>
            <span className="ml-2 font-semibold">{analizAtananKayitlar.length} / {uzunDurusKayitlari.length}</span>
          </div>
        </div>
      </div>

      {!canManage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bu hesapta tamamlanan isler icin sadece goruntuleme yetkisi var.
        </div>
      )}

      {isAnalizModalOpen && selectedIs && canAssignWorkOrders && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeAnalizModal} />
            <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl border border-gray-200">
              <div className="border-b px-5 py-4">
                <h2 className="text-lg font-bold text-gray-900">Durus Raporu ve Analiz Is Emri</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedIs.id} - {selectedIs.makina} ({selectedIs.sureDakika} dk)
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                  Bu kayit {MIN_DURUS_DAKIKASI} dakika ustu oldugu icin durus raporu ve kok neden analizi gorevi atanabilir.
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Atanacak Kisi</label>
                  <select
                    value={atananSicilNo}
                    onChange={(e) => setAtananSicilNo(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    disabled={kullanicilarYukleniyor}
                  >
                    <option value="">
                      {kullanicilarYukleniyor ? 'Kullanicilar yukleniyor...' : 'Seciniz...'}
                    </option>
                    {(aktifKullanicilar || []).map((user) => (
                      <option key={user.id} value={user.sicilNo}>
                        {user.ad} {user.soyad} ({user.sicilNo}) - {user.departman}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ek Not (opsiyonel)</label>
                  <textarea
                    value={analizNotu}
                    onChange={(e) => setAnalizNotu(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 resize-none"
                    placeholder="Analiz kapsamiyla ilgili not ekleyebilirsiniz..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-5 py-4">
                <button type="button" className="btn btn-secondary" onClick={closeAnalizModal} disabled={isAtamaKaydediliyor}>
                  Iptal
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAnalizAtamaKaydet} disabled={isAtamaKaydediliyor}>
                  {isAtamaKaydediliyor ? 'Olusturuluyor...' : 'Is Emri Ata'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
