import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Search, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import { isBerkeUser } from '../utils/access';
import { jobEntriesApi } from '../services/api';
import type { CompletedJob } from '../types/jobEntries';

const MIN_DURUS_DAKIKASI = 45;

function normalizeForAuth(value: string | undefined | null): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForSearch(value: string | undefined | null): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä±/g, 'i')
    .replace(/ÄŸ/g, 'g')
    .replace(/Ã¼/g, 'u')
    .replace(/ÅŸ/g, 's')
    .replace(/Ã¶/g, 'o')
    .replace(/Ã§/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDateKey(value: string): Date {
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number.parseInt(yearText || '0', 10);
  const month = Number.parseInt(monthText || '1', 10);
  const day = Number.parseInt(dayText || '1', 10);
  return new Date(year, month - 1, day);
}

function canManageCompletedJobs(user: User | null): boolean {
  if (!user) return false;
  if (isBerkeUser(user)) return true;

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

type CompletedRow = {
  is: CompletedJob;
  personel: {
    sicilNo: string;
    adSoyad: string;
    bolum: string;
  };
};

export default function TamamlananIsler() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageCompletedJobs(currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isler, setIsler] = useState<CompletedJob[]>([]);
  const [search, setSearch] = useState('');
  const [filterTarih, setFilterTarih] = useState('');
  const [filterVardiya, setFilterVardiya] = useState('');

  useEffect(() => {
    const loadCompletedJobs = async () => {
      try {
        setIsLoading(true);
        const response = await jobEntriesApi.getCompleted();
        const data = response.data?.data as CompletedJob[] | undefined;
        setIsler(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Tamamlanan isler yuklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    void loadCompletedJobs();
  }, []);

  const handleSil = async (id: string) => {
    if (!canManage) {
      toast.error('Bu islem icin yetkiniz yok');
      return;
    }

    if (!confirm('Bu is emrini silmek istediginize emin misiniz?')) return;

    try {
      await jobEntriesApi.deleteCompleted(id);
      setIsler((prev) => prev.filter((is) => is.id !== id));
      toast.success('Is emri silindi');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Is emri silinemedi');
    }
  };

  const satirlar = useMemo<CompletedRow[]>(() => (
    isler.flatMap((is) => {
      const personeller = is.personeller.length > 0
        ? is.personeller
        : [{ sicilNo: '-', adSoyad: '-', bolum: '-' }];
      return personeller.map((personel) => ({ is, personel }));
    })
  ), [isler]);

  const filteredSatirlar = useMemo(() => satirlar.filter(({ is, personel }) => {
    const searchText = normalizeForSearch(search);
    const matchSearch = !searchText
      || normalizeForSearch(is.id).includes(searchText)
      || normalizeForSearch(is.makina).includes(searchText)
      || normalizeForSearch(is.aciklama).includes(searchText)
      || normalizeForSearch(personel.adSoyad).includes(searchText)
      || normalizeForSearch(personel.sicilNo).includes(searchText);

    const matchTarih = !filterTarih || is.tarih === filterTarih;
    const matchVardiya = !filterVardiya || is.vardiya.includes(filterVardiya);

    return matchSearch && matchTarih && matchVardiya;
  }), [filterTarih, filterVardiya, satirlar, search]);

  const filteredIsler = useMemo(() => Array.from(
    new Map(filteredSatirlar.map(({ is }) => [is.id, is])).values()
  ), [filteredSatirlar]);

  const uzunDurusKayitlari = useMemo(
    () => filteredIsler.filter((is) => (Number(is.sureDakika) || 0) > MIN_DURUS_DAKIKASI),
    [filteredIsler]
  );
  const analizAtananKayitlar = useMemo(
    () => uzunDurusKayitlari.filter((is) => Boolean(is.analizAtamasi)),
    [uzunDurusKayitlari]
  );

  const handleExport = () => {
    const excelData: Record<string, string | number>[] = [];

    filteredSatirlar.forEach(({ is, personel }) => {
      const analizDurumu = (Number(is.sureDakika) || 0) > MIN_DURUS_DAKIKASI
        ? (is.analizAtamasi
          ? `${is.analizAtamasi.atananAdSoyad} (${is.analizAtamasi.atananSicilNo})${is.analizAtamasi.backendWorkOrderNo ? ` - ${is.analizAtamasi.backendWorkOrderNo}` : ''}`
          : 'Devre disi')
        : 'Gerekli degil';

      excelData.push({
        ID: is.id,
        Tarih: format(parseDateKey(is.tarih), 'dd.MM.yyyy'),
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
          disabled={filteredSatirlar.length === 0}
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

      <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
        Tamamlanan Isler ekranindan Is Emri Takibi'ne gonderim devre disi.
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
              {isLoading ? (
                <tr>
                  <td colSpan={15} className="px-3 py-8 text-center text-gray-500">
                    Yukleniyor...
                  </td>
                </tr>
              ) : filteredSatirlar.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-3 py-8 text-center text-gray-500">
                    Kayitli is emri bulunmamaktadir
                  </td>
                </tr>
              ) : (
                filteredSatirlar.map(({ is, personel }, index) => (
                  <tr key={`${is.id}-${personel.sicilNo}-${index}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{is.id}</td>
                    <td className="px-3 py-2">{format(parseDateKey(is.tarih), 'dd.MM.yyyy')}</td>
                    <td className="px-3 py-2 text-xs">{is.vardiya}</td>
                    <td className="px-3 py-2">{personel.adSoyad}</td>
                    <td className="px-3 py-2 font-mono">{personel.sicilNo}</td>
                    <td className="px-3 py-2 text-xs">{personel.bolum}</td>
                    <td className="px-3 py-2">{is.makina}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{is.mudahaleTuru}</span>
                    </td>
                    <td className="px-3 py-2 font-mono">{is.baslangicSaati}</td>
                    <td className="px-3 py-2 font-mono">{is.bitisSaati}</td>
                    <td className="px-3 py-2 font-mono">{is.sureDakika}</td>
                    <td className="px-3 py-2 max-w-xs truncate" title={is.aciklama}>{is.aciklama}</td>
                    <td className="px-3 py-2 max-w-xs truncate" title={is.malzeme}>{is.malzeme || '-'}</td>
                    <td className="px-3 py-2">
                      {(Number(is.sureDakika) || 0) > MIN_DURUS_DAKIKASI ? (
                        is.analizAtamasi ? (
                          <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                            <p className="font-semibold">Atandi</p>
                            <p>{is.analizAtamasi.atananAdSoyad}</p>
                            <p className="text-[11px]">{is.analizAtamasi.atananSicilNo}</p>
                            {is.analizAtamasi.backendWorkOrderNo && (
                              <p className="text-[11px]">Is Emri: {is.analizAtamasi.backendWorkOrderNo}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Devre disi</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Gerekli degil</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {canManage ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => void handleSil(is.id)}
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
                  </tr>
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
            <span className="ml-2 font-semibold">{filteredSatirlar.length}</span>
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

    </div>
  );
}
