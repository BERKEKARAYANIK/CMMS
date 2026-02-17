import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Download, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import { isBerkeUser } from '../utils/access';
import { jobEntriesApi, usersApi, workOrdersApi } from '../services/api';
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

function formatDateTime(value: string | undefined): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return format(parsed, 'dd.MM.yyyy HH:mm');
}

function calculateDurationMinutes(startText: string, endText: string): number | null {
  const startMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(startText);
  const endMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(endText);
  if (!startMatch || !endMatch) return null;

  const startMinutes = (Number.parseInt(startMatch[1], 10) * 60) + Number.parseInt(startMatch[2], 10);
  let endMinutes = (Number.parseInt(endMatch[1], 10) * 60) + Number.parseInt(endMatch[2], 10);

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
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
  const isBerkeViewer = Boolean(currentUser && isBerkeUser(currentUser));
  const canManage = canManageCompletedJobs(currentUser);
  const canAssignWorkOrders = isBerkeViewer;
  const [isLoading, setIsLoading] = useState(true);
  const [isler, setIsler] = useState<CompletedJob[]>([]);
  const [search, setSearch] = useState('');
  const [filterTarih, setFilterTarih] = useState('');
  const [filterBolum, setFilterBolum] = useState('');
  const [filterVardiya, setFilterVardiya] = useState('');
  const [isAnalizModalOpen, setIsAnalizModalOpen] = useState(false);
  const [selectedIsId, setSelectedIsId] = useState<string | null>(null);
  const [atananSicilNo, setAtananSicilNo] = useState('');
  const [analizNotu, setAnalizNotu] = useState('');
  const [isAtamaKaydediliyor, setIsAtamaKaydediliyor] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIsId, setEditIsId] = useState<string | null>(null);
  const [editTarih, setEditTarih] = useState('');
  const [editVardiya, setEditVardiya] = useState('');
  const [editMakina, setEditMakina] = useState('');
  const [editMudahaleTuru, setEditMudahaleTuru] = useState('');
  const [editBaslangicSaati, setEditBaslangicSaati] = useState('');
  const [editBitisSaati, setEditBitisSaati] = useState('');
  const [editAciklama, setEditAciklama] = useState('');
  const [editMalzeme, setEditMalzeme] = useState('');
  const [isEditKaydediliyor, setIsEditKaydediliyor] = useState(false);

  const { data: aktifKullanicilar, isLoading: kullanicilarYukleniyor } = useQuery({
    queryKey: ['tamamlanan-analiz-users-list', currentUser?.id ?? 'anon'],
    enabled: canAssignWorkOrders,
    queryFn: async () => {
      const response = await usersApi.getAll({ aktif: 'true' });
      return response.data.data as User[];
    }
  });

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
  }, [currentUser?.id]);

  const selectedIs = selectedIsId
    ? isler.find((is) => is.id === selectedIsId) || null
    : null;
  const selectedEditIs = editIsId
    ? isler.find((is) => is.id === editIsId) || null
    : null;
  const editSureDakika = useMemo(
    () => calculateDurationMinutes(editBaslangicSaati, editBitisSaati),
    [editBaslangicSaati, editBitisSaati]
  );

  const resetEditModal = () => {
    setIsEditModalOpen(false);
    setEditIsId(null);
    setEditTarih('');
    setEditVardiya('');
    setEditMakina('');
    setEditMudahaleTuru('');
    setEditBaslangicSaati('');
    setEditBitisSaati('');
    setEditAciklama('');
    setEditMalzeme('');
  };

  const closeEditModal = () => {
    if (isEditKaydediliyor) return;
    resetEditModal();
  };

  const forceCloseEditModal = () => {
    resetEditModal();
  };

  const openEditModal = (is: CompletedJob) => {
    if (!canManage) {
      toast.error('Duzenleme yetkisi sadece Berke Karayanik kullanicisinda');
      return;
    }

    setEditIsId(is.id);
    setEditTarih(is.tarih);
    setEditVardiya(is.vardiya);
    setEditMakina(is.makina);
    setEditMudahaleTuru(is.mudahaleTuru);
    setEditBaslangicSaati(is.baslangicSaati);
    setEditBitisSaati(is.bitisSaati);
    setEditAciklama(is.aciklama || '');
    setEditMalzeme(is.malzeme || '');
    setIsEditModalOpen(true);
  };

  const handleEditKaydet = async () => {
    if (!canManage) {
      toast.error('Duzenleme yetkisi sadece Berke Karayanik kullanicisinda');
      return;
    }

    if (!editIsId) {
      toast.error('Duzenlenecek kayit bulunamadi');
      return;
    }

    const vardiya = editVardiya.trim();
    const makina = editMakina.trim();
    const mudahaleTuru = editMudahaleTuru.trim();
    const aciklama = editAciklama.trim();
    const malzeme = editMalzeme.trim();

    if (!editTarih || !vardiya || !makina || !mudahaleTuru || !editBaslangicSaati || !editBitisSaati || !aciklama) {
      toast.error('Tum zorunlu alanlari doldurun');
      return;
    }

    if (editSureDakika === null || editSureDakika < 0) {
      toast.error('Saat araligi gecersiz');
      return;
    }

    try {
      setIsEditKaydediliyor(true);
      const response = await jobEntriesApi.updateCompleted(editIsId, {
        tarih: editTarih,
        vardiya,
        makina,
        mudahaleTuru,
        baslangicSaati: editBaslangicSaati,
        bitisSaati: editBitisSaati,
        sureDakika: editSureDakika,
        aciklama,
        malzeme
      });

      const updated = response.data?.data as CompletedJob | undefined;
      if (!updated) {
        throw new Error('Invalid response');
      }

      setIsler((prev) => prev.map((is) => (is.id === updated.id ? updated : is)));
      toast.success('Tamamlanan is guncellendi');
      forceCloseEditModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tamamlanan is guncellenemedi');
    } finally {
      setIsEditKaydediliyor(false);
    }
  };

  const openAnalizModal = (is: CompletedJob) => {
    if (!canAssignWorkOrders) {
      toast.error('Is emri atamasi sadece Berke Karayanik tarafindan yapilabilir');
      return;
    }

    if ((Number(is.sureDakika) || 0) <= MIN_DURUS_DAKIKASI) {
      toast.error(`Sadece ${MIN_DURUS_DAKIKASI} dk ustu duruslar icin is emri olusturulabilir`);
      return;
    }

    const hasBackendWorkOrder = Boolean(
      is.analizAtamasi?.backendWorkOrderId || is.analizAtamasi?.backendWorkOrderNo
    );
    if (hasBackendWorkOrder) {
      toast.error('Bu durus icin analiz is emri zaten olusturuldu');
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
      toast.error('Bu durus icin analiz is emri zaten olusturuldu');
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
    let createdWorkOrderId: number | null = null;
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
      if (!createdWorkOrder?.id && !createdWorkOrder?.isEmriNo) {
        throw new Error('Is emri olusturuldu fakat cevap verisi okunamadi');
      }
      createdWorkOrderId = createdWorkOrder?.id ?? null;

      const nowIso = new Date().toISOString();
      const localAnalizAtamasi = {
        backendWorkOrderId: createdWorkOrder?.id,
        backendWorkOrderNo: createdWorkOrder?.isEmriNo,
        atananSicilNo: secilenPersonel.sicilNo,
        atananAdSoyad: secilenPersonel.adSoyad,
        atananBolum: secilenPersonel.bolum,
        atamaTarihi: nowIso
      };
      const successText = createdWorkOrder?.isEmriNo
        ? `${secilenPersonel.adSoyad} icin ${createdWorkOrder.isEmriNo} olusturuldu`
        : `${secilenPersonel.adSoyad} icin analiz is emri olusturuldu`;
      const updateResponse = await jobEntriesApi.updateCompletedAnalysis(selectedIs.id, {
        analizAtamasi: localAnalizAtamasi
      });

      const updated = updateResponse.data?.data as CompletedJob | undefined;
      if (updated) {
        setIsler((prev) => prev.map((is) => (is.id === updated.id ? updated : is)));
      } else {
        setIsler((prev) => prev.map((is) => (
          is.id === selectedIs.id
            ? { ...is, analizAtamasi: localAnalizAtamasi }
            : is
        )));
      }

      toast.success(successText);
      closeAnalizModal();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message as string | undefined;
      if (createdWorkOrderId) {
        let rolledBack = false;
        try {
          await workOrdersApi.delete(createdWorkOrderId);
          rolledBack = true;
        } catch {
          // best effort rollback
        }
        if (rolledBack) {
          toast.error(backendMessage || 'Aktarim kaydi yazilamadigi icin is emri olusturma islemi geri alindi');
          return;
        }
        toast.error(backendMessage || 'Is emri olusturuldu ancak aktarim kaydi kalici yazilamadi');
        return;
      }
      toast.error(backendMessage || 'Is emri olusturulamadi');
    } finally {
      setIsAtamaKaydediliyor(false);
    }
  };

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

  const bolumSecenekleri = useMemo(() => Array.from(
    new Set(
      satirlar
        .map(({ personel }) => personel.bolum)
        .filter((bolum) => bolum && bolum !== '-')
    )
  ).sort((a, b) => a.localeCompare(b, 'tr-TR')), [satirlar]);

  const filteredSatirlar = useMemo(() => satirlar.filter(({ is, personel }) => {
    const searchText = normalizeForSearch(search);
    const matchSearch = !searchText
      || normalizeForSearch(is.id).includes(searchText)
      || normalizeForSearch(is.makina).includes(searchText)
      || normalizeForSearch(is.aciklama).includes(searchText)
      || normalizeForSearch(personel.adSoyad).includes(searchText)
      || normalizeForSearch(personel.sicilNo).includes(searchText)
      || normalizeForSearch(personel.bolum).includes(searchText);

    const matchTarih = !filterTarih || is.tarih === filterTarih;
    const matchBolum = !isBerkeViewer || !filterBolum || personel.bolum === filterBolum;
    const matchVardiya = !filterVardiya || is.vardiya.includes(filterVardiya);

    return matchSearch && matchTarih && matchBolum && matchVardiya;
  }), [filterBolum, filterTarih, filterVardiya, isBerkeViewer, satirlar, search]);

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
          : 'Atama bekliyor')
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
          {isBerkeViewer && (
            <select
              value={filterBolum}
              onChange={(e) => setFilterBolum(e.target.value)}
              className="input w-full md:w-64"
            >
              <option value="">Tum Bolumler</option>
              {bolumSecenekleri.map((bolum) => (
                <option key={bolum} value={bolum}>{bolum}</option>
              ))}
            </select>
          )}
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
                        is.analizAtamasi && (is.analizAtamasi.backendWorkOrderId || is.analizAtamasi.backendWorkOrderNo) ? (
                          <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                            <p className="font-semibold">Atandi</p>
                            <p>{is.analizAtamasi.atananAdSoyad}</p>
                            <p className="text-[11px]">{is.analizAtamasi.atananSicilNo}</p>
                            {is.analizAtamasi.backendWorkOrderNo && (
                              <p className="text-[11px]">Is Emri: {is.analizAtamasi.backendWorkOrderNo}</p>
                            )}
                            <p className="text-[11px] text-emerald-900/55">
                              Aktarim: {is.analizAtamasi.atananAdSoyad} / {formatDateTime(is.analizAtamasi.atamaTarihi)}
                            </p>
                          </div>
                        ) : canAssignWorkOrders ? (
                          <button
                            type="button"
                            onClick={() => openAnalizModal(is)}
                            className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Is Emrine Aktar
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Sadece Berke</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Gerekli degil</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {canManage ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(is)}
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
          Bu hesapta tamamlanan isler sadece kendi bolumune gore listelenir.
        </div>
      )}

      {isEditModalOpen && canManage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeEditModal} />
            <div className="relative w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b px-5 py-4">
                <h2 className="text-lg font-bold text-gray-900">Tamamlanan Isi Duzenle</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Kayit ID: {editIsId || '-'}
                </p>
                {selectedEditIs && (
                  <p className="mt-1 text-xs text-gray-500">
                    Personeller: {selectedEditIs.personeller.map((personel) => personel.adSoyad).join(', ') || '-'}
                  </p>
                )}
              </div>

              <div className="space-y-4 px-5 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">Tarih</label>
                    <input
                      type="date"
                      value={editTarih}
                      onChange={(event) => setEditTarih(event.target.value)}
                      className="input"
                      disabled={isEditKaydediliyor}
                    />
                  </div>
                  <div>
                    <label className="label">Vardiya</label>
                    <input
                      type="text"
                      value={editVardiya}
                      onChange={(event) => setEditVardiya(event.target.value)}
                      className="input"
                      placeholder="VARDIYA 1 (07:00-15:00)"
                      disabled={isEditKaydediliyor}
                    />
                  </div>
                  <div>
                    <label className="label">Makina</label>
                    <input
                      type="text"
                      value={editMakina}
                      onChange={(event) => setEditMakina(event.target.value)}
                      className="input"
                      disabled={isEditKaydediliyor}
                    />
                  </div>
                  <div>
                    <label className="label">Mudahale Turu</label>
                    <input
                      type="text"
                      value={editMudahaleTuru}
                      onChange={(event) => setEditMudahaleTuru(event.target.value)}
                      className="input"
                      disabled={isEditKaydediliyor}
                    />
                  </div>
                  <div>
                    <label className="label">Baslangic Saati</label>
                    <input
                      type="time"
                      value={editBaslangicSaati}
                      onChange={(event) => setEditBaslangicSaati(event.target.value)}
                      className="input"
                      disabled={isEditKaydediliyor}
                    />
                  </div>
                  <div>
                    <label className="label">Bitis Saati</label>
                    <input
                      type="time"
                      value={editBitisSaati}
                      onChange={(event) => setEditBitisSaati(event.target.value)}
                      className="input"
                      disabled={isEditKaydediliyor}
                    />
                  </div>
                  <div>
                    <label className="label">Sure (dk)</label>
                    <input
                      type="number"
                      value={editSureDakika ?? ''}
                      readOnly
                      className="input bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Aciklama</label>
                  <textarea
                    value={editAciklama}
                    onChange={(event) => setEditAciklama(event.target.value)}
                    rows={4}
                    className="input resize-none"
                    disabled={isEditKaydediliyor}
                  />
                </div>

                <div>
                  <label className="label">Malzeme</label>
                  <textarea
                    value={editMalzeme}
                    onChange={(event) => setEditMalzeme(event.target.value)}
                    rows={2}
                    className="input resize-none"
                    disabled={isEditKaydediliyor}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-5 py-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                  disabled={isEditKaydediliyor}
                >
                  Iptal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleEditKaydet()}
                  disabled={isEditKaydediliyor || editSureDakika === null}
                >
                  {isEditKaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAnalizModalOpen && selectedIs && canAssignWorkOrders && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeAnalizModal} />
            <div className="relative w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b px-5 py-4">
                <h2 className="text-lg font-bold text-gray-900">Uzayan Durus Is Emri Ac</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedIs.id} - {selectedIs.makina} ({selectedIs.sureDakika} dk)
                </p>
              </div>

              <div className="space-y-4 px-5 py-4">
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Bu kayit {MIN_DURUS_DAKIKASI} dakika ustu oldugu icin uzayan durus analizi is emri acilabilir.
                </div>

                <div>
                  <label className="label">Atanacak Kisi</label>
                  <select
                    value={atananSicilNo}
                    onChange={(event) => setAtananSicilNo(event.target.value)}
                    className="input"
                    disabled={isAtamaKaydediliyor || kullanicilarYukleniyor}
                  >
                    <option value="">Seciniz...</option>
                    {(aktifKullanicilar || []).map((user) => (
                      <option key={user.id} value={user.sicilNo}>
                        {user.ad} {user.soyad} ({user.sicilNo}) - {user.departman}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Ek Not (Opsiyonel)</label>
                  <textarea
                    value={analizNotu}
                    onChange={(event) => setAnalizNotu(event.target.value)}
                    rows={3}
                    className="input resize-none"
                    placeholder="Analiz icin ek not yazabilirsiniz..."
                    disabled={isAtamaKaydediliyor}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-5 py-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAnalizModal}
                  disabled={isAtamaKaydediliyor}
                >
                  Iptal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleAnalizAtamaKaydet()}
                  disabled={isAtamaKaydediliyor || !atananSicilNo}
                >
                  {isAtamaKaydediliyor ? 'Olusturuluyor...' : 'Is Emri Ac'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
